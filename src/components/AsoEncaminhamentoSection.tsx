import React, { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Search,
  Building2,
  Calendar,
  User,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Download,
  Share2,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Trash2,
  Check,
  Stethoscope,
  Upload,
  RefreshCw,
  AlertTriangle,
  Info,
  Copy,
  Users,
  Activity,
  FileSpreadsheet,
  Smartphone,
  Cloud,
  HelpCircle,
} from "lucide-react";
import {
  Company,
  AsoEncaminhamento,
  ClinicaCredenciada,
  ExameSolicitadoItem,
  PcmsoRegistroAso,
  FuncaoData,
} from "../types";
import { EXAMES_TABELA_27 } from "../data/examesEsocialTabela27";
import { generateAsoEncaminhamentoPdf } from "../services/asoEncaminhamentoPdfGenerator";

interface AsoEncaminhamentoSectionProps {
  company: Company;
  companies?: Company[];
  onUpdateCompany: (updated: Company) => void;
  onUpdateAllCompanies?: (updatedList: Company[]) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

export const AsoEncaminhamentoSection: React.FC<AsoEncaminhamentoSectionProps> = ({
  company,
  companies = [],
  onUpdateCompany,
  onUpdateAllCompanies,
  onAlert,
}) => {
  const encaminhamentos = useMemo(() => company.encaminhamentosAso || [], [company.encaminhamentosAso]);
  const clinicas = useMemo(() => company.clinicasCredenciadas || [], [company.clinicasCredenciadas]);
  const funcoes = company.funcoes || [];
  const emp = company.empresa || {};

  // Estados de Filtro e Busca
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  // Modais
  const [isNovoModalOpen, setIsNovoModalOpen] = useState(false);
  const [isClinicasModalOpen, setIsClinicasModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isConcluirAsoModalOpen, setIsConcluirAsoModalOpen] = useState(false);
  const [selectedEncParaConcluir, setSelectedEncParaConcluir] = useState<AsoEncaminhamento | null>(null);

  // Edição / Cadastro de Clínica
  const [editingClinica, setEditingClinica] = useState<Partial<ClinicaCredenciada> | null>(null);

  // Form de Novo Encaminhamento
  const [tipoTrabalhador, setTipoTrabalhador] = useState<"colaborador" | "candidato">("candidato");
  const [selectedFuncaoId, setSelectedFuncaoId] = useState("");
  const [nomeTrabalhador, setNomeTrabalhador] = useState("");
  const [cpfTrabalhador, setCpfTrabalhador] = useState("");
  const [rgTrabalhador, setRgTrabalhador] = useState("");
  const [nascTrabalhador, setNascTrabalhador] = useState("");
  const [sexoTrabalhador, setSexoTrabalhador] = useState<"M" | "F" | "Outro">("M");
  const [cargoTrabalhador, setCargoTrabalhador] = useState("");
  const [setorTrabalhador, setSetorTrabalhador] = useState("");
  const [cboTrabalhador, setCboTrabalhador] = useState("");
  const [telTrabalhador, setTelTrabalhador] = useState("");
  const [tipoExame, setTipoExame] = useState<AsoEncaminhamento["tipoExame"]>("Admissional");
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().slice(0, 10));
  const [selectedClinicaId, setSelectedClinicaId] = useState<string>("");
  const [riscosSelecionados, setRiscosSelecionados] = useState<string[]>([]);
  const [examesSelecionados, setExamesSelecionados] = useState<ExameSolicitadoItem[]>([
    {
      id: "clinico",
      codigoEsocial: "0295",
      nome: "Avaliação Clínica Ocupacional (Anamnese + Exame Físico)",
      detalhe: "Obrigatório em todos os ASOs conforme NR-07 item 7.5.6",
    },
  ]);
  const [searchExameCatalogo, setSearchExameCatalogo] = useState("");
  const [obsEncaminhamento, setObsEncaminhamento] = useState("");

  // Form de Concluir ASO
  const [dataRealizacaoAso, setDataRealizacaoAso] = useState(new Date().toISOString().slice(0, 10));
  const [dataValidadeAso, setDataValidadeAso] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [resultadoAptidao, setResultadoAptidao] = useState<"Apto" | "Inapto" | "Apto com Restrição">("Apto");
  const [restricaoDesc, setRestricaoDesc] = useState("");
  const [medicoExaminadorNome, setMedicoExaminadorNome] = useState(
    emp.emp_medico_coordenador || "Dr. Médico do Trabalho"
  );
  const [medicoExaminadorCrm, setMedicoExaminadorCrm] = useState(
    emp.emp_medico_crm || "CRM/UF 00000"
  );

  // Form de Importação JSON
  const [jsonImportText, setJsonImportText] = useState("");
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const [importModalTab, setImportModalTab] = useState<"importar" | "comoVerCelular" | "enviarCelular">("importar");

  // Inicializa clínica selecionada
  React.useEffect(() => {
    if (clinicas.length > 0 && !selectedClinicaId) {
      setSelectedClinicaId(clinicas[0].id);
    }
  }, [clinicas, selectedClinicaId]);

