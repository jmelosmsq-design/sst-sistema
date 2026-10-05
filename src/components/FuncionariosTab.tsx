import React, { useState, useRef } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  FileSpreadsheet,
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Stethoscope,
  Trash2,
  Edit3,
  Check,
  X,
  Building2,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  Shield,
  FileUp,
  ClipboardCheck,
  UserCheck,
  UserX,
  FileDown,
  RefreshCw,
  Info,
  Truck,
  FileCode,
} from "lucide-react";
import { Company, FuncionarioData, SetorData, FuncaoData } from "../types";

interface FuncionariosTabProps {
  company: Company | null;
  onUpdateCompany: (updated: Company) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
  onNavigateToPcmsoWithWorker?: (worker: FuncionarioData) => void;
  onNavigateToEsocialWithWorker?: (worker: FuncionarioData, tipoEvento?: "S-2210" | "S-2220" | "S-2240" | "S-2221") => void;
}

export const FuncionariosTab: React.FC<FuncionariosTabProps> = ({
  company,
  onUpdateCompany,
  onAlert,
  onNavigateToPcmsoWithWorker,
  onNavigateToEsocialWithWorker,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSetor, setFilterSetor] = useState("");
  const [filterFuncao, setFilterFuncao] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  // Modais
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isAiImportModalOpen, setIsAiImportModalOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<FuncionarioData | null>(null);

  // Formulário Manual (Novo ou Editar) - Cadastro 100% completo eSocial SST
  const [formNome, setFormNome] = useState("");
  const [formCpf, setFormCpf] = useState("");
  const [formMatricula, setFormMatricula] = useState("");
  const [formRg, setFormRg] = useState("");
  const [formDataNasc, setFormDataNasc] = useState("");
  const [formSexo, setFormSexo] = useState<"M" | "F">("M");
  const [formSetorId, setFormSetorId] = useState("");
  const [formSetorNome, setFormSetorNome] = useState("");
  const [formFuncaoId, setFormFuncaoId] = useState("");
  const [formFuncaoNome, setFormFuncaoNome] = useState("");
  const [formCbo, setFormCbo] = useState("");
  const [formDataAdmissao, setFormDataAdmissao] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState<FuncionarioData["status"]>("Ativo");
  const [formObs, setFormObs] = useState("");

  // Dados Adicionais eSocial & Documentos Complementares
  const [formCtps, setFormCtps] = useState("");
  const [formCtpsSerie, setFormCtpsSerie] = useState("");
  const [formCtpsUf, setFormCtpsUf] = useState("");
  const [formPis, setFormPis] = useState("");
  const [formCategoriaEsocial, setFormCategoriaEsocial] = useState("101");
  const [formRegimeTrabalhista, setFormRegimeTrabalhista] = useState<"1 - CLT (RGPS)" | "2 - Estatutário (RPPS)">("1 - CLT (RGPS)");
  const [formCnhNumero, setFormCnhNumero] = useState("");
  const [formCnhCategoria, setFormCnhCategoria] = useState("");
  const [formCnhValidade, setFormCnhValidade] = useState("");
  const [formIsMotoristaProfissional, setFormIsMotoristaProfissional] = useState(false);

  // Estado do Modal de Importação com IA
  const [importMode, setImportMode] = useState<"upload" | "text">("upload");
  const [rawTextToImport, setRawTextToImport] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    base64: string;
    mimeType: string;
  } | null>(null);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [extractedWorkers, setExtractedWorkers] = useState<(Partial<FuncionarioData> & { selected: boolean })[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!company) {
    return (
      <div className="p-8 text-center text-slate-500">
        Selecione uma empresa para gerenciar os trabalhadores.
      </div>
    );
  }

  const funcionarios = company.funcionarios || [];
  const setores = company.setores || [];
  const funcoes = company.funcoes || [];
  const asos = company.asosRegistrados || [];

  // Cálculos de Status de Saúde (ASO)
  const getWorkerAsoStatus = (cpf: string, nome: string) => {
    const cleanCpf = cpf.replace(/\D/g, "");
    const workerAsos = asos.filter((a) => {
      const aCpf = (a.cpf || "").replace(/\D/g, "");
      return (cleanCpf && aCpf === cleanCpf) || (a.nomeEmpregado && a.nomeEmpregado.trim().toLowerCase() === nome.trim().toLowerCase());
    });

    if (workerAsos.length === 0) {
      return { status: "sem_aso", label: "Sem ASO", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" };
    }

    // Pega o ASO mais recente
    const sorted = [...workerAsos].sort((a, b) => new Date(b.dataRealizacao).getTime() - new Date(a.dataRealizacao).getTime());
    const latest = sorted[0];
    const validade = new Date(latest.dataValidade);
    const hoje = new Date();

    if (isNaN(validade.getTime())) {
      return { status: "valido", label: "ASO Registrado", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", date: latest.dataRealizacao };
    }

    if (validade < hoje) {
      return { status: "vencido", label: `ASO Vencido (${validade.toLocaleDateString("pt-BR")})`, color: "text-red-600 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800", date: latest.dataValidade };
    }

    const diffDays = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) {
      return { status: "atencao", label: `Vence em ${diffDays}d`, color: "text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800", date: latest.dataValidade };
    }

    return { status: "em_dia", label: `ASO em Dia (${validade.toLocaleDateString("pt-BR")})`, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", date: latest.dataValidade };
  };

  // Estatísticas Rápidas
  const totalTrabalhadores = funcionarios.length;
  const totalAtivos = funcionarios.filter((f) => f.status === "Ativo").length;
  const totalAfastados = funcionarios.filter((f) => f.status === "Afastado" || f.status === "Férias").length;
  const semOuVencidoAso = funcionarios.filter((f) => {
    const s = getWorkerAsoStatus(f.cpf, f.nome);
    return s.status === "sem_aso" || s.status === "vencido";
  }).length;

  // Filtros
  const filteredFuncionarios = funcionarios.filter((f) => {
    const matchesSearch =
      f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.cpf.includes(searchTerm) ||
      (f.matricula && f.matricula.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSetor = !filterSetor || f.setorNome === filterSetor || f.setorId === filterSetor;
    const matchesFuncao = !filterFuncao || f.funcaoNome === filterFuncao || f.funcaoId === filterFuncao;
    const matchesStatus = filterStatus === "todos" || f.status === filterStatus;

    return matchesSearch && matchesSetor && matchesFuncao && matchesStatus;
  });

  // Formatação de CPF
  const formatCpfInput = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  // Formatação de Telefone
  const formatPhoneInput = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  // Abrir Modal de Novo / Edição
  const handleOpenModal = (func?: FuncionarioData) => {
    if (func) {
      setEditingFuncionario(func);
      setFormNome(func.nome);
      setFormCpf(func.cpf);
      setFormMatricula(func.matricula || "");
      setFormRg(func.rg || "");
      setFormDataNasc(func.dataNascimento || "");
      setFormSexo(func.sexo === "F" ? "F" : "M");
      setFormSetorId(func.setorId || "");
      setFormSetorNome(func.setorNome || "");
      setFormFuncaoId(func.funcaoId || "");
      setFormFuncaoNome(func.funcaoNome || "");
      setFormCbo(func.cbo || "");
      setFormDataAdmissao(func.dataAdmissao || "");
      setFormTelefone(func.telefone || "");
      setFormEmail(func.email || "");
      setFormStatus(func.status || "Ativo");
      setFormObs(func.observacoes || "");
      // Novos campos eSocial
      setFormCtps(func.ctpsNumero || "");
      setFormCtpsSerie(func.ctpsSerie || "");
      setFormCtpsUf(func.ctpsUf || "SP");
      setFormPis(func.pisPasep || "");
      setFormCategoriaEsocial(func.categoriaEsocial || "101");
      setFormRegimeTrabalhista(func.regimeTrabalhista || "1 - CLT (RGPS)");
      setFormCnhNumero(func.cnhNumero || "");
      setFormCnhCategoria(func.cnhCategoria || "");
      setFormCnhValidade(func.cnhValidade || "");
      setFormIsMotoristaProfissional(!!func.isMotoristaProfissional);
    } else {
      setEditingFuncionario(null);
      setFormNome("");
      setFormCpf("");
      setFormMatricula("");
      setFormRg("");
      setFormDataNasc("");
      setFormSexo("M");
      setFormSetorId(setores[0]?.id || "");
      setFormSetorNome(setores[0]?.setor_nome || "");
      setFormFuncaoId(funcoes[0]?.id || "");
      setFormFuncaoNome(funcoes[0]?.func_nome || "");
      setFormCbo(funcoes[0]?.func_cbo || "");
      setFormDataAdmissao(new Date().toISOString().slice(0, 10));
      setFormTelefone("");
      setFormEmail("");
      setFormStatus("Ativo");
      setFormObs("");
      // Novos campos eSocial
      setFormCtps("");
      setFormCtpsSerie("");
      setFormCtpsUf(company?.empresa?.emp_uf || "SP");
      setFormPis("");
      setFormCategoriaEsocial("101");
      setFormRegimeTrabalhista("1 - CLT (RGPS)");
      setFormCnhNumero("");
      setFormCnhCategoria("");
      setFormCnhValidade("");
      setFormIsMotoristaProfissional(false);
    }
    setIsManualModalOpen(true);
  };

  // Mudança de Função selecionada (atualiza CBO e Setor automaticamente se disponível)
  const handleSelectFuncao = (funcaoIdSelected: string) => {
    setFormFuncaoId(funcaoIdSelected);
    const matched = funcoes.find((f) => f.id === funcaoIdSelected);
    if (matched) {
      setFormFuncaoNome(matched.func_nome);
      if (matched.func_cbo) {
        setFormCbo(matched.func_cbo);
        // Detecta se é motorista profissional pelo CBO (famílias 7823, 7824, 7825)
        const cleanCbo = matched.func_cbo.replace(/\D/g, "");
        if (cleanCbo.startsWith("7823") || cleanCbo.startsWith("7824") || cleanCbo.startsWith("7825")) {
          setFormIsMotoristaProfissional(true);
        }
      }
      if (matched.func_setor) {
        setFormSetorNome(matched.func_setor);
        const matchedSetor = setores.find((s) => s.setor_nome === matched.func_setor);
        if (matchedSetor) setFormSetorId(matchedSetor.id);
      }
    }
  };

  // Salvar Trabalhador
  const handleSaveFuncionario = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNome.trim()) {
      onAlert("error", "O nome do trabalhador é obrigatório.");
      return;
    }

    const cleanCpf = formCpf.replace(/\D/g, "");
    if (cleanCpf.length > 0 && cleanCpf.length !== 11) {
      onAlert("error", "O CPF deve conter exatamente 11 dígitos para conformidade com o eSocial.");
      return;
    }

    const newWorker: FuncionarioData = {
      id: editingFuncionario ? editingFuncionario.id : `func_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      nome: formNome.trim(),
      cpf: formCpf.trim() || "000.000.000-00",
      matricula: formMatricula.trim(),
      rg: formRg.trim(),
      dataNascimento: formDataNasc,
      sexo: formSexo || "M",
      setorId: formSetorId,
      setorNome: formSetorNome || "Geral",
      funcaoId: formFuncaoId,
      funcaoNome: formFuncaoNome || "Geral",
      cbo: formCbo.trim(),
      dataAdmissao: formDataAdmissao,
      telefone: formTelefone.trim(),
      email: formEmail.trim(),
      status: formStatus,
      observacoes: formObs.trim(),
      // Campos de conformidade completa eSocial
      ctpsNumero: formCtps.trim(),
      ctpsSerie: formCtpsSerie.trim(),
      ctpsUf: formCtpsUf.trim(),
      pisPasep: formPis.trim(),
      categoriaEsocial: formCategoriaEsocial,
      regimeTrabalhista: formRegimeTrabalhista,
      cnhNumero: formCnhNumero.trim(),
      cnhCategoria: formCnhCategoria.trim(),
      cnhValidade: formCnhValidade,
      isMotoristaProfissional: formIsMotoristaProfissional,
      updatedAt: new Date().toISOString(),
      createdAt: editingFuncionario?.createdAt || new Date().toISOString(),
    };

    let updatedList: FuncionarioData[];
    if (editingFuncionario) {
      updatedList = funcionarios.map((f) => (f.id === editingFuncionario.id ? newWorker : f));
      onAlert("success", `Cadastro de "${newWorker.nome}" atualizado com sucesso para o eSocial!`);
    } else {
      updatedList = [newWorker, ...funcionarios];
      onAlert("success", `Trabalhador "${newWorker.nome}" cadastrado com sucesso!`);
    }

    onUpdateCompany({
      ...company,
      funcionarios: updatedList,
    });

    setIsManualModalOpen(false);
  };

  // Excluir Trabalhador
  const handleDeleteFuncionario = (id: string, nome: string) => {
    if (confirm(`Deseja realmente remover o cadastro de "${nome}"?`)) {
      const updatedList = funcionarios.filter((f) => f.id !== id);
      onUpdateCompany({
        ...company,
        funcionarios: updatedList,
      });
      onAlert("info", `Trabalhador "${nome}" removido do cadastro.`);
    }
  };

  // Upload de Arquivo para IA
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedFile({
        name: file.name,
        size: file.size,
        base64: base64,
        mimeType: file.type || "application/octet-stream",
      });
    };
    reader.readAsDataURL(file);
  };

  // Executar Extração com IA
  const handleRunAiExtraction = async () => {
    if (importMode === "upload" && !uploadedFile) {
      onAlert("error", "Selecione um arquivo (planilha, PDF, DOCX ou imagem) para analisar.");
      return;
    }
    if (importMode === "text" && !rawTextToImport.trim()) {
      onAlert("error", "Cole o texto ou tabela de funcionários para análise.");
      return;
    }

    setIsProcessingAi(true);
    setAiSummary("");
    setExtractedWorkers([]);

    try {
      const response = await fetch("/api/trabalhadores/import-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: importMode === "text" ? rawTextToImport : undefined,
          fileBase64: importMode === "upload" ? uploadedFile?.base64 : undefined,
          mimeType: uploadedFile?.mimeType || "application/pdf",
          fileName: uploadedFile?.name || "documento",
          existingSetores: setores.map((s) => s.setor_nome),
          existingFuncoes: funcoes.map((f) => f.func_nome),
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "Falha na análise com IA.");
      }

      const rawWorkers: any[] = json.data?.trabalhadores || [];
      if (rawWorkers.length === 0) {
        onAlert("info", "Nenhum trabalhador foi identificado no documento. Tente colar o texto diretamente.");
        setIsProcessingAi(false);
        return;
      }

      // Reconciliar e preparar para confirmação
      const mapped = rawWorkers.map((w, index) => {
        // Tenta achar setor correspondente
        const foundSetor = setores.find(
          (s) => s.setor_nome.toLowerCase() === (w.setorNome || "").toLowerCase()
        );
        // Tenta achar função correspondente
        const foundFuncao = funcoes.find(
          (f) => f.func_nome.toLowerCase() === (w.funcaoNome || "").toLowerCase()
        );

        return {
          id: `imp_${Date.now()}_${index}`,
          nome: w.nome || `Trabalhador ${index + 1}`,
          cpf: w.cpf || "",
          matricula: w.matricula || "",
          rg: w.rg || "",
          dataNascimento: w.dataNascimento || "",
          sexo: (w.sexo === "F" ? "F" : w.sexo === "Outro" ? "Outro" : "M") as "M" | "F" | "Outro",
          setorId: foundSetor?.id || "",
          setorNome: foundSetor?.setor_nome || w.setorNome || setores[0]?.setor_nome || "Geral",
          funcaoId: foundFuncao?.id || "",
          funcaoNome: foundFuncao?.func_nome || w.funcaoNome || funcoes[0]?.func_nome || "Operacional",
          cbo: foundFuncao?.func_cbo || w.cbo || "",
          dataAdmissao: w.dataAdmissao || "",
          telefone: w.telefone || "",
          email: w.email || "",
          status: (w.status as any) || "Ativo",
          observacoes: w.observacoes || "",
          selected: true,
        };
      });

      setExtractedWorkers(mapped);
      setAiSummary(json.data?.resumo || `${mapped.length} trabalhadores detectados e higienizados pela IA!`);
      onAlert("success", `${mapped.length} trabalhadores identificados! Revise a lista abaixo.`);
    } catch (err: any) {
      console.error("AI Import error:", err);
      onAlert("error", err?.message || "Erro ao processar importação com IA.");
    } finally {
      setIsProcessingAi(false);
    }
  };

  // Confirmar Importação em Lote
  const handleConfirmBatchImport = () => {
    const toImport = extractedWorkers.filter((w) => w.selected);
    if (toImport.length === 0) {
      onAlert("error", "Selecione ao menos um trabalhador para importar.");
      return;
    }

    const formattedToImport: FuncionarioData[] = toImport.map((w) => ({
      id: `func_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      nome: w.nome || "Trabalhador",
      cpf: w.cpf || "",
      matricula: w.matricula || "",
      rg: w.rg || "",
      dataNascimento: w.dataNascimento || "",
      sexo: w.sexo || "M",
      setorId: w.setorId || "",
      setorNome: w.setorNome || "Geral",
      funcaoId: w.funcaoId || "",
      funcaoNome: w.funcaoNome || "Geral",
      cbo: w.cbo || "",
      dataAdmissao: w.dataAdmissao || "",
      telefone: w.telefone || "",
      email: w.email || "",
      status: w.status || "Ativo",
      observacoes: w.observacoes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const merged = [...formattedToImport, ...funcionarios];
    onUpdateCompany({
      ...company,
      funcionarios: merged,
    });

    onAlert("success", `${formattedToImport.length} trabalhadores foram incorporados à empresa com sucesso!`);
    setIsAiImportModalOpen(false);
    setExtractedWorkers([]);
    setUploadedFile(null);
    setRawTextToImport("");
  };

  return (
    <div className="space-y-5 pb-16 animate-fade-in">
      {/* CABEÇALHO DA ABA */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Trabalhadores & Colaboradores
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {totalTrabalhadores} cadastrados
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Base centralizada sincronizada com PCMSO, ASO, eSocial (S-2220 / S-2240) e NR-17
              </p>
            </div>
          </div>

          {/* Botões Principais de Ação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsAiImportModalOpen(true)}
              className="inline-flex h-11 sm:h-10 w-full items-center justify-center gap-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Importação Inteligente (IA)</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex h-11 sm:h-10 w-full items-center justify-center gap-1.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Novo Trabalhador</span>
            </button>
          </div>
        </div>

        {/* CARDS DE RESUMO ESTATÍSTICO */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total</span>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {totalTrabalhadores}
            </div>
            <span className="text-[10px] text-slate-400">No quadro geral</span>
          </div>

          <div className="rounded-xl p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <UserCheck className="h-3 w-3" />
              <span>Ativos</span>
            </span>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
              {totalAtivos}
            </div>
            <span className="text-[10px] text-emerald-600/80">Em atividade normal</span>
          </div>

          <div className="rounded-xl p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Afastados/Férias</span>
            </span>
            <div className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">
              {totalAfastados}
            </div>
            <span className="text-[10px] text-amber-600/80">Licença / Férias</span>
          </div>

          <div className="rounded-xl p-3 bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1">
              <Stethoscope className="h-3 w-3" />
              <span>Atenção ASO</span>
            </span>
            <div className="text-xl font-bold text-red-700 dark:text-red-400 mt-0.5">
              {semOuVencidoAso}
            </div>
            <span className="text-[10px] text-red-600/80">Sem ASO ou vencido</span>
          </div>
        </div>
      </div>

      {/* BARRA DE PESQUISA E FILTROS */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          {/* Campo de Busca */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 sm:h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtro por Setor */}
          <div>
            <select
              value={filterSetor}
              onChange={(e) => setFilterSetor(e.target.value)}
              className="w-full h-11 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 px-3 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">Todos os Setores</option>
              {setores.map((s) => (
                <option key={s.id} value={s.setor_nome}>
                  {s.setor_nome}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full h-11 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 px-3 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="todos">Todos os Status</option>
              <option value="Ativo">Ativo</option>
              <option value="Afastado">Afastado</option>
              <option value="Férias">Férias</option>
              <option value="Desligado">Desligado</option>
            </select>
          </div>
        </div>
      </div>

      {/* LISTA DE TRABALHADORES */}
      {filteredFuncionarios.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {searchTerm || filterSetor || filterStatus !== "todos"
                ? "Nenhum trabalhador encontrado para os filtros selecionados"
                : "Nenhum trabalhador cadastrado nesta empresa"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Cadastre os funcionários para alimentar automaticamente o PCMSO (NR-07), eSocial (S-2240) e NR-17.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAiImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Importar Planilha / PDF / Texto</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Cadastrar Manualmente</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredFuncionarios.map((f) => {
            const asoStatus = getWorkerAsoStatus(f.cpf, f.nome);

            return (
              <div
                key={f.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Informações Principais */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-slate-200 dark:border-slate-700">
                      {f.nome.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {f.nome}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            f.status === "Ativo"
                              ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
                              : f.status === "Afastado"
                              ? "text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"
                              : f.status === "Férias"
                              ? "text-blue-700 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800"
                              : "text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                          }`}
                        >
                          {f.status}
                        </span>

                        {/* Badge de Sexo */}
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {f.sexo === "F" ? "Fem (F)" : "Masc (M)"}
                        </span>

                        {/* Badge de ASO */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${asoStatus.color}`}
                        >
                          <Stethoscope className="h-3 w-3" />
                          <span>{asoStatus.label}</span>
                        </span>

                        {/* Badge de Conformidade eSocial */}
                        {f.cpf && f.cpf !== "000.000.000-00" && f.matricula ? (
                          <span
                            title="Cadastro contém CPF e Matrícula válidos para envio dos eventos S-2210, S-2220, S-2240 e S-2221"
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 text-blue-700 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800"
                          >
                            <Check className="h-3 w-3" />
                            <span>Apto eSocial</span>
                          </span>
                        ) : (
                          <span
                            title="Preencha CPF e Matrícula para permitir envio ao eSocial SST"
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            <span>Pendente eSocial</span>
                          </span>
                        )}

                        {/* Badge de Motorista Profissional */}
                        {f.isMotoristaProfissional && (
                          <span
                            title="Motorista profissional sujeito ao S-2221 (Exame Toxicológico)"
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 text-purple-700 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800"
                          >
                            <Truck className="h-3 w-3" />
                            <span>Motorista (S-2221)</span>
                          </span>
                        )}
                      </div>

                      {/* Detalhes de Cargo e Setor */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3 text-slate-400" />
                          <strong className="text-slate-700 dark:text-slate-300 font-semibold">{f.funcaoNome || "Sem Função"}</strong>
                          {f.cbo && <span className="text-[10px] text-slate-400">({f.cbo})</span>}
                        </span>

                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          <span>{f.setorNome || "Sem Setor"}</span>
                        </span>

                        {f.cpf && f.cpf !== "000.000.000-00" && (
                          <span className="text-slate-500 font-mono text-[11px]">
                            CPF: {f.cpf}
                          </span>
                        )}

                        {f.matricula && (
                          <span className="text-slate-500 text-[11px]">
                            Mat: {f.matricula}
                          </span>
                        )}

                        {f.email && (
                          <a
                            href={`mailto:${f.email}`}
                            title="Enviar e-mail para o trabalhador"
                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <Mail className="h-3 w-3" />
                            <span>{f.email}</span>
                          </a>
                        )}

                        {f.telefone && (
                          <a
                            href={`https://wa.me/55${f.telefone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir WhatsApp"
                            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            <span>{f.telefone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações Rápidas */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {onNavigateToPcmsoWithWorker && (
                      <button
                        type="button"
                        onClick={() => onNavigateToPcmsoWithWorker(f)}
                        title="Emitir ou lançar ASO no PCMSO para este trabalhador"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <Stethoscope className="h-3.5 w-3.5" />
                        <span>ASO</span>
                      </button>
                    )}

                    {onNavigateToEsocialWithWorker && (
                      <button
                        type="button"
                        onClick={() => onNavigateToEsocialWithWorker(f, f.isMotoristaProfissional ? "S-2221" : "S-2240")}
                        title="Gerar ou vincular eventos no eSocial SST"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <FileCode className="h-3.5 w-3.5" />
                        <span>eSocial</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenModal(f)}
                      title="Editar dados"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteFuncionario(f.id, f.nome)}
                      title="Remover trabalhador"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: CADASTRO / EDIÇÃO MANUAL COMPLETO eSocial SST */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {editingFuncionario ? "Editar Trabalhador" : "Novo Trabalhador (eSocial SST)"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dados completos para envio dos eventos S-2210, S-2220, S-2221 e S-2240
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFuncionario} className="space-y-4 text-xs">
              {/* BLOCO 1: DADOS PESSOAIS & CONTATO */}
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-[11px]">
                  <Users className="h-3.5 w-3.5" />
                  <span>1. Dados Pessoais & Contato (eSocial)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nome Completo do Trabalhador *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo de Oliveira"
                      value={formNome}
                      onChange={(e) => setFormNome(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sexo (Obrigatório eSocial) *
                    </label>
                    <select
                      value={formSexo}
                      onChange={(e) => setFormSexo(e.target.value as "M" | "F")}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="M">M - Masculino</option>
                      <option value="F">F - Feminino</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      CPF * (11 dígitos)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={formCpf}
                      onChange={(e) => setFormCpf(formatCpfInput(e.target.value))}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Data de Nascimento *
                    </label>
                    <input
                      type="date"
                      value={formDataNasc}
                      onChange={(e) => setFormDataNasc(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      RG / Órgão Emissor
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 12.345.678-9 SSP/SP"
                      value={formRg}
                      onChange={(e) => setFormRg(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      E-mail do Trabalhador (SST / eSocial)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="colaborador@empresa.com.br"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp / Telefone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="(11) 98765-4321"
                        value={formTelefone}
                        onChange={(e) => setFormTelefone(formatPhoneInput(e.target.value))}
                        className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOCO 2: VÍNCULO EMPREGATÍCIO & eSOCIAL */}
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
                    <Shield className="h-3.5 w-3.5" />
                    <span>2. Vínculo Empregatício & Chaves do eSocial</span>
                  </div>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    Eventos S-2210 / S-2220 / S-2221 / S-2240
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Matrícula no eSocial *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 00412"
                      value={formMatricula}
                      onChange={(e) => setFormMatricula(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Identificador nos XMLs</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Data de Admissão
                    </label>
                    <input
                      type="date"
                      value={formDataAdmissao}
                      onChange={(e) => setFormDataAdmissao(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      NIS / PIS / PASEP
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 123.45678.90-1"
                      value={formPis}
                      onChange={(e) => setFormPis(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Categoria do Trabalhador (Tabela 01 do eSocial)
                    </label>
                    <select
                      value={formCategoriaEsocial}
                      onChange={(e) => setFormCategoriaEsocial(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="101">101 - Empregado - Geral, inclusive público CLT</option>
                      <option value="102">102 - Empregado - Trabalhador Rural</option>
                      <option value="103">103 - Empregado - Aprendiz</option>
                      <option value="104">104 - Empregado - Doméstico</option>
                      <option value="106">106 - Empregado - Contrato a termo (Temporário)</option>
                      <option value="701">701 - Contribuinte Individual - Autônomo</option>
                      <option value="901">901 - Estagiário</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Regime Trabalhista / Previdenciário
                    </label>
                    <select
                      value={formRegimeTrabalhista}
                      onChange={(e) => setFormRegimeTrabalhista(e.target.value as any)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="1 - CLT (RGPS)">1 - CLT / RGPS</option>
                      <option value="2 - Estatutário (RPPS)">2 - Estatutário / RPPS</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BLOCO 3: CARGO, SETOR E CBO */}
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>3. Cargo, Lotação e Classificação Ocupacional</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Função / Cargo *
                    </label>
                    <select
                      value={formFuncaoId}
                      onChange={(e) => handleSelectFuncao(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="">Selecione uma função cadastrada...</option>
                      {funcoes.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.func_nome} {f.func_cbo ? `(CBO: ${f.func_cbo})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Setor / Ambiente de Trabalho *
                    </label>
                    <select
                      value={formSetorId}
                      onChange={(e) => {
                        setFormSetorId(e.target.value);
                        const s = setores.find((item) => item.id === e.target.value);
                        if (s) setFormSetorNome(s.setor_nome);
                      }}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="">Selecione um setor cadastrado...</option>
                      {setores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.setor_nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Código CBO Oficial (MTE / eSocial) *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 7241-10 ou 7825-10"
                      value={formCbo}
                      onChange={(e) => {
                        setFormCbo(e.target.value);
                        const digits = e.target.value.replace(/\D/g, "");
                        if (digits.startsWith("7823") || digits.startsWith("7824") || digits.startsWith("7825")) {
                          setFormIsMotoristaProfissional(true);
                        }
                      }}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Status Funcional
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Afastado">Afastado (INSS / Doença)</option>
                      <option value="Férias">Em Férias</option>
                      <option value="Desligado">Desligado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BLOCO 4: DOCUMENTOS COMPLEMENTARES & MOTORISTA PROFISSIONAL (S-2221) */}
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider text-[11px]">
                    <Truck className="h-3.5 w-3.5" />
                    <span>4. Documentos & Exame Toxicológico (Evento S-2221)</span>
                  </div>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                    Portaria MTE 612/2024
                  </span>
                </div>

                {/* CTPS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      CTPS Número
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 1234567"
                      value={formCtps}
                      onChange={(e) => setFormCtps(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      CTPS Série
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 0010"
                      value={formCtpsSerie}
                      onChange={(e) => setFormCtpsSerie(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      CTPS UF
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="UF (ex: SP)"
                      value={formCtpsUf}
                      onChange={(e) => setFormCtpsUf(e.target.value.toUpperCase())}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs uppercase text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Switch de Motorista Profissional */}
                <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-2.5">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsMotoristaProfissional}
                      onChange={(e) => setFormIsMotoristaProfissional(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-300">
                        Atividade de Motorista Profissional (Exame Toxicológico Obrigatório - Evento S-2221)
                      </span>
                      <p className="text-[11px] text-purple-700 dark:text-purple-400">
                        Marque se o colaborador opera veículos rodoviários de carga ou passageiros (CBOs 7823, 7824, 7825). Requer dados da CNH para envio do S-2221.
                      </p>
                    </div>
                  </label>

                  {formIsMotoristaProfissional && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-purple-200/60 dark:border-purple-800/40">
                      <div>
                        <label className="block text-[11px] font-bold text-purple-900 dark:text-purple-300 mb-1">
                          Número da CNH
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 01234567890"
                          value={formCnhNumero}
                          onChange={(e) => setFormCnhNumero(e.target.value)}
                          className="w-full h-8 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 px-2.5 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-purple-900 dark:text-purple-300 mb-1">
                          Categoria CNH
                        </label>
                        <select
                          value={formCnhCategoria}
                          onChange={(e) => setFormCnhCategoria(e.target.value)}
                          className="w-full h-8 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 px-2 text-xs font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="">Selecione...</option>
                          <option value="B">B - Automóveis</option>
                          <option value="C">C - Carga / Caminhão</option>
                          <option value="D">D - Passageiros / Ônibus</option>
                          <option value="E">E - Carreta / Articulados</option>
                          <option value="AB">AB - Moto e Carro</option>
                          <option value="AC">AC - Moto e Caminhão</option>
                          <option value="AD">AD - Moto e Ônibus</option>
                          <option value="AE">AE - Moto e Carreta</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-purple-900 dark:text-purple-300 mb-1">
                          Validade da CNH
                        </label>
                        <input
                          type="date"
                          value={formCnhValidade}
                          onChange={(e) => setFormCnhValidade(e.target.value)}
                          className="w-full h-8 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 px-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* BLOCO 5: OBSERVAÇÕES */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Observações Gerais
                </label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais do trabalhador, restrições ou anotações..."
                  value={formObs}
                  onChange={(e) => setFormObs(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  <span>{editingFuncionario ? "Salvar Alterações" : "Cadastrar Trabalhador"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPORTAÇÃO INTELIGENTE COM IA (QUALQUER PLANILHA, PDF, DOCX OU TEXTO) */}
      {isAiImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Importação Inteligente com IA
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Carregue qualquer arquivo ou cole texto: a IA extrai e higieniza mesmo com dados incompletos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Explicação de Tolerância */}
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 p-3 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Tolerância Total a Dados Incompletos:</strong> Você pode importar planilhas (Excel/CSV), relatórios de folha em PDF, documentos DOCX ou listas coladas. Mesmo que falte CPF, matrícula ou setor, o sistema aproveita tudo o que encontrar!
              </span>
            </div>

            {/* Alternância de Modo (Upload vs Colar Texto) */}
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setImportMode("upload")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  importMode === "upload"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Upload de Arquivo (PDF / Excel / DOCX / Foto)</span>
              </button>
              <button
                type="button"
                onClick={() => setImportMode("text")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  importMode === "text"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Colar Texto ou Tabela</span>
              </button>
            </div>

            {/* Conteúdo do Modo Upload */}
            {importMode === "upload" && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls,.csv,.pdf,.docx,.doc,.txt,image/*"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/30"
                >
                  <FileUp className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Clique para selecionar ou arraste o arquivo aqui
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Suporta: Excel (.xlsx, .xls, .csv), PDF, Word (.docx), TXT ou foto de ficha
                  </p>
                </div>

                {uploadedFile && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">{uploadedFile.name}</strong>
                        <span className="text-[10px] text-slate-400 block">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Conteúdo do Modo Texto */}
            {importMode === "text" && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Cole o texto, tabela do Excel ou relatório abaixo:
                </label>
                <textarea
                  rows={6}
                  placeholder={`Exemplo de dados colados:\nJoão da Silva\t123.456.789-00\tSoldador\tManutenção\nMaria Souza\t987.654.321-11\tAuxiliar de Limpeza\tAdministração`}
                  value={rawTextToImport}
                  onChange={(e) => setRawTextToImport(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Botão de Processamento IA */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleRunAiExtraction}
                disabled={isProcessingAi || (importMode === "upload" && !uploadedFile) || (importMode === "text" && !rawTextToImport.trim())}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                {isProcessingAi ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Lendo e higienizando dados com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Analisar e Extrair Trabalhadores com IA</span>
                  </>
                )}
              </button>
            </div>

            {/* PRÉ-VISUALIZAÇÃO DOS TRABALHADORES DETECTADOS */}
            {extractedWorkers.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>{extractedWorkers.length} Trabalhadores Encontrados</span>
                    </h4>
                    {aiSummary && <p className="text-[11px] text-slate-500">{aiSummary}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExtractedWorkers((prev) => prev.map((w) => ({ ...w, selected: !prev.every((p) => p.selected) })))
                      }
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      {extractedWorkers.every((w) => w.selected) ? "Desmarcar Todos" : "Marcar Todos"}
                    </button>
                  </div>
                </div>

                {/* Tabela de Revisão */}
                <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                  {extractedWorkers.map((w, idx) => (
                    <div
                      key={w.id || idx}
                      className={`p-2.5 flex items-center justify-between gap-2 text-xs transition-colors ${
                        w.selected ? "bg-white dark:bg-slate-800/60" : "bg-slate-50 dark:bg-slate-900 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={w.selected}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setExtractedWorkers((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, selected: val } : item))
                            );
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="min-w-0">
                          <strong className="text-slate-800 dark:text-slate-100 truncate block">
                            {w.nome}
                          </strong>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                            <span>Cargo: <strong>{w.funcaoNome || "Operacional"}</strong></span>
                            <span>Setor: <strong>{w.setorNome || "Geral"}</strong></span>
                            {w.cpf ? (
                              <span>CPF: {w.cpf}</span>
                            ) : (
                              <span className="text-amber-600 font-semibold">(Sem CPF)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Pronto
                      </span>
                    </div>
                  ))}
                </div>

                {/* Botão de Confirmação Final */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAiImportModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Descartar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmBatchImport}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    Confirmar e Importar {extractedWorkers.filter((w) => w.selected).length} Trabalhadores
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
