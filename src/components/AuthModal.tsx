import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Building2,
  Award,
  X,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Smartphone,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup" | "reset";
  onSuccess?: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
  onSuccess,
}) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useAuth();

  const [mode, setMode] = useState<"login" | "signup" | "reset">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [registro, setRegistro] = useState("");
  const [consultoria, setConsultoria] = useState("");
  const [cargo, setCargo] = useState("Técnico de Segurança do Trabalho");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }
  }, []);

  // Listen to Escape key to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "login") {
        if (!email || !password) throw new Error("Preencha o e-mail e a senha.");
        await signInWithEmail(email, password);
        onSuccess?.("Login realizado com sucesso! Seus dados foram sincronizados.");
        onClose();
      } else if (mode === "signup") {
        if (!email || !password || !nome) throw new Error("Preencha nome, e-mail e senha.");
        if (password.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres.");
        await signUpWithEmail(email, password, nome, registro, consultoria, cargo);
        onSuccess?.("Conta criada com sucesso! Vistorias sincronizadas em nuvem.");
        onClose();
      } else if (mode === "reset") {
        if (!email) throw new Error("Digite seu e-mail para receber as instruções.");
        await resetPassword(email);
        setSuccessMsg("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      }
    } catch (err: any) {
      setError(err?.message || "Ocorreu um erro ao processar sua solicitação.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess?.("Login com Google realizado com sucesso!");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Erro ao autenticar com o Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, "_blank");
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md max-h-[92dvh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl transition-all overflow-y-auto overscroll-contain">
        {/* Botão Fechar no Topo */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95 transition-all cursor-pointer z-10"
          aria-label="Fechar janela de login"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Cabeçalho */}
        <div className="text-center mb-5">
          <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 p-1 border border-emerald-500/30 shadow-md overflow-hidden">
            <img
              src="/icon.svg"
              alt="SST Sistema - Gerenciamento de Riscos"
              className="h-full w-full object-contain"
            />
          </div>
          <h2 id="auth-modal-title" className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
            {mode === "login" && "Conectar Conta SST"}
            {mode === "signup" && "Criar Conta de Técnico"}
            {mode === "reset" && "Recuperar sua Senha"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            {mode === "login" && "Acesse para sincronizar vistorias no banco Firestore em tempo real."}
            {mode === "signup" && "Cadastre-se para armazenar e sincronizar todas as suas inspeções."}
            {mode === "reset" && "Enviaremos um link seguro para redefinir sua senha."}
          </p>
        </div>

        {/* Dica da Maneira Mais Fácil: WhatsApp / QR Code gerado no PC */}
        <div className="mb-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-indigo-950/30 p-2.5 border border-emerald-500/30 text-xs">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-snug text-slate-700 dark:text-slate-200">
              <strong className="text-emerald-700 dark:text-emerald-400">Dica Ultra-Fácil:</strong> No computador, abra a janela <strong>Nuvem</strong> e use o botão <strong>"Conectar Celular com 1 Toque"</strong> para enviar um link direto para seu WhatsApp ou escanear o QR Code sem digitar nada!
            </div>
          </div>
        </div>

        {/* Abas de Modo (Login / Cadastro / Definir Senha Celular) */}
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setSuccessMsg(null);
            }}
            className={`h-9 rounded-lg text-xs font-bold transition-all cursor-pointer truncate px-1 ${
              mode === "login"
                ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Fazer Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
              setSuccessMsg(null);
            }}
            className={`h-9 rounded-lg text-xs font-bold transition-all cursor-pointer truncate px-1 ${
              mode === "signup"
                ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Cadastrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("reset");
              setError(null);
              setSuccessMsg(null);
            }}
            className={`h-9 rounded-lg text-xs font-bold transition-all cursor-pointer truncate px-1 ${
              mode === "reset"
                ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
            title="Defina uma senha para sua conta Google para conectar no celular"
          >
            Definir Senha
          </button>
        </div>

        {/* Card explicativo especial para modo reset (Definir Senha Móvel) */}
        {mode === "reset" && (
          <div className="mb-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 p-3 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200">
            <p className="font-bold flex items-center gap-1.5 mb-1 text-blue-800 dark:text-blue-300">
              <Smartphone className="h-4 w-4" />
              Acesso Móvel Garantido
            </p>
            <p className="text-[11px] leading-relaxed">
              Se você se conectou com a <strong>Conta Google no PC</strong>, digite seu e-mail abaixo e clique em <strong>Enviar Link</strong>. O Google enviará um link para cadastrar uma senha. Com ela, você conecta no celular sem bloqueios de pop-up!
            </p>
          </div>
        )}

        {/* Botão Google Login Destacado no Topo */}
        {mode !== "reset" && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-98 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Conectar com Conta Google</span>
            </button>

            {/* Dica para celular / iframe */}
            {isInIframe && (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 px-3 py-2 text-[11px] text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                <span className="flex items-center gap-1.5 min-w-0 truncate">
                  <Smartphone className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                  <span>No celular, você também pode abrir em nova aba:</span>
                </span>
                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="inline-flex items-center gap-1 font-bold text-blue-800 dark:text-blue-200 underline hover:no-underline shrink-0"
                >
                  <span>Abrir</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Divisor */}
            <div className="relative my-3.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400">
                  Ou acesse com e-mail e senha
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mensagens de Alerta com Ações Rápidas */}
        {error && (
          <div className="mb-4 flex flex-col gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3.5 text-xs text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold leading-relaxed">{error}</p>
              </div>
            </div>

            {/* Botões de Ação Imediata para Resolver o Problema */}
            {(error.includes("celular") || error.includes("Google") || error.includes("pop-up") || error.includes("particionad") || error.includes("cookies")) && (
              <div className="mt-1 pt-2 border-t border-amber-200/80 dark:border-amber-800/60 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                >
                  Entrar com E-mail e Senha
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset");
                    setError(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                >
                  Definir Senha do Google
                </button>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulário Principal */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Nome Completo do Técnico *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: João Carlos de Melo"
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Registro MTE / CREA
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={registro}
                      onChange={(e) => setRegistro(e.target.value)}
                      placeholder="MTE / CREA"
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Consultoria SST
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={consultoria}
                      onChange={(e) => setConsultoria(e.target.value)}
                      placeholder="Empresa / Consultoria"
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Cargo / Especialidade
                </label>
                <select
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Técnico de Segurança do Trabalho">Técnico de Segurança do Trabalho</option>
                  <option value="Engenheiro de Segurança do Trabalho">Engenheiro de Segurança do Trabalho</option>
                  <option value="Médico do Trabalho">Médico do Trabalho</option>
                  <option value="Higienista Ocupacional">Higienista Ocupacional</option>
                  <option value="Consultor / Auditor SST">Consultor / Auditor SST</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              E-mail *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {mode !== "reset" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Senha *
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("reset");
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Conectando ao Firestore...
              </span>
            ) : (
              <>
                <span>
                  {mode === "login" && "Entrar e Sincronizar"}
                  {mode === "signup" && "Criar Conta & Sincronizar"}
                  {mode === "reset" && "Enviar Link para Definir / Redefinir Senha"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Rodapé / Alternar Modos e Botão Fechar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
          {mode === "login" && (
            <p>
              Não tem uma conta?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Cadastre-se gratuitamente
              </button>
            </p>
          )}

          {mode === "signup" && (
            <p>
              Já possui uma conta?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Faça login
              </button>
            </p>
          )}

          {mode === "reset" && (
            <p>
              Lembrou sua senha?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Voltar ao login
              </button>
            </p>
          )}

          {/* Botão de Fechar Explícito no Rodapé */}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-full items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            Continuar sem conectar (Offline)
          </button>
        </div>
      </div>
    </div>
  );
};

