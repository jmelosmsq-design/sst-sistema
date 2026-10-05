import React, { useEffect } from "react";
import {
  User,
  LogOut,
  X,
  Cloud,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { FirestoreSyncState } from "../services/firestoreSync";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: FirestoreSyncState;
  onManualSync: () => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  syncState,
  onManualSync,
  onAlert,
}) => {
  const { user, signOut } = useAuth();

  // Listen to Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      onAlert("info", "Você saiu da sua conta. Os dados salvos continuam guardados com segurança na nuvem.");
      onClose();
    } catch (err: any) {
      console.error(err);
      onAlert("error", err?.message || "Erro ao sair da conta.");
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl transition-all">
        {/* Botão Fechar no Topo */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95 transition-all cursor-pointer"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Cabeçalho do Usuário */}
        <div className="flex items-center gap-3 mb-4 pr-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-md">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {user.displayName || "Usuário Conectado"}
              </h3>
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
          </div>
        </div>

        {/* Status da Sincronização em Nuvem (Firestore) */}
        <div className="mb-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-2xs">
              <Cloud className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate flex items-center gap-1">
                <span>Firestore Conectado</span>
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate">
                {syncState.totalVistoriasNuvem} vistoria(s) sincronizada(s)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onManualSync}
            disabled={syncState.isSyncing}
            className="flex h-8 items-center gap-1 shrink-0 rounded-lg bg-white dark:bg-slate-800 px-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs hover:bg-emerald-50 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            title="Sincronizar dados agora"
          >
            <RefreshCw className={`h-3 w-3 ${syncState.isSyncing ? "animate-spin" : ""}`} />
            <span>{syncState.isSyncing ? "..." : "Sincronizar"}</span>
          </button>
        </div>

        {/* Informação sobre os dados do técnico */}
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
          💡 Os dados do técnico e da consultoria responsável são definidos diretamente na aba <strong>"Empresa"</strong> e impressos automaticamente nos relatórios técnicos.
        </p>

        {/* Botão de Sair da Conta (Logoff) em destaque e 100% visível */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair da Conta (Fazer Logoff)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-full items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
