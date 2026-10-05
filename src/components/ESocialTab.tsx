import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  FileCode,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Download,
  Plus,
  Trash2,
  Edit,
  Eye,
  Copy,
  Settings,
  RefreshCw,
  Search,
  ExternalLink,
  Users,
  Building2,
  Flame,
  Stethoscope,
  Activity,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Printer,
  X,
} from "lucide-react";
import {
  Company,
  ESocialCatRegistro,
  ESocialS2240Registro,
  ESocialS2240Agente,
  PcmsoRegistroAso,
  ESocialConfig,
} from "../types";
import {
  TABELA_24_FATORES_RISCO,
  TABELA_27_PROCEDIMENTOS,
  TABELA_13_PARTE_CORPO,
  TABELA_14_AGENTE_CAUSADOR,
  TABELA_17_NATUREZA_LESAO,
  TABELA_23_UNIDADES_MEDIDA,
  mapearRiscoParaTabela24,
  mapearExameParaTabela27,
} from "../data/esocialCatalogs";
import {
  generateS2210Xml,
  generateS2220Xml,
  generateS2240Xml,
  downloadXmlFile,
  downloadBatchXmlFiles,
  sanitizeDoc,
} from "../services/esocialXmlGenerator";
import {
  generateCatPdf,
  generateESocialComplianceDossierPdf,
} from "../services/esocialPdfGenerator";

