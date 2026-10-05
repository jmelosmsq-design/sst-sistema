import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Copy,
  X,
  Building2,
  Calendar,
  Layers,
  Briefcase,
  AlertTriangle,
  Users,
  CheckSquare,
  Sparkles,
} from "lucide-react";
import { Company } from "../types";
import { maskCNPJ } from "../utils/masks";

export interface DuplicateCompanyOptions {
  sourceCompanyId: string;
  newName: string;
  newFantasia?: string;
  newCnpj?: string;
  newVistoriaDate?: string;
  includeFuncionarios?: boolean;
  includePlanoAcao?: boolean;
}

interface DuplicateCompanyModalProps {
  isOpen: boolean;
  sourceCompany: Company | null;
  onClose: () => void;
  onConfirm: (options: DuplicateCompanyOptions) => void;
}

export const DuplicateCompanyModal: React.FC<DuplicateCompanyModalProps> = ({
  isOpen,
  sourceCompany,
  onClose,
  onConfirm,
}) => {
  const [newName, setNewName] = useState("");
  const [newFantasia, setNewFantasia] = useState("");
  const [newCnpj, setNewCnpj] = useState("");
  const [newVistoriaDate, setNewVistoriaDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [includeFuncionarios, setIncludeFuncionarios] = useState(true);
  const [includePlanoAcao, setIncludePlanoAcao] = useState(true);

  useEffect(() => {
    if (isOpen && sourceCompany) {
      const origRazao =
        sourceCompany.empresa?.emp_razao ||
        sourceCompany.empresa?.emp_fantasia ||
        "Empresa";
      setNewName(`${origRazao} (Cópia)`);
      setNewFantasia(
        sourceCompany.empresa?.emp_fantasia
          ? `${sourceCompany.empresa.emp_fantasia} (Cópia)`
          : ""
      );
      setNewCnpj("");
      setNewVistoriaDate(new Date().toISOString().slice(0, 10));
      setIncludeFuncionarios(true);
      setIncludePlanoAcao(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, sourceCompany]);

  if (!isOpen || !sourceCompany) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newName.trim();
    if (!finalName) return;

    onConfirm({
      sourceCompanyId: sourceCompany.id,
      newName: finalName,
      newFantasia: newFantasia.trim() || undefined,
      newCnpj: newCnpj.trim() || undefined,
      newVistoriaDate: newVistoriaDate.trim() || undefined,
      includeFuncionarios,
      includePlanoAcao,
    });
    onClose();
  };

  const totalSetores = sourceCompany.setores?.length || 0;
  const totalFuncoes = sourceCompany.funcoes?.length || 0;
  const totalRiscos = Object.values(sourceCompany.riscos || {}).flat().length;
  const totalFuncionarios = sourceCompany.funcionarios?.length || 0;
  const totalPlano = sourceCompany.planoAcaoGlobal?.length || 0;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg my-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl transition-all space-y-4 text-left">
        {/* Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95 transition-all cursor-pointer"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-start gap-3.5 pr-6">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60 shadow-xs">
            <Copy className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Duplicar Empresa Completa
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Clona todos os setores, funções, riscos, EPIs, plano de ação e dados
              para você não precisar cadastrar tudo do zero.
            </p>
          </div>
        </div>

        {/* Resumo dos dados que serão copiados */}
        <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/30 p-3.5 space-y-2">
          <div className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Dados da Empresa Origem a serem duplicados:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-slate-800 px-2.5 py-1 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <Building2 className="h-3 w-3 text-blue-500" />
              {totalSetores} Setores
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-slate-800 px-2.5 py-1 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <Briefcase className="h-3 w-3 text-emerald-500" />
              {totalFuncoes} Funções / Cargos
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-slate-800 px-2.5 py-1 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              {totalRiscos} Riscos Mapeados
            </span>
            {totalPlano > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-slate-800 px-2.5 py-1 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                <CheckSquare className="h-3 w-3 text-purple-500" />
                {totalPlano} Ações (5W2H)
              </span>
            )}
            {totalFuncionarios > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-slate-800 px-2.5 py-1 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                <Users className="h-3 w-3 text-sky-500" />
                {totalFuncionarios} Trabalhadores
              </span>
            )}
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Razão Social / Nome da Nova Empresa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Empresa Filial / Unidade 02"
              className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome Fantasia (Opcional)
              </label>
              <input
                type="text"
                value={newFantasia}
                onChange={(e) => setNewFantasia(e.target.value)}
                placeholder="Ex: Filial 02"
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Novo CNPJ (Opcional)
              </label>
              <input
                type="text"
                value={newCnpj}
                onChange={(e) => setNewCnpj(maskCNPJ(e.target.value))}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Data da Nova Vistoria / Laudo</span>
            </label>
            <input
              type="date"
              value={newVistoriaDate}
              onChange={(e) => setNewVistoriaDate(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
            />
          </div>

          {/* Opções de Cópia */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              Opções de Clonagem:
            </span>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includePlanoAcao}
                onChange={(e) => setIncludePlanoAcao(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Duplicar itens do Plano de Ação (5W2H)</span>
            </label>

            {totalFuncionarios > 0 && (
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFuncionarios}
                  onChange={(e) => setIncludeFuncionarios(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  Duplicar lista de trabalhadores ({totalFuncionarios} funcionários)
                </span>
              </label>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-95 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!newName.trim()}
              className="w-full sm:w-auto h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Copy className="h-4 w-4" />
              <span>Duplicar Empresa Completa</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
