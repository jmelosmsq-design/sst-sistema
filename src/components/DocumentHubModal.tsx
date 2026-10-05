import React, { useState } from "react";
import {
  FileText,
  ShieldCheck,
  Award,
  HardHat,
  Flame,
  Activity,
  ShieldAlert,
  FileCheck,
  Download,
  Printer,
  ChevronRight,
  Filter,
  CheckCircle2,
  X,
  Building,
  User,
  Users,
  AlertCircle,
  Stethoscope,
  Heart,
} from "lucide-react";
import { Company, FuncaoData } from "../types";
import { generateLtcatPdf } from "../services/ltcatPdfGenerator";
import { generateOrdemServicoPdf, generateAllOrdensServicoConsolidado } from "../services/ordemServicoPdfGenerator";
import { generateFichaEpiPdf } from "../services/fichaEpiPdfGenerator";
import { generateLaudoInsalubridadePdf } from "../services/insalubridadePdfGenerator";
import { generatePcmsoDocumentoBasePdf } from "../services/pcmsoPdfGenerator";
import { gerarPDFEmpresa, gerarPDFAEP } from "../services/pdfGenerator";
import { generateConsolidatedDdsPdf } from "../services/ddsPdfGenerator";
import { generateConsolidatedPtPdf } from "../services/ptPdfGenerator";
import { generateESocialComplianceDossierPdf } from "../services/esocialPdfGenerator";
import { gerarPdfSrq20ConsolidadoPgr } from "../services/srq20PdfGenerator";

interface DocumentHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

