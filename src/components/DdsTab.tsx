import React, { useState, useMemo } from "react";
import {
  Company,
  DdsRegistro,
  DdsParticipante,
  DdsTemaItem,
} from "../types";
import { CATALOGO_DDS_TEMAS } from "../data/ddsCatalog";
import { SignatureCanvasModal } from "./SignatureCanvasModal";
import { DdsThemeManagerModal } from "./DdsThemeManagerModal";
import { DdsReadingModal } from "./DdsReadingModal";
import { VoiceWorkerModal } from "./VoiceWorkerModal";
import { generateDdsPdf } from "../services/ddsPdfGenerator";
import {
  ShieldAlert,
  Calendar,
  Clock,
  User,
  Users,
  PenTool,
  FileText,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Printer,
  Download,
  Search,
  Check,
  ChevronDown,
  Layers,
  ArrowRight,
  Info,
  MapPin,
  RefreshCw,
  Eye,
  FileCheck,
  Maximize2,
  Copy,
  Mic,
} from "lucide-react";

interface DdsTabProps {
  company: Company;
  onUpdateCompany: (updated: Company) => void;
  onShowAlert?: (type: "success" | "error" | "info", message: string) => void;
}

export const DdsTab: React.FC<DdsTabProps> = ({
  company,
  onUpdateCompany,
  onShowAlert,
}) => {
  // Existing DDS records
  const ddsList = useMemo(() => company.ddsRegistros || [], [company.ddsRegistros]);
  const customTemas = useMemo(() => company.customDdsTemas || [], [company.customDdsTemas]);

  // Active or New DDS editing state
  const [activeSession, setActiveSession] = useState<DdsRegistro | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Modals
  const [isThemeManagerOpen, setIsThemeManagerOpen] = useState(false);
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [signatureTarget, setSignatureTarget] = useState<{
    type: "facilitator" | "worker";
    workerIndex?: number;
    queueMode?: boolean;
  }>({ type: "facilitator" });

  // AI expansion state
  const [isExpandingAi, setIsExpandingAi] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Filter / Search for existing history
  const [historySearch, setHistorySearch] = useState("");

  // New quick worker inputs
  const [quickWorkerName, setQuickWorkerName] = useState("");
  const [quickWorkerCpf, setQuickWorkerCpf] = useState("");
  const [quickWorkerRole, setQuickWorkerRole] = useState("");
  const [quickWorkerSetor, setQuickWorkerSetor] = useState("");

  // Handler to start a new DDS
  const handleStartNewDds = (presetTema?: DdsTemaItem) => {
    const defaultTema = presetTema || CATALOGO_DDS_TEMAS[0];
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentTimeStr = now.toTimeString().slice(0, 5);

    // Estimate end time (+15 min)
    const endMinutes = now.getMinutes() + 15;
    const endHour = now.getHours() + Math.floor(endMinutes / 60);
    const endTimeStr = `${String(endHour % 24).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

    const newRegistro: DdsRegistro = {
      id: "dds_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      empresaId: company.id,
      temaId: defaultTema.id,
      temaCodigo: defaultTema.codigo,
      temaTitulo: defaultTema.titulo,
      temaCategoria: defaultTema.categoria,
      temaConteudo: defaultTema.conteudo,
      nrReferencia: defaultTema.nrReferencia,
      frequencia: "Diário (DDS)",
      data: todayStr,
      horarioInicio: currentTimeStr,
      horarioTermino: endTimeStr,
      duracaoMinutos: "15 min",
      localSetor: company.setores?.[0]?.setor_nome || "Instalações da Empresa",
      ministranteNome: "Técnico / Responsável SST",
      ministranteCargo: "Técnico em Segurança do Trabalho",
      ministranteRegistro: "",
      observacoes: "",
      participantes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Auto-populate workers from company functions if available
    if (company.funcoes && company.funcoes.length > 0) {
      const autoWorkers: DdsParticipante[] = [];
      company.funcoes.forEach((f, idx) => {
        const count = parseInt(f.func_qtd, 10) || 1;
        for (let i = 1; i <= Math.min(count, 3); i++) {
          autoWorkers.push({
            id: `part_${Date.now()}_${idx}_${i}`,
            nome: count > 1 ? `Colaborador ${i} - ${f.func_nome}` : `Colaborador - ${f.func_nome}`,
            cpfOuMatricula: `MAT-${1000 + autoWorkers.length + 1}`,
            funcao: f.func_nome,
            setor: f.func_setor || company.setores?.[0]?.setor_nome || "",
            presente: true,
          });
        }
      });
      newRegistro.participantes = autoWorkers;
    }

    setActiveSession(newRegistro);
    setIsEditing(true);
  };

  // Select a theme from catalog
  const handleSelectTheme = (tema: DdsTemaItem) => {
    if (!activeSession) {
      handleStartNewDds(tema);
      return;
    }

    setActiveSession({
      ...activeSession,
      temaId: tema.id,
      temaCodigo: tema.codigo,
      temaTitulo: tema.titulo,
      temaCategoria: tema.categoria,
      temaConteudo: tema.conteudo,
      nrReferencia: tema.nrReferencia,
    });

    if (onShowAlert) onShowAlert("success", `Tema "${tema.titulo}" aplicado com texto completo para leitura!`);
  };

  // Expand text with AI
  const handleExpandDialogueWithAi = async () => {
    if (!activeSession) return;
    setIsExpandingAi(true);

    try {
      const response = await fetch("/api/dds/expand-dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temaTitulo: activeSession.temaTitulo,
          temaConteudo: activeSession.temaConteudo,
          nrReferencia: activeSession.nrReferencia,
          companyContext: company.empresa?.emp_cnae || company.empresa?.emp_razao,
        }),
      });

      const json = await response.json();
      if (json.success && json.expandedText) {
        setActiveSession({
          ...activeSession,
          temaConteudo: json.expandedText,
        });
        if (onShowAlert) onShowAlert("success", "Roteiro expandido para leitura completa com IA!");
      }
    } catch (err) {
      console.error("Error expanding dialogue with AI:", err);
      if (onShowAlert) onShowAlert("info", "Não foi possível conectar com a IA no momento.");
    } finally {
      setIsExpandingAi(false);
    }
  };

  // Copy spoken script
  const handleCopySpokenScript = () => {
    if (!activeSession?.temaConteudo) return;
    navigator.clipboard.writeText(activeSession.temaConteudo);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Add custom theme
  const handleSaveCustomTema = (tema: DdsTemaItem) => {
    const updatedCustoms = [...customTemas.filter((t) => t.id !== tema.id), tema];
    onUpdateCompany({
      ...company,
      customDdsTemas: updatedCustoms,
      updatedAt: new Date().toISOString(),
    });
    if (onShowAlert) onShowAlert("success", "Tema salvo no catálogo personalizado!");
  };

  // Delete custom theme
  const handleDeleteCustomTema = (temaId: string) => {
    const updatedCustoms = customTemas.filter((t) => t.id !== temaId);
    onUpdateCompany({
      ...company,
      customDdsTemas: updatedCustoms,
      updatedAt: new Date().toISOString(),
    });
    if (onShowAlert) onShowAlert("info", "Tema removido com sucesso.");
  };

  // Save current DDS session to company state
  const handleSaveSession = () => {
    if (!activeSession) return;
    if (!activeSession.temaTitulo.trim()) {
      alert("Informe o título do tema.");
      return;
    }

    const updatedList = [
      ...ddsList.filter((d) => d.id !== activeSession.id),
      { ...activeSession, updatedAt: new Date().toISOString() },
    ];

    onUpdateCompany({
      ...company,
      ddsRegistros: updatedList,
      updatedAt: new Date().toISOString(),
    });

    if (onShowAlert) onShowAlert("success", "Diálogo de Segurança salvo com sucesso!");
    setIsEditing(false);
  };

  // Delete an existing session
  const handleDeleteSession = (sessionId: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro de DDS?")) return;
    const updatedList = ddsList.filter((d) => d.id !== sessionId);
    onUpdateCompany({
      ...company,
      ddsRegistros: updatedList,
      updatedAt: new Date().toISOString(),
    });
    if (onShowAlert) onShowAlert("info", "Registro de DDS excluído.");
  };

  // Open signature modal
  const handleOpenSignature = (
    type: "facilitator" | "worker",
    workerIndex?: number,
    queueMode = false
  ) => {
    setSignatureTarget({ type, workerIndex, queueMode });
    setIsSignatureModalOpen(true);
  };

  // Save single signature
  const handleSaveSignature = (signatureDataUrl: string) => {
    if (!activeSession) return;

    if (signatureTarget.type === "facilitator") {
      setActiveSession({
        ...activeSession,
        ministranteAssinaturaImg: signatureDataUrl,
      });
    } else if (
      signatureTarget.type === "worker" &&
      signatureTarget.workerIndex !== undefined
    ) {
      const updated = [...activeSession.participantes];
      if (updated[signatureTarget.workerIndex]) {
        updated[signatureTarget.workerIndex] = {
          ...updated[signatureTarget.workerIndex],
          assinaturaImg: signatureDataUrl,
          dataAssinatura: new Date().toISOString(),
          presente: true,
        };
        setActiveSession({
          ...activeSession,
          participantes: updated,
        });
      }
    }
  };

  // Queue mode saving and advancement
  const handleSaveAndNextInQueue = (signatureDataUrl: string, nextIndex: number) => {
    if (!activeSession) return;

    const currentIndex = signatureTarget.workerIndex || 0;
    const updated = [...activeSession.participantes];

    if (updated[currentIndex]) {
      updated[currentIndex] = {
        ...updated[currentIndex],
        assinaturaImg: signatureDataUrl,
        dataAssinatura: new Date().toISOString(),
        presente: true,
      };
      setActiveSession({
        ...activeSession,
        participantes: updated,
      });
    }

    if (nextIndex < updated.length) {
      setSignatureTarget({
        type: "worker",
        workerIndex: nextIndex,
        queueMode: true,
      });
    } else {
      setIsSignatureModalOpen(false);
      if (onShowAlert) onShowAlert("success", "Todas as assinaturas da fila foram coletadas com sucesso!");
    }
  };

  // Add quick inline worker
  const handleAddQuickWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !quickWorkerName.trim()) return;

    const newWorker: DdsParticipante = {
      id: "part_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      nome: quickWorkerName.trim(),
      cpfOuMatricula: quickWorkerCpf.trim() || undefined,
      funcao: quickWorkerRole.trim() || undefined,
      setor: quickWorkerSetor.trim() || activeSession.localSetor || undefined,
      presente: true,
    };

    setActiveSession({
      ...activeSession,
      participantes: [...activeSession.participantes, newWorker],
    });

    setQuickWorkerName("");
    setQuickWorkerCpf("");
    setQuickWorkerRole("");
    setQuickWorkerSetor("");
  };

  // Adicionar trabalhadores capturados por voz
  const handleAddVoiceWorkers = (workers: DdsParticipante[]) => {
    if (!activeSession || workers.length === 0) return;

    setActiveSession({
      ...activeSession,
      participantes: [...activeSession.participantes, ...workers],
    });
  };

  // Import workers from company functions
  const handleImportAllCompanyWorkers = () => {
    if (!activeSession) return;
    if (!company.funcoes || company.funcoes.length === 0) {
      alert("Nenhuma função/cargo cadastrada na empresa para importar.");
      return;
    }

    const imported: DdsParticipante[] = [];
    company.funcoes.forEach((f, idx) => {
      const count = parseInt(f.func_qtd, 10) || 1;
      for (let i = 1; i <= Math.min(count, 5); i++) {
        imported.push({
          id: `part_imp_${Date.now()}_${idx}_${i}`,
          nome: count > 1 ? `Colaborador ${i} - ${f.func_nome}` : `Colaborador - ${f.func_nome}`,
          cpfOuMatricula: `MAT-${2000 + imported.length + 1}`,
          funcao: f.func_nome,
          setor: f.func_setor || company.setores?.[0]?.setor_nome || "",
          presente: true,
        });
      }
    });

    setActiveSession({
      ...activeSession,
      participantes: [...activeSession.participantes, ...imported],
    });

    if (onShowAlert) onShowAlert("success", `${imported.length} colaboradores importados com sucesso!`);
  };

  // Generate & Download PDF
  const handleDownloadPdf = (registro: DdsRegistro, printBlank = false) => {
    try {
      generateDdsPdf(company, registro, printBlank);
      if (onShowAlert) {
        onShowAlert(
          "success",
          printBlank
            ? "Folha de presença em branco gerada para impressão manual."
            : "PDF oficial do Diálogo de Segurança gerado com sucesso!"
        );
      }
    } catch (err: any) {
      console.error("Error generating DDS PDF:", err);
      alert("Erro ao gerar PDF do DDS: " + (err?.message || "Tente novamente."));
    }
  };

  // Filtered history
  const filteredDdsList = ddsList.filter((item) => {
    const term = historySearch.toLowerCase();
    return (
      item.temaTitulo.toLowerCase().includes(term) ||
      (item.localSetor && item.localSetor.toLowerCase().includes(term)) ||
      (item.ministranteNome && item.ministranteNome.toLowerCase().includes(term)) ||
      item.data.includes(term) ||
      (item.nrReferencia && item.nrReferencia.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner - 100% Standardized with NR-16 and NR-17 */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 p-4 sm:p-5 text-white shadow-xs border border-blue-800/40 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300 backdrop-blur-xs border border-white/10">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>NR-01 • Item 1.4.1 (GRO/PGR)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Diálogo de Segurança (DDS / DSS / DMS)
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 max-w-2xl leading-relaxed">
              Gestão completa de Diálogos de Segurança com catálogo de temas normativos, roteiro completo de leitura oral para o ministrante, lista de presença com assinaturas na tela em tamanho otimizado para caber múltiplas em folha única, e geração de PDF para arquivamento e auditoria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => handleStartNewDds()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Diálogo (DDS)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsThemeManagerOpen(true)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xs border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
            >
              <BookOpen className="h-4 w-4 text-blue-300" />
              <span>Catálogo de Temas & IA</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Metric Tiles */}
        <div className="mt-3.5 pt-3 border-t border-blue-800/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-[11px] text-blue-200">DDS Realizados</span>
            <p className="text-base font-bold text-white mt-0.5">{ddsList.length}</p>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-[11px] text-blue-200">Assinaturas Coletadas</span>
            <p className="text-base font-bold text-emerald-400 mt-0.5">
              {ddsList.reduce(
                (acc, curr) => acc + curr.participantes.filter((p) => Boolean(p.assinaturaImg)).length,
                0
              )}
            </p>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-[11px] text-blue-200">Temas no Catálogo</span>
            <p className="text-base font-bold text-white mt-0.5">
              {CATALOGO_DDS_TEMAS.length + customTemas.length}
            </p>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-[11px] text-blue-200">Empresa Selecionada</span>
            <p className="text-xs font-bold text-white mt-0.5 truncate">
              {company.empresa?.emp_razao || "Empresa Ativa"}
            </p>
          </div>
        </div>
      </div>

      {/* ACTIVE DDS SESSION EDITOR (When creating or editing) */}
      {isEditing && activeSession && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-500/40 shadow-xl p-4 sm:p-6 space-y-5 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Registro e Condução do Diálogo de Segurança
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Faça a leitura oral do roteiro, colete as assinaturas na tela e gere a ata em PDF
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex h-9 items-center justify-center px-3.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleSaveSession}
                className="inline-flex h-9 items-center justify-center gap-1.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Salvar Diálogo</span>
              </button>
            </div>
          </div>

          {/* Theme Information & Full Spoken Reading Script */}
          <div className="bg-slate-50 dark:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Tema e Roteiro de Apresentação
              </span>
              <button
                type="button"
                onClick={() => setIsThemeManagerOpen(true)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Trocar ou Escolher no Catálogo (500+ Temas & IA)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Diálogo *
                </label>
                <input
                  type="text"
                  value={activeSession.temaTitulo}
                  onChange={(e) =>
                    setActiveSession({ ...activeSession, temaTitulo: e.target.value })
                  }
                  placeholder="Ex: Trabalho em Altura e Inspeção de Talabartes"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Norma de Referência (NR)
                </label>
                <input
                  type="text"
                  value={activeSession.nrReferencia || ""}
                  onChange={(e) =>
                    setActiveSession({ ...activeSession, nrReferencia: e.target.value })
                  }
                  placeholder="Ex: NR-35 / NR-01"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* FULL SPOKEN DIALOGUE TEXT SECTION */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Conteúdo / Síntese dos Pontos Discutidos (Roteiro Completo para Leitura do Ministrante)
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Texto completo e fluente para o facilitador ler em voz alta durante a reunião de 10 a 15 minutos com a equipe.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsReadingModalOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
                    title="Abrir teleprompter em tela cheia com cronômetro para ler para a equipe"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Modo Leitura (Teleprompter)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExpandDialogueWithAi}
                    disabled={isExpandingAi}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    title="Expandir anotações ou tópicos curtos em um roteiro completo falado usando IA"
                  >
                    {isExpandingAi ? (
                      <>
                        <div className="h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span>Expandindo com IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Expandir com IA</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySpokenScript}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
                    title="Copiar texto para área de transferência"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-500" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                rows={9}
                value={activeSession.temaConteudo}
                onChange={(e) =>
                  setActiveSession({ ...activeSession, temaConteudo: e.target.value })
                }
                placeholder="Roteiro completo do Diálogo de Segurança para leitura oral pelo facilitador (abertura, contextualização dos perigos, medidas preventivas, normas e compromisso de segurança)..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-3 text-xs sm:text-sm text-slate-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-blue-500 transition-all"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                <span>
                  {activeSession.temaConteudo ? activeSession.temaConteudo.split(/\s+/).filter(Boolean).length : 0} palavras • {activeSession.temaConteudo?.length || 0} caracteres
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  Tempo estimado de fala: ~{Math.max(1, Math.ceil((activeSession.temaConteudo?.split(/\s+/).filter(Boolean).length || 0) / 120))} min
                </span>
              </div>
            </div>
          </div>

          {/* Session Logistics Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Frequência / Periodicidade
              </label>
              <select
                value={activeSession.frequencia}
                onChange={(e) =>
                  setActiveSession({
                    ...activeSession,
                    frequencia: e.target.value as any,
                  })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="Diário (DDS)">Diário (DDS)</option>
                <option value="Semanal (DSS)">Semanal (DSS)</option>
                <option value="Mensal (DMS)">Mensal (DMS)</option>
                <option value="Quinzenal">Quinzenal</option>
                <option value="Extraordinário / Alinhamento Crítico">
                  Extraordinário / Alinhamento Crítico
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Data de Realização
              </label>
              <input
                type="date"
                value={activeSession.data}
                onChange={(e) =>
                  setActiveSession({ ...activeSession, data: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Local / Setor / Frente de Obra
              </label>
              <input
                type="text"
                value={activeSession.localSetor || ""}
                onChange={(e) =>
                  setActiveSession({ ...activeSession, localSetor: e.target.value })
                }
                placeholder="Ex: Galpão de Produção / Obra Bloco A"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Horário (Início às Término)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={activeSession.horarioInicio || "07:30"}
                  onChange={(e) =>
                    setActiveSession({ ...activeSession, horarioInicio: e.target.value })
                  }
                  className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-xs text-slate-900 dark:text-white"
                />
                <span className="text-xs text-slate-400">às</span>
                <input
                  type="time"
                  value={activeSession.horarioTermino || "07:45"}
                  onChange={(e) =>
                    setActiveSession({ ...activeSession, horarioTermino: e.target.value })
                  }
                  className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Facilitador / Ministrante *
              </label>
              <input
                type="text"
                value={activeSession.ministranteNome}
                onChange={(e) =>
                  setActiveSession({ ...activeSession, ministranteNome: e.target.value })
                }
                placeholder="Nome do Técnico ou Supervisor"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assinatura do Facilitador
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenSignature("facilitator")}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <PenTool className="h-3.5 w-3.5 text-blue-600" />
                  <span>
                    {activeSession.ministranteAssinaturaImg ? "Assinado ✓ (Alterar)" : "Assinar na Tela"}
                  </span>
                </button>
                {activeSession.ministranteAssinaturaImg && (
                  <div className="h-9 w-16 bg-white rounded-lg border border-slate-200 p-0.5 overflow-hidden flex items-center justify-center shadow-2xs">
                    <img
                      src={activeSession.ministranteAssinaturaImg}
                      alt="Assinatura"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* WORKERS & PARTICIPANTS SIGNATURE SECTION */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Lista de Presença e Assinaturas dos Trabalhadores ({activeSession.participantes.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeSession.participantes.filter((p) => Boolean(p.assinaturaImg)).length} de{" "}
                  {activeSession.participantes.length} assinaram digitalmente na tela
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="inline-flex h-10 items-center justify-center gap-1.5 px-3.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 rounded-xl transition-all cursor-pointer shadow-2xs"
                  title="Cadastrar trabalhadores falando no microfone (sem guardar áudio)"
                >
                  <Mic className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                  <span>Cadastrar por Voz (Microfone)</span>
                </button>

                <button
                  type="button"
                  onClick={handleImportAllCompanyWorkers}
                  className="inline-flex h-10 items-center justify-center gap-1.5 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <Layers className="h-4 w-4 text-blue-600" />
                  <span>Importar da Empresa</span>
                </button>

                {activeSession.participantes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleOpenSignature("worker", 0, true)}
                    className="inline-flex h-10 items-center justify-center gap-1.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <PenTool className="h-4 w-4" />
                    <span>Assinatura Rápida em Fila</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Add Inline Worker */}
            <form
              onSubmit={handleAddQuickWorker}
              className="grid grid-cols-1 sm:grid-cols-5 gap-2 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-800"
            >
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  value={quickWorkerName}
                  onChange={(e) => setQuickWorkerName(e.target.value)}
                  placeholder="Nome completo do trabalhador *"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={quickWorkerCpf}
                  onChange={(e) => setQuickWorkerCpf(e.target.value)}
                  placeholder="CPF ou Matrícula"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={quickWorkerRole}
                  onChange={(e) => setQuickWorkerRole(e.target.value)}
                  placeholder="Função / Cargo"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center gap-1.5 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar</span>
              </button>
            </form>

            {/* Workers Table (High density compact layout) */}
            {activeSession.participantes.length > 0 ? (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">Nº</th>
                        <th className="py-2.5 px-3">Nome do Trabalhador</th>
                        <th className="py-2.5 px-3">CPF / Matrícula</th>
                        <th className="py-2.5 px-3">Função</th>
                        <th className="py-2.5 px-3">Setor</th>
                        <th className="py-2.5 px-3 text-center">Assinatura na Tela</th>
                        <th className="py-2.5 px-2 w-12 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {activeSession.participantes.map((part, idx) => (
                        <tr key={part.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                          <td className="py-2 px-3 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                            {part.nome}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                            {part.cpfOuMatricula || "-"}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                            {part.funcao || "-"}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                            {part.setor || "-"}
                          </td>
                          <td className="py-1.5 px-3 text-center">
                            {part.assinaturaImg ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="h-7 w-20 bg-white rounded border border-slate-200 p-0.5 overflow-hidden flex items-center justify-center">
                                  <img
                                    src={part.assinaturaImg}
                                    alt="Assinatura"
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleOpenSignature("worker", idx, false)}
                                  className="text-[10px] text-blue-600 hover:underline font-medium cursor-pointer"
                                >
                                  Refazer
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenSignature("worker", idx, false)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                              >
                                <PenTool className="h-3 w-3" />
                                <span>Assinar</span>
                              </button>
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = activeSession.participantes.filter((_, i) => i !== idx);
                                setActiveSession({
                                  ...activeSession,
                                  participantes: updated,
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                              title="Remover trabalhador"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-850 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <Users className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nenhum trabalhador cadastrado nesta sessão de DDS
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
                  Clique em <strong>"Importar da Empresa"</strong> para carregar os trabalhadores automaticamente ou adicione manualmente no formulário acima.
                </p>
              </div>
            )}
          </div>

          {/* Standardized Full-Width Action Bar */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full">
              <button
                type="button"
                onClick={() => handleDownloadPdf(activeSession, false)}
                className="inline-flex h-11 w-full items-center justify-center gap-2 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Gerar PDF com Assinaturas</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadPdf(activeSession, true)}
                title="Imprimir folha para assinatura manual com caneta"
                className="inline-flex h-11 w-full items-center justify-center gap-2 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <Printer className="h-4 w-4 text-slate-500" />
                <span>Imprimir Folha em Branco</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReadingModalOpen(true)}
                className="inline-flex h-11 w-full items-center justify-center gap-2 px-4 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-all cursor-pointer"
              >
                <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Modo Leitura (Facilitador)</span>
              </button>

              <button
                type="button"
                onClick={handleSaveSession}
                className="inline-flex h-11 w-full items-center justify-center gap-2 px-5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Salvar no Histórico</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DDS HISTORY & ARCHIVE LIST */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Histórico de Diálogos de Segurança Realizados ({ddsList.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Arquivo probatório digital conforme exigências da NR-01 e auditorias do MTE
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Buscar por tema, data, ministrante..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {filteredDdsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredDdsList.map((item) => {
              const totalAssinados = item.participantes.filter((p) => Boolean(p.assinaturaImg)).length;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-blue-300 dark:hover:border-blue-700 shadow-2xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-200">
                          {item.frequencia}
                        </span>
                        {item.nrReferencia && (
                          <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {item.nrReferencia}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {item.data}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSession(item);
                            setIsEditing(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Editar DDS"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSession(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Excluir DDS"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 mb-1">
                      {item.temaTitulo}
                    </h4>

                    <div className="text-[11.5px] text-slate-500 dark:text-slate-400 space-y-0.5 mb-3">
                      {item.localSetor && (
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>Local: {item.localSetor}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 truncate">
                        <User className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>Facilitador: {item.ministranteNome}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2
                        className={`h-4 w-4 ${
                          totalAssinados > 0 ? "text-emerald-600" : "text-slate-300"
                        }`}
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {totalAssinados} / {item.participantes.length} assinados
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(item, false)}
                      className="inline-flex h-8 items-center gap-1.5 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-all cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Baixar PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center bg-slate-50 dark:bg-slate-850 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <ShieldAlert className="h-10 w-10 text-slate-400 mx-auto mb-2 opacity-40" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              Nenhum Diálogo de Segurança registrado ainda
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Inicie um novo DDS clicando no botão abaixo para escolher entre os temas normativos ou gerar com IA.
            </p>
            <button
              type="button"
              onClick={() => handleStartNewDds()}
              className="mt-4 inline-flex h-10 items-center gap-1.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Criar Primeiro Diálogo de Segurança</span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL: Full Screen Reading / Teleprompter Mode */}
      {activeSession && (
        <DdsReadingModal
          isOpen={isReadingModalOpen}
          onClose={() => setIsReadingModalOpen(false)}
          temaTitulo={activeSession.temaTitulo}
          temaConteudo={activeSession.temaConteudo}
          nrReferencia={activeSession.nrReferencia}
          ministranteNome={activeSession.ministranteNome}
          empresaNome={company.empresa?.emp_razao}
        />
      )}

      {/* MODAL: Signature Canvas */}
      <SignatureCanvasModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        title={
          signatureTarget.type === "facilitator"
            ? "Assinatura do Facilitador SST"
            : signatureTarget.queueMode
            ? "Assinatura Digital Rápida em Fila"
            : "Assinatura Digital do Trabalhador"
        }
        workerName={
          signatureTarget.type === "facilitator"
            ? activeSession?.ministranteNome
            : signatureTarget.workerIndex !== undefined && activeSession?.participantes[signatureTarget.workerIndex]
            ? activeSession.participantes[signatureTarget.workerIndex].nome
            : undefined
        }
        workerRole={
          signatureTarget.type === "facilitator"
            ? activeSession?.ministranteCargo
            : signatureTarget.workerIndex !== undefined && activeSession?.participantes[signatureTarget.workerIndex]
            ? activeSession.participantes[signatureTarget.workerIndex].funcao
            : undefined
        }
        onSaveSignature={handleSaveSignature}
        queueMode={Boolean(signatureTarget.queueMode)}
        queueList={activeSession?.participantes || []}
        currentQueueIndex={signatureTarget.workerIndex || 0}
        onSaveAndNext={handleSaveAndNextInQueue}
      />

      {/* MODAL: Voice Worker Registration */}
      <VoiceWorkerModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onAddWorkers={handleAddVoiceWorkers}
        defaultSetor={activeSession?.localSetor || company.setores?.[0]?.setor_nome || ""}
        onAlert={onShowAlert}
      />

      {/* MODAL: Theme Catalog & AI Theme Manager */}
      <DdsThemeManagerModal
        isOpen={isThemeManagerOpen}
        onClose={() => setIsThemeManagerOpen(false)}
        customTemas={customTemas}
        onSaveCustomTema={handleSaveCustomTema}
        onDeleteCustomTema={handleDeleteCustomTema}
        onSelectTema={handleSelectTheme}
        empresaRamo={company.empresa?.emp_cnae}
      />
    </div>
  );
};
