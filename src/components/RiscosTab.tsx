import React, { useState } from "react";
import {
  AlertTriangle,
  Check,
  X,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Plus,
  FlaskConical,
  Clock,
  Droplets,
  Layers,
  Search,
  Camera,
  Edit2,
  Trash2,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  DownloadCloud,
  BookOpen,
} from "lucide-react";
import { FuncaoData, SetorData, RiskCategory, ProdutoQuimicoItem, VinculoProdutoFuncao, AvaliacaoRiscoItem, MatrixDimension } from "../types";
import { RISKS_CATALOG, REGRAS_SUGESTAO_RISCOS } from "../data/risksCatalog";
import { CATALOGO_PRODUTOS_QUIMICOS } from "../data/chemicalsCatalog";
import { RISK_MATRIX_MODELS } from "../data/riskMatrixModels";
import { RiskMatrixModal } from "./RiskMatrixModal";
import { QuimicoScanModal } from "./QuimicoScanModal";
import { QuimicoFormModal } from "./QuimicoFormModal";
import { ConfirmModal } from "./ConfirmModal";
import { GuiaMedicaoModal } from "./GuiaMedicaoModal";

interface RiscosTabProps {
  funcoes: FuncaoData[];
  setores: SetorData[];
  riscosPorFuncao: Record<string, string[]>;
  tipoMatrizPadrao?: MatrixDimension;
  avaliacoesRiscos?: Record<string, Record<string, AvaliacaoRiscoItem>>;
  produtosQuimicos?: ProdutoQuimicoItem[];
  produtosPorFuncao?: Record<string, VinculoProdutoFuncao[]>;
  onToggleRisco: (funcaoId: string, riscoNome: string) => void;
  onSaveAvaliacaoRisco?: (funcaoId: string, avaliacao: AvaliacaoRiscoItem) => void;
  onChangeTipoMatrizPadrao?: (tipo: MatrixDimension) => void;
  onSaveProdutoQuimico?: (produto: ProdutoQuimicoItem) => void;
  onDeleteProdutoQuimico?: (id: string) => void;
  onImportStandardChemicals?: () => void;
  onToggleVinculoProduto?: (funcaoId: string, produto: ProdutoQuimicoItem) => void;
  onUpdateVinculoProduto?: (funcaoId: string, vinculo: VinculoProdutoFuncao) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

const OPCOES_TEMPO_EXPOSICAO = [
  "Habitual e Permanente (6h a 8h/dia)",
  "Intermitente (2h a 4h/dia)",
  "Intermitente (1h a 2h/dia)",
  "Eventual (< 1h/dia)",
  "30 minutos por dia",
  "15 minutos por dia",
  "Ocasional / Semanal",
  "Mensal / Manutenção",
];

const OPCOES_CONCENTRACAO = [
  "Puro / Concentrado (100%)",
  "Diluído a 1% em água",
  "Diluído a 5% em água",
  "Diluído a 10% em água",
  "Diluído a 20% em água",
  "Diluído a 50% em água",
  "Em solução aquosa fraca",
  "Vapores / Névoas dispersas",
  "Mistura com outros solventes",
];

const OPCOES_FORMA_USO = [
  "Aplicação manual com pano / trincha / esponja",
  "Aplicação por pulverização / pistola de pintura / spray",
  "Imersão / banho de peças em tanque",
  "Manuseio direto em recipiente aberto",
  "Circuito fechado / dosagem automática",
  "Abastecimento / transferência de fluidos",
  "Limpeza e higienização de superfícies",
];

const OPCOES_VIA_EXPOSICAO = [
  "Inalatória e Dérmica (Vapores e Contato com a Pele)",
  "Dérmica (Contato direto com a pele / mãos)",
  "Inalatória (Inalação de vapores, névoas ou gases)",
  "Ocular (Risco de projeção e respingos nos olhos)",
  "Inalatória, Dérmica e Ocular",
];

export const RiscosTab: React.FC<RiscosTabProps> = ({
  funcoes,
  setores,
  riscosPorFuncao,
  tipoMatrizPadrao = "5x5",
  avaliacoesRiscos = {},
  produtosQuimicos = [],
  produtosPorFuncao = {},
  onToggleRisco,
  onSaveAvaliacaoRisco,
  onChangeTipoMatrizPadrao,
  onSaveProdutoQuimico,
  onDeleteProdutoQuimico,
  onImportStandardChemicals,
  onToggleVinculoProduto,
  onUpdateVinculoProduto,
  onAlert,
}) => {
  const [selectedFuncaoId, setSelectedFuncaoId] = useState<string>(funcoes[0]?.id || "");
  const [subTab, setSubTab] = useState<"matriz" | "quimicos">("matriz");
  const [searchTermQuimico, setSearchTermQuimico] = useState("");

  // Estado para adicionar "Outros" riscos em cada categoria
  const [showOutroInput, setShowOutroInput] = useState<Record<string, boolean>>({});
  const [outroTextoInput, setOutroTextoInput] = useState<Record<string, string>>({});

  // Modals state
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<ProdutoQuimicoItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Modal de Avaliação na Matriz
  const [evaluatingRisk, setEvaluatingRisk] = useState<{
    riscoNome: string;
    categoria?: string;
    avaliacao?: AvaliacaoRiscoItem | null;
  } | null>(null);

  // Modal do Guia Prático de Coletas e Medições (NR-15, NHO, ACGIH, NIOSH)
  const [guiaMedicaoState, setGuiaMedicaoState] = useState<{
    isOpen: boolean;
    termo: string;
  }>({
    isOpen: false,
    termo: "",
  });

  // Active selected function
  const selectedFuncao = funcoes.find((f) => f.id === selectedFuncaoId);
  const selectedSetor = setores.find((s) => s.id === selectedFuncao?.func_setor);
  const riscosVinculados = riscosPorFuncao[selectedFuncaoId] || [];
  const vinculosQuimicosDaFuncao = produtosPorFuncao[selectedFuncaoId] || [];
  const avaliacoesDaFuncao = avaliacoesRiscos[selectedFuncaoId] || {};

  // Contextual smart suggestions for general risks
  const contextText = `${selectedFuncao?.func_nome || ""} ${selectedFuncao?.func_descricao || ""} ${
    selectedSetor?.setor_nome || ""
  } ${selectedSetor?.setor_maquinas || ""}`.toLowerCase();

  const sugestoesEncontradas: string[] = [];
  REGRAS_SUGESTAO_RISCOS.forEach((regra) => {
    if (regra.termos.some((t) => contextText.includes(t))) {
      sugestoesEncontradas.push(...regra.riscos);
    }
  });

  const sugestoesUnicas = Array.from(new Set(sugestoesEncontradas));

  const handleToggle = (risco: string) => {
    if (!selectedFuncaoId) {
      onAlert("info", "Selecione uma função/cargo acima para vincular os riscos ocupacionais.");
      return;
    }
    onToggleRisco(selectedFuncaoId, risco);
  };

  const handleOpenMatrixModal = (riscoNome: string, categoria?: string) => {
    if (!selectedFuncaoId) {
      onAlert("info", "Selecione uma função/cargo para avaliar na matriz de riscos.");
      return;
    }
    const avaliacao = avaliacoesDaFuncao[riscoNome] || null;
    setEvaluatingRisk({
      riscoNome,
      categoria,
      avaliacao,
    });
  };

  const handleSaveAvaliacao = (avaliacao: AvaliacaoRiscoItem) => {
    if (!selectedFuncaoId) return;
    if (onSaveAvaliacaoRisco) {
      onSaveAvaliacaoRisco(selectedFuncaoId, avaliacao);
    }
  };

  const handleSaveProduto = (produto: ProdutoQuimicoItem) => {
    if (onSaveProdutoQuimico) {
      onSaveProdutoQuimico(produto);
      onAlert("success", `Produto "${produto.nome}" salvo com sucesso no inventário!`);
    }
  };

  const handleApplyScannedProduto = (prod: Omit<ProdutoQuimicoItem, "id">) => {
    const novoProduto: ProdutoQuimicoItem = {
      ...prod,
      id: `quim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    };
    handleSaveProduto(novoProduto);
    // Automatically link to selected function if available
    if (selectedFuncaoId && onToggleVinculoProduto) {
      onToggleVinculoProduto(selectedFuncaoId, novoProduto);
    }
  };

  const handleToggleVinculo = (produto: ProdutoQuimicoItem) => {
    if (!selectedFuncaoId) {
      onAlert("info", "Selecione uma função/cargo para vincular o produto químico.");
      return;
    }
    if (onToggleVinculoProduto) {
      onToggleVinculoProduto(selectedFuncaoId, produto);
    }
  };

  // Filter company inventory
  const filteredProdutos = produtosQuimicos.filter((p) => {
    const q = searchTermQuimico.toLowerCase();
    return (
      p.nome.toLowerCase().includes(q) ||
      (p.nomeQuimico && p.nomeQuimico.toLowerCase().includes(q)) ||
      (p.cas && p.cas.toLowerCase().includes(q)) ||
      (p.onu && p.onu.toLowerCase().includes(q)) ||
      (p.fabricante && p.fabricante.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Card Principal */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800 transition-colors">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-800 text-xs font-bold text-white shadow-xs">
              4
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Riscos Ocupacionais & Produtos Químicos
              </h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                NR-01, NR-09, NR-15 e Gestão de Produtos Químicos (GHS)
              </p>
            </div>
          </div>

          {/* Sub-Abas & Guia de Medição Padronizados em Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setSubTab("matriz")}
              className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer ${
                subTab === "matriz"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Matriz NR-01 Geral</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab("quimicos")}
              className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer ${
                subTab === "quimicos"
                  ? "bg-red-600 text-white"
                  : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <FlaskConical className="h-4 w-4" />
              <span>Inventário Químico ({produtosQuimicos.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setGuiaMedicaoState({ isOpen: true, termo: "" })}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Guia Prático de Coleta de Medições em Campo (NR-15, NHO, NIOSH, ACGIH)"
            >
              <BookOpen className="h-4 w-4" />
              <span>Guia de Medições em Campo</span>
            </button>
          </div>
        </div>

        {/* Seletor de Função para Vincular Riscos e Produtos */}
        <div className="space-y-1.5 mb-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Função / Cargo Atual para Análise de Exposição:
          </label>
          <select
            value={selectedFuncaoId}
            onChange={(e) => setSelectedFuncaoId(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
          >
            {funcoes.length === 0 ? (
              <option value="">Nenhuma função cadastrada (Cadastre primeiro na aba Funções)</option>
            ) : (
              funcoes.map((f) => {
                const s = setores.find((setor) => setor.id === f.func_setor);
                const countRiscos = (riscosPorFuncao[f.id] || []).length;
                const countQuimicos = (produtosPorFuncao[f.id] || []).length;
                return (
                  <option key={f.id} value={f.id}>
                    👷 {f.func_nome} • {s?.setor_nome || "Sem Setor"} ({countQuimicos} produtos químicos | {countRiscos} riscos)
                  </option>
                );
              })
            )}
          </select>
        </div>

        {/* ======================================================== */}
        {/* ABA 1: MATRIZ GERAL DE RISCOS OCUPACIONAIS (NR-01)       */}
        {/* ======================================================== */}
        {subTab === "matriz" && (
          <div className="space-y-4">
            {/* Banner de Metodologia & Normas Regulamentadoras da Matriz */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-3.5 sm:p-4 shadow-md border border-slate-700/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                      <span>Metodologia da Matriz de Risco (PGR / GRO)</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/30 text-blue-200 border border-blue-400/30">
                        {tipoMatrizPadrao}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      {RISK_MATRIX_MODELS[tipoMatrizPadrao].titulo}
                    </p>
                  </div>
                </div>

                {/* Seletor rápido 3x3, 4x4, 5x5 */}
                <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-700/60 shrink-0">
                  {(["3x3", "4x4", "5x5"] as MatrixDimension[]).map((dim) => {
                    const isSelected = tipoMatrizPadrao === dim;
                    return (
                      <button
                        key={dim}
                        type="button"
                        onClick={() => onChangeTipoMatrizPadrao && onChangeTipoMatrizPadrao(dim)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-300 hover:text-white hover:bg-slate-800"
                        }`}
                        title={RISK_MATRIX_MODELS[dim].titulo}
                      >
                        {dim}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Referências Normativas da Matriz Selecionada */}
              <div className="bg-slate-950/40 rounded-xl p-2.5 border border-slate-700/50 space-y-1.5">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1">
                  <Info className="h-3 w-3 text-blue-400" />
                  <span>Referências Normativas & Metodológicas Oficiais:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {RISK_MATRIX_MODELS[tipoMatrizPadrao].referenciasPrincipais.map((ref) => (
                    <span
                      key={ref.codigo}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${ref.corBadge} shadow-xs`}
                      title={ref.nome}
                    >
                      <span>{ref.codigo}</span>
                      <span className="opacity-80 text-[9px]">({ref.tipo})</span>
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed pt-0.5">
                  {RISK_MATRIX_MODELS[tipoMatrizPadrao].descricaoNormativa}
                </p>
              </div>
            </div>

            {/* Riscos Sugeridos por Inteligência de Contexto */}
            {selectedFuncaoId && sugestoesUnicas.length > 0 && (
              <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Sugestões Rápidas de Riscos para "{selectedFuncao?.func_nome}"</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sugestoesUnicas.map((risco) => {
                    const isSelected = riscosVinculados.includes(risco);
                    return (
                      <button
                        key={risco}
                        onClick={() => handleToggle(risco)}
                        className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-amber-200 dark:border-amber-800/80 hover:bg-amber-100/60 dark:hover:bg-amber-950/60 shadow-2xs"
                        }`}
                      >
                        {isSelected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        <span>{risco}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Riscos Vinculados à Função com Avaliação Matricial Completa */}
            {selectedFuncaoId && riscosVinculados.length > 0 && (
              <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-blue-200/60 dark:border-blue-900/60 pb-2">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Riscos Vinculados & Gradação na Matriz ({riscosVinculados.length})</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Clique no botão "Avaliar Matriz" para graduar Probabilidade × Severidade e definir as Normas
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {riscosVinculados.map((risco) => {
                    const avaliacao = avaliacoesDaFuncao[risco];
                    const catKey = Object.keys(RISKS_CATALOG).find((k) =>
                      RISKS_CATALOG[k].riscos.includes(risco)
                    );
                    const catObj = catKey ? RISKS_CATALOG[catKey] : null;

                    return (
                      <div
                        key={risco}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {catObj && (
                              <span
                                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white shadow-2xs"
                                style={{ backgroundColor: catObj.corHex }}
                              >
                                {catObj.titulo}
                              </span>
                            )}
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {risco}
                            </span>
                          </div>

                          {/* Se avaliado: Exibe badge de nível, score e normas */}
                          {avaliacao ? (
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                              <span
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-extrabold text-white shadow-2xs"
                                style={{ backgroundColor: avaliacao.nivelRiscoCorHex }}
                              >
                                <span>{avaliacao.nivelRiscoRotulo}</span>
                                <span className="opacity-90 font-medium">
                                  (Score: {avaliacao.nivelRiscoScore})
                                </span>
                              </span>

                              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                P: {avaliacao.probabilidadeRotulo || avaliacao.probabilidade} × S: {avaliacao.severidadeRotulo || avaliacao.severidade}
                              </span>

                              {/* Normas associadas */}
                              {avaliacao.normasComplementares && avaliacao.normasComplementares.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {avaliacao.normasComplementares.slice(0, 3).map((nc) => (
                                    <span
                                      key={nc}
                                      className="rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 text-[9px] font-bold"
                                    >
                                      {nc}
                                    </span>
                                  ))}
                                  {avaliacao.normasComplementares.length > 3 && (
                                    <span className="text-[9px] text-slate-400">
                                      +{avaliacao.normasComplementares.length - 3} normas
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                              <span>⚠️ Pendente de avaliação de Probabilidade × Severidade na matriz</span>
                            </div>
                          )}
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          {/* Botão de Como Coletar / Medir em Campo */}
                          <button
                            type="button"
                            onClick={() => setGuiaMedicaoState({ isOpen: true, termo: risco })}
                            className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 transition-all cursor-pointer active:scale-95"
                            title="Ver instruções de calibração, amostragem e medição deste risco"
                          >
                            <FlaskConical className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                            <span className="hidden sm:inline">Como Medir</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenMatrixModal(risco, catKey)}
                            className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                              avaliacao
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-xs ring-2 ring-blue-500/20"
                            }`}
                          >
                            <span>{avaliacao ? "✏️ Editar Gradação" : "🎯 Avaliar Matriz"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggle(risco)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 transition-colors"
                            title="Desvincular Risco"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Atalho Integrado: Inventário Químico da Função */}
            <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs flex-shrink-0">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>Inventário de Químicos & FDS ({vinculosQuimicosDaFuncao.length} vinculados à função)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {vinculosQuimicosDaFuncao.length > 0
                      ? `${vinculosQuimicosDaFuncao.map((v) => v.produtoNome).join(", ")}`
                      : "Identifique por foto ou vincule produtos químicos manipulados nesta função"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsScanModalOpen(true)}
                  className="flex-1 sm:flex-none inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 text-xs font-bold text-white shadow-xs hover:bg-red-700 active:scale-95 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Escanear Rótulo (IA)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubTab("quimicos")}
                  className="flex-1 sm:flex-none inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-slate-800 px-3 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 active:scale-95 transition-all shadow-2xs"
                >
                  <span>Abrir Inventário</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Categorias Oficiais com as Cores Regulamentares Exatas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {Object.values(RISKS_CATALOG).map((cat: RiskCategory) => {
                const isOutroOpen = !!showOutroInput[cat.key];
                const outroTexto = outroTextoInput[cat.key] || "";

                // Filtrar outros riscos já vinculados a esta função que correspondam a esta categoria
                const prefixoCat = `[${cat.titulo}] `;
                const outrosRiscosDestaCategoria = riscosVinculados.filter(
                  (r) => r.startsWith(prefixoCat) || (!Object.values(RISKS_CATALOG).some(c => c.riscos.includes(r)) && r.toLowerCase().includes(cat.key))
                );

                const handleAddOutroRisco = () => {
                  if (!selectedFuncaoId) {
                    onAlert("info", "Selecione uma função/cargo acima para vincular o risco.");
                    return;
                  }
                  if (!outroTexto.trim()) {
                    onAlert("info", `Descreva o outro risco para ${cat.titulo}.`);
                    return;
                  }
                  const riscoFormatado = `${prefixoCat}${outroTexto.trim()}`;
                  if (riscosVinculados.includes(riscoFormatado)) {
                    onAlert("info", "Este risco já está vinculado a esta função.");
                    return;
                  }
                  onToggleRisco(selectedFuncaoId, riscoFormatado);
                  setOutroTextoInput((prev) => ({ ...prev, [cat.key]: "" }));
                  setShowOutroInput((prev) => ({ ...prev, [cat.key]: false }));
                  onAlert("success", `Risco personalizado adicionado a ${cat.titulo}!`);
                };

                return (
                  <div
                    key={cat.key}
                    className={`rounded-2xl border p-3.5 shadow-2xs transition-all ${cat.corBgClass} ${cat.corBorderClass}`}
                  >
                    <div className="flex items-center justify-between border-b border-black/10 pb-2 mb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-3.5 w-3.5 min-w-[14px] min-h-[14px] max-w-[14px] max-h-[14px] rounded-full shrink-0 aspect-square ring-2 ring-white shadow-2xs"
                          style={{ backgroundColor: cat.corHex }}
                        />
                        <h3 className={`text-xs font-bold uppercase tracking-wider truncate ${cat.corTextClass}`}>
                          {cat.titulo}
                        </h3>
                      </div>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs shrink-0 whitespace-nowrap"
                        style={{ backgroundColor: cat.corHex }}
                      >
                        {cat.corNome}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {cat.riscos.map((risco) => {
                        const isSelected = riscosVinculados.includes(risco);
                        return (
                          <button
                            key={risco}
                            type="button"
                            onClick={() => handleToggle(risco)}
                            className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-left transition-all active:scale-95 cursor-pointer ${
                              isSelected
                                ? "bg-slate-900 text-white shadow-xs ring-2 ring-offset-1 ring-slate-900 font-bold"
                                : `${cat.corChipClass} border shadow-2xs`
                            }`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-blue-400" />}
                            <span>{risco}</span>
                          </button>
                        );
                      })}

                      {/* Exibir outros riscos personalizados cadastrados nesta categoria */}
                      {outrosRiscosDestaCategoria.map((riscoOutro) => (
                        <button
                          key={riscoOutro}
                          type="button"
                          onClick={() => handleToggle(riscoOutro)}
                          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold text-left bg-slate-900 text-white shadow-xs ring-2 ring-offset-1 ring-slate-900 cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          <span>{riscoOutro.replace(prefixoCat, "Outro: ")}</span>
                          <X className="h-3 w-3 ml-1 text-red-300 hover:text-red-100" />
                        </button>
                      ))}

                      {/* Botão de abrir "Outros" */}
                      {!isOutroOpen && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedFuncaoId) {
                              onAlert("info", "Selecione uma função/cargo acima para vincular os riscos.");
                              return;
                            }
                            setShowOutroInput((prev) => ({ ...prev, [cat.key]: true }));
                          }}
                          className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold border-2 border-dashed transition-all active:scale-95 cursor-pointer ${cat.corChipClass} opacity-90 hover:opacity-100`}
                        >
                          <Plus className="h-3.5 w-3.5 shrink-0" />
                          <span>Outros (Especificar)</span>
                        </button>
                      )}
                    </div>

                    {/* Formulário inline para escrever outro risco identificado */}
                    {isOutroOpen && (
                      <div className="mt-2 p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 shadow-xs space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Identificar Outro Risco ({cat.titulo}):
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowOutroInput((prev) => ({ ...prev, [cat.key]: false }))}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={outroTexto}
                            onChange={(e) =>
                              setOutroTextoInput((prev) => ({ ...prev, [cat.key]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddOutroRisco();
                              }
                            }}
                            placeholder={`Ex: Descrever risco ${cat.titulo.toLowerCase()} específico...`}
                            className="h-9 flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleAddOutroRisco}
                            className="h-9 px-3 rounded-lg bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                          >
                            Adicionar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 2: INVENTÁRIO & GESTÃO DE RISCOS QUÍMICOS            */}
        {/* ======================================================== */}
        {subTab === "quimicos" && (
          <div className="space-y-5">
            {/* SEÇÃO 1: PRODUTOS QUÍMICOS VINCULADOS À FUNÇÃO SELECIONADA */}
            <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-100 dark:border-red-900/60 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-900 dark:text-red-300 flex items-center gap-1.5">
                    <FlaskConical className="h-4 w-4 text-red-600" />
                    <span>Produtos Químicos Utilizados por "{selectedFuncao?.func_nome || "Função"}"</span>
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Defina tempo de uso diário, concentração e modo de aplicação para o laudo
                  </p>
                </div>

                <span className="rounded-full bg-red-600 text-white px-2.5 py-0.5 text-xs font-bold self-start sm:self-auto">
                  {vinculosQuimicosDaFuncao.length} Vinculados
                </span>
              </div>

              {vinculosQuimicosDaFuncao.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-white/70 dark:bg-slate-900/70 border border-red-100 dark:border-red-900/40 space-y-2">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Nenhum produto químico associado a este cargo até o momento.
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Selecione os produtos químicos no inventário abaixo ou clique em <strong>"Preencher com IA (Foto / CAS)"</strong> para cadastrar novos produtos.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vinculosQuimicosDaFuncao.map((vinc) => {
                    const prodInfo = produtosQuimicos.find((p) => p.id === vinc.produtoId);
                    return (
                      <div
                        key={vinc.produtoId}
                        className="rounded-xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 p-3.5 space-y-3 shadow-2xs"
                      >
                        {/* Topo do Card de Vínculo */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-red-600 flex-shrink-0" />
                              <span>{vinc.produtoNome}</span>
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {prodInfo?.nomeQuimico ? `${prodInfo.nomeQuimico} • ` : ""}
                              CAS: {vinc.cas || prodInfo?.cas || "Não especificado"} • Estado: {prodInfo?.estadoFisico || "Líquido"}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Botão Como Coletar este Produto */}
                            <button
                              type="button"
                              onClick={() => setGuiaMedicaoState({ isOpen: true, termo: vinc.produtoNome })}
                              className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-all cursor-pointer"
                              title="Ver instruções de amostragem (tubos, bombas, vazão, NR-15 e NIOSH) para este produto"
                            >
                              <FlaskConical className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                              <span>Como Medir</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleVinculo(prodInfo || ({ id: vinc.produtoId, nome: vinc.produtoNome } as any))}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 transition-all"
                              title="Desvincular produto desta função"
                            >
                              <X className="h-3 w-3" />
                              <span>Desvincular</span>
                            </button>
                          </div>
                        </div>

                        {/* Campos de Fácil Preenchimento: Tempo, Concentração, Modo de Uso e Via */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                          {/* Tempo de Exposição Diária */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3 text-red-500" />
                              <span>Tempo de Exposição Diária:</span>
                            </label>
                            <select
                              value={vinc.tempoExposicao || "Habitual e Permanente (6h a 8h/dia)"}
                              onChange={(e) => {
                                if (onUpdateVinculoProduto) {
                                  onUpdateVinculoProduto(selectedFuncaoId, {
                                    ...vinc,
                                    tempoExposicao: e.target.value,
                                  });
                                }
                              }}
                              className="h-8.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-red-500 focus:outline-none transition-all"
                            >
                              {OPCOES_TEMPO_EXPOSICAO.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Concentração / Diluição */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Droplets className="h-3 w-3 text-red-500" />
                              <span>Concentração / Diluição:</span>
                            </label>
                            <select
                              value={vinc.concentracao || "Puro / Concentrado (100%)"}
                              onChange={(e) => {
                                if (onUpdateVinculoProduto) {
                                  onUpdateVinculoProduto(selectedFuncaoId, {
                                    ...vinc,
                                    concentracao: e.target.value,
                                  });
                                }
                              }}
                              className="h-8.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-red-500 focus:outline-none transition-all"
                            >
                              {OPCOES_CONCENTRACAO.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Forma de Aplicação / Uso */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Forma de Aplicação / Atividade:
                            </label>
                            <select
                              value={vinc.formaUso || OPCOES_FORMA_USO[0]}
                              onChange={(e) => {
                                if (onUpdateVinculoProduto) {
                                  onUpdateVinculoProduto(selectedFuncaoId, {
                                    ...vinc,
                                    formaUso: e.target.value,
                                  });
                                }
                              }}
                              className="h-8.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-red-500 focus:outline-none transition-all"
                            >
                              {OPCOES_FORMA_USO.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Via de Exposição */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Via de Exposição Ocupacional:
                            </label>
                            <select
                              value={vinc.viaExposicao || OPCOES_VIA_EXPOSICAO[0]}
                              onChange={(e) => {
                                if (onUpdateVinculoProduto) {
                                  onUpdateVinculoProduto(selectedFuncaoId, {
                                    ...vinc,
                                    viaExposicao: e.target.value,
                                  });
                                }
                              }}
                              className="h-8.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-red-500 focus:outline-none transition-all"
                            >
                              {OPCOES_VIA_EXPOSICAO.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Informações de Proteção / EPI da FDS */}
                        {prodInfo?.episRecomendados && (
                          <div className="text-[10px] bg-red-50/70 dark:bg-red-950/40 p-2 rounded-lg text-slate-700 dark:text-slate-300 border border-red-100 dark:border-red-900/30">
                            <strong>EPIs da FDS:</strong> {prodInfo.episRecomendados}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SEÇÃO 2: INVENTÁRIO GERAL DE PRODUTOS QUÍMICOS DA EMPRESA */}
            <div className="space-y-3">
              <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <FlaskConical className="h-4 w-4 text-red-600" />
                    <span>Inventário Geral de Produtos Químicos ({produtosQuimicos.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Todos os produtos químicos presentes ou armazenados na empresa
                  </p>
                </div>

                {/* Botões de Ação do Inventário Padronizados em Grid de Largura Total */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={() => setIsScanModalOpen(true)}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Buscar com IA (Foto/CAS)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduto(null);
                      setIsFormModalOpen(true);
                    }}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Cadastrar Manual</span>
                  </button>

                  {onImportStandardChemicals && (
                    <button
                      type="button"
                      onClick={onImportStandardChemicals}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 text-xs sm:text-sm font-bold text-red-700 dark:text-red-300 hover:bg-red-100 transition-all shadow-2xs cursor-pointer"
                      title={`Carrega ou atualiza os ${CATALOGO_PRODUTOS_QUIMICOS.length} produtos químicos comuns e industriais`}
                    >
                      <DownloadCloud className="h-4 w-4" />
                      <span>Catálogo Rápido ({CATALOGO_PRODUTOS_QUIMICOS.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Barra de Busca no Inventário */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTermQuimico}
                  onChange={(e) => setSearchTermQuimico(e.target.value)}
                  placeholder="Pesquisar no inventário por nome, CAS (ex: 108-88-3), ONU ou fabricante..."
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-8 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-red-500 focus:outline-none transition-all"
                />
                {searchTermQuimico && (
                  <button
                    type="button"
                    onClick={() => setSearchTermQuimico("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Lista dos Produtos do Inventário */}
              {filteredProdutos.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 text-center space-y-3">
                  <FlaskConical className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {searchTermQuimico
                      ? `Nenhum produto químico encontrado para "${searchTermQuimico}"`
                      : "Nenhum produto químico cadastrado no inventário da empresa."}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsScanModalOpen(true)}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-red-700"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Identificar por Foto ou CAS</span>
                    </button>
                    {onImportStandardChemicals && (
                      <button
                        type="button"
                        onClick={onImportStandardChemicals}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 shadow-2xs"
                      >
                        <DownloadCloud className="h-3.5 w-3.5" />
                        <span>Carregar Catálogo Completo ({CATALOGO_PRODUTOS_QUIMICOS.length} Itens)</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredProdutos.map((prod) => {
                    const isVinculadoAFuncao = vinculosQuimicosDaFuncao.some((v) => v.produtoId === prod.id);

                    return (
                      <div
                        key={prod.id}
                        className={`rounded-2xl border p-3.5 space-y-2.5 transition-all shadow-2xs ${
                          isVinculadoAFuncao
                            ? "bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-900/60 ring-1 ring-red-400/30"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/40"
                        }`}
                      >
                        {/* Topo do Item */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {prod.nome}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {prod.nomeQuimico || "Substância Química"}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduto(prod);
                                setIsFormModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                              title="Editar Produto"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(prod.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/60 hover:text-red-600 transition-colors"
                              title="Excluir do Inventário"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Badges Técnicos */}
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          {prod.cas && (
                            <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-bold text-slate-700 dark:text-slate-300">
                              CAS: {prod.cas}
                            </span>
                          )}
                          {prod.onu && (
                            <span className="rounded-md bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 font-bold text-amber-800 dark:text-amber-300">
                              {prod.onu}
                            </span>
                          )}
                          <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 font-semibold text-blue-700 dark:text-blue-300">
                            {prod.estadoFisico}
                          </span>
                          {prod.fabricante && (
                            <span className="rounded-md bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-slate-600 dark:text-slate-400">
                              {prod.fabricante}
                            </span>
                          )}
                        </div>

                        {/* GHS & Perigos */}
                        {prod.classificacaoGhs && (
                          <p className="text-[10.5px] text-red-700 dark:text-red-300 line-clamp-2">
                            <strong>GHS:</strong> {prod.classificacaoGhs}
                          </p>
                        )}

                        {/* Botão de Vinculação Rápida à Função */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleToggleVinculo(prod)}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                              isVinculadoAFuncao
                                ? "bg-red-600 text-white shadow-xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/50"
                            }`}
                          >
                            {isVinculadoAFuncao ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Vinculado a "{selectedFuncao?.func_nome || "Função"}"</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5" />
                                <span>Vincular a "{selectedFuncao?.func_nome || "Função"}"</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setGuiaMedicaoState({ isOpen: true, termo: prod.nome })}
                            className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 transition-all cursor-pointer active:scale-95"
                            title="Ver guia prático de amostragem e calibração para este produto"
                          >
                            <FlaskConical className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Como Medir</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal do Guia Prático de Medições e Amostragens de Campo */}
      <GuiaMedicaoModal
        isOpen={guiaMedicaoState.isOpen}
        onClose={() => setGuiaMedicaoState({ isOpen: false, termo: "" })}
        initialSearch={guiaMedicaoState.termo}
      />

      {/* Modal de Avaliação na Matriz de Risco (PGR / GRO) */}
      {evaluatingRisk && (
        <RiskMatrixModal
          isOpen={!!evaluatingRisk}
          onClose={() => setEvaluatingRisk(null)}
          riscoNome={evaluatingRisk.riscoNome}
          funcaoNome={selectedFuncao?.func_nome}
          categoria={evaluatingRisk.categoria}
          avaliacaoAtual={evaluatingRisk.avaliacao || avaliacoesDaFuncao[evaluatingRisk.riscoNome] || null}
          matrizPadraoEmpresa={tipoMatrizPadrao}
          onSaveAvaliacao={handleSaveAvaliacao}
        />
      )}

      {/* Modal de Scanner / Busca com IA */}
      <QuimicoScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onApplyProduto={handleApplyScannedProduto}
        onAlert={onAlert}
      />

      {/* Modal de Cadastro / Edição Manual */}
      <QuimicoFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingProduto(null);
        }}
        onSave={handleSaveProduto}
        onDelete={onDeleteProdutoQuimico}
        initialData={editingProduto}
        onOpenScanner={() => {
          setIsFormModalOpen(false);
          setIsScanModalOpen(true);
        }}
      />

      {/* Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId && onDeleteProdutoQuimico) {
            onDeleteProdutoQuimico(deleteConfirmId);
            onAlert("info", "Produto químico excluído do inventário.");
          }
          setDeleteConfirmId(null);
        }}
        title="Excluir Produto Químico do Inventário?"
        message="O produto químico será removido do inventário da empresa e desvinculado de todas as funções."
        confirmLabel="Excluir Produto"
      />
    </div>
  );
};
