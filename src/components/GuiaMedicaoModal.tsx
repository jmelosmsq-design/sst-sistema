import React, { useState } from "react";
import {
  X,
  BookOpen,
  FlaskConical,
  Activity,
  Wind,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Gauge,
  Thermometer,
  Shield,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
  Calculator,
  Search,
  ChevronRight,
  Info,
  ExternalLink,
  Flame,
  Truck,
  Box,
  CornerDownRight,
  Bookmark,
} from "lucide-react";
import { ProtocoloAmostragem, PROTOCOLOS_HIGIENE, buscarProtocoloHigiene } from "../data/higieneProtocolos";

interface GuiaMedicaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSearch?: string; // Ex: "Thinner", "Ruído", "Poeira"
}

export const GuiaMedicaoModal: React.FC<GuiaMedicaoModalProps> = ({
  isOpen,
  onClose,
  initialSearch = "",
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocoloAmostragem>(() => {
    return buscarProtocoloHigiene(initialSearch) || PROTOCOLOS_HIGIENE[0];
  });
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [customProtocols, setCustomProtocols] = useState<ProtocoloAmostragem[]>([]);
  const [activeTab, setActiveTab] = useState<"passo" | "calibragem" | "bomba" | "preservacao" | "limites">("passo");

  // Atualizar seleção caso o initialSearch mude ao abrir
  React.useEffect(() => {
    if (isOpen) {
      if (initialSearch) {
        setSearchTerm(initialSearch);
        const match = buscarProtocoloHigiene(initialSearch);
        if (match) setSelectedProtocol(match);
      }
    }
  }, [isOpen, initialSearch]);

  if (!isOpen) return null;

  const todosProtocolos = [...PROTOCOLOS_HIGIENE, ...customProtocols];

  const filteredProtocolos = todosProtocolos.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.agente.toLowerCase().includes(q) ||
      p.normasRegulamentadoras.some((n) => n.toLowerCase().includes(q)) ||
      p.meioColeta.dispositivo.toLowerCase().includes(q) ||
      (p.sinonimos && p.sinonimos.some((s) => s.toLowerCase().includes(q))) ||
      (p.cas && p.cas.toLowerCase().includes(q))
    );
  });

  const handleGenerateAiProtocol = async () => {
    if (!searchTerm.trim()) return;
    setIsGeneratingAi(true);
    try {
      const res = await fetch("/api/higiene/generate-protocol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agente: searchTerm,
          detalhes: "Instruções práticas de campo para técnico e engenheiro de SST",
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const aiProto: ProtocoloAmostragem = {
          ...data.data,
          id: `ai_${Date.now()}`,
        };
        setCustomProtocols((prev) => [aiProto, ...prev]);
        setSelectedProtocol(aiProto);
      } else {
        alert("Não foi possível gerar o protocolo com IA. Usando referências padrão.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar ao assistente de amostragem.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const getCategoryBadge = (categoria: string) => {
    switch (categoria) {
      case "quimico":
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900/60">Vapores & Solventes (NR-15 Anexo 11)</span>;
      case "fisico":
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">Agente Físico (NHO / NR-15)</span>;
      case "poeiras":
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">Poeiras & Sílica (NHO 08)</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">Higiene Ocupacional</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Top Header Banner */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md ring-2 ring-white/10">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">
                  Guia Prático de Coleta & Medições em Campo
                </h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  NR-15 • NHO • NIOSH • ACGIH
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                Instruções normativas passo a passo: calibragem, vazão, cassetes, tubos e cadeia de custódia
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
            title="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Bar & Fast Selector */}
        <div className="p-3 sm:px-6 sm:py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar risco ou produto (ex: Thinner, Ruído, Sílica, Fumos, Solvente, CAS...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Botão para consultar via IA se não encontrar na lista básica */}
          <button
            type="button"
            onClick={handleGenerateAiProtocol}
            disabled={isGeneratingAi || !searchTerm.trim()}
            className="w-full sm:w-auto inline-flex h-10 items-center justify-center gap-1.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isGeneratingAi ? "animate-spin" : ""}`} />
            <span>{isGeneratingAi ? "Pesquisando Métodos..." : "Gerar Protocolo IA"}</span>
          </button>
        </div>

        {/* Chips de Acesso Rápido aos Principais Agentes */}
        <div className="px-4 sm:px-6 py-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1">
            Mais Consultados:
          </span>
          {todosProtocolos.map((p) => {
            const isSelected = selectedProtocol?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProtocol(p)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {p.agente.split("/")[0].trim()}
              </button>
            );
          })}
        </div>

        {/* Modal Body: Selected Protocol View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {selectedProtocol ? (
            <div className="space-y-4">
              {/* Header do Agente Selecionado */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryBadge(selectedProtocol.categoria)}
                      {selectedProtocol.cas && (
                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          CAS: {selectedProtocol.cas}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                      {selectedProtocol.agente}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">
                      Método Oficial Recomendado:
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {selectedProtocol.metodologiaReferencia}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedProtocol.resumoObjetivo}
                </p>

                {/* Normas Relacionadas */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Fundamentação Legal:
                  </span>
                  {selectedProtocol.normasRegulamentadoras.map((nr, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {nr}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sub-Navegação interna de seções da medição */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab("passo")}
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                    activeTab === "passo"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>1. Passo a Passo em Campo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("calibragem")}
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                    activeTab === "calibragem"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Gauge className="h-3.5 w-3.5" />
                  <span>2. Calibragem dos Equipamentos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("bomba")}
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                    activeTab === "bomba"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Wind className="h-3.5 w-3.5" />
                  <span>3. Meio de Coleta & Bomba</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("preservacao")}
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                    activeTab === "preservacao"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Box className="h-3.5 w-3.5" />
                  <span>4. Transporte & Custódia</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("limites")}
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                    activeTab === "limites"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Calculator className="h-3.5 w-3.5" />
                  <span>5. Limites & Cálculos</span>
                </button>
              </div>

              {/* ABA 1: PASSO A PASSO EM CAMPO */}
              {activeTab === "passo" && (
                <div className="space-y-3">
                  <div className="space-y-2.5">
                    {selectedProtocol.passoAPassoCampo.map((passo, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3.5 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-extrabold shrink-0">
                            {passo.etapa || idx + 1}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                            {passo.titulo}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
                          {passo.descricao}
                        </p>
                        {passo.dicasPraticas && (
                          <div className="ml-8 mt-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-2 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <span><strong>Dica prática de campo:</strong> {passo.dicasPraticas}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Alerta de Branco de Campo */}
                  {selectedProtocol.brancoDeCampo && (
                    <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/30 p-3.5 space-y-1">
                      <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
                        <Bookmark className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">
                          Procedimento de Branco de Campo (Field Blank)
                        </h4>
                      </div>
                      <p className="text-xs text-indigo-950/90 dark:text-indigo-200/90 leading-relaxed">
                        {selectedProtocol.brancoDeCampo.instrucao}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ABA 2: CALIBRAGEM */}
              {activeTab === "calibragem" && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Gauge className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="text-sm font-bold">
                        {selectedProtocol.calibragemPassoAPasso.titulo}
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {selectedProtocol.calibragemPassoAPasso.instrucoes.map((ins, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{ins}</span>
                        </div>
                      ))}
                    </div>

                    {/* Critério de Aceitação */}
                    <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3 text-xs text-red-900 dark:text-red-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span>Critério de Aceitação / Invalidade da Amostra:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {selectedProtocol.calibragemPassoAPasso.criterioAceitacao}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 3: MEIO DE COLETA & BOMBA */}
              {activeTab === "bomba" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Dispositivo e Acessórios */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <FlaskConical className="h-4 w-4 text-indigo-600" />
                      <span>Dispositivo Amostrador</span>
                    </h4>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                        {selectedProtocol.meioColeta.dispositivo}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {selectedProtocol.meioColeta.especificacao}
                      </span>
                    </div>

                    <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 pt-1">
                      Acessórios Necessários em Campo:
                    </h5>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {selectedProtocol.meioColeta.acessorios.map((ac, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          <span>{ac}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Parâmetros de Bomba e Fluxo */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Wind className="h-4 w-4 text-indigo-600" />
                      <span>Parâmetros de Fluxo & Volume</span>
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Vazão Recomendada:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{selectedProtocol.parametrosBomba.vazaoRecomendada}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Volume Mínimo:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedProtocol.parametrosBomba.volumeMinimoLitros}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Volume Máximo (Saturação):</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedProtocol.parametrosBomba.volumeMaximoLitros}</span>
                      </div>
                      <div className="py-1">
                        <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Tempo Sugerido de Coleta:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed block">
                          {selectedProtocol.parametrosBomba.tempoColetaSugerido}
                        </span>
                      </div>
                      <div className="py-1">
                        <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Condições Ambientais:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed block">
                          {selectedProtocol.parametrosBomba.temperaturaUmidade}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 4: PRESERVAÇÃO E TRANSPORTE */}
              {activeTab === "preservacao" && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Box className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="text-sm font-bold">
                      Preservação, Embalagem e Envio ao Laboratório
                    </h4>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                        📦 Acondicionamento & Refrigeração:
                      </span>
                      <p className="leading-relaxed">{selectedProtocol.preservacaoTransporte.acondicionamento}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                        ⏳ Prazo Máximo para Análise Laboratorial:
                      </span>
                      <p className="leading-relaxed">{selectedProtocol.preservacaoTransporte.tempoLimiteLaboratorio}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                        📋 Dados Mandatórios na Cadeia de Custódia (COC):
                      </span>
                      <p className="leading-relaxed">{selectedProtocol.preservacaoTransporte.documentacao}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 5: LIMITES DE TOLERÂNCIA E CÁLCULO */}
              {activeTab === "limites" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Limites Oficiais */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Limites de Tolerância (LEO)
                      </h4>

                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
                          <span className="font-bold text-red-900 dark:text-red-300 block text-[11px]">NR-15 (Brasil / MTE):</span>
                          <span className="text-slate-800 dark:text-slate-200 text-xs font-medium">{selectedProtocol.limitesTolerancia.nr15}</span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                          <span className="font-bold text-blue-900 dark:text-blue-300 block text-[11px]">ACGIH (EUA / TLVs):</span>
                          <span className="text-slate-800 dark:text-slate-200 text-xs font-medium">{selectedProtocol.limitesTolerancia.acgih}</span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                          <span className="font-bold text-amber-900 dark:text-amber-300 block text-[11px]">Nível de Ação (NR-09 / GRO):</span>
                          <span className="text-slate-800 dark:text-slate-200 text-xs font-medium">{selectedProtocol.limitesTolerancia.nivelAcaoNR09}</span>
                        </div>
                      </div>
                    </div>

                    {/* Fórmulas e Cálculo de Exemplo */}
                    {selectedProtocol.calculoAmostrador && (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Calculator className="h-4 w-4 text-indigo-600" />
                          <span>Fórmulas de Cálculo em Campo</span>
                        </h4>

                        <div className="p-3 rounded-lg bg-slate-900 text-white font-mono text-xs space-y-1">
                          <span className="text-indigo-400 text-[10px] font-sans font-bold uppercase block">Fórmula de Volume / Concentração:</span>
                          <p>{selectedProtocol.calculoAmostrador.formula}</p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px] block">Exemplo Prático Resolvido:</span>
                          <p className="leading-relaxed">{selectedProtocol.calculoAmostrador.exemplo}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <FlaskConical className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">Nenhum protocolo selecionado.</p>
              <p className="text-xs">Digite o nome do produto no campo de busca acima.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            <span>Consulte sempre a FDS/FISPQ específica e o laboratório analítico credenciado.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95 shadow-xs"
          >
            Fechar Guia
          </button>
        </div>
      </div>
    </div>
  );
};
