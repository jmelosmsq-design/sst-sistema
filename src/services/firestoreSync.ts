import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  Unsubscribe,
  serverTimestamp,
  getDocFromServer,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Company } from "../types";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  return errInfo;
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore client offline, operating in local-cache mode.");
    }
  }
}

export const STORAGE_DELETED_COMPANIES_KEY = "sst_deleted_companies_v1";

export function getDeletedCompanyIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_COMPANIES_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr.map(String));
    }
  } catch {}
  return new Set<string>();
}

export function markCompanyAsDeleted(id: string) {
  try {
    const current = getDeletedCompanyIds();
    current.add(String(id));
    localStorage.setItem(STORAGE_DELETED_COMPANIES_KEY, JSON.stringify(Array.from(current)));
  } catch {}
}

export interface FirestoreSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncError: string | null;
  totalVistoriasNuvem: number;
}

export class FirestoreSyncService {
  private static instance: FirestoreSyncService;
  private unsubscribeListener: Unsubscribe | null = null;
  private listeners: ((state: FirestoreSyncState) => void)[] = [];
  private saveDebounceTimers: Map<string, any> = new Map();
  private recentlyDeletedIds: Set<string> = new Set();

  private state: FirestoreSyncState = {
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSyncing: false,
    lastSyncedAt: null,
    syncError: null,
    totalVistoriasNuvem: 0,
  };