interface ESocialTabProps {
  company: Company;
  onUpdateCompany: (updated: Company) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

type ESocialSubTab = "dashboard" | "s2210" | "s2220" | "s2240" | "config";

export const ESocialTab: React.FC<ESocialTabProps> = ({
  company,
  onUpdateCompany,
  onAlert,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ESocialSubTab>("dashboard");
  const [searchFilter, setSearchFilter] = useState("");

  // Modais
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ESocialCatRegistro | null>(null);

  const [isS2240ModalOpen, setIsS2240ModalOpen] = useState(false);
  const [editingS2240, setEditingS2240] = useState<ESocialS2240Registro | null>(null);

  const [isXmlViewerOpen, setIsXmlViewerOpen] = useState(false);
  const [viewingXml, setViewingXml] = useState<{ title: string; xml: string; fileName: string } | null>(null);

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const emp = company.empresa || {};
  const funcoes = company.funcoes || [];
  const setores = company.setores || [];
  const asos = company.asosRegistrados || [];
  const cats = company.esocialCats || [];
  const s2240List = company.esocialS2240 || [];
  const config = company.esocialConfig || {
    tpAmb: "1",
    procEmi: "1",
    verProc: "2.5.0",
    tpInscTransmissor: "1",
    nrInscTransmissor: emp.emp_cnpj || "",
    responsavelTecnicoNome: emp.emp_tecnico || emp.emp_consultoria_tecnico || "Responsável Técnico SST",
    responsavelTecnicoCpf: emp.emp_cpf_resp || "00000000000",
    responsavelTecnicoConselho: "4", // CREA
    responsavelTecnicoNr: "000000",
    responsavelTecnicoUf: emp.emp_uf || "SP",
  };

  // Sincronizar / Auto-gerar S-2240 a partir dos cargos e riscos existentes
  const handleAutoGerarS2240 = () => {
    if (funcoes.length === 0) {
      onAlert("info", "Cadastre pelo menos uma função/cargo na aba 'Funções' para gerar o S-2240.");
      return;
    }

    const novosS2240: ESocialS2240Registro[] = funcoes.map((f) => {
      const setorObj = setores.find((s) => s.id === f.func_setor || s.setor_nome === f.func_setor);
      const riscosDaFuncao = company.riscos[f.id] || [];

      // Mapear riscos para agentes nocivos da Tabela 24
      const agentesNocivos: ESocialS2240Agente[] = [];
      if (riscosDaFuncao.length > 0) {
        riscosDaFuncao.forEach((nomeRisco) => {
          const tab24 = mapearRiscoParaTabela24(nomeRisco);
          agentesNocivos.push({
            codAgNoc: tab24.codigo,
            dscAgNoc: tab24.descricao,
            tpAval: tab24.codigo.startsWith("01.") ? "1" : "2",
            intConc: tab24.codigo === "01.01.001" ? "82.5" : undefined,
            limTol: tab24.codigo === "01.01.001" ? "85.0" : undefined,
            unMed: tab24.unidadePadrao || "3",
            tecMedicao: "NHO-01 / NR-15",
            utilizaEpc: f.func_epcs ? "1" : "0",
            utilizaEpi: f.func_epis ? "2" : "0",
            epis: f.func_epis
              ? [
                  {
                    ca: f.func_epis_ca || "12345",
                    descricao: f.func_epis,
                    eficaz: "S",
                    medidasProtecao: true,
                    condicoesFuncionamento: true,
                    usoIninterrupto: true,
                    prazoValidade: true,
                    periodicidadeTroca: true,
                    higienizacao: true,
                  },
                ]
              : undefined,
          });
        });
      } else {
        agentesNocivos.push({
          codAgNoc: "09.01.001",
          dscAgNoc: "Ausência de fator de risco ou atividades não enquadradas no Anexo IV do RPS",
          tpAval: "2",
          utilizaEpc: "0",
          utilizaEpi: "0",
        });
      }

      // Procura se já existia registro
      const exist = s2240List.find((item) => item.funcaoId === f.id);

      return {
        id: exist?.id || Math.random().toString(36).substring(2, 9),
        tipoEvento: "S-2240",
        funcaoId: f.id,
        funcaoNome: f.func_nome,
        setorNome: setorObj?.setor_nome || f.func_setor || "Geral",
        cbo: f.func_cbo || "",
        cpfTrabalhador: exist?.cpfTrabalhador || "",
        matriculaTrabalhador: exist?.matriculaTrabalhador || "",
        nomeTrabalhador: exist?.nomeTrabalhador || "",
        dtInicioCondicao: exist?.dtInicioCondicao || new Date().toISOString().slice(0, 10),
        descricaoAmbiente: exist?.descricaoAmbiente || `Ambiente de trabalho no setor ${setorObj?.setor_nome || f.func_setor || "Geral"} com edificação em alvenaria e ventilação adequada.`,
        descricaoAtividades: exist?.descricaoAtividades || f.func_descricao || "Execução das rotinas e atribuições do cargo conforme PGR.",
        agentesNocivos: exist?.agentesNocivos?.length ? exist.agentesNocivos : agentesNocivos,
        responsavelAmbiental: {
          cpf: config.responsavelTecnicoCpf || "00000000000",
          nome: config.responsavelTecnicoNome || "Responsável Técnico SST",
          ideOC: config.responsavelTecnicoConselho || "4",
          nrOC: config.responsavelTecnicoNr || "000000",
          ufOC: config.responsavelTecnicoUf || "SP",
        },
        statusEnvio: exist?.statusEnvio || "Validado",
        createdAt: exist?.createdAt || new Date().toISOString(),
      };
    });

    onUpdateCompany({
      ...company,
      esocialS2240: novosS2240,
    });
    onAlert("success", `${novosS2240.length} registros S-2240 sincronizados e prontos para geração de XML!`);
  };

  // Salvar CAT (S-2210)
  const handleSaveCat = (catData: ESocialCatRegistro) => {
    let updatedCats: ESocialCatRegistro[];
    const exists = cats.find((c) => c.id === catData.id);
    if (exists) {
      updatedCats = cats.map((c) => (c.id === catData.id ? catData : c));
    } else {
      updatedCats = [catData, ...cats];
    }
    onUpdateCompany({
      ...company,
      esocialCats: updatedCats,
    });
    setIsCatModalOpen(false);
    setEditingCat(null);
    onAlert("success", "CAT (Evento S-2210) cadastrada com sucesso!");
  };

  // Excluir CAT
  const handleDeleteCat = (catId: string) => {
    onUpdateCompany({
      ...company,
      esocialCats: cats.filter((c) => c.id !== catId),
    });
    onAlert("info", "CAT removida.");
  };

  // Salvar S-2240
  const handleSaveS2240 = (itemData: ESocialS2240Registro) => {
    let updatedList: ESocialS2240Registro[];
    const exists = s2240List.find((item) => item.id === itemData.id);
    if (exists) {
      updatedList = s2240List.map((item) => (item.id === itemData.id ? itemData : item));
    } else {
      updatedList = [...s2240List, itemData];
    }
    onUpdateCompany({
      ...company,
      esocialS2240: updatedList,
    });
    setIsS2240ModalOpen(false);
    setEditingS2240(null);
    onAlert("success", "Condição Ambiental S-2240 atualizada com sucesso!");
  };

  // Excluir S-2240
  const handleDeleteS2240 = (itemId: string) => {
    onUpdateCompany({
      ...company,
      esocialS2240: s2240List.filter((item) => item.id !== itemId),
    });
    onAlert("info", "Registro S-2240 removido.");
  };

  // Salvar Configurações
  const handleSaveConfig = (cfg: ESocialConfig) => {
    onUpdateCompany({
      ...company,
      esocialConfig: cfg,
    });
    setIsConfigModalOpen(false);
    onAlert("success", "Configurações do eSocial SST salvas com sucesso!");
  };

  // Gerar Lote Completo de XML (S-2210 + S-2220 + S-2240)
  const handleExportLoteXml = () => {
    const xmlFiles: { name: string; content: string }[] = [];

    // 1. S-2210 (CATs)
    cats.forEach((cat, idx) => {
      const res = generateS2210Xml(company, cat, config);
      xmlFiles.push({
        name: `S2210_CAT_${sanitizeDoc(cat.trabalhador.cpf)}_${idx + 1}.xml`,
        content: res.xml,
      });
    });

    // 2. S-2220 (ASOs do PCMSO)
    asos.forEach((aso, idx) => {
      const res = generateS2220Xml(company, aso, config);
      xmlFiles.push({
        name: `S2220_ASO_${sanitizeDoc(aso.cpf)}_${idx + 1}.xml`,
        content: res.xml,
      });
    });

    // 3. S-2240 (Condições Ambientais)
    s2240List.forEach((s2240, idx) => {
      const res = generateS2240Xml(company, s2240, config);
      const cleanName = s2240.funcaoNome.replace(/[^a-zA-Z0-9]/g, "_");
      xmlFiles.push({
        name: `S2240_${cleanName}_${idx + 1}.xml`,
        content: res.xml,
      });
    });

    if (xmlFiles.length === 0) {
      onAlert("info", "Nenhum evento do eSocial disponível para exportação. Cadastre funções no S-2240, ASOs ou CATs.");
      return;
    }

    downloadBatchXmlFiles(xmlFiles, `Lote_eSocial_SST_${sanitizeDoc(emp.emp_cnpj) || "Empresa"}`);
    onAlert("success", `Pacote com ${xmlFiles.length} arquivos XML do eSocial baixado com sucesso!`);
  };

  // Métricas do Dashboard
  const totalS2240 = s2240List.length;
  const totalS2220 = asos.length;
  const totalS2210 = cats.length;
  const totalEventos = totalS2240 + totalS2220 + totalS2210;

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Banner / Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              <span>Módulo eSocial SST Completo • Versão S-1.2 / S-1.3</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Gestão de Eventos SST para o eSocial
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Geração de arquivos XML oficiais, validação de conformidade técnica, emissão de CAT em PDF e sincronização direta com PGR, PCMSO e LTCAT.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportLoteXml}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-950/40 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Baixar Lote XML ({totalEventos})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                generateESocialComplianceDossierPdf(company, s2240List, cats, asos);
                onAlert("success", "Dossiê de Conformidade eSocial SST gerado em PDF!");
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-950/40 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Dossiê SST (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsConfigModalOpen(true)}
              className="flex items-center justify-center p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Configurações do eSocial"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">S-2240 (Ambiente)</span>
              <Building2 className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-1">{totalS2240}</p>
            <span className="text-[10px] text-slate-400 font-medium">Cargos mapeados</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">S-2220 (ASOs)</span>
              <Stethoscope className="h-4 w-4 text-teal-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-1">{totalS2220}</p>
            <span className="text-[10px] text-slate-400 font-medium">ASOs PCMSO</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">S-2210 (CATs)</span>
              <Flame className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-1">{totalS2210}</p>
            <span className="text-[10px] text-slate-400 font-medium">Acidentes registrados</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Ambiente eSocial</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-white mt-2">
              {config.tpAmb === "1" ? "1 - Produção" : "2 - Testes / Restrita"}
            </p>
            <span className="text-[10px] text-emerald-300 font-medium">Pronto p/ Envio</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveSubTab("dashboard")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "dashboard"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Painel de Conformidade</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("s2240")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "s2240"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>S-2240 (Condições Ambientais)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            {totalS2240}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("s2220")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "s2220"
              ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          <span>S-2220 (Saúde / ASO)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
            {totalS2220}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("s2210")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "s2210"
              ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Flame className="h-4 w-4" />
          <span>S-2210 (CAT - Acidentes)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
            {totalS2210}
          </span>
        </button>
      </div>

      {/* ========================================================
          ABA 1: DASHBOARD & PAINEL DE CONFORMIDADE
          ======================================================== */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-6">
          {/* Card de Ações Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400 mb-2">
                  <Building2 className="h-5 w-5" />
                  <h3 className="text-sm font-bold">1. Evento S-2240 (Ambiental)</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Gere os registros de riscos (Físicos, Químicos, Biológicos) ou Ausência de Riscos (09.01.001) para cada cargo a partir do seu PGR/LTCAT.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{totalS2240} cargos configurados</span>
                <button
                  type="button"
                  onClick={handleAutoGerarS2240}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Sincronizar PGR</span>
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-teal-600 dark:text-teal-400 mb-2">
                  <Stethoscope className="h-5 w-5" />
                  <h3 className="text-sm font-bold">2. Evento S-2220 (Saúde/ASO)</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Converte os ASOs e exames complementares cadastrados na aba PCMSO com os códigos da Tabela 27 do eSocial.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{totalS2220} ASOs prontos</span>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("s2220")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Ver ASOs</span>
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 mb-2">
                  <Flame className="h-5 w-5" />
                  <h3 className="text-sm font-bold">3. Evento S-2210 (CAT)</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Emissão completa de Comunicação de Acidente de Trabalho com geração do XML oficial e PDF em 4 vias regulamentares.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{totalS2210} CATs emitidas</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCat(null);
                    setIsCatModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Nova CAT</span>
                </button>
              </div>
            </div>
          </div>

          {/* Guia de Prazos Legais do eSocial */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Cronograma e Prazos Oficiais de Envio do eSocial SST</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">S-2210 (CAT)</div>
                <div className="text-amber-600 dark:text-amber-400 font-semibold">Até o 1º dia útil seguinte</div>
                <p className="text-slate-600 dark:text-slate-400">
                  Em caso de morte, o envio deve ser IMEDIATO. Acidentes típicos, de trajeto ou doenças ocupacionais com ou sem afastamento.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">S-2220 (ASO)</div>
                <div className="text-teal-600 dark:text-teal-400 font-semibold">Até o dia 15 do mês subsequente</div>
                <p className="text-slate-600 dark:text-slate-400">
                  Ao da realização do exame ocupacional (Admissional, Periódico, Retorno, Mudança de Risco ou Demissional).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">S-2240 (Condições Ambientais)</div>
                <div className="text-blue-600 dark:text-blue-400 font-semibold">Até o dia 15 do mês subsequente</div>
                <p className="text-slate-600 dark:text-slate-400">
                  À admissão do trabalhador ou da alteração do ambiente de trabalho, fatores de risco e implementação de EPI/EPC.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 2: S-2240 (CONDIÇÕES AMBIENTAIS)
          ======================================================== */}
      {activeSubTab === "s2240" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Eventos S-2240 - Condições Ambientais do Trabalho
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mapeamento de agentes nocivos (Tabela 24) e medidas de proteção (EPC/EPI) por função.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoGerarS2240}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Sincronizar com Funções/PGR</span>
              </button>
            </div>
          </div>

          {s2240List.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <Building2 className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Nenhum evento S-2240 gerado ainda
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                Clique no botão abaixo para gerar automaticamente todos os registros S-2240 a partir dos cargos e riscos cadastrados.
              </p>
              <button
                type="button"
                onClick={handleAutoGerarS2240}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 cursor-pointer"
              >
                Gerar S-2240 Automaticamente
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {s2240List.map((item) => {
                const xmlRes = generateS2240Xml(company, item, config);
                const hasErrors = xmlRes.issues.some((i) => i.tipo === "erro");

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                          S-2240
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {item.funcaoNome}
                        </h4>
                        <span className="text-xs text-slate-500 font-semibold">
                          • Setor: {item.setorNome}
                        </span>
                        {item.cbo && (
                          <span className="text-xs text-slate-500 font-mono">
                            • CBO: {item.cbo}
                          </span>
                        )}
                      </div>

                      {/* Agentes Nocivos Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {item.agentesNocivos.map((ag, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              ag.codAgNoc === "09.01.001"
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600"
                            }`}
                          >
                            {ag.codAgNoc} - {ag.dscAgNoc}
                          </span>
                        ))}
                      </div>

                      {hasErrors && (
                        <div className="text-[11px] text-red-600 dark:text-red-400 font-semibold flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>{xmlRes.issues[0]?.mensagem}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setViewingXml({
                            title: `S-2240 - ${item.funcaoNome}`,
                            xml: xmlRes.xml,
                            fileName: `S2240_${item.funcaoNome.replace(/\s+/g, "_")}.xml`,
                          });
                          setIsXmlViewerOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                        title="Ver código XML"
                      >
                        <FileCode className="h-3.5 w-3.5" />
                        <span>Ver XML</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadXmlFile(xmlRes.xml, `S2240_${item.funcaoNome.replace(/\s+/g, "_")}.xml`)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold cursor-pointer"
                        title="Baixar XML"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Baixar XML</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingS2240(item);
                          setIsS2240ModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                        title="Editar S-2240"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteS2240(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          ABA 3: S-2220 (SAÚDE / ASO)
          ======================================================== */}
      {activeSubTab === "s2220" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Eventos S-2220 - Monitoramento da Saúde do Trabalhador
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Geração de XML para ASOs e procedimentos médicos ocupacionais (Tabela 27).
                </p>
              </div>
            </div>
          </div>

          {asos.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <Stethoscope className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Nenhum ASO cadastrado na aba PCMSO
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                Cadastre atestados de saúde ocupacional na aba "PCMSO" para gerar automaticamente os eventos S-2220.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {asos.map((aso) => {
                const xmlRes = generateS2220Xml(company, aso, config);
                const hasErrors = xmlRes.issues.some((i) => i.tipo === "erro");

                return (
                  <div
                    key={aso.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs hover:border-teal-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-bold">
                          S-2220
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {aso.nomeEmpregado}
                        </h4>
                        <span className="text-xs text-slate-500 font-mono">
                          • CPF: {aso.cpf}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {aso.tipoAso}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span>Função: {aso.funcaoNome}</span>
                        <span>Data ASO: {aso.dataRealizacao}</span>
                        <span>Resultado: <strong className={aso.resultado === "Apto" ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>{aso.resultado}</strong></span>
                        <span>Médico: Dr(a). {aso.medicoExaminadorNome} (CRM {aso.medicoExaminadorCrm}/{aso.medicoExaminadorUf || "SP"})</span>
                      </div>

                      {hasErrors && (
                        <div className="text-[11px] text-red-600 dark:text-red-400 font-semibold flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>{xmlRes.issues[0]?.mensagem}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setViewingXml({
                            title: `S-2220 - ASO ${aso.nomeEmpregado}`,
                            xml: xmlRes.xml,
                            fileName: `S2220_${aso.nomeEmpregado.replace(/\s+/g, "_")}.xml`,
                          });
                          setIsXmlViewerOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        <FileCode className="h-3.5 w-3.5" />
                        <span>Ver XML</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadXmlFile(xmlRes.xml, `S2220_${aso.nomeEmpregado.replace(/\s+/g, "_")}.xml`)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 text-xs font-bold cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Baixar XML</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          ABA 4: S-2210 (CAT - ACIDENTE DE TRABALHO)
          ======================================================== */}
      {activeSubTab === "s2210" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Eventos S-2210 - Comunicação de Acidente de Trabalho (CAT)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cadastro de ocorrências de acidentes e geração do XML oficial e da Ficha de CAT em PDF.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingCat(null);
                setIsCatModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Cadastrar Nova CAT (S-2210)</span>
            </button>
          </div>

          {cats.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <Flame className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Nenhuma CAT registrada para esta empresa
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                Em caso de acidente típico, de trajeto ou doença ocupacional, cadastre a CAT imediatamente para envio ao eSocial dentro do prazo legal.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingCat(null);
                  setIsCatModalOpen(true);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-500 cursor-pointer"
              >
                + Cadastrar Primeira CAT
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {cats.map((cat) => {
                const xmlRes = generateS2210Xml(company, cat, config);
                const hasErrors = xmlRes.issues.some((i) => i.tipo === "erro");

                return (
                  <div
                    key={cat.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs hover:border-amber-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                          S-2210
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                          {cat.tipoCat === "1" ? "Inicial" : cat.tipoCat === "2" ? "Reabertura" : "Óbito"}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {cat.trabalhador.nome}
                        </h4>
                        <span className="text-xs text-slate-500 font-mono">
                          • CPF: {cat.trabalhador.cpf}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span>Data Acid.: {cat.dtAcidente} às {cat.hrAcidente}</span>
                        <span>Tipo: {cat.tpAcidente === "1" ? "Típico" : cat.tpAcidente === "2" ? "Doença" : "Trajeto"}</span>
                        <span>Parte Atingida: {cat.parteAtingida.dscParteAtingida}</span>
                        <span>CID-10: <strong className="font-mono text-slate-700 dark:text-slate-200">{cat.atestadoMedico.codCID}</strong></span>
                        <span>Afastamento: <strong className={cat.indAfastamento === "S" ? "text-amber-600 font-bold" : "text-slate-600"}>{cat.indAfastamento === "S" ? `${cat.atestadoMedico.durTrat} dias` : "Não"}</strong></span>
                      </div>

                      {hasErrors && (
                        <div className="text-[11px] text-red-600 dark:text-red-400 font-semibold flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>{xmlRes.issues[0]?.mensagem}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => generateCatPdf(company, cat, "Completa (Todas as 4 Vias)")}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold cursor-pointer"
                        title="Imprimir Ficha Oficial da CAT em PDF"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Ficha CAT (PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setViewingXml({
                            title: `S-2210 - CAT ${cat.trabalhador.nome}`,
                            xml: xmlRes.xml,
                            fileName: `S2210_${cat.trabalhador.nome.replace(/\s+/g, "_")}.xml`,
                          });
                          setIsXmlViewerOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        <FileCode className="h-3.5 w-3.5" />
                        <span>Ver XML</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadXmlFile(xmlRes.xml, `S2210_${cat.trabalhador.nome.replace(/\s+/g, "_")}.xml`)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Baixar XML</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingCat(cat);
                          setIsCatModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                        title="Editar CAT"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCat(cat.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        title="Excluir CAT"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODAL: VISUALIZADOR DE XML
          ======================================================== */}
      {isXmlViewerOpen && viewingXml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 text-white">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-blue-400" />
                <h3 className="text-sm font-bold">{viewingXml.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(viewingXml.xml);
                    onAlert("success", "Código XML copiado para a área de transferência!");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar XML</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadXmlFile(viewingXml.xml, viewingXml.fileName)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Baixar Arquivo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsXmlViewerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto font-mono text-xs text-emerald-400 bg-slate-950/80 leading-relaxed whitespace-pre selection:bg-blue-500 selection:text-white">
              {viewingXml.xml}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CADASTRO / EDIÇÃO DE CAT (S-2210)
          ======================================================== */}
      {isCatModalOpen && (
        <CatFormModal
          isOpen={isCatModalOpen}
          initialData={editingCat}
          company={company}
          onClose={() => {
            setIsCatModalOpen(false);
            setEditingCat(null);
          }}
          onSave={handleSaveCat}
        />
      )}

      {/* ========================================================
          MODAL: EDIÇÃO DETALHADA DE S-2240
          ======================================================== */}
      {isS2240ModalOpen && editingS2240 && (
        <S2240FormModal
          isOpen={isS2240ModalOpen}
          data={editingS2240}
          onClose={() => {
            setIsS2240ModalOpen(false);
            setEditingS2240(null);
          }}
          onSave={handleSaveS2240}
        />
      )}

      {/* ========================================================
          MODAL: CONFIGURAÇÕES DO ESOCIAL SST
          ======================================================== */}
      {isConfigModalOpen && (
        <ConfigFormModal
          isOpen={isConfigModalOpen}
          config={config}
          onClose={() => setIsConfigModalOpen(false)}
          onSave={handleSaveConfig}
        />
      )}
    </div>
  );
};

// ========================================================
// SUB-COMPONENTE: MODAL DE FORMULÁRIO DE CAT (S-2210)
// ========================================================
interface CatFormModalProps {
  isOpen: boolean;
  initialData: ESocialCatRegistro | null;
  company: Company;
  onClose: () => void;
  onSave: (data: ESocialCatRegistro) => void;
}

const CatFormModal: React.FC<CatFormModalProps> = ({
  isOpen,
  initialData,
  company,
  onClose,
  onSave,
}) => {
  const emp = company.empresa || {};
  const funcoes = company.funcoes || [];

  const [tipoCat, setTipoCat] = useState<"1" | "2" | "3">(initialData?.tipoCat || "1");
  const [nrRecCatOrigem, setNrRecCatOrigem] = useState(initialData?.nrRecCatOrigem || "");
  const [nomeTrab, setNomeTrab] = useState(initialData?.trabalhador.nome || "");
  const [cpfTrab, setCpfTrab] = useState(initialData?.trabalhador.cpf || "");
  const [matriculaTrab, setMatriculaTrab] = useState(initialData?.trabalhador.matricula || "000001");
  const [funcaoId, setFuncaoId] = useState(initialData?.trabalhador.funcaoId || (funcoes[0]?.id || ""));
  const [dtNascTrab, setDtNascTrab] = useState(initialData?.trabalhador.dataNascimento || "1990-01-01");
  const [sexoTrab, setSexoTrab] = useState<"M" | "F">(initialData?.trabalhador.sexo || "M");

  const [dtAcid, setDtAcid] = useState(initialData?.dtAcidente || new Date().toISOString().slice(0, 10));
  const [hrAcid, setHrAcid] = useState(initialData?.hrAcidente || "08:30");
  const [hrsTrabAntes, setHrsTrabAntes] = useState(initialData?.hrsTrabAntesAcidente || "0200");
  const [tpAcid, setTpAcid] = useState<"1" | "2" | "3">(initialData?.tpAcidente || "1");
  const [indAfast, setIndAfast] = useState<"S" | "N">(initialData?.indAfastamento || "N");
  const [indMorte, setIndMorte] = useState<"S" | "N">(initialData?.indMorte || "N");
  const [dtObito, setDtObito] = useState(initialData?.dtObito || "");
  const [houvePolicia, setHouvePolicia] = useState<"S" | "N">(initialData?.houvePolicia || "N");

  const [tpLocal, setTpLocal] = useState<"1" | "2" | "3" | "4" | "5" | "6" | "9">(initialData?.localAcidente.tpLocal || "1");
  const [dscLocal, setDscLocal] = useState(initialData?.localAcidente.dscLocal || "Setor Operacional / Produção");
  const [dscLogradouro, setDscLogradouro] = useState(initialData?.localAcidente.dscLogradouro || emp.emp_endereco || "");
  const [nrLogradouro, setNrLogradouro] = useState(initialData?.localAcidente.nrLogradouro || "100");
  const [bairro, setBairro] = useState(initialData?.localAcidente.bairro || emp.emp_bairro || "");
  const [cep, setCep] = useState(initialData?.localAcidente.cep || emp.emp_cep || "");
  const [uf, setUf] = useState(initialData?.localAcidente.uf || emp.emp_uf || "SP");

  const [codParteAtingida, setCodParteAtingida] = useState(initialData?.parteAtingida.codParteAtingida || TABELA_13_PARTE_CORPO[0].codigo);
  const [lateralidade, setLateralidade] = useState<"0" | "1" | "2" | "3">(initialData?.parteAtingida.lateralidade || "0");

  const [codAgenteCausador, setCodAgenteCausador] = useState(initialData?.agenteCausador.codAgenteCausador || TABELA_14_AGENTE_CAUSADOR[0].codigo);

  const [dtAtend, setDtAtend] = useState(initialData?.atestadoMedico.dtAtendimento || new Date().toISOString().slice(0, 10));
  const [hrAtend, setHrAtend] = useState(initialData?.atestadoMedico.hrAtendimento || "09:00");
  const [indInternacao, setIndInternacao] = useState<"S" | "N">(initialData?.atestadoMedico.indInternacao || "N");
  const [durTrat, setDurTrat] = useState<number>(initialData?.atestadoMedico.durTrat || 0);
  const [codLesao, setCodLesao] = useState(initialData?.atestadoMedico.codLesao || TABELA_17_NATUREZA_LESAO[0].codigo);
  const [codCID, setCodCID] = useState(initialData?.atestadoMedico.codCID || "S61.0");
  const [diagProvavel, setDiagProvavel] = useState(initialData?.atestadoMedico.diagnosticoProvavel || "Ferimento no membro");
  const [medicoNome, setMedicoNome] = useState(initialData?.atestadoMedico.medicoNome || "Dr. Médico Assistente");
  const [medicoNrOC, setMedicoNrOC] = useState(initialData?.atestadoMedico.medicoNrOC || "123456");
  const [medicoUfOC, setMedicoUfOC] = useState(initialData?.atestadoMedico.medicoUfOC || emp.emp_uf || "SP");

  const selectedFuncao = funcoes.find((f) => f.id === funcaoId);
  const selectedParte = TABELA_13_PARTE_CORPO.find((p) => p.codigo === codParteAtingida);
  const selectedAgente = TABELA_14_AGENTE_CAUSADOR.find((a) => a.codigo === codAgenteCausador);
  const selectedLesao = TABELA_17_NATUREZA_LESAO.find((l) => l.codigo === codLesao);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const catData: ESocialCatRegistro = {
      id: initialData?.id || Math.random().toString(36).substring(2, 9),
      tipoEvento: "S-2210",
      tipoCat,
      nrRecCatOrigem: tipoCat !== "1" ? nrRecCatOrigem : undefined,
      dtAcidente: dtAcid,
      hrAcidente: hrAcid,
      hrsTrabAntesAcidente: hrsTrabAntes,
      tpAcidente: tpAcid,
      indAfastamento: indAfast,
      indMorte,
      dtObito: indMorte === "S" ? dtObito : undefined,
      houvePolicia,
      localAcidente: {
        tpLocal,
        dscLocal,
        dscLogradouro,
        nrLogradouro,
        bairro,
        cep,
        uf,
      },
      parteAtingida: {
        codParteAtingida,
        dscParteAtingida: selectedParte?.descricao || "Parte do corpo",
        lateralidade,
      },
      agenteCausador: {
        codAgenteCausador,
        dscAgenteCausador: selectedAgente?.descricao || "Agente causador",
      },
      atestadoMedico: {
        dtAtendimento: dtAtend,
        hrAtendimento: hrAtend,
        indInternacao,
        durTrat,
        indAfastamento: indAfast,
        codLesao,
        dscLesao: selectedLesao?.descricao || "Lesão",
        diagnosticoProvavel: diagProvavel,
        codCID: codCID.toUpperCase(),
        medicoNome,
        medicoIdeOC: "1", // CRM
        medicoNrOC,
        medicoUfOC,
      },
      trabalhador: {
        nome: nomeTrab,
        cpf: cpfTrab,
        matricula: matriculaTrab,
        funcaoId,
        funcaoNome: selectedFuncao?.func_nome || "Operacional",
        cbo: selectedFuncao?.func_cbo || "",
        dataNascimento: dtNascTrab,
        sexo: sexoTrab,
      },
      statusEnvio: "Validado",
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(catData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl my-8 flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
            <Flame className="h-6 w-6" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {initialData ? "Editar CAT (Evento S-2210)" : "Nova Comunicação de Acidente de Trabalho (S-2210)"}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Seção 1: Tipo de CAT e Trabalhador */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b pb-1">
              1. Identificação da CAT e do Trabalhador Acidentado
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Tipo de CAT</label>
                <select
                  value={tipoCat}
                  onChange={(e: any) => setTipoCat(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-medium"
                >
                  <option value="1">1 - Inicial</option>
                  <option value="2">2 - Reabertura</option>
                  <option value="3">3 - Comunicação de Óbito</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Nome Completo do Trabalhador *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Silva"
                  value={nomeTrab}
                  onChange={(e) => setNomeTrab(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">CPF do Trabalhador *</label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={cpfTrab}
                  onChange={(e) => setCpfTrab(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-medium font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Matrícula no eSocial</label>
                <input
                  type="text"
                  placeholder="Ex: 000123"
                  value={matriculaTrab}
                  onChange={(e) => setMatriculaTrab(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Função / Cargo</label>
                <select
                  value={funcaoId}
                  onChange={(e) => setFuncaoId(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-medium"
                >
                  {funcoes.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.func_nome} (CBO: {f.func_cbo || "N/I"})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Seção 2: Dados do Acidente */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b pb-1">
              2. Dados do Acidente e Local da Ocorrência
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold mb-1">Data do Acidente</label>
                <input
                  type="date"
                  required
                  value={dtAcid}
                  onChange={(e) => setDtAcid(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Hora do Acidente</label>
                <input
                  type="time"
                  required
                  value={hrAcid}
                  onChange={(e) => setHrAcid(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Tipo de Acidente</label>
                <select
                  value={tpAcid}
                  onChange={(e: any) => setTpAcid(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 font-medium"
                >
                  <option value="1">1 - Típico</option>
                  <option value="2">2 - Doença</option>
                  <option value="3">3 - Trajeto</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Houve Afastamento?</label>
                <select
                  value={indAfast}
                  onChange={(e: any) => setIndAfast(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 font-medium"
                >
                  <option value="N">Não</option>
                  <option value="S">Sim</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Tipo do Local do Acidente</label>
                <select
                  value={tpLocal}
                  onChange={(e: any) => setTpLocal(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-medium"
                >
                  <option value="1">1 - Estabelecimento do empregador no Brasil</option>
                  <option value="2">2 - Estabelecimento de terceiros</option>
                  <option value="3">3 - Via pública</option>
                  <option value="4">4 - Área rural</option>
                  <option value="9">9 - Outros</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Descrição do Local</label>
                <input
                  type="text"
                  value={dscLocal}
                  onChange={(e) => setDscLocal(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Parte do Corpo e Agente Causador */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b pb-1">
              3. Parte do Corpo Atingida e Agente Causador (Tabelas do eSocial)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Parte do Corpo Atingida (Tabela 13)</label>
                <select
                  value={codParteAtingida}
                  onChange={(e) => setCodParteAtingida(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-medium"
                >
                  {TABELA_13_PARTE_CORPO.map((p) => (
                    <option key={p.codigo} value={p.codigo}>
                      {p.descricao} ({p.grupo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Lateralidade</label>
                <select
                  value={lateralidade}
                  onChange={(e: any) => setLateralidade(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-medium"
                >
                  <option value="0">0 - Não aplicável</option>
                  <option value="1">1 - Esquerda</option>
                  <option value="2">2 - Direita</option>
                  <option value="3">3 - Ambas</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold mb-1">Agente Causador do Acidente (Tabela 14/15)</label>
                <select
                  value={codAgenteCausador}
                  onChange={(e) => setCodAgenteCausador(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-medium"
                >
                  {TABELA_14_AGENTE_CAUSADOR.map((a) => (
                    <option key={a.codigo} value={a.codigo}>
                      {a.descricao} ({a.grupo})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Seção 4: Atestado Médico e CID */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b pb-1">
              4. Laudo / Atestado Médico e Diagnóstico (Tabela 17 & CID-10)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Natureza da Lesão (Tabela 17)</label>
                <select
                  value={codLesao}
                  onChange={(e) => setCodLesao(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-medium"
                >
                  {TABELA_17_NATUREZA_LESAO.map((l) => (
                    <option key={l.codigo} value={l.codigo}>
                      {l.descricao} ({l.grupo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Código CID-10 *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: S61.0, T14.0"
                  value={codCID}
                  onChange={(e) => setCodCID(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-medium font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Dias de Afastamento</label>
                <input
                  type="number"
                  min="0"
                  value={durTrat}
                  onChange={(e) => setDurTrat(Number(e.target.value))}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Médico Assistente</label>
                <input
                  type="text"
                  placeholder="Nome do Médico"
                  value={medicoNome}
                  onChange={(e) => setMedicoNome(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">CRM do Médico *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 123456"
                  value={medicoNrOC}
                  onChange={(e) => setMedicoNrOC(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-sm transition-all cursor-pointer"
            >
              Salvar CAT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========================================================
// SUB-COMPONENTE: MODAL DE EDIÇÃO DE S-2240
// ========================================================
interface S2240FormModalProps {
  isOpen: boolean;
  data: ESocialS2240Registro;
  onClose: () => void;
  onSave: (data: ESocialS2240Registro) => void;
}

const S2240FormModal: React.FC<S2240FormModalProps> = ({
  isOpen,
  data,
  onClose,
  onSave,
}) => {
  const [cbo, setCbo] = useState(data.cbo || "");
  const [dtIni, setDtIni] = useState(data.dtInicioCondicao || new Date().toISOString().slice(0, 10));
  const [descAmbiente, setDescAmbiente] = useState(data.descricaoAmbiente || "");
  const [descAtividades, setDescAtividades] = useState(data.descricaoAtividades || "");
  const [agentes, setAgentes] = useState<ESocialS2240Agente[]>(data.agentesNocivos || []);

  const handleAddAgente = (cod: string) => {
    const info = TABELA_24_FATORES_RISCO.find((t) => t.codigo === cod);
    if (!info) return;
    setAgentes((prev) => [
      ...prev,
      {
        codAgNoc: info.codigo,
        dscAgNoc: info.descricao,
        tpAval: info.codigo.startsWith("01.") ? "1" : "2",
        intConc: info.codigo === "01.01.001" ? "82.0" : undefined,
        limTol: info.codigo === "01.01.001" ? "85.0" : undefined,
        unMed: info.unidadePadrao || "3",
        tecMedicao: "NHO-01 / NR-15",
        utilizaEpc: "0",
        utilizaEpi: "0",
      },
    ]);
  };

  const handleRemoveAgente = (idx: number) => {
    setAgentes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...data,
      cbo,
      dtInicioCondicao: dtIni,
      descricaoAmbiente: descAmbiente,
      descricaoAtividades: descAtividades,
      agentesNocivos: agentes,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl my-8 flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
            <Building2 className="h-6 w-6" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Editar S-2240: {data.funcaoNome} ({data.setorNome})
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Código CBO da Função</label>
              <input
                type="text"
                placeholder="Ex: 5143-20"
                value={cbo}
                onChange={(e) => setCbo(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Data Início da Condição</label>
              <input
                type="date"
                required
                value={dtIni}
                onChange={(e) => setDtIni(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Descrição do Ambiente de Trabalho</label>
              <textarea
                rows={2}
                value={descAmbiente}
                onChange={(e) => setDescAmbiente(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Descrição das Atividades Desempenhadas</label>
              <textarea
                rows={2}
                value={descAtividades}
                onChange={(e) => setDescAtividades(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-medium"
              />
            </div>
          </div>

          {/* Agentes Nocivos (Tabela 24) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Fatores de Risco e Agentes Nocivos (Tabela 24)
              </h4>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddAgente(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="h-8 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 px-2 font-bold cursor-pointer"
              >
                <option value="">+ Adicionar Agente Tabela 24</option>
                {TABELA_24_FATORES_RISCO.map((t) => (
                  <option key={t.codigo} value={t.codigo}>
                    {t.codigo} - {t.descricao.slice(0, 45)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {agentes.map((ag, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{ag.codAgNoc}</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{ag.dscAgNoc}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>Avaliação: {ag.tpAval === "1" ? "Quantitativa" : "Qualitativa"}</span>
                      {ag.intConc && <span>Intensidade: {ag.intConc} {ag.unMed === "3" ? "dB(A)" : ""}</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAgente(idx)}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm transition-all cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========================================================
// SUB-COMPONENTE: MODAL DE CONFIGURAÇÃO DO ESOCIAL SST
// ========================================================
interface ConfigFormModalProps {
  isOpen: boolean;
  config: ESocialConfig;
  onClose: () => void;
  onSave: (cfg: ESocialConfig) => void;
}

const ConfigFormModal: React.FC<ConfigFormModalProps> = ({
  isOpen,
  config,
  onClose,
  onSave,
}) => {
  const [tpAmb, setTpAmb] = useState<"1" | "2">(config.tpAmb || "1");
  const [respNome, setRespNome] = useState(config.responsavelTecnicoNome || "");
  const [respCpf, setRespCpf] = useState(config.responsavelTecnicoCpf || "");
  const [respConselho, setRespConselho] = useState<"1" | "4" | "9">(config.responsavelTecnicoConselho || "4");
  const [respNr, setRespNr] = useState(config.responsavelTecnicoNr || "000000");
  const [respUf, setRespUf] = useState(config.responsavelTecnicoUf || "SP");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...config,
      tpAmb,
      responsavelTecnicoNome: respNome,
      responsavelTecnicoCpf: respCpf,
      responsavelTecnicoConselho: respConselho,
      responsavelTecnicoNr: respNr,
      responsavelTecnicoUf: respUf,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Settings className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold">Configurações do eSocial SST</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-slate-700 dark:text-slate-300">
          <div>
            <label className="block font-semibold mb-1">Ambiente de Envio do eSocial</label>
            <select
              value={tpAmb}
              onChange={(e: any) => setTpAmb(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-semibold"
            >
              <option value="1">1 - Produção (Ambiente Oficial eSocial)</option>
              <option value="2">2 - Produção Restrita (Ambiente de Testes / Homologação)</option>
            </select>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3">
              Responsável Técnico pelos Registros Ambientais (S-2240)
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Nome do Profissional Responsável</label>
                <input
                  type="text"
                  required
                  value={respNome}
                  onChange={(e) => setRespNome(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">CPF do Responsável</label>
                  <input
                    type="text"
                    required
                    value={respCpf}
                    onChange={(e) => setRespCpf(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Conselho de Classe</label>
                  <select
                    value={respConselho}
                    onChange={(e: any) => setRespConselho(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 font-medium"
                  >
                    <option value="4">4 - CREA (Engenheiro)</option>
                    <option value="1">1 - CRM (Médico)</option>
                    <option value="9">9 - Outros (CFT / MTE)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Nº Registro no Conselho</label>
                  <input
                    type="text"
                    required
                    value={respNr}
                    onChange={(e) => setRespNr(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">UF do Conselho</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={respUf}
                    onChange={(e) => setRespUf(e.target.value.toUpperCase())}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-medium uppercase font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm transition-all cursor-pointer"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
