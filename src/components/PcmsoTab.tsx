import React, { useState, useEffect, useRef } from "react";
import {
  Stethoscope,
  FileCheck2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Download,
  User,
  Shield,
  Clock,
  Search,
  Activity,
  HeartPulse,
  Syringe,
  FileSpreadsheet,
  Edit3,
  Check,
  Building2,
  AlertTriangle,
  MessageSquare,
  Mail,
  Phone,
  Bell,
  CalendarCheck,
  CalendarClock,
  Share2,
  FileText,
  Copy,
  ExternalLink,
  Filter,
  Smartphone,
  Info,
  Clock4,
  Users,
  Send,
  Sparkles,
  UploadCloud,
  RefreshCw,
  FileUp,
  Camera,
} from "lucide-react";
import { Company, PcmsoRegistroAso, PcmsoExameProtocolo, FuncaoData, FuncionarioData } from "../types";
import {
  generatePcmsoDocumentoBasePdf,
  generateAsoIndividualPdf,
  generateConvocacaoAsoPdf,
} from "../services/pcmsoPdfGenerator";
import { AsoEncaminhamentoSection } from "./AsoEncaminhamentoSection";

interface PcmsoTabProps {
  company: Company | null;
  onUpdateCompany: (updated: Company) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
  companies?: Company[];
  onUpdateAllCompanies?: (updatedList: Company[]) => void;
  preSelectedWorker?: FuncionarioData | null;
  onClearPreSelectedWorker?: () => void;
}