  private constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.updateState({ isOnline: true }));
      window.addEventListener("offline", () => this.updateState({ isOnline: false }));
    }
    testConnection().catch(() => {});
  }

  public static getInstance(): FirestoreSyncService {
    if (!FirestoreSyncService.instance) {
      FirestoreSyncService.instance = new FirestoreSyncService();
    }
    return FirestoreSyncService.instance;
  }

  public getState(): FirestoreSyncState {
    return this.state;
  }

  public subscribe(listener: (state: FirestoreSyncState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private updateState(partial: Partial<FirestoreSyncState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l(this.state));
  }

  /**
   * Cancel any pending auto-save timer for a company and prevent resurrecting
   */
  public cancelPendingSave(companyId: string): void {
    if (!companyId) return;
    const compId = String(companyId);
    const existing = this.saveDebounceTimers.get(compId);
    if (existing) {
      clearTimeout(existing);
      this.saveDebounceTimers.delete(compId);
    }
    this.recentlyDeletedIds.add(compId);
    markCompanyAsDeleted(compId);
  }

  /**
   * Starts real-time listening to user's vistorias in Firestore
   */
  public startRealtimeSync(
    userId: string,
    onRemoteChange: (remoteCompanies: Company[]) => void
  ): () => void {
    this.stopRealtimeSync();

    if (!userId) return () => {};

    try {
      this.updateState({ isSyncing: true, syncError: null });

      const vistoriasCol = collection(db, "vistorias");
      const q = query(vistoriasCol, where("userId", "==", userId));

      this.unsubscribeListener = onSnapshot(
        q,
        (snapshot) => {
          const deletedIds = getDeletedCompanyIds();
          const remoteList: Company[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Company;
            if (data && data.id) {
              const strId = String(data.id);
              if (!this.recentlyDeletedIds.has(strId) && !deletedIds.has(strId)) {
                remoteList.push(data);
              }
            }
          });

          this.updateState({
            isSyncing: false,
            lastSyncedAt: new Date(),
            totalVistoriasNuvem: remoteList.length,
            syncError: null,
          });

          onRemoteChange(remoteList);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, "vistorias");
          this.updateState({
            isSyncing: false,
            syncError: "Erro ao sincronizar em tempo real com a nuvem.",
          });
        }
      );
    } catch (err: any) {
      handleFirestoreError(err, OperationType.LIST, "vistorias");
      this.updateState({ isSyncing: false, syncError: err?.message || "Falha de conexão" });
    }

    return () => this.stopRealtimeSync();
  }

  public stopRealtimeSync() {
    if (this.unsubscribeListener) {
      this.unsubscribeListener();
      this.unsubscribeListener = null;
    }
  }

  /**
   * Fetches user vistorias once from Firestore
   */
  public async fetchUserVistorias(userId: string): Promise<Company[]> {
    if (!userId) return [];
    try {
      const deletedIds = getDeletedCompanyIds();
      const vistoriasCol = collection(db, "vistorias");
      const q = query(vistoriasCol, where("userId", "==", userId));
      const snap = await getDocs(q);
      const list: Company[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as Company;
        if (data && data.id) {
          const strId = String(data.id);
          if (!this.recentlyDeletedIds.has(strId) && !deletedIds.has(strId)) {
            list.push(data);
          }
        }
      });
      return list;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, "vistorias");
      return [];
    }
  }

  /**
   * Saves a single company / inspection to Firestore (with debouncing)
   */
  public async saveVistoria(company: Company, userId: string): Promise<void> {
    if (!company || !company.id || !userId) return;

    const compId = String(company.id);

    // Never save if company was deleted
    const deletedIds = getDeletedCompanyIds();
    if (this.recentlyDeletedIds.has(compId) || deletedIds.has(compId)) {
      return;
    }

    // Clear existing timer for this company to debounce
    const existing = this.saveDebounceTimers.get(compId);
    if (existing) clearTimeout(existing);

    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(async () => {
        // Double check deletion status at execution time
        if (this.recentlyDeletedIds.has(compId) || getDeletedCompanyIds().has(compId)) {
          resolve();
          return;
        }

        try {
          this.updateState({ isSyncing: true, syncError: null });

          const docRef = doc(db, "vistorias", compId);
          const payload: Company = {
            ...company,
            id: compId,
            userId,
            updatedAt: new Date().toISOString(),
          };

          // Remove any undefined values which Firestore disallows
          const sanitized = JSON.parse(JSON.stringify(payload));

          await setDoc(
            docRef,
            {
              ...sanitized,
              _serverTimestamp: serverTimestamp(),
            },
            { merge: true }
          );

          this.updateState({
            isSyncing: false,
            lastSyncedAt: new Date(),
            syncError: null,
          });
          resolve();
        } catch (error: any) {
          handleFirestoreError(error, OperationType.WRITE, `vistorias/${compId}`);
          this.updateState({
            isSyncing: false,
            syncError: "Falha ao enviar alterações para a nuvem.",
          });
          reject(error);
        } finally {
          this.saveDebounceTimers.delete(compId);
        }
      }, 600); // 600ms debounce

      this.saveDebounceTimers.set(compId, timer);
    });
  }

  /**
   * Deletes a vistoria from Firestore and thoroughly sweeps any orphaned duplicates
   */
  public async deleteVistoria(companyId: string, userId: string, companyRazao?: string): Promise<void> {
    if (!companyId) return;
    const compId = String(companyId);

    // Cancel pending saves and mark as deleted locally
    this.cancelPendingSave(compId);

    if (!userId) return;

    try {
      this.updateState({ isSyncing: true, syncError: null });
      const docRef = doc(db, "vistorias", compId);
      await deleteDoc(docRef);

      // Se a empresa era "Minha Empresa Modelo" ou possui razão modelo, eliminar todos os documentos órfãos residuais
      if (companyRazao === "Minha Empresa Modelo" || compId.toLowerCase().includes("modelo")) {
        try {
          const vistoriasCol = collection(db, "vistorias");
          const q = query(vistoriasCol, where("userId", "==", userId));
          const snap = await getDocs(q);
          const deletePromises: Promise<void>[] = [];
          snap.forEach((d) => {
            const data = d.data() as Company;
            if (data?.empresa?.emp_razao === "Minha Empresa Modelo" || d.id === compId) {
              deletePromises.push(deleteDoc(d.ref));
            }
          });
          await Promise.allSettled(deletePromises);
        } catch (sweepErr) {
          console.warn("Aviso ao limpar duplicatas de modelo:", sweepErr);
        }
      }

      this.updateState({ isSyncing: false, lastSyncedAt: new Date() });
    } catch (error: any) {
      handleFirestoreError(error, OperationType.DELETE, `vistorias/${compId}`);
      this.updateState({ isSyncing: false, syncError: "Falha ao excluir na nuvem." });
      throw error;
    }
  }

  /**
   * Upload all local companies to Firestore for initial migration or bulk import
   */
  public async migrateLocalToCloud(localCompanies: Company[], userId: string): Promise<void> {
    if (!userId || !localCompanies.length) return;
    const deletedIds = getDeletedCompanyIds();
    try {
      this.updateState({ isSyncing: true, syncError: null });
      for (const comp of localCompanies) {
        if (!comp || !comp.id) continue;
        const compId = String(comp.id);
        if (this.recentlyDeletedIds.has(compId) || deletedIds.has(compId)) {
          continue;
        }
        const docRef = doc(db, "vistorias", compId);
        const payload: Company = {
          ...comp,
          id: compId,
          userId,
          updatedAt: comp.updatedAt || new Date().toISOString(),
        };
        const sanitized = JSON.parse(JSON.stringify(payload));
        await setDoc(docRef, sanitized, { merge: true });
      }
      this.updateState({ isSyncing: false, lastSyncedAt: new Date() });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, "vistorias/migration");
      this.updateState({ isSyncing: false, syncError: err?.message });
    }
  }
}

export const firestoreSyncService = FirestoreSyncService.getInstance();
