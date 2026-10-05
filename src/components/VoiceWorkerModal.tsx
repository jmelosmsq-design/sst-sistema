import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  X,
  Check,
  Trash2,
  Plus,
  Volume2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { DdsParticipante } from "../types";
import { parseVoiceWorkerText, ParsedWorker } from "../utils/voiceWorkerParser";

interface VoiceWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorkers: (workers: DdsParticipante[]) => void;
  defaultSetor?: string;
  onAlert?: (type: "success" | "error" | "info", msg: string) => void;
}

export const VoiceWorkerModal: React.FC<VoiceWorkerModalProps> = ({
  isOpen,
  onClose,
  onAddWorkers,
  defaultSetor = "",
  onAlert,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [parsedList, setParsedList] = useState<ParsedWorker[]>([]);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const parseDebounceTimerRef = useRef<any>(null);
  const fullTranscriptRef = useRef<string>("");

  // Inicializar Web Speech Recognition
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript("");
      setInterimTranscript("");
      setParsedList([]);
      setErrorMessage(null);
      fullTranscriptRef.current = "";
      if (parseDebounceTimerRef.current) {
        clearTimeout(parseDebounceTimerRef.current);
      }
      return;
    }

    const windowObj: any = window;
    const SpeechRecognition =
      windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setErrorMessage(
        "Seu navegador não possui suporte nativo à gravação direta de voz (Web Speech). Digite os dados abaixo ou use o Google Chrome / Edge."
      );
      return;
    }

    setSpeechSupported(true);

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let finalStr = "";
        let interimStr = "";

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalStr += res[0].transcript + " ";
          } else {
            interimStr += res[0].transcript;
          }
        }

        const cleanedFinal = finalStr.trim();
        setInterimTranscript(interimStr);

        if (cleanedFinal && cleanedFinal !== fullTranscriptRef.current) {
          fullTranscriptRef.current = cleanedFinal;
          setTranscript(cleanedFinal);

          // Debounce do processamento para evitar disparos rápidos e duplicação enquanto fala devagar
          if (parseDebounceTimerRef.current) {
            clearTimeout(parseDebounceTimerRef.current);
          }

          parseDebounceTimerRef.current = setTimeout(() => {
            const parsed = parseVoiceWorkerText(cleanedFinal, defaultSetor);
            if (parsed.length > 0) {
              setParsedList(parsed);
            }
          }, 600);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setErrorMessage(
            "Permissão de microfone bloqueada no navegador. Clique no ícone de cadeado na barra de endereços para permitir o microfone."
          );
        } else if (event.error === "no-speech") {
          // Apenas silêncio momentâneo
        } else {
          setErrorMessage(`Aviso do microfone: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error("Erro ao inicializar reconhecimento de voz:", err);
      setSpeechSupported(false);
    }

    return () => {
      stopListening();
      if (parseDebounceTimerRef.current) {
        clearTimeout(parseDebounceTimerRef.current);
      }
    };
  }, [isOpen]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setErrorMessage(null);
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // Ignorar se já em execução
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleTextareaChange = (text: string) => {
    setTranscript(text);
    fullTranscriptRef.current = text;
    const parsed = parseVoiceWorkerText(text, defaultSetor);
    setParsedList(parsed);
  };

  const handleUpdateWorker = (index: number, field: keyof ParsedWorker, val: any) => {
    const updated = [...parsedList];
    updated[index] = { ...updated[index], [field]: val };
    setParsedList(updated);
  };

  const handleRemoveWorker = (index: number) => {
    setParsedList(parsedList.filter((_, i) => i !== index));
  };

  const handleAddNewManualRow = () => {
    setParsedList([
      ...parsedList,
      {
        id: "part_man_" + Date.now(),
        nome: "",
        funcao: "Operacional",
        setor: defaultSetor || "Geral",
        cpfOuMatricula: "",
        presente: true,
      },
    ]);
  };

  const handleConfirmAdd = () => {
    const valid = parsedList.filter((p) => p.nome && p.nome.trim().length > 1);
    if (valid.length === 0) {
      onAlert?.("info", "Fale ou digite o nome de pelo menos um trabalhador.");
      return;
    }

    onAddWorkers(valid);
    onAlert?.("success", `${valid.length} trabalhador(es) cadastrado(s) com sucesso por voz!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
              <Mic className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
                <span>Cadastro de Trabalhadores por Voz</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                  Anti-Repetição Ativo
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Fale com calma: o sistema agrupa os dados e evita duplicações automaticamente
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Microfone e Controle de Voz */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50 to-white dark:from-slate-850 dark:to-slate-900 p-4 text-center space-y-3">
            <div className="flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={toggleListening}
                className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
                  isListening
                    ? "bg-red-500 text-white ring-8 ring-red-400/30 animate-pulse"
                    : "bg-blue-600 text-white hover:bg-blue-700 ring-4 ring-blue-500/20"
                }`}
                title={isListening ? "Clique para pausar microfone" : "Clique para iniciar captação de voz"}
              >
                {isListening ? (
                  <Mic className="h-9 w-9 animate-bounce" />
                ) : (
                  <Mic className="h-9 w-9" />
                )}
              </button>

              <div className="mt-3 space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {isListening
                    ? "Ouvindo com calma... Fale o nome e a função do trabalhador."
                    : "Microfone pausado. Clique acima para começar a falar."}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Exemplo: <span className="italic font-medium text-blue-600 dark:text-blue-400">"Carlos Eduardo Silva, função Eletricista, setor Manutenção, matrícula 1042"</span>
                </p>
              </div>
            </div>

            {/* Aviso de erro ou permissão se houver */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs text-left">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            {/* Caixa de Transcrição Falada */}
            <div className="text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Texto Capturado em Tempo Real:
                </label>
                {transcript && (
                  <button
                    type="button"
                    onClick={() => {
                      setTranscript("");
                      fullTranscriptRef.current = "";
                      setParsedList([]);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Limpar Tudo</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <textarea
                  rows={2}
                  value={transcript + (interimTranscript ? ` (${interimTranscript})` : "")}
                  onChange={(e) => handleTextareaChange(e.target.value)}
                  placeholder="O texto falado aparecerá aqui automaticamente... você também pode digitar ou colar nomes diretamente."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Lista de Trabalhadores Identificados */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-600" />
                <span>Trabalhadores Identificados ({parsedList.length})</span>
              </h3>
              <button
                type="button"
                onClick={handleAddNewManualRow}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Adicionar Linha Manual</span>
              </button>
            </div>

            {parsedList.length > 0 ? (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs divide-y divide-slate-100 dark:divide-slate-800">
                {parsedList.map((worker, idx) => (
                  <div
                    key={worker.id || idx}
                    className="p-3 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs"
                  >
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] text-slate-400 uppercase font-bold sm:hidden mb-0.5">Nome:</label>
                      <input
                        type="text"
                        value={worker.nome}
                        onChange={(e) => handleUpdateWorker(idx, "nome", e.target.value)}
                        placeholder="Nome completo *"
                        className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] text-slate-400 uppercase font-bold sm:hidden mb-0.5">Função:</label>
                      <input
                        type="text"
                        value={worker.funcao}
                        onChange={(e) => handleUpdateWorker(idx, "funcao", e.target.value)}
                        placeholder="Função / Cargo"
                        className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-400 uppercase font-bold sm:hidden mb-0.5">Setor:</label>
                      <input
                        type="text"
                        value={worker.setor}
                        onChange={(e) => handleUpdateWorker(idx, "setor", e.target.value)}
                        placeholder="Setor"
                        className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-400 uppercase font-bold sm:hidden mb-0.5">Doc/Matrícula:</label>
                      <input
                        type="text"
                        value={worker.cpfOuMatricula}
                        onChange={(e) => handleUpdateWorker(idx, "cpfOuMatricula", e.target.value)}
                        placeholder="Matrícula/CPF"
                        className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div className="sm:col-span-1 text-center sm:text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveWorker(idx)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-850 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-1">
                <Users className="h-8 w-8 text-slate-400 mx-auto mb-1 opacity-60" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nenhum trabalhador identificado ainda
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Clique no microfone acima e dite os nomes para preenchimento com anti-duplicação automática.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé de Ações - Botões Padronizados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/70">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 w-full items-center justify-center text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirmAdd}
            disabled={parsedList.length === 0}
            className="inline-flex h-12 w-full items-center justify-center gap-2 px-5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Inserir {parsedList.length > 0 ? `${parsedList.length} Trabalhador(es)` : ""}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
