// Tabelas Oficiais do eSocial para Segurança e Saúde no Trabalho (SST)
// Versão do Leiaute S-1.2 / S-1.3

export interface ESocialTabelaItem {
  codigo: string;
  descricao: string;
  grupo?: string;
  unidadePadrao?: string;
}

// Tabela 24 - Fatores de Risco e Agentes Nocivos
export const TABELA_24_FATORES_RISCO: ESocialTabelaItem[] = [
  // Ausência de Fator de Risco
  {
    codigo: "09.01.001",
    descricao: "Ausência de fator de risco ou atividades que não exponham o trabalhador a agentes nocivos (Regulamento da Previdência Social)",
    grupo: "Ausência de Risco",
  },

  // 01 - Fatores Físicos
  {
    codigo: "01.01.001",
    descricao: "Ruído contínuo ou intermitente",
    grupo: "Físicos",
    unidadePadrao: "3", // dB(A)
  },
  {
    codigo: "01.01.002",
    descricao: "Ruído de impacto",
    grupo: "Físicos",
    unidadePadrao: "3", // dB(C)
  },
  {
    codigo: "01.02.001",
    descricao: "Calor (Sobrecarga térmica)",
    grupo: "Físicos",
    unidadePadrao: "5", // ºC IBUTG
  },
  {
    codigo: "01.03.001",
    descricao: "Radiações ionizantes (Raios X, Gama, materiais radioativos)",
    grupo: "Físicos",
    unidadePadrao: "9",
  },
  {
    codigo: "01.03.002",
    descricao: "Radiações não-ionizantes (Solda, Micro-ondas, UV/IV)",
    grupo: "Físicos",
    unidadePadrao: "9",
  },
  {
    codigo: "01.04.001",
    descricao: "Vibrações de corpo inteiro (VCI)",
    grupo: "Físicos",
    unidadePadrao: "4", // m/s²
  },
  {
    codigo: "01.04.002",
    descricao: "Vibrações de mãos e braços (VMB / Localizada)",
    grupo: "Físicos",
    unidadePadrao: "4", // m/s²
  },
  {
    codigo: "01.05.001",
    descricao: "Pressões atmosféricas anormais (Hiperbárica / Hipobárica)",
    grupo: "Físicos",
    unidadePadrao: "9",
  },
  {
    codigo: "01.06.001",
    descricao: "Frio (Câmaras frias e frigoríficas)",
    grupo: "Físicos",
    unidadePadrao: "9",
  },
  {
    codigo: "01.07.001",
    descricao: "Umidade excessiva",
    grupo: "Físicos",
    unidadePadrao: "9",
  },

  // 02 - Fatores Químicos
  {
    codigo: "02.01.001",
    descricao: "Acetona",
    grupo: "Químicos",
    unidadePadrao: "2", // ppm
  },
  {
    codigo: "02.01.014",
    descricao: "Ácido sulfúrico e seus sais",
    grupo: "Químicos",
    unidadePadrao: "1", // mg/m³
  },
  {
    codigo: "02.01.015",
    descricao: "Ácido clorídrico / Cloreto de hidrogênio",
    grupo: "Químicos",
    unidadePadrao: "2",
  },
  {
    codigo: "02.01.016",
    descricao: "Ácido fosfórico",
    grupo: "Químicos",
    unidadePadrao: "1",
  },
  {
    codigo: "02.01.017",
    descricao: "Ácido nítrico",
    grupo: "Químicos",
    unidadePadrao: "2",
  },
  {
    codigo: "02.01.038",
    descricao: "Amônia",
    grupo: "Químicos",
    unidadePadrao: "2",
  },
  {
    codigo: "02.01.045",
    descricao: "Benzeno e seus compostos tóxicos",
    grupo: "Químicos",
    unidadePadrao: "2",
  },
  {
    codigo: "02.01.057",
    descricao: "Chumbo e seus compostos inorgânicos",
    grupo: "Químicos",
    unidadePadrao: "1",
  },
  {
    codigo: "02.01.063",
    descricao: "Cloro e compostos clorados",
    grupo: "Químicos",
    unidadePadrao: "2",
  },
  {
    codigo: "02.01.066",
    descricao: "Cromo e seus compostos (Hexavalente)",
    grupo: "Químicos",
    unidadePadrao: "1",
  },
  {
    codigo: "02.01.085",
    descricao: "Fumos metálicos (Solda / Fundição)",
    grupo: "Químicos",
    unidadePadrao: "1",
  },
  {
    codigo: "02.01.096",
    descricao: "Hidrocarbonetos aromáticos (Solventes, Tintas, Thinner)",
    grupo: "Químicos",
    unidadePadrao: "2",
  },
  {
    codigo: "02.01.097",
    descricao: "Hidrocarbonetos alifáticos (Gasolina, Querosene, Óleo Diesel)",
    grupo: "Químicos",
    unidadePadrao: "2",
  },
  {
    codigo: "02.01.100",
    descricao: "Monóxido de carbono (CO)",
    grupo: "Químicos",
    unidadePadrao: "2",
  },
  {
    codigo: "02.01.114",
    descricao: "Óleos minerais e graxas derivadas de petróleo",
    grupo: "Químicos",
    unidadePadrao: "1",
  },
  {
    codigo: "02.01.127",
    descricao: "Poeiras minerais contendo Sílica Livre Cristalizada (Quartzo)",
    grupo: "Químicos",
    unidadePadrao: "1",
  },
  {
    codigo: "02.01.128",
    descricao: "Poeiras de Asbesto / Amianto",
    grupo: "Químicos",
    unidadePadrao: "6", // f/cm³
  },
  {
    codigo: "02.01.129",
    descricao: "Poeiras incômodas / Particulados totais ou respiráveis",
    grupo: "Químicos",
    unidadePadrao: "1",
  },
  {
    codigo: "02.01.137",
    descricao: "Tolueno (Metilbenzeno)",
    grupo: "Químicos",
    unidadePadrao: "2",
  },
  {
    codigo: "02.01.144",
    descricao: "Xileno (Dimetilbenzeno)",
    grupo: "Químicos",
    unidadePadrao: "2",
  },
  {
    codigo: "02.01.999",
    descricao: "Outros produtos químicos e vapores perigosos",
    grupo: "Químicos",
    unidadePadrao: "1",
  },

  // 03 - Fatores Biológicos
  {
    codigo: "03.01.001",
    descricao: "Microrganismos e parasitas infecciosos vivos e suas toxinas (Vírus, bactérias, fungos em esgotos, lixo e hospitais)",
    grupo: "Biológicos",
    unidadePadrao: "9",
  },
];

