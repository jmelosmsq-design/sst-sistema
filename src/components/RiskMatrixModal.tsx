import React, { useState, useEffect } from "react";
import {
  X,
  ShieldAlert,
  Scale,
  BookOpen,
  Info,
  Check,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileCheck,
  Sliders,
  Layers,
} from "lucide-react";
import {
  MatrixDimension,
  AvaliacaoRiscoItem,
  RiskCategoryKey,
} from "../types";
import {
  RISK_MATRIX_MODELS,
  NORMAS_ESPECIFICAS_SUGERIDAS,
} from "../data/riskMatrixModels";
import { RISKS_CATALOG } from "../data/risksCatalog";
import { getRiscoTemplate } from "../data/riskTemplates";

interface RiskMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  riscoNome: string;
  funcaoNome?: string;
  categoria?: string;
  avaliacaoAtual?: AvaliacaoRiscoItem | null;
  matrizPadraoEmpresa?: MatrixDimension;
  onSaveAvaliacao: (avaliacao: AvaliacaoRiscoItem) => void;
}

export const RiskMatrixModal: React.FC<RiskMatrixModalProps> = ({
  isOpen,
  onClose,
  riscoNome,
  funcaoNome,
  categoria,
  avaliacaoAtual,
  matrizPadraoEmpresa = "5x5",
  onSaveAvaliacao,
}) => {
  const [selectedDimension, setSelectedDimension] = useState<MatrixDimension>(
    avaliacaoAtual?.matrizTipo || matrizPadraoEmpresa || "5x5"
  );

  const model = RISK_MATRIX_MODELS[selectedDimension];

  const [probabilidade, setProbabilidade] = useState<number>(() => {
    if (avaliacaoAtual?.probabilidade) {
      return Math.min(avaliacaoAtual.probabilidade, model.probabilidades.length);
    }
    return Math.ceil(model.probabilidades.length / 2);
  });

  const [severidade, setSeveridade] = useState<number>(() => {
    if (avaliacaoAtual?.severidade) {
      return Math.min(avaliacaoAtual.severidade, model.severidades.length);
    }
    return Math.ceil(model.severidades.length / 2);
  });

  const templatePadrao = getRiscoTemplate(riscoNome);

  const [referenciaNormativaMatriz, setReferenciaNormativaMatriz] = useState<string>(
    avaliacaoAtual?.referenciaNormativaMatriz ||
      model.referenciasPrincipais[0]?.nome ||
      "NR-01 (GRO/PGR)"
  );

  const [normasComplementares, setNormasComplementares] = useState<string[]>(() => {
    if (avaliacaoAtual?.normasComplementares && avaliacaoAtual.normasComplementares.length > 0) {
      return avaliacaoAtual.normasComplementares;
    }
    if (templatePadrao?.normasSugeridas && templatePadrao.normasSugeridas.length > 0) {
      return templatePadrao.normasSugeridas;
    }
    // Auto-suggest complementary norms based on risk keywords
    const lower = riscoNome.toLowerCase();
    const suggested: string[] = ["NR-01"];
    if (lower.includes("ruído") || lower.includes("som")) suggested.push("NR-15 Anexo 1", "NHO 01");
    if (lower.includes("calor") || lower.includes("térmic")) suggested.push("NR-15 Anexo 3", "NHO 06");
    if (lower.includes("vibraç")) suggested.push("NR-15 Anexo 8", "NHO 09/10");
    if (lower.includes("químic") || lower.includes("vapor") || lower.includes("gases") || lower.includes("solvente") || lower.includes("poeira")) {
      suggested.push("NR-09", "NR-15 Anexo 11", "ACGIH TLVs");
    }
    if (lower.includes("biológic") || lower.includes("vírus") || lower.includes("bactér")) suggested.push("NR-15 Anexo 14", "NR-09");
    if (lower.includes("postura") || lower.includes("peso") || lower.includes("ergon") || lower.includes("repetit") || lower.includes("sentado") || lower.includes("mobiliário")) {
      suggested.push("NR-17");
    }
    if (lower.includes("elétric") || lower.includes("choque")) suggested.push("NR-10");
    if (lower.includes("máquina") || lower.includes("prensa") || lower.includes("corte")) suggested.push("NR-12");
    if (lower.includes("altura") || lower.includes("queda")) suggested.push("NR-35");
    if (lower.includes("confinado")) suggested.push("NR-33");
    return Array.from(new Set(suggested));
  });

  const [fonteGeradora, setFonteGeradora] = useState(
    avaliacaoAtual?.fonteGeradora ?? (templatePadrao?.fonteGeradora || "")
  );
  const [meioPropagacao, setMeioPropagacao] = useState(
    avaliacaoAtual?.meioPropagacao ?? (templatePadrao?.meioPropagacao || "Ar / Contato direto no posto de trabalho")
  );
  const [possiveisDanos, setPossiveisDanos] = useState(
    avaliacaoAtual?.possiveisDanos ?? (templatePadrao?.possiveisDanos || "")
  );
  const [medidasControleExistentes, setMedidasControleExistentes] = useState(
    avaliacaoAtual?.medidasControleExistentes ?? (templatePadrao?.medidasControleExistentes || "")
  );
  const [medidasControlePropostas, setMedidasControlePropostas] = useState(
    avaliacaoAtual?.medidasControlePropostas ?? (templatePadrao?.medidasControlePropostas || "")
  );

  // Update dimension constraints when switching dimension
  const handleDimensionChange = (dim: MatrixDimension) => {
    setSelectedDimension(dim);
    const newModel = RISK_MATRIX_MODELS[dim];
    const newP = Math.min(probabilidade, newModel.probabilidades.length);
    const newS = Math.min(severidade, newModel.severidades.length);
    setProbabilidade(newP);
    setSeveridade(newS);
    setReferenciaNormativaMatriz(newModel.referenciasPrincipais[0]?.nome || "NR-01");
  };

  // Safe cell calculation
  const pIndex = Math.max(0, Math.min(probabilidade - 1, model.grid.length - 1));
  const sIndex = Math.max(0, Math.min(severidade - 1, (model.grid[pIndex]?.length || 1) - 1));
  const cell = model.grid[pIndex]?.[sIndex] || {
    nivel: 2,
    rotulo: "Moderado",
    corHex: "#ca8a04",
    corClasse: "bg-amber-600 text-white",
    prioridade: "Média",
    prazo: "60 dias",
  };

  const probObj = model.probabilidades[pIndex] || model.probabilidades[0];
  const sevObj = model.severidades[sIndex] || model.severidades[0];

  const handleToggleNormaComplementar = (codigo: string) => {
    setNormasComplementares((prev) =>
      prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo]
    );
  };

  const handleSave = () => {
    const novaAvaliacao: AvaliacaoRiscoItem = {
      id: avaliacaoAtual?.id || `av_${Date.now()}`,
      riscoNome,
      categoria: categoria || "geral",
      matrizTipo: selectedDimension,
      probabilidade,
      severidade,
      probabilidadeRotulo: `${probObj.rotulo} (${probabilidade})`,
      severidadeRotulo: `${sevObj.rotulo} (${severidade})`,
      nivelRiscoScore: probabilidade * severidade,
      nivelRiscoRotulo: cell.rotulo,
      nivelRiscoCorHex: cell.corHex,
      nivelRiscoClasse: cell.corClasse,
      referenciaNormativaMatriz,
      normasComplementares,
      fonteGeradora: fonteGeradora.trim(),
      meioPropagacao: meioPropagacao.trim(),
      possiveisDanos: possiveisDanos.trim(),
      prioridadeAcao: cell.prioridade as any,
      prazoSugerido: cell.prazo,
      medidasControleExistentes: medidasControleExistentes.trim(),
      medidasControlePropostas: medidasControlePropostas.trim(),
    };

    onSaveAvaliacao(novaAvaliacao);
    onClose();
  };

  if (!isOpen) return null;

  // Find category color if available
  const catObj = Object.values(RISKS_CATALOG).find(
    (c) => c.key === categoria || c.riscos.includes(riscoNome)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 my-4 flex flex-col max-h-[92vh]">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 sm:px-5 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-xs shrink-0"
              style={{ backgroundColor: catObj?.corHex || "#1e293b" }}
            >
              <Scale className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Avaliação na Matriz de Riscos (PGR / GRO)
                </span>
                {funcaoNome && (
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                    👷 {funcaoNome}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {riscoNome}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* 1. SELETOR DA DIMENSÃO DA MATRIZ (3x3, 4x4, 5x5) */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Metodologia & Dimensão da Matriz de Risco:</span>
              </label>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                Selecione o modelo desejado
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(["3x3", "4x4", "5x5"] as MatrixDimension[]).map((dim) => {
                const isSelected = selectedDimension === dim;
                const m = RISK_MATRIX_MODELS[dim];
                return (
                  <button
                    key={dim}
                    type="button"
                    onClick={() => handleDimensionChange(dim)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-blue-600 dark:border-blue-600 shadow-xs ring-2 ring-blue-500/30"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <span className="text-sm font-extrabold tracking-tight">
                      Matriz {dim}
                    </span>
                    <span className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? "text-slate-200" : "text-slate-500 dark:text-slate-400"}`}>
                      {dim === "3x3" ? "Simples (BS 8800)" : dim === "4x4" ? "Industrial (ISO 31010)" : "Padrão PGR (NR-01)"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explicação da Norma da Matriz Escolhida */}
            <div className="rounded-xl bg-white dark:bg-slate-900 p-2.5 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-slate-100 font-bold block mb-0.5">
                  {model.titulo}:
                </strong>
                <p className="leading-relaxed">{model.descricaoNormativa}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {model.referenciasPrincipais.map((ref) => (
                    <span
                      key={ref.codigo}
                      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${ref.corBadge} shadow-2xs`}
                      title={ref.nome}
                    >
                      <span>{ref.codigo}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. GRADE VISUAL COLORIDA INTERATIVA DA MATRIZ */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Grade Interativa (Probabilidade × Severidade)</span>
              </h4>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Toque na célula ou selecione nos botões abaixo
              </span>
            </div>

            {/* Visual Matrix Grid */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-2.5">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-1.5 text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 w-24">
                      P \ S
                    </th>
                    {model.severidades.map((s) => (
                      <th
                        key={s.valor}
                        className={`p-1.5 text-[11px] font-bold ${
                          severidade === s.valor
                            ? "text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/40 rounded-t-lg"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div>{s.rotulo}</div>
                        <div className="text-[9px] font-normal text-slate-400 dark:text-slate-500">
                          (S={s.valor})
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {model.probabilidades.map((p, pIdx) => (
                    <tr key={p.valor}>
                      <td
                        className={`p-1.5 text-[11px] font-bold text-left ${
                          probabilidade === p.valor
                            ? "text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/40 rounded-l-lg"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div>{p.rotulo}</div>
                        <div className="text-[9px] font-normal text-slate-400 dark:text-slate-500">
                          (P={p.valor})
                        </div>
                      </td>

                      {model.severidades.map((s, sIdx) => {
                        const cellData = model.grid[pIdx]?.[sIdx] || {
                          nivel: 1,
                          rotulo: "Baixo",
                          corHex: "#16a34a",
                          corClasse: "bg-emerald-600 text-white",
                          prioridade: "Baixa",
                          prazo: "Monitorar",
                        };

                        const isCellSelected =
                          probabilidade === p.valor && severidade === s.valor;

                        return (
                          <td key={s.valor} className="p-1">
                            <button
                              type="button"
                              onClick={() => {
                                setProbabilidade(p.valor);
                                setSeveridade(s.valor);
                              }}
                              className={`w-full py-2 px-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                                isCellSelected
                                  ? "ring-3 ring-offset-2 ring-slate-900 dark:ring-white scale-105 shadow-md z-10"
                                  : "opacity-85 hover:opacity-100 hover:scale-[1.02] shadow-2xs"
                              }`}
                              style={{
                                backgroundColor: cellData.corHex,
                                color: "#ffffff",
                              }}
                            >
                              <div className="truncate">{cellData.rotulo}</div>
                              <div className="text-[9px] opacity-90 font-medium">
                                Score {p.valor * s.valor}
                              </div>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. CARD DO NÍVEL DE RISCO RESULTANTE COM CORES */}
          <div
            className="rounded-2xl p-4 text-white shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            style={{ backgroundColor: cell.corHex }}
          >
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider opacity-90">
                <ShieldAlert className="h-4 w-4" />
                <span>Nível de Risco Classificado</span>
              </div>
              <div className="text-xl sm:text-2xl font-black mt-0.5">
                {cell.rotulo} (Score: {probabilidade * severidade})
              </div>
              <p className="text-xs opacity-95 mt-1 font-medium">
                Probabilidade: <strong>{probObj.rotulo} ({probabilidade})</strong> × Severidade: <strong>{sevObj.rotulo} ({severidade})</strong>
              </p>
            </div>

            <div className="bg-black/20 backdrop-blur-xs rounded-xl p-2.5 text-left sm:text-right w-full sm:w-auto shrink-0 border border-white/20">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-85">
                Prioridade no Plano de Ação:
              </div>
              <div className="text-sm font-extrabold">{cell.prioridade}</div>
              <div className="text-[11px] font-medium opacity-90 mt-0.5 flex items-center gap-1 sm:justify-end">
                <Clock className="h-3 w-3" />
                <span>Prazo sugerido: {cell.prazo}</span>
              </div>
            </div>
          </div>

          {/* 4. SELEÇÃO DE REFERÊNCIAS NORMATIVAS & LEGAIS (COLORIDAS) */}
          <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Normas Regulamentadoras & Referências Legais Aplicáveis:</span>
              </label>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                Aparecerão no Relatório/PGR
              </span>
            </div>

            {/* Referência da Metodologia da Matriz */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Base Metodológica da Matriz de Risco:
              </label>
              <select
                value={referenciaNormativaMatriz}
                onChange={(e) => setReferenciaNormativaMatriz(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition-all"
              >
                {model.referenciasPrincipais.map((ref) => (
                  <option key={ref.codigo} value={ref.nome}>
                    📘 {ref.codigo} - {ref.nome}
                  </option>
                ))}
                <option value="NR-01 (Portaria MTP 6.730/2020) / ISO 45001">
                  📘 NR-01 (Portaria MTP 6.730/2020) / ISO 45001 Integrada
                </option>
              </select>
            </div>

            {/* Normas Complementares Chips Selecionáveis com Cores */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Normas e Enquadramentos Complementares (NRs, NHOs, ACGIH):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {NORMAS_ESPECIFICAS_SUGERIDAS.map((norma) => {
                  const isSelected = normasComplementares.includes(norma.codigo);
                  return (
                    <button
                      key={norma.codigo}
                      type="button"
                      onClick={() => handleToggleNormaComplementar(norma.codigo)}
                      className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                        isSelected
                          ? `${norma.corBadge} shadow-xs ring-2 ring-offset-1 ring-slate-900/20`
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 shadow-2xs"
                      }`}
                      title={norma.titulo}
                    >
                      {isSelected ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                      )}
                      <span>{norma.codigo}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. DETALHAMENTO QUALITATIVO COMPLEMENTAR (PGR / GRO) */}
          <div className="space-y-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Detalhamento Técnico Ocupacional (PGR)</span>
              </h4>
              {templatePadrao && (
                <button
                  type="button"
                  onClick={() => {
                    setFonteGeradora(templatePadrao.fonteGeradora);
                    setPossiveisDanos(templatePadrao.possiveisDanos);
                    setMedidasControleExistentes(templatePadrao.medidasControleExistentes);
                    setMedidasControlePropostas(templatePadrao.medidasControlePropostas);
                    setMeioPropagacao(templatePadrao.meioPropagacao);
                    if (templatePadrao.normasSugeridas) {
                      setNormasComplementares(Array.from(new Set([...normasComplementares, ...templatePadrao.normasSugeridas])));
                    }
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/40 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Recarregar Sugestões Técnicas Específicas</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Fonte Geradora do Risco:
                </label>
                <input
                  type="text"
                  value={fonteGeradora}
                  onChange={(e) => setFonteGeradora(e.target.value)}
                  placeholder="Ex: Compressores, prensas mecânicas, trânsito de empilhadeiras..."
                  className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Possíveis Danos à Saúde / Efeitos:
                </label>
                <input
                  type="text"
                  value={possiveisDanos}
                  onChange={(e) => setPossiveisDanos(e.target.value)}
                  placeholder="Ex: PAIR (Perda Auditiva), LER/DORT, fraturas, dermatites..."
                  className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Medidas de Controle Existentes no Setor:
              </label>
              <input
                type="text"
                value={medidasControleExistentes}
                onChange={(e) => setMedidasControleExistentes(e.target.value)}
                placeholder="Ex: Enclausuramento acústico parcial, fornecimento de protetor auricular plug (CA 12345)..."
                className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Medidas de Controle Recomendadas / Plano de Ação:
              </label>
              <textarea
                value={medidasControlePropostas}
                onChange={(e) => setMedidasControlePropostas(e.target.value)}
                rows={2}
                placeholder="Ex: Realizar manutenção preventiva trimestral, adequação de proteção NR-12 e treinamento..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Rodapé com Botões */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 p-4 sm:px-5 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Salvar Avaliação na Matriz</span>
          </button>
        </div>
      </div>
    </div>
  );
};
