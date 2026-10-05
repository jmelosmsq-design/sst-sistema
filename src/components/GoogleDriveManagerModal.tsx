import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  X,
  HardDrive,
  Download,
  Upload,
  ShieldCheck,
  ExternalLink,
  Folder,
  FileJson,
} from "lucide-react";
import { googleDriveBackup, DriveBackupState } from "../services/googleDriveBackup";
import { Company } from "../types";

interface GoogleDriveManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  onRestoreCompanies: (companies: Company[]) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

export const GoogleDriveManagerModal: React.FC<GoogleDriveManagerModalProps> = ({
  isOpen,
  onClose,
  companies,
  onRestoreCompanies,
  onAlert,
}) => {
  const [driveState, setDriveState] = useState<DriveBackupState>(googleDriveBackup.getState());
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = googleDriveBackup.subscribe((state) => {
      setDriveState(state);
    });
    return unsub;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const user = googleDriveBackup.getCurrentUser();

  const handleManualBackup = async () => {
    try {
      await googleDriveBackup.performBackupToDrive(companies);
      onAlert("success", "Backup salvo com sucesso na pasta 'SST Vistoria - Backups' do seu Google Drive!");
    } catch (err: any) {
      onAlert("error", err?.message || "Falha ao realizar backup no Google Drive.");
    }
  };

  const handleRestore = async () => {
    const confirm = window.confirm(
      "Deseja restaurar as vistorias do seu Google Drive? Os dados do Drive substituirão as vistorias no dispositivo."
    );
    if (!confirm) return;

    setIsRestoring(true);
    try {
      const restored = await googleDriveBackup.restoreFromDrive();
      if (restored && restored.length > 0) {
        onRestoreCompanies(restored);
        onAlert("success", `${restored.length} vistoria(s) restauradas com sucesso do Google Drive!`);
        onClose();
      } else {
        onAlert("info", "Nenhum arquivo de backup encontrado no Google Drive.");
      }
    } catch (err: any) {
      onAlert("error", err?.message || "Falha ao restaurar do Google Drive.");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await googleDriveBackup.disconnectGoogleDrive();
      onAlert("info", "Conta do Google Drive desconectada.");
      onClose();
    } catch (err: any) {
      onAlert("error", err?.message || "Erro ao desconectar.");
    }
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md my-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl transition-all">
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95 transition-all cursor-pointer"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-4 pr-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
            <Cloud className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                Backup no Google Drive
              </h3>
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.email || "Conta conectada"}
            </p>
          </div>
        </div>

        {/* Status do Backup */}
        <div className="mb-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Status da Conta:</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Conectado</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Último Backup:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {driveState.lastBackupAt ? driveState.lastBackupAt.toLocaleString() : "Pendente (Clique em Fazer Backup)"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Pasta no Drive:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-blue-600 dark:text-blue-400 truncate max-w-[170px]">
                📁 SST Vistoria - Backups
              </span>
              {driveState.folderUrl && (
                <a
                  href={driveState.folderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-0.5"
                  title="Abrir pasta no Google Drive"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Arquivo de Backup:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[170px]">
                backup_sst_vistoria_auto.json
              </span>
              {driveState.fileUrl && (
                <a
                  href={driveState.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 p-0.5"
                  title="Ver arquivo no Google Drive"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Links diretos para o Google Drive */}
        {driveState.folderUrl && (
          <div className="mb-4">
            <a
              href={driveState.folderUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/30 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100/70 transition-colors"
            >
              <Folder className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Abrir Pasta "SST Vistoria - Backups" no Drive</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
          </div>
        )}

        {/* Ações */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleManualBackup}
            disabled={driveState.isBackingUp}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${driveState.isBackingUp ? "animate-spin" : ""}`} />
            <span>{driveState.isBackingUp ? "Salvando no Google Drive..." : "Fazer Backup Agora (Salvar no Drive)"}</span>
          </button>

          <button
            type="button"
            onClick={handleRestore}
            disabled={isRestoring || driveState.isBackingUp}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className={`h-4 w-4 ${isRestoring ? "animate-spin" : ""}`} />
            <span>{isRestoring ? "Baixando do Drive..." : "Restaurar Vistorias do Drive"}</span>
          </button>

          <button
            type="button"
            onClick={handleDisconnect}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Desconectar Google Drive</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