export const PcmsoTab: React.FC<PcmsoTabProps> = ({
  company,
  onUpdateCompany,
  onAlert,
  companies = [],
  onUpdateAllCompanies,
  preSelectedWorker,
  onClearPreSelectedWorker,
}) => {
  const [activeSubSection, setActiveSubSection] = useState<
    "protocolos" | "asos" | "vencimentos" | "cronograma" | "coordenacao" | "encaminhamentos"
  >("encaminhamentos");
  const [isNovoAsoModalOpen, setIsNovoAsoModalOpen] = useState(false);
  const [isAddExameModalOpen, setIsAddExameModalOpen] = useState(false);
  const [selectedFuncaoIdForExame, setSelectedFuncaoIdForExame] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroVencimento, setFiltroVencimento] = useState<
    "todos" | "vencidos" | "urgente" | "atencao" | "em_dia"
  >("todos");

  // Modal de Notificação Individual
  const [notifyingAso, setNotifyingAso] = useState<PcmsoRegistroAso | null>(null);
  const [customMsgNota, setCustomMsgNota] = useState("");
  const [clinicaCustom, setClinicaCustom] = useState("");

  // Modal de Notificação em Lote para o RH
  const [isRhBatchModalOpen, setIsRhBatchModalOpen] = useState(false);

  // Dados do Médico Coordenador (Edição inline)
  const emp = company?.empresa || {};
  const [medicoNome, setMedicoNome] = useState(
    emp.emp_medico_coordenador || emp.emp_ass_tec_nome || emp.emp_tecnico || "Dr. Roberto Albuquerque Mendes"
  );
  const [medicoCrm, setMedicoCrm] = useState(emp.emp_medico_crm || "CRM/SP 148.920");
  const [isEditingMedico, setIsEditingMedico] = useState(false);

  // Formulário de Novo Exame no Protocolo
  const [novoExameNome, setNovoExameNome] = useState("");
  const [novoExamePeriodicidade, setNovoExamePeriodicidade] = useState<PcmsoExameProtocolo["periodicidade"]>("Periódico Anual");
  const [novoExameCriterio, setNovoExameCriterio] = useState("");

  // Formulário de Novo ASO
  const [nomeEmpregado, setNomeEmpregado] = useState("");
  const [cpf, setCpf] = useState("");
  const [matricula, setMatricula] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [funcaoId, setFuncaoId] = useState("");
  const [tipoAso, setTipoAso] = useState<PcmsoRegistroAso["tipoAso"]>("Periódico");
  const [periodicidadeMeses, setPeriodicidadeMeses] = useState<number>(12);
  const [dataRealizacao, setDataRealizacao] = useState(new Date().toISOString().slice(0, 10));
  const [dataValidadeManual, setDataValidadeManual] = useState("");
  const [clinicaExame, setClinicaExame] = useState("Clínica de Medicina do Trabalho Credenciada");
  const [resultado, setResultado] = useState<PcmsoRegistroAso["resultado"]>("Apto");
  const [restricoes, setRestricoes] = useState("");
  const [medicoExaminador, setMedicoExaminador] = useState(medicoNome);
  const [crmExaminador, setCrmExaminador] = useState(medicoCrm);

  // Estados de Escaneamento e Reconhecimento de ASO via IA (Foto/PDF)
  const [isScanningAso, setIsScanningAso] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scannedFileName, setScannedFileName] = useState("");
  const asoFileInputRef = useRef<HTMLInputElement>(null);

  // Sincronização quando aberto a partir de Trabalhadores
  useEffect(() => {
    if (preSelectedWorker) {
      setNomeEmpregado(preSelectedWorker.nome);
      setCpf(preSelectedWorker.cpf || "");
      setMatricula(preSelectedWorker.matricula || "");
      setTelefone(preSelectedWorker.telefone || "");
      setEmail(preSelectedWorker.email || "");
      setDataNascimento(preSelectedWorker.dataNascimento || "");
      if (preSelectedWorker.funcaoId) {
        setFuncaoId(preSelectedWorker.funcaoId);
      } else {
        const matched = (company?.funcoes || []).find(
          (f) => f.func_nome.toLowerCase() === (preSelectedWorker.funcaoNome || "").toLowerCase()
        );
        if (matched) setFuncaoId(matched.id);
      }
      setActiveSubSection("asos");
      setIsNovoAsoModalOpen(true);
      onClearPreSelectedWorker?.();
    }
  }, [preSelectedWorker]);

  if (!company) {
    return (
      <div className="p-8 text-center text-slate-500">
        Selecione uma empresa para acessar o módulo PCMSO.
      </div>
    );
  }

  const funcoes = company.funcoes || [];
  const asos = company.asosRegistrados || [];
  const pcmsoProtocolos = company.pcmsoProtocolos || {};

  // Função auxiliar para calcular exames recomendados baseados no PGR
  const getExamesRecomendadosParaFuncao = (func: FuncaoData): PcmsoExameProtocolo[] => {
    const customList = pcmsoProtocolos[func.id];
    if (customList && customList.length > 0) {
      return customList;
    }

    const funcRiscos = company.riscos[func.id] || [];
    const baseExames: PcmsoExameProtocolo[] = [
      {
        id: `ex_padrao_${func.id}`,
        exameNome: "Avaliação Clínica Ocupacional (Anamnese + Exame Físico)",
        periodicidade: "Admissional",
        criterioIndicacao: "Exame clínico obrigatório conforme NR-07 item 7.5.6",
      },
    ];

    const hasRuido = funcRiscos.some((r) => r.toLowerCase().includes("ruído") || r.toLowerCase().includes("ruido"));
    const hasQuimico = funcRiscos.some((r) => r.toLowerCase().includes("químico") || r.toLowerCase().includes("solvente") || r.toLowerCase().includes("óleo") || r.toLowerCase().includes("fumo") || r.toLowerCase().includes("tinta"));
    const hasPoeira = funcRiscos.some((r) => r.toLowerCase().includes("poeira") || r.toLowerCase().includes("sílica") || r.toLowerCase().includes("cimento"));
    const hasAltura = funcRiscos.some((r) => r.toLowerCase().includes("altura") || r.toLowerCase().includes("queda"));
    const hasConfinado = funcRiscos.some((r) => r.toLowerCase().includes("confinado"));

    if (hasRuido) {
      baseExames.push({
        id: `ex_ruido_${func.id}`,
        exameNome: "Audiometria Ocupacional Tonal e Vocal",
        periodicidade: "Periódico Anual",
        criterioIndicacao: "Exposição a Ruído Contínuo/Intermitente (NR-07 Anexo II)",
      });
    }

    if (hasQuimico) {
      baseExames.push({
        id: `ex_quim_${func.id}`,
        exameNome: "Hemograma Completo com Contagem de Plaquetas",
        periodicidade: "Periódico Anual",
        criterioIndicacao: "Monitoramento de exposição a Agentes Químicos e Solventes",
      });
      baseExames.push({
        id: `ex_tox_${func.id}`,
        exameNome: "Exame Toxicológico / IBE (Indicador Biológico de Exposição)",
        periodicidade: "Periódico Semestral",
        criterioIndicacao: "Controle de sobrecarga metabólica (NR-07 Quadro I)",
      });
    }

    if (hasPoeira) {
      baseExames.push({
        id: `ex_rx_${func.id}`,
        exameNome: "Radiografia de Tórax Padrão OIT (Teleperfil)",
        periodicidade: "Periódico Bienal",
        criterioIndicacao: "Inalação crônica de poeiras minerais e particulados",
      });
      baseExames.push({
        id: `ex_esp_${func.id}`,
        exameNome: "Espirometria Ocupacional (Capacidade Vital)",
        periodicidade: "Periódico Bienal",
        criterioIndicacao: "Avaliação da função pulmonar ventilatória",
      });
    }

    if (hasAltura || hasConfinado) {
      baseExames.push({
        id: `ex_ecg_${func.id}`,
        exameNome: "Eletrocardiograma de Repouso (ECG)",
        periodicidade: "Periódico Anual",
        criterioIndicacao: "Aptidão cardiovascular para Trabalho em Altura / Espaço Confinado (NR-35 / NR-33)",
      });
      baseExames.push({
        id: `ex_eeg_${func.id}`,
        exameNome: "Eletroencefalograma (EEG)",
        periodicidade: "Periódico Anual",
        criterioIndicacao: "Rastreio de distúrbios neurológicos e síncopes (NR-35)",
      });
      baseExames.push({
        id: `ex_glic_${func.id}`,
        exameNome: "Glicemia de Jejum",
        periodicidade: "Periódico Anual",
        criterioIndicacao: "Prevenção de crises hipoglicêmicas em atividades críticas",
      });
      baseExames.push({
        id: `ex_vis_${func.id}`,
        exameNome: "Teste de Acuidade Visual (Campimetria)",
        periodicidade: "Periódico Anual",
        criterioIndicacao: "Acuidade visual binocular para operação segura",
      });
    }

    return baseExames;
  };

  // Cálculo de Status de Vencimento
  const getStatusVencimento = (validadeStr: string) => {
    if (!validadeStr) return { status: "em_dia", label: "Em dia", dias: 999, cor: "emerald" };

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const validade = new Date(validadeStr);
    validade.setHours(0, 0, 0, 0);

    const diffTime = validade.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: "vencidos" as const,
        label: `Vencido há ${Math.abs(diffDays)} dia(s)`,
        dias: diffDays,
        cor: "red",
      };
    } else if (diffDays <= 30) {
      return {
        status: "urgente" as const,
        label: diffDays === 0 ? "Vence HOJE!" : `Vence em ${diffDays} dia(s)`,
        dias: diffDays,
        cor: "orange",
      };
    } else if (diffDays <= 60) {
      return {
        status: "atencao" as const,
        label: `Vence em ${diffDays} dia(s)`,
        dias: diffDays,
        cor: "amber",
      };
    } else {
      return {
        status: "em_dia" as const,
        label: `Em dia (${diffDays} dias)`,
        dias: diffDays,
        cor: "emerald",
      };
    }
  };

  // Métricas de Vencimento
  const metricas = {
    vencidos: asos.filter((a) => getStatusVencimento(a.dataValidade).status === "vencidos").length,
    urgentes: asos.filter((a) => getStatusVencimento(a.dataValidade).status === "urgente").length,
    atencao: asos.filter((a) => getStatusVencimento(a.dataValidade).status === "atencao").length,
    emDia: asos.filter((a) => getStatusVencimento(a.dataValidade).status === "em_dia").length,
  };

  const handleSalvarMedicoCoordenador = () => {
    onUpdateCompany({
      ...company,
      empresa: {
        ...company.empresa,
        emp_medico_coordenador: medicoNome,
        emp_medico_crm: medicoCrm,
      },
    });
    setIsEditingMedico(false);
    onAlert("success", "Dados do Médico Coordenador do PCMSO atualizados com sucesso!");
  };

  const handleAdicionarExameAoProtocolo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFuncaoIdForExame || !novoExameNome.trim()) {
      onAlert("info", "Informe o nome do exame e selecione o cargo.");
      return;
    }

    const currentList = getExamesRecomendadosParaFuncao(
      funcoes.find((f) => f.id === selectedFuncaoIdForExame)!
    );

    const novoItem: PcmsoExameProtocolo = {
      id: "ex_custom_" + Date.now(),
      exameNome: novoExameNome,
      periodicidade: novoExamePeriodicidade,
      criterioIndicacao: novoExameCriterio || "Indicado por protocolo médico interno",
    };

    const updatedProtocolos = {
      ...pcmsoProtocolos,
      [selectedFuncaoIdForExame]: [...currentList, novoItem],
    };

    onUpdateCompany({
      ...company,
      pcmsoProtocolos: updatedProtocolos,
    });

    onAlert("success", `Exame "${novoExameNome}" adicionado ao protocolo da função!`);
    setIsAddExameModalOpen(false);
    setNovoExameNome("");
    setNovoExameCriterio("");
  };

  const handleRemoverExameDoProtocolo = (funcaoIdTarget: string, exameId: string) => {
    const currentList = getExamesRecomendadosParaFuncao(
      funcoes.find((f) => f.id === funcaoIdTarget)!
    );
    const filtered = currentList.filter((e) => e.id !== exameId);

    onUpdateCompany({
      ...company,
      pcmsoProtocolos: {
        ...pcmsoProtocolos,
        [funcaoIdTarget]: filtered,
      },
    });
    onAlert("info", "Exame removido do protocolo médico desta função.");
  };

  // Escanear ASO via IA (Foto ou PDF)
  const handleScanAsoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningAso(true);
    setScannedFileName(file.name);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const response = await fetch("/api/pcmso/scan-aso", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileBase64: base64,
            mimeType: file.type || "application/pdf",
            funcoesDisponiveis: funcoes.map((f) => f.func_nome),
          }),
        });

        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error || "Não foi possível analisar o ASO.");
        }

        const data = json.data;
        if (data.nomeEmpregado) setNomeEmpregado(data.nomeEmpregado);
        if (data.cpf) setCpf(data.cpf);
        if (data.matricula) setMatricula(data.matricula);
        if (data.dataNascimento) setDataNascimento(data.dataNascimento);
        if (data.tipoAso) setTipoAso(data.tipoAso);
        if (data.dataRealizacao) setDataRealizacao(data.dataRealizacao);
        if (data.dataValidade) setDataValidadeManual(data.dataValidade);
        if (data.resultado) setResultado(data.resultado);
        if (data.restricoes) setRestricoes(data.restricoes);
        if (data.clinicaExame) setClinicaExame(data.clinicaExame);
        if (data.medicoExaminadorNome) setMedicoExaminador(data.medicoExaminadorNome);
        if (data.medicoExaminadorCrm) setCrmExaminador(data.medicoExaminadorCrm);

        // Tentar correlacionar com a função existente
        if (data.cargo) {
          const matched = funcoes.find(
            (f) =>
              f.func_nome.toLowerCase().includes(data.cargo.toLowerCase()) ||
              data.cargo.toLowerCase().includes(f.func_nome.toLowerCase())
          );
          if (matched) {
            setFuncaoId(matched.id);
          }
        }

        onAlert("success", `ASO de "${data.nomeEmpregado || "Colaborador"}" reconhecido com sucesso pela IA!`);
        setIsNovoAsoModalOpen(true);
        setIsScanModalOpen(false);
      } catch (err: any) {
        console.error("Scan ASO error:", err);
        onAlert("error", err?.message || "Erro ao escanear ASO.");
      } finally {
        setIsScanningAso(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Salvar Novo ASO / Periódico
  const handleSalvarAso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeEmpregado || !cpf || !funcaoId) {
      onAlert("info", "Preencha o nome do empregado, CPF e selecione o cargo.");
      return;
    }

    const funcaoSelecionada = funcoes.find((f) => f.id === funcaoId);
    const setor = funcaoSelecionada
      ? company.setores.find((s) => s.setor_nome === funcaoSelecionada.func_setor || s.id === funcaoSelecionada.func_setor)
      : null;

    let dataValidade = dataValidadeManual;
    if (!dataValidade) {
      const dt = new Date(dataRealizacao || new Date());
      dt.setMonth(dt.getMonth() + (Number(periodicidadeMeses) || 12));
      dataValidade = dt.toISOString().slice(0, 10);
    }

    const examesRecomendados = funcaoSelecionada ? getExamesRecomendadosParaFuncao(funcaoSelecionada) : [];

    const novoAso: PcmsoRegistroAso = {
      id: "aso_" + Date.now(),
      nomeEmpregado,
      cpf,
      matricula,
      telefone,
      email,
      dataNascimento,
      funcaoId,
      funcaoNome: funcaoSelecionada?.func_nome || "Cargo Geral",
      setorNome: setor?.setor_nome || funcaoSelecionada?.func_setor || "Geral",
      tipoAso,
      periodicidadeMeses: Number(periodicidadeMeses) || 12,
      dataRealizacao,
      dataValidade,
      clinicaExame: clinicaExame || "Clínica de Medicina do Trabalho Credenciada",
      resultado,
      restricoes,
      examesRealizados: examesRecomendados.map((ex) => ({
        nome: ex.exameNome,
        data: dataRealizacao,
        resultado: "Normal",
      })),
      medicoExaminadorNome: medicoExaminador || medicoNome,
      medicoExaminadorCrm: crmExaminador || medicoCrm,
      medicoExaminadorUf: company.empresa?.emp_uf || "SP",
    };

    const updatedAsos = [novoAso, ...asos];

    // Sincronização Automática com o Cadastro Geral de Trabalhadores
    const cleanCpf = cpf.replace(/\D/g, "");
    const existingWorkers = company.funcionarios || [];
    const alreadyExists = existingWorkers.some(
      (w) => (cleanCpf && w.cpf.replace(/\D/g, "") === cleanCpf) || (w.nome.toLowerCase() === nomeEmpregado.trim().toLowerCase())
    );

    let updatedWorkers = existingWorkers;
    if (!alreadyExists && nomeEmpregado.trim()) {
      const newWorker: FuncionarioData = {
        id: `func_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        nome: nomeEmpregado.trim(),
        cpf: cpf.trim() || "000.000.000-00",
        matricula: matricula.trim(),
        dataNascimento: dataNascimento || "",
        telefone: telefone.trim(),
        email: email.trim(),
        funcaoId: funcaoSelecionada?.id || "",
        funcaoNome: funcaoSelecionada?.func_nome || "Geral",
        setorId: setor?.id || "",
        setorNome: setor?.setor_nome || "Geral",
        cbo: funcaoSelecionada?.func_cbo || "",
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedWorkers = [newWorker, ...existingWorkers];
    }

    onUpdateCompany({
      ...company,
      asosRegistrados: updatedAsos,
      funcionarios: updatedWorkers,
    });

    onAlert("success", `ASO de ${nomeEmpregado} registrado com validade até ${dataValidade.split("-").reverse().join("/")}!`);
    setIsNovoAsoModalOpen(false);

    // Resetar formulário
    setNomeEmpregado("");
    setCpf("");
    setMatricula("");
    setTelefone("");
    setEmail("");
    setRestricoes("");
    setDataValidadeManual("");
  };

  const handleExcluirAso = (id: string) => {
    const updatedAsos = asos.filter((a) => a.id !== id);
    onUpdateCompany({
      ...company,
      asosRegistrados: updatedAsos,
    });
    onAlert("info", "Registro de ASO removido.");
  };

  const handleEmitirAsoPdf = (aso: PcmsoRegistroAso) => {
    try {
      generateAsoIndividualPdf(company, aso);
      onAlert("success", `ASO (${aso.tipoAso}) de ${aso.nomeEmpregado} emitido em PDF!`);
    } catch (err: any) {
      onAlert("error", "Erro ao gerar PDF do ASO: " + err?.message);
    }
  };

  const handleEmitirConvocacaoPdf = (aso: PcmsoRegistroAso) => {
    try {
      const func = funcoes.find((f) => f.id === aso.funcaoId);
      const exames = func ? getExamesRecomendadosParaFuncao(func).map((e) => e.exameNome) : [];
      generateConvocacaoAsoPdf(company, aso, exames);
      onAlert("success", `Carta de Convocação de ${aso.nomeEmpregado} gerada em PDF!`);
    } catch (err: any) {
      onAlert("error", "Erro ao gerar Convocação: " + err?.message);
    }
  };

  // Gerador de Mensagem para WhatsApp / E-mail do Colaborador
  const gerarTextoNotificacaoColaborador = (aso: PcmsoRegistroAso) => {
    const func = funcoes.find((f) => f.id === aso.funcaoId);
    const exames = func
      ? getExamesRecomendadosParaFuncao(func).map((e) => `• ${e.exameNome}`).join("\n")
      : "• Avaliação Clínica Ocupacional (Anamnese + Exame Físico)";

    const dataVencFormatada = aso.dataValidade ? aso.dataValidade.split("-").reverse().join("/") : "A Definir";
    const nomeEmpresa = emp.emp_razao || emp.emp_fantasia || "sua empresa";

    return (
      `*CONVOCAÇÃO PARA EXAME MÉDICO OCUPACIONAL (NR-07)*\n\n` +
      `Olá, *${aso.nomeEmpregado}*!\n\n` +
      `Informamos que o seu *Exame Médico Periódico* da empresa *${nomeEmpresa}* está programado com data limite/vencimento em: *${dataVencFormatada}*.\n\n` +
      `📋 *Dados do Agendamento:*\n` +
      `• *Cargo:* ${aso.funcaoNome} (${aso.setorNome})\n` +
      `• *Local/Clínica:* ${clinicaCustom || aso.clinicaExame || "Clínica Credenciada de Medicina Ocupacional"}\n\n` +
      `🩺 *Exames a Realizar (Protocolo PCMSO NR-07):*\n` +
      `${exames}\n\n` +
      `⚠️ *Orientações:* Compareça com documento oficial com foto (RG/CNH). Em caso de exames laboratoriais, observe o jejum prescrito.\n\n` +
      (customMsgNota ? `📌 *Observação:* ${customMsgNota}\n\n` : "") +
      `Por favor, responda a esta mensagem para confirmar o recebimento e alinharmos o horário.\n` +
      `_Gestão de Saúde Ocupacional & SESMT - ${nomeEmpresa}_`
    );
  };

  // Enviar WhatsApp para o Colaborador
  const handleEnviarWhatsAppColaborador = (aso: PcmsoRegistroAso) => {
    const rawTel = aso.telefone || "";
    const cleanTel = rawTel.replace(/\D/g, "");

    const msg = gerarTextoNotificacaoColaborador(aso);
    const encodedMsg = encodeURIComponent(msg);

    let url = "";
    if (cleanTel.length >= 10) {
      const fullNumber = cleanTel.startsWith("55") ? cleanTel : `55${cleanTel}`;
      url = `https://wa.me/${fullNumber}?text=${encodedMsg}`;
    } else {
      url = `https://wa.me/?text=${encodedMsg}`;
    }

    // Registrar data de notificação
    const updatedAsos = asos.map((a) =>
      a.id === aso.id ? { ...a, notificacaoEnviadaEm: new Date().toISOString() } : a
    );
    onUpdateCompany({
      ...company,
      asosRegistrados: updatedAsos,
    });

    window.open(url, "_blank");
    onAlert("success", `Notificação via WhatsApp aberta para ${aso.nomeEmpregado}!`);
  };

  // Enviar E-mail para o Colaborador
  const handleEnviarEmailColaborador = (aso: PcmsoRegistroAso) => {
    const assunto = encodeURIComponent(`[CONVOCAÇÃO NR-07] Exame Médico Ocupacional Periódico - ${aso.nomeEmpregado}`);
    const corpo = encodeURIComponent(gerarTextoNotificacaoColaborador(aso).replace(/\*/g, ""));
    const mailtoUrl = `mailto:${aso.email || ""}?subject=${assunto}&body=${corpo}`;

    // Registrar data de notificação
    const updatedAsos = asos.map((a) =>
      a.id === aso.id ? { ...a, notificacaoEnviadaEm: new Date().toISOString() } : a
    );
    onUpdateCompany({
      ...company,
      asosRegistrados: updatedAsos,
    });

    window.open(mailtoUrl, "_self");
    onAlert("success", `Cliente de E-mail acionado com a convocação de ${aso.nomeEmpregado}!`);
  };

  // Copiar Texto de Notificação
  const handleCopiarTexto = (texto: string) => {
    navigator.clipboard.writeText(texto);
    onAlert("success", "Texto da notificação copiado para a área de transferência!");
  };

  // Mensagem Consolidada para o RH da Empresa (Lote)
  const gerarRelatorioParaRh = () => {
    const pendentes = asos.filter((a) => {
      const st = getStatusVencimento(a.dataValidade).status;
      return st === "vencidos" || st === "urgente" || st === "atencao";
    });

    const nomeEmpresa = emp.emp_razao || emp.emp_fantasia || "Empresa";

    if (pendentes.length === 0) {
      return (
        `*RELATÓRIO DE GESTÃO DO PCMSO (NR-07) - ${nomeEmpresa}*\n\n` +
        `✅ Todos os colaboradores cadastrados estão com seus ASOs e Exames Periódicos EM DIA no momento!`
      );
    }

    let texto =
      `*ALERTA DE VENCIMENTO DE EXAMES PERIÓDICOS (PCMSO NR-07)*\n` +
      `🏢 *Empresa:* ${nomeEmpresa}\n` +
      `📅 *Data do Relatório:* ${new Date().toLocaleDateString("pt-BR")}\n` +
      `📊 *Total de Colaboradores com ASO a Renovar:* ${pendentes.length}\n\n` +
      `-----------------------------------------\n`;

    pendentes.forEach((a, idx) => {
      const st = getStatusVencimento(a.dataValidade);
      const icone = st.status === "vencidos" ? "🔴 [VENCIDO]" : st.status === "urgente" ? "🟠 [URGENTE - 30 DIAS]" : "🟡 [PROGRAMAR - 60 DIAS]";
      const dataVenc = a.dataValidade ? a.dataValidade.split("-").reverse().join("/") : "Sem data";
      texto +=
        `${idx + 1}. *${a.nomeEmpregado}* - ${icone}\n` +
        `   • Cargo: ${a.funcaoNome} (${a.setorNome})\n` +
        `   • CPF: ${a.cpf} | Tel: ${a.telefone || "N/I"}\n` +
        `   • Vencimento do ASO: *${dataVenc}*\n\n`;
    });

    texto +=
      `-----------------------------------------\n` +
      `⚠️ *Aviso Legal:* O descumprimento dos prazos de exames periódicos da NR-07 sujeita a empresa a autuações da Fiscalização do Trabalho (MTE) e passivos trabalhistas.\n` +
      `_Sistema Integrado SESMT & Medicina Ocupacional_`;

    return texto;
  };

  const handleEnviarWhatsAppRh = () => {
    const msg = gerarRelatorioParaRh();
    const cleanTel = (emp.emp_telefone || "").replace(/\D/g, "");
    let url = "";
    if (cleanTel.length >= 10) {
      const fullNumber = cleanTel.startsWith("55") ? cleanTel : `55${cleanTel}`;
      url = `https://wa.me/${fullNumber}?text=${encodeURIComponent(msg)}`;
    } else {
      url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    }
    window.open(url, "_blank");
    onAlert("success", "Relatório de exames a vencer enviado para o WhatsApp do RH!");
  };

  const handleEnviarEmailRh = () => {
    const assunto = encodeURIComponent(`[ALERTA PCMSO] Relatório de Exames Periódicos a Vencer - ${emp.emp_razao || "Empresa"}`);
    const corpo = encodeURIComponent(gerarRelatorioParaRh().replace(/\*/g, ""));
    const mailtoUrl = `mailto:${emp.emp_email || ""}?subject=${assunto}&body=${corpo}`;
    window.open(mailtoUrl, "_self");
    onAlert("success", "Relatório de exames a vencer aberto no seu cliente de E-mail!");
  };

  // Filtragem de ASOs
  const filteredAsos = asos.filter((a) => {
    const matchBusca =
      a.nomeEmpregado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.cpf.includes(searchTerm) ||
      a.funcaoNome.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchBusca) return false;

    if (filtroVencimento === "todos") return true;
    const st = getStatusVencimento(a.dataValidade).status;
    return st === filtroVencimento;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Header Principal do PCMSO com Alertas Integrados */}
      <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 p-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/30 text-teal-200 backdrop-blur-xs border border-teal-400/30">
              <Stethoscope className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">PCMSO - Programa de Controle Médico de Saúde Ocupacional</h2>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-[10px] font-black uppercase">
                  NR-07
                </span>
              </div>
              <p className="text-xs text-teal-200/90">
                Gestão e Notificação de Exames Periódicos • WhatsApp, E-mail, SMS e Convocação NR-07
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsRhBatchModalOpen(true)}
            className="inline-flex h-11 sm:h-10 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
            title="Avisar o RH da empresa sobre todos os exames periódicos que vencem no mês"
          >
            <Bell className="h-4 w-4" />
            <span>Avisar RH (Em Lote)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              try {
                generatePcmsoDocumentoBasePdf(company);
                onAlert("success", "Documento Base do PCMSO (NR-07) gerado em PDF!");
              } catch (err: any) {
                onAlert("error", "Erro ao emitir PCMSO: " + err?.message);
              }
            }}
            className="inline-flex h-11 sm:h-10 w-full items-center justify-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 px-3.5 text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Emitir PCMSO Completo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsScanModalOpen(true)}
            className="inline-flex h-11 sm:h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 px-3.5 text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
            title="Importar dados do ASO escaneando arquivo em Foto ou PDF via IA"
          >
            <Sparkles className="h-4 w-4" />
            <span>Escanear ASO (Foto/PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNovoAsoModalOpen(true)}
            className="inline-flex h-11 sm:h-10 w-full items-center justify-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white px-3.5 text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-teal-300" />
            <span>+ Cadastrar ASO</span>
          </button>
        </div>
      </div>

      {/* Cartões Rápidos de Status e Monitoramento de Vencimentos */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => {
            setActiveSubSection("vencimentos");
            setFiltroVencimento("vencidos");
          }}
          className={`rounded-xl border p-4 shadow-2xs cursor-pointer transition-all ${
            filtroVencimento === "vencidos" && activeSubSection === "vencimentos"
              ? "border-red-500 bg-red-50/90 dark:bg-red-950/50 ring-2 ring-red-500"
              : "border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-red-800 dark:text-red-300 uppercase tracking-wider">
              ASOs Vencidos
            </span>
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-200 mt-2">{metricas.vencidos}</p>
          <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5 font-medium">
            {metricas.vencidos > 0 ? "Requer convocação urgente!" : "Nenhum exame vencido"}
          </p>
        </div>

        <div
          onClick={() => {
            setActiveSubSection("vencimentos");
            setFiltroVencimento("urgente");
          }}
          className={`rounded-xl border p-4 shadow-2xs cursor-pointer transition-all ${
            filtroVencimento === "urgente" && activeSubSection === "vencimentos"
              ? "border-orange-500 bg-orange-50/90 dark:bg-orange-950/50 ring-2 ring-orange-500"
              : "border-orange-200 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-50 dark:hover:bg-orange-950/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-orange-800 dark:text-orange-300 uppercase tracking-wider">
              Vence em até 30 Dias
            </span>
            <Clock4 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-200 mt-2">{metricas.urgentes}</p>
          <p className="text-[11px] text-orange-600 dark:text-orange-400 mt-0.5 font-medium">
            Agendar no mês atual
          </p>
        </div>

        <div
          onClick={() => {
            setActiveSubSection("vencimentos");
            setFiltroVencimento("atencao");
          }}
          className={`rounded-xl border p-4 shadow-2xs cursor-pointer transition-all ${
            filtroVencimento === "atencao" && activeSubSection === "vencimentos"
              ? "border-amber-500 bg-amber-50/90 dark:bg-amber-950/50 ring-2 ring-amber-500"
              : "border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              Vence em 31 a 60 Dias
            </span>
            <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-200 mt-2">{metricas.atencao}</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
            Programação antecipada
          </p>
        </div>

        <div
          onClick={() => {
            setActiveSubSection("vencimentos");
            setFiltroVencimento("em_dia");
          }}
          className={`rounded-xl border p-4 shadow-2xs cursor-pointer transition-all ${
            filtroVencimento === "em_dia" && activeSubSection === "vencimentos"
              ? "border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/50 ring-2 ring-emerald-500"
              : "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              ASOs Em Dia
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-200 mt-2">{metricas.emDia}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
            Dentro da validade
          </p>
        </div>
      </div>

      {/* Barra de Navegação das Subseções */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveSubSection("encaminhamentos")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubSection === "encaminhamentos"
              ? "bg-teal-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <FileText className="h-4 w-4 text-emerald-300" />
          <span>Encaminhamentos ASO & Clínicas ({company.encaminhamentosAso?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubSection("vencimentos");
            setFiltroVencimento("todos");
          }}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubSection === "vencimentos"
              ? "bg-teal-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <Bell className="h-4 w-4 text-amber-300" />
          <span>Controle de Vencimentos & Notificações ({asos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection("protocolos")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubSection === "protocolos"
              ? "bg-teal-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Matriz de Exames por Cargo ({funcoes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection("asos")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubSection === "asos"
              ? "bg-teal-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <FileCheck2 className="h-4 w-4" />
          <span>Histórico de ASOs Emitidos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection("cronograma")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubSection === "cronograma"
              ? "bg-teal-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <HeartPulse className="h-4 w-4" />
          <span>Cronograma e Metas de Saúde</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection("coordenacao")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubSection === "coordenacao"
              ? "bg-teal-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Coordenação Médica</span>
        </button>
      </div>

      {/* SEÇÃO: GUIA DE ENCAMINHAMENTO PARA ASO & CLÍNICAS */}
      {activeSubSection === "encaminhamentos" && (
        <AsoEncaminhamentoSection
          company={company}
          companies={companies}
          onUpdateCompany={onUpdateCompany}
          onUpdateAllCompanies={onUpdateAllCompanies}
          onAlert={onAlert}
        />
      )}

      {/* SEÇÃO PRINCIPAL: CONTROLE DE VENCIMENTOS E DISPARO DE NOTIFICAÇÕES */}
      {activeSubSection === "vencimentos" && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Painel de Alertas e Convocação de Exames Periódicos
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-[10px] font-semibold">
                  Gratuito • WhatsApp / E-mail / PDF
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monitore o prazo de validade do ASO de cada colaborador e envie a convocação médica com 1 clique.
              </p>
            </div>

            {/* Filtros Rápidos */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar colaborador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 pl-10 pr-3.5 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setFiltroVencimento("todos")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                    filtroVencimento === "todos"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Todos ({asos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroVencimento("vencidos")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                    filtroVencimento === "vencidos"
                      ? "bg-red-600 text-white shadow-2xs"
                      : "text-red-700 dark:text-red-400"
                  }`}
                >
                  Vencidos ({metricas.vencidos})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroVencimento("urgente")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                    filtroVencimento === "urgente"
                      ? "bg-orange-600 text-white shadow-2xs"
                      : "text-orange-700 dark:text-orange-400"
                  }`}
                >
                  30 Dias ({metricas.urgentes})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroVencimento("atencao")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                    filtroVencimento === "atencao"
                      ? "bg-amber-600 text-white shadow-2xs"
                      : "text-amber-700 dark:text-amber-400"
                  }`}
                >
                  60 Dias ({metricas.atencao})
                </button>
              </div>
            </div>
          </div>

          {filteredAsos.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <CalendarClock className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Nenhum colaborador encontrado para o filtro selecionado.
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Cadastre os colaboradores com seus exames periódicos para que o sistema alerte e envie notificações automáticas.
              </p>
              <button
                type="button"
                onClick={() => setIsNovoAsoModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Cadastrar Novo ASO Periódico</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAsos.map((aso) => {
                const st = getStatusVencimento(aso.dataValidade);
                const func = funcoes.find((f) => f.id === aso.funcaoId);
                const examesRec = func ? getExamesRecomendadosParaFuncao(func) : [];

                return (
                  <div
                    key={aso.id}
                    className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-3 rounded-2xl transition-all"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                          {aso.nomeEmpregado}
                        </span>

                        {/* Badge de Status de Validade */}
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                            st.status === "vencidos"
                              ? "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800"
                              : st.status === "urgente"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-300 dark:border-orange-800"
                              : st.status === "atencao"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          <span>{st.label}</span>
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {aso.tipoAso} ({aso.periodicidadeMeses || 12}M)
                        </span>

                        {aso.notificacaoEnviadaEm && (
                          <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                            ✓ Notificado em: {new Date(aso.notificacaoEnviadaEm).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                        <span>
                          <strong>Cargo:</strong> {aso.funcaoNome} ({aso.setorNome})
                        </span>
                        <span>•</span>
                        <span>
                          <strong>CPF:</strong> {aso.cpf}
                        </span>
                        {aso.telefone && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                              <Smartphone className="h-3.5 w-3.5" />
                              {aso.telefone}
                            </span>
                          </>
                        )}
                        {aso.email && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400">
                              <Mail className="h-3.5 w-3.5" />
                              {aso.email}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                        <span>
                          Último Exame:{" "}
                          <strong className="text-slate-800 dark:text-slate-200">
                            {aso.dataRealizacao.split("-").reverse().join("/")}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Vencimento:{" "}
                          <strong
                            className={
                              st.status === "vencidos"
                                ? "text-red-600 font-bold"
                                : st.status === "urgente"
                                ? "text-orange-600 font-bold"
                                : "text-emerald-600 font-bold"
                            }
                          >
                            {aso.dataValidade.split("-").reverse().join("/")}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Exames:{" "}
                          <span className="text-slate-700 dark:text-slate-300">
                            {examesRec.map((e) => e.exameNome).join(", ") || "Clínico"}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Botões de Ação e Notificação Direta */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
                      {/* Botão Notificar WhatsApp */}
                      <button
                        type="button"
                        onClick={() => {
                          setNotifyingAso(aso);
                          setClinicaCustom(aso.clinicaExame || "Clínica Credenciada de Medicina Ocupacional");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
                        title="Enviar convocação por WhatsApp ou E-mail"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Avisar / Notificar</span>
                      </button>

                      {/* Botão Carta de Convocação PDF */}
                      <button
                        type="button"
                        onClick={() => handleEmitirConvocacaoPdf(aso)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
                        title="Gerar Carta de Convocação Oficial em PDF com protocolo de recebimento"
                      >
                        <FileText className="h-3.5 w-3.5 text-teal-600" />
                        <span>Carta de Convocação (PDF)</span>
                      </button>

                      {/* Download do ASO em PDF */}
                      <button
                        type="button"
                        onClick={() => handleEmitirAsoPdf(aso)}
                        className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
                        title="Visualizar ASO emitido em PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>

                      {/* Excluir Registro */}
                      <button
                        type="button"
                        onClick={() => handleExcluirAso(aso.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                        title="Excluir Registro"
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

      {/* SEÇÃO 2: MATRIZ DE RISCOS X EXAMES POR FUNÇÃO */}
      {activeSubSection === "protocolos" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 p-4 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-teal-950 dark:text-teal-200">
                Protocolo Médico e Matriz de Exames Clínicos / Complementares
              </h3>
              <p className="text-xs text-teal-800 dark:text-teal-300">
                Cruzamento automático de exames complementares obrigatórios conforme os fatores de risco mapeados no PGR para cada cargo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                try {
                  generatePcmsoDocumentoBasePdf(company);
                  onAlert("success", "Documento Base do PCMSO gerado em PDF!");
                } catch (err: any) {
                  onAlert("error", "Erro ao gerar PDF: " + err?.message);
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shrink-0 shadow-xs cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Gerar Relatório PCMSO (PDF)</span>
            </button>
          </div>

          {funcoes.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 space-y-3">
              <Shield className="h-10 w-10 mx-auto text-slate-400" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Nenhum cargo / função cadastrada nesta empresa ainda.
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Cadastre os setores e funções na aba <strong>"Funções"</strong> para que o PCMSO monte automaticamente a matriz de exames.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {funcoes.map((func) => {
                const setor = company.setores.find(
                  (s) => s.setor_nome === func.func_setor || s.id === func.func_setor
                );
                const funcRiscos = company.riscos[func.id] || [];
                const exames = getExamesRecomendadosParaFuncao(func);

                return (
                  <div
                    key={func.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-2xs space-y-3.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                            {func.func_nome.toUpperCase()}
                          </h4>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            Setor: {setor?.setor_nome || func.func_setor || "Geral"}
                          </span>
                          {func.func_cbo && (
                            <span className="text-[11px] text-slate-500">
                              CBO: {func.func_cbo}
                            </span>
                          )}
                        </div>
                        {funcRiscos.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Riscos PGR:</span>
                            {funcRiscos.map((r, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-medium"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                            ✓ Ausência de riscos nocivos específicos (Risco padrão / Avaliação clínica)
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFuncaoIdForExame(func.id);
                          setIsAddExameModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>+ Exame Específico</span>
                      </button>
                    </div>

                    {/* Tabela de Exames do Protocolo */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                            <th className="py-2.5 px-3 rounded-l-lg">Exame Clínico / Complementar</th>
                            <th className="py-2.5 px-3">Periodicidade</th>
                            <th className="py-2.5 px-3">Critério / Indicação Técnica (NR-07)</th>
                            <th className="py-2.5 px-3 text-right rounded-r-lg">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {exames.map((ex) => (
                            <tr key={ex.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                              <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                                <div className="flex items-center gap-2">
                                  <Activity className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                                  <span>{ex.exameNome}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="inline-block px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-[11px] border border-teal-200 dark:border-teal-800/60">
                                  {ex.periodicidade}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                                {ex.criterioIndicacao}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {ex.id.startsWith("ex_custom_") && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoverExameDoProtocolo(func.id, ex.id)}
                                    className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                                    title="Remover exame customizado"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SEÇÃO 3: HISTÓRICO DE ASOS */}
      {activeSubSection === "asos" && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Histórico de ASOs Emitidos (Atestados de Saúde Ocupacional)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Controle de exames admissionais, periódicos, demissionais, retorno e mudança de função com emissão de 2ª via em PDF.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por colaborador, CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-8 pr-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsNovoAsoModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Emitir ASO</span>
              </button>
            </div>
          </div>

          {filteredAsos.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Stethoscope className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum ASO emitido ainda.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Clique no botão <strong>"Emitir ASO"</strong> acima para registrar a avaliação médica ocupacional e gerar o PDF oficial.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAsos.map((aso) => (
                <div
                  key={aso.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {aso.nomeEmpregado}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                        {aso.tipoAso}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          aso.resultado === "Apto"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {aso.resultado}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>CPF: {aso.cpf}</span>
                      <span>•</span>
                      <span>Cargo: {aso.funcaoNome} ({aso.setorNome})</span>
                      <span>•</span>
                      <span>Data: {aso.dataRealizacao.split("-").reverse().join("/")}</span>
                      <span>•</span>
                      <span>Médico: {aso.medicoExaminadorNome} (CRM {aso.medicoExaminadorCrm})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEmitirAsoPdf(aso)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Emitir ASO (PDF)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExcluirAso(aso.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Excluir ASO"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEÇÃO 4: CRONOGRAMA DE AÇÕES E METAS DE SAÚDE */}
      {activeSubSection === "cronograma" && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Planejamento e Cronograma Anual de Metas em Saúde Ocupacional (NR-07)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ações preventivas, campanhas e monitoramentos para cumprimento do item 7.5.1 da NR-07.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Syringe className="h-4 w-4 text-teal-600" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Campanhas Preventivas de Imunização
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Incentivo à vacinação contra Tétano (dupla adulto), Gripe/Influenza sazonal e Hepatite B para colaboradores expostos a riscos biológicos ou primeiros socorros.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-teal-700 dark:text-teal-300 font-semibold pt-1">
                <Clock className="h-3 w-3" />
                <span>Periodicidade: Anual (Março a Maio)</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Programa de Conservação Auditiva (PCA)
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Acompanhamento sequencial de audiometrias para todos os trabalhadores expostos a Níveis de Ação (NR-09 / NR-07 Anexo II) para detecção de PAIR precoce.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-blue-700 dark:text-blue-300 font-semibold pt-1">
                <Clock className="h-3 w-3" />
                <span>Periodicidade: Exame Admissional, 6º mês e Periódico Anual</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Controle de Doenças Crônicas Não Transmissíveis
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Aferição de pressão arterial e glicemia durante exames periódicos, com encaminhamento e orientações de estilo de vida para hipertensos e diabéticos.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold pt-1">
                <Clock className="h-3 w-3" />
                <span>Periodicidade: Contínua durante todo o ano</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-purple-600" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Relatório Analítico Anual do PCMSO (NR-07 Item 7.6.2)
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Compilação estatística anual de exames realizados, resultados alterados por setor e correlação com dados epidemiológicos do PGR.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-purple-700 dark:text-purple-300 font-semibold pt-1">
                <Clock className="h-3 w-3" />
                <span>Periodicidade: Encerramento do ciclo anual</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO 5: COORDENAÇÃO MÉDICA E DIRETRIZES */}
      {activeSubSection === "coordenacao" && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Responsabilidade Técnica e Coordenação Médica do PCMSO
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dados do médico do trabalho responsável pela coordenação e elaboração do programa.
              </p>
            </div>
            {!isEditingMedico ? (
              <button
                type="button"
                onClick={() => setIsEditingMedico(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Editar Médico</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSalvarMedicoCoordenador}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Salvar Alterações</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Nome do Médico Coordenador do PCMSO
              </label>
              {isEditingMedico ? (
                <input
                  type="text"
                  value={medicoNome}
                  onChange={(e) => setMedicoNome(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              ) : (
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  {emp.emp_medico_coordenador || medicoNome}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Registro no CRM / RQE
              </label>
              {isEditingMedico ? (
                <input
                  type="text"
                  value={medicoCrm}
                  onChange={(e) => setMedicoCrm(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              ) : (
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  {emp.emp_medico_crm || medicoCrm}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-200 dark:border-slate-800 space-y-2 mt-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Diretrizes Técnicas da NR-07
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4">
              <li>O PCMSO deve estar articulado com os inventários de riscos do PGR (NR-01).</li>
              <li>A emissão do ASO é obrigatória para todos os tipos de exames clínicos ocupacionais.</li>
              <li>O prontuário médico individual deve ser mantido por no mínimo 20 anos após o desligamento do empregado.</li>
              <li>A entrega da 2ª via do ASO ao trabalhador é obrigatória mediante recibo.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Exame ao Protocolo da Função */}
      {isAddExameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Adicionar Exame ao Protocolo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddExameModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdicionarExameAoProtocolo} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Nome do Exame *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Hemograma Completo, Acuidade Visual..."
                  value={novoExameNome}
                  onChange={(e) => setNovoExameNome(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Periodicidade
                </label>
                <select
                  value={novoExamePeriodicidade}
                  onChange={(e) => setNovoExamePeriodicidade(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Admissional">Admissional</option>
                  <option value="Periódico Anual">Periódico Anual</option>
                  <option value="Periódico Semestral">Periódico Semestral</option>
                  <option value="Periódico Bienal">Periódico Bienal</option>
                  <option value="Demissional">Demissional</option>
                  <option value="Retorno">Retorno</option>
                  <option value="Mudança de Risco">Mudança de Risco</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Critério / Fator de Risco Indicador
                </label>
                <input
                  type="text"
                  placeholder="Ex: Exposição a solventes, trabalho em altura..."
                  value={novoExameCriterio}
                  onChange={(e) => setNovoExameCriterio(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddExameModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
                >
                  Adicionar ao Protocolo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Novo ASO / Periódico */}
      {isNovoAsoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-teal-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Cadastrar / Emitir ASO Ocupacional
                  </h3>
                  <p className="text-xs text-slate-500">
                    Insira os dados do colaborador para controle automático de periodicidade e notificações
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNovoAsoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Atalho Inteligente: Preencher com IA via Foto ou PDF */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-teal-500/15 border border-teal-500/30">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Preenchimento Automático por Foto ou PDF do ASO
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Envie a foto ou documento emitido pela clínica médica para a IA extrair os dados instantaneamente
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScanModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Escanear ASO</span>
              </button>
            </div>

            <form onSubmit={handleSalvarAso} className="space-y-4">
              {/* Bloco 1: Dados do Colaborador */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>1. Dados Pessoais & Contatos do Trabalhador</span>
                </h4>

                {/* Seleção rápida de trabalhador da base da empresa */}
                {company.funcionarios && company.funcionarios.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>Ou Selecione da Base de Trabalhadores Cadastrados:</span>
                    </label>
                    <select
                      onChange={(e) => {
                        const selId = e.target.value;
                        if (!selId) return;
                        const w = company.funcionarios?.find((item) => item.id === selId);
                        if (w) {
                          setNomeEmpregado(w.nome);
                          setCpf(w.cpf || "");
                          setMatricula(w.matricula || "");
                          setTelefone(w.telefone || "");
                          setEmail(w.email || "");
                          setDataNascimento(w.dataNascimento || "");
                          if (w.funcaoId) {
                            setFuncaoId(w.funcaoId);
                          } else {
                            const matched = funcoes.find((f) => f.func_nome.toLowerCase() === (w.funcaoNome || "").toLowerCase());
                            if (matched) setFuncaoId(matched.id);
                          }
                        }
                      }}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="">Clique para selecionar um colaborador...</option>
                      {company.funcionarios.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.nome} - {w.funcaoNome || "Geral"} {w.cpf ? `(${w.cpf})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Nome Completo do Trabalhador *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo da Silva"
                      value={nomeEmpregado}
                      onChange={(e) => setNomeEmpregado(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      CPF *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Matrícula (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 00142"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
                      <Smartphone className="h-3.5 w-3.5" />
                      <span>WhatsApp / Telefone (para Avisos)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="(11) 98765-4321"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="w-full h-9 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      <span>E-mail do Colaborador</span>
                    </label>
                    <input
                      type="email"
                      placeholder="colaborador@empresa.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-9 rounded-lg border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bloco 2: Cargo e Periodicidade */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" />
                  <span>2. Cargo, Tipo de Exame & Periodicidade</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Cargo / Função Avaliada *
                    </label>
                    <select
                      required
                      value={funcaoId}
                      onChange={(e) => setFuncaoId(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="">Selecione o cargo...</option>
                      {funcoes.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.func_nome} ({f.func_setor || "Geral"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Tipo do ASO
                    </label>
                    <select
                      value={tipoAso}
                      onChange={(e) => setTipoAso(e.target.value as any)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="Periódico">Periódico (NR-07)</option>
                      <option value="Admissional">Admissional</option>
                      <option value="Retorno ao Trabalho">Retorno ao Trabalho</option>
                      <option value="Mudança de Riscos Ocupacionais">Mudança de Riscos Ocupacionais</option>
                      <option value="Demissional">Demissional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Periodicidade do Exame
                    </label>
                    <select
                      value={periodicidadeMeses}
                      onChange={(e) => setPeriodicidadeMeses(Number(e.target.value))}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value={12}>Anual (12 Meses) - Padrão NR-07</option>
                      <option value={6}>Semestral (6 Meses) - Riscos Químicos/IBE</option>
                      <option value={24}>Bienal (24 Meses) - Baixo Risco</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Data da Realização do Último Exame
                    </label>
                    <input
                      type="date"
                      value={dataRealizacao}
                      onChange={(e) => setDataRealizacao(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Data Limite de Vencimento (Opcional)
                    </label>
                    <input
                      type="date"
                      placeholder="Calculada automaticamente se vazia"
                      value={dataValidadeManual}
                      onChange={(e) => setDataValidadeManual(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Clínica Credenciada / Local do Exame
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Clínica MedTrab Centro - Rua das Flores, 120"
                      value={clinicaExame}
                      onChange={(e) => setClinicaExame(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bloco 3: Parecer Médico */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" />
                  <span>3. Parecer Médico e Responsável</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Parecer de Aptidão Médica
                    </label>
                    <select
                      value={resultado}
                      onChange={(e) => setResultado(e.target.value as any)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="Apto">Apto</option>
                      <option value="Apto com Restrição">Apto com Restrição</option>
                      <option value="Inapto">Inapto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      CRM do Médico Examinador
                    </label>
                    <input
                      type="text"
                      value={crmExaminador}
                      onChange={(e) => setCrmExaminador(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {resultado === "Apto com Restrição" && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Descrever Restrições Médicas
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Não realizar levantamento de cargas acima de 15kg"
                      value={restricoes}
                      onChange={(e) => setRestricoes(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNovoAsoModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  Salvar ASO & Ativar Alertas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enviar Convocação / Notificação para o Colaborador */}
      {notifyingAso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Notificar Colaborador (Exame Periódico)
                  </h3>
                  <p className="text-xs text-slate-500">{notifyingAso.nomeEmpregado}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifyingAso(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-500 font-medium">Cargo:</span>{" "}
                  <strong className="text-slate-800 dark:text-slate-200">{notifyingAso.funcaoNome}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Vencimento:</span>{" "}
                  <strong className="text-emerald-700 dark:text-emerald-400">
                    {notifyingAso.dataValidade.split("-").reverse().join("/")}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">WhatsApp:</span>{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {notifyingAso.telefone || "Não cadastrado"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">E-mail:</span>{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {notifyingAso.email || "Não cadastrado"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Local / Clínica do Exame
                </label>
                <input
                  type="text"
                  value={clinicaCustom}
                  onChange={(e) => setClinicaCustom(e.target.value)}
                  placeholder="Ex: Clínica MedTrab - Av. Principal, 100"
                  className="w-full h-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Observações / Horário Específico (Opcional)
                </label>
                <input
                  type="text"
                  value={customMsgNota}
                  onChange={(e) => setCustomMsgNota(e.target.value)}
                  placeholder="Ex: Agendado para quinta-feira às 08:30h em jejum."
                  className="w-full h-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Prévia da Mensagem Formatada
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopiarTexto(gerarTextoNotificacaoColaborador(notifyingAso))}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copiar Mensagem</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-900 text-teal-300 font-mono text-[11px] rounded-xl max-h-44 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {gerarTextoNotificacaoColaborador(notifyingAso)}
                </div>
              </div>

              {/* Botões de Envio por Meio Gratuito */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleEnviarWhatsAppColaborador(notifyingAso)}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Enviar por WhatsApp (Grátis)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleEnviarEmailColaborador(notifyingAso)}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  <Mail className="h-4 w-4" />
                  <span>Enviar por E-mail</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleEmitirConvocacaoPdf(notifyingAso)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-teal-600 cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-teal-600" />
                  <span>Imprimir Carta de Convocação (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNotifyingAso(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Relatório de Notificação em Lote para o RH da Empresa */}
      {isRhBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Notificar RH da Empresa (Em Lote)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Envie um resumo consolidado de todos os exames a vencer para o RH / Gestor
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRhBatchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/50 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                <Info className="h-4 w-4 shrink-0 text-amber-600" />
                <p>
                  O relatório compila todos os colaboradores com ASOs vencidos ou que vencem nos próximos 30/60 dias para que o RH agende os exames em lote com a clínica.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Conteúdo do Relatório para o RH
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopiarTexto(gerarRelatorioParaRh())}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copiar Relatório</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-900 text-amber-200 font-mono text-[11px] rounded-xl max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {gerarRelatorioParaRh()}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleEnviarWhatsAppRh}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Enviar ao RH por WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleEnviarEmailRh}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  <Mail className="h-4 w-4" />
                  <span>Enviar ao RH por E-mail</span>
                </button>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRhBatchModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Inteligente de Escaneamento de ASO via IA */}
      {isScanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Escanear ASO com Inteligência Artificial
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Envie a foto ou PDF do ASO para preenchimento 100% automático
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isScanningAso}
                onClick={() => setIsScanModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-xs text-slate-600 dark:text-slate-300 bg-teal-50/70 dark:bg-teal-950/40 p-3 rounded-xl border border-teal-200 dark:border-teal-800/60 leading-relaxed">
                <p className="font-semibold text-teal-900 dark:text-teal-200 mb-1">
                  💡 Como funciona a leitura por IA:
                </p>
                A inteligência artificial analisa o documento (mesmo fotos tiradas pelo celular ou PDFs escaneados) e extrai:
                <ul className="list-disc pl-4 mt-1.5 space-y-0.5 text-[11px] text-teal-800 dark:text-teal-300">
                  <li>Nome do Colaborador, CPF e Matrícula</li>
                  <li>Cargo / Função e Setor</li>
                  <li>Tipo de Exame (Admissional, Periódico, Demissional, etc.)</li>
                  <li>Data de Realização e Data de Validade</li>
                  <li>Parecer Clínico (Apto, Inapto, Restrições)</li>
                  <li>Médico Examinador e CRM/UF</li>
                </ul>
              </div>

              {/* Input Invisível */}
              <input
                ref={asoFileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleScanAsoFile}
                disabled={isScanningAso}
              />

              {isScanningAso ? (
                <div className="p-8 rounded-2xl border-2 border-dashed border-teal-400 bg-teal-50/40 dark:bg-teal-950/30 flex flex-col items-center justify-center gap-3 text-center">
                  <RefreshCw className="h-8 w-8 text-teal-600 dark:text-teal-400 animate-spin" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Analisando ASO com Inteligência Artificial...
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {scannedFileName ? `Arquivo: "${scannedFileName}"` : "Processando texto e campos médicos..."}
                    </p>
                  </div>
                  <span className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-900/50">
                    Isso costuma levar de 2 a 5 segundos
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    onClick={() => asoFileInputRef.current?.click()}
                    className="p-6 sm:p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-teal-50/20 dark:hover:bg-teal-950/20 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all"
                  >
                    <div className="p-3 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
                      <UploadCloud className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Clique ou arraste a Foto ou PDF do ASO
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Formatos suportados: PDF, JPG, PNG, WEBP (até 20MB)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => asoFileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      <FileUp className="h-4 w-4" />
                      <span>Selecionar Arquivo / PDF</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={isScanningAso}
                  onClick={() => setIsScanModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
