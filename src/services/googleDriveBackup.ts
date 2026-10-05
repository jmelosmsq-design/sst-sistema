import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser,
  signOut as fbSignOut,
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import { Company } from "../types";
import { localDB } from "./localDB";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const driveAuth = getAuth(app);

export const driveProvider = new GoogleAuthProvider();
driveProvider.addScope("https://www.googleapis.com/auth/drive.file");
driveProvider.addScope("https://www.googleapis.com/auth/drive.appdata");
driveProvider.setCustomParameters({ prompt: "select_account" });

export interface DriveUser {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  uid: string;
}

export interface DriveBackupState {
  isConnected: boolean;
  isBackingUp: boolean;
  lastBackupAt: Date | null;
  lastBackupFileName: string | null;
  folderName: string;
  folderId: string | null;
  folderUrl: string | null;
  fileId: string | null;
  fileUrl: string | null;
  error: string | null;
  autoBackupEnabled: boolean;
  totalVistorias: number;
}

const BACKUP_FOLDER_NAME = "SST Vistoria - Backups";
const BACKUP_FILE_NAME = "backup_sst_vistoria_auto.json";
const META_DRIVE_FOLDER_ID = "google_drive_backup_folder_id";
const META_DRIVE_FILE_ID = "google_drive_backup_file_id";
const STORAGE_ACCESS_TOKEN_KEY = "sst_gdrive_access_token";
const STORAGE_USER_PROFILE_KEY = "sst_gdrive_user_profile";

class GoogleDriveBackupService {
  private static instance: GoogleDriveBackupService;
  private cachedAccessToken: string | null = null;
  private currentUser: DriveUser | null = null;
  private debounceTimer: any = null;
  private listeners: ((state: DriveBackupState) => void)[] = [];
  private tokenClient: any = null;

  private state: DriveBackupState = {
    isConnected: false,
    isBackingUp: false,
    lastBackupAt: null,
    lastBackupFileName: null,
    folderName: BACKUP_FOLDER_NAME,
    folderId: null,
    folderUrl: null,
    fileId: null,
    fileUrl: null,
    error: null,
    autoBackupEnabled: true,
    totalVistorias: 0,
  };

  private constructor() {
    // 1. Load cached token & user from localStorage
    try {
      const savedToken = localStorage.getItem(STORAGE_ACCESS_TOKEN_KEY);
      const savedUserStr = localStorage.getItem(STORAGE_USER_PROFILE_KEY);
      if (savedToken) {
        this.cachedAccessToken = savedToken;
      }
      if (savedUserStr) {
        this.currentUser = JSON.parse(savedUserStr);
      }
      if (this.cachedAccessToken && this.currentUser) {
        this.state.isConnected = true;
      }
    } catch {}

    // 2. Listen to Firebase auth if available (for sync)
    onAuthStateChanged(driveAuth, (user: FirebaseUser | null) => {
      if (user) {
        this.currentUser = {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          uid: user.uid,
        };
        try {
          localStorage.setItem(STORAGE_USER_PROFILE_KEY, JSON.stringify(this.currentUser));
        } catch {}
        if (this.cachedAccessToken) {
          this.updateState({ isConnected: true });
        }
      }
    });

    // 3. Load persisted last backup metadata from localDB
    Promise.all([
      localDB.getMeta<string>("last_drive_backup_time"),
      localDB.getMeta<string>(META_DRIVE_FOLDER_ID),
      localDB.getMeta<string>(META_DRIVE_FILE_ID),
    ]).then(([time, folderId, fileId]) => {
      this.updateState({
        lastBackupAt: time ? new Date(time) : null,
        folderId: folderId || null,
        folderUrl: folderId ? `https://drive.google.com/drive/folders/${folderId}` : null,
        fileId: fileId || null,
        fileUrl: fileId ? `https://drive.google.com/file/d/${fileId}/view` : null,
      });
    });
  }

  public static getInstance(): GoogleDriveBackupService {
    if (!GoogleDriveBackupService.instance) {
      GoogleDriveBackupService.instance = new GoogleDriveBackupService();
    }
    return GoogleDriveBackupService.instance;
  }

