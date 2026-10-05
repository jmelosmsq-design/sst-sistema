import React, { useState, useEffect } from "react";
import { X, Check, FlaskConical, ShieldAlert, Sparkles, AlertCircle, Trash2 } from "lucide-react";
import { ProdutoQuimicoItem } from "../types";
import { maskCAS, maskONU } from "../utils/masks";

interface QuimicoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (produto: ProdutoQuimicoItem) => void;
  onDelete?: (id: string) => void;
  initialData?: ProdutoQuimicoItem | null;
  onOpenScanner?: () => void;
}

export const QuimicoFormModal: React.FC<QuimicoFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  onOpenScanner,
}) => {
  const [formData, setFormData] = useState<Partial<ProdutoQuimicoItem>>({
    nome: "",
    nomeQuimico: "",
    cas: "",
    onu: "",
    fabricante: "",
    estadoFisico: "Líquido",
    classificacaoGhs: "",
    frasesPerigo: "",
    composicao: "",
    finalidadeUso: "",
    episRecomendados: "",
    fispqDisponivel: "Sim",
    medidasControle: "",
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setErrorMsg(null);
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nome: "",
        nomeQuimico: "",
        cas: "",
        onu: "",
        fabricante: "",
        estadoFisico: "Líquido",
        classificacaoGhs: "",
        frasesPerigo: "",
        composicao: "",
        finalidadeUso: "",
        episRecomendados: "",
        fispqDisponivel: "Sim",
        medidasControle: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.nome?.trim()) {
      setErrorMsg("Por favor, preencha o Nome Comercial do Produto Químico.");
      return;
    }

    const produtoSalvar: ProdutoQuimicoItem = {
      id: initialData?.id || `quim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      nome: formData.nome.trim(),
      nomeQuimico: (formData.nomeQuimico || "").trim(),
      cas: (formData.cas || "").trim(),
      onu: (formData.onu || "").trim(),
      fabricante: (formData.fabricante || "").trim(),
      estadoFisico: formData.estadoFisico || "Líquido",
      classificacaoGhs: (formData.classificacaoGhs || "").trim(),
      frasesPerigo: (formData.frasesPerigo || "").trim(),
      composicao: (formData.composicao || "").trim(),
      finalidadeUso: (formData.finalidadeUso || "").trim(),
      episRecomendados: (formData.episRecomendados || "").trim(),
      fispqDisponivel: formData.fispqDisponivel || formData.fdsDisponivel || "Sim",
      medidasControle: (formData.medidasControle || "").trim(),
    };

    onSave(produtoSalvar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl my-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[88vh]">
        {/* Header Fixo */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
              <FlaskConical className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {initialData ? "Editar Produto Químico do Inventário" : "Cadastrar Novo Produto Químico"}
              </h3>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Inventário da Empresa para PGR / NR-01 / NR-15 / GHS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenScanner && !initialData && (
              <button
                type="button"
                onClick={onOpenScanner}
                className="inline-flex items-center gap-1 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 px-2.5 py-1 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-100 transition-all shadow-2xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                <span>Preencher com IA</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Body com Rolagem Interna */}
        <form id="quimico-form" onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Nome Comercial / Produto */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Nome Comercial do Produto / Marca <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nome || ""}
              onChange={(e) => {
                setErrorMsg(null);
                setFormData({ ...formData, nome: e.target.value });
              }}
              placeholder="Ex: Thinner 5000, Hipoclorito de Sódio 2,5%, Solvente Mineral, Óleo Lubrificante 68..."
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
            />
          </div>

          {/* Nome Químico / Princípio Ativo e Fabricante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Nome Químico / Princípio Ativo
              </label>
              <input
                type="text"
                value={formData.nomeQuimico || ""}
                onChange={(e) => setFormData({ ...formData, nomeQuimico: e.target.value })}
                placeholder="Ex: Tolueno, Hidróxido de Sódio, Etanol..."
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Fabricante / Fornecedor
              </label>
              <input
                type="text"
                value={formData.fabricante || ""}
                onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
                placeholder="Ex: 3M, Ipiranga, Suvinil, Quimatic..."
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>
          </div>

          {/* CAS, ONU e Estado Físico */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Número CAS
              </label>
              <input
                type="text"
                value={formData.cas || ""}
                onChange={(e) => setFormData({ ...formData, cas: maskCAS(e.target.value) })}
                placeholder="Ex: 108-88-3"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Número ONU
              </label>
              <input
                type="text"
                value={formData.onu || ""}
                onChange={(e) => setFormData({ ...formData, onu: maskONU(e.target.value) })}
                placeholder="Ex: ONU 1263"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Estado Físico
              </label>
              <select
                value={formData.estadoFisico || "Líquido"}
                onChange={(e) => setFormData({ ...formData, estadoFisico: e.target.value as any })}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              >
                <option value="Líquido">Líquido</option>
                <option value="Sólido">Sólido</option>
                <option value="Gasoso">Gasoso</option>
                <option value="Aerossol/Névoa">Aerossol / Névoa</option>
                <option value="Pó/Granulado">Pó / Granulado</option>
                <option value="Gel/Pasta">Gel / Pasta</option>
              </select>
            </div>
          </div>

          {/* Classificação GHS / Perigos e Frases H */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Classificação GHS e Riscos Principais
            </label>
            <input
              type="text"
              value={formData.classificacaoGhs || ""}
              onChange={(e) => setFormData({ ...formData, classificacaoGhs: e.target.value })}
              placeholder="Ex: Inflamável (Cat. 2), Tóxico por Inalação, Irritação Cutânea, Corrosivo..."
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
            />
          </div>

          {/* Finalidade de Uso */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Finalidade de Uso / Aplicação na Empresa
            </label>
            <input
              type="text"
              value={formData.finalidadeUso || ""}
              onChange={(e) => setFormData({ ...formData, finalidadeUso: e.target.value })}
              placeholder="Ex: Desengraxe de peças, diluição de tintas, desinfecção de sanitários..."
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
            />
          </div>

          {/* EPIs Recomendados pela FDS */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              EPIs Recomendados (NR-06 / FDS)
            </label>
            <input
              type="text"
              value={formData.episRecomendados || ""}
              onChange={(e) => setFormData({ ...formData, episRecomendados: e.target.value })}
              placeholder="Ex: Luvas de borracha nitrílica, respirador com filtro VO, óculos de ampla visão, avental PVC..."
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
            />
          </div>

          {/* Medidas de Proteção Coletiva / FDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Medidas de Controle / EPCs
              </label>
              <input
                type="text"
                value={formData.medidasControle || ""}
                onChange={(e) => setFormData({ ...formData, medidasControle: e.target.value })}
                placeholder="Ex: Ventilação local exaustora, recipiente hermético, lava-olhos..."
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                FDS Disponível?
              </label>
              <select
                value={formData.fdsDisponivel || formData.fispqDisponivel || "Sim"}
                onChange={(e) => setFormData({ ...formData, fdsDisponivel: e.target.value, fispqDisponivel: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              >
                <option value="Sim">Sim (No Arquivo / Físico)</option>
                <option value="Digital">Sim (Formato Digital)</option>
                <option value="Pendente">Pendente de Obtenção</option>
                <option value="Não">Não</option>
              </select>
            </div>
          </div>
        </form>

        {/* Rodapé Fixo */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between flex-shrink-0">
          <div>
            {initialData && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialData.id);
                  onClose();
                }}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 text-xs sm:text-sm font-bold text-red-700 dark:text-red-300 hover:bg-red-100 transition-all active:scale-95 shadow-2xs"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="h-11 rounded-xl bg-red-600 px-5 text-xs sm:text-sm font-bold text-white hover:bg-red-700 active:scale-95 transition-all shadow-xs inline-flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              <span>Salvar no Inventário</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
