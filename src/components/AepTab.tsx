import React, { useState, useRef } from "react";
import {
  Activity,
  Plus,
  Trash2,
  Edit3,
  Camera,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Upload,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ArrowRight,
  Shield,
  Layers,
  Zap,
  Info,
  Clock,
  Eye,
  Settings,
  Flame,
  Check,
  RotateCcw,
} from "lucide-react";
import { Company, AepItem, AepConformidade, FotoEvidencia, FuncaoData, SetorData } from "../types";
import { AEP_TEMPLATES, AepTemplate } from "../data/aepTemplates";
import { CameraCaptureModal } from "./CameraCaptureModal";
import { gerarPDFAEP } from "../services/pdfGenerator";
import { CoutoChecklistView } from "./CoutoChecklistView";
import { calculateCoutoDiagnosis } from "../data/coutoChecklistCatalog";
import { gerarPDFChecklistCouto } from "../services/aepCoutoPdfGenerator";

interface AepTabProps {
  company: Company;
  funcoes: FuncaoData[];
  setores: SetorData[];
  aepAvaliacoes: AepItem[];
  onSaveAep: (aep: AepItem) => void;
  onDeleteAep: (id: string) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

const generateId = () => "aep_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);

// Mapeamento de itens com recomendações padronizadas da NR-17
const CHECKLIST_METADATA: {
  key: keyof AepItem;
  label: string;
  domain: "org" | "cargas" | "mob" | "maq" | "amb";
  domainLabel: string;
  description: string;
  defaultRec: string;
}[] = [
  // 1. Organização
  {
    key: "org_pausas",
    label: "Pausas estruturadas / descanso durante a jornada",
    domain: "org",
    domainLabel: "Organização do Trabalho",
    description: "Possibilidade de pausas para alívio postural e recuperação psicofisiológica.",
    defaultRec: "Instituir pausas regulares de 10 minutos a cada 50 minutos de atividade contínua (NR-17.4).",
  },
  {
    key: "org_alternancia",
    label: "Alternância postural (sentado / em pé / caminhada)",
    domain: "org",
    domainLabel: "Organização do Trabalho",
    description: "O trabalho não deve obrigar a permanência rígida ou estática na mesma posição.",
    defaultRec: "Possibilitar alternância de posturas entre a posição sentada e em pé durante a jornada.",
  },
  {
    key: "org_ritmo_metas",
    label: "Ritmo de trabalho e exigência temporal compatíveis",
    domain: "org",
    domainLabel: "Organização do Trabalho",
    description: "Ausência de sobrepressão de metas, esteira excessivamente acelerada ou cadência imposta.",
    defaultRec: "Adequar o ritmo de trabalho e metas à capacidade física e cognitiva dos colaboradores.",
  },
  {
    key: "org_horas_extras",
    label: "Horas extras e sobrecarga de jornada controladas",
    domain: "org",
    domainLabel: "Organização do Trabalho",
    description: "Jornada compatível com a capacidade psicofisiológica sem prorrogações excessivas.",
    defaultRec: "Controlar rigorosamente a realização de horas extras evitando sobrecarga neuromuscular.",
  },

  // 2. Cargas
  {
    key: "cargas_peso_frequencia",
    label: "Peso unitário e frequência de levantamento adequados",
    domain: "cargas",
    domainLabel: "Movimentação de Cargas",
    description: "Cargas dentro dos limites seguros da NR-17 (< 15-20 kg para homens e < 10-15 kg para mulheres).",
    defaultRec: "Fracionar volumes de cargas e limitar pesos individuais dentro dos padrões da NR-17.5.",
  },
  {
    key: "cargas_pega_distancia",
    label: "Pega firme e distância da carga próxima ao tronco",
    domain: "cargas",
    domainLabel: "Movimentação de Cargas",
    description: "Ausência de flexão/torção excessiva da coluna ou levantamento acima da linha dos ombros.",
    defaultRec: "Melhorar a pega das cargas e posicionar estoques para evitar torções ou flexões lombares agudas.",
  },
  {
    key: "cargas_meios_mecanicos",
    label: "Disponibilização de meios mecânicos de transporte",
    domain: "cargas",
    domainLabel: "Movimentação de Cargas",
    description: "Carrinhos hidráulicos, paleteiras, talhas ou pontes rolantes para cargas pesadas.",
    defaultRec: "Disponibilizar dispositivos auxiliares de transporte (paleteiras, carrinhos plataforma ou talhas).",
  },

  // 3. Mobiliário
  {
    key: "mob_cadeira_ajustavel",
    label: "Cadeira regulável (altura a gás, encosto lombar e braços)",
    domain: "mob",
    domainLabel: "Mobiliário",
    description: "Assento com borda frontal arredondada, regulagem de altura e estofamento adequado (NBR 13962).",
    defaultRec: "Substituir assentos por cadeiras ergonômicas certificadas (NBR 13962) com regulagem de altura e apoio lombar.",
  },
  {
    key: "mob_mesa_espaco",
    label: "Mesa / Bancada com altura e espaço livre para pernas",
    domain: "mob",
    domainLabel: "Mobiliário",
    description: "Permite movimentação livre das pernas sem obstáculos sob o plano de trabalho.",
    defaultRec: "Desobstruir a área sob a mesa/bancada garantindo espaço livre adequado para pernas e coxas.",
  },
  {
    key: "mob_apoio_pes",
    label: "Apoio para os pés disponível quando necessário",
    domain: "mob",
    domainLabel: "Mobiliário",
    description: "Para colaboradores cujos pés não alcancem confortavelmente o piso na postura sentada.",
    defaultRec: "Fornecer apoios de pés reguláveis em inclinação e altura para os colaboradores que necessitarem.",
  },
  {
    key: "mob_monitor_visao",
    label: "Suporte de monitor alinhado à altura dos olhos",
    domain: "mob",
    domainLabel: "Mobiliário",
    description: "Topo da tela alinhado à linha do olhar horizontal evitando flexão/extensão cervical contínua.",
    defaultRec: "Instalar suportes ajustáveis de monitor mantendo o terço superior alinhado à linha do olhar horizontal.",
  },

  // 4. Máquinas e Ferramentas
  {
    key: "maq_empunhadura",
    label: "Ferramentas com empunhadura anatômica e peso balanceado",
    domain: "maq",
    domainLabel: "Máquinas e Ferramentas",
    description: "Sem pontos de compressão mecânica nos tecidos moles da palma da mão.",
    defaultRec: "Adotar ferramentas manuais com empunhaduras anatômicas, emborrachadas e peso balanceado.",
  },
  {
    key: "maq_esforco_acionamento",
    label: "Comandos e botões de fácil alcance e acionamento leve",
    domain: "maq",
    domainLabel: "Máquinas e Ferramentas",
    description: "Pedais, botoeiras e alavancas situados na zona de alcance confortável dos braços.",
    defaultRec: "Reorganizar comandos e botoeiras operacionais na zona de alcance confortável dos membros superiores.",
  },
  {
    key: "maq_vibracao",
    label: "Vibração e impacto mecânico controlados",
    domain: "maq",
    domainLabel: "Máquinas e Ferramentas",
    description: "Ferramentas com amortecedores ou suspensão por balancins de sustentação.",
    defaultRec: "Instalar balancins de sustentação de peso para ferramentas manuais pesadas ou amortecedores anti-vibração.",
  },

  // 5. Conforto Ambiental
  {
    key: "amb_ruido",
    label: "Nível de ruído compatível com conforto acústico (NR-17.8.2)",
    domain: "amb",
    domainLabel: "Conforto Ambiental",
    description: "Permite comunicação verbal e concentração sem elevação forçada da voz.",
    defaultRec: "Implementar atenuação acústica ou remanejar equipamentos geradores de ruído no ambiente.",
  },
  {
    key: "amb_temperatura",
    label: "Temperatura e circulação do ar adequadas (20°C a 25°C)",
    domain: "amb",
    domainLabel: "Conforto Ambiental",
    description: "Conforto térmico conforme NBR ISO 7730 / NR-17.8.4.",
    defaultRec: "Manter a climatização do ambiente entre 20°C e 25°C e garantir velocidade do ar confortável.",
  },
  {
    key: "amb_iluminancia",
    label: "Iluminância uniforme no campo de trabalho sem ofuscamento",
    domain: "amb",
    domainLabel: "Conforto Ambiental",
    description: "Conforme parâmetros da NHO 11 da Fundacentro.",
    defaultRec: "Adequar os níveis de iluminância no plano de trabalho conforme os padrões da NHO 11 da Fundacentro.",
  },
];

// Helper para calcular o status consolidado de um domínio (C, NC, NA)
export const getDomainConsolidatedStatus = (aep: AepItem, domain: "org" | "cargas" | "mob" | "maq" | "amb"): { status: AepConformidade; ncCount: number } => {
  const items = CHECKLIST_METADATA.filter((m) => m.domain === domain);
  const ncCount = items.filter((m) => aep[m.key] === "NC").length;
  if (ncCount > 0) return { status: "NC", ncCount };
  const naCount = items.filter((m) => aep[m.key] === "NA").length;
  if (naCount === items.length) return { status: "NA", ncCount: 0 };
  return { status: "C", ncCount: 0 };
};

// Helper para listar todos os itens com Não Conformidade (NC) em um AepItem
export const getNcItemsList = (aep: AepItem) => {
  return CHECKLIST_METADATA.filter((m) => aep[m.key] === "NC");
};

export const AepTab: React.FC<AepTabProps> = ({
  company,
  funcoes,
  setores,
  aepAvaliacoes = [],
  onSaveAep,
  onDeleteAep,
  onAlert,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentAep, setCurrentAep] = useState<AepItem | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [isGeneratingFindings, setIsGeneratingFindings] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string>("mob");
  const [novaRecomendacao, setNovaRecomendacao] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoScanInputRef = useRef<HTMLInputElement>(null);

  // Iniciar nova AEP (Couto ou NR-17)
  const handleStartNewAep = (funcao?: FuncaoData, metodologia: "couto" | "dominios_nr17" = "couto") => {
    const matchedSetor = funcao ? setores.find((s) => s.id === funcao.func_setor || s.setor_nome === funcao.func_setor) : null;
    const defaultTemplate = AEP_TEMPLATES[0];

    const newAep: AepItem = {
      id: generateId(),
      metodologia,
      coutoRespostas: {},
      coutoTotalSim: 0,
      coutoClassificacaoMedida: "a",
      coutoObservacoesDetalhadas: "",
      trabalhadorNome: "",
      funcaoId: funcao?.id || (funcoes[0]?.id || ""),
      funcaoNome: funcao?.func_nome || (funcoes[0]?.func_nome || "Função / Posto de Trabalho"),
      setorNome: matchedSetor?.setor_nome || funcao?.func_setor || (setores[0]?.setor_nome || "Setor Operacional"),
      tipoPosto: defaultTemplate.dadosAep.tipoPosto,
      atividadesDescricao: funcao?.func_descricao || defaultTemplate.dadosAep.atividadesDescricao,
      fotos: [],
      // 1. Organização
      org_pausas: defaultTemplate.dadosAep.org_pausas,
      org_alternancia: defaultTemplate.dadosAep.org_alternancia,
      org_ritmo_metas: defaultTemplate.dadosAep.org_ritmo_metas,
      org_horas_extras: defaultTemplate.dadosAep.org_horas_extras,
      org_obs: defaultTemplate.dadosAep.org_obs,
      // 2. Cargas
      cargas_peso_frequencia: defaultTemplate.dadosAep.cargas_peso_frequencia,
      cargas_pega_distancia: defaultTemplate.dadosAep.cargas_pega_distancia,
      cargas_meios_mecanicos: defaultTemplate.dadosAep.cargas_meios_mecanicos,
      cargas_obs: defaultTemplate.dadosAep.cargas_obs,
      // 3. Mobiliário
      mob_cadeira_ajustavel: defaultTemplate.dadosAep.mob_cadeira_ajustavel,
      mob_mesa_espaco: defaultTemplate.dadosAep.mob_mesa_espaco,
      mob_apoio_pes: defaultTemplate.dadosAep.mob_apoio_pes,
      mob_monitor_visao: defaultTemplate.dadosAep.mob_monitor_visao,
      mob_obs: defaultTemplate.dadosAep.mob_obs,
      // 4. Máquinas
      maq_empunhadura: defaultTemplate.dadosAep.maq_empunhadura,
      maq_esforco_acionamento: defaultTemplate.dadosAep.maq_esforco_acionamento,
      maq_vibracao: defaultTemplate.dadosAep.maq_vibracao,
      maq_obs: defaultTemplate.dadosAep.maq_obs,
      // 5. Conforto
      amb_ruido: defaultTemplate.dadosAep.amb_ruido,
      amb_temperatura: defaultTemplate.dadosAep.amb_temperatura,
      amb_iluminancia: defaultTemplate.dadosAep.amb_iluminancia,
      amb_obs: defaultTemplate.dadosAep.amb_obs,
      // Conclusão
      classificacaoRisco: defaultTemplate.dadosAep.classificacaoRisco,
      necessidadeAET: defaultTemplate.dadosAep.necessidadeAET,
      justificativaAET: defaultTemplate.dadosAep.justificativaAET,
      recomendacoes: [...defaultTemplate.dadosAep.recomendacoes],
      parecerTecnico: defaultTemplate.dadosAep.parecerTecnico,
      avaliador: company.empresa.emp_consultoria_tecnico || company.empresa.emp_tecnico || "Avaliador SST",
      dataAvaliacao: new Date().toISOString().slice(0, 10),
    };

    setCurrentAep(newAep);
    setIsEditing(true);
  };

  const handleEditAep = (aep: AepItem) => {
    // Se a AEP foi salva com coutoRespostas, garante metodologia = 'couto'
    const hasCouto = aep.metodologia === "couto" || (aep.coutoRespostas && Object.keys(aep.coutoRespostas).length > 0);
    setCurrentAep({
      ...aep,
      metodologia: hasCouto ? "couto" : aep.metodologia || "dominios_nr17",
      coutoRespostas: aep.coutoRespostas || {},
    });
    setIsEditing(true);
  };

  // Sincronização inteligente entre Couto e campos NR-17
  const syncCoutoToNr17 = (respostas: Record<string, "sim" | "nao" | "na">): Partial<AepItem> => {
    return {
      cargas_peso_frequencia: respostas.op8 === "sim" || respostas.op9 === "sim" ? "NC" : "C",
      cargas_meios_mecanicos: respostas.op10 === "sim" ? "NC" : "C",
      cargas_pega_distancia: respostas.op2 === "sim" ? "NC" : "C",
      mob_cadeira_ajustavel: respostas.op4 === "sim" || respostas.info4 === "sim" ? "NC" : "C",
      mob_mesa_espaco: respostas.info1 === "sim" ? "NC" : "C",
      mob_monitor_visao: respostas.info1 === "sim" ? "NC" : "C",
      org_pausas: respostas.op6 === "sim" ? "NC" : "C",
      org_alternancia: respostas.op3 === "sim" ? "NC" : "C",
      org_ritmo_metas: respostas.op11 === "sim" ? "NC" : "C",
      maq_esforco_acionamento: respostas.op5 === "sim" || respostas.op7 === "sim" ? "NC" : "C",
      maq_empunhadura: respostas.op7 === "sim" ? "NC" : "C",
      maq_vibracao: respostas.op13 === "sim" ? "NC" : "C",
      amb_ruido: respostas.op13 === "sim" || respostas.info5 === "sim" ? "NC" : "C",
      amb_temperatura: respostas.op13 === "sim" || respostas.info5 === "sim" ? "NC" : "C",
      amb_iluminancia: respostas.info5 === "sim" ? "NC" : "C",
    };
  };

  // Alternar opção no Checklist de Hudson Couto
  const handleUpdateCoutoOption = (itemId: string, valor: "sim" | "nao" | "na") => {
    if (!currentAep) return;
    const currentRespostas = { ...(currentAep.coutoRespostas || {}) };
    currentRespostas[itemId] = valor;

    const diag = calculateCoutoDiagnosis(currentRespostas);
    const nr17Sync = syncCoutoToNr17(currentRespostas);

    setCurrentAep((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        coutoRespostas: currentRespostas,
        coutoTotalSim: diag.simCount,
        classificacaoRisco: diag.classificacaoRisco,
        necessidadeAET: diag.necessidadeAET,
        justificativaAET: diag.justificativaAET,
        coutoClassificacaoMedida: prev.coutoClassificacaoMedida || diag.classificacaoMedidaSugerida,
        recomendacoes: Array.from(new Set([...(prev.recomendacoes || []), ...diag.recomendacoesAutomaticas])),
        ...nr17Sync,
      };
    });
  };

