import React, { useState, useEffect } from "react";
import {
  Heart,
  Shield,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  Building2,
  User,
  Info,
  PhoneCall,
  Home,
} from "lucide-react";
import { SRQ20_PERGUNTAS, SRQ20_PONTO_DE_CORTE, calcularClassificacaoSrq20 } from "../data/srq20Catalog";
import { Srq20AvaliacaoItem, Company } from "../types";
import { gerarPdfSrq20Individual } from "../services/srq20PdfGenerator";

interface Srq20WorkerViewProps {
  companyId: string;
  initialSetor?: string;
  onSubmitted?: (avaliacao: Srq20AvaliacaoItem) => void;
}

export const Srq20WorkerView: React.FC<Srq20WorkerViewProps> = ({
  companyId,
  initialSetor = "",
  onSubmitted,
}) => {
  // Step: "intro" | "questions" | "result"
  const [step, setStep] = useState<"intro" | "questions" | "result">("intro");

  // Worker information
  const [isAnonimo, setIsAnonimo] = useState<boolean>(true);
  const [nome, setNome] = useState<string>("");
  const [setor, setSetor] = useState<string>(initialSetor);
  const [funcao, setFuncao] = useState<string>("");
  const [idade, setIdade] = useState<string>("");
  const [sexo, setSexo] = useState<"Masculino" | "Feminino" | "Outro" | "">("");

  // Company info fetched from server
  const [companyData, setCompanyData] = useState<Partial<Company> | null>(null);
  const [availableSetores, setAvailableSetores] = useState<string[]>([]);

  // Questionnaire responses: question id -> boolean
  const [respostas, setRespostas] = useState<Record<number, boolean>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // Result state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [completedAvaliacao, setCompletedAvaliacao] = useState<Srq20AvaliacaoItem | null>(null);

  // Fetch company public info
  useEffect(() => {
    if (!companyId) return;

    fetch(`/api/srq20/public-info?companyId=${encodeURIComponent(companyId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.company) {
          setCompanyData(data.company);
          if (data.company.setores && Array.isArray(data.company.setores)) {
            const list = data.company.setores.map((s: any) => s.setor_nome).filter(Boolean);
            setAvailableSetores(list);
            if (!setor && list.length > 0) {
              setSetor(list[0]);
            }
          }
        }
      })
      .catch((err) => {
        console.warn("Could not fetch company public info:", err);
      });
  }, [companyId]);

  const currentQ = SRQ20_PERGUNTAS[currentQuestionIndex];
  const totalQuestions = SRQ20_PERGUNTAS.length;
  const answeredCount = Object.keys(respostas).length;
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectAnswer = (isSim: boolean) => {
    setRespostas((prev) => ({
      ...prev,
      [currentQ.id]: isSim,
    }));

    // Auto advance after slight feedback
    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 150);
    }
  };

  const handleFinish = async () => {
    setSubmitting(true);

    const score = Object.values(respostas).filter((v) => v === true).length;
    const classificacao = calcularClassificacaoSrq20(score);

    const avaliacao: Srq20AvaliacaoItem = {
      id: `srq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      empresaId: companyId,
      empresaNome: companyData?.empresa?.emp_razao || companyData?.empresa?.emp_fantasia || "Empresa",
      setorNome: setor || "Geral",
      funcaoNome: funcao || "GHE Padrão",
      avaliadoNome: isAnonimo ? "Colaborador Anônimo" : nome.trim() || "Colaborador",
      avaliadoIdade: idade || "",
      avaliadoSexo: sexo,
      anonimo: isAnonimo,
      respostas,
      pontuacao: score,
      classificacao,
      data: new Date().toISOString().split("T")[0],
      origem: "link_trabalhador",
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Submit to server endpoint
      await fetch("/api/srq20/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          evaluation: avaliacao,
        }),
      });

      // 2. Also save to local storage backup
      const savedKey = `sst_srq20_${companyId}`;
      const existing = JSON.parse(localStorage.getItem(savedKey) || "[]");
      existing.push(avaliacao);
      localStorage.setItem(savedKey, JSON.stringify(existing));

      if (onSubmitted) {
        onSubmitted(avaliacao);
      }
    } catch (err) {
      console.warn("Error submitting online, saved locally:", err);
    } finally {
      setSubmitting(false);
      setCompletedAvaliacao(avaliacao);
      setStep("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDownloadPdf = () => {
    if (!completedAvaliacao) return;
    const fakeCompany: Company = {
      id: companyId,
      empresa: companyData?.empresa || {},
      setores: [],
      funcoes: [],
      riscos: {},
    };
    gerarPdfSrq20Individual(fakeCompany, completedAvaliacao);
  };

  const empresaNome =
    companyData?.empresa?.emp_fantasia || companyData?.empresa?.emp_razao || "Empresa Avaliada";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-950 p-0.5 border border-emerald-500/30 overflow-hidden shadow-xs flex items-center justify-center">
              <img src="/icon.svg" alt="SST Sistema" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {empresaNome}
              </h1>
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                Pesquisa de Saúde Mental • SRQ-20
              </p>
            </div>
          </div>
          <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            NR-1 & NR-17
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-3.5 py-5 flex flex-col justify-start">
        {/* ========================================================= */}
        {/* STEP 1: INTRODUÇÃO & DADOS INICIAIS                       */}
        {/* ========================================================= */}
        {step === "intro" && (
          <div className="space-y-4">
            {/* Informative Card */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Heart className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Avaliação de Bem-Estar e Saúde Mental
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Instrumento SRQ-20 (OMS) para identificação precoce de sobrecarga e suporte às melhorias ergonômicas no trabalho.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Garantia de Sigilo e Respeito:
                </p>
                <p className="leading-relaxed">
                  Você pode responder de forma <strong>totalmente anônima</strong>. Os resultados são tratados em conjunto para melhorias coletivas no setor.
                </p>
                <p className="font-medium text-[11px] text-emerald-800 dark:text-emerald-300">
                  📋 Responda pensando em como você se sentiu nos <strong>últimos 30 dias</strong>.
                </p>
              </div>
            </div>

            {/* Identification & Sector Form */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                1. Suas Informações (Opção de Sigilo)
              </h3>

              {/* Anônimo vs Identificado - Full width toggle */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsAnonimo(true)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isAnonimo
                      ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Participar de Forma Anônima (Recomendado)</span>
                  </div>
                  {isAnonimo && <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsAnonimo(false)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    !isAnonimo
                      ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <User className="h-4 w-4 text-slate-500" />
                    <span>Identificar Meu Nome</span>
                  </div>
                  {!isAnonimo && <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                </button>
              </div>

              {!isAnonimo && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Seu Nome Completo:
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Digite seu nome"
                    className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Setor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Seu Setor ou Área de Trabalho:
                </label>
                {availableSetores.length > 0 ? (
                  <select
                    value={setor}
                    onChange={(e) => setSetor(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {availableSetores.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    <option value="Outro">Outro setor não listado</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={setor}
                    onChange={(e) => setSetor(e.target.value)}
                    placeholder="Ex: Administrativo, Operacional, Logística..."
                    className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                )}
              </div>

              {/* Função / Cargo (Opcional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Seu Cargo / Função (Opcional):
                </label>
                <input
                  type="text"
                  value={funcao}
                  onChange={(e) => setFuncao(e.target.value)}
                  placeholder="Ex: Operador, Auxiliar, Analista..."
                  className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Idade e Sexo (Opcionais) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Idade:
                  </label>
                  <input
                    type="number"
                    value={idade}
                    onChange={(e) => setIdade(e.target.value)}
                    placeholder="Ex: 32"
                    className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sexo:
                  </label>
                  <select
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value as any)}
                    className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Não informar</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* START BUTTON - ALL FULL WIDTH AS PER USER REQUEST */}
            <button
              type="button"
              onClick={() => {
                setStep("questions");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all shadow-lg active:scale-98 cursor-pointer"
            >
              <span>Iniciar Questionário (20 Perguntas Rápidas)</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: RESPONDENDO AS 20 PERGUNTAS (ONE-BY-ONE OU LISTA) */}
        {/* ========================================================= */}
        {step === "questions" && currentQ && (
          <div className="space-y-4">
            {/* Progress Header */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                <span>Progresso da Avaliação</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {answeredCount} de {totalQuestions} ({progressPct}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Current Question Card */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
              {/* Question metadata badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Pergunta {currentQ.id} de 20
                </span>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  {currentQ.dominio}
                </span>
              </div>

              {/* Question Text */}
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {currentQ.texto}
              </p>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                * Pense nos seus últimos 30 dias de rotina e trabalho.
              </p>

              {/* ALL FULL WIDTH TOUCH BUTTONS FOR YES / NO AS REQUESTED */}
              <div className="space-y-3 pt-2">
                {/* SIM BUTTON - FULL WIDTH */}
                <button
                  type="button"
                  onClick={() => handleSelectAnswer(true)}
                  className={`w-full flex items-center justify-between px-5 h-14 sm:h-12 rounded-2xl border-2 text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-98 ${
                    respostas[currentQ.id] === true
                      ? "bg-red-500 text-white border-red-600 shadow-md ring-2 ring-red-500/30"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                  }`}
                >
                  <span className="text-base">SIM</span>
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center border ${
                      respostas[currentQ.id] === true
                        ? "bg-white text-red-600 border-white"
                        : "border-slate-300 dark:border-slate-600 text-transparent"
                    }`}
                  >
                    ✓
                  </div>
                </button>

                {/* NÃO BUTTON - FULL WIDTH */}
                <button
                  type="button"
                  onClick={() => handleSelectAnswer(false)}
                  className={`w-full flex items-center justify-between px-5 h-14 sm:h-12 rounded-2xl border-2 text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-98 ${
                    respostas[currentQ.id] === false
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/30"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                  }`}
                >
                  <span className="text-base">NÃO</span>
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center border ${
                      respostas[currentQ.id] === false
                        ? "bg-white text-emerald-600 border-white"
                        : "border-slate-300 dark:border-slate-600 text-transparent"
                    }`}
                  >
                    ✓
                  </div>
                </button>
              </div>
            </div>

            {/* Navigation & Submit Controls - ALL FULL WIDTH AS PER USER REQUEST */}
            <div className="space-y-2.5 pt-2">
              {/* Botão Concluir se todas respondidas */}
              {answeredCount === totalQuestions && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleFinish}
                  className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all shadow-xl active:scale-98 cursor-pointer animate-pulse"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{submitting ? "Enviando Respostas..." : "Concluir e Enviar Avaliação"}</span>
                </button>
              )}

              {/* Navegação Anterior / Próxima (Full Width Buttons) */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  className="w-full flex items-center justify-center gap-1.5 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Pergunta Anterior</span>
                </button>

                {currentQuestionIndex < totalQuestions - 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                    className="w-full flex items-center justify-center gap-1.5 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    <span>Próxima Pergunta</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Botão para revisar todas as 20 perguntas em grade */}
              <div className="pt-2">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 text-center">
                  Ir direto para a pergunta:
                </p>
                <div className="grid grid-cols-10 gap-1.5">
                  {SRQ20_PERGUNTAS.map((p, idx) => {
                    const isAnswered = respostas[p.id] !== undefined;
                    const isCurrent = idx === currentQuestionIndex;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-emerald-600 text-white ring-2 ring-emerald-500/40 scale-105"
                            : isAnswered
                            ? respostas[p.id]
                              ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        {p.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: RESULTADO & ACOLHIMENTO                           */}
        {/* ========================================================= */}
        {step === "result" && completedAvaliacao && (
          <div className="space-y-4">
            {/* Success message banner */}
            <div className="p-4 rounded-2xl bg-emerald-500 text-white text-center shadow-lg space-y-1">
              <CheckCircle2 className="h-10 w-10 mx-auto" />
              <h2 className="text-lg font-extrabold">Avaliação Enviada com Sucesso!</h2>
              <p className="text-xs text-emerald-100">
                Obrigado por participar. Seus dados já foram registrados com segurança na nuvem.
              </p>
            </div>

            {/* Result Interpretation Card */}
            <div
              className={`rounded-2xl p-5 border-2 shadow-md space-y-3 ${
                completedAvaliacao.classificacao === "Atenção Necessária"
                  ? "bg-red-50/70 dark:bg-red-950/40 border-red-300 dark:border-red-800"
                  : "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Classificação SRQ-20
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    completedAvaliacao.classificacao === "Atenção Necessária"
                      ? "bg-red-600 text-white"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {completedAvaliacao.classificacao}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                  {completedAvaliacao.pontuacao}
                </span>
                <span className="text-sm font-semibold text-slate-500">de 20 pontos</span>
              </div>

              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {completedAvaliacao.classificacao === "Atenção Necessária" ? (
                  <>
                    Sua pontuação atingiu o ponto de corte estatístico (≥ 7 pontos). Isso indica que você
                    pode estar vivenciando sintomas de sobrecarga, estresse ou desgaste emocional. Lembre-se:
                    isso <strong>não é um diagnóstico clínico</strong>, mas um indicativo de que você merece
                    atenção e cuidado.
                  </>
                ) : (
                  <>
                    Sua pontuação ficou abaixo do ponto de corte (&lt; 7 pontos), sugerindo que você não
                    apresenta indicativos significativos de sofrimento psíquico no momento. Continue
                    praticando pausas saudáveis e mantendo o autocuidado!
                  </>
                )}
              </p>
            </div>

            {/* Canais de Apoio em Saúde Mental */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <PhoneCall className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Canais Gratuitos de Apoio e Acolhimento</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100 block">CVV - Apoio Emocional</strong>
                    <span className="text-slate-500 text-[11px]">Ligação gratuita e sigilosa 24 horas</span>
                  </div>
                  <a
                    href="tel:188"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                  >
                    Ligue 188
                  </a>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <strong className="text-slate-900 dark:text-slate-100 block">CAPS / Rede Pública SUS</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Você pode procurar o Centro de Atenção Psicossocial (CAPS) ou a Unidade Básica de Saúde da sua cidade sem custo.
                  </p>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS - ALL FULL WIDTH AS PER USER REQUEST */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Baixar Meu Relatório Individual em PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("intro");
                  setRespostas({});
                  setCurrentQuestionIndex(0);
                  setCompletedAvaliacao(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-98 cursor-pointer"
              >
                <span>Responder Novamente ou Avaliar Outro Setor</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
