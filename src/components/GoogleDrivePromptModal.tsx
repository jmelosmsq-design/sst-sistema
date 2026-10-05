import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HardDrive,
  ExternalLink,
  Lock,
  X,
  Sparkles,
} from "lucide-react";
import { googleDriveBackup } from "../services/googleDriveBackup";

interface GoogleDrivePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

export const GoogleDrivePromptModal: React.FC<GoogleDrivePromptModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onAlert,
}) => {
  const [loading, setLoading] = useState(false);

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

  const handleConnect = async () => {
    setLoading(true);
    try {
      const user = await googleDriveBackup.connectGoogleDrive();
      onAlert("success", `Google Drive conectado com sucesso para ${user.email}! Backup automático ativado.`);
      onSuccess(user.email || "");
      onClose();
    } catch (err: any) {
      console.error(err);
      onAlert("error", err?.message || "Não foi possível conectar com o Google Drive. Verifique a janela pop-up.");
    } finally {
      setLoading(false);
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
        {/* Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95 transition-all cursor-pointer"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs">
              <Cloud className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Backup no Google Drive
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Segurança total para suas vistorias e fotos
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Sincronização Contínua:</strong> Todas as alterações, laudos e fotos são salvos em um único arquivo leve no seu Google Drive.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Sem Limite de Fotos:</strong> As fotos são arquivadas no banco local do dispositivo e salvas no seu Google Drive sem custos extras.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Restauração Rápida:</strong> Se trocar de aparelho ou formatar o celular, restaure todo o histórico com 1 clique.
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleConnect}
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Cloud className="h-4 w-4" />
              )}
              <span>{loading ? "Conectando ao Google..." : "Conectar minha conta Google"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-10 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              Lembrar mais tarde (continuar no modo local)
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
