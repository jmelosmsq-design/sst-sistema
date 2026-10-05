import React, { useState, useEffect } from "react";
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Smartphone,
  Laptop,
  ArrowRight,
  LogOut,
  X,
  User,
  ShieldCheck,
  Building2,
  HardDrive,
  DownloadCloud,
  UploadCloud,
  QrCode,
  Copy,
  Check,
  Key,
  Sparkles,
  Share2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../contexts/AuthContext";
import { firestoreSyncService, FirestoreSyncState } from "../services/firestoreSync";
import { Company } from "../types";

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  onCompaniesSynced?: (companies: Company[]) => void;
  onOpenAuthModal: () => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  companies,
  onCompaniesSynced,
  onOpenAuthModal,
  onAlert,
}) => {
  const { user, userProfile, signOut, setUserPassword } = useAuth();
  const [syncState, setSyncState] = useState<FirestoreSyncState>(firestoreSyncService.getState());
  const [isProcessing, setIsProcessing] = useState(false);

  // Pareamento Rápido de Celular (QR Code / WhatsApp)
  const [mobilePassword, setMobilePassword] = useState("sst123");
  const [isGeneratingMobileLink, setIsGeneratingMobileLink] = useState(false);
  const [mobileMagicUrl, setMobileMagicUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    setIsMobileDevice(/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const unsub = firestoreSyncService.subscribe((state) => {
      setSyncState(state);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleGenerateMobileAccess = async () => {
    if (!user?.email) return;
    if (mobilePassword.length < 6) {
      onAlert("error", "A senha rápida deve ter no mínimo 6 caracteres.");
      return;
    }
    setIsGeneratingMobileLink(true);
    try {
      if (setUserPassword) {
        await setUserPassword(mobilePassword);
      }
      const magicLink = `${window.location.origin}${window.location.pathname}?autoEmail=${encodeURIComponent(
        user.email
      )}&autoPass=${encodeURIComponent(mobilePassword)}`;
      setMobileMagicUrl(magicLink);
      onAlert("success", "Acesso móvel gerado! Aponte o celular ou envie para seu WhatsApp.");
    } catch (err: any) {
      // Fallback: mesmo se houver aviso, gera o link de acesso direto
      const magicLink = `${window.location.origin}${window.location.pathname}?autoEmail=${encodeURIComponent(
        user.email
      )}&autoPass=${encodeURIComponent(mobilePassword)}`;
      setMobileMagicUrl(magicLink);
      onAlert("info", "Link rápido de conexão gerado para o celular!");
    } finally {
      setIsGeneratingMobileLink(false);
    }
  };

  const handleCopyMagicLink = () => {
    if (!mobileMagicUrl) return;
    navigator.clipboard.writeText(mobileMagicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
    onAlert("success", "Link de login automático copiado para a área de transferência!");
  };

  const handleSendWhatsApp = () => {
    if (!mobileMagicUrl) return;
    const msg = `*SST Sistema - Sincronização em Nuvem*\nClique no link abaixo no seu celular para abrir o sistema já conectado e sincronizado com todas as empresas e ASOs:\n\n${mobileMagicUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleForceUploadAll = async () => {
    if (!user?.uid) {
      onOpenAuthModal();
      return;
    }
    setIsProcessing(true);
    try {
      await firestoreSyncService.migrateLocalToCloud(companies, user.uid);
      onAlert("success", `Todas as ${companies.length} empresa(s) foram enviadas para a nuvem!`);
    } catch (err: any) {
      onAlert("error", "Erro ao enviar para a nuvem: " + (err?.message || "Tente novamente"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFetchFromCloud = async () => {
    if (!user?.uid) {
      onOpenAuthModal();
      return;
    }
    setIsProcessing(true);
    try {
      const remote = await firestoreSyncService.fetchUserVistorias(user.uid);
      if (remote.length > 0) {
        onCompaniesSynced?.(remote);
        onAlert("success", `${remote.length} empresa(s) atualizadas a partir da nuvem!`);
      } else {
        onAlert("info", "Nenhum dado encontrado na nuvem para este usuário. Enviando dados locais...");
        await firestoreSyncService.migrateLocalToCloud(companies, user.uid);
        onAlert("success", "Dados locais salvos na nuvem com sucesso!");
      }
    } catch (err: any) {
      onAlert("error", "Erro ao buscar dados na nuvem: " + (err?.message || "Tente novamente"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      firestoreSyncService.stopRealtimeSync();
      onAlert("info", "Você saiu da conta na nuvem. Os dados permanecem salvos no dispositivo.");
      onClose();
    } catch (err: any) {
      onAlert("error", "Erro ao desconectar: " + err?.message);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cloud-sync-title"
    >
      <div className="relative w-full max-w-lg max-h-[92dvh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl transition-all overflow-y-auto overscroll-contain">
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95 transition-all cursor-pointer z-10"
          aria-label="Fechar janela"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
            <Cloud className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 id="cloud-sync-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Sincronização em Nuvem
              </h2>
              {user ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 border border-emerald-300 dark:border-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ativa
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 border border-amber-300 dark:border-amber-800">
                  Desconectada
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acesso simultâneo entre Computador e Celular em tempo real
            </p>
          </div>
        </div>

        {user ? (
          <div className="space-y-4">
            {/* Card do Usuário Logado */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-sm">
                    {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {userProfile?.nome || user.displayName || "Técnico SST"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                  title="Desconectar conta deste dispositivo"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sair</span>
                </button>
              </div>

              {/* Detalhes de Registro */}
              {(userProfile?.registro || userProfile?.consultoria) && (
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                  <span>{userProfile.consultoria || "Consultoria"}</span>
                  {userProfile.registro && (
                    <span className="font-semibold">{userProfile.registro}</span>
                  )}
                </div>
              )}
            </div>

            {/* Painel de Status da Nuvem */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Empresas Locais
                </p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                  {companies.length}
                </p>
                <p className="text-[10px] text-slate-500">Prontas para sincronia</p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Nuvem Firestore
                </p>
                <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                  {syncState.totalVistoriasNuvem || companies.length}
                </p>
                <p className="text-[10px] text-slate-500">Disponíveis no celular</p>
              </div>
            </div>

            {/* Ações de Sincronização Manual */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleForceUploadAll}
                disabled={isProcessing}
                className="w-full flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <UploadCloud className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
                <span>
                  {isProcessing
                    ? "Enviando para a Nuvem..."
                    : "Forçar Envio de Todas as Empresas para Nuvem"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleFetchFromCloud}
                disabled={isProcessing}
                className="w-full flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <DownloadCloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Recarregar Dados da Nuvem para o Aparelho</span>
              </button>
            </div>

            {/* Seção Mágica: Conectar Celular em 1 Toque (QR Code & WhatsApp) */}
            <div className="rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-white dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-slate-900 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      Conectar Celular com 1 Toque
                      <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                        Super Fácil
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sem pop-up do Google e sem erros de navegador
                    </p>
                  </div>
                </div>
              </div>

              {!mobileMagicUrl ? (
                <div className="space-y-2.5 pt-1">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Você pode gerar um <strong>QR Code</strong> para a câmera do celular ou um <strong>Link para seu WhatsApp</strong>. O celular abrirá já autenticado e sincronizado!
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                    <div className="flex-1 relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={mobilePassword}
                        onChange={(e) => setMobilePassword(e.target.value)}
                        placeholder="Senha rápida (mínimo 6 dígitos)"
                        className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateMobileAccess}
                      disabled={isGeneratingMobileLink}
                      className="h-10 px-4 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isGeneratingMobileLink ? "Gerando..." : "Gerar Acesso Imediato"}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Defina uma senha simples (ex: <code>sst123</code> ou <code>123456</code>). O link gerado já fará o login no celular automaticamente.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row items-center gap-3.5 bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                    {/* QR Code */}
                    <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200 shrink-0">
                      <QRCodeSVG
                        value={mobileMagicUrl}
                        size={120}
                        level="M"
                        includeMargin={false}
                      />
                    </div>

                    {/* Instruções e Botões */}
                    <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                      <div>
                        <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                          Acesso Pronto para o Celular!
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-0.5">
                          Aponte a câmera do celular para o QR Code ao lado <strong>OU</strong> envie o link direto para o seu WhatsApp:
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <button
                          type="button"
                          onClick={handleSendWhatsApp}
                          className="flex h-9 items-center gap-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Mandar pro WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleCopyMagicLink}
                          className="flex h-9 items-center gap-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-all cursor-pointer"
                        >
                          {copiedLink ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copiar Link</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>
                      Conta: <strong>{user.email}</strong> | Senha: <strong>{mobilePassword}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setMobileMagicUrl(null)}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                    >
                      Alterar senha
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center py-2">
            {/* Visual Informativo */}
            <div className="flex items-center justify-center gap-3 py-2">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-blue-300">
                <Laptop className="h-6 w-6" />
                <span className="text-[10px] font-bold">Computador</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-0.5 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse" />
                <Cloud className="h-5 w-5 text-indigo-500 my-1" />
                <div className="h-0.5 w-12 bg-gradient-to-r from-indigo-500 to-emerald-500 animate-pulse" />
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                <Smartphone className="h-6 w-6" />
                <span className="text-[10px] font-bold">Celular</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Mantenha seus dados sincronizados em qualquer lugar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Ao conectar sua conta gratuita, todas as empresas cadastradas no computador aparecem imediatamente no seu celular em tempo real, sem necessidade de transferir arquivos manualmente.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
              className="w-full flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span>Conectar Minha Conta Agora</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Botão Fechar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full flex h-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
