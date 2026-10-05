import { MatrixDimension, RiskMatrixModelDefinition, NormativeOption } from "../types";

export const RISK_MATRIX_MODELS: Record<MatrixDimension, RiskMatrixModelDefinition> = {
  "3x3": {
    dimension: "3x3",
    titulo: "Matriz 3×3 (Qualitativa Simplificada)",
    subtitulo: "Ideal para MEI, Microempresas (ME), EPP, Graus de Risco 1 e 2 e Triagem Preliminar em Campo",
    descricaoNormativa:
      "Fundamentada na norma britânica BS 8800, no guia HSE INDG163 (5 Steps to Risk Assessment) e no subitem 1.5.4.4.2 da NR-01 (Portaria MTP 6.730/2020) para avaliações qualitativas proporcionais à complexidade da organização.",
    referenciasPrincipais: [
      {
        codigo: "NR-01 (ME/EPP)",
        nome: "NR-01 item 1.5.4.4.2 - Avaliação Qualitativa Simplificada",
        tipo: "Nacional (MTP)",
        corBadge: "bg-emerald-700 text-white",
      },
      {
        codigo: "BS 8800",
        nome: "British Standard BS 8800:1996 - Guide to OHS Management Systems",
        tipo: "Internacional",
        corBadge: "bg-blue-700 text-white",
      },
      {
        codigo: "HSE INDG163",
        nome: "Health & Safety Executive - 5 Steps to Risk Assessment",
        tipo: "Internacional (UK)",
        corBadge: "bg-indigo-700 text-white",
      },
      {
        codigo: "FUNDACENTRO",
        nome: "Guia Prático de Gestão de Riscos Ocupacionais (GRO)",
        tipo: "Nacional",
        corBadge: "bg-amber-700 text-white",
      },
    ],
    probabilidades: [
      { valor: 1, rotulo: "Baixa", descricao: "Pouco provável / Exposição esporádica ou com controles eficazes" },
      { valor: 2, rotulo: "Média", descricao: "Provável / Exposição intermitente ou controles parciais" },
      { valor: 3, rotulo: "Alta", descricao: "Altamente provável / Exposição habitual contínua ou sem controles" },
    ],
    severidades: [
      { valor: 1, rotulo: "Leve", descricao: "Sem lesão ou lesões superficiais sem afastamento (primeiros socorros)" },
      { valor: 2, rotulo: "Moderada", descricao: "Lesões reversíveis com afastamento temporário do trabalho" },
      { valor: 3, rotulo: "Grave", descricao: "Lesões graves, incapacidade permanente ou óbito" },
    ],
    // Matriz [Probabilidade][Severidade] -> Nível de Risco
    grid: [
      // P = 1 (Baixa)
      [
        { nivel: 1, rotulo: "Baixo", corHex: "#16a34a", corClasse: "bg-emerald-600 text-white", prioridade: "Baixa", prazo: "Monitorar" },
        { nivel: 1, rotulo: "Baixo", corHex: "#16a34a", corClasse: "bg-emerald-600 text-white", prioridade: "Baixa", prazo: "90 a 180 dias" },
        { nivel: 2, rotulo: "Médio", corHex: "#ca8a04", corClasse: "bg-amber-600 text-white", prioridade: "Média", prazo: "60 dias" },
      ],
      // P = 2 (Média)
      [
        { nivel: 1, rotulo: "Baixo", corHex: "#16a34a", corClasse: "bg-emerald-600 text-white", prioridade: "Baixa", prazo: "120 dias" },
        { nivel: 2, rotulo: "Médio", corHex: "#ca8a04", corClasse: "bg-amber-600 text-white", prioridade: "Média", prazo: "60 dias" },
        { nivel: 3, rotulo: "Alto", corHex: "#dc2626", corClasse: "bg-red-600 text-white", prioridade: "Crítica / Imediata", prazo: "Imediato (15-30 dias)" },
      ],
      // P = 3 (Alta)
      [
        { nivel: 2, rotulo: "Médio", corHex: "#ca8a04", corClasse: "bg-amber-600 text-white", prioridade: "Média", prazo: "60 dias" },
        { nivel: 3, rotulo: "Alto", corHex: "#dc2626", corClasse: "bg-red-600 text-white", prioridade: "Crítica / Imediata", prazo: "Imediato (15-30 dias)" },
        { nivel: 3, rotulo: "Alto", corHex: "#dc2626", corClasse: "bg-red-600 text-white", prioridade: "Crítica / Imediata", prazo: "Imediato (24-48h)" },
      ],
    ],
  },

  "4x4": {
    dimension: "4x4",
    titulo: "Matriz 4×4 (Sem Ponto Central)",
    subtitulo: "Projetos de Engenharia, Construção Civil, Mineração e Indústria de Manufatura",
    descricaoNormativa:
      "Fundamentada na ABNT NBR IEC 31010 (Técnicas de Avaliação de Riscos - Seção B.29), MIL-STD-882 (System Safety Standard) e AIHA (American Industrial Hygiene Association). Elimina o viés de tendência central do avaliador.",
    referenciasPrincipais: [
      {
        codigo: "ISO 31010",
        nome: "ABNT NBR IEC 31010:2021 - Matrizes de Consequência e Probabilidade",
        tipo: "Internacional / ABNT",
        corBadge: "bg-blue-700 text-white",
      },
      {
        codigo: "MIL-STD-882",
        nome: "MIL-STD-882D/E - System Safety Risk Assessment Standard",
        tipo: "Internacional (EUA)",
        corBadge: "bg-slate-800 text-white",
      },
      {
        codigo: "AIHA",
        nome: "AIHA Exposure Assessment Strategy (4 Exposure Categories)",
        tipo: "Higiene Ocupacional",
        corBadge: "bg-teal-700 text-white",
      },
      {
        codigo: "OSHA 3071",
        nome: "OSHA Job Hazard Analysis (JHA Matrix)",
        tipo: "Internacional",
        corBadge: "bg-indigo-700 text-white",
      },
    ],
    probabilidades: [
      { valor: 1, rotulo: "Rara", descricao: "Praticamente impossível ou exposição altamente controlada" },
      { valor: 2, rotulo: "Remota", descricao: "Pouco provável de ocorrer / Exposição ocasional" },
      { valor: 3, rotulo: "Provável", descricao: "Pode ocorrer com frequência razoável / Exposição intermitente" },
      { valor: 4, rotulo: "Frequente", descricao: "Esperado de ocorrer / Exposição diária e contínua" },
    ],
    severidades: [
      { valor: 1, rotulo: "Insignificante", descricao: "Sem lesão ou danos leves sem necessidade de atendimento" },
      { valor: 2, rotulo: "Menor", descricao: "Primeiros socorros, lesão superficial reversível sem afastamento" },
      { valor: 3, rotulo: "Maior", descricao: "Lesão grave com afastamento temporário ou sequela reversível" },
      { valor: 4, rotulo: "Crítica", descricao: "Incapacidade permanente total/parcial ou óbito" },
    ],
    grid: [
      // P = 1 (Rara)
      [
        { nivel: 1, rotulo: "Trivial", corHex: "#16a34a", corClasse: "bg-emerald-600 text-white", prioridade: "Baixa", prazo: "Monitorar" },
        { nivel: 1, rotulo: "Trivial", corHex: "#16a34a", corClasse: "bg-emerald-600 text-white", prioridade: "Baixa", prazo: "Monitorar" },
        { nivel: 2, rotulo: "Aceitável", corHex: "#0284c7", corClasse: "bg-sky-600 text-white", prioridade: "Média", prazo: "90 dias" },
        { nivel: 3, rotulo: "Moderado", corHex: "#ea580c", corClasse: "bg-orange-600 text-white", prioridade: "Alta", prazo: "60 dias" },
      ],
      // P = 2 (Remota)
      [
        { nivel: 1, rotulo: "Trivial", corHex: "#16a34a", corClasse: "bg-emerald-600 text-white", prioridade: "Baixa", prazo: "Monitorar" },
        { nivel: 2, rotulo: "Aceitável", corHex: "#0284c7", corClasse: "bg-sky-600 text-white", prioridade: "Média", prazo: "90 dias" },
        { nivel: 3, rotulo: "Moderado", corHex: "#ea580c", corClasse: "bg-orange-600 text-white", prioridade: "Alta", prazo: "60 dias" },
        { nivel: 4, rotulo: "Crítico", corHex: "#dc2626", corClasse: "bg-red-600 text-white", prioridade: "Crítica / Imediata", prazo: "Imediato (15-30 dias)" },
      ],
      // P = 3 (Provável)
      [
        { nivel: 2, rotulo: "Aceitável", corHex: "#0284c7", corClasse: "bg-sky-600 text-white", prioridade: "Média", prazo: "90 dias" },
        { nivel: 3, rotulo: "Moderado", corHex: "#ea580c", corClasse: "bg-orange-600 text-white", prioridade: "Alta", prazo: "60 dias" },
        { nivel: 4, rotulo: "Crítico", corHex: "#dc2626", corClasse: "bg-red-600 text-white", prioridade: "Crítica / Imediata", prazo: "Imediato (30 dias)" },
        { nivel: 4, rotulo: "Crítico", corHex: "#dc2626", corClasse: "bg-red-600 text-white", prioridade: "Crítica / Imediata", prazo: "Imediato (15 dias)" },
      ],
      // P = 4 (Frequente)
      [
        { nivel: 3, rotulo: "Moderado", corHex: "#ea580c", corClasse: "bg-orange-600 text-white", prioridade: "Alta", prazo: "60 dias" },
        { nivel: 4, rotulo: "Crítico", corHex: "#dc2626", corClasse: "bg-red-600 text-white", prioridade: "Crítica / Imediata", prazo: "Imediato (30 dias)" },
        { nivel: 4, rotulo: "Crítico", corHex: "#dc2626", corClasse: "bg-red-600 text-white", prioridade: "Crítica / Imediata", prazo: "Imediato (15 dias)" },
        { nivel: 4, rotulo: "Crítico", corHex: "#dc2626", corClasse: "bg-red-600 text-white", prioridade: "Crítica / Imediata", prazo: "Imediato (24-48h)" },
      ],
    ],
  },

  "5x5": {
    dimension: "5x5",
    titulo: "Matriz 5×5 (Padrão PGR / NR-01 / ISO 45001)",
    subtitulo: "Padrão Oficial de Engenharia e Medicina do Trabalho para PGR, Laudos e Auditorias",
    descricaoNormativa:
      "Fundamentada integralmente na NR-01 (Portaria MTP 6.730/2020 - Subitens 1.5.4.4.2 a 1.5.4.4.5), ISO 45001 (OH&S Management Systems) e BS 8800 (Anexo D). Apresenta 5 graduações de probabilidade e 5 de severidade com cálculo matricial.",
    referenciasPrincipais: [
      {
        codigo: "NR-01 (PGR/GRO)",
        nome: "NR-01 item 1.5.4.4.2 - Avaliação e Gradação de Riscos Ocupacionais",
        tipo: "Norma Regulamentadora",
        corBadge: "bg-red-700 text-white",
      },
      {
        codigo: "ISO 45001",
        nome: "ISO 45001:2018 - Occupational Health and Safety Management",
        tipo: "Internacional",
        corBadge: "bg-blue-700 text-white",
      },
      {
        codigo: "BS 8800 Anexo D",
        nome: "BS 8800 Anexo D - Matriz 5x5 de Gradação de Risco",
        tipo: "Internacional",
        corBadge: "bg-indigo-700 text-white",
      },
      {
        codigo: "ACGIH / NHO",
        nome: "ACGIH TLVs / BEIs & Normas de Higiene Ocupacional FUNDACENTRO",
        tipo: "Higiene Ocupacional",
        corBadge: "bg-amber-700 text-white",
      },
    ],
    probabilidades: [
      { valor: 1, rotulo: "Rara", descricao: "Evento extremamente improvável / Exposição insignificante ou controles totais" },
      { valor: 2, rotulo: "Remota", descricao: "Pouco provável / Exposição eventual (< 1h/dia) com medidas de controle ativas" },
      { valor: 3, rotulo: "Ocasional", descricao: "Possível de ocorrer / Exposição intermitente (2h a 4h/dia)" },
      { valor: 4, rotulo: "Provável", descricao: "Provável de ocorrer / Exposição habitual (> 4h/dia) ou controles deficientes" },
      { valor: 5, rotulo: "Frequente", descricao: "Praticamente certo / Exposição permanente contínua sem proteção eficaz" },
    ],
    severidades: [
      { valor: 1, rotulo: "Insignificante", descricao: "Sem lesão ou desconforto leve passageiro sem afastamento" },
      { valor: 2, rotulo: "Menor", descricao: "Lesão leve reversível com atendimento de primeiros socorros" },
      { valor: 3, rotulo: "Moderada", descricao: "Lesão reversível com afastamento temporário (ex: fratura simples, dermatite)" },
      { valor: 4, rotulo: "Maior", descricao: "Lesão grave / incapacidade parcial permanente (ex: perda auditiva, amputação parcial)" },
      { valor: 5, rotulo: "Catastrófica", descricao: "Incapacidade total permanente ou óbito / múltiplos acidentados" },
    ],
    grid: [
      // P = 1 (Rara)
      [
        { nivel: 1, rotulo: "Nível 1 (Trivial)", corHex: "#0284c7", corClasse: "bg-sky-600 text-white", prioridade: "Baixa", prazo: "Monitorar" },
        { nivel: 1, rotulo: "Nível 1 (Trivial)", corHex: "#0284c7", corClasse: "bg-sky-600 text-white", prioridade: "Baixa", prazo: "Monitorar" },
        { nivel: 2, rotulo: "Nível 2 (Tolerável)", corHex: "#16a34a", corClasse: "bg-emerald-600 text-white", prioridade: "Baixa", prazo: "180 dias" },
        { nivel: 2, rotulo: "Nível 2 (Tolerável)", corHex: "#16a34a", corClasse: "bg-emerald-600 text-white", prioridade: "Baixa", prazo: "120 dias" },
        { nivel: 3, rotulo: "Nível 3 (Moderado)", corHex: "#ca8a04", corClasse: "bg-amber-600 text-white", prioridade: "Média", prazo: "90 dias" },
      ],
      // P = 2 (Remota)
      [
        { nivel: 1, rotulo: "Nível 1 (Trivial)", corHex: "#0284c7", corClasse: "bg-sky-600 text-white", prioridade: "Baixa", prazo: "Monitorar" },
        { nivel: 2, rotulo: "Nível 2 (Tolerável)", corHex: "#16a34a", corClasse: "bg-emerald-600 text-white", prioridade: "Baixa", prazo: "180 dias" },
        { nivel: 2, rotulo: "Nível 2 (Tolerável)", corHex: "#16a34a", corClasse: "bg-emerald-600 text-white", prioridade: "Baixa", prazo: "120 dias" },
        { nivel: 3, rotulo: "Nível 3 (Moderado)", corHex: "#ca8a04", corClasse: "bg-amber-600 text-white", prioridade: "Média", prazo: "90 dias" },
        { nivel: 4, rotulo: "Nível 4 (Substancial)", corHex: "#ea580c", corClasse: "bg-orange-600 text-white", prioridade: "Alta", prazo: "60 dias" },
      ],
      // P = 3 (Ocasional)
      [
        { nivel: 2, rotulo: "Nível 2 (Tolerável)", corHex: "#16a34a", corClasse: "bg-emerald-600 text-white", prioridade: "Baixa", prazo: "120 dias" },
        { nivel: 2, rotulo: "Nível 2 (Tolerável)", corHex: "#16a34a", corClasse: "bg-emerald-600 text-white", prioridade: "Baixa", prazo: "90 dias" },
        { nivel: 3, rotulo: "Nível 3 (Moderado)", corHex: "#ca8a04", corClasse: "bg-amber-600 text-white", prioridade: "Média", prazo: "60 dias" },
        { nivel: 4, rotulo: "Nível 4 (Substancial)", corHex: "#ea580c", corClasse: "bg-orange-600 text-white", prioridade: "Alta", prazo: "30 dias" },
        { nivel: 5, rotulo: "Nível 5 (Intolerável)", corHex: "#dc2626", corClasse: "bg-red-600 text-white", prioridade: "Crítica / Imediata", prazo: "Imediato (15 dias)" },
      ],
      // P = 4 (Provável)
      [
        { nivel: 2, rotulo: "Nível 2 (Tolerável)", corHex: "#16a34a", corClasse: "bg-emerald-600 text-white", prioridade: "Baixa", prazo: "90 dias" },
        { nivel: 3, rotulo: "Nível 3 (Moderado)", corHex: "#ca8a04", corClasse: "bg-amber-600 text-white", prioridade: "Média", prazo: "60 dias" },
        { nivel: 4, rotulo: "Nível 4 (Substancial)", corHex: "#ea580c", corClasse: "bg-orange-600 text-white", prioridade: "Alta", prazo: "30 dias" },
        { nivel: 5, rotulo: "Nível 5 (Intolerável)", corHex: "#dc2626", corClasse: "bg-red-600 text-white", prioridade: "Crítica / Imediata", prazo: "Imediato (15 dias)" },
        { nivel: 5, rotulo: "Nível 5 (Intolerável)", corHex: "#dc2626", corClasse: "bg-red-600 text-white", prioridade: "Crítica / Imediata", prazo: "Imediato (24-48h)" },
      ],
      // P = 5 (Frequente)
      [
        { nivel: 3, rotulo: "Nível 3 (Moderado)", corHex: "#ca8a04", corClasse: "bg-amber-600 text-white", prioridade: "Média", prazo: "60 dias" },
        { nivel: 4, rotulo: "Nível 4 (Substancial)", corHex: "#ea580c", corClasse: "bg-orange-600 text-white", prioridade: "Alta", prazo: "30 dias" },
        { nivel: 5, rotulo: "Nível 5 (Intolerável)", corHex: "#dc2626", corClasse: "bg-red-600 text-white", prioridade: "Crítica / Imediata", prazo: "Imediato (15 dias)" },
        { nivel: 5, rotulo: "Nível 5 (Intolerável)", corHex: "#dc2626", corClasse: "bg-red-600 text-white", prioridade: "Crítica / Imediata", prazo: "Imediato (24-48h)" },
        { nivel: 5, rotulo: "Nível 5 (Intolerável)", corHex: "#dc2626", corClasse: "bg-red-600 text-white", prioridade: "Crítica / Imediata", prazo: "Interrupção Imediata" },
      ],
    ],
  },
};