// Tabela 27 - Procedimentos Diagnósticos do eSocial (Exames Médicos / S-2220)
export const TABELA_27_PROCEDIMENTOS: ESocialTabelaItem[] = [
  {
    codigo: "0050",
    descricao: "Avaliação Clínica Ocupacional (Anamnese e Exame Físico Geral)",
    grupo: "Clínico",
  },
  {
    codigo: "0295",
    descricao: "Audiometria Tonal Limiar com Testes Vocais",
    grupo: "Audição",
  },
  {
    codigo: "0214",
    descricao: "Eletrocardiograma convencional de repouso (ECG)",
    grupo: "Cardiovascular",
  },
  {
    codigo: "0215",
    descricao: "Eletroencefalograma de rotina (EEG)",
    grupo: "Neurológico",
  },
  {
    codigo: "0999",
    descricao: "Espirometria / Prova de Função Pulmonar com e sem broncodilatador",
    grupo: "Pulmonar",
  },
  {
    codigo: "0352",
    descricao: "Radiografia de Tórax Padrão OIT (Teleperfil)",
    grupo: "Radiológico",
  },
  {
    codigo: "0583",
    descricao: "Hemograma completo com contagem de plaquetas",
    grupo: "Laboratorial",
  },
  {
    codigo: "0640",
    descricao: "Glicemia de jejum",
    grupo: "Laboratorial",
  },
  {
    codigo: "1040",
    descricao: "Exame Toxicológico Ocupacional / Indicador Biológico de Exposição (IBE)",
    grupo: "Toxicologia",
  },
  {
    codigo: "1120",
    descricao: "Acuidade Visual / Teste de Campimetria e Visão de Cores",
    grupo: "Oftalmológico",
  },
  {
    codigo: "0410",
    descricao: "Dosagem de Creatinina e Ureia Sérica",
    grupo: "Laboratorial",
  },
  {
    codigo: "0720",
    descricao: "Lipidograma Completo (Colesterol Total, HDL, LDL e Triglicérides)",
    grupo: "Laboratorial",
  },
  {
    codigo: "0850",
    descricao: "Exame Parasitológico de Fezes (EPF) / Coprocultura",
    grupo: "Laboratorial",
  },
  {
    codigo: "0910",
    descricao: "Sumário de Urina (EAS / Tipo I)",
    grupo: "Laboratorial",
  },
  {
    codigo: "1230",
    descricao: "Ácido Hipúrico / Metil-hipúrico (Urina)",
    grupo: "Laboratorial",
  },
  {
    codigo: "1240",
    descricao: "Ácido Trans,Trans-mucônico (Urina - Benzeno)",
    grupo: "Laboratorial",
  },
  {
    codigo: "1999",
    descricao: "Outros exames complementares ocupacionais específicos",
    grupo: "Outros",
  },
];

