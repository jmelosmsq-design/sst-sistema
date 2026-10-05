import React, { useState } from "react";
import {
  Heart,
  QrCode,
  FileText,
  Plus,
  Users,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Trash2,
  Download,
  Share2,
  Building2,
  ShieldCheck,
  TrendingUp,
  Activity,
  X,
} from "lucide-react";
import { Company, Srq20AvaliacaoItem } from "../types";
import {
  SRQ20_PERGUNTAS,
  SRQ20_PONTO_DE_CORTE,
  classificarRiscoSetorialPgr,
  calcularClassificacaoSrq20,
} from "../data/srq20Catalog";
import { Srq20ShareModal } from "./Srq20ShareModal";
import {
  gerarPdfSrq20Individual,
  gerarPdfSrq20ConsolidadoPgr,
} from "../services/srq20PdfGenerator";

interface Srq20TabProps {
  company: Company;
  onUpdateCompany: (updated: Company) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

export const Srq20Tab: React.FC<Srq20TabProps> = ({
  company,
  onUpdateCompany,
  onAlert,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [selectedSetorFilter, setSelectedSetorFilter] = useState<string>("todos");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"todos" | "atencao" | "favoravel">("todos");

  // Presencial Interview Modal
  const [isPresencialModalOpen, setIsPresencialModalOpen] = useState<boolean>(false);
  const [presencialNome, setPresencialNome] = useState<string>("");
  const [presencialAnonimo, setPresencialAnonimo] = useState<boolean>(true);
  const [presencialSetor, setPresencialSetor] = useState<string>(
    company.setores[0]?.setor_nome || "Operacional"
  );
  const [presencialFuncao, setPresencialFuncao] = useState<string>(
    company.funcoes[0]?.func_nome || "GHE Padrão"
  );
  const [presencialIdade, setPresencialIdade] = useState<string>("");
  const [presencialSexo, setPresencialSexo] = useState<"Masculino" | "Feminino" | "Outro" | "">("");
  const [presencialRespostas, setPresencialRespostas] = useState<Record<number, boolean>>({});

  const avaliacoes = company.srq20Avaliacoes || [];

  // Filter evaluations
  const filteredAvaliacoes = avaliacoes.filter((item) => {
    if (selectedSetorFilter !== "todos" && item.setorNome !== selectedSetorFilter) {
      return false;
    }
    if (selectedStatusFilter === "atencao" && item.classificacao !== "Atenção Necessária") {
      return false;
    }
    if (selectedStatusFilter === "favoravel" && item.classificacao !== "Favorável") {
      return false;
    }
    return true;
  });

  // Calculate statistics
  const totalGeral = avaliacoes.length;
  const totalAtencao = avaliacoes.filter((a) => a.classificacao === "Atenção Necessária").length;
  const totalFavoravel = totalGeral - totalAtencao;
  const pctAtencao = totalGeral > 0 ? Math.round((totalAtencao / totalGeral) * 100) : 0;
  const pctFavoravel = 100 - pctAtencao;
  const nivelRiscoPgr = classificarRiscoSetorialPgr(pctAtencao);

  // Frequency of symptoms
  const topSintomas = SRQ20_PERGUNTAS.map((q) => {
    const count = avaliacoes.filter((a) => a.respostas[q.id] === true).length;
    const pct = totalGeral > 0 ? Math.round((count / totalGeral) * 100) : 0;
    return { ...q, count, pct };
  })
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);

  const handleDeleteItem = (id: string) => {
    if (!window.confirm("Deseja realmente excluir este registro de avaliação?")) return;
    const nextList = avaliacoes.filter((a) => a.id !== id);
    onUpdateCompany({
      ...company,
      srq20Avaliacoes: nextList,
    });
    onAlert("info", "Avaliação excluída com sucesso.");
  };

  const handleSavePresencial = () => {
    const answeredCount = Object.keys(presencialRespostas).length;
    if (answeredCount < 20) {
      onAlert("error", `Por favor, responda todas as 20 perguntas (Respondidas: ${answeredCount}/20).`);
      return;
    }

    const score = Object.values(presencialRespostas).filter((v) => v === true).length;
    const classificacao = calcularClassificacaoSrq20(score);

    const novoItem: Srq20AvaliacaoItem = {
      id: `srq_pres_${Date.now()}`,
      empresaId: company.id,
      empresaNome: company.empresa?.emp_razao || company.empresa?.emp_fantasia || "Empresa",
      setorNome: presencialSetor,
      funcaoNome: presencialFuncao,
      avaliadoNome: presencialAnonimo ? "Colaborador em Sigilo" : presencialNome || "Colaborador",
      avaliadoIdade: presencialIdade,
      avaliadoSexo: presencialSexo,
      anonimo: presencialAnonimo,
      respostas: presencialRespostas,
      pontuacao: score,
      classificacao,
      data: new Date().toISOString().split("T")[0],
      avaliadorNome: company.empresa?.emp_consultoria_tecnico || company.empresa?.emp_tecnico,
      avaliadorRegistro: company.empresa?.emp_consultoria_registro,
      origem: "presencial",
      createdAt: new Date().toISOString(),
    };

    onUpdateCompany({
      ...company,
      srq20Avaliacoes: [novoItem, ...avaliacoes],
    });

    onAlert("success", "Avaliação presencial registrada com sucesso!");
    setIsPresencialModalOpen(false);
    setPresencialRespostas({});
    setPresencialNome("");
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner & Header */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Riscos Psicossociais • SRQ-20
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  NR-01 & NR-17
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rastreamento de Transtornos Mentais Comuns (OMS) para PGR e AEP Ergonômica.
              </p>
            </div>
          </div>
        </div>

        {/* Legal notice box */}
        <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>Item 1.5.3.2.1 da NR-01:</strong> A organização deve considerar as condições de trabalho nos termos da NR-17, incluindo fatores cognitivos e psicossociais. O SRQ-20 subsidia o Inventário de Riscos e o Plano de Ação 5W2H do PGR.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Avaliados
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {totalGeral}
            </span>
            <span className="text-xs text-slate-400">colaboradores</span>
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Favorável (&lt; 7 pts)
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {totalFavoravel}
            </span>
            <span className="text-xs text-slate-400">({pctFavoravel}%)</span>
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
            Atenção (≥ 7 pts)
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-red-600 dark:text-red-400">
              {totalAtencao}
            </span>
            <span className="text-xs text-slate-400">({pctAtencao}%)</span>
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Risco Geral PGR
          </span>
          <div className="mt-1">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black ${
                nivelRiscoPgr === "Crítico" || nivelRiscoPgr === "Elevado"
                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                  : nivelRiscoPgr === "Médio"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              }`}
            >
              {nivelRiscoPgr.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS - ADAPTED FOR MOBILE WITH FULL-WIDTH BUTTONS AS REQUESTED */}
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <QrCode className="h-4.5 w-4.5" />
          <span>Gerar Link e QR Code para os Trabalhadores</span>
        </button>

        <button
          type="button"
          onClick={() => setIsPresencialModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all active:scale-98 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
          <span>Aplicar Questionário Presencialmente</span>
        </button>

        <button
          type="button"
          disabled={avaliacoes.length === 0}
          onClick={() =>
            gerarPdfSrq20ConsolidadoPgr(
              company,
              avaliacoes,
              selectedSetorFilter === "todos" ? undefined : selectedSetorFilter
            )
          }
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-md active:scale-98 disabled:opacity-40 cursor-pointer"
        >
          <FileText className="h-4.5 w-4.5" />
          <span>Emitir Laudo Consolidado para o PGR / AEP (PDF)</span>
        </button>
      </div>

      {/* FILTROS ADAPTADOS PARA CELULAR COM LARGURA COMPLETA */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Filtrar Avaliações</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Setor Homogêneo:
            </label>
            <select
              value={selectedSetorFilter}
              onChange={(e) => setSelectedSetorFilter(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Todos os Setores ({totalGeral})</option>
              {company.setores.map((s) => (
                <option key={s.id} value={s.setor_nome}>
                  {s.setor_nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Resultado SRQ-20:
            </label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Todas as Classificações</option>
              <option value="atencao">Apenas Atenção Necessária (≥ 7)</option>
              <option value="favoravel">Apenas Favorável (&lt; 7)</option>
            </select>
          </div>
        </div>
      </div>

      {/* TOP SINTOMAS RELATADOS (DIAGNÓSTICO ERGONÔMICO) */}
      {topSintomas.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Sintomas Mais Frequentes no Setor (Ranking SRQ-20)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Impacto no PGR</span>
          </div>

          <div className="space-y-2">
            {topSintomas.slice(0, 5).map((s, idx) => (
              <div key={s.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                    #{idx + 1}. {s.texto}
                  </span>
                  <span className="font-black text-red-600 dark:text-red-400 shrink-0">
                    {s.count} ({s.pct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${Math.min(100, s.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LISTA DE AVALIAÇÕES RECEBIDAS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Avaliações Registradas ({filteredAvaliacoes.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400">Sincronizado na nuvem</span>
        </div>

        {filteredAvaliacoes.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-3">
            <Heart className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Nenhuma avaliação encontrada com os filtros atuais.
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Clique em "Gerar Link e QR Code" para enviar aos colaboradores pelo WhatsApp ou realize a coleta presencial.
            </p>
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Enviar Link Agora
            </button>
          </div>
        ) : (
          filteredAvaliacoes.map((item) => {
            const isAtencao = item.classificacao === "Atenção Necessária";
            return (
              <div
                key={item.id}
                className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
              >
                {/* Header card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {item.anonimo ? "Trabalhador em Sigilo (Anônimo)" : item.avaliadoNome}
                      </h4>
                      {item.anonimo && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          LGPD
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Setor: <strong className="text-slate-700 dark:text-slate-200">{item.setorNome}</strong>
                      {item.funcaoNome ? ` • Função: ${item.funcaoNome}` : ""}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-black shrink-0 ${
                      isAtencao
                        ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}
                  >
                    {item.pontuacao}/20 • {item.classificacao}
                  </span>
                </div>

                {/* Details row */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <span>Data: {item.data ? item.data.split("-").reverse().join("/") : "N/I"}</span>
                  <span>Origem: {item.origem === "link_trabalhador" ? "Link Celular" : "Presencial"}</span>
                </div>

                {/* FULL WIDTH ACTION BUTTONS AS REQUESTED */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => gerarPdfSrq20Individual(company, item)}
                    className="w-full flex items-center justify-center gap-1.5 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Baixar PDF Individual</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="w-full sm:w-11 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-all cursor-pointer"
                    title="Excluir Registro"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sm:hidden">Excluir Registro</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SHARE MODAL */}
      <Srq20ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        company={company}
        onAlert={onAlert}
      />

      {/* PRESENCIAL ON-SITE EVALUATION MODAL */}
      {isPresencialModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Aplicar Questionário Presencialmente
                </h3>
              </div>
              <button
                onClick={() => setIsPresencialModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              {/* Informações do avaliado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Setor do Trabalhador:
                  </label>
                  <select
                    value={presencialSetor}
                    onChange={(e) => setPresencialSetor(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs"
                  >
                    {company.setores.map((s) => (
                      <option key={s.id} value={s.setor_nome}>
                        {s.setor_nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Função / Cargo:
                  </label>
                  <select
                    value={presencialFuncao}
                    onChange={(e) => setPresencialFuncao(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs"
                  >
                    {company.funcoes.map((f) => (
                      <option key={f.id} value={f.func_nome}>
                        {f.func_nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggle anonimato */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={presencialAnonimo}
                    onChange={(e) => setPresencialAnonimo(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600"
                  />
                  <span>Manter em Sigilo Anônimo (Recomendado)</span>
                </label>
              </div>

              {!presencialAnonimo && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Colaborador:
                  </label>
                  <input
                    type="text"
                    value={presencialNome}
                    onChange={(e) => setPresencialNome(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs"
                  />
                </div>
              )}

              {/* As 20 Perguntas */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase">
                  Perguntas (Últimos 30 Dias):
                </h4>

                {SRQ20_PERGUNTAS.map((p) => {
                  const val = presencialRespostas[p.id];
                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {p.id}. {p.texto}
                      </p>
                      {/* Botoes Sim / Nao ocupando toda a linha */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPresencialRespostas((prev) => ({ ...prev, [p.id]: true }))
                          }
                          className={`w-full py-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            val === true
                              ? "bg-red-600 text-white border-red-600"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          SIM
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPresencialRespostas((prev) => ({ ...prev, [p.id]: false }))
                          }
                          className={`w-full py-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            val === false
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          NÃO
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BOTAO FINALIZAR FULL WIDTH */}
              <button
                type="button"
                onClick={handleSavePresencial}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Salvar Avaliação Presencial</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
