import React, { useState } from "react";
import {
  Flame,
  ShieldAlert,
  Zap,
  Bomb,
  Bike,
  Radio,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  Info,
  Building,
  Check,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  Company,
  FuncaoData,
  SetorData,
  Nr16AvaliacaoItem,
  Nr16StatusEnquadramento,
} from "../types";
import {
  NR16_ANEXOS,
  NR16_CARGOS_PRESETS,
  criarNr16AvaliacaoPadrao,
} from "../data/nr16Catalog";
import { PericulosidadeNR16Modal } from "./PericulosidadeNR16Modal";
import { gerarPDFLaudoPericulosidade } from "../services/pdfGenerator";
import { ConfirmModal } from "./ConfirmModal";

interface Nr16TabProps {
  company: Company;
  funcoes: FuncaoData[];
  setores: SetorData[];
  onSaveNr16: (avaliacao: Nr16AvaliacaoItem) => void;
  onDeleteNr16: (id: string) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

export const Nr16Tab: React.FC<Nr16TabProps> = ({
  company,
  funcoes,
  setores,
  onSaveNr16,
  onDeleteNr16,
  onAlert,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [selectedFuncaoForModal, setSelectedFuncaoForModal] = useState<FuncaoData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const avaliacoes = company.nr16Avaliacoes || [];

  // Estatísticas
  const totalFuncoes = funcoes.length;
  const avaliadasCount = avaliacoes.length;
  const caracterizadasCount = avaliacoes.filter((a) =>
    a.resultadoGlobal.includes("30%")
  ).length;
  const isentasCount = avaliacoes.filter((a) =>
    a.resultadoGlobal.includes("Isenção")
  ).length;
  const descaracterizadasCount = avaliacoes.filter(
    (a) => !a.resultadoGlobal.includes("30%") && !a.resultadoGlobal.includes("Isenção")
  ).length;
  const pendentesCount = Math.max(0, totalFuncoes - avaliadasCount);

  // Auto-preencher todas as funções pendentes com inteligência normativa
  const handleAutoPreencherTodas = () => {
    let preenchidas = 0;
    funcoes.forEach((func) => {
      const jaExiste = avaliacoes.some((a) => a.funcaoId === func.id);
      if (!jaExiste) {
        const nova = criarNr16AvaliacaoPadrao(
          func.id,
          func.func_nome,
          func.func_setor,
          func.func_descricao
        );
        onSaveNr16(nova);
        preenchidas++;
      }
    });

    if (preenchidas > 0) {
      onAlert("success", `${preenchidas} funções foram pré-preenchidas com inteligência da NR-16!`);
    } else {
      onAlert("info", "Todas as funções já possuem avaliação de periculosidade.");
    }
  };

  // Abrir Modal de Avaliação para uma função
  const handleOpenAvaliacao = (func: FuncaoData) => {
    setSelectedFuncaoForModal(func);
    setIsModalOpen(true);
  };

  // Exportar Laudo Geral em PDF
  const handleExportarLaudoGeral = () => {
    if (avaliacoes.length === 0) {
      onAlert("info", "Nenhuma avaliação concluída para gerar o laudo. Clique em 'Pré-preencher' ou avalie uma função.");
      return;
    }
    gerarPDFLaudoPericulosidade(company);
    onAlert("success", "Laudo Técnico Pericial de Periculosidade (NR-16) gerado com sucesso!");
  };

  // Filtragem das funções
  const filteredFuncoes = funcoes.filter((f) => {
    const matchesSearch =
      f.func_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.func_setor && f.func_setor.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    const av = avaliacoes.find((a) => a.funcaoId === f.id);

    if (filterStatus === "caracterizada") {
      return av && av.resultadoGlobal.includes("30%");
    }
    if (filterStatus === "descaracterizada") {
      return av && !av.resultadoGlobal.includes("30%") && !av.resultadoGlobal.includes("Isenção");
    }
    if (filterStatus === "isencao") {
      return av && av.resultadoGlobal.includes("Isenção");
    }
    if (filterStatus === "pendente") {
      return !av;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner & Header */}
      <div className="rounded-2xl bg-gradient-to-br from-red-900 via-rose-950 to-slate-900 p-4 sm:p-5 text-white shadow-xs border border-red-800/40 transition-colors">
        <div className="flex flex-col gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 backdrop-blur-xs border border-white/10">
              <Flame className="h-3.5 w-3.5 animate-pulse" />
              <span>NR-16 • Art. 193 da CLT</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Checklist e Laudo de Periculosidade
            </h1>
            <p className="text-xs sm:text-sm text-red-100/80 leading-relaxed">
              Avaliação pericial pormenorizada com pré-preenchimento normativo inteligente dos 6 Anexos
              (Inflamáveis, Eletricidade, Explosivos, Segurança, Motocicleta e Radiações).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleAutoPreencherTodas}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Auto Pré-Preencher Normas</span>
            </button>

            <button
              type="button"
              onClick={handleExportarLaudoGeral}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xs border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
            >
              <Download className="h-4 w-4 text-amber-300" />
              <span>Gerar Laudo Geral (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total de Funções</span>
            <Building className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{totalFuncoes}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{avaliadasCount} avaliadas</p>
        </div>

        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 dark:text-red-300">Caracterizadas (30%)</span>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-red-700 dark:text-red-400">{caracterizadasCount}</p>
          <p className="text-[11px] text-red-600/80 dark:text-red-400/80 mt-0.5">Ensejam adicional</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Descaracterizadas</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">{descaracterizadasCount}</p>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Sem risco periculoso</p>
        </div>

        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Isenções Normativas</span>
            <Info className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-blue-700 dark:text-blue-400">{isentasCount}</p>
          <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">Portaria 1.357/19</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por função ou setor..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterStatus("todos")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterStatus === "todos"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            Todas ({totalFuncoes})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("caracterizada")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterStatus === "caracterizada"
                ? "bg-red-600 text-white"
                : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100"
            }`}
          >
            Periculosas ({caracterizadasCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("descaracterizada")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterStatus === "descaracterizada"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
            }`}
          >
            Não Periculosas ({descaracterizadasCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("pendente")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterStatus === "pendente"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
            }`}
          >
            Pendentes ({pendentesCount})
          </button>
        </div>
      </div>

      {/* Lista de Funções & Avaliações */}
      <div className="space-y-3">
        {filteredFuncoes.length > 0 ? (
          filteredFuncoes.map((func) => {
            const av = avaliacoes.find((a) => a.funcaoId === func.id);
            const isCaracterizada = av?.resultadoGlobal.includes("30%");
            const isIsenta = av?.resultadoGlobal.includes("Isenção");
            const isAvaliadas = !!av;

            return (
              <div
                key={func.id}
                className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                      {func.func_nome}
                    </h3>
                    {func.func_setor && (
                      <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        {func.func_setor}
                      </span>
                    )}

                    {/* Status Badge */}
                    {isCaracterizada ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-950/80 px-2.5 py-0.5 text-xs font-extrabold text-red-700 dark:text-red-300 ring-1 ring-red-300 dark:ring-red-800">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Adicional 30% Caracterizado</span>
                      </span>
                    ) : isIsenta ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-950/80 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-800">
                        <Info className="h-3.5 w-3.5" />
                        <span>Isenção Legal (Portaria 1.357/19)</span>
                      </span>
                    ) : isAvaliadas ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-300 dark:ring-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Descaracterizada</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                        <span>Pendente de Avaliação</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {av?.parecerTecnicoConclusivo || func.func_descricao || "Sem descrição de atividades informada."}
                  </p>

                  {/* Anexos Caracterizados Chips */}
                  {av && av.anexosCaracterizados && av.anexosCaracterizados.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400">Anexos:</span>
                      {av.anexosCaracterizados.map((ax, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900"
                        >
                          {ax}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {av && (
                    <button
                      type="button"
                      onClick={() => gerarPDFLaudoPericulosidade(company, av)}
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                      title="Baixar Laudo Técnico desta função em PDF"
                    >
                      <Download className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </button>
                  )}

                  {av && (
                    <button
                      type="button"
                      onClick={() => setItemToDelete({ id: av.id, name: func.func_nome })}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Excluir avaliação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenAvaliacao(func)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>{isAvaliadas ? "Editar Checklist" : "Avaliar NR-16"}</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3">
            <ShieldAlert className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Nenhuma função encontrada
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Cadastre funções na aba "Funções" para realizar o enquadramento de periculosidade.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Avaliação NR-16 */}
      {selectedFuncaoForModal && (
        <PericulosidadeNR16Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFuncaoForModal(null);
          }}
          company={company}
          selectedFuncao={selectedFuncaoForModal}
          onSaveAvaliacao={(av) => {
            onSaveNr16(av);
          }}
          onAlert={onAlert}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Excluir Avaliação de Periculosidade"
        message={`Deseja realmente remover o laudo e checklist de periculosidade da função "${itemToDelete?.name}"?`}
        confirmLabel="Sim, Excluir"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (itemToDelete) {
            onDeleteNr16(itemToDelete.id);
            onAlert("success", "Avaliação de periculosidade removida!");
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