  // Função ao selecionar uma função pré-cadastrada
  const handleSelectFuncao = (fId: string) => {
    setSelectedFuncaoId(fId);
    const f = funcoes.find((item) => item.id === fId);
    if (f) {
      setCargoTrabalhador(f.func_nome);
      setSetorTrabalhador(f.func_setor);
      setCboTrabalhador(f.func_cbo || "");

      // Carrega riscos do PGR dessa função
      const funcRiscos = company.riscos[f.id] || [];
      setRiscosSelecionados(funcRiscos);

      // Carrega exames sugeridos
      const defaultExames: ExameSolicitadoItem[] = [
        {
          id: "clinico",
          codigoEsocial: "0295",
          nome: "Avaliação Clínica Ocupacional (Anamnese + Exame Físico)",
          detalhe: "Obrigatório em todos os ASOs conforme NR-07 item 7.5.6",
        },
      ];

      const hasRuido = funcRiscos.some((r) => r.toLowerCase().includes("ruído") || r.toLowerCase().includes("ruido"));
      const hasQuimico = funcRiscos.some((r) => r.toLowerCase().includes("químico") || r.toLowerCase().includes("solvente") || r.toLowerCase().includes("tinta"));
      const hasPoeira = funcRiscos.some((r) => r.toLowerCase().includes("poeira") || r.toLowerCase().includes("sílica"));
      const hasAltura = funcRiscos.some((r) => r.toLowerCase().includes("altura") || r.toLowerCase().includes("queda"));
      const hasConfinado = funcRiscos.some((r) => r.toLowerCase().includes("confinado"));

      if (hasRuido) {
        defaultExames.push({
          id: "audiometria",
          codigoEsocial: "0215",
          nome: "Audiometria Tonal Liminar (ATL)",
          detalhe: "Monitoramento de exposição ao Ruído (NR-07 Anexo II)",
        });
      }
      if (hasQuimico) {
        defaultExames.push({
          id: "hemograma",
          codigoEsocial: "0301",
          nome: "Hemograma Completo com Plaquetas",
          detalhe: "Monitoramento de exposição a agentes químicos",
        });
      }
      if (hasPoeira) {
        defaultExames.push({
          id: "espirometria",
          codigoEsocial: "0200",
          nome: "Espirometria Ocupacional (Capacidade Vital)",
          detalhe: "Avaliação da função pulmonar",
        });
        defaultExames.push({
          id: "rx_torax",
          codigoEsocial: "0001",
          nome: "Radiografia do Tórax Padrão OIT (PA + Perfil)",
          detalhe: "Rastreio de pneumoconioses e poeiras",
        });
      }
      if (hasAltura || hasConfinado) {
        defaultExames.push({
          id: "ecg",
          codigoEsocial: "0175",
          nome: "Eletrocardiograma de Repouso (ECG)",
          detalhe: "Aptidão cardiovascular para atividades críticas (NR-35 / NR-33)",
        });
        defaultExames.push({
          id: "eeg",
          codigoEsocial: "0181",
          nome: "Eletroencefalograma Ocupacional (EEG)",
          detalhe: "Rastreamento neurológico (NR-35)",
        });
        defaultExames.push({
          id: "glicemia",
          codigoEsocial: "0320",
          nome: "Glicemia de Jejum",
          detalhe: "Prevenção de episódios hipoglicêmicos",
        });
        defaultExames.push({
          id: "acuidade",
          codigoEsocial: "0230",
          nome: "Teste de Acuidade Visual (Snellen)",
          detalhe: "Acuidade visual binocular para operação segura",
        });
        defaultExames.push({
          id: "psicossocial",
          codigoEsocial: "0251",
          nome: "Avaliação Psicológica / Psicossocial Ocupacional",
          detalhe: "Aptidão psicossocial para trabalho em altura/espaço confinado",
        });
      }

      setExamesSelecionados(defaultExames);
    }
  };

  // Toggle exame da tabela
  const handleToggleExameCatalogo = (item: (typeof EXAMES_TABELA_27)[0]) => {
    const exists = examesSelecionados.some((e) => e.codigoEsocial === item.codigoEsocial && e.nome === item.nome);
    if (exists) {
      setExamesSelecionados(examesSelecionados.filter((e) => !(e.codigoEsocial === item.codigoEsocial && e.nome === item.nome)));
    } else {
      setExamesSelecionados([
        ...examesSelecionados,
        {
          id: item.id,
          codigoEsocial: item.codigoEsocial,
          nome: item.nome,
          detalhe: item.detalhe,
        },
      ]);
    }
  };

