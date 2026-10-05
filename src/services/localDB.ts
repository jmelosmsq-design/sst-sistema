import { Company } from "../types";

const DB_NAME = "sst_vistoria_local_db";
const DB_VERSION = 1;
const STORE_COMPANIES = "companies";
const STORE_META = "meta";

/**
 * High-performance local IndexedDB wrapper (acting as our resilient local relational store)
 * capable of holding hundreds of high-resolution inspection photos, companies, risks and chemicals
 * without any 1MB document limitations or browser memory bottlenecks.
 */
class LocalDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        return reject(new Error("IndexedDB não suportado neste navegador."));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_COMPANIES)) {
          const store = db.createObjectStore(STORE_COMPANIES, { keyPath: "id" });
          store.createIndex("updatedAt", "updatedAt", { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META, { keyPath: "key" });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Loads all companies from local database
   */
  async getAllCompanies(): Promise<Company[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_COMPANIES, "readonly");
        const store = tx.objectStore(STORE_COMPANIES);
        const req = store.getAll();
        req.onsuccess = () => {
          resolve(req.result || []);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn("Fallback ao ler IndexedDB:", err);
      // Fallback to localStorage if any issue occurs
      try {
        const local = localStorage.getItem("sst_coleta_empresas_v2");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
      return [];
    }
  }

  /**
   * Saves or updates a single company in local database
   */
  async saveCompany(company: Company): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_COMPANIES, "readwrite");
        const store = tx.objectStore(STORE_COMPANIES);
        const req = store.put(company);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error("Erro ao salvar empresa no IndexedDB:", err);
    }
  }

  /**
   * Saves an entire batch of companies into local database
   */
  async saveAllCompanies(companies: Company[]): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_COMPANIES, "readwrite");
        const store = tx.objectStore(STORE_COMPANIES);
        store.clear();
        for (const c of companies) {
          store.put(c);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.error("Erro ao salvar lote de empresas:", err);
    }
  }

  /**
   * Deletes a company by ID
   */
  async deleteCompany(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_COMPANIES, "readwrite");
        const store = tx.objectStore(STORE_COMPANIES);
        store.delete(String(id));
        const numId = Number(id);
        if (!isNaN(numId)) {
          store.delete(numId);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.error("Erro ao excluir empresa no IndexedDB:", err);
    }
  }

  /**
   * Store metadata (e.g., Google Drive backup file ID or settings)
   */
  async setMeta(key: string, value: any): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_META, "readwrite");
        const store = tx.objectStore(STORE_META);
        const req = store.put({ key, value });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error("Erro ao gravar meta:", err);
    }
  }

  async getMeta<T = any>(key: string): Promise<T | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_META, "readonly");
        const store = tx.objectStore(STORE_META);
        const req = store.get(key);
        req.onsuccess = () => {
          resolve(req.result ? req.result.value : null);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      return null;
    }
  }
}

export const localDB = new LocalDBService();