  public subscribe(listener: (state: DriveBackupState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private updateState(partial: Partial<DriveBackupState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l(this.state));
  }

  public getState(): DriveBackupState {
    return this.state;
  }

  public getCurrentUser(): DriveUser | null {
    return this.currentUser;
  }

  public getAccessToken(): string | null {
    return this.cachedAccessToken;
  }

  /**
   * Helper to load Google Identity Services script if not yet ready
   */
  private async ensureGoogleIdentityClient(): Promise<boolean> {
    if ((window as any).google?.accounts?.oauth2) {
      return true;
    }

    return new Promise((resolve) => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(!!(window as any).google?.accounts?.oauth2);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      } else {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if ((window as any).google?.accounts?.oauth2) {
            clearInterval(interval);
            resolve(true);
          } else if (attempts > 20) {
            clearInterval(interval);
            resolve(false);
          }
        }, 100);
      }
    });
  }

  /**
   * Connect to Google Drive using Google Identity Services (GIS) Token Client.
   * This is fully immune to mobile browser storage partitioning / sessionStorage issues (e.g. Opera Mobile, Safari iOS).
   */
  public async connectGoogleDrive(): Promise<DriveUser> {
    this.updateState({ isBackingUp: true, error: null });

    const gisReady = await this.ensureGoogleIdentityClient();

    if (gisReady && (window as any).google?.accounts?.oauth2) {
      return new Promise<DriveUser>((resolve, reject) => {
        try {
          const client = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: (firebaseConfig as any).oAuthClientId || "",
            scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata email profile openid",
            callback: async (tokenResponse: any) => {
              if (tokenResponse.error) {
                console.error("GIS Token Error:", tokenResponse);
                this.updateState({
                  isBackingUp: false,
                  isConnected: false,
                  error: tokenResponse.error_description || "Autorização cancelada ou recusada.",
                });
                reject(new Error(tokenResponse.error_description || "Falha na autorização do Google Drive."));
                return;
              }

              if (tokenResponse.access_token) {
                const token = tokenResponse.access_token;
                this.cachedAccessToken = token;
                try {
                  localStorage.setItem(STORAGE_ACCESS_TOKEN_KEY, token);
                } catch {}

                // Fetch user info with Google UserInfo API
                let userProfile: DriveUser = {
                  email: "salvasstrabalho@gmail.com",
                  displayName: "Usuário SST",
                  photoURL: null,
                  uid: "gdrive_" + Date.now(),
                };

                try {
                  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (userRes.ok) {
                    const userData = await userRes.json();
                    userProfile = {
                      email: userData.email || null,
                      displayName: userData.name || userData.email || null,
                      photoURL: userData.picture || null,
                      uid: userData.sub || "gdrive_" + Date.now(),
                    };
                  }
                } catch (e) {
                  console.warn("Não foi possível buscar perfil do usuário:", e);
                }

                this.currentUser = userProfile;
                try {
                  localStorage.setItem(STORAGE_USER_PROFILE_KEY, JSON.stringify(userProfile));
                } catch {}

                this.updateState({
                  isConnected: true,
                  isBackingUp: false,
                  error: null,
                });

                resolve(userProfile);
              } else {
                this.updateState({ isBackingUp: false });
                reject(new Error("Nenhum token retornado pelo Google."));
              }
            },
            error_callback: (err: any) => {
              console.error("GIS error callback:", err);
              this.updateState({
                isBackingUp: false,
                isConnected: false,
                error: "Erro ao abrir autenticação do Google.",
              });
              reject(err);
            },
          });

          // Request OAuth access token directly
          client.requestAccessToken({ prompt: "consent" });
        } catch (err: any) {
          console.error("Erro ao inicializar GIS token client:", err);
          this.fallbackFirebaseSignIn().then(resolve).catch(reject);
        }
      });
    } else {
      return this.fallbackFirebaseSignIn();
    }
  }

  /**
   * Fallback using Firebase Popup if GIS is unavailable
   */
  private async fallbackFirebaseSignIn(): Promise<DriveUser> {
    try {
      const result = await signInWithPopup(driveAuth, driveProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (credential?.accessToken) {
        this.cachedAccessToken = credential.accessToken;
        try {
          localStorage.setItem(STORAGE_ACCESS_TOKEN_KEY, credential.accessToken);
        } catch {}
      }

      const driveUser: DriveUser = {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        uid: result.user.uid,
      };

      this.currentUser = driveUser;
      try {
        localStorage.setItem(STORAGE_USER_PROFILE_KEY, JSON.stringify(driveUser));
      } catch {}

      this.updateState({
        isConnected: true,
        isBackingUp: false,
        error: null,
      });

      return driveUser;
    } catch (err: any) {
      console.error("Erro no fallback Firebase:", err);
      const msg = err?.message || "Erro ao conectar conta Google.";
      this.updateState({
        isConnected: false,
        isBackingUp: false,
        error: msg,
      });
      throw new Error(msg);
    }
  }

  /**
   * Disconnect Google Drive
   */
  public async disconnectGoogleDrive(): Promise<void> {
    try {
      await fbSignOut(driveAuth).catch(() => {});
      this.cachedAccessToken = null;
      this.currentUser = null;
      try {
        localStorage.removeItem(STORAGE_ACCESS_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_PROFILE_KEY);
      } catch {}
      this.updateState({
        isConnected: false,
        folderId: null,
        folderUrl: null,
        fileId: null,
        fileUrl: null,
        error: null,
      });
    } catch (err: any) {
      console.error("Erro ao desconectar:", err);
    }
  }

  /**
   * Auto-trigger backup when company data changes (debounced by 2.5s)
   */
  public triggerAutoBackup(companies: Company[]) {
    if (!this.state.autoBackupEnabled || !this.cachedAccessToken) {
      return;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.performBackupToDrive(companies).catch((err) => {
        console.warn("Auto-backup Google Drive falhou:", err);
      });
    }, 2500);
  }

  /**
   * Helper to ensure valid access token
   */
  private async getValidToken(): Promise<string> {
    if (this.cachedAccessToken) {
      return this.cachedAccessToken;
    }
    const user = await this.connectGoogleDrive();
    if (this.cachedAccessToken) {
      return this.cachedAccessToken;
    }
    throw new Error("Conecte sua conta do Google Drive primeiro para realizar o backup.");
  }

  /**
   * Finds or automatically creates the dedicated backup folder "SST Vistoria - Backups" in Google Drive
   */
  private async getOrCreateBackupFolder(): Promise<string> {
    const token = await this.getValidToken();
    let folderId = await localDB.getMeta<string>(META_DRIVE_FOLDER_ID);

    // Verify if cached folder exists and is active in Drive
    if (folderId) {
      try {
        const checkRes = await fetch(
          `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,trashed`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (checkRes.ok) {
          const folderData = await checkRes.json();
          if (!folderData.trashed) {
            this.updateState({
              folderId,
              folderUrl: `https://drive.google.com/drive/folders/${folderId}`,
            });
            return folderId;
          }
        }
      } catch {
        // Continue to search or recreate
      }
      folderId = null;
    }

    // Search for existing folder by name in Drive
    try {
      const query = encodeURIComponent(
        `mimeType = 'application/vnd.google-apps.folder' and name = '${BACKUP_FOLDER_NAME}' and trashed = false`
      );
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)&spaces=drive`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (searchRes.ok) {
        const data = await searchRes.json();
        if (data.files && data.files.length > 0) {
          folderId = data.files[0].id;
          await localDB.setMeta(META_DRIVE_FOLDER_ID, folderId);
          this.updateState({
            folderId,
            folderUrl: `https://drive.google.com/drive/folders/${folderId}`,
          });
          return folderId!;
        }
      }
    } catch (e) {
      console.warn("Erro ao buscar pasta:", e);
    }

    // If folder doesn't exist, create it in Google Drive root
    const folderMetadata = {
      name: BACKUP_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
      description: "Pasta do aplicativo SST Vistoria para backups contínuos de laudos, fotos e vistorias.",
    };

    const createRes = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(folderMetadata),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.warn("Não foi possível criar pasta específica no Drive, usando raiz:", errText);
      return "";
    }

    const newFolderData = await createRes.json();
    folderId = newFolderData.id;
    await localDB.setMeta(META_DRIVE_FOLDER_ID, folderId);
    this.updateState({
      folderId,
      folderUrl: `https://drive.google.com/drive/folders/${folderId}`,
    });
    return folderId!;
  }

  /**
   * Performs real multipart upload / update of JSON backup directly inside "SST Vistoria - Backups" folder
   */
  public async performBackupToDrive(companies: Company[]): Promise<{ success: boolean; fileId: string }> {
    const token = await this.getValidToken();

    this.updateState({ isBackingUp: true, error: null });

    try {
      // 1. Ensure folder exists in Drive
      const folderId = await this.getOrCreateBackupFolder();

      const backupPayload = {
        app: "SST Vistoria",
        version: "3.0-drive-sqlite",
        format: "json",
        exportedAt: new Date().toISOString(),
        userEmail: this.currentUser?.email || "",
        totalCompanies: companies.length,
        folder: BACKUP_FOLDER_NAME,
        companies,
      };

      const fileContent = JSON.stringify(backupPayload, null, 2);

      // 2. Check if backup file already exists in folder
      let existingFileId: string | null = null;
      let queryStr = `name = '${BACKUP_FILE_NAME}' and trashed = false`;
      if (folderId) {
        queryStr = `'${folderId}' in parents and name = '${BACKUP_FILE_NAME}' and trashed = false`;
      }

      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(queryStr)}&fields=files(id,name,parents)`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.files && searchData.files.length > 0) {
          existingFileId = searchData.files[0].id;
        }
      }

      let finalFileId = "";

      if (existingFileId) {
        // 3a. Update existing file content directly
        const updateRes = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: fileContent,
          }
        );

        if (!updateRes.ok) {
          const errText = await updateRes.text();
          throw new Error(`Erro ao atualizar arquivo no Drive: ${errText}`);
        }

        const updateData = await updateRes.json();
        finalFileId = updateData.id || existingFileId;
      } else {
        // 3b. Create new file with multipart upload directly inside the folder
        const boundary = "-------314159265358979323846";
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelimiter = `\r\n--${boundary}--`;

        const metadata: any = {
          name: BACKUP_FILE_NAME,
          mimeType: "application/json",
          description: "Backup completo do SST Vistoria contendo empresas, setores, funções, riscos e fotos.",
        };

        if (folderId) {
          metadata.parents = [folderId];
        }

        const multipartBody =
          delimiter +
          "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
          JSON.stringify(metadata) +
          delimiter +
          "Content-Type: application/json\r\n\r\n" +
          fileContent +
          closeDelimiter;

        const uploadRes = await fetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": `multipart/related; boundary=${boundary}`,
            },
            body: multipartBody,
          }
        );

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error(`Erro ao enviar arquivo para o Google Drive: ${errText}`);
        }

        const createData = await uploadRes.json();
        finalFileId = createData.id;
      }

      await localDB.setMeta(META_DRIVE_FILE_ID, finalFileId);
      const now = new Date();
      await localDB.setMeta("last_drive_backup_time", now.toISOString());

      this.updateState({
        isBackingUp: false,
        lastBackupAt: now,
        lastBackupFileName: BACKUP_FILE_NAME,
        fileId: finalFileId,
        fileUrl: `https://drive.google.com/file/d/${finalFileId}/view`,
        totalVistorias: companies.length,
        error: null,
      });

      return { success: true, fileId: finalFileId };
    } catch (err: any) {
      console.error("Erro no backup do Google Drive:", err);
      this.updateState({
        isBackingUp: false,
        error: err?.message || "Erro ao salvar backup no Google Drive.",
      });
      throw err;
    }
  }

  /**
   * Restore/Import latest backup directly from Google Drive
   */
  public async restoreFromDrive(): Promise<Company[] | null> {
    const token = await this.getValidToken();

    this.updateState({ isBackingUp: true, error: null });

    try {
      let fileId = await localDB.getMeta<string>(META_DRIVE_FILE_ID);

      if (!fileId) {
        const folderId = await localDB.getMeta<string>(META_DRIVE_FOLDER_ID);
        let queryStr = `name = '${BACKUP_FILE_NAME}' and trashed = false`;
        if (folderId) {
          queryStr = `'${folderId}' in parents and name = '${BACKUP_FILE_NAME}' and trashed = false`;
        }

        const searchRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(queryStr)}&fields=files(id,name)`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.files && searchData.files.length > 0) {
            fileId = searchData.files[0].id;
          }
        }
      }

      if (!fileId) {
        this.updateState({ isBackingUp: false });
        return null;
      }

      const getRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!getRes.ok) {
        throw new Error("Não foi possível baixar o arquivo de backup do Google Drive.");
      }

      const backupData = await getRes.json();
      this.updateState({ isBackingUp: false, error: null });

      if (Array.isArray(backupData.companies)) {
        return backupData.companies;
      } else if (Array.isArray(backupData)) {
        return backupData;
      }
      return null;
    } catch (err: any) {
      console.error("Erro ao restaurar do Drive:", err);
      this.updateState({
        isBackingUp: false,
        error: err?.message || "Erro ao baixar backup do Google Drive.",
      });
      throw err;
    }
  }
}

export const googleDriveBackup = GoogleDriveBackupService.getInstance();
