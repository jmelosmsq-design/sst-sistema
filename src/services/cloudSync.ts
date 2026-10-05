import { Company } from "../types";

const LOCAL_STORAGE_KEY = "sst_coleta_empresas_v2";

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  serverVersion: number;
  syncError: string | null;
}

export class CloudSyncService {
  private static instance: CloudSyncService;
  private syncTimer: any = null;
  private listeners: ((state: SyncState) => void)[] = [];
  private state: SyncState = {
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncedAt: null,
    serverVersion: 0,
    syncError: null,
  };

  private constructor() {
    window.addEventListener("online", () => this.handleNetworkChange(true));
    window.addEventListener("offline", () => this.handleNetworkChange(false));
  }

  public static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService();
    }
    return CloudSyncService.instance;
  }

  public subscribe(listener: (state: SyncState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private updateState(partial: Partial<SyncState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l(this.state));
  }

  private handleNetworkChange(online: boolean) {
    this.updateState({ isOnline: online });
    if (online) {
      this.syncWithCloud();
    }
  }

  public getLocalData(): { currentId: string | null; companies: Company[] } {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return { currentId: null, companies: [] };
      const parsed = JSON.parse(raw);
      return {
        currentId: parsed.currentId || null,
        companies: Array.isArray(parsed.companies) ? parsed.companies : [],
      };
    } catch {
      return { currentId: null, companies: [] };
    }
  }

  public saveLocalData(data: { currentId: string | null; companies: Company[] }) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    this.scheduleCloudPush(data.companies);
  }

  private scheduleCloudPush(companies: Company[]) {
    clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.pushToCloud(companies);
    }, 1200);
  }

  public async pullFromCloud(): Promise<{ companies: Company[]; version: number } | null> {
    if (!navigator.onLine) return null;
    try {
      this.updateState({ isSyncing: true, syncError: null });
      const res = await fetch("/api/sync/get");
      if (!res.ok) throw new Error("Falha ao comunicar com o servidor em nuvem");
      const json = await res.json();
      if (json.success && json.data) {
        this.updateState({
          isSyncing: false,
          lastSyncedAt: new Date(),
          serverVersion: json.data.version || 0,
        });
        return {
          companies: json.data.companies || [],
          version: json.data.version || 0,
        };
      }
      this.updateState({ isSyncing: false });
      return null;
    } catch (err: any) {
      this.updateState({ isSyncing: false, syncError: err?.message || "Erro de sincronização" });
      return null;
    }
  }

  public async pushToCloud(companies: Company[]): Promise<boolean> {
    if (!navigator.onLine) {
      this.updateState({ isOnline: false });
      return false;
    }
    try {
      this.updateState({ isSyncing: true, syncError: null });
      const res = await fetch("/api/sync/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companies, clientVersion: this.state.serverVersion }),
      });
      if (!res.ok) throw new Error("Erro no servidor ao salvar dados na nuvem");
      const json = await res.json();
      if (json.success) {
        this.updateState({
          isSyncing: false,
          lastSyncedAt: new Date(),
          serverVersion: json.version || this.state.serverVersion + 1,
        });
        return true;
      }
      this.updateState({ isSyncing: false, syncError: json.error || "Falha na sincronização" });
      return false;
    } catch (err: any) {
      this.updateState({ isSyncing: false, syncError: err?.message || "Erro ao salvar na nuvem" });
      return false;
    }
  }

  public async syncWithCloud(): Promise<Company[] | null> {
    const local = this.getLocalData();
    const remote = await this.pullFromCloud();
    if (!remote) return null;

    // Merge strategy: if local is empty and cloud has data, load cloud
    if ((!local.companies || local.companies.length === 0) && remote.companies.length > 0) {
      this.saveLocalData({ currentId: remote.companies[0]?.id || null, companies: remote.companies });
      return remote.companies;
    }

    // If local has data and cloud is empty, push local to cloud
    if (local.companies.length > 0 && (!remote.companies || remote.companies.length === 0)) {
      await this.pushToCloud(local.companies);
      return local.companies;
    }

    // Smart merge: combine by company ID
    const mergedMap = new Map<string, Company>();
    remote.companies.forEach((c) => mergedMap.set(c.id, c));
    local.companies.forEach((c) => mergedMap.set(c.id, c)); // local takes precedence for recent edits

    const merged = Array.from(mergedMap.values());
    this.saveLocalData({ currentId: local.currentId || merged[0]?.id || null, companies: merged });
    await this.pushToCloud(merged);
    return merged;
  }
}

export const cloudSyncService = CloudSyncService.getInstance();

