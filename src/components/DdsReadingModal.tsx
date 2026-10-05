import React, { useState, useEffect } from "react";
import {
  BookOpen,
  X,
  Clock,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";

interface DdsReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  temaTitulo: string;
  temaConteudo: string;
  nrReferencia?: string;
  ministranteNome?: string;
  empresaNome?: string;
  perguntasDebate?: string[];
  pontosPrincipais?: string[];
}

export const DdsReadingModal: React.FC<DdsReadingModalProps> = ({
  isOpen,
  onClose,
  temaTitulo,
  temaConteudo,
  nrReferencia,
  ministranteNome,
  empresaNome,
  perguntasDebate = [],
  pontosPrincipais = [],
}) => {
  const [fontSize, setFontSize] = useState<"md" | "lg" | "xl">("lg");
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Timer for DDS duration
  useEffect(() => {
    let interval: any;
    if (isOpen && isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isTimerRunning]);

  // Start timer automatically when opened
  useEffect(() => {
    if (isOpen) {
      setSecondsElapsed(0);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleCopyText = () => {
    const fullText = `DIÁLOGO DE SEGURANÇA (DDS)\nTema: ${temaTitulo} ${nrReferencia ? `[${nrReferencia}]` : ""}\nMinistrante: ${ministranteNome || ""}\n\nROTEIRO DE LEITURA:\n${temaConteudo}\n\nPERGUNTAS PARA DEBATE:\n${perguntasDebate.map((p, i) => `${i + 1}. ${p}`).join("\n")}`;
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const paragraphs = temaConteudo
    ? temaConteudo.split(/\n+/).filter((p) => p.trim() !== "")
    : [];

  const fontSizeClass =
    fontSize === "xl"
      ? "text-lg sm:text-xl leading-relaxed sm:leading-loose"
      : fontSize === "lg"
      ? "text-base sm:text-lg leading-relaxed"
      : "text-sm sm:text-base leading-normal";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[94vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Modo Leitura / Teleprompter do Ministrante
                </span>
                {nrReferencia && (
                  <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    {nrReferencia}
                  </span>
                )}
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg line-clamp-1">
                {temaTitulo}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Font size selectors */}
            <div className="hidden sm:flex items-center bg-slate-200/60 dark:bg-slate-700/60 rounded-xl p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFontSize("md")}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  fontSize === "md"
                    ? "bg-white dark:bg-slate-900 text-blue-600 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize("lg")}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  fontSize === "lg"
                    ? "bg-white dark:bg-slate-900 text-blue-600 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize("xl")}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  fontSize === "xl"
                    ? "bg-white dark:bg-slate-900 text-blue-600 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                A++
              </button>
            </div>

            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopyText}
              title="Copiar texto completo do diálogo"
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-slate-700 dark:text-slate-300 transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-600">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Copiar</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Floating Meeting Control Timer Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 px-5 py-2.5 text-white flex flex-wrap items-center justify-between gap-3 text-xs shadow-inner">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-200" />
            <span className="font-medium text-blue-100">Tempo de Reunião:</span>
            <span className="font-mono font-bold text-sm tracking-wider bg-black/30 px-2 py-0.5 rounded-md text-emerald-300">
              {formatTimer(secondsElapsed)}
            </span>
            <span className="text-[11px] text-blue-200/80">/ meta: 10~15 min</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg font-bold text-[11px] transition-colors"
            >
              {isTimerRunning ? (
                <>
                  <Pause className="h-3 w-3" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  <span>Iniciar</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSecondsElapsed(0)}
              className="p-1 bg-white/15 hover:bg-white/25 rounded-lg transition-colors"
              title="Zerar cronômetro"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Reading Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* Main Spoken Text */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Roteiro Completo para Leitura Oral do Facilitador</span>
            </div>

            {paragraphs.length > 0 ? (
              paragraphs.map((p, idx) => (
                <p
                  key={idx}
                  className={`text-slate-800 dark:text-slate-100 font-normal tracking-normal text-justify ${fontSizeClass}`}
                >
                  {p}
                </p>
              ))
            ) : (
              <p className="text-slate-400 italic">
                Nenhum texto de diálogo inserido. Selecione um tema no catálogo ou digite o conteúdo.
              </p>
            )}
          </div>

          {/* Key Discussion Bullet Points */}
          {pontosPrincipais && pontosPrincipais.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Pontos-Chave para Reforço em Campo
              </h4>
              <ul className="space-y-1.5">
                {pontosPrincipais.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Questions for Interactive Debate */}
          {perguntasDebate && perguntasDebate.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/30 p-4 sm:p-5 rounded-2xl space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-amber-600" />
                Perguntas para Debate e Participação Ativa da Equipe
              </h4>
              <div className="space-y-2">
                {perguntasDebate.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs sm:text-sm font-semibold text-amber-950 dark:text-amber-100 bg-white/70 dark:bg-slate-800/80 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-800/40"
                  >
                    <span className="font-bold text-amber-600">{i + 1}.</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info & close button */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Facilitador: <strong>{ministranteNome || "Responsável SST"}</strong> • {empresaNome || "Empresa"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Concluir Leitura
          </button>
        </div>
      </div>
    </div>
  );
};