// Tabela 13 - Parte do Corpo Atingida (S-2210 / CAT)
export const TABELA_13_PARTE_CORPO: ESocialTabelaItem[] = [
  { codigo: "752010000", descricao: "Cabeça (crânio, encéfalo)", grupo: "Cabeça" },
  { codigo: "752020000", descricao: "Olho (inclusive globo ocular e pálpebra)", grupo: "Cabeça" },
  { codigo: "752030000", descricao: "Ouvido (interno, médio, externo)", grupo: "Cabeça" },
  { codigo: "752040000", descricao: "Face (boca, dentes, nariz, lábios)", grupo: "Cabeça" },
  { codigo: "753000000", descricao: "Pescoço e região cervical", grupo: "Pescoço" },
  { codigo: "754010000", descricao: "Tórax (costelas, esterno, órgãos torácicos)", grupo: "Tronco" },
  { codigo: "754020000", descricao: "Dorso (inclusive coluna lombar e dorsal)", grupo: "Tronco" },
  { codigo: "754030000", descricao: "Abdome (órgãos internos, parede abdominal)", grupo: "Tronco" },
  { codigo: "754040000", descricao: "Pelve / Quadril", grupo: "Tronco" },
  { codigo: "755010000", descricao: "Ombro", grupo: "Membros Superiores" },
  { codigo: "755020000", descricao: "Braço", grupo: "Membros Superiores" },
  { codigo: "755030000", descricao: "Cotovelo", grupo: "Membros Superiores" },
  { codigo: "755040000", descricao: "Antebraço", grupo: "Membros Superiores" },
  { codigo: "755050000", descricao: "Punho", grupo: "Membros Superiores" },
  { codigo: "755060000", descricao: "Mão (exceto dedos)", grupo: "Membros Superiores" },
  { codigo: "755070000", descricao: "Dedo da mão (inclusive polegar)", grupo: "Membros Superiores" },
  { codigo: "756010000", descricao: "Coxa", grupo: "Membros Inferiores" },
  { codigo: "756020000", descricao: "Joelho e rótula", grupo: "Membros Inferiores" },
  { codigo: "756030000", descricao: "Perna (canela, panturrilha)", grupo: "Membros Inferiores" },
  { codigo: "756040000", descricao: "Tornozelo", grupo: "Membros Inferiores" },
  { codigo: "756050000", descricao: "Pé (exceto dedos)", grupo: "Membros Inferiores" },
  { codigo: "756060000", descricao: "Dedo do pé", grupo: "Membros Inferiores" },
  { codigo: "757000000", descricao: "Partes Múltiplas do corpo", grupo: "Geral" },
  { codigo: "758000000", descricao: "Sistemas orgânicos e corpo inteiro", grupo: "Geral" },
];

// Tabela 14/15 - Agente Causador do Acidente (S-2210 / CAT)
export const TABELA_14_AGENTE_CAUSADOR: ESocialTabelaItem[] = [
  { codigo: "301010000", descricao: "Máquinas operatrizes, prensas e equipamentos mecânicos", grupo: "Máquinas" },
  { codigo: "302010000", descricao: "Ferramentas manuais sem força motriz (facas, martelos, chaves)", grupo: "Ferramentas" },
  { codigo: "302020000", descricao: "Ferramentas elétricas / pneumáticas portáteis", grupo: "Ferramentas" },
  { codigo: "303010000", descricao: "Veículos de transporte rodoviário / Caminhão / Carro", grupo: "Veículos" },
  { codigo: "303020000", descricao: "Empilhadeira e equipamentos de guindar / Ponte rolante", grupo: "Transporte" },
  { codigo: "304010000", descricao: "Piso / Superfície de circulação no mesmo nível", grupo: "Superfície" },
  { codigo: "304020000", descricao: "Escadas portáteis ou fixas", grupo: "Altura" },
  { codigo: "304030000", descricao: "Andaime / Plataforma elevada / Telhado", grupo: "Altura" },
  { codigo: "305010000", descricao: "Eletricidade (Baixa / Média / Alta tensão)", grupo: "Eletricidade" },
  { codigo: "306010000", descricao: "Substância química líquida ou vapor corrosivo/tóxico", grupo: "Químicos" },
  { codigo: "307010000", descricao: "Objeto em queda livre ou arremessado", grupo: "Impacto" },
  { codigo: "308010000", descricao: "Animal peçonhento ou mordedura", grupo: "Biológico" },
  { codigo: "309010000", descricao: "Caldeiras, vasos sob pressão e botijões", grupo: "Pressão" },
  { codigo: "399000000", descricao: "Outro agente causador não classificado", grupo: "Outros" },
];