  // Emitir PDF de uma única AEP (adequado à metodologia utilizada)
  const handleExportSinglePdf = (aep: AepItem) => {
    try {
      if (aep.metodologia === "couto" || (aep.coutoRespostas && Object.keys(aep.coutoRespostas).length > 0)) {
        gerarPDFChecklistCouto(company, aep);
        onAlert("success", `Laudo do Checklist de Hudson Couto gerado para ${aep.funcaoNome}!`);
      } else {
        gerarPDFAEP(company, aep);
        onAlert("success", `Relatório da AEP gerado em PDF para ${aep.funcaoNome}!`);
      }
    } catch (err) {
      console.error(err);
      onAlert("error", "Erro ao gerar PDF da avaliação.");
    }
  };

  // Aplicar modelo pré-preenchido
  const handleApplyTemplate = (templateId: string) => {
    if (!currentAep) return;
    const template = AEP_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    setCurrentAep((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tipoPosto: template.dadosAep.tipoPosto,
        atividadesDescricao: prev.atividadesDescricao || template.dadosAep.atividadesDescricao,
        org_pausas: template.dadosAep.org_pausas,
        org_alternancia: template.dadosAep.org_alternancia,
        org_ritmo_metas: template.dadosAep.org_ritmo_metas,
        org_horas_extras: template.dadosAep.org_horas_extras,
        org_obs: template.dadosAep.org_obs,
        cargas_peso_frequencia: template.dadosAep.cargas_peso_frequencia,
        cargas_pega_distancia: template.dadosAep.cargas_pega_distancia,
        cargas_meios_mecanicos: template.dadosAep.cargas_meios_mecanicos,
        cargas_obs: template.dadosAep.cargas_obs,
        mob_cadeira_ajustavel: template.dadosAep.mob_cadeira_ajustavel,
        mob_mesa_espaco: template.dadosAep.mob_mesa_espaco,
        mob_apoio_pes: template.dadosAep.mob_apoio_pes,
        mob_monitor_visao: template.dadosAep.mob_monitor_visao,
        mob_obs: template.dadosAep.mob_obs,
        maq_empunhadura: template.dadosAep.maq_empunhadura,
        maq_esforco_acionamento: template.dadosAep.maq_esforco_acionamento,
        maq_vibracao: template.dadosAep.maq_vibracao,
        maq_obs: template.dadosAep.maq_obs,
        amb_ruido: template.dadosAep.amb_ruido,
        amb_temperatura: template.dadosAep.amb_temperatura,
        amb_iluminancia: template.dadosAep.amb_iluminancia,
        amb_obs: template.dadosAep.amb_obs,
        classificacaoRisco: template.dadosAep.classificacaoRisco,
        necessidadeAET: template.dadosAep.necessidadeAET,
        justificativaAET: template.dadosAep.justificativaAET,
        recomendacoes: [...template.dadosAep.recomendacoes],
        parecerTecnico: template.dadosAep.parecerTecnico,
      };
    });
    setSelectedTemplateId(templateId);
    onAlert("success", `Modelo "${template.nome}" aplicado com sucesso!`);
  };

  // Atualizador centralizado de conformidade com recálculo automático de diagnóstico
  const handleUpdateItemConformidade = (fieldKey: keyof AepItem, newVal: AepConformidade) => {
    if (!currentAep) return;

    setCurrentAep((prev) => {
      if (!prev) return prev;
      const updated: AepItem = { ...prev, [fieldKey]: newVal };

      // Calcular todas as não conformidades após essa alteração
      const ncItems = getNcItemsList(updated);
      const ncCount = ncItems.length;

      // Sugestão de recomendações automáticas
      let nextRecomendacoes = [...(updated.recomendacoes || [])];
      const meta = CHECKLIST_METADATA.find((m) => m.key === fieldKey);

      if (newVal === "NC" && meta) {
        if (!nextRecomendacoes.includes(meta.defaultRec)) {
          nextRecomendacoes.push(meta.defaultRec);
        }
      }

      // Recalcular classificação de risco e indicação de AET
      let nextRisco = updated.classificacaoRisco;
      let nextAet = updated.necessidadeAET;
      let nextJustAet = updated.justificativaAET;

      if (ncCount === 0) {
        nextRisco = "Baixo / Situação Conforme";
        nextAet = false;
        nextJustAet = "Condições ergonômicas atendem aos requisitos da NR-17. Não há demandas complexas aprofundadas.";
      } else if (ncCount <= 2) {
        nextRisco = "Médio / Atenção Ergonômica";
        nextAet = false;
        nextJustAet = "Demandas ergonômicas preliminares possuem soluções diretas descritas nas recomendações da AEP.";
      } else {
        nextRisco = "Alto / Situação Crítica";
        nextAet = true;
        nextJustAet = "Múltiplas não-conformidades identificadas no posto. Recomenda-se Análise Ergonômica do Trabalho (AET) aprofundada conforme NR-17.3.2.";
      }

      return {
        ...updated,
        recomendacoes: nextRecomendacoes,
        classificacaoRisco: nextRisco,
        necessidadeAET: nextAet,
        justificativaAET: nextJustAet,
      };
    });
  };

  // AI Photo Analysis com fallback resiliente
  const handleAnalyzePhotoWithAI = async (base64Image: string) => {
    if (!currentAep) return;
    setIsAnalyzingPhoto(true);
    try {
      const response = await fetch("/api/aep/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Image,
          funcaoNome: currentAep.funcaoNome,
          setorNome: currentAep.setorNome,
          tipoPosto: currentAep.tipoPosto,
        }),
      });

      const result = await response.json();
      if (result.success && result.data) {
        const aiData = result.data;
        setCurrentAep((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tipoPosto: aiData.tipoPosto || prev.tipoPosto,
            atividadesDescricao: aiData.atividadesDescricao || prev.atividadesDescricao,
            org_pausas: aiData.org_pausas || prev.org_pausas,
            org_alternancia: aiData.org_alternancia || prev.org_alternancia,
            org_ritmo_metas: aiData.org_ritmo_metas || prev.org_ritmo_metas,
            org_horas_extras: aiData.org_horas_extras || prev.org_horas_extras,
            org_obs: aiData.org_obs ? `${prev.org_obs ? prev.org_obs + " " : ""}[IA: ${aiData.org_obs}]` : prev.org_obs,
            cargas_peso_frequencia: aiData.cargas_peso_frequencia || prev.cargas_peso_frequencia,
            cargas_pega_distancia: aiData.cargas_pega_distancia || prev.cargas_pega_distancia,
            cargas_meios_mecanicos: aiData.cargas_meios_mecanicos || prev.cargas_meios_mecanicos,
            cargas_obs: aiData.cargas_obs ? `${prev.cargas_obs ? prev.cargas_obs + " " : ""}[IA: ${aiData.cargas_obs}]` : prev.cargas_obs,
            mob_cadeira_ajustavel: aiData.mob_cadeira_ajustavel || prev.mob_cadeira_ajustavel,
            mob_mesa_espaco: aiData.mob_mesa_espaco || prev.mob_mesa_espaco,
            mob_apoio_pes: aiData.mob_apoio_pes || prev.mob_apoio_pes,
            mob_monitor_visao: aiData.mob_monitor_visao || prev.mob_monitor_visao,
            mob_obs: aiData.mob_obs ? `${prev.mob_obs ? prev.mob_obs + " " : ""}[IA: ${aiData.mob_obs}]` : prev.mob_obs,
            maq_empunhadura: aiData.maq_empunhadura || prev.maq_empunhadura,
            maq_esforco_acionamento: aiData.maq_esforco_acionamento || prev.maq_esforco_acionamento,
            maq_vibracao: aiData.maq_vibracao || prev.maq_vibracao,
            maq_obs: aiData.maq_obs ? `${prev.maq_obs ? prev.maq_obs + " " : ""}[IA: ${aiData.maq_obs}]` : prev.maq_obs,
            amb_ruido: aiData.amb_ruido || prev.amb_ruido,
            amb_temperatura: aiData.amb_temperatura || prev.amb_temperatura,
            amb_iluminancia: aiData.amb_iluminancia || prev.amb_iluminancia,
            amb_obs: aiData.amb_obs ? `${prev.amb_obs ? prev.amb_obs + " " : ""}[IA: ${aiData.amb_obs}]` : prev.amb_obs,
            classificacaoRisco: aiData.classificacaoRisco || prev.classificacaoRisco,
            necessidadeAET: aiData.necessidadeAET !== undefined ? aiData.necessidadeAET : prev.necessidadeAET,
            justificativaAET: aiData.justificativaAET || prev.justificativaAET,
            recomendacoes: aiData.recomendacoes?.length ? Array.from(new Set([...prev.recomendacoes, ...aiData.recomendacoes])) : prev.recomendacoes,
            parecerTecnico: aiData.parecerTecnico || prev.parecerTecnico,
          };
        });
        onAlert("success", "Foto avaliada com sucesso pela IA! Checklist e recomendações preenchidos.");
      } else {
        throw new Error(result.error || "Não foi possível analisar a imagem.");
      }
    } catch (err: any) {
      onAlert("error", err?.message || "Erro ao conectar com assistente de IA.");
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  // AI Parecer Técnico e Plano de Ação
  const handleGenerateFindingsWithAI = async () => {
    if (!currentAep) return;
    setIsGeneratingFindings(true);
    try {
      const response = await fetch("/api/aep/generate-findings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aepData: currentAep,
          empresaNome: company.empresa.emp_razao || company.empresa.emp_fantasia || "",
        }),
      });

      const result = await response.json();
      if (result.success && result.data) {
        const aiData = result.data;
        setCurrentAep((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            parecerTecnico: aiData.parecerTecnico || prev.parecerTecnico,
            recomendacoes: aiData.recomendacoes?.length ? aiData.recomendacoes : prev.recomendacoes,
            necessidadeAET: aiData.necessidadeAET !== undefined ? aiData.necessidadeAET : prev.necessidadeAET,
            justificativaAET: aiData.justificativaAET || prev.justificativaAET,
            classificacaoRisco: aiData.classificacaoRisco || prev.classificacaoRisco,
          };
        });
        onAlert("success", "Parecer técnico e recomendações refinados com IA!");
      } else {
        throw new Error(result.error || "Falha ao gerar parecer técnico.");
      }
    } catch (err: any) {
      onAlert("error", err?.message || "Erro ao gerar parecer com IA.");
    } finally {
      setIsGeneratingFindings(false);
    }
  };

  const handleAddPhoto = (dataUrl: string, legenda?: string) => {
    if (!currentAep) return;
    const novaFoto: FotoEvidencia = {
      id: "foto_" + Date.now(),
      nome: `Evidência Ergonômica - ${currentAep.funcaoNome}`,
      dataUrl,
      data: new Date().toLocaleDateString("pt-BR"),
      legenda: legenda || "Postura e mobiliário do posto de trabalho vistoriado.",
    };

    setCurrentAep((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fotos: [...(prev.fotos || []), novaFoto],
      };
    });

    onAlert("info", "Foto anexada à AEP.");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isForAnalysis = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (isForAnalysis) {
        handleAddPhoto(base64, "Foto analisada por IA");
        handleAnalyzePhotoWithAI(base64);
      } else {
        handleAddPhoto(base64);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemovePhoto = (photoId?: string) => {
    if (!currentAep) return;
    setCurrentAep((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fotos: (prev.fotos || []).filter((f) => f.id !== photoId),
      };
    });
  };

  const handleAddRecomendacao = () => {
    if (!novaRecomendacao.trim() || !currentAep) return;
    setCurrentAep((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        recomendacoes: [...(prev.recomendacoes || []), novaRecomendacao.trim()],
      };
    });
    setNovaRecomendacao("");
  };

  const handleRemoveRecomendacao = (index: number) => {
    if (!currentAep) return;
    setCurrentAep((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        recomendacoes: (prev.recomendacoes || []).filter((_, i) => i !== index),
      };
    });
  };

  const handleSaveCurrentAep = () => {
    if (!currentAep) return;
    if (!currentAep.funcaoNome.trim()) {
      onAlert("error", "Informe a função ou cargo avaliado.");
      return;
    }

    let aepToSave = { ...currentAep };

    // Finalizar cálculos se for avaliação de Couto
    if (aepToSave.metodologia === "couto" || (aepToSave.coutoRespostas && Object.keys(aepToSave.coutoRespostas).length > 0)) {
      const diag = calculateCoutoDiagnosis(aepToSave.coutoRespostas || {});
      const sync = syncCoutoToNr17(aepToSave.coutoRespostas || {});
      aepToSave = {
        ...aepToSave,
        coutoTotalSim: diag.simCount,
        classificacaoRisco: diag.classificacaoRisco,
        necessidadeAET: diag.necessidadeAET,
        justificativaAET: aepToSave.justificativaAET || diag.justificativaAET,
        coutoClassificacaoMedida: aepToSave.coutoClassificacaoMedida || diag.classificacaoMedidaSugerida,
        recomendacoes: aepToSave.recomendacoes?.length ? aepToSave.recomendacoes : diag.recomendacoesAutomaticas,
        ...sync,
      };
    }

    onSaveAep(aepToSave);
    setIsEditing(false);
    onAlert("success", `AEP da função "${aepToSave.funcaoNome}" salva com sucesso!`);
  };

  // Render conformidade badge helper
  const renderConformidadeBadge = (val: AepConformidade, ncCount = 0) => {
    switch (val) {
      case "C":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-3 w-3" />
            Conforme (C)
          </span>
        );
      case "NC":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
            <AlertTriangle className="h-3 w-3" />
            {ncCount > 1 ? `${ncCount} Não Conformes` : "Não Conforme (NC)"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Não Aplicável (NA)
          </span>
        );
    }
  };

  // Render toggle button for field
  const renderToggleField = (
    label: string,
    fieldKey: keyof AepItem,
    currentVal: AepConformidade,
    description?: string
  ) => {
    return (
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl border transition-all ${
          currentVal === "NC"
            ? "bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-900/50"
            : currentVal === "C"
            ? "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60"
            : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/40"
        }`}
      >
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            {currentVal === "NC" && <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
            <p
              className={`text-xs font-semibold ${
                currentVal === "NC" ? "text-red-900 dark:text-red-300 font-bold" : "text-slate-800 dark:text-slate-200"
              }`}
            >
              {label}
            </p>
          </div>
          {description && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center gap-1 self-end sm:self-center">
          <button
            type="button"
            onClick={() => handleUpdateItemConformidade(fieldKey, "C")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              currentVal === "C"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-600"
            }`}
          >
            C (Conforme)
          </button>
          <button
            type="button"
            onClick={() => handleUpdateItemConformidade(fieldKey, "NC")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              currentVal === "NC"
                ? "bg-red-600 text-white shadow-xs ring-2 ring-red-400 dark:ring-red-600"
                : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-200 dark:border-slate-600"
            }`}
          >
            NC (Não Conforme)
          </button>
          <button
            type="button"
            onClick={() => handleUpdateItemConformidade(fieldKey, "NA")}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
              currentVal === "NA"
                ? "bg-slate-700 dark:bg-slate-600 text-white"
                : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
            }`}
          >
            NA
          </button>
        </div>
      </div>
    );
  };

  // Contadores globais no modo de edição
  const currentNcItems = currentAep ? getNcItemsList(currentAep) : [];
  const currentNcCount = currentNcItems.length;

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner & Header */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 p-4 sm:p-5 text-white shadow-xs border border-indigo-800/40 transition-colors">
        <div className="flex flex-col gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-300 backdrop-blur-xs border border-white/10">
                <Activity className="h-3.5 w-3.5 text-indigo-400" />
                <span>NR-17 • Item 17.3 (Ergonomia)</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                GRO / PGR
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Avaliação Ergonômica Preliminar (AEP)
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed">
              Triagem preliminar de perigos ergonômicos por posto e função (5 domínios da NR-17). Com modelos pré-preenchidos, análise de fotos com IA e relatório técnico em PDF.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => handleStartNewAep(undefined, "couto")}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
            >
              <Activity className="h-4 w-4 shrink-0" />
              <span>Nova AEP (Checklist Couto)</span>
            </button>

            <button
              type="button"
              onClick={() => handleStartNewAep(undefined, "dominios_nr17")}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-950/20 transition-all cursor-pointer"
            >
              <Layers className="h-4 w-4 shrink-0" />
              <span>Nova AEP (NR-17 Domínios)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (aepAvaliacoes.length === 0) {
                  onAlert("info", "Nenhuma AEP cadastrada para emitir o relatório. Inicie uma nova AEP.");
                  return;
                }
                try {
                  gerarPDFAEP(company);
                  onAlert("success", "Relatório de AEP (NR-17) em PDF gerado com sucesso!");
                } catch (err: any) {
                  onAlert("error", "Erro ao gerar PDF da AEP.");
                }
              }}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xs border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
            >
              <FileText className="h-4 w-4 text-indigo-300 shrink-0" />
              <span>Emitir Relatório Geral (PDF)</span>
            </button>
          </div>
        </div>

        {/* Quick info badges */}
        <div className="mt-3.5 pt-3 border-t border-indigo-800/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-white/5 rounded-xl p-2">
            <span className="text-[10px] text-indigo-300 font-semibold block">AEPs Elaboradas</span>
            <span className="text-sm font-bold text-white">{aepAvaliacoes.length}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2">
            <span className="text-[10px] text-indigo-300 font-semibold block">Conformes</span>
            <span className="text-sm font-bold text-emerald-400">
              {aepAvaliacoes.filter((a) => a.classificacaoRisco.includes("Baixo")).length}
            </span>
          </div>
          <div className="bg-white/5 rounded-xl p-2">
            <span className="text-[10px] text-indigo-300 font-semibold block">Atenção / Médio</span>
            <span className="text-sm font-bold text-amber-400">
              {aepAvaliacoes.filter((a) => a.classificacaoRisco.includes("Médio")).length}
            </span>
          </div>
          <div className="bg-white/5 rounded-xl p-2">
            <span className="text-[10px] text-indigo-300 font-semibold block">AET Recomendada</span>
            <span className="text-sm font-bold text-rose-400">
              {aepAvaliacoes.filter((a) => a.necessidadeAET).length}
            </span>
          </div>
        </div>
      </div>

      {/* Main List of AEP Evaluations */}
      {!isEditing && (
        <div className="space-y-3">
          {aepAvaliacoes.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Activity className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Nenhuma Avaliação Ergonômica Preliminar cadastrada
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  A NR-17 exige a realização de AEP para todos os postos de trabalho da empresa para integrar o Inventário de Riscos do PGR.
                </p>
              </div>

              {/* Quick Start Buttons from existing functions */}
              {funcoes.length > 0 && (
                <div className="pt-3 max-w-md mx-auto">
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-2">
                    Iniciar AEP rápida para uma das funções da empresa:
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {funcoes.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => handleStartNewAep(f)}
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        {f.func_nome}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto w-full">
                <button
                  type="button"
                  onClick={() => handleStartNewAep(undefined, "couto")}
                  className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
                >
                  <Activity className="h-4 w-4 shrink-0" />
                  <span>Nova AEP (Checklist Couto)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStartNewAep(undefined, "dominios_nr17")}
                  className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-950/20 transition-all cursor-pointer"
                >
                  <Layers className="h-4 w-4 shrink-0" />
                  <span>Nova AEP (NR-17 Domínios)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aepAvaliacoes.map((aep) => {
                const isConforme = aep.classificacaoRisco.includes("Baixo");
                const isMedio = aep.classificacaoRisco.includes("Médio");
                const fotoCount = aep.fotos?.length || 0;
                const ncItems = getNcItemsList(aep);
                const ncCount = ncItems.length;
                const isCouto = aep.metodologia === "couto" || (aep.coutoRespostas && Object.keys(aep.coutoRespostas).length > 0);

                // Status consolidado dos 5 domínios
                const orgStatus = getDomainConsolidatedStatus(aep, "org");
                const cargasStatus = getDomainConsolidatedStatus(aep, "cargas");
                const mobStatus = getDomainConsolidatedStatus(aep, "mob");
                const maqStatus = getDomainConsolidatedStatus(aep, "maq");
                const ambStatus = getDomainConsolidatedStatus(aep, "amb");

                return (
                  <div
                    key={aep.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {aep.funcaoNome}
                            </h3>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              • {aep.setorNome || "Setor Geral"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {isCouto ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                <Activity className="h-3 w-3" />
                                Checklist Couto ({aep.coutoTotalSim || 0} SIM)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                <Layers className="h-3 w-3" />
                                NR-17 (5 Domínios)
                              </span>
                            )}
                            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                              {aep.tipoPosto}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            isConforme
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : isMedio
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                          }`}
                        >
                          {aep.classificacaoRisco}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {aep.atividadesDescricao}
                      </p>

                      {/* Mini summary of 5 domains consolidado */}
                      <div className="grid grid-cols-5 gap-1 pt-1 text-center text-[10px]">
                        <div
                          className={`p-1.5 rounded-lg border ${
                            orgStatus.status === "NC"
                              ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900"
                              : "bg-slate-50 dark:bg-slate-800/80 border-slate-100 dark:border-slate-800"
                          }`}
                        >
                          <span className="block text-[9px] text-slate-400 font-bold">Org</span>
                          <span className={orgStatus.status === "C" ? "text-emerald-600 font-bold" : orgStatus.status === "NC" ? "text-red-600 font-bold" : "text-slate-400"}>
                            {orgStatus.status}
                          </span>
                        </div>
                        <div
                          className={`p-1.5 rounded-lg border ${
                            cargasStatus.status === "NC"
                              ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900"
                              : "bg-slate-50 dark:bg-slate-800/80 border-slate-100 dark:border-slate-800"
                          }`}
                        >
                          <span className="block text-[9px] text-slate-400 font-bold">Carga</span>
                          <span className={cargasStatus.status === "C" ? "text-emerald-600 font-bold" : cargasStatus.status === "NC" ? "text-red-600 font-bold" : "text-slate-400"}>
                            {cargasStatus.status}
                          </span>
                        </div>
                        <div
                          className={`p-1.5 rounded-lg border ${
                            mobStatus.status === "NC"
                              ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900"
                              : "bg-slate-50 dark:bg-slate-800/80 border-slate-100 dark:border-slate-800"
                          }`}
                        >
                          <span className="block text-[9px] text-slate-400 font-bold">Móvel</span>
                          <span className={mobStatus.status === "C" ? "text-emerald-600 font-bold" : mobStatus.status === "NC" ? "text-red-600 font-bold" : "text-slate-400"}>
                            {mobStatus.status}
                          </span>
                        </div>
                        <div
                          className={`p-1.5 rounded-lg border ${
                            maqStatus.status === "NC"
                              ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900"
                              : "bg-slate-50 dark:bg-slate-800/80 border-slate-100 dark:border-slate-800"
                          }`}
                        >
                          <span className="block text-[9px] text-slate-400 font-bold">Máq</span>
                          <span className={maqStatus.status === "C" ? "text-emerald-600 font-bold" : maqStatus.status === "NC" ? "text-red-600 font-bold" : "text-slate-400"}>
                            {maqStatus.status}
                          </span>
                        </div>
                        <div
                          className={`p-1.5 rounded-lg border ${
                            ambStatus.status === "NC"
                              ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900"
                              : "bg-slate-50 dark:bg-slate-800/80 border-slate-100 dark:border-slate-800"
                          }`}
                        >
                          <span className="block text-[9px] text-slate-400 font-bold">Amb</span>
                          <span className={ambStatus.status === "C" ? "text-emerald-600 font-bold" : ambStatus.status === "NC" ? "text-red-600 font-bold" : "text-slate-400"}>
                            {ambStatus.status}
                          </span>
                        </div>
                      </div>

                      {/* Photo preview count & AET indicator */}
                      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Camera className="h-3.5 w-3.5" />
                            {fotoCount > 0 ? `${fotoCount} foto(s)` : "Sem fotos"}
                          </span>
                          {ncCount > 0 && (
                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.5 rounded-md border border-red-200 dark:border-red-900">
                              {ncCount} Não Conformidade(s)
                            </span>
                          )}
                        </div>

                        {aep.necessidadeAET ? (
                          <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            AET Indicada
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            AEP Suficiente
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons - Mobile Full-Width Standardized */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleExportSinglePdf(aep)}
                        className="h-10 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <span>Emitir PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditAep(aep)}
                        className="h-10 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5 shrink-0" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Excluir a AEP da função "${aep.funcaoNome}"?`)) {
                            onDeleteAep(aep.id);
                            onAlert("info", "AEP excluída com sucesso.");
                          }
                        }}
                        className="h-10 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* AEP Interactive Editor (When isEditing is true) */}
      {isEditing && currentAep && (
        <div className="space-y-4">
          {/* Seletor de Metodologia de Avaliação */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Metodologia da Avaliação:
              </span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                {currentAep.metodologia === "couto" ? "Checklist de Hudson Couto" : "5 Domínios Normativos da NR-17"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              <button
                type="button"
                onClick={() => setCurrentAep((prev) => (prev ? { ...prev, metodologia: "couto" } : prev))}
                className={`h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  currentAep.metodologia === "couto"
                    ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300 dark:ring-emerald-700"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
                }`}
              >
                <Activity className="h-4 w-4 shrink-0" />
                <span>Checklist de Hudson Couto (18 Itens)</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentAep((prev) => (prev ? { ...prev, metodologia: "dominios_nr17" } : prev))}
                className={`h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  currentAep.metodologia !== "couto"
                    ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300 dark:ring-indigo-700"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
                }`}
              >
                <Layers className="h-4 w-4 shrink-0" />
                <span>5 Domínios Normativos da NR-17</span>
              </button>
            </div>
          </div>

          {currentAep.metodologia === "couto" ? (
            <CoutoChecklistView
              currentAep={currentAep}
              company={company}
              funcoes={funcoes}
              setores={setores}
              onChangeAep={setCurrentAep}
              onUpdateOption={handleUpdateCoutoOption}
              onAddPhoto={handleAddPhoto}
              onRemovePhoto={handleRemovePhoto}
              onOpenPhotoInput={() => fileInputRef.current?.click()}
              onOpenCam={() => setShowCameraModal(true)}
              onExportPdf={() => handleExportSinglePdf(currentAep)}
              onSave={handleSaveCurrentAep}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-4 sm:p-5 space-y-5">
              {/* Header of Editor */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                      NR-17 • 5 DOMÍNIOS
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {currentAep.id ? `AEP: ${currentAep.funcaoNome}` : "Nova Avaliação Ergonômica"}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Preencha os 5 domínios ou use fotos, modelos e o assistente de IA.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleExportSinglePdf(currentAep)}
                    className="h-10 w-full inline-flex items-center justify-center gap-1.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span>Gerar PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="h-10 w-full inline-flex items-center justify-center gap-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <span>Cancelar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCurrentAep}
                    className="h-10 w-full inline-flex items-center justify-center gap-1.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <span>Salvar AEP</span>
                  </button>
                </div>
              </div>

          {/* Quick-Fill Fast Action Bar */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
              <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Agilidade no Campo (Pré-Preenchimento &amp; IA):
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* 1. Quick Template Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  1. Modelo Padrão por Função (1-Clique)
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleApplyTemplate(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2 text-slate-800 dark:text-slate-200"
                >
                  <option value="">Selecione um modelo...</option>
                  {AEP_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Photo Analysis with IA */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  2. Analisar Foto com IA (Postura &amp; Posto)
                </label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    disabled={isAnalyzingPhoto}
                    onClick={() => photoScanInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-xs"
                  >
                    {isAnalyzingPhoto ? (
                      <span className="flex items-center gap-1 animate-pulse">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
                        Analisando...
                      </span>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        Subir Foto
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCameraModal(true)}
                    className="px-2.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs"
                    title="Tirar Foto com Câmera"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input
                    type="file"
                    ref={photoScanInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, true)}
                  />
                </div>
              </div>

              {/* 3. Refine findings with IA */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  3. Refinar Parecer e Ações (IA)
                </label>
                <button
                  type="button"
                  disabled={isGeneratingFindings}
                  onClick={handleGenerateFindingsWithAI}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-200" />
                  {isGeneratingFindings ? "Gerando Parecer..." : "Gerar Parecer Técnico com IA"}
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Identification */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              1. Identificação da Função e Posto de Trabalho
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Função */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Função / Cargo Avaliado *
                </label>
                <input
                  type="text"
                  value={currentAep.funcaoNome}
                  onChange={(e) => setCurrentAep((prev) => (prev ? { ...prev, funcaoNome: e.target.value } : prev))}
                  placeholder="Ex: Auxiliar Administrativo"
                  className="w-full text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Setor */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Setor / Ambiente
                </label>
                <input
                  type="text"
                  value={currentAep.setorNome || ""}
                  onChange={(e) => setCurrentAep((prev) => (prev ? { ...prev, setorNome: e.target.value } : prev))}
                  placeholder="Ex: Escritório Geral"
                  className="w-full text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Tipo de Posto */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Posto / Atividade
                </label>
                <input
                  type="text"
                  value={currentAep.tipoPosto}
                  onChange={(e) => setCurrentAep((prev) => (prev ? { ...prev, tipoPosto: e.target.value } : prev))}
                  placeholder="Ex: Administrativo / Escritório"
                  className="w-full text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Descrição Real das Atividades e Posturas Observadas
              </label>
              <textarea
                rows={2}
                value={currentAep.atividadesDescricao}
                onChange={(e) => setCurrentAep((prev) => (prev ? { ...prev, atividadesDescricao: e.target.value } : prev))}
                placeholder="Descreva as tarefas diárias, movimentos, equipamentos e postura adotada no posto de trabalho..."
                className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Section 2: Evidências Fotográficas */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                2. Evidências Fotográficas do Posto ({currentAep.fotos?.length || 0})
              </h4>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Anexar Foto
                </button>
                <button
                  type="button"
                  onClick={() => setShowCameraModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Câmera
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e, false)}
                />
              </div>
            </div>

            {currentAep.fotos && currentAep.fotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {currentAep.fotos.map((foto, idx) => (
                  <div
                    key={foto.id || idx}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex flex-col justify-between"
                  >
                    <img
                      src={foto.dataUrl}
                      alt={foto.nome || "Evidência Ergonômica"}
                      className="w-full h-24 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="p-1.5 bg-white/95 dark:bg-slate-900/95 text-[10px]">
                      <input
                        type="text"
                        value={foto.legenda || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCurrentAep((prev) => {
                            if (!prev || !prev.fotos) return prev;
                            const nextFotos = [...prev.fotos];
                            nextFotos[idx] = { ...nextFotos[idx], legenda: val };
                            return { ...prev, fotos: nextFotos };
                          });
                        }}
                        placeholder="Legenda da foto..."
                        className="w-full text-[10px] bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:outline-hidden"
                      />
                    </div>
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleAnalyzePhotoWithAI(foto.dataUrl)}
                        title="Analisar esta foto com IA"
                        className="p-1 rounded-full bg-indigo-600/90 hover:bg-indigo-600 text-white shadow-xs"
                      >
                        <Sparkles className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(foto.id)}
                        className="p-1 rounded-full bg-red-600/90 hover:bg-red-600 text-white shadow-xs"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500">
                Nenhuma foto anexada. Fotos fortalecem a fundamentação técnica e jurídica do laudo da AEP.
              </div>
            )}
          </div>

          {/* Section 3: The 5 NR-17 Domains Checklist */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                3. Checklist Ergonômico Funcional (5 Domínios da NR-17)
              </h4>

              {/* Real-time NC counter badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                    currentNcCount === 0
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : currentNcCount <= 2
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 animate-pulse"
                  }`}
                >
                  {currentNcCount === 0 ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      100% Conforme (0 NCs)
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {currentNcCount} {currentNcCount === 1 ? "Não Conformidade Detectada" : "Não Conformidades Detectadas"}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Quick Banner Alert when NC exists */}
            {currentNcCount > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Itens Não Conformes:</strong>{" "}
                    {currentNcItems.map((n) => n.label.split("(")[0]).join(", ")}.
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  Recomendações e risco sincronizados automaticamente abaixo.
                </span>
              </div>
            )}

            {/* Accordion / Tabs for the 5 domains */}
            <div className="space-y-2">
              {/* Domínio 1: Organização do Trabalho */}
              {(() => {
                const domainStatus = getDomainConsolidatedStatus(currentAep, "org");
                return (
                  <div
                    className={`rounded-xl border overflow-hidden transition-all ${
                      domainStatus.status === "NC"
                        ? "border-red-200 dark:border-red-900/80"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedSection(expandedSection === "org" ? "" : "org")}
                      className={`w-full flex items-center justify-between p-3 text-xs font-bold transition-colors ${
                        domainStatus.status === "NC"
                          ? "bg-red-50/60 dark:bg-red-950/30 text-red-900 dark:text-red-200 hover:bg-red-50 dark:hover:bg-red-950/50"
                          : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-indigo-500" />
                        3.1. Organização do Trabalho (Item 17.4)
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">{renderConformidadeBadge(domainStatus.status, domainStatus.ncCount)}</div>
                        {expandedSection === "org" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>
                    {expandedSection === "org" && (
                      <div className="p-3 space-y-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        {renderToggleField("Pausas estruturadas / descanso durante a jornada", "org_pausas", currentAep.org_pausas, "Possibilidade de pausas para alívio postural")}
                        {renderToggleField("Alternância postural (sentado / em pé / caminhada)", "org_alternancia", currentAep.org_alternancia, "Trabalho não obriga a permanência rígida na mesma posição")}
                        {renderToggleField("Ritmo de trabalho e exigência temporal compatíveis", "org_ritmo_metas", currentAep.org_ritmo_metas, "Ausência de sobrepressão de metas ou esteira excessivamente acelerada")}
                        {renderToggleField("Horas extras e sobrecarga de jornada controladas", "org_horas_extras", currentAep.org_horas_extras, "Jornada compatível com a capacidade psicofisiológica")}
                        <div className="pt-1">
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Observações sobre a Organização do Trabalho:
                          </label>
                          <input
                            type="text"
                            value={currentAep.org_obs || ""}
                            onChange={(e) => setCurrentAep((prev) => (prev ? { ...prev, org_obs: e.target.value } : prev))}
                            placeholder="Ex: Adotado sistema de pausas de 5 min a cada 50 min de digitação..."
                            className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-slate-800 dark:text-slate-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Domínio 2: Cargas */}
              {(() => {
                const domainStatus = getDomainConsolidatedStatus(currentAep, "cargas");
                return (
                  <div
                    className={`rounded-xl border overflow-hidden transition-all ${
                      domainStatus.status === "NC"
                        ? "border-red-200 dark:border-red-900/80"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedSection(expandedSection === "cargas" ? "" : "cargas")}
                      className={`w-full flex items-center justify-between p-3 text-xs font-bold transition-colors ${
                        domainStatus.status === "NC"
                          ? "bg-red-50/60 dark:bg-red-950/30 text-red-900 dark:text-red-200 hover:bg-red-50 dark:hover:bg-red-950/50"
                          : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-amber-500" />
                        3.2. Levantamento e Transporte Manual de Cargas (Item 17.5)
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">{renderConformidadeBadge(domainStatus.status, domainStatus.ncCount)}</div>
                        {expandedSection === "cargas" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>
                    {expandedSection === "cargas" && (
                      <div className="p-3 space-y-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        {renderToggleField("Peso unitário e frequência de levantamento adequados", "cargas_peso_frequencia", currentAep.cargas_peso_frequencia, "Cargas dentro dos limites seguros (< 15-20 kg para homens e < 10-15 kg para mulheres)")}
                        {renderToggleField("Pega firme e distância da carga próxima ao tronco", "cargas_pega_distancia", currentAep.cargas_pega_distancia, "Ausência de flexão/torção excessiva da coluna ou levantamento acima dos ombros")}
                        {renderToggleField("Disponibilização de meios mecânicos de transporte", "cargas_meios_mecanicos", currentAep.cargas_meios_mecanicos, "Carrinhos hidráulicos, paleteiras, talhas ou pontes rolantes para cargas pesadas")}
                        <div className="pt-1">
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Observações sobre Movimentação de Cargas:
                          </label>
                          <input
                            type="text"
                            value={currentAep.cargas_obs || ""}
                            onChange={(e) => setCurrentAep((prev) => (prev ? { ...prev, cargas_obs: e.target.value } : prev))}
                            placeholder="Ex: Cargas pesadas movimentadas exclusivamente com paleteira..."
                            className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-slate-800 dark:text-slate-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Domínio 3: Mobiliário */}
              {(() => {
                const domainStatus = getDomainConsolidatedStatus(currentAep, "mob");
                return (
                  <div
                    className={`rounded-xl border overflow-hidden transition-all ${
                      domainStatus.status === "NC"
                        ? "border-red-200 dark:border-red-900/80"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedSection(expandedSection === "mob" ? "" : "mob")}
                      className={`w-full flex items-center justify-between p-3 text-xs font-bold transition-colors ${
                        domainStatus.status === "NC"
                          ? "bg-red-50/60 dark:bg-red-950/30 text-red-900 dark:text-red-200 hover:bg-red-50 dark:hover:bg-red-950/50"
                          : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        3.3. Mobiliário dos Postos de Trabalho (Item 17.6)
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">{renderConformidadeBadge(domainStatus.status, domainStatus.ncCount)}</div>
                        {expandedSection === "mob" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>
                    {expandedSection === "mob" && (
                      <div className="p-3 space-y-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        {renderToggleField("Cadeira regulável (altura a gás, encosto lombar e braços)", "mob_cadeira_ajustavel", currentAep.mob_cadeira_ajustavel, "Assento com borda frontal arredondada e estofamento de densidade adequada (NBR 13962)")}
                        {renderToggleField("Mesa / Bancada com altura e espaço livre para pernas", "mob_mesa_espaco", currentAep.mob_mesa_espaco, "Permite movimentação das pernas sem obstáculos sob a bancada")}
                        {renderToggleField("Apoio para os pés disponível quando necessário", "mob_apoio_pes", currentAep.mob_apoio_pes, "Para colaboradores cujos pés não alcancem totalmente o piso")}
                        {renderToggleField("Suporte de monitor alinhado à altura dos olhos", "mob_monitor_visao", currentAep.mob_monitor_visao, "Topo da tela alinhado à linha do olhar horizontal para evitar flexão cervical")}
                        <div className="pt-1">
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Observações sobre Mobiliário:
                          </label>
                          <input
                            type="text"
                            value={currentAep.mob_obs || ""}
                            onChange={(e) => setCurrentAep((prev) => (prev ? { ...prev, mob_obs: e.target.value } : prev))}
                            placeholder="Ex: Cadeira certificada NBR 13962 com suporte articulado para monitor..."
                            className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-slate-800 dark:text-slate-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Domínio 4: Máquinas e Ferramentas */}
              {(() => {
                const domainStatus = getDomainConsolidatedStatus(currentAep, "maq");
                return (
                  <div
                    className={`rounded-xl border overflow-hidden transition-all ${
                      domainStatus.status === "NC"
                        ? "border-red-200 dark:border-red-900/80"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedSection(expandedSection === "maq" ? "" : "maq")}
                      className={`w-full flex items-center justify-between p-3 text-xs font-bold transition-colors ${
                        domainStatus.status === "NC"
                          ? "bg-red-50/60 dark:bg-red-950/30 text-red-900 dark:text-red-200 hover:bg-red-50 dark:hover:bg-red-950/50"
                          : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-purple-500" />
                        3.4. Máquinas, Equipamentos e Ferramentas (Item 17.7)
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">{renderConformidadeBadge(domainStatus.status, domainStatus.ncCount)}</div>
                        {expandedSection === "maq" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>
                    {expandedSection === "maq" && (
                      <div className="p-3 space-y-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        {renderToggleField("Ferramentas com empunhadura anatômica e peso balanceado", "maq_empunhadura", currentAep.maq_empunhadura, "Sem pontos de compressão nos tecidos moles da palma da mão")}
                        {renderToggleField("Comandos e botões de fácil alcance e acionamento leve", "maq_esforco_acionamento", currentAep.maq_esforco_acionamento, "Pedais e alavancas em zona de alcance confortável")}
                        {renderToggleField("Vibração e impacto mecânico controlados", "maq_vibracao", currentAep.maq_vibracao, "Ferramentas com amortecedores ou suspensão por balancins")}
                        <div className="pt-1">
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Observações sobre Ferramentas e Equipamentos:
                          </label>
                          <input
                            type="text"
                            value={currentAep.maq_obs || ""}
                            onChange={(e) => setCurrentAep((prev) => (prev ? { ...prev, maq_obs: e.target.value } : prev))}
                            placeholder="Ex: Parafusadeiras com balancim de alívio de peso..."
                            className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-slate-800 dark:text-slate-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Domínio 5: Conforto Ambiental */}
              {(() => {
                const domainStatus = getDomainConsolidatedStatus(currentAep, "amb");
                return (
                  <div
                    className={`rounded-xl border overflow-hidden transition-all ${
                      domainStatus.status === "NC"
                        ? "border-red-200 dark:border-red-900/80"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedSection(expandedSection === "amb" ? "" : "amb")}
                      className={`w-full flex items-center justify-between p-3 text-xs font-bold transition-colors ${
                        domainStatus.status === "NC"
                          ? "bg-red-50/60 dark:bg-red-950/30 text-red-900 dark:text-red-200 hover:bg-red-50 dark:hover:bg-red-950/50"
                          : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-emerald-500" />
                        3.5. Condições de Conforto Ambiental no Posto (Item 17.8)
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">{renderConformidadeBadge(domainStatus.status, domainStatus.ncCount)}</div>
                        {expandedSection === "amb" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>
                    {expandedSection === "amb" && (
                      <div className="p-3 space-y-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        {renderToggleField("Nível de ruído compatível com conforto acústico (NR-17.8.2)", "amb_ruido", currentAep.amb_ruido, "Permite concentração e comunicação sem elevação forçada da voz")}
                        {renderToggleField("Temperatura e circulação do ar adequadas (20°C a 25°C)", "amb_temperatura", currentAep.amb_temperatura, "Conforto térmico conforme NBR ISO 7730 / NR-17.8.4")}
                        {renderToggleField("Iluminância uniforme no campo de trabalho sem ofuscamento", "amb_iluminancia", currentAep.amb_iluminancia, "Conforme NHO 11 da Fundacentro")}
                        <div className="pt-1">
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Observações sobre o Conforto Ambiental:
                          </label>
                          <input
                            type="text"
                            value={currentAep.amb_obs || ""}
                            onChange={(e) => setCurrentAep((prev) => (prev ? { ...prev, amb_obs: e.target.value } : prev))}
                            placeholder="Ex: Ar condicionado mantido a 22°C e iluminação difusa de 450 lux..."
                            className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-slate-800 dark:text-slate-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Section 4: Conclusão, Triagem de AET e Recomendações */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              4. Diagnóstico, Triagem de AET e Recomendações Técnicas
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Classificação do Risco */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Classificação do Risco Ergonômico (GRO / PGR)
                </label>
                <select
                  value={currentAep.classificacaoRisco}
                  onChange={(e) => setCurrentAep((prev) => (prev ? { ...prev, classificacaoRisco: e.target.value as any } : prev))}
                  className="w-full text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 text-slate-800 dark:text-slate-200"
                >
                  <option value="Baixo / Situação Conforme">Baixo / Situação Conforme</option>
                  <option value="Médio / Atenção Ergonômica">Médio / Atenção Ergonômica</option>
                  <option value="Alto / Situação Crítica">Alto / Situação Crítica</option>
                </select>
              </div>

              {/* Indicativo de AET */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Necessidade de AET Aprofundada (Item 17.3.2)
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="chkAET"
                    checked={currentAep.necessidadeAET}
                    onChange={(e) => setCurrentAep((prev) => (prev ? { ...prev, necessidadeAET: e.target.checked } : prev))}
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="chkAET" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    {currentAep.necessidadeAET ? "SIM — Requer Análise Ergonômica do Trabalho (AET)" : "NÃO — AEP suficiente para o PGR"}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Justificativa da Decisão sobre AET (NR-17.3.2)
              </label>
              <input
                type="text"
                value={currentAep.justificativaAET || ""}
                onChange={(e) => setCurrentAep((prev) => (prev ? { ...prev, justificativaAET: e.target.value } : prev))}
                placeholder="Ex: Demandas ergonômicas possuem soluções diretas que constam no Plano de Ação."
                className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Recomendações e Plano de Ação */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Recomendações e Medidas de Adequação Ergonômica (Plano de Ação)
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={novaRecomendacao}
                  onChange={(e) => setNovaRecomendacao(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddRecomendacao()}
                  placeholder="Digite uma recomendação ergonômica (ex: Ajustar monitor na altura dos olhos)..."
                  className="flex-1 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 text-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={handleAddRecomendacao}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0"
                >
                  Adicionar
                </button>
              </div>

              {currentAep.recomendacoes && currentAep.recomendacoes.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {currentAep.recomendacoes.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <span className="flex items-start gap-1.5 flex-1">
                        <Check className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />
                        {rec}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecomendacao(i)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-md"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Parecer Técnico Conclusivo */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Parecer Técnico Conclusivo do Avaliador (AEP - NR-17)
              </label>
              <textarea
                rows={3}
                value={currentAep.parecerTecnico}
                onChange={(e) => setCurrentAep((prev) => (prev ? { ...prev, parecerTecnico: e.target.value } : prev))}
                placeholder="Parecer técnico ergonômico fundamentado nas disposições da NR-17..."
                className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Footer Save & Export - Standardized Mobile Full-Width */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 w-full">
            <button
              type="button"
              onClick={() => handleExportSinglePdf(currentAep)}
              className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-bold border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>Emitir PDF Desta AEP</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <span>Cancelar</span>
            </button>

            <button
              type="button"
              onClick={handleSaveCurrentAep}
              className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-950/20 transition-all cursor-pointer"
            >
              <Check className="h-4 w-4 shrink-0" />
              <span>Salvar Avaliação Ergonômica</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )}

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <CameraCaptureModal
          isOpen={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          onCapture={(dataUrl) => {
            setShowCameraModal(false);
            handleAddPhoto(dataUrl, "Foto capturada em campo");
            handleAnalyzePhotoWithAI(dataUrl);
          }}
          onAlert={onAlert}
        />
      )}
    </div>
  );
};