export const DocumentHubModal: React.FC<DocumentHubModalProps> = ({
  isOpen,
  onClose,
  company,
  onAlert,
}) => {
  const [selectedFuncaoId, setSelectedFuncaoId] = useState<string>("all");
  const [nomeEmpregado, setNomeEmpregado] = useState<string>("");
  const [cpfEmpregado, setCpfEmpregado] = useState<string>("");
  const [matriculaEmpregado, setMatriculaEmpregado] = useState<string>("");
  const [dataAdmissao, setDataAdmissao] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "previdenciario" | "trabalhista" | "operacional">("all");

  if (!isOpen || !company) return null;

  const emp = company.empresa || {};
  const funcoes = company.funcoes || [];
  const selectedFuncao = funcoes.find((f) => f.id === selectedFuncaoId);

  const handleEmitirLtcat = () => {
    try {
      generateLtcatPdf(company, selectedFuncaoId === "all" ? undefined : selectedFuncaoId);
      onAlert("success", "LTCAT (Decreto 3.048/99 e IN 128) gerado com sucesso em PDF!");
    } catch (err: any) {
      onAlert("error", "Erro ao gerar LTCAT: " + (err?.message || "Tente novamente"));
    }
  };

  const handleEmitirOS = () => {
    if (funcoes.length === 0) {
      onAlert("info", "Cadastre ao menos uma função/cargo para emitir a Ordem de Serviço.");
      return;
    }
    try {
      if (selectedFuncao) {
        generateOrdemServicoPdf(company, selectedFuncao, {
          nomeEmpregado,
          cpfEmpregado,
          matricula: matriculaEmpregado,
          dataAdmissao,
        });
        onAlert("success", `Ordem de Serviço (NR-01) para ${selectedFuncao.func_nome} gerada com sucesso!`);
      } else {
        generateAllOrdensServicoConsolidado(company);
        onAlert("success", `Ordens de Serviço de todas as ${funcoes.length} funções geradas com sucesso!`);
      }
    } catch (err: any) {
      onAlert("error", "Erro ao gerar Ordem de Serviço: " + (err?.message || "Tente novamente"));
    }
  };

  const handleEmitirFichaEPI = () => {
    try {
      generateFichaEpiPdf(company, selectedFuncao, {
        nomeEmpregado,
        cpfEmpregado,
        matricula: matriculaEmpregado,
        dataAdmissao,
      });
      onAlert("success", "Ficha de Controle e Entrega de EPI (NR-06) gerada com sucesso em PDF!");
    } catch (err: any) {
      onAlert("error", "Erro ao gerar Ficha de EPI: " + (err?.message || "Tente novamente"));
    }
  };

  const handleEmitirInsalubridade = () => {
    try {
      generateLaudoInsalubridadePdf(company, selectedFuncaoId === "all" ? undefined : selectedFuncaoId);
      onAlert("success", "Laudo Técnico de Insalubridade (NR-15) gerado com sucesso!");
    } catch (err: any) {
      onAlert("error", "Erro ao gerar Laudo de Insalubridade: " + (err?.message || "Tente novamente"));
    }
  };

  const handleEmitirPcmso = () => {
    try {
      generatePcmsoDocumentoBasePdf(company);
      onAlert("success", "Documento Base do PCMSO (NR-07) gerado com sucesso em PDF!");
    } catch (err: any) {
      onAlert("error", "Erro ao gerar PCMSO: " + (err?.message || "Tente novamente"));
    }
  };

  const handleEmitirEsocialDossier = () => {
    try {
      generateESocialComplianceDossierPdf(
        company,
        company.esocialS2240 || [],
        company.esocialCats || [],
        company.asosRegistrados || []
      );
      onAlert("success", "Dossiê de Conformidade eSocial SST (S-2210/2220/2240) gerado em PDF!");
    } catch (err: any) {
      onAlert("error", "Erro ao gerar Dossiê eSocial: " + (err?.message || "Tente novamente"));
    }
  };

  const handleEmitirPgrRelatorio = () => {
    try {
      gerarPDFEmpresa(company);
      onAlert("success", "PGR / Relatório Técnico Completo de SST gerado com sucesso!");
    } catch (err: any) {
      onAlert("error", "Erro ao gerar PGR: " + (err?.message || "Tente novamente"));
    }
  };

  const handleEmitirAEP = () => {
    try {
      gerarPDFAEP(company);
      onAlert("success", "Relatório de AEP (NR-17) gerado com sucesso em PDF!");
    } catch (err: any) {
      onAlert("error", "Erro ao gerar AEP: " + (err?.message || "Tente novamente"));
    }
  };

  const handleEmitirDDS = () => {
    if (!company.ddsRegistros || company.ddsRegistros.length === 0) {
      onAlert("info", "Nenhuma reunião de DDS cadastrada nesta empresa.");
      return;
    }
    try {
      generateConsolidatedDdsPdf(company);
      onAlert("success", "Atas consolidadas de DDS geradas com sucesso!");
    } catch (err: any) {
      onAlert("error", "Erro ao gerar atas de DDS: " + (err?.message || "Tente novamente"));
    }
  };

  const handleEmitirPT = () => {
    if (!company.ptPermissoes || company.ptPermissoes.length === 0) {
      onAlert("info", "Nenhuma Permissão de Trabalho (PT) cadastrada nesta empresa.");
      return;
    }
    try {
      generateConsolidatedPtPdf(company);
      onAlert("success", "Permissões de Trabalho (PT/PET) geradas com sucesso!");
    } catch (err: any) {
      onAlert("error", "Erro ao gerar PT: " + (err?.message || "Tente novamente"));
    }
  };

  const documentCards = [
    {
      id: "ltcat",
      title: "LTCAT - Laudo Técnico Previdenciário",
      norm: "Decreto 3.048/99 • IN INSS 128 • eSocial S-2240",
      description:
        "Caracterização oficial para Aposentadoria Especial, eficácia de EPI (STF Tema 555), códigos GFIP e tabela 24 do eSocial.",
      category: "previdenciario",
      icon: <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      badge: "Previdenciário",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
      action: handleEmitirLtcat,
      actionText: "Emitir LTCAT (PDF)",
      colorBtn: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      id: "pgr",
      title: "PGR / GRO - Gerenciamento de Riscos",
      norm: "Norma Regulamentadora nº 01 (NR-01)",
      description:
        "Inventário geral de riscos ocupacionais, matrizes de severidade x probabilidade e Plano de Ação 5W2H completo.",
      category: "trabalhista",
      icon: <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      badge: "NR-01 GRO",
      badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
      action: handleEmitirPgrRelatorio,
      actionText: "Emitir PGR / GRO (PDF)",
      colorBtn: "bg-indigo-600 hover:bg-indigo-700 text-white",
    },
    {
      id: "pcmso",
      title: "PCMSO - Controle Médico Ocupacional",
      norm: "Norma Regulamentadora nº 07 (NR-07)",
      description:
        "Planejamento anual de saúde, protocolo de exames clínicos e complementares vinculados aos fatores de risco do PGR.",
      category: "previdenciario",
      icon: <Stethoscope className="h-5 w-5 text-teal-600 dark:text-teal-400" />,
      badge: "NR-07 Saúde",
      badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
      action: handleEmitirPcmso,
      actionText: "Emitir PCMSO (PDF)",
      colorBtn: "bg-teal-600 hover:bg-teal-700 text-white",
    },
    {
      id: "esocial_dossier",
      title: "Dossiê de Conformidade eSocial SST",
      norm: "Eventos S-2210 • S-2220 • S-2240",
      description:
        "Relatório técnico consolidado de conformidade legal previdenciária e cruzamento com agentes nocivos da Tabela 24.",
      category: "previdenciario",
      icon: <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      badge: "eSocial SST",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
      action: handleEmitirEsocialDossier,
      actionText: "Emitir Dossiê eSocial (PDF)",
      colorBtn: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      id: "os",
      title: "Ordem de Serviço de SST por Cargo",
      norm: "NR-01 Item 1.4.1 • Art. 157 da CLT",
      description:
        "Instruções de segurança, riscos do cargo, EPIs obrigatórios com C.A., medidas preventivas, proibições e termo de compromisso.",
      category: "operacional",
      icon: <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      badge: "Obrigatório",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
      action: handleEmitirOS,
      actionText: selectedFuncao ? `Emitir OS (${selectedFuncao.func_nome})` : "Emitir Ordens de Serviço",
      colorBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    {
      id: "ficha_epi",
      title: "Ficha de Controle e Entrega de EPI",
      norm: "NR-06 Item 6.5.1 • Art. 166 da CLT",
      description:
        "Ficha individual com termo de guarda e responsabilidade da NR-06, quadro de fornecimento com CA e assinaturas.",
      category: "operacional",
      icon: <HardHat className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      badge: "NR-06 EPI",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
      action: handleEmitirFichaEPI,
      actionText: "Emitir Ficha de EPI (PDF)",
      colorBtn: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    {
      id: "insalubridade",
      title: "Laudo Pericial de Insalubridade",
      norm: "NR-15 • Artigos 189 a 192 da CLT",
      description:
        "Avaliação dos 14 anexos da NR-15 para fixação ou descaracterização de adicionais de 10%, 20% ou 40%.",
      category: "trabalhista",
      icon: <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />,
      badge: "NR-15",
      badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
      action: handleEmitirInsalubridade,
      actionText: "Emitir Laudo NR-15 (PDF)",
      colorBtn: "bg-orange-600 hover:bg-orange-700 text-white",
    },
    {
      id: "aep",
      title: "AEP - Avaliação Ergonômica Preliminar",
      norm: "NR-17 • Portaria MTP 423/2021",
      description:
        "Análise ergonômica preliminar das condições de trabalho, posturas, mobiliário, repetitividade e cargas.",
      category: "trabalhista",
      icon: <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      badge: "NR-17",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
      action: handleEmitirAEP,
      actionText: "Emitir AEP NR-17 (PDF)",
      colorBtn: "bg-purple-600 hover:bg-purple-700 text-white",
    },
    {
      id: "srq20",
      title: "Diagnóstico de Riscos Psicossociais (SRQ-20)",
      norm: "NR-01 (1.5.3.2.1) • NR-17 • OMS",
      description:
        "Laudo estatístico consolidado de saúde mental e rastreamento de transtornos mentais comuns (SRQ-20) com estratificação por setor e sugestões para o PGR.",
      category: "trabalhista",
      icon: <Heart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      badge: `${company.srq20Avaliacoes?.length || 0} Avaliados`,
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
      action: () => {
        if (!company.srq20Avaliacoes || company.srq20Avaliacoes.length === 0) {
          onAlert("info", "Nenhuma avaliação SRQ-20 registrada ainda. Envie o link aos colaboradores ou preencha presencialmente.");
          return;
        }
        gerarPdfSrq20ConsolidadoPgr(company, company.srq20Avaliacoes);
        onAlert("success", "Laudo Consolidado SRQ-20 gerado com sucesso em PDF!");
      },
      actionText: "Emitir Laudo SRQ-20 (PDF)",
      colorBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    {
      id: "dds",
      title: "Atas de Diálogo Diário de Segurança (DDS)",
      norm: "NR-01 • NR-18 • NR-22 • NR-31",
      description:
        "Livro de atas consolidado com temas ministrados, data, horários e lista de assinaturas de presença dos trabalhadores.",
      category: "operacional",
      icon: <ShieldAlert className="h-5 w-5 text-teal-600 dark:text-teal-400" />,
      badge: `${company.ddsRegistros?.length || 0} Atas`,
      badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
      action: handleEmitirDDS,
      actionText: "Emitir Atas de DDS (PDF)",
      colorBtn: "bg-teal-600 hover:bg-teal-700 text-white",
    },
    {
      id: "pt",
      title: "Permissões de Trabalho (PT / PET)",
      norm: "NR-33 • NR-35 • NR-34 • NR-10",
      description:
        "Liberações e autorizações formais para trabalhos a quente, altura, espaço confinado e eletricidade com medições de gases.",
      category: "operacional",
      icon: <FileCheck className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />,
      badge: `${company.ptPermissoes?.length || 0} PTs`,
      badgeColor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
      action: handleEmitirPT,
      actionText: "Emitir PTs / PETs (PDF)",
      colorBtn: "bg-cyan-600 hover:bg-cyan-700 text-white",
    },
  ];

  const filteredCards =
    selectedCategory === "all"
      ? documentCards
      : documentCards.filter((c) => c.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Central de Emissão de Documentos e Laudos
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  Integrado
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gere e imprima laudos técnicos individuais a partir de uma única inserção de dados.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo do Hub */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Barra de Filtros e Personalização por Colaborador/Função */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 dark:border-blue-900/60 pb-2.5">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Filtro por Função e Dados do Colaborador (Para OS e Ficha de EPI)
              </span>
              <span className="text-[11px] text-blue-700 dark:text-blue-300">
                Empresa: <strong>{emp.emp_razao || "Empresa Atual"}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Cargo / Função Alvo
                </label>
                <select
                  value={selectedFuncaoId}
                  onChange={(e) => setSelectedFuncaoId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">Todas as Funções (Geral)</option>
                  {funcoes.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.func_nome} ({f.func_setor || "Geral"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Nome do Trabalhador (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={nomeEmpregado}
                  onChange={(e) => setNomeEmpregado(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  CPF do Trabalhador
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpfEmpregado}
                  onChange={(e) => setCpfEmpregado(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Matrícula / Admissão
                </label>
                <input
                  type="text"
                  placeholder="Matrícula ou Data"
                  value={matriculaEmpregado}
                  onChange={(e) => setMatriculaEmpregado(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Abas de Categorias */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
            {[
              { id: "all", label: "Todos os Documentos" },
              { id: "previdenciario", label: "Previdência & eSocial" },
              { id: "trabalhista", label: "Laudos & Programas (PGR/NRs)" },
              { id: "operacional", label: "Rotina & Operacional (OS/EPI/DDS)" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid de Cards de Documentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-4 shadow-2xs hover:border-blue-300 dark:hover:border-blue-800 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                        {card.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {card.title}
                        </h3>
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                          {card.norm}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    {card.description}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Pronto p/ emissão
                  </span>

                  <button
                    type="button"
                    onClick={card.action}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold shadow-2xs transition-transform active:scale-95 cursor-pointer ${card.colorBtn}`}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{card.actionText}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer do Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {funcoes.length} cargos avaliados • {company.setores.length} setores integrados
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