// Tabela 17 - Natureza da Lesão (S-2210 / CAT)
export const TABELA_17_NATUREZA_LESAO: ESocialTabelaItem[] = [
  { codigo: "701010000", descricao: "Escoriação, abrasão ou raspão na pele", grupo: "Superficial" },
  { codigo: "701020000", descricao: "Corte, laceração, ferida contusa ou incisa", grupo: "Ferimentos" },
  { codigo: "702010000", descricao: "Fratura fechada de osso", grupo: "Ósseo" },
  { codigo: "702020000", descricao: "Fratura exposta de osso", grupo: "Ósseo" },
  { codigo: "703010000", descricao: "Contusão, esmagamento ou hematoma", grupo: "Trauma" },
  { codigo: "704010000", descricao: "Entorse, torção ou luxação articular", grupo: "Articular" },
  { codigo: "704020000", descricao: "Distensão muscular ou lesão de ligamento/tendão", grupo: "Muscular" },
  { codigo: "705010000", descricao: "Queimadura térmica por calor ou fogo", grupo: "Térmico" },
  { codigo: "705020000", descricao: "Queimadura química por ácido ou base", grupo: "Químico" },
  { codigo: "706010000", descricao: "Amputação ou perda traumática de membro ou dedo", grupo: "Grave" },
  { codigo: "707010000", descricao: "Traumatismo cranioencefálico (TCE) ou concussão", grupo: "Grave" },
  { codigo: "708010000", descricao: "Intoxicação aguda ou envenenamento", grupo: "Sistêmico" },
  { codigo: "709010000", descricao: "Choque elétrico e eletrocussão", grupo: "Elétrico" },
  { codigo: "710010000", descricao: "Corpo estranho no olho ou via aérea", grupo: "Ocular/Aéreo" },
  { codigo: "711010000", descricao: "Asfixia, sufocamento ou afogamento", grupo: "Respiratório" },
  { codigo: "799000000", descricao: "Outras lesões não especificadas", grupo: "Outros" },
];

// Tabela 23 - Unidades de Medida
export const TABELA_23_UNIDADES_MEDIDA = [
  { codigo: "1", sigla: "mg/m³", descricao: "Miligramas por metro cúbico" },
  { codigo: "2", sigla: "ppm", descricao: "Partes por milhão" },
  { codigo: "3", sigla: "dB(A)", descricao: "Decibéis na curva A" },
  { codigo: "4", sigla: "m/s²", descricao: "Metros por segundo ao quadrado (Vibração)" },
  { codigo: "5", sigla: "ºC", descricao: "Graus Celsius (IBUTG - Sobrecarga Térmica)" },
  { codigo: "6", sigla: "f/cm³", descricao: "Fibras por centímetro cúbico (Asbesto)" },
  { codigo: "7", sigla: "lux", descricao: "Lux (Iluminamento)" },
  { codigo: "9", sigla: "Adimensional", descricao: "Adimensional / Outras unidades" },
];