  // Salvar novo encaminhamento
  const handleSalvarEncaminhamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeTrabalhador.trim()) {
      onAlert("info", "Informe o nome do trabalhador ou candidato.");
      return;
    }
    if (!cpfTrabalhador.trim()) {
      onAlert("info", "Informe o CPF do trabalhador ou candidato.");
      return;
    }
    if (!cargoTrabalhador.trim()) {
      onAlert("info", "Informe o cargo / função pretendida.");
      return;
    }

    const clinicaObj = clinicas.find((c) => c.id === selectedClinicaId);

    const novoEnc: AsoEncaminhamento = {
      id: "enc_" + Date.now(),
      empresaId: company.id,
      empresaRazao: emp.emp_razao || "Empresa Solicitante",
      empresaCnpj: emp.emp_cnpj || "",
      tipoTrabalhador,
      nomeTrabalhador: nomeTrabalhador.trim(),
      cpf: cpfTrabalhador.trim(),
      rg: rgTrabalhador.trim() || undefined,
      dataNascimento: nascTrabalhador || undefined,
      sexo: sexoTrabalhador,
      cargo: cargoTrabalhador.trim(),
      setor: setorTrabalhador.trim() || "Geral",
      funcaoId: selectedFuncaoId || undefined,
      cbo: cboTrabalhador.trim() || undefined,
      telefone: telTrabalhador.trim() || undefined,
      clinicaId: selectedClinicaId || (clinicas[0]?.id || "cl_padrao"),
      clinicaNome: clinicaObj?.nome || "Clínica Credenciada",
      tipoExame,
      dataEmissao,
      riscosOcupacionais: riscosSelecionados,
      examesSolicitados: examesSelecionados,
      observacoes: obsEncaminhamento.trim() || undefined,
      status: "Pendente",
      createdAt: new Date().toISOString(),
    };

    const atualizados = [novoEnc, ...encaminhamentos];
    onUpdateCompany({
      ...company,
      encaminhamentosAso: atualizados,
    });

    setIsNovoModalOpen(false);
    onAlert("success", "Guia de Encaminhamento para ASO criada com sucesso!");

    // Opcional: Gerar PDF imediatamente
    try {
      generateAsoEncaminhamentoPdf(company, novoEnc, clinicaObj);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    }
  };

  // Alterar Status do Encaminhamento
  const handleUpdateStatus = (id: string, novoStatus: AsoEncaminhamento["status"]) => {
    const atualizados = encaminhamentos.map((enc) => {
      if (enc.id === id) {
        return { ...enc, status: novoStatus, updatedAt: new Date().toISOString() };
      }
      return enc;
    });

    onUpdateCompany({
      ...company,
      encaminhamentosAso: atualizados,
    });

    onAlert("info", `Status do encaminhamento atualizado para: ${novoStatus}`);
  };

  // Excluir encaminhamento
  const handleDeleteEncaminhamento = (id: string) => {
    if (!window.confirm("Deseja realmente remover esta Guia de Encaminhamento?")) return;
    const atualizados = encaminhamentos.filter((e) => e.id !== id);
    onUpdateCompany({
      ...company,
      encaminhamentosAso: atualizados,
    });
    onAlert("success", "Encaminhamento excluído com sucesso.");
  };

  // Concluir e Efetivar no PCMSO
  const handleOpenConcluirModal = (enc: AsoEncaminhamento) => {
    setSelectedEncParaConcluir(enc);
    setDataRealizacaoAso(new Date().toISOString().slice(0, 10));
    setResultadoAptidao("Apto");
    setRestricaoDesc("");
    const cl = clinicas.find((c) => c.id === enc.clinicaId);
    if (cl && cl.medicoResponsavel) {
      setMedicoExaminadorNome(cl.medicoResponsavel);
      setMedicoExaminadorCrm(cl.crm ? `${cl.crm}${cl.crmUf ? "/" + cl.crmUf : ""}` : "");
    }
    setIsConcluirAsoModalOpen(true);
  };

  const handleConfirmarConclusaoAso = () => {
    if (!selectedEncParaConcluir) return;

    const enc = selectedEncParaConcluir;
    const novoAsoId = "aso_efetivado_" + Date.now();

    // Criar o registro oficial de ASO no PCMSO
    const novoAso: PcmsoRegistroAso = {
      id: novoAsoId,
      nomeEmpregado: enc.nomeTrabalhador,
      cpf: enc.cpf,
      telefone: enc.telefone,
      funcaoId: enc.funcaoId || "f_geral",
      funcaoNome: enc.cargo,
      setorNome: enc.setor,
      dataNascimento: enc.dataNascimento,
      tipoAso: enc.tipoExame,
      periodicidadeMeses: 12,
      dataRealizacao: dataRealizacaoAso,
      dataValidade: dataValidadeAso,
      clinicaExame: enc.clinicaNome,
      resultado: resultadoAptidao,
      restricoes: resultadoAptidao === "Apto com Restrição" ? restricaoDesc : undefined,
      examesRealizados: enc.examesSolicitados.map((ex) => ({
        nome: ex.nome,
        data: dataRealizacaoAso,
        resultado: "Normal",
      })),
      medicoExaminadorNome,
      medicoExaminadorCrm,
      medicoExaminadorUf: "SP",
      observacoesMedicas: enc.observacoes,
    };

    const asosExistentes = company.asosRegistrados || [];
    const atualizadosAsos = [novoAso, ...asosExistentes];

    // Atualizar o status do encaminhamento para Realizado ou Inapto
    const novoStatus: AsoEncaminhamento["status"] =
      resultadoAptidao === "Inapto" ? "Inapto" : "Realizado";

    const atualizadosEnc = encaminhamentos.map((item) => {
      if (item.id === enc.id) {
        return {
          ...item,
          status: novoStatus,
          asoVinculadoId: novoAsoId,
          dataAtendimento: dataRealizacaoAso,
          resultadoAptidao,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    onUpdateCompany({
      ...company,
      asosRegistrados: atualizadosAsos,
      encaminhamentosAso: atualizadosEnc,
    });

    setIsConcluirAsoModalOpen(false);
    setSelectedEncParaConcluir(null);
    onAlert(
      "success",
      `ASO registrado com sucesso no PCMSO! O exame agora está disponível no controle de vencimentos e no eSocial (S-2220).`
    );
  };

  // Salvar Clínica Credenciada
  const handleSalvarClinica = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClinica?.nome?.trim()) {
      onAlert("info", "Informe o nome da clínica ou consultório.");
      return;
    }

    const isEdit = !!editingClinica.id;
    const clSalva: ClinicaCredenciada = {
      id: editingClinica.id || "cl_" + Date.now(),
      nome: editingClinica.nome.trim(),
      cnpj: editingClinica.cnpj || "",
      email: editingClinica.email || "",
      telefone: editingClinica.telefone || "",
      whatsapp: editingClinica.whatsapp || "",
      medicoResponsavel: editingClinica.medicoResponsavel || "",
      crm: editingClinica.crm || "",
      crmUf: editingClinica.crmUf || "SP",
      especialidade: editingClinica.especialidade || "Medicina do Trabalho",
      site: editingClinica.site || "",
      cep: editingClinica.cep || "",
      logradouro: editingClinica.logradouro || "",
      numero: editingClinica.numero || "",
      complemento: editingClinica.complemento || "",
      bairro: editingClinica.bairro || "",
      cidade: editingClinica.cidade || "",
      uf: editingClinica.uf || "SP",
    };

    const atualizadas = isEdit
      ? clinicas.map((c) => (c.id === clSalva.id ? clSalva : c))
      : [...clinicas, clSalva];

    onUpdateCompany({
      ...company,
      clinicasCredenciadas: atualizadas,
    });

    setEditingClinica(null);
    onAlert("success", isEdit ? "Clínica atualizada com sucesso!" : "Clínica cadastrada com sucesso!");
  };

  // Excluir Clínica
  const handleDeleteClinica = (id: string) => {
    if (!window.confirm("Deseja remover esta clínica credenciada?")) return;
    const atualizadas = clinicas.filter((c) => c.id !== id);
    onUpdateCompany({
      ...company,
      clinicasCredenciadas: atualizadas,
    });
    onAlert("info", "Clínica removida.");
  };

  // Compartilhar no WhatsApp
  const handleShareWhatsApp = (enc: AsoEncaminhamento) => {
    const cl = clinicas.find((c) => c.id === enc.clinicaId);
    const endFormatado = [
      cl?.logradouro ? `${cl.logradouro}${cl.numero ? ", " + cl.numero : ""}${cl.complemento ? ` (${cl.complemento})` : ""}` : "",
      cl?.bairro || "",
      cl?.cidade ? `${cl.cidade}/${cl.uf || ""}` : "",
    ]
      .filter(Boolean)
      .join(" - ");

    const texto = [
      `*ENCAMINHAMENTO MÉDICO OCUPACIONAL (ASO - NR-07)*`,
      `Olá, *${enc.nomeTrabalhador}*!`,
      `Você foi encaminhado(a) para a realização do seu *Exame ${enc.tipoExame}*.`,
      ``,
      `🏢 *Empresa:* ${enc.empresaRazao}`,
      `💼 *Cargo / Função:* ${enc.cargo}`,
      `🏥 *Clínica:* ${cl?.nome || enc.clinicaNome}`,
      endFormatado ? `📍 *Endereço:* ${endFormatado}` : ``,
      cl?.telefone ? `📞 *Telefone:* ${cl.telefone}` : ``,
      cl?.email ? `✉️ *E-mail:* ${cl.email}` : ``,
      ``,
      `🔬 *Exames a realizar:*`,
      ...enc.examesSolicitados.map((ex) => `• ${ex.nome} (${ex.codigoEsocial ? "eSocial: " + ex.codigoEsocial : ""})`),
      ``,
      `⚠️ *Importante:* Comparecer portando documento oficial original com foto e CPF (ou CNH).`,
      enc.observacoes ? `📝 *Observações:* ${enc.observacoes}` : ``,
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  // =========================================================================
  // IMPORTAÇÃO / SINCRONIZAÇÃO DE EMPRESAS E DADOS DO SISTEMA ASO (JSON)
  // =========================================================================
  const handleProcessarImportacaoJson = () => {
    if (!jsonImportText.trim()) {
      onAlert("info", "Cole o conteúdo do backup JSON ou selecione um arquivo.");
      return;
    }

    try {
      const parsed = JSON.parse(jsonImportText);
      const dataObj = parsed.data || parsed;

      const empresasImportadas = Array.isArray(dataObj.empresas) ? dataObj.empresas : [];
      const clinicasImportadas = Array.isArray(dataObj.clinicas) ? dataObj.clinicas : [];
      const trabalhadoresImportados = Array.isArray(dataObj.trabalhadores) ? dataObj.trabalhadores : [];
      const asosImportados = Array.isArray(dataObj.asos) ? dataObj.asos : [];

      if (
        empresasImportadas.length === 0 &&
        clinicasImportadas.length === 0 &&
        trabalhadoresImportados.length === 0 &&
        asosImportados.length === 0
      ) {
        onAlert("error", "Nenhum dado compatível de empresas, clínicas ou ASOs encontrado no arquivo JSON.");
        return;
      }

      let empresasAtualizadasCount = 0;
      let novasEmpresasCount = 0;
      let clinicasAdicionadasCount = 0;
      let encaminhamentosImportadosCount = 0;

      // Lista de empresas manipuladas
      let listaEmpresasAtual = companies && companies.length > 0 ? [...companies] : [company];

      // 1. Processar Empresas
      empresasImportadas.forEach((empImp: any) => {
        const cnpjLimpo = (empImp.cnpj || "").replace(/\D/g, "");
        const razaoLimpa = (empImp.razao || "").trim().toLowerCase();

        // Verifica se a empresa já existe na lista
        const indexExistente = listaEmpresasAtual.findIndex((c) => {
          const cCnpj = (c.empresa.emp_cnpj || "").replace(/\D/g, "");
          const cRazao = (c.empresa.emp_razao || "").trim().toLowerCase();
          return (cnpjLimpo && cCnpj === cnpjLimpo) || (razaoLimpa && cRazao === razaoLimpa);
        });

        const dadosMapeados = {
          emp_razao: empImp.razao || "Empresa Importada",
          emp_cnpj: empImp.cnpj || "",
          emp_email: empImp.email || "",
          emp_cnae: empImp.cnae || "",
          emp_grau_risco: empImp.grau || "2",
          emp_responsavel: empImp.resp || "",
          emp_telefone: empImp.tel || "",
          emp_cep: empImp.cep || "",
          emp_endereco: [empImp.rua, empImp.num ? `nº ${empImp.num}` : "", empImp.comp]
            .filter(Boolean)
            .join(", "),
          emp_bairro: empImp.bairro || "",
          emp_cidade: empImp.cidade || "",
          emp_uf: empImp.uf || "SP",
        };

        if (indexExistente >= 0) {
          // Atualiza dados cadastrais da empresa cliente existente
          const empresaExistente = listaEmpresasAtual[indexExistente];
          listaEmpresasAtual[indexExistente] = {
            ...empresaExistente,
            empresa: {
              ...empresaExistente.empresa,
              ...dadosMapeados,
            },
            updatedAt: new Date().toISOString(),
          };
          empresasAtualizadasCount++;
        } else {
          // Cria nova empresa cliente
          const novaEmp: Company = {
            id: String(Date.now() + Math.random().toString(36).substring(2, 6)),
            empresa: dadosMapeados,
            setores: [],
            funcoes: [],
            riscos: {},
            updatedAt: new Date().toISOString(),
          };
          listaEmpresasAtual.push(novaEmp);
          novasEmpresasCount++;
        }
      });

      // 2. Processar Clínicas
      const clinicasExistentes = [...clinicas];
      clinicasImportadas.forEach((clImp: any) => {
        const jaExiste = clinicasExistentes.some(
          (c) => c.nome.toLowerCase() === (clImp.nome || "").toLowerCase()
        );
        if (!jaExiste && clImp.nome) {
          clinicasExistentes.push({
            id: clImp.id || "cl_" + Date.now() + Math.random().toString(36).substring(2, 5),
            nome: clImp.nome,
            cnpj: clImp.cnpj || "",
            email: clImp.email || "",
            telefone: clImp.tel || "",
            whatsapp: clImp.tel || "",
            medicoResponsavel: clImp.medico || "",
            crm: clImp.crm || "",
            crmUf: clImp.uf || "SP",
            especialidade: clImp.esp || "Medicina do Trabalho",
            site: clImp.site || "",
            cep: clImp.cep || "",
            logradouro: clImp.rua || "",
            numero: clImp.num || "",
            complemento: clImp.comp || "",
            bairro: clImp.bairro || "",
            cidade: clImp.cidade || "",
            uf: clImp.uf || "SP",
          });
          clinicasAdicionadasCount++;
        }
      });

      // 3. Processar ASOs / Encaminhamentos existentes
      const encExistentes = [...encaminhamentos];
      asosImportados.forEach((asoImp: any) => {
        const trab = trabalhadoresImportados.find((t: any) => t.id === asoImp.trabalhadorId) || {};
        const cl = clinicasImportadas.find((c: any) => c.id === asoImp.clinicaId) || {};
        const empRef = empresasImportadas.find((e: any) => e.id === asoImp.empresaId) || {};

        const novoEnc: AsoEncaminhamento = {
          id: asoImp.id || "enc_" + Date.now(),
          empresaId: company.id,
          empresaRazao: empRef.razao || company.empresa.emp_razao || "Empresa",
          empresaCnpj: empRef.cnpj || company.empresa.emp_cnpj || "",
          tipoTrabalhador: "colaborador",
          nomeTrabalhador: trab.nome || "Trabalhador Importado",
          cpf: trab.cpf || "000.000.000-00",
          rg: trab.rg || undefined,
          cargo: trab.cargo || "Função",
          setor: trab.setor || "Geral",
          clinicaId: cl.id || clinicasExistentes[0]?.id || "cl_padrao",
          clinicaNome: cl.nome || clinicasExistentes[0]?.nome || "Clínica Credenciada",
          tipoExame: asoImp.tipo || "Periódico",
          dataEmissao: asoImp.data || new Date().toISOString().slice(0, 10),
          riscosOcupacionais: asoImp.riscos || [],
          examesSolicitados: (asoImp.exames || []).map((ex: any) => {
            if (typeof ex === "string") {
              return { id: "ex_" + Math.random(), codigoEsocial: "0295", nome: ex };
            }
            return {
              id: ex.id || "ex_" + Math.random(),
              codigoEsocial: ex.codigos || "0295",
              nome: ex.nome || "Exame Ocupacional",
            };
          }),
          observacoes: asoImp.obs || undefined,
          status: "Realizado",
          createdAt: asoImp.createdAt || new Date().toISOString(),
        };

        encExistentes.push(novoEnc);
        encaminhamentosImportadosCount++;
      });

      // Atualiza a empresa atual com as clínicas e encaminhamentos
      const updatedActiveCompany: Company = {
        ...company,
        clinicasCredenciadas: clinicasExistentes,
        encaminhamentosAso: encExistentes,
        updatedAt: new Date().toISOString(),
      };

      // Se temos handler global para todas as empresas
      if (onUpdateAllCompanies && listaEmpresasAtual.length > 0) {
        const indexAtiva = listaEmpresasAtual.findIndex((c) => c.id === company.id);
        if (indexAtiva >= 0) {
          listaEmpresasAtual[indexAtiva] = updatedActiveCompany;
        }
        onUpdateAllCompanies(listaEmpresasAtual);
      } else {
        onUpdateCompany(updatedActiveCompany);
      }

      setImportSummary(
        `Sucesso na importação: ${empresasAtualizadasCount} empresa(s) cliente(s) atualizada(s), ${novasEmpresasCount} nova(s) cadastrada(s), ${clinicasAdicionadasCount} clínica(s) credenciada(s) adicionada(s) e ${encaminhamentosImportadosCount} encaminhamento(s) recuperado(s).`
      );

      onAlert(
        "success",
        `Sincronização concluída! ${empresasAtualizadasCount} empresas atualizadas e ${novasEmpresasCount} novas cadastradas.`
      );
    } catch (err: any) {
      console.error(err);
      onAlert("error", `Falha ao processar arquivo JSON: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonImportText(content);
    };
    reader.readAsText(file);
  };

  const handleExportBackupJson = () => {
    const lista = companies && companies.length > 0 ? companies : [company];
    const payload = {
      app: "SST Vistoria",
      version: "4.0",
      exportedAt: new Date().toISOString(),
      companies: lista,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_sst_empresas_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onAlert("success", "Arquivo JSON gerado e baixado! Envie-o por WhatsApp ou e-mail para abrir no celular.");
  };

  const handleCopyBackupJson = async () => {
    const lista = companies && companies.length > 0 ? companies : [company];
    const payload = {
      app: "SST Vistoria",
      version: "4.0",
      exportedAt: new Date().toISOString(),
      companies: lista,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      onAlert("success", "Backup JSON copiado! Você pode colar no WhatsApp Web e enviar para o celular.");
    } catch {
      onAlert("info", "Não foi possível copiar automaticamente. Use a opção de baixar o arquivo.");
    }
  };

  // Filtragem dos encaminhamentos
  const encaminhamentosFiltrados = useMemo(() => {
    return encaminhamentos.filter((enc) => {
      const matchSearch =
        enc.nomeTrabalhador.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enc.cpf.includes(searchTerm) ||
        enc.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enc.clinicaNome.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "todos" ? true : enc.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [encaminhamentos, searchTerm, statusFilter]);

  // Contadores de métricas
  const contadores = useMemo(() => {
    return {
      total: encaminhamentos.length,
      pendentes: encaminhamentos.filter((e) => e.status === "Pendente").length,
      realizados: encaminhamentos.filter((e) => e.status === "Realizado").length,
      inaptos: encaminhamentos.filter((e) => e.status === "Inapto").length,
      naoCompareceu: encaminhamentos.filter((e) => e.status === "NaoCompareceu" || e.status === "Cancelado").length,
    };
  }, [encaminhamentos]);

  return (
    <div className="space-y-6">
      {/* CARD PRINCIPAL COM CABEÇALHO E AÇÕES */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                NR-07 • Portaria MTP 6.734/2020
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300">
                Tabela 27 eSocial
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Guias de Encaminhamento para Exames Ocupacionais (ASO)
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Emissão de ordens de serviço médico para clínicas credenciadas com mapeamento de riscos do PGR e lista de exames com códigos eSocial.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
              title="Importar dados de empresas e ASOs a partir de arquivo de backup JSON"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              Importar / Sincronizar Sistema ASO
            </button>

            <button
              onClick={() => setIsClinicasModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800 transition"
            >
              <Building2 className="w-4 h-4" />
              Clínicas Credenciadas ({clinicas.length})
            </button>

            <button
              onClick={() => {
                // Reseta form e abre modal
                setNomeTrabalhador("");
                setCpfTrabalhador("");
                setRgTrabalhador("");
                setCargoTrabalhador("");
                setSetorTrabalhador("");
                setCboTrabalhador("");
                setTelTrabalhador("");
                setTipoTrabalhador("candidato");
                setSelectedFuncaoId("");
                setRiscosSelecionados([]);
                setObsEncaminhamento("");
                setIsNovoModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              Novo Encaminhamento
            </button>
          </div>
        </div>

        {/* BOX DE SEGURANÇA E REGRAS NORMATIVAS */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 dark:text-slate-200 block">Pré-Admissão Segura:</strong>
              Candidatos não entram na folha de ativos nem geram evento no eSocial antes da aptidão e contratação.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 dark:text-slate-200 block">Não Comparecimento & Inaptidão:</strong>
              Casos de desistência ou inaptidão ficam arquivados para proteção jurídica sem poluir o eSocial.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Activity className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 dark:text-slate-200 block">Efetivação em 1 Clique:</strong>
              Ao retornar com o Atestado de aptidão, com um clique ele é registrado no PCMSO e no evento S-2220.
            </div>
          </div>
        </div>

        {/* CARDS DE MÉTRICAS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Emitidos</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{contadores.total}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60">
            <div className="text-xs text-amber-700 dark:text-amber-400">Aguardando Exame</div>
            <div className="text-xl font-bold text-amber-800 dark:text-amber-300 mt-1">{contadores.pendentes}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
            <div className="text-xs text-emerald-700 dark:text-emerald-400">Realizados (Aptos)</div>
            <div className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">{contadores.realizados}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/60">
            <div className="text-xs text-red-700 dark:text-red-400">Inaptos</div>
            <div className="text-xl font-bold text-red-800 dark:text-red-300 mt-1">{contadores.inaptos}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            <div className="text-xs text-slate-600 dark:text-slate-400">Não Compareceu</div>
            <div className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-1">{contadores.naoCompareceu}</div>
          </div>
        </div>

        {/* FILTROS E BUSCA */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por trabalhador, CPF, cargo ou clínica..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
            >
              <option value="todos">Todos os Status</option>
              <option value="Pendente">Apenas Pendentes (Aguardando)</option>
              <option value="Realizado">Apenas Realizados (Aptos)</option>
              <option value="Inapto">Apenas Inaptos</option>
              <option value="NaoCompareceu">Não Compareceu / Desistência</option>
            </select>
          </div>
        </div>
      </div>

      {/* LISTAGEM DOS ENCAMINHAMENTOS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
          <span>Histórico de Guias Emitidas</span>
          <span className="text-xs font-normal text-slate-500">
            Exibindo {encaminhamentosFiltrados.length} de {encaminhamentos.length} guia(s)
          </span>
        </h3>

        {encaminhamentosFiltrados.length === 0 ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Nenhum encaminhamento encontrado.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Clique no botão <strong>"Novo Encaminhamento"</strong> acima para gerar a primeira guia médica.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {encaminhamentosFiltrados.map((enc) => {
              const cl = clinicas.find((c) => c.id === enc.clinicaId);

              const statusColor =
                enc.status === "Pendente"
                  ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300"
                  : enc.status === "Realizado"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300"
                  : enc.status === "Inapto"
                  ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/80 dark:text-red-300"
                  : "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300";

              return (
                <div
                  key={enc.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800/80 transition bg-slate-50/50 dark:bg-slate-800/20"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {enc.tipoExame.slice(0, 3).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">
                            {enc.nomeTrabalhador}
                          </h4>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                            CPF: {enc.cpf}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                              enc.tipoTrabalhador === "candidato"
                                ? "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300"
                                : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300"
                            }`}
                          >
                            {enc.tipoTrabalhador === "candidato" ? "Candidato (Pré-admissão)" : "Colaborador Efetivo"}
                          </span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${statusColor}`}>
                            {enc.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-y-1 gap-x-3">
                          <span>
                            <strong>Cargo:</strong> {enc.cargo}
                          </span>
                          <span>•</span>
                          <span>
                            <strong>Setor:</strong> {enc.setor}
                          </span>
                          <span>•</span>
                          <span>
                            <strong>Clínica:</strong> {cl?.nome || enc.clinicaNome}
                          </span>
                          <span>•</span>
                          <span>
                            <strong>Emissão:</strong> {new Date(enc.dataEmissao).toLocaleDateString("pt-BR")}
                          </span>
                        </div>

                        {/* EXAMES SOLICITADOS BADGES */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {enc.examesSolicitados.map((ex) => (
                            <span
                              key={ex.id}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                            >
                              {ex.nome}
                              {ex.codigoEsocial && (
                                <span className="ml-1 text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold">
                                  ({ex.codigoEsocial})
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* AÇÕES */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => generateAsoEncaminhamentoPdf(company, enc, cl)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Baixar Guia Oficial de Encaminhamento em PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        Guia PDF
                      </button>

                      <button
                        onClick={() => handleShareWhatsApp(enc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 transition"
                        title="Enviar instruções do exame para o WhatsApp do trabalhador ou RH"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        WhatsApp
                      </button>

                      {enc.status === "Pendente" && (
                        <button
                          onClick={() => handleOpenConcluirModal(enc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
                          title="Registrar retorno com laudo e concluir ASO no PCMSO / eSocial"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          Concluir ASO
                        </button>
                      )}

                      {/* Menu rápido de status */}
                      <select
                        value={enc.status}
                        onChange={(e) => handleUpdateStatus(enc.id, e.target.value as any)}
                        className="px-2 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Realizado">Realizado (Apto)</option>
                        <option value="Inapto">Inapto</option>
                        <option value="NaoCompareceu">Não Compareceu</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>

                      <button
                        onClick={() => handleDeleteEncaminhamento(enc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
                        title="Excluir encaminhamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* MODAL NOVO ENCAMINHAMENTO */}
      {/* ===================================================================== */}
      {isNovoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Nova Guia de Encaminhamento para ASO
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Emitir ordem de exames para clínica credenciada conforme NR-07 e Tabela 27 do eSocial.
                </p>
              </div>
              <button
                onClick={() => setIsNovoModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarEncaminhamento} className="space-y-4">
              {/* VÍNCULO: COLABORADOR VS CANDIDATO */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Tipo de Destinatário:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTipoTrabalhador("candidato")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 transition ${
                      tipoTrabalhador === "candidato"
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Candidato (Pré-Admissão / Processo Seletivo)
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoTrabalhador("colaborador")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 transition ${
                      tipoTrabalhador === "colaborador"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Colaborador com Vínculo Ativo
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  {tipoTrabalhador === "candidato"
                    ? "💡 Para candidatos em admissão, os dados ficam isolados sem vincular ao eSocial até a realização do exame e efetivação da contratação."
                    : "💡 Para colaboradores ativos, o sistema sincroniza com os dados já existentes na empresa."}
                </p>
              </div>

              {/* DADOS DO TRABALHADOR */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo de Oliveira"
                    value={nomeTrabalhador}
                    onChange={(e) => setNomeTrabalhador(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CPF *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={cpfTrabalhador}
                    onChange={(e) => setCpfTrabalhador(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={nascTrabalhador}
                    onChange={(e) => setNascTrabalhador(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sexo
                  </label>
                  <select
                    value={sexoTrabalhador}
                    onChange={(e) => setSexoTrabalhador(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={telTrabalhador}
                    onChange={(e) => setTelTrabalhador(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    RG
                  </label>
                  <input
                    type="text"
                    placeholder="00.000.000-0"
                    value={rgTrabalhador}
                    onChange={(e) => setRgTrabalhador(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* VÍNCULO COM FUNÇÃO E SETOR DO PGR */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    Vincular a uma Função do PGR (Auto-preenchimento de Riscos e Exames)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Selecionar Cargo Cadastrado:
                    </label>
                    <select
                      value={selectedFuncaoId}
                      onChange={(e) => handleSelectFuncao(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Preencher Manualmente --</option>
                      {funcoes.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.func_nome} ({f.func_setor})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Cargo / Função *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Soldador Industrial"
                      value={cargoTrabalhador}
                      onChange={(e) => setCargoTrabalhador(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Setor
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Produção / Manutenção"
                      value={setorTrabalhador}
                      onChange={(e) => setSetorTrabalhador(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* TIPO DE EXAME E CLÍNICA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Exame Ocupacional *
                  </label>
                  <select
                    value={tipoExame}
                    onChange={(e) => setTipoExame(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-emerald-700 dark:text-emerald-400"
                  >
                    <option value="Admissional">Exame Admissional</option>
                    <option value="Periódico">Exame Periódico</option>
                    <option value="Retorno ao Trabalho">Retorno ao Trabalho</option>
                    <option value="Mudança de Riscos Ocupacionais">Mudança de Riscos Ocupacionais</option>
                    <option value="Demissional">Exame Demissional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Data da Emissão
                  </label>
                  <input
                    type="date"
                    value={dataEmissao}
                    onChange={(e) => setDataEmissao(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Clínica Credenciada *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsClinicasModalOpen(true)}
                      className="text-[11px] text-emerald-600 hover:underline font-bold"
                    >
                      + Gerenciar Clínicas
                    </button>
                  </div>
                  <select
                    value={selectedClinicaId}
                    onChange={(e) => setSelectedClinicaId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  >
                    {clinicas.length === 0 ? (
                      <option value="">Nenhuma clínica cadastrada</option>
                    ) : (
                      clinicas.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome} {c.cidade ? `(${c.cidade}/${c.uf})` : ""}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* SELEÇÃO DE EXAMES (TABELA 27 ESOCIAL) */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    Procedimentos Diagnósticos Solicitados (Tabela 27 do eSocial):
                  </label>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar exame (ex: audiometria, raio-x)..."
                      value={searchExameCatalogo}
                      onChange={(e) => setSearchExameCatalogo(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                {/* Exames Selecionados Chips */}
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 min-h-[38px]">
                  {examesSelecionados.length === 0 ? (
                    <span className="text-xs text-slate-400">Nenhum exame selecionado.</span>
                  ) : (
                    examesSelecionados.map((ex) => (
                      <span
                        key={ex.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                      >
                        <span>{ex.nome}</span>
                        {ex.codigoEsocial && (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold">
                            ({ex.codigoEsocial})
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setExamesSelecionados(
                              examesSelecionados.filter((item) => item.nome !== ex.nome)
                            )
                          }
                          className="text-emerald-700 hover:text-red-600 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Catálogo com scroll */}
                <div className="max-h-44 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-900 space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
                  {EXAMES_TABELA_27.filter((ex) =>
                    !searchExameCatalogo
                      ? true
                      : ex.nome.toLowerCase().includes(searchExameCatalogo.toLowerCase()) ||
                        ex.codigoEsocial.includes(searchExameCatalogo) ||
                        ex.grupo.toLowerCase().includes(searchExameCatalogo.toLowerCase())
                  ).map((ex) => {
                    const isSelected = examesSelecionados.some(
                      (item) => item.codigoEsocial === ex.codigoEsocial && item.nome === ex.nome
                    );
                    return (
                      <label
                        key={ex.id}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleExameCatalogo(ex)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{ex.nome}</span>
                            {ex.detalhe && (
                              <span className="block text-[11px] text-slate-500">{ex.detalhe}</span>
                            )}
                          </div>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                          Tabela 27: {ex.codigoEsocial}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* OBSERVAÇÕES / RESTRIÇÕES */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observações Clínicas / Orientações de Preparo (Jejum, Repouso, etc.)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Jejum de 8h para exames de sangue; Repouso auditivo de 14h para audiometria ocupacional."
                  value={obsEncaminhamento}
                  onChange={(e) => setObsEncaminhamento(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNovoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                >
                  Salvar e Gerar Guia PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL GESTÃO DE CLÍNICAS CREDENCIADAS */}
      {/* ===================================================================== */}
      {isClinicasModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-sky-600" />
                  Clínicas Credenciadas e Consultórios de Medicina do Trabalho
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cadastre as clínicas parceiras para emissão rápida das guias com endereço e contato automáticos.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsClinicasModalOpen(false);
                  setEditingClinica(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* FORMULÁRIO DE CADASTRO / EDIÇÃO */}
            <form onSubmit={handleSalvarClinica} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {editingClinica?.id ? "Editar Clínica Credenciada" : "＋ Cadastrar Nova Clínica Credenciada"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nome da Clínica / Consultório *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Clínica Saúde Ocupacional Médica"
                    value={editingClinica?.nome || ""}
                    onChange={(e) => setEditingClinica({ ...editingClinica, nome: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={editingClinica?.cnpj || ""}
                    onChange={(e) => setEditingClinica({ ...editingClinica, cnpj: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Médico Responsável
                  </label>
                  <input
                    type="text"
                    placeholder="Dr(a). Nome Completo"
                    value={editingClinica?.medicoResponsavel || ""}
                    onChange={(e) => setEditingClinica({ ...editingClinica, medicoResponsavel: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CRM
                  </label>
                  <input
                    type="text"
                    placeholder="CRM 12345"
                    value={editingClinica?.crm || ""}
                    onChange={(e) => setEditingClinica({ ...editingClinica, crm: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={editingClinica?.telefone || ""}
                    onChange={(e) =>
                      setEditingClinica({
                        ...editingClinica,
                        telefone: e.target.value,
                        whatsapp: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    E-mail da Clínica / Agendamento
                  </label>
                  <input
                    type="email"
                    placeholder="contato@clinica.com.br"
                    value={editingClinica?.email || ""}
                    onChange={(e) => setEditingClinica({ ...editingClinica, email: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Logradouro / Rua e Número
                  </label>
                  <input
                    type="text"
                    placeholder="Rua das Flores, 120"
                    value={editingClinica?.logradouro || ""}
                    onChange={(e) => setEditingClinica({ ...editingClinica, logradouro: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    placeholder="Sala 402, Bloco B"
                    value={editingClinica?.complemento || ""}
                    onChange={(e) => setEditingClinica({ ...editingClinica, complemento: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    placeholder="Centro"
                    value={editingClinica?.bairro || ""}
                    onChange={(e) => setEditingClinica({ ...editingClinica, bairro: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={editingClinica?.cep || ""}
                    onChange={(e) => setEditingClinica({ ...editingClinica, cep: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={editingClinica?.cidade || ""}
                    onChange={(e) => setEditingClinica({ ...editingClinica, cidade: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    UF
                  </label>
                  <input
                    type="text"
                    placeholder="UF"
                    value={editingClinica?.uf || ""}
                    onChange={(e) => setEditingClinica({ ...editingClinica, uf: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 uppercase font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {editingClinica && (
                  <button
                    type="button"
                    onClick={() => setEditingClinica(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 rounded-lg shadow-sm"
                >
                  {editingClinica?.id ? "Salvar Alterações" : "Salvar Clínica"}
                </button>
              </div>
            </form>

            {/* LISTAGEM DE CLÍNICAS JÁ CADASTRADAS */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Clínicas Cadastradas ({clinicas.length}):
              </h4>

              {clinicas.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Nenhuma clínica cadastrada no momento.
                </div>
              ) : (
                clinicas.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900"
                  >
                    <div>
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>🏥 {c.nome}</span>
                        {c.crm && (
                          <span className="text-xs px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono">
                            CRM: {c.crm}
                          </span>
                        )}
                      </h5>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        {c.medicoResponsavel && <span>Médico: {c.medicoResponsavel}</span>}
                        {c.logradouro && (
                          <span>
                            Endereço: {c.logradouro}
                            {c.numero ? `, ${c.numero}` : ""}
                            {c.complemento ? ` (${c.complemento})` : ""}
                            {c.bairro ? ` - ${c.bairro}` : ""}
                          </span>
                        )}
                        {c.cidade && <span>Local: {c.cidade}/{c.uf}</span>}
                        {c.telefone && <span>Tel: {c.telefone}</span>}
                        {c.email && <span className="text-sky-600 dark:text-sky-400">E-mail: {c.email}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingClinica(c)}
                        className="p-1.5 text-slate-600 hover:text-sky-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClinica(c.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL CONCLUIR / EFETIVAR ASO NO PCMSO */}
      {/* ===================================================================== */}
      {isConcluirAsoModalOpen && selectedEncParaConcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                  Concluir e Efetivar ASO no PCMSO
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedEncParaConcluir.nomeTrabalhador} • {selectedEncParaConcluir.tipoExame}
                </p>
              </div>
              <button
                onClick={() => setIsConcluirAsoModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resultado da Aptidão Clínica (ASO) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setResultadoAptidao("Apto")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      resultadoAptidao === "Apto"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    ✓ APTO
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultadoAptidao("Apto com Restrição")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      resultadoAptidao === "Apto com Restrição"
                        ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    ! Com Restrição
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultadoAptidao("Inapto")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      resultadoAptidao === "Inapto"
                        ? "bg-red-600 text-white border-red-600 shadow-sm"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    ✕ INAPTO
                  </button>
                </div>
              </div>

              {resultadoAptidao === "Apto com Restrição" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Descrição da Restrição Médica
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Restrição temporária para esforço lombar e levantamento de cargas >15kg."
                    value={restricaoDesc}
                    onChange={(e) => setRestricaoDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Data da Realização do Exame
                  </label>
                  <input
                    type="date"
                    value={dataRealizacaoAso}
                    onChange={(e) => setDataRealizacaoAso(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Data de Validade do ASO
                  </label>
                  <input
                    type="date"
                    value={dataValidadeAso}
                    onChange={(e) => setDataValidadeAso(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Médico Examinador
                  </label>
                  <input
                    type="text"
                    value={medicoExaminadorNome}
                    onChange={(e) => setMedicoExaminadorNome(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CRM do Médico Examinador
                  </label>
                  <input
                    type="text"
                    value={medicoExaminadorCrm}
                    onChange={(e) => setMedicoExaminadorCrm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsConcluirAsoModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarConclusaoAso}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-sm"
              >
                Salvar no PCMSO & eSocial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL IMPORTAÇÃO / SINCRONIZAÇÃO DE SISTEMA ASO (JSON) */}
      {/* ===================================================================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-emerald-600" />
                  Sincronização & Backup do Sistema ASO
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Importe empresas clientes, clínicas e ASOs, ou sincronize com seu celular.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportSummary(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* ABAS DO MODAL */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold gap-1">
              <button
                type="button"
                onClick={() => setImportModalTab("importar")}
                className={`flex-1 py-2 rounded-lg transition text-center ${
                  importModalTab === "importar"
                    ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                📥 Importar Arquivo (.json)
              </button>
              <button
                type="button"
                onClick={() => setImportModalTab("comoVerCelular")}
                className={`flex-1 py-2 rounded-lg transition text-center ${
                  importModalTab === "comoVerCelular"
                    ? "bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                📱 Como Ver no Celular?
              </button>
              <button
                type="button"
                onClick={() => setImportModalTab("enviarCelular")}
                className={`flex-1 py-2 rounded-lg transition text-center ${
                  importModalTab === "enviarCelular"
                    ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                📤 Baixar / Enviar Backup
              </button>
            </div>

            {/* ABA 1: IMPORTAR ARQUIVO */}
            {importModalTab === "importar" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                  <strong>Sincronização Inteligente:</strong> O sistema localiza as empresas por CNPJ ou Razão Social. Se já existirem, atualiza os dados cadastrais (CNAE, Grau de Risco, Endereço, Bairro, Cidade, Telefone, E-mail). Se for uma nova empresa, realiza o cadastro completo automaticamente!
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Aviso importante:</strong> Os dados importados neste computador ficam gravados na memória segura do navegador deste PC. Para que apareçam também no seu celular, clique na aba <u>"📱 Como Ver no Celular?"</u> acima.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    1. Carregar Arquivo de Backup (.json)
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    2. Ou Cole o Conteúdo do JSON Diretamente
                  </label>
                  <textarea
                    rows={5}
                    placeholder='{"version": "4.0", "data": { "empresas": [...], "clinicas": [...] }}'
                    value={jsonImportText}
                    onChange={(e) => setJsonImportText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                {importSummary && (
                  <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-800 dark:text-sky-300 font-semibold">
                    {importSummary}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsImportModalOpen(false);
                      setImportSummary(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessarImportacaoJson}
                    className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-sm"
                  >
                    Processar e Sincronizar Empresas
                  </button>
                </div>
              </div>
            )}

            {/* ABA 2: COMO VER NO CELULAR */}
            {importModalTab === "comoVerCelular" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200">
                  <div className="font-bold text-sm mb-1 flex items-center gap-1.5 text-sky-800 dark:text-sky-300">
                    <HelpCircle className="w-4 h-4" />
                    Por que as empresas aparecem no computador mas não no celular?
                  </div>
                  <p>
                    O <strong>SST Vistoria</strong> é um sistema <em>Offline-First</em> que salva seus dados com segurança na memória local do seu navegador (IndexedDB / SQLite). Por regras de segurança e privacidade da internet, os navegadores de computadores e de celulares são <strong>ambientes isolados</strong>.
                  </p>
                  <p className="mt-1 font-semibold">
                    Para ter as mesmas empresas no celular, você tem 2 formas muito simples:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Opção 1: Nuvem Firestore em Tempo Real */}
                  <div className="p-4 rounded-xl border-2 border-blue-500/50 dark:border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/40 space-y-2 relative">
                    <span className="absolute -top-2.5 right-3 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Recomendado
                    </span>
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                      Nuvem em Tempo Real (Firestore)
                    </div>
                    <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-decimal pl-4">
                      <li>Clique no botão <strong>"Nuvem"</strong> no topo da tela e entre com seu e-mail e senha.</li>
                      <li>No <strong>celular</strong>, abra este mesmo endereço e entre com a mesma conta.</li>
                      <li><strong>Pronto!</strong> Todas as empresas e ASOs importados no PC surgem no celular na mesma hora em tempo real.</li>
                    </ol>
                  </div>

                  {/* Opção 2: Importar no Celular */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[10px]">2</span>
                      Arquivo JSON (WhatsApp)
                    </div>
                    <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal pl-4">
                      <li>Envie o arquivo <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-[11px]">.json</code> de backup para o seu <strong>WhatsApp</strong>.</li>
                      <li>No celular, abra a aba <strong>PCMSO</strong> &gt; <strong>Importar / Sincronizar Sistema ASO</strong>.</li>
                      <li>Selecione o arquivo e clique em <strong>Processar</strong>.</li>
                    </ol>
                  </div>

                  {/* Opção 3: Google Drive */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-2">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px]">3</span>
                      Google Drive Backup
                    </div>
                    <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal pl-4">
                      <li>No computador: Abra o <strong>Menu</strong> &gt; <strong>Salvar no Drive Agora</strong>.</li>
                      <li>No celular: Abra o <strong>Menu</strong> &gt; conecte a mesma conta Google &gt; <strong>Restaurar Vistorias da Nuvem</strong>.</li>
                    </ol>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setImportModalTab("enviarCelular")}
                    className="px-3 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Backup Atual para Enviar ao Celular
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-5 py-2 text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 rounded-xl"
                  >
                    Entendi
                  </button>
                </div>
              </div>
            )}

            {/* ABA 3: BAIXAR / ENVIAR BACKUP */}
            {importModalTab === "enviarCelular" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200">
                  <strong className="block mb-1 text-indigo-800 dark:text-indigo-300">
                    Gerar Arquivo de Backup para Celular
                  </strong>
                  Você tem <strong>{(companies && companies.length > 0 ? companies.length : 1)} empresa(s)</strong> cadastradas neste computador. Baixe o arquivo ou copie o código abaixo para carregar no celular:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleExportBackupJson}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition text-center cursor-pointer shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mb-2">
                      <Download className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Baixar Arquivo (.json)
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Salve no PC e envie para você no WhatsApp
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyBackupJson}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition text-center cursor-pointer shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 mb-2">
                      <Copy className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Copiar Conteúdo JSON
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Cole no WhatsApp Web direto para o celular
                    </span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  <strong>Depois de enviar para o WhatsApp:</strong> Abra o sistema no celular, clique em <em>PCMSO</em> &gt; <em>Importar / Sincronizar Sistema ASO</em> e carregue o arquivo.
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setImportModalTab("comoVerCelular")}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Ver Passo a Passo
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-5 py-2 text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 rounded-xl"
                  >
                    Concluir
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
