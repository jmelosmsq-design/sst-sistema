import React, { useState } from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Camera,
  Upload,
  Trash2,
  Check,
  FileText,
  User,
  Calendar,
  Briefcase,
  Building,
  Sparkles,
} from "lucide-react";
import { AepItem, Company, FuncaoData, SetorData, FotoEvidencia } from "../types";
import {
  COUTO_OPERACIONAIS_ITEMS,
  COUTO_INFORMATIZADOS_ITEMS,
  calculateCoutoDiagnosis,
} from "../data/coutoChecklistCatalog";

interface CoutoChecklistViewProps {
  currentAep: AepItem;
  company: Company;
  funcoes: FuncaoData[];
  setores: SetorData[];
  onChangeAep: React.Dispatch<React.SetStateAction<AepItem | null>>;
  onUpdateOption: (itemId: string, valor: "sim" | "nao" | "na") => void;
  onAddPhoto: (dataUrl: string, legenda?: string) => void;
  onRemovePhoto: (photoId?: string) => void;
  onOpenPhotoInput: () => void;
  onOpenCam: () => void;
  onExportPdf: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const CoutoChecklistView: React.FC<CoutoChecklistViewProps> = ({
  currentAep,
  company,
  funcoes,
  setores,
  onChangeAep,
  onUpdateOption,
  onRemovePhoto,
  onOpenPhotoInput,
  onOpenCam,
  onExportPdf,
  onSave,
  onCancel,
}) => {
  const [showInstrucoes, setShowInstrucoes] = useState(false);
  const [novaRecomendacao, setNovaRecomendacao] = useState("");

  const respostas = currentAep.coutoRespostas || {};
  const diagnosis = calculateCoutoDiagnosis(respostas);

  const handleAddCustomRecomendacao = () => {
    if (!novaRecomendacao.trim()) return;
    onChangeAep((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        recomendacoes: [...(prev.recomendacoes || []), novaRecomendacao.trim()],
      };
    });
    setNovaRecomendacao("");
  };

  const handleRemoveRecomendacao = (index: number) => {
    onChangeAep((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        recomendacoes: (prev.recomendacoes || []).filter((_, i) => i !== index),
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Metodológico de Hudson Couto */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-md border border-indigo-500/30">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Activity className="h-3 w-3" />
              Metodologia de Triagem Ergonômica
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Checklist de Avaliação Ergonômica Preliminar — Hudson Couto
            </h3>
            <p className="text-xs text-indigo-200/90 leading-relaxed max-w-3xl">
              &quot;Deve ser aplicado, de forma objetiva, a cada posto de trabalho ou função. Não deve ser pensada na solução durante a aplicação do checklist, mas sim, após, na procura de melhorias junto à gerência.&quot;
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowInstrucoes(!showInstrucoes)}
            className="shrink-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-200 transition-colors"
            title="Instruções de aplicação"
          >
            {showInstrucoes ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {/* Instruções Detalhadas (Colapsável) */}
        {showInstrucoes && (
          <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-300 space-y-2 bg-black/20 p-3 rounded-xl">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Info className="h-4 w-4" />
              Orientações do Dr. Hudson Couto para Aplicação no Campo:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>Conheça previamente as tarefas e o fluxo produtivo do setor.</li>
              <li>Tire fotos do posto durante o trabalho normal para documentação técnica e evidência fotográfica.</li>
              <li>Responda <strong>SIM</strong> somente quando o fator de risco for nítido e caracterizar sobrecarga real.</li>
              <li>
                Após preencher, classifique as soluções encontradas: <strong>(a)</strong> baixo investimento, <strong>(b)</strong> solução conhecida, ou <strong>(c)</strong> estudo aprofundado (AET).
              </li>
            </ul>
          </div>
        )}

        {/* 2. Placar Dinâmico de Diagnóstico e Triagem */}
        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Total Respondidos</span>
            <span className="text-lg font-black text-white">{diagnosis.totalRespondidos} / 18</span>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
            <span className="block text-[10px] uppercase font-bold text-rose-300">Itens com Exigência (SIM)</span>
            <span className="text-lg font-black text-rose-400">{diagnosis.simCount}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="block text-[10px] uppercase font-bold text-emerald-300">Conformes (NÃO)</span>
            <span className="text-lg font-black text-emerald-400">{diagnosis.naoCount}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
            <span className="block text-[10px] uppercase font-bold text-indigo-300">Necessidade de AET</span>
            <span
              className={`text-xs font-black uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${
                diagnosis.necessidadeAET ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
              }`}
            >
              {diagnosis.necessidadeAET ? "AET Indicada" : "AEP Suficiente"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Identificação do Posto / Trabalhador (Mobile-First) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
          <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          Dados da Vistoria e Posto de Trabalho
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Função / Posto */}
          <div className="w-full">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Função / Posto de Trabalho:
            </label>
            <select
              value={currentAep.funcaoId || ""}
              onChange={(e) => {
                const f = funcoes.find((item) => item.id === e.target.value);
                if (f) {
                  const s = setores.find((sec) => sec.id === f.func_setor || sec.setor_nome === f.func_setor);
                  onChangeAep((prev) =>
                    prev
                      ? {
                          ...prev,
                          funcaoId: f.id,
                          funcaoNome: f.func_nome,
                          setorNome: s?.setor_nome || f.func_setor || prev.setorNome,
                          atividadesDescricao: f.func_descricao || prev.atividadesDescricao,
                        }
                      : prev
                  );
                }
              }}
              className="w-full h-11 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 text-slate-800 dark:text-slate-200"
            >
              <option value="">Selecione a função cadastrada...</option>
              {funcoes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.func_nome} ({f.func_setor})
                </option>
              ))}
            </select>
          </div>

