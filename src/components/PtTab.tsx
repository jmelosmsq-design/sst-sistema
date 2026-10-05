import React, { useState, useMemo } from "react";
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  Copy,
  Trash2,
  Edit3,
  PenTool,
  Wind,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Flame,
  Zap,
  Activity,
  Maximize2,
  ChevronDown,
  ChevronUp,
  HardHat,
  Eye,
  Mic,
} from "lucide-react";
import {
  Company,
  PtPermissaoTrabalho,
  PtTipoAtividadeKey,
  PtStatus,
  PtChecklistItem,
  PtMedicaoGas,
  PtTrabalhador,
  DdsParticipante,
} from "../types";
import {
  CATALOGO_TIPOS_ATIVIDADE,
  CATALOGO_RISCOS_PT,
  CATALOGO_EPIS_PT,
  CATALOGO_EPCS_PT,
  PT_TEMPLATES_PADRAO,
  PtTemplate,
} from "../data/ptTemplates";
import { generatePtPdf } from "../services/ptPdfGenerator";
import { SignatureCanvasModal, SignerItem } from "./SignatureCanvasModal";
import { VoiceWorkerModal } from "./VoiceWorkerModal";

interface PtTabProps {
  company: Company;
  onUpdateCompany: (updated: Company) => void;
  onShowAlert: (type: "success" | "error" | "info", message: string) => void;
}