// Auxiliar para encontrar código Tabela 24 a partir do nome de um risco
export function mapearRiscoParaTabela24(nomeRisco: string): ESocialTabelaItem {
  const clean = nomeRisco.toLowerCase();

  if (clean.includes("ruído") || clean.includes("ruido")) {
    if (clean.includes("impacto")) {
      return TABELA_24_FATORES_RISCO.find((t) => t.codigo === "01.01.002")!;
    }
    return TABELA_24_FATORES_RISCO.find((t) => t.codigo === "01.01.001")!;
  }
  if (clean.includes("calor") || clean.includes("térmico") || clean.includes("forno")) {
    return TABELA_24_FATORES_RISCO.find((t) => t.codigo === "01.02.001")!;
  }
  if (clean.includes("vibração") || clean.includes("vibracao")) {
    if (clean.includes("mãos") || clean.includes("braços") || clean.includes("martelete") || clean.includes("lixadeira")) {
      return TABELA_24_FATORES_RISCO.find((t) => t.codigo === "01.04.002")!;
    }
    return TABELA_24_FATORES_RISCO.find((t) => t.codigo === "01.04.001")!;
  }
  if (clean.includes("radiação ionizante") || clean.includes("raios x") || clean.includes("radiacao ionizante")) {
    return TABELA_24_FATORES_RISCO.find((t) => t.codigo === "01.03.001")!;
  }
  if (clean.includes("solda") || clean.includes("uv") || clean.includes("infravermelho") || clean.includes("não-ionizante")) {
    return TABELA_24_FATORES_RISCO.find((t) => t.codigo === "01.03.002")!;
  }
  if (clean.includes("frio") || clean.includes("câmara") || clean.includes("frigoríf")) {
    return TABELA_24_FATORES_RISCO.find((t) => t.codigo === "01.06.001")!;
  }
  if (clean.includes("umidade")) {
    return TABELA_24_FATORES_RISCO.find((t) => t.codigo === "01.07.001")!;
  }
  if (clean.includes("sílica") || clean.includes("cimento") || clean.includes("areia") || clean.includes("poeira mineral")) {
    return TABELA_24_FATORES_RISCO.find((t) => t.codigo === "02.01.127")!;
  }
  if (clean.includes("fumo") || clean.includes("fumos metálicos")) {
    return TABELA_24_FATORES_RISCO.find((t) => t.codigo === "02.01.085")!;
  }
  if (clean.includes("solvente") || clean.includes("thinner") || clean.includes("tinta") || clean.includes("tolueno") || clean.includes("xileno")) {
    return TABELA_24_FATORES_RISCO.find((t) => t.codigo === "02.01.096")!;
  }
  if (clean.includes("óleo") || clean.includes("oleo") || clean.includes("graxa")) {
    return TABELA_24_FATORES_RISCO.find((t) => t.codigo === "02.01.114")!;
  }
  if (clean.includes("químico") || clean.includes("quimico") || clean.includes("vapores")) {
    return TABELA_24_FATORES_RISCO.find((t) => t.codigo === "02.01.999")!;
  }
  if (clean.includes("biológico") || clean.includes("biologico") || clean.includes("bactéria") || clean.includes("vírus") || clean.includes("esgoto")) {
    return TABELA_24_FATORES_RISCO.find((t) => t.codigo === "03.01.001")!;
  }

  // Se for risco sem agente nocivo da previdência (ex: ergonômico ou acidente em cargos administrativos)
  return TABELA_24_FATORES_RISCO.find((t) => t.codigo === "09.01.001")!;
}

// Auxiliar para mapear procedimento do ASO para a Tabela 27
export function mapearExameParaTabela27(nomeExame: string): ESocialTabelaItem {
  const clean = nomeExame.toLowerCase();

  if (clean.includes("clínica") || clean.includes("clinica") || clean.includes("anamnese") || clean.includes("físico")) {
    return TABELA_27_PROCEDIMENTOS.find((t) => t.codigo === "0050")!;
  }
  if (clean.includes("audiometria") || clean.includes("audiom")) {
    return TABELA_27_PROCEDIMENTOS.find((t) => t.codigo === "0295")!;
  }
  if (clean.includes("ecg") || clean.includes("eletrocardiograma")) {
    return TABELA_27_PROCEDIMENTOS.find((t) => t.codigo === "0214")!;
  }
  if (clean.includes("eeg") || clean.includes("eletroencefalograma")) {
    return TABELA_27_PROCEDIMENTOS.find((t) => t.codigo === "0215")!;
  }
  if (clean.includes("espirometria") || clean.includes("pulmonar")) {
    return TABELA_27_PROCEDIMENTOS.find((t) => t.codigo === "0999")!;
  }
  if (clean.includes("raio-x") || clean.includes("radiografia") || clean.includes("oit")) {
    return TABELA_27_PROCEDIMENTOS.find((t) => t.codigo === "0352")!;
  }
  if (clean.includes("hemograma") || clean.includes("plaquetas")) {
    return TABELA_27_PROCEDIMENTOS.find((t) => t.codigo === "0583")!;
  }
  if (clean.includes("glicemia") || clean.includes("glicose")) {
    return TABELA_27_PROCEDIMENTOS.find((t) => t.codigo === "0640")!;
  }
  if (clean.includes("toxicológico") || clean.includes("toxicologico") || clean.includes("ibe")) {
    return TABELA_27_PROCEDIMENTOS.find((t) => t.codigo === "1040")!;
  }
  if (clean.includes("acuidade") || clean.includes("visual") || clean.includes("visão") || clean.includes("visao")) {
    return TABELA_27_PROCEDIMENTOS.find((t) => t.codigo === "1120")!;
  }

  return TABELA_27_PROCEDIMENTOS.find((t) => t.codigo === "1999")!;
}
