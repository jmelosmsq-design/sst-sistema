import React, { useEffect, useState, useRef } from "react";
import {
  ShieldCheck,
  Cloud,
  CloudOff,
  RefreshCw,
  Plus,
  Trash2,
  Download,
  Moon,
  Sun,
  Menu,
  X,
  CheckCircle2,
  Building2,
  ChevronDown,
  HardDrive,
  User,
  Globe,
  ExternalLink,
  Printer,
  FileText,
  Stethoscope,
  Smartphone,
  Laptop,
  Heart,
  Copy,
} from "lucide-react";
import { Company } from "../types";
import { googleDriveBackup, DriveBackupState } from "../services/googleDriveBackup";
import { useAuth } from "../contexts/AuthContext";
import { firestoreSyncService, FirestoreSyncState } from "../services/firestoreSync";
import { GoogleDrivePromptModal } from "./GoogleDrivePromptModal";
import { GoogleDriveManagerModal } from "./GoogleDriveManagerModal";
import { ConfirmModal } from "./ConfirmModal";

interface HeaderProps {
  companies: Company[];
  currentCompanyId: string | null;
  onSelectCompany: (id: string) => void;
  onCreateCompany: () => void;
  onOpenDuplicateCompany?: () => void;
  onDeleteCompany: (id: string) => void;
  onRestoreCompanies: (companies: Company[]) => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenDocumentHub?: () => void;
  onOpenCloudSync?: () => void;
  onOpenAuthModal?: () => void;
  onSelectTab?: (tab: any) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  companies,
  currentCompanyId,
  onSelectCompany,
  onCreateCompany,
  onOpenDuplicateCompany,
  onDeleteCompany,
  onRestoreCompanies,
  darkMode = false,
  onToggleDarkMode,
  onOpenDocumentHub,
  onOpenCloudSync,
  onOpenAuthModal,
  onSelectTab,
  onAlert,
}) => {
  const { user, userProfile } = useAuth();
  const [cloudState, setCloudState] = useState<FirestoreSyncState>(firestoreSyncService.getState());
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // Google Drive states
  const [driveState, setDriveState] = useState<DriveBackupState>(googleDriveBackup.getState());
  const [promptDriveModalOpen, setPromptDriveModalOpen] = useState(false);
  const [managerDriveModalOpen, setManagerDriveModalOpen] = useState(false);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to Cloud Firestore sync state
  useEffect(() => {
    const unsub = firestoreSyncService.subscribe((state) => {
      setCloudState(state);
    });
    return unsub;
  }, []);

  // Subscribe to Google Drive state
  useEffect(() => {
    const unsub = googleDriveBackup.subscribe((state) => {
      setDriveState(state);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setIsMenuOpen(false);
    }
  };

  const currentCompany = companies.find((c) => c.id === currentCompanyId);
  const companyTitle =
    currentCompany?.empresa?.emp_razao ||
    currentCompany?.empresa?.emp_fantasia ||
    (currentCompany?.empresa?.emp_cnpj ? `CNPJ: ${currentCompany.empresa.emp_cnpj}` : "Nova Empresa");

  const driveUser = googleDriveBackup.getCurrentUser();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 px-3.5 sm:px-4 pt-2.5 pb-2.5 shadow-xs backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-2xl mx-auto">
        {/* Barra Superior */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo e Nome */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Ícone Oficial do Sistema em Todos os Dispositivos (Lupa Verde Neon com V) */}
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 p-0.5 border border-emerald-500/30 shadow-xs overflow-hidden">
              <img
                src="/icon.svg"
                alt="SST Sistema - Gerenciamento de Riscos"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  SST Sistema
                </h1>
                {driveState.isConnected ? (
                  <span className="hidden xs:inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Google Drive</span>
                  </span>
                ) : (
                  <span className="hidden xs:inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                    Local (SQLite)
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 truncate" title="Gerenciamento de Riscos">
                Gerenciamento de Riscos
              </p>
            </div>
          </div>

          {/* Menu Hambúrguer Principal, Nuvem e Atalho Central de Laudos */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Botão Sincronização em Nuvem (Celular + PC) */}
            <button
              type="button"
              onClick={onOpenCloudSync || onOpenAuthModal}
              className={`flex h-9 items-center justify-center gap-1.5 rounded-xl px-2.5 sm:px-3 text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer border ${
                user
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-transparent"
              }`}
              title={
                user
                  ? `Nuvem Conectada (${user.email}) - Sincronizado em tempo real`
                  : "Conectar Nuvem - Sincronizar dados com o Celular"
              }
            >
              <Cloud
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                  cloudState.isSyncing ? "animate-spin text-blue-300" : user ? "text-emerald-600 dark:text-emerald-400" : "text-white"
                }`}
              />
              <span className="hidden sm:inline">
                {user ? "Nuvem Ativa" : "Nuvem"}
              </span>
              {user && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            {onOpenDocumentHub && (
              <button
                type="button"
                onClick={onOpenDocumentHub}
                className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-2.5 sm:px-3 text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Emitir LTCAT, Ordem de Serviço, Ficha de EPI e Laudos"
              >
                <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Emitir Laudos</span>
              </button>
            )}

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className={`flex h-9 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-all cursor-pointer ${
                  isMenuOpen
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-slate-900 text-white border-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:border-slate-700"
                } active:scale-95`}
                aria-label="Menu principal de opções"
                title="Menu"
              >
                {isMenuOpen ? (
                  <>
                    <X className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">Fechar</span>
                  </>
                ) : (
                  <>
                    <Menu className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">Menu</span>
                  </>
                )}
              </button>

              {/* Menu Dropdown Desdobrável */}
              {isMenuOpen && (
                <div className="absolute right-0 top-11 z-50 w-72 sm:w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100">
                  {/* Card de Nuvem Firestore (Celular & PC) */}
                  <div className="mb-3 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/60 dark:from-slate-800/80 dark:to-slate-800/40 p-3 border border-blue-200/80 dark:border-slate-700/80">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-2xs shrink-0">
                          <Cloud className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            Nuvem (Celular &amp; PC)
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {user ? user.email : "Sincronização em tempo real"}
                          </p>
                        </div>
                      </div>
                      {user ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 border border-emerald-300 dark:border-emerald-800 shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Conectado
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 border border-amber-300 dark:border-amber-800 shrink-0">
                          Pendente
                        </span>
                      )}
                    </div>

                    {user ? (
                      <div className="pt-2 border-t border-blue-100 dark:border-slate-700 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenCloudSync?.();
                          }}
                          className="flex-1 flex h-8 items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-[11px] font-bold text-white active:scale-95 transition-all cursor-pointer shadow-2xs"
                        >
                          <RefreshCw className={`h-3 w-3 ${cloudState.isSyncing ? "animate-spin" : ""}`} />
                          <span>Status da Nuvem</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                          Conecte sua conta para que as empresas cadastradas no PC apareçam no celular automaticamente.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            if (onOpenCloudSync) onOpenCloudSync();
                            else if (onOpenAuthModal) onOpenAuthModal();
                          }}
                          className="w-full flex h-8 items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                          <User className="h-3.5 w-3.5" />
                          <span>Conectar Nuvem Agora</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Módulo PCMSO e Central de Documentos no Menu */}
                  <div className="space-y-1.5 mb-3">
                    {onSelectTab && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onSelectTab("srq20");
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold">Saúde Mental & SRQ-20 (Link Trabalhador)</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">NR-01</span>
                      </button>
                    )}
                    {onSelectTab && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onSelectTab("pcmso");
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/80 text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold">Módulo PCMSO & Gestão ASOs</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-600 text-white">NR-07</span>
                      </button>
                    )}
                    {onOpenDocumentHub && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenDocumentHub();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <Printer className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold">Central de Emissão de Laudos</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white">LTCAT/OS/EPI</span>
                      </button>
                    )}
                  </div>
                  {/* Card de Conexão Google Drive */}
                  <div className="mb-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800">
                    {driveState.isConnected ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-2xs">
                            <Cloud className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              Google Drive Conectado
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {driveUser?.email}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setIsMenuOpen(false);
                              setManagerDriveModalOpen(true);
                            }}
                            className="flex-1 flex h-8 items-center justify-center gap-1.5 rounded-lg bg-blue-600 text-[11px] font-bold text-white hover:bg-blue-700 active:scale-95 transition-all cursor-pointer shadow-2xs"
                          >
                            <Cloud className="h-3.5 w-3.5" />
                            <span>Gerenciar Backup</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-2 py-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Backup no Google Drive
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Conecte sua conta do Google para backup automático e seguro de fotos e vistorias.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setPromptDriveModalOpen(true);
                          }}
                          className="w-full flex h-9 items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
                        >
                          <Cloud className="h-4 w-4" />
                          <span>Conectar Google Drive</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Opções do Menu */}
                  <div className="space-y-1">
                    {/* Botão Fazer Backup Agora */}
                    {driveState.isConnected && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          googleDriveBackup
                            .performBackupToDrive(companies)
                            .then(() => onAlert("success", "Backup salvo com sucesso no Google Drive!"))
                            .catch((err) => onAlert("error", err?.message || "Erro no backup"));
                        }}
                        disabled={driveState.isBackingUp}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <RefreshCw className={`h-4 w-4 text-blue-600 dark:text-blue-400 ${driveState.isBackingUp ? "animate-spin" : ""}`} />
                          <span>Salvar no Google Drive Agora</span>
                        </div>
                      </button>
                    )}

                    {/* Alternar Modo Escuro / Claro */}
                    {onToggleDarkMode && (
                      <button
                        type="button"
                        onClick={() => {
                          onToggleDarkMode();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {darkMode ? (
                            <Sun className="h-4 w-4 text-amber-400" />
                          ) : (
                            <Moon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                          )}
                          <span>Tema do Aplicativo</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {darkMode ? "Escuro" : "Claro"}
                        </span>
                      </button>
                    )}

                    {/* Instalar Aplicativo (PWA) */}
                    {deferredPrompt && !isInstalled && (
                      <button
                        type="button"
                        onClick={handleInstallPWA}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        <span>Instalar Aplicativo no Celular</span>
                      </button>
                    )}

                    {/* Cadastrar Nova Empresa */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onCreateCompany();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Building2 className="h-4 w-4 text-slate-500" />
                      <span>Nova Vistoria / Empresa</span>
                    </button>

                    {/* Duplicar Empresa Atual */}
                    {currentCompanyId && onOpenDuplicateCompany && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenDuplicateCompany();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                      >
                        <Copy className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Duplicar Empresa Atual (Clonar Dados)</span>
                      </button>
                    )}

                    {/* Link para o Desenvolvedor salva.biz */}
                    <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800">
                      <a
                        id="menu-developer-link"
                        href="https://salva.biz"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                          <span>Desenvolvedor: <strong className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">salva.biz</strong></span>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seletor de Empresa */}
        <div className="mt-2 flex items-center gap-1.5">
          <select
            id="header-company-select"
            aria-label="Selecionar empresa em edição"
            value={currentCompanyId || ""}
            onChange={(e) => {
              if (e.target.value === "new") {
                onCreateCompany();
              } else if (e.target.value === "duplicate") {
                if (onOpenDuplicateCompany) onOpenDuplicateCompany();
              } else {
                onSelectCompany(e.target.value);
              }
            }}
            className="h-10 flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
          >
            {companies.map((c) => {
              const name =
                c.empresa?.emp_razao ||
                c.empresa?.emp_fantasia ||
                (c.empresa?.emp_cnpj ? `CNPJ: ${c.empresa.emp_cnpj}` : "Empresa sem nome");
              return (
                <option key={c.id} value={c.id}>
                  🏢 {name}
                </option>
              );
            })}
            <option value="new">+ Cadastrar Nova Empresa</option>
            {currentCompanyId && onOpenDuplicateCompany && (
              <option value="duplicate">📋 Duplicar Esta Empresa...</option>
            )}
          </select>

          <button
            type="button"
            onClick={onCreateCompany}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-2xs shrink-0 cursor-pointer"
            title="Adicionar nova empresa em branco"
          >
            <Plus className="h-4 w-4" />
          </button>

          {currentCompanyId && onOpenDuplicateCompany && (
            <button
              type="button"
              onClick={onOpenDuplicateCompany}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 active:scale-95 transition-all shadow-2xs shrink-0 cursor-pointer"
              title={`Duplicar "${companyTitle}" (clonar todos os setores, funções, riscos e configurações)`}
            >
              <Copy className="h-4 w-4" />
            </button>
          )}

          {currentCompanyId && (
            <button
              type="button"
              onClick={() => setCompanyToDelete({ id: currentCompanyId, name: companyTitle })}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-200 dark:hover:border-red-900 active:scale-95 transition-all shrink-0 cursor-pointer"
              title={`Excluir ${companyTitle}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Modal de Conexão com Google Drive */}
      <GoogleDrivePromptModal
        isOpen={promptDriveModalOpen}
        onClose={() => setPromptDriveModalOpen(false)}
        onSuccess={(email) => {
          googleDriveBackup.performBackupToDrive(companies).catch(console.error);
        }}
        onAlert={onAlert}
      />

      {/* Modal Gerenciador do Google Drive */}
      <GoogleDriveManagerModal
        isOpen={managerDriveModalOpen}
        onClose={() => setManagerDriveModalOpen(false)}
        companies={companies}
        onRestoreCompanies={onRestoreCompanies}
        onAlert={onAlert}
      />

      {/* Modal de Confirmação de Exclusão de Empresa */}
      <ConfirmModal
        isOpen={Boolean(companyToDelete)}
        title="Excluir Empresa"
        message={
          companies.length <= 1
            ? `Deseja realmente excluir a empresa "${companyToDelete?.name}"? Todos os setores, funções e dados vinculados serão removidos e uma nova empresa limpa será iniciada.`
            : `Deseja realmente excluir a empresa "${companyToDelete?.name}"? Todos os setores, funções e dados vinculados serão excluídos permanentemente.`
        }
        confirmLabel="Sim, Excluir Empresa"
        onConfirm={() => {
          if (companyToDelete) {
            onDeleteCompany(companyToDelete.id);
            setCompanyToDelete(null);
          }
        }}
        onCancel={() => setCompanyToDelete(null)}
      />
    </header>
  );
};