export const PtTab: React.FC<PtTabProps> = ({
  company,
  onUpdateCompany,
  onShowAlert,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");

  // State for active editing/creating modal
  const [isEditing, setIsEditing] = useState(false);
  const [activePt, setActivePt] = useState<PtPermissaoTrabalho | null>(null);

  // Template Picker Modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Signature Modal state
  const [signatureTarget, setSignatureTarget] = useState<{
    isOpen: boolean;
    type: "emissor" | "encarregado" | "vigia" | "trabalhador" | "baixa";
    workerIndex?: number;
    title: string;
    subtitle: string;
    queueMode?: boolean;
    currentQueueIndex?: number;
  }>({
    isOpen: false,
    type: "emissor",
    title: "",
    subtitle: "",
  });

  // Voice Worker Modal state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const permissoes = company.ptPermissoes || [];

  // Filtered List
  const filteredPts = useMemo(() => {
    return permissoes.filter((pt) => {
      const matchSearch =
        !searchTerm.trim() ||
        (pt.numeroPt && pt.numeroPt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pt.titulo && pt.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pt.localSetor && pt.localSetor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pt.encarregadoNome && pt.encarregadoNome.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        statusFilter === "todos" || pt.status.toLowerCase().includes(statusFilter.toLowerCase());

      const matchTipo =
        tipoFilter === "todos" || (pt.tiposAtividade && pt.tiposAtividade.includes(tipoFilter as any));

      return matchSearch && matchStatus && matchTipo;
    });
  }, [permissoes, searchTerm, statusFilter, tipoFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = permissoes.length;
    const emExecucao = permissoes.filter((p) => p.status === "Em Execução").length;
    const aprovadas = permissoes.filter((p) => p.status === "Aprovada / Liberada").length;
    const encerradas = permissoes.filter((p) => p.status === "Encerrada / Concluída").length;
    const altura = permissoes.filter((p) => p.tiposAtividade?.includes("altura")).length;
    const confinado = permissoes.filter((p) => p.tiposAtividade?.includes("espaco_confinado")).length;
    return { total, emExecucao, aprovadas, encerradas, altura, confinado };
  }, [permissoes]);

  // Helper to generate next PT sequence number (e.g. PT-2026/001)
  const getNextPtNumber = () => {
    const year = new Date().getFullYear();
    const currentCount = permissoes.length + 1;
    return `PT-${year}/${String(currentCount).padStart(3, "0")}`;
  };

  // Helper to create empty new PT
  const createNewEmptyPt = (): PtPermissaoTrabalho => {
    const today = new Date().toISOString().slice(0, 10);
    const tecNome =
      company.empresa?.emp_tecnico ||
      company.empresa?.emp_consultoria_tecnico ||
      "Técnico de Segurança do Trabalho";
    const tecRegistro =
      company.empresa?.emp_ass_tec_registro ||
      company.empresa?.emp_consultoria_registro ||
      "";

    return {
      id: "pt_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      numeroPt: getNextPtNumber(),
      titulo: "",
      tiposAtividade: ["altura"],
      status: "Em Elaboração",
      localSetor: company.setores[0]?.setor_nome || "",
      localDetalhado: "",
      dataInicio: today,
      horaInicio: "08:00",
      dataTermino: today,
      horaTermino: "17:00",
      descricaoTrabalho: "",
      ferramentasEquipamentos: "",
      riscosIdentificados: [
        "Queda de pessoas em nível diferente (Altura)",
        "Queda de ferramentas ou materiais sobre pessoas",
      ],
      checklistControles: [
        {
          id: "c1",
          item: "Trabalhadores capacitados e com ASO de aptidão válido para a atividade?",
          resposta: "sim",
        },
        {
          id: "c2",
          item: "Área de trabalho e piso inferior devidamente isolados e sinalizados?",
          resposta: "sim",
        },
        {
          id: "c3",
          item: "Equipamentos de Proteção Individual (EPI) inspecionados antes do uso?",
          resposta: "sim",
        },
        {
          id: "c4",
          item: "Procedimento de emergência e resgate alinhado com toda a equipe?",
          resposta: "sim",
        },
      ],
      episRequeridos: [
        "Capacete de segurança com jugular de 3 pontos",
        "Cinto de segurança tipo paraquedista com duplo talabarte com ABS",
        "Calçado de segurança com biqueira de composite/aço e solado antiderrapante",
        "Óculos de proteção contra impactos e raios UV",
        "Luvas de vaqueta / mista para trabalho geral",
      ],
      epcsRequeridos: [
        "Linha de vida horizontal fixa ou temporária certificada",
        "Fita zebrada, cones e placas de advertência para isolamento de área",
      ],
      emissorNome: tecNome,
      emissorCargo: "Técnico / Especialista SST",
      emissorRegistro: tecRegistro,
      emissorEmpresa: company.empresa?.emp_consultoria_razao || company.empresa?.emp_razao || "",
      encarregadoNome: "",
      encarregadoCargo: "Encarregado da Equipe",
      encarregadoEmpresa: company.empresa?.emp_razao || "",
      trabalhadores: [],
      procedimentoEmergencia: "Em caso de emergência ou anomalia, interromper a atividade imediatamente, evacuar a área de perigo e acionar o Ramal Interno de Socorro.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  // Apply template to PT
  const applyTemplateToPt = (template: PtTemplate) => {
    const base = activePt || createNewEmptyPt();
    const updated: PtPermissaoTrabalho = {
      ...base,
      titulo: template.nome,
      tiposAtividade: template.tiposAtividade,
      descricaoTrabalho: template.descricaoPadrao,
      ferramentasEquipamentos: template.ferramentasSugeridas,
      riscosIdentificados: template.riscosSugeridos,
      episRequeridos: template.episSugeridos,
      epcsRequeridos: template.epcsSugeridos,
      checklistControles: template.checklistSugerido,
      procedimentoEmergencia: template.procedimentoEmergenciaPadrao,
    };
    setActivePt(updated);
    setIsEditing(true);
    setShowTemplateModal(false);
    onShowAlert("success", `Modelo "${template.categoria}" aplicado com sucesso!`);
  };

  // Save active PT to Company state
  const handleSaveActivePt = () => {
    if (!activePt) return;

    if (!activePt.titulo.trim()) {
      onShowAlert("error", "Por favor, informe o título ou descrição da atividade.");
      return;
    }

    const currentList = company.ptPermissoes || [];
    const index = currentList.findIndex((p) => p.id === activePt.id);
    let updatedList: PtPermissaoTrabalho[];

    const finalPt: PtPermissaoTrabalho = {
      ...activePt,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      updatedList = [...currentList];
      updatedList[index] = finalPt;
    } else {
      updatedList = [finalPt, ...currentList];
    }

    onUpdateCompany({
      ...company,
      ptPermissoes: updatedList,
      updatedAt: new Date().toISOString(),
    });

    setIsEditing(false);
    setActivePt(null);
    onShowAlert("success", `Permissão de Trabalho (${finalPt.numeroPt}) salva com sucesso!`);
  };

  // Delete PT
  const handleDeletePt = (ptId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta Permissão de Trabalho (PT)?")) return;
    const updated = (company.ptPermissoes || []).filter((p) => p.id !== ptId);
    onUpdateCompany({
      ...company,
      ptPermissoes: updated,
      updatedAt: new Date().toISOString(),
    });
    onShowAlert("info", "Permissão de Trabalho excluída.");
  };

  // Duplicate PT
  const handleDuplicatePt = (pt: PtPermissaoTrabalho) => {
    const duplicated: PtPermissaoTrabalho = {
      ...pt,
      id: "pt_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      numeroPt: getNextPtNumber(),
      status: "Em Elaboração",
      dataInicio: new Date().toISOString().slice(0, 10),
      dataTermino: new Date().toISOString().slice(0, 10),
      emissorAssinaturaImg: undefined,
      encarregadoAssinaturaImg: undefined,
      vigiaAssinaturaImg: undefined,
      encerramento: undefined,
      trabalhadores: pt.trabalhadores.map((w) => ({
        ...w,
        assinaturaImg: undefined,
        assinadoEm: undefined,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [duplicated, ...(company.ptPermissoes || [])];
    onUpdateCompany({
      ...company,
      ptPermissoes: updatedList,
      updatedAt: new Date().toISOString(),
    });
    setActivePt(duplicated);
    setIsEditing(true);
    onShowAlert("success", `PT duplicada como ${duplicated.numeroPt}!`);
  };

  // Import workers from registered company functions
  const handleImportWorkersFromCompany = () => {
    if (!activePt) return;
    if (company.funcoes.length === 0) {
      onShowAlert("info", "Nenhuma função cadastrada na empresa para importar.");
      return;
    }

    const newWorkers: PtTrabalhador[] = company.funcoes.map((f, idx) => ({
      id: "w_" + Date.now() + "_" + idx,
      nome: `Profissional ${f.func_nome}`,
      funcao: f.func_nome,
      empresa: company.empresa?.emp_razao || "",
      asoApto: true,
      treinamentoValido: true,
    }));

    setActivePt({
      ...activePt,
      trabalhadores: [...activePt.trabalhadores, ...newWorkers],
    });
    onShowAlert("success", `${newWorkers.length} trabalhador(es) importado(s) das funções!`);
  };

  // Add Workers from Voice Recognition
  const handleVoiceWorkersAdded = (workers: DdsParticipante[]) => {
    if (!activePt) return;
    const newWorkers: PtTrabalhador[] = workers.map((p) => ({
      id: "w_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      nome: p.nome,
      cpfOuMatricula: p.cpfOuMatricula || "",
      funcao: p.funcao || "",
      empresa: p.empresa || "",
      asoApto: true,
      treinamentoValido: true,
    }));

    setActivePt({
      ...activePt,
      trabalhadores: [...activePt.trabalhadores, ...newWorkers],
    });
    setIsVoiceModalOpen(false);
    onShowAlert("success", `${newWorkers.length} trabalhador(es) adicionado(s) à PT por comando de voz!`);
  };

  // Save Signature from Modal
  const handleSaveSignature = (base64: string) => {
    if (!activePt) return;

    if (signatureTarget.type === "emissor") {
      setActivePt({
        ...activePt,
        emissorAssinaturaImg: base64,
        emissorAssinadoEm: new Date().toISOString(),
      });
      onShowAlert("success", "Assinatura do Emissor SST registrada!");
    } else if (signatureTarget.type === "encarregado") {
      setActivePt({
        ...activePt,
        encarregadoAssinaturaImg: base64,
        encarregadoAssinadoEm: new Date().toISOString(),
      });
      onShowAlert("success", "Assinatura do Encarregado registrada!");
    } else if (signatureTarget.type === "vigia") {
      setActivePt({
        ...activePt,
        vigiaAssinaturaImg: base64,
        vigiaAssinadoEm: new Date().toISOString(),
      });
      onShowAlert("success", "Assinatura do Vigia registrada!");
    } else if (signatureTarget.type === "baixa") {
      setActivePt({
        ...activePt,
        status: "Encerrada / Concluída",
        encerramento: {
          ...(activePt.encerramento || {
            localLimpoEOrganizado: true,
            bloqueiosRemovidos: true,
            trabalhoConcluido: true,
          }),
          dataBaixa: new Date().toISOString().slice(0, 10),
          horaBaixa: new Date().toLocaleTimeString().slice(0, 5),
          responsavelBaixaNome: activePt.encarregadoNome || activePt.emissorNome,
          responsavelBaixaAssinaturaImg: base64,
        },
      });
      onShowAlert("success", "Permissão de Trabalho baixada e encerrada com sucesso!");
    } else if (
      signatureTarget.type === "trabalhador" &&
      typeof signatureTarget.workerIndex === "number"
    ) {
      const idx = signatureTarget.workerIndex;
      const updatedWorkers = [...activePt.trabalhadores];
      if (updatedWorkers[idx]) {
        updatedWorkers[idx] = {
          ...updatedWorkers[idx],
          assinaturaImg: base64,
          assinadoEm: new Date().toISOString(),
        };
        setActivePt({
          ...activePt,
          trabalhadores: updatedWorkers,
        });
        onShowAlert("success", `Assinatura de ${updatedWorkers[idx].nome} registrada!`);
      }
    }

    setSignatureTarget((prev) => ({ ...prev, isOpen: false }));
  };

  // Queue signing for all workers
  const handleSaveAndNextWorkerSignature = (base64: string, nextIndex: number) => {
    if (!activePt) return;
    const currentIdx = signatureTarget.currentQueueIndex || 0;
    const updatedWorkers = [...activePt.trabalhadores];

    if (updatedWorkers[currentIdx]) {
      updatedWorkers[currentIdx] = {
        ...updatedWorkers[currentIdx],
        assinaturaImg: base64,
        assinadoEm: new Date().toISOString(),
      };
    }

    setActivePt({
      ...activePt,
      trabalhadores: updatedWorkers,
    });

    if (nextIndex < updatedWorkers.length) {
      setSignatureTarget({
        isOpen: true,
        type: "trabalhador",
        workerIndex: nextIndex,
        currentQueueIndex: nextIndex,
        queueMode: true,
        title: `Assinatura do Trabalhador (${nextIndex + 1} de ${updatedWorkers.length})`,
        subtitle: `Solicite a assinatura de ${updatedWorkers[nextIndex].nome}`,
      });
    } else {
      setSignatureTarget((prev) => ({ ...prev, isOpen: false }));
      onShowAlert("success", "Todas as assinaturas da equipe foram coletadas com sucesso!");
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto w-full">
      {/* Header Banner & Stats */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Permissão de Trabalho (PT / PET)
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gerenciamento e liberação de atividades críticas • NR-01, NR-33, NR-35, NR-34, NR-10 e NR-18
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons: Standard Height & Full Width */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full lg:w-96">
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-750 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Modelos Prontos</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const newPt = createNewEmptyPt();
                setActivePt(newPt);
                setIsEditing(true);
              }}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Nova PT</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-3 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Total de PTs</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.total}</span>
          </div>

          <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 p-3 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">Em Execução</span>
            <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">{stats.emExecucao}</span>
          </div>

          <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/30 p-3 border border-blue-200/60 dark:border-blue-900/40">
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 block">Trabalho em Altura (NR-35)</span>
            <span className="text-xl font-black text-blue-700 dark:text-blue-300">{stats.altura}</span>
          </div>

          <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/30 p-3 border border-amber-200/60 dark:border-amber-900/40">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block">Espaço Confinado (NR-33)</span>
            <span className="text-xl font-black text-amber-700 dark:text-amber-300">{stats.confinado}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Nº, título, setor..."
            className="h-12 w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-10 pr-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden"
          >
            <option value="todos">Todos os Status</option>
            <option value="Em Elaboração">Em Elaboração</option>
            <option value="Aprovada / Liberada">Aprovada / Liberada</option>
            <option value="Em Execução">Em Execução</option>
            <option value="Encerrada / Concluída">Encerrada / Concluída</option>
          </select>
        </div>

        <div>
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="h-12 w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden"
          >
            <option value="todos">Todas as Modalidades</option>
            {CATALOGO_TIPOS_ATIVIDADE.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label} ({t.nr})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List of PTs */}
      {filteredPts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
            <FileCheck className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Nenhuma Permissão de Trabalho Encontrada
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Crie uma nova PT do zero ou selecione um modelo pronto com checklists pré-preenchidos para Trabalho em Altura, Espaço Confinado, Eletricidade ou Solda.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mx-auto pt-2">
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Ver Modelos Prontos</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const newPt = createNewEmptyPt();
                setActivePt(newPt);
                setIsEditing(true);
              }}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Criar Nova PT</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPts.map((pt) => {
            const isPET = pt.tiposAtividade?.includes("espaco_confinado");
            const signedWorkersCount = (pt.trabalhadores || []).filter((w) => w.assinaturaImg).length;
            const totalWorkersCount = (pt.trabalhadores || []).length;

            return (
              <div
                key={pt.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all space-y-4"
              >
                {/* Top Row: Number, Title, Status */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-600 text-white tracking-wide">
                        {pt.numeroPt || "PT-001"}
                      </span>

                      {isPET && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                          PET NR-33
                        </span>
                      )}

                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          pt.status === "Em Execução"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                            : pt.status === "Aprovada / Liberada"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300"
                            : pt.status === "Encerrada / Concluída"
                            ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
                        }`}
                      >
                        {pt.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white pt-1">
                      {pt.titulo || "Atividade Técnica Especial"}
                    </h3>
                  </div>
                </div>

                {/* Details Badges */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {pt.tiposAtividade?.map((tipoKey) => {
                    const found = CATALOGO_TIPOS_ATIVIDADE.find((a) => a.key === tipoKey);
                    if (!found) return null;
                    return (
                      <span
                        key={tipoKey}
                        className={`px-2 py-0.5 rounded-md font-medium border ${found.corBadge}`}
                      >
                        {found.label} ({found.nr})
                      </span>
                    );
                  })}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate">
                      <strong>Local:</strong> {pt.localSetor || "Geral"} {pt.localDetalhado ? `(${pt.localDetalhado})` : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>
                      <strong>Validade:</strong> {pt.dataInicio} ({pt.horaInicio} às {pt.horaTermino})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>
                      <strong>Equipe:</strong> {signedWorkersCount}/{totalWorkersCount} assinaram
                    </span>
                  </div>
                </div>

                {/* Signatures Status Tag Bar */}
                <div className="flex items-center gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
                  {pt.emissorAssinaturaImg ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Emissor SST Assinou</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Emissor Pendente</span>
                    </span>
                  )}

                  {pt.encarregadoAssinaturaImg && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Encarregado Assinou</span>
                    </span>
                  )}
                </div>

                {/* Primary Card Buttons - Standard Full-Width Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        generatePtPdf(company, pt, false);
                        onShowAlert("success", `PDF da ${pt.numeroPt} gerado com sucesso!`);
                      } catch (err: any) {
                        onShowAlert("error", "Erro ao gerar PDF: " + (err?.message || ""));
                      }
                    }}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                    title="Gerar e Baixar PDF da PT"
                  >
                    <FileText className="h-4.5 w-4.5" />
                    <span>Gerar / Baixar PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActivePt(pt);
                      setIsEditing(true);
                    }}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Edit3 className="h-4.5 w-4.5" />
                    <span>Abrir / Editar Formulário</span>
                  </button>
                </div>

                {/* Secondary Card Row Actions - Standardized Full-Width Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleDuplicatePt(pt)}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-750 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                    title="Duplicar esta PT"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Duplicar PT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeletePt(pt.id)}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                    title="Excluir esta PT"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Excluir PT</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Template Picker Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Modelos Normativos de PT Pré-Prontos
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Selecione um modelo para carregar automaticamente o checklist, riscos, EPIs e EPCs
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
              {PT_TEMPLATES_PADRAO.map((tpl) => (
                <div
                  key={tpl.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-all bg-slate-50/50 dark:bg-slate-850/50 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200">
                        {tpl.categoria}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {tpl.nome}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => applyTemplateToPt(tpl)}
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Usar Modelo</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {tpl.descricaoPadrao}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>• {tpl.checklistSugerido.length} itens no checklist</span>
                    <span>• {tpl.riscosSugeridos.length} riscos mapeados</span>
                    <span>• {tpl.episSugeridos.length} EPIs</span>
                    <span>• {tpl.epcsSugeridos.length} EPCs</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="h-11 px-5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full PT Editor Modal */}
      {isEditing && activePt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[96vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                      {activePt.numeroPt}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-semibold">{activePt.status}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {activePt.titulo || "Formulário de Permissão de Trabalho"}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      generatePtPdf(company, activePt, false);
                      onShowAlert("success", "PDF da PT gerado!");
                    } catch (e: any) {
                      onShowAlert("error", "Erro ao gerar PDF: " + (e?.message || ""));
                    }
                  }}
                  className="hidden sm:inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  <span>Gerar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setActivePt(null);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body / Scrollable Form */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              {/* 1. Identification & Status */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-white dark:bg-slate-900">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4" />
                  <span>1. Identificação Geral e Validade</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Número Sequencial da PT *
                    </label>
                    <input
                      type="text"
                      value={activePt.numeroPt}
                      onChange={(e) => setActivePt({ ...activePt, numeroPt: e.target.value })}
                      className="h-11 w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs sm:text-sm text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Status da Permissão
                    </label>
                    <select
                      value={activePt.status}
                      onChange={(e) => setActivePt({ ...activePt, status: e.target.value as PtStatus })}
                      className="h-11 w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs sm:text-sm text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="Em Elaboração">Em Elaboração</option>
                      <option value="Aprovada / Liberada">Aprovada / Liberada</option>
                      <option value="Em Execução">Em Execução</option>
                      <option value="Encerrada / Concluída">Encerrada / Concluída</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Setor / Local da Empresa *
                    </label>
                    <select
                      value={activePt.localSetor}
                      onChange={(e) => setActivePt({ ...activePt, localSetor: e.target.value })}
                      className="h-11 w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs sm:text-sm text-slate-900 dark:text-white"
                    >
                      {company.setores.map((s) => (
                        <option key={s.id} value={s.setor_nome}>
                          {s.setor_nome}
                        </option>
                      ))}
                      <option value="Área Externa / Pátio">Área Externa / Pátio</option>
                      <option value="Subestação Elétrica">Subestação Elétrica</option>
                      <option value="Outro Local">Outro Local...</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Título Resumido da Atividade *
                    </label>
                    <input
                      type="text"
                      value={activePt.titulo}
                      onChange={(e) => setActivePt({ ...activePt, titulo: e.target.value })}
                      placeholder="Ex: Troca de Telhas e Limpeza de Calhas no Galpão 02"
                      className="h-11 w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Detalhamento do Ponto / Equipamento
                    </label>
                    <input
                      type="text"
                      value={activePt.localDetalhado || ""}
                      onChange={(e) => setActivePt({ ...activePt, localDetalhado: e.target.value })}
                      placeholder="Ex: Tanque T-04 / Cobertura Linha B / Painel QGBT-01"
                      className="h-11 w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Data Início
                    </label>
                    <input
                      type="date"
                      value={activePt.dataInicio}
                      onChange={(e) => setActivePt({ ...activePt, dataInicio: e.target.value })}
                      className="h-11 w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Hora Início
                    </label>
                    <input
                      type="time"
                      value={activePt.horaInicio}
                      onChange={(e) => setActivePt({ ...activePt, horaInicio: e.target.value })}
                      className="h-11 w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Data Validade
                    </label>
                    <input
                      type="date"
                      value={activePt.dataTermino}
                      onChange={(e) => setActivePt({ ...activePt, dataTermino: e.target.value })}
                      className="h-11 w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Hora Validade
                    </label>
                    <input
                      type="time"
                      value={activePt.horaTermino}
                      onChange={(e) => setActivePt({ ...activePt, horaTermino: e.target.value })}
                      className="h-11 w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Activity Types (Modalities) */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />
                    <span>2. Modalidades Críticas Envolvidas</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Marque todas as aplicáveis</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {CATALOGO_TIPOS_ATIVIDADE.map((cat) => {
                    const isSelected = activePt.tiposAtividade?.includes(cat.key);
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => {
                          const current = activePt.tiposAtividade || [];
                          const updated = isSelected
                            ? current.filter((k) => k !== cat.key)
                            : [...current, cat.key];
                          setActivePt({ ...activePt, tiposAtividade: updated });
                        }}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 dark:border-blue-400 text-blue-900 dark:text-blue-200 font-bold shadow-2xs"
                            : "bg-slate-50/70 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs">{cat.label}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {cat.nr}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal line-clamp-1 mt-1">
                          {cat.descricao}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Description of Work and Tools */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-white dark:bg-slate-900">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Edit3 className="h-4 w-4" />
                  <span>3. Passo a Passo do Trabalho e Ferramentas</span>
                </h4>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Descrição Detalhada do Trabalho a ser Executado
                  </label>
                  <textarea
                    rows={3}
                    value={activePt.descricaoTrabalho}
                    onChange={(e) => setActivePt({ ...activePt, descricaoTrabalho: e.target.value })}
                    placeholder="Descreva o passo a passo da operação, métodos de montagem/desmontagem ou procedimentos..."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-xs sm:text-sm text-slate-900 dark:text-white leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Máquinas, Veículos, Equipamentos e Ferramentas Utilizadas
                  </label>
                  <input
                    type="text"
                    value={activePt.ferramentasEquipamentos || ""}
                    onChange={(e) => setActivePt({ ...activePt, ferramentasEquipamentos: e.target.value })}
                    placeholder="Ex: Furadeira, lixadeira com proteção, andaime tubular fachadeiro, cordas estáticas..."
                    className="h-11 w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* 4. Pre-operational Checklist */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4" />
                    <span>4. Checklist de Medidas de Controle Pré-Operacionais</span>
                  </h4>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = (activePt.checklistControles || []).map((chk) => ({
                        ...chk,
                        resposta: "sim" as const,
                      }));
                      setActivePt({ ...activePt, checklistControles: updated });
                      onShowAlert("info", "Todos os itens marcados como CONFORME (SIM).");
                    }}
                    className="inline-flex h-8 items-center gap-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Marcar Todos como SIM</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(activePt.checklistControles || []).map((chk, idx) => (
                    <div
                      key={chk.id || idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 text-xs"
                    >
                      <div className="flex items-start gap-2 flex-1">
                        <span className="font-bold text-slate-400 mt-0.5">{idx + 1}.</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{chk.item}</span>
                      </div>

                      {/* Resposta Buttons (SIM / NÃO / NA) */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...activePt.checklistControles];
                            updated[idx] = { ...chk, resposta: "sim" };
                            setActivePt({ ...activePt, checklistControles: updated });
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                            chk.resposta === "sim"
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          SIM
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...activePt.checklistControles];
                            updated[idx] = { ...chk, resposta: "nao" };
                            setActivePt({ ...activePt, checklistControles: updated });
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                            chk.resposta === "nao"
                              ? "bg-rose-600 text-white shadow-2xs"
                              : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          NÃO
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...activePt.checklistControles];
                            updated[idx] = { ...chk, resposta: "na" };
                            setActivePt({ ...activePt, checklistControles: updated });
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                            chk.resposta === "na"
                              ? "bg-slate-700 text-white shadow-2xs"
                              : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Gas Atmosphere Measurements (NR-33) */}
              {(activePt.tiposAtividade?.includes("espaco_confinado") ||
                (activePt.medicoesGases && activePt.medicoesGases.length > 0)) && (
                <div className="rounded-xl border border-amber-300 dark:border-amber-900/60 p-4 space-y-4 bg-amber-50/30 dark:bg-amber-950/20">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Wind className="h-4 w-4 text-amber-600" />
                      <span>5. Medições Atmosféricas e Gases (PET / NR-33)</span>
                    </h4>

                    <button
                      type="button"
                      onClick={() => {
                        const newMedicao: PtMedicaoGas = {
                          id: "gas_" + Date.now(),
                          horario: new Date().toLocaleTimeString().slice(0, 5),
                          oxigenio: "20.9",
                          lie: "0",
                          co: "0",
                          h2s: "0",
                          responsavelMedicao: activePt.emissorNome || "Técnico SST",
                          statusAprovado: true,
                        };
                        setActivePt({
                          ...activePt,
                          medicoesGases: [...(activePt.medicoesGases || []), newMedicao],
                        });
                      }}
                      className="inline-flex h-8 items-center gap-1.5 px-3 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ Nova Leitura</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(activePt.medicoesGases || []).map((med, idx) => (
                      <div
                        key={med.id}
                        className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-slate-900 text-xs"
                      >
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block">Horário</label>
                          <input
                            type="time"
                            value={med.horario}
                            onChange={(e) => {
                              const updated = [...(activePt.medicoesGases || [])];
                              updated[idx] = { ...med, horario: e.target.value };
                              setActivePt({ ...activePt, medicoesGases: updated });
                            }}
                            className="h-9 w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block">O₂ (19.5 - 23%)</label>
                          <input
                            type="text"
                            value={med.oxigenio}
                            onChange={(e) => {
                              const updated = [...(activePt.medicoesGases || [])];
                              updated[idx] = { ...med, oxigenio: e.target.value };
                              setActivePt({ ...activePt, medicoesGases: updated });
                            }}
                            className="h-9 w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block">LIE / LEL (&lt; 10%)</label>
                          <input
                            type="text"
                            value={med.lie}
                            onChange={(e) => {
                              const updated = [...(activePt.medicoesGases || [])];
                              updated[idx] = { ...med, lie: e.target.value };
                              setActivePt({ ...activePt, medicoesGases: updated });
                            }}
                            className="h-9 w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block">CO (&lt; 25 ppm)</label>
                          <input
                            type="text"
                            value={med.co}
                            onChange={(e) => {
                              const updated = [...(activePt.medicoesGases || [])];
                              updated[idx] = { ...med, co: e.target.value };
                              setActivePt({ ...activePt, medicoesGases: updated });
                            }}
                            className="h-9 w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block">H₂S (&lt; 8 ppm)</label>
                          <input
                            type="text"
                            value={med.h2s}
                            onChange={(e) => {
                              const updated = [...(activePt.medicoesGases || [])];
                              updated[idx] = { ...med, h2s: e.target.value };
                              setActivePt({ ...activePt, medicoesGases: updated });
                            }}
                            className="h-9 w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 text-xs"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (activePt.medicoesGases || []).filter((_, i) => i !== idx);
                              setActivePt({ ...activePt, medicoesGases: updated });
                            }}
                            className="h-9 w-full rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. EPIs and EPCs Required */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-white dark:bg-slate-900">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <HardHat className="h-4 w-4" />
                  <span>6. Equipamentos Obrigatórios (EPI / EPC)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* EPIs */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      EPIs Obrigatórios
                    </label>
                    <div className="max-h-48 overflow-y-auto space-y-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {CATALOGO_EPIS_PT.map((epi) => {
                        const isChecked = activePt.episRequeridos?.includes(epi);
                        return (
                          <label
                            key={epi}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-750 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const current = activePt.episRequeridos || [];
                                const updated = e.target.checked
                                  ? [...current, epi]
                                  : current.filter((x) => x !== epi);
                                setActivePt({ ...activePt, episRequeridos: updated });
                              }}
                              className="rounded-sm text-blue-600"
                            />
                            <span className="leading-tight">{epi}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* EPCs */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      EPCs e Proteções Coletivas
                    </label>
                    <div className="max-h-48 overflow-y-auto space-y-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {CATALOGO_EPCS_PT.map((epc) => {
                        const isChecked = activePt.epcsRequeridos?.includes(epc);
                        return (
                          <label
                            key={epc}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-750 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const current = activePt.epcsRequeridos || [];
                                const updated = e.target.checked
                                  ? [...current, epc]
                                  : current.filter((x) => x !== epc);
                                setActivePt({ ...activePt, epcsRequeridos: updated });
                              }}
                              className="rounded-sm text-blue-600"
                            />
                            <span className="leading-tight">{epc}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 7. Authorized Workers & On-Screen Signatures */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-white dark:bg-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>7. Equipe de Trabalhadores Autorizados e Assinaturas</span>
                  </h4>
                </div>

                {/* Team Action Buttons: Standardized Full-Width Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
                  <button
                    id="btn-import-company-workers"
                    type="button"
                    onClick={handleImportWorkersFromCompany}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 px-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <Copy className="h-4 w-4 text-blue-600" />
                    <span>Importar Funções</span>
                  </button>

                  <button
                    id="btn-voice-worker-modal"
                    type="button"
                    onClick={() => setIsVoiceModalOpen(true)}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 px-3 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors cursor-pointer border border-purple-200 dark:border-purple-800"
                  >
                    <Mic className="h-4 w-4 text-purple-600" />
                    <span>Cadastrar por Voz (IA)</span>
                  </button>

                  <button
                    id="btn-add-manual-worker"
                    type="button"
                    onClick={() => {
                      const newW: PtTrabalhador = {
                        id: "w_" + Date.now(),
                        nome: "",
                        cpfOuMatricula: "",
                        funcao: "",
                        asoApto: true,
                        treinamentoValido: true,
                      };
                      setActivePt({
                        ...activePt,
                        trabalhadores: [...activePt.trabalhadores, newW],
                      });
                    }}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 px-3 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Trabalhador</span>
                  </button>
                </div>

                {activePt.trabalhadores.length > 0 && (
                  <button
                    id="btn-collect-all-signatures"
                    type="button"
                    onClick={() => {
                      if (activePt.trabalhadores.length === 0) return;
                      setSignatureTarget({
                        isOpen: true,
                        type: "trabalhador",
                        workerIndex: 0,
                        currentQueueIndex: 0,
                        queueMode: true,
                        title: `Assinatura do Trabalhador (1 de ${activePt.trabalhadores.length})`,
                        subtitle: `Solicite a assinatura de ${activePt.trabalhadores[0].nome || "Trabalhador"}`,
                      });
                    }}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xs transition-all cursor-pointer"
                  >
                    <PenTool className="h-4 w-4" />
                    <span>Coletar Assinaturas em Fila (Modo Prancheta Digital)</span>
                  </button>
                )}

                <div className="space-y-2">
                  {activePt.trabalhadores.map((w, idx) => (
                    <div
                      key={w.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-xs"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                        <input
                          type="text"
                          value={w.nome}
                          onChange={(e) => {
                            const updated = [...activePt.trabalhadores];
                            updated[idx] = { ...w, nome: e.target.value };
                            setActivePt({ ...activePt, trabalhadores: updated });
                          }}
                          placeholder="Nome Completo do Trabalhador"
                          className="h-9 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 font-bold"
                        />

                        <input
                          type="text"
                          value={w.cpfOuMatricula || ""}
                          onChange={(e) => {
                            const updated = [...activePt.trabalhadores];
                            updated[idx] = { ...w, cpfOuMatricula: e.target.value };
                            setActivePt({ ...activePt, trabalhadores: updated });
                          }}
                          placeholder="CPF / Matrícula"
                          className="h-9 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2"
                        />

                        <input
                          type="text"
                          value={w.funcao || ""}
                          onChange={(e) => {
                            const updated = [...activePt.trabalhadores];
                            updated[idx] = { ...w, funcao: e.target.value };
                            setActivePt({ ...activePt, trabalhadores: updated });
                          }}
                          placeholder="Função / Cargo"
                          className="h-9 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2"
                        />
                      </div>

                      {/* Signature status and button */}
                      <div className="flex items-center gap-2 shrink-0">
                        {w.assinaturaImg ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Assinado</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSignatureTarget({
                                  isOpen: true,
                                  type: "trabalhador",
                                  workerIndex: idx,
                                  title: `Assinatura: ${w.nome}`,
                                  subtitle: "Atualize a assinatura na tela",
                                });
                              }}
                              className="px-2 py-1 text-[10px] font-bold rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                            >
                              Refazer
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSignatureTarget({
                                isOpen: true,
                                type: "trabalhador",
                                workerIndex: idx,
                                title: `Assinatura: ${w.nome || "Trabalhador"}`,
                                subtitle: "Desenhe a assinatura na tela",
                              });
                            }}
                            className="inline-flex h-8 items-center gap-1.5 px-3 rounded-lg font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                          >
                            <PenTool className="h-3.5 w-3.5" />
                            <span>Assinar na Tela</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const updated = activePt.trabalhadores.filter((_, i) => i !== idx);
                            setActivePt({ ...activePt, trabalhadores: updated });
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 8. Responsibles & On-screen Signatures */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-white dark:bg-slate-900">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <PenTool className="h-4 w-4" />
                  <span>8. Responsáveis e Assinaturas de Liberação</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Emissor / SST */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Emissor / Responsável pela Liberação (SST)
                    </span>

                    <input
                      type="text"
                      value={activePt.emissorNome}
                      onChange={(e) => setActivePt({ ...activePt, emissorNome: e.target.value })}
                      placeholder="Nome do Técnico ou Engenheiro SST"
                      className="h-10 w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 text-xs font-bold"
                    />

                    <input
                      type="text"
                      value={activePt.emissorRegistro || ""}
                      onChange={(e) => setActivePt({ ...activePt, emissorRegistro: e.target.value })}
                      placeholder="Registro MTE / CREA / CFT"
                      className="h-10 w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 text-xs"
                    />

                    {activePt.emissorAssinaturaImg ? (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Assinatura Coletada</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSignatureTarget({
                              isOpen: true,
                              type: "emissor",
                              title: "Assinatura do Emissor SST",
                              subtitle: "Desenhe sua assinatura na tela",
                            });
                          }}
                          className="text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          Refazer
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSignatureTarget({
                            isOpen: true,
                            type: "emissor",
                            title: "Assinatura do Emissor SST",
                            subtitle: "Desenhe a assinatura na tela",
                          });
                        }}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        <PenTool className="h-4 w-4" />
                        <span>Assinar como Emissor</span>
                      </button>
                    )}
                  </div>

                  {/* Encarregado / Supervisor */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Encarregado / Supervisor da Atividade
                    </span>

                    <input
                      type="text"
                      value={activePt.encarregadoNome}
                      onChange={(e) => setActivePt({ ...activePt, encarregadoNome: e.target.value })}
                      placeholder="Nome do Encarregado / Líder da Frente"
                      className="h-10 w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 text-xs font-bold"
                    />

                    <input
                      type="text"
                      value={activePt.encarregadoEmpresa || ""}
                      onChange={(e) => setActivePt({ ...activePt, encarregadoEmpresa: e.target.value })}
                      placeholder="Empresa Contratada / Setor"
                      className="h-10 w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 text-xs"
                    />

                    {activePt.encarregadoAssinaturaImg ? (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Assinatura Coletada</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSignatureTarget({
                              isOpen: true,
                              type: "encarregado",
                              title: "Assinatura do Encarregado",
                              subtitle: "Desenhe sua assinatura na tela",
                            });
                          }}
                          className="text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          Refazer
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSignatureTarget({
                            isOpen: true,
                            type: "encarregado",
                            title: "Assinatura do Encarregado",
                            subtitle: "Desenhe a assinatura na tela",
                          });
                        }}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        <PenTool className="h-4 w-4" />
                        <span>Assinar como Encarregado</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 9. Closure / Baixa da PT */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-white dark:bg-slate-900">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>9. Encerramento e Baixa da PT (Conclusão dos Serviços)</span>
                </h4>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Encerramento da Permissão
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Confirma que a área foi limpa, ferramentas recolhidas, bloqueios desfeitos e o trabalho finalizado.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSignatureTarget({
                        isOpen: true,
                        type: "baixa",
                        title: "Assinatura de Encerramento e Baixa da PT",
                        subtitle: "Assine para confirmar a conclusão dos trabalhos e liberação da área",
                      });
                    }}
                    className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Baixar / Encerrar PT</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Bottom Fixed Bar: Standard Height & Width */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setActivePt(null);
                }}
                className="h-12 px-5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveActivePt}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-8 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Salvar Permissão de Trabalho</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* On Screen Signature Canvas Modal */}
      <SignatureCanvasModal
        isOpen={signatureTarget.isOpen}
        onClose={() => setSignatureTarget((prev) => ({ ...prev, isOpen: false }))}
        title={signatureTarget.title}
        subtitle={signatureTarget.subtitle}
        onSaveSignature={handleSaveSignature}
        queueMode={signatureTarget.queueMode}
        queueList={activePt?.trabalhadores as SignerItem[]}
        currentQueueIndex={signatureTarget.currentQueueIndex}
        onSaveAndNext={handleSaveAndNextWorkerSignature}
      />

      {/* Voice Worker Registration Modal */}
      <VoiceWorkerModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onAddWorkers={handleVoiceWorkersAdded}
        defaultSetor={activePt?.localSetor || ""}
        onAlert={onShowAlert}
      />
    </div>
  );
};