          {/* Setor */}
          <div className="w-full">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Setor Avaliado:</label>
            <input
              type="text"
              value={currentAep.setorNome || ""}
              onChange={(e) => onChangeAep((prev) => (prev ? { ...prev, setorNome: e.target.value } : prev))}
              placeholder="Ex: Almoxarifado / Produção / Administrativo"
              className="w-full h-11 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Nome do Trabalhador / Entrevistado */}
          <div className="w-full">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Trabalhador(a) Avaliado(a):
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentAep.trabalhadorNome || ""}
                onChange={(e) => onChangeAep((prev) => (prev ? { ...prev, trabalhadorNome: e.target.value } : prev))}
                placeholder="Ex: João da Silva (ou Coletivo)"
                className="w-full h-11 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 pl-8 pr-3 text-slate-800 dark:text-slate-200"
              />
              <User className="h-4 w-4 text-slate-400 absolute left-2.5 top-3.5" />
            </div>
          </div>

          {/* Data da Avaliação */}
          <div className="w-full">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Data da Vistoria:</label>
            <div className="relative">
              <input
                type="date"
                value={currentAep.dataAvaliacao || ""}
                onChange={(e) => onChangeAep((prev) => (prev ? { ...prev, dataAvaliacao: e.target.value } : prev))}
                className="w-full h-11 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 pl-8 pr-3 text-slate-800 dark:text-slate-200"
              />
              <Calendar className="h-4 w-4 text-slate-400 absolute left-2.5 top-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. SEÇÃO 1: ATIVIDADES OPERACIONAIS EM GERAL (13 ITENS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-black">
                1
              </span>
              Atividades Operacionais em Geral (13 Itens)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Avalie as condições de postura, esforço, repetitividade e transporte de materiais.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {COUTO_OPERACIONAIS_ITEMS.map((item) => {
            const selected = respostas[item.id] || "nao";
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  selected === "sim"
                    ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 shadow-xs"
                    : selected === "na"
                    ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        Item {item.numero}
                      </span>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        {item.titulo}
                      </h5>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.descricao}
                    </p>
                  </div>
                </div>

                {/* Botões padronizados que preenchem toda a linha (Requisito do Usuário) */}
                <div className="grid grid-cols-3 gap-2 w-full mt-3">
                  <button
                    type="button"
                    onClick={() => onUpdateOption(item.id, "sim")}
                    className={`h-11 w-full flex items-center justify-center font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer ${
                      selected === "sim"
                        ? "bg-rose-600 text-white shadow-md ring-2 ring-rose-300 dark:ring-rose-500"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    }`}
                  >
                    SIM
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateOption(item.id, "nao")}
                    className={`h-11 w-full flex items-center justify-center font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer ${
                      selected === "nao"
                        ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300 dark:ring-emerald-500"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    }`}
                  >
                    NÃO
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateOption(item.id, "na")}
                    className={`h-11 w-full flex items-center justify-center font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer ${
                      selected === "na"
                        ? "bg-slate-700 text-white shadow-md ring-2 ring-slate-400 dark:ring-slate-500"
                        : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750"
                    }`}
                  >
                    N/A
                  </button>
                </div>

                {selected === "sim" && (
                  <div className="mt-2.5 p-2 rounded-xl bg-rose-100/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-800 dark:text-rose-200 flex items-start gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    <span>
                      <strong>Recomendação Técnica Sugerida:</strong> {item.recomendacaoSugerida}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. SEÇÃO 2: POSTOS DE TRABALHO INFORMATIZADOS (5 ITENS) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-700 text-white text-[11px] font-black">
                2
              </span>
              Postos de Trabalho Informatizados (5 Itens)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Avalie postos de trabalho com computadores, telas de vídeo, periféricos e conforto ambiental.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {COUTO_INFORMATIZADOS_ITEMS.map((item) => {
            const selected = respostas[item.id] || "nao";
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  selected === "sim"
                    ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 shadow-xs"
                    : selected === "na"
                    ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        Item {item.numero}
                      </span>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        {item.titulo}
                      </h5>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.descricao}
                    </p>
                  </div>
                </div>

                {/* Botões padronizados que preenchem toda a linha */}
                <div className="grid grid-cols-3 gap-2 w-full mt-3">
                  <button
                    type="button"
                    onClick={() => onUpdateOption(item.id, "sim")}
                    className={`h-11 w-full flex items-center justify-center font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer ${
                      selected === "sim"
                        ? "bg-rose-600 text-white shadow-md ring-2 ring-rose-300 dark:ring-rose-500"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    }`}
                  >
                    SIM
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateOption(item.id, "nao")}
                    className={`h-11 w-full flex items-center justify-center font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer ${
                      selected === "nao"
                        ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300 dark:ring-emerald-500"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    }`}
                  >
                    NÃO
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateOption(item.id, "na")}
                    className={`h-11 w-full flex items-center justify-center font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer ${
                      selected === "na"
                        ? "bg-slate-700 text-white shadow-md ring-2 ring-slate-400 dark:ring-slate-500"
                        : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750"
                    }`}
                  >
                    N/A
                  </button>
                </div>

                {selected === "sim" && (
                  <div className="mt-2.5 p-2 rounded-xl bg-rose-100/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-800 dark:text-rose-200 flex items-start gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    <span>
                      <strong>Recomendação Técnica Sugerida:</strong> {item.recomendacaoSugerida}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. CLASSIFICAÇÃO DAS MEDIDAS DE CORREÇÃO (HUDSON COUTO) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
          <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          Classificação das Medidas de Correção Ergonômica (Couto)
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Selecione o enquadramento metodológico da ação preventiva necessária para o posto:
        </p>

        {/* Botões padronizados que preenchem toda a linha */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
          <button
            type="button"
            onClick={() =>
              onChangeAep((prev) => (prev ? { ...prev, coutoClassificacaoMedida: "a" } : prev))
            }
            className={`min-h-[52px] w-full p-3 text-left rounded-xl border transition-all cursor-pointer ${
              (currentAep.coutoClassificacaoMedida || diagnosis.classificacaoMedidaSugerida) === "a"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-300 dark:ring-emerald-700"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            }`}
          >
            <div className="font-bold text-xs">(a) Baixo Investimento</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Situação passível de pequenas melhorias diretas ou baixo custo.
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              onChangeAep((prev) => (prev ? { ...prev, coutoClassificacaoMedida: "b" } : prev))
            }
            className={`min-h-[52px] w-full p-3 text-left rounded-xl border transition-all cursor-pointer ${
              (currentAep.coutoClassificacaoMedida || diagnosis.classificacaoMedidaSugerida) === "b"
                ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200 ring-2 ring-amber-300 dark:ring-amber-700"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            }`}
          >
            <div className="font-bold text-xs">(b) Solução Conhecida</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Solução já testada, sendo necessário replicá-la no posto.
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              onChangeAep((prev) => (prev ? { ...prev, coutoClassificacaoMedida: "c" } : prev))
            }
            className={`min-h-[52px] w-full p-3 text-left rounded-xl border transition-all cursor-pointer ${
              (currentAep.coutoClassificacaoMedida || diagnosis.classificacaoMedidaSugerida) === "c"
                ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 ring-2 ring-rose-300 dark:ring-rose-700"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            }`}
          >
            <div className="font-bold text-xs">(c) Aprofundamento (AET)</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Complexidade ergonômica que exige Análise Ergonômica do Trabalho.
            </div>
          </button>
        </div>
      </div>

      {/* 7. ANOTAÇÕES DETALHADAS DOS ITENS PONTUADOS */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Anotações Detalhadas dos Itens Pontuados:
        </label>
        <textarea
          rows={4}
          value={currentAep.coutoObservacoesDetalhadas || ""}
          onChange={(e) =>
            onChangeAep((prev) => (prev ? { ...prev, coutoObservacoesDetalhadas: e.target.value } : prev))
          }
          placeholder="Descreva detalhes específicos observados nos itens com resposta SIM (ex: Posição encurvada da coluna durante a paletização de caixas de 18 kg; monitor posicionado abaixo do eixo horizontal da visão)..."
          className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-3 text-slate-800 dark:text-slate-200"
        />
      </div>

      {/* 8. DOCUMENTAÇÃO FOTOGRÁFICA DO POSTO (Mobile-First) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
            <Camera className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Evidências Fotográficas do Posto de Trabalho
          </h4>
          <span className="text-[11px] font-bold text-slate-400">
            {(currentAep.fotos || []).length} fotos anexadas
          </span>
        </div>

        {/* Botões padronizados que preenchem toda a linha */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          <button
            type="button"
            onClick={onOpenCam}
            className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <Camera className="h-4 w-4" />
            <span>📱 Tirar Foto com Câmera</span>
          </button>

          <button
            type="button"
            onClick={onOpenPhotoInput}
            className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>🖼️ Carregar Foto da Galeria</span>
          </button>
        </div>

        {/* Grade de Fotos */}
        {currentAep.fotos && currentAep.fotos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {currentAep.fotos.map((foto, idx) => (
              <div
                key={foto.id || idx}
                className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800"
              >
                <img
                  src={foto.dataUrl}
                  alt={foto.legenda || "Evidência Ergonômica"}
                  className="w-full h-36 object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemovePhoto(foto.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white transition-colors"
                  title="Remover foto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <div className="p-2">
                  <input
                    type="text"
                    value={foto.legenda || ""}
                    onChange={(e) => {
                      const newLegenda = e.target.value;
                      onChangeAep((prev) => {
                        if (!prev) return prev;
                        const newFotos = [...(prev.fotos || [])];
                        newFotos[idx] = { ...newFotos[idx], legenda: newLegenda };
                        return { ...prev, fotos: newFotos };
                      });
                    }}
                    placeholder="Legenda da foto..."
                    className="w-full text-[11px] rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2 py-1 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 9. RECOMENDAÇÕES ERGONÔMICAS E MEDIDAS PREVENTIVAS */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Recomendações e Medidas de Melhoria Ergonômica
        </h4>

        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <input
            type="text"
            value={novaRecomendacao}
            onChange={(e) => setNovaRecomendacao(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCustomRecomendacao()}
            placeholder="Adicionar recomendação ergonômica personalizada..."
            className="flex-1 h-11 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 text-slate-800 dark:text-slate-200"
          />
          <button
            type="button"
            onClick={handleAddCustomRecomendacao}
            className="h-11 w-full sm:w-auto px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 inline-flex items-center justify-center gap-1.5 shadow-xs"
          >
            Adicionar
          </button>
        </div>

        {currentAep.recomendacoes && currentAep.recomendacoes.length > 0 ? (
          <div className="space-y-1.5 pt-1">
            {currentAep.recomendacoes.map((rec, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200"
              >
                <span className="flex items-start gap-2 flex-1">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold mt-0.5 shrink-0">
                    {i + 1}
                  </span>
                  <span>{rec}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveRecomendacao(i)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Nenhuma recomendação cadastrada ainda. Ao assinalar &quot;SIM&quot; nos itens do checklist, as medidas sugeridas por Couto aparecerão automaticamente aqui.
          </p>
        )}
      </div>

      {/* 10. AÇÕES PRINCIPAIS DE RODAPÉ (Mobile-First Padronizado) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onSave}
          className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-900/20 transition-all cursor-pointer"
        >
          <Check className="h-4 w-4" />
          <span>Salvar Avaliação</span>
        </button>

        <button
          type="button"
          onClick={onExportPdf}
          className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-900/20 transition-all cursor-pointer"
        >
          <FileText className="h-4 w-4" />
          <span>Gerar Laudo PDF (Couto)</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
        >
          <span>Cancelar</span>
        </button>
      </div>
    </div>
  );
};