export const NORMAS_ESPECIFICAS_SUGERIDAS: NormativeOption[] = [
  { codigo: "NR-01", titulo: "NR-01 - Gerenciamento de Riscos Ocupacionais (GRO/PGR)", categoria: "Geral", corBadge: "bg-blue-600 text-white" },
  { codigo: "NR-09", titulo: "NR-09 - Avaliação e Controle das Exposições Ocupacionais a Agentes Físicos, Químicos e Biológicos", categoria: "Higiene", corBadge: "bg-teal-600 text-white" },
  { codigo: "NR-15 Anexo 1", titulo: "NR-15 Anexo 1 - Limites de Tolerância para Ruído Contínuo / Intermitente", categoria: "Físico", corBadge: "bg-emerald-600 text-white" },
  { codigo: "NR-15 Anexo 3", titulo: "NR-15 Anexo 3 - Limites de Tolerância para Exposição ao Calor (IBUTG)", categoria: "Físico", corBadge: "bg-emerald-600 text-white" },
  { codigo: "NR-15 Anexo 8", titulo: "NR-15 Anexo 8 - Vibrações Ocupacionais (VMB e VCI)", categoria: "Físico", corBadge: "bg-emerald-600 text-white" },
  { codigo: "NR-15 Anexo 11", titulo: "NR-15 Anexo 11 - Agentes Químicos com Limite de Tolerância e Absorção pela Pele", categoria: "Químico", corBadge: "bg-red-600 text-white" },
  { codigo: "NR-15 Anexo 13", titulo: "NR-15 Anexo 13 - Agentes Químicos (Avaliação Qualitativa)", categoria: "Químico", corBadge: "bg-red-600 text-white" },
  { codigo: "NR-15 Anexo 14", titulo: "NR-15 Anexo 14 - Agentes Biológicos", categoria: "Biológico", corBadge: "bg-amber-800 text-white" },
  { codigo: "NR-17", titulo: "NR-17 - Ergonomia e Avaliação Ergonômica Preliminar (AEP/AET)", categoria: "Ergonômico", corBadge: "bg-yellow-500 text-slate-900 font-bold" },
  { codigo: "NR-06", titulo: "NR-06 - Equipamentos de Proteção Individual (EPI)", categoria: "Geral", corBadge: "bg-slate-700 text-white" },
  { codigo: "NR-10", titulo: "NR-10 - Segurança em Instalações e Serviços em Eletricidade", categoria: "Acidente", corBadge: "bg-blue-700 text-white" },
  { codigo: "NR-12", titulo: "NR-12 - Segurança no Trabalho em Máquinas e Equipamentos", categoria: "Acidente", corBadge: "bg-blue-700 text-white" },
  { codigo: "NR-33", titulo: "NR-33 - Segurança e Saúde nos Trabalhos em Espaços Confinados", categoria: "Acidente", corBadge: "bg-purple-700 text-white" },
  { codigo: "NR-35", titulo: "NR-35 - Trabalho em Altura", categoria: "Acidente", corBadge: "bg-purple-700 text-white" },
  { codigo: "NHO 01", titulo: "NHO 01 FUNDACENTRO - Procedimento Técnico: Avaliação da Exposição Ocupacional ao Ruído", categoria: "Físico", corBadge: "bg-emerald-700 text-white" },
  { codigo: "NHO 06", titulo: "NHO 06 FUNDACENTRO - Avaliação da Exposição Ocupacional ao Calor", categoria: "Físico", corBadge: "bg-emerald-700 text-white" },
  { codigo: "NHO 09/10", titulo: "NHO 09/10 FUNDACENTRO - Avaliação da Exposição Ocupacional a Vibrações (VMB / VCI)", categoria: "Físico", corBadge: "bg-emerald-700 text-white" },
  { codigo: "NHO 11", titulo: "NHO 11 FUNDACENTRO - Avaliação dos Níveis de Iluminamento em Ambientes de Trabalho", categoria: "Ergonômico", corBadge: "bg-yellow-600 text-white" },
  { codigo: "ACGIH TLVs", titulo: "ACGIH - Threshold Limit Values (TLVs) e Biological Exposure Indices (BEIs)", categoria: "Higiene", corBadge: "bg-cyan-700 text-white" },
  { codigo: "ISO 45001", titulo: "ABNT NBR ISO 45001:2018 - Sistemas de Gestão de Saúde e Segurança Ocupacional", categoria: "Gestão", corBadge: "bg-indigo-700 text-white" },
  { codigo: "ISO 31010", titulo: "ABNT NBR IEC 31010 - Gestão de Riscos: Técnicas de Avaliação de Riscos", categoria: "Gestão", corBadge: "bg-slate-700 text-white" },
];
