export interface CoutoChecklistItem {
  id: string;
  numero: number;
  secao: "operacional" | "informatizado";
  titulo: string;
  descricao: string;
  recomendacaoSugerida: string;
  dominioNr17: "org" | "cargas" | "mob" | "maq" | "amb";
}

// 1. Atividades Operacionais em Geral (13 itens)
export const COUTO_OPERACIONAIS_ITEMS: CoutoChecklistItem[] = [
  {
    id: "op1",
    numero: 1,
    secao: "operacional",
    titulo: "Postura de trabalho em desvio extremo",
    descricao:
      "Alguma postura forçada ou desvio postural extremo que choca o analista pela posição muito errada de algum segmento corpóreo (agachado fazendo força, ajoelhado, ajoelhado com o tronco encurvado para frente, agachado ou ajoelhado com os membros superiores acima do nível dos ombros, carregando peso sobre a cabeça, compressão de partes do corpo por superfícies rígidas ou com quinas vivas).",
    recomendacaoSugerida:
      "Eliminar posturas extremas mediante reorganização do plano de trabalho, uso de banquetas de apoio ou plataformas reguláveis (NR-17.6).",
    dominioNr17: "mob",
  },
  {
    id: "op2",
    numero: 2,
    secao: "operacional",
    titulo: "Tronco encurvado para frente ou torcido > 50%",
    descricao:
      "Tronco encurvado para a frente ou torcido durante mais que 50% do ciclo ou jornada, com pouca probabilidade de mudar de posição e retornar à posição de equilíbrio, mesmo em pequeno grau de desvio.",
    recomendacaoSugerida:
      "Elevar a altura da bancada/área de pega de peças e posicionar materiais na zona de alcance confortável sem torção da coluna.",
    dominioNr17: "mob",
  },
  {
    id: "op3",
    numero: 3,
    secao: "operacional",
    titulo: "Trabalho de pé, parado, durante mais que 85% da jornada",
    descricao:
      "Trabalho de pé, parado, durante mais que 85% da jornada, com pouca possibilidade de se sentar.",
    recomendacaoSugerida:
      "Disponibilizar assentos ou banquetas semi-sentadas para descanso nas pausas e alternância postural (NR-17.6.2).",
    dominioNr17: "org",
  },
  {
    id: "op4",
    numero: 4,
    secao: "operacional",
    titulo: "Posição sentada em cadeira muito ruim ou desvios forçados",
    descricao:
      "Posição sentada em cadeira muito ruim ou em posto de trabalho com desvios muito forçados.",
    recomendacaoSugerida:
      "Substituir assentos por cadeiras reguláveis com encosto lombar anatômico e borda frontal arredondada (NBR 13962 / NR-17.6.3).",
    dominioNr17: "mob",
  },
  {
    id: "op5",
    numero: 5,
    secao: "operacional",
    titulo: "Esforços físicos extremos evidenciados por observação",
    descricao:
      "Esforços extremos evidenciados por observação do trabalho; exemplos: usar marreta com grande esforço, usar alavancas com dispêndio de grande esforço, dar pancadas com grande esforço, puxar ou empurrar carrinho com peso excessivo ou com rodas em mau estado.",
    recomendacaoSugerida:
      "Mecanizar as operações de força e realizar manutenção periódica preventiva nas rodas e rolamentos dos carrinhos de transporte.",
    dominioNr17: "maq",
  },
  {
    id: "op6",
    numero: 6,
    secao: "operacional",
    titulo: "Cadência repetitiva > 15.000 peças/turno ou > 1.800 peças/hora",
    descricao:
      "Trabalhar e concluir em mais que 15.000 peças em um turno ou 1.800 peças por hora sem tempos previstos de recuperação de fadiga ou com rodízio ineficaz.",
    recomendacaoSugerida:
      "Implantar pausas regulares para recuperação de fadiga psicofisiológica e instituir rodízio eficaz de tarefas (NR-17.4.3).",
    dominioNr17: "org",
  },
  {
    id: "op7",
    numero: 7,
    secao: "operacional",
    titulo: "Esforço nítido com mãos/coluna ou pinça pulpar/palmar extrema",
    descricao:
      "Esforço nítido, com mãos, braços ou coluna, aplicando força extrema; utilização de pinça pulpar, pinça lateral ou pinça palmar com esforço nítido.",
    recomendacaoSugerida:
      "Adotar alicates, gabaritos e ferramentas pneumáticas/elétricas que eliminem o esforço muscular em pinça palmar ou digital.",
    dominioNr17: "maq",
  },
  {
    id: "op8",
    numero: 8,
    secao: "operacional",
    titulo: "Levantamento individual de peso superior a 25 kg",
    descricao: "Levantamento individual de algum peso superior a 25 kg.",
    recomendacaoSugerida:
      "Fracionar embalagens e sacarias para pesos inferiores aos limites normativos ou instituir levantamento em dupla / uso de talhas (NR-17.5.2).",
    dominioNr17: "cargas",
  },
  {
    id: "op9",
    numero: 9,
    secao: "operacional",
    titulo: "Carga > 15 kg levantada em frequência > 2x/min e distância > 50 cm",
    descricao:
      "Levantar totalmente ou depositar com precaução alguma carga mais pesada que 15 kg em frequência maior que 2 vezes por minuto e em distância entre os tornozelos e o centro de massa da carga maior que 50 cm.",
    recomendacaoSugerida:
      "Aproximar o ponto de descarga do trabalhador e utilizar mesas pantográficas com nivelamento de altura para paletização.",
    dominioNr17: "cargas",
  },
  {
    id: "op10",
    numero: 10,
    secao: "operacional",
    titulo: "Carrinho manual > 1.500 kg (ou > 700 kg em rampas/pisos ruins)",
    descricao:
      "Empurrar ou puxar carrinhos ou transpaleteiras manuais com peso maior que 1500 kg ou maior que 700 kg em aclives, declives ou em condições nitidamente ruins do piso ou do equipamento.",
    recomendacaoSugerida:
      "Substituir transpaleteiras manuais por modelos elétricos tracionados e recuperar desníveis e irregularidades no piso industrial.",
    dominioNr17: "cargas",
  },
  {
    id: "op11",
    numero: 11,
    secao: "operacional",
    titulo: "Ritmo acelerado, pressão de tempo e alta sobrecarga mental",
    descricao:
      "Ritmo intenso de trabalho mantido, tempo apertado, pressão de tempo, operação crítica com alto impacto na qualidade do produto sem disponibilização de tempo necessário, utilização rigorosa de metas de produção, impossibilidade de pausas voluntárias em trabalhos com alta demanda mental; algum outro fator de carga mental bem evidente.",
    recomendacaoSugerida:
      "Redimensionar metas e tempo-padrão de ciclo, propiciando pausas voluntárias e reduzindo fatores de tensão e estresse mental.",
    dominioNr17: "org",
  },
  {
    id: "op12",
    numero: 12,
    secao: "operacional",
    titulo: "Forma de trabalho predispõe a ocorrência de acidentes",
    descricao: "A forma de se realizar o trabalho predispõe para a ocorrência de acidentes.",
    recomendacaoSugerida:
      "Revisar o procedimento operacional padrão (POP) de segurança e instalar proteções coletivas nas zonas perigosas (NR-12).",
    dominioNr17: "maq",
  },
  {
    id: "op13",
    numero: 13,
    secao: "operacional",
    titulo: "Ruído, calor, vibração ou higiene ocupacional evidente",
    descricao:
      "Alto nível de ruído, calor, vibração ou algum outro fator da Higiene Ocupacional bastante evidente.",
    recomendacaoSugerida:
      "Realizar avaliações quantitativas de higiene ocupacional (NHOs da Fundacentro) e implementar enclausuramento ou climatização.",
    dominioNr17: "amb",
  },
];

// 2. Postos de Trabalho Informatizados (5 itens)
export const COUTO_INFORMATIZADOS_ITEMS: CoutoChecklistItem[] = [
  {
    id: "info1",
    numero: 1,
    secao: "informatizado",
    titulo: "Posto improvisado, monitor desalinhado ou sem espaço para pernas",
    descricao:
      "Posto de trabalho improvisado, com dificuldade nítida de se usar o teclado, torcendo o pescoço para enxergar o monitor de vídeo ou com dificuldade de leitura de documento fonte ou não podendo encostar-se no espaldar da cadeira ou sem espaço adequado para as pernas.",
    recomendacaoSugerida:
      "Fornecer mesa com profundidade adequada (> 60-80cm), suporte articulado de monitor e espaço desobstruído para movimentação das pernas (NR-17.6).",
    dominioNr17: "mob",
  },
  {
    id: "info2",
    numero: 2,
    secao: "informatizado",
    titulo: "Computador ultrapassado em relação à demanda de serviço",
    descricao:
      "Configuração do computador ultrapassada em relação à demanda atual de serviço do executante.",
    recomendacaoSugerida:
      "Atualizar hardware (memória/processador/SSD) para garantir fluidez nas atividades e eliminar frustração e fadiga cognitiva.",
    dominioNr17: "org",
  },
  {
    id: "info3",
    numero: 3,
    secao: "informatizado",
    titulo: "Aplicativos com problemas importantes de performance ou lentidão",
    descricao: "Aplicativos apresentando problema importante de performance.",
    recomendacaoSugerida:
      "Otimizar softwares e infraestrutura de rede corporativa para redução de travamentos e retrabalhos.",
    dominioNr17: "org",
  },
  {
    id: "info4",
    numero: 4,
    secao: "informatizado",
    titulo: "Cadeira degradada ou inadequada para posto informatizado",
    descricao: "Cadeira degradada ou inadequada para postos de trabalho informatizados.",
    recomendacaoSugerida:
      "Adotar cadeiras de escritório reguláveis em conformidade com a NBR 13962 (altura a gás, apoio lombar, apoio de braços ajustável).",
    dominioNr17: "mob",
  },
  {
    id: "info5",
    numero: 5,
    secao: "informatizado",
    titulo: "Condição ambiental inadequada (calor, frio, iluminação, ruído)",
    descricao:
      "Condição ambiental bastante inadequada: calor excessivo, frio excessivo, vibração, iluminação bastante inadequada, alto nível de ruído.",
    recomendacaoSugerida:
      "Ajustar sistema de climatização térmica (20°C a 25°C) e adequar níveis de iluminância sem reflexos na tela conforme NHO 11.",
    dominioNr17: "amb",
  },
];

export const ALL_COUTO_ITEMS = [...COUTO_OPERACIONAIS_ITEMS, ...COUTO_INFORMATIZADOS_ITEMS];

export interface CoutoDiagnosisResult {
  simCount: number;
  naoCount: number;
  naCount: number;
  totalRespondidos: number;
  classificacaoRisco: "Baixo / Situação Conforme" | "Médio / Atenção Ergonômica" | "Alto / Situação Crítica";
  necessidadeAET: boolean;
  justificativaAET: string;
  classificacaoMedidaSugerida: "a" | "b" | "c";
  recomendacoesAutomaticas: string[];
}

export function calculateCoutoDiagnosis(
  respostas: Record<string, "sim" | "nao" | "na"> = {}
): CoutoDiagnosisResult {
  let simCount = 0;
  let naoCount = 0;
  let naCount = 0;
  const recomendacoesAutomaticas: string[] = [];

  ALL_COUTO_ITEMS.forEach((item) => {
    const resp = respostas[item.id];
    if (resp === "sim") {
      simCount++;
      if (!recomendacoesAutomaticas.includes(item.recomendacaoSugerida)) {
        recomendacoesAutomaticas.push(item.recomendacaoSugerida);
      }
    } else if (resp === "nao") {
      naoCount++;
    } else if (resp === "na") {
      naCount++;
    }
  });

  const totalRespondidos = simCount + naoCount + naCount;

  let classificacaoRisco: CoutoDiagnosisResult["classificacaoRisco"] = "Baixo / Situação Conforme";
  let necessidadeAET = false;
  let justificativaAET = "";
  let classificacaoMedidaSugerida: "a" | "b" | "c" = "a";

  if (simCount === 0) {
    classificacaoRisco = "Baixo / Situação Conforme";
    necessidadeAET = false;
    justificativaAET =
      "Checklist de Couto sem apontamentos de exigência extrema. As condições do posto atendem aos requisitos preliminares de conforto da NR-17. Não há necessidade de AET.";
    classificacaoMedidaSugerida = "a";
  } else if (simCount <= 2) {
    classificacaoRisco = "Médio / Atenção Ergonômica";
    necessidadeAET = false;
    justificativaAET = `Foram identificados ${simCount} item(ns) com resposta SIM no checklist de Couto. Tratam-se de exigências pontuais resolvíveis por pequenas melhorias ou soluções já conhecidas, sem necessidade de AET aprofundada.`;
    classificacaoMedidaSugerida = simCount === 1 ? "a" : "b";
  } else {
    classificacaoRisco = "Alto / Situação Crítica";
    necessidadeAET = true;
    justificativaAET = `Identificados ${simCount} itens com resposta SIM no checklist de Couto, caracterizando sobrecarga ergonômica relevante. Recomenda-se a realização de Análise Ergonômica do Trabalho (AET) aprofundada conforme item 17.3.2 da NR-17.`;
    classificacaoMedidaSugerida = "c";
  }

  return {
    simCount,
    naoCount,
    naCount,
    totalRespondidos,
    classificacaoRisco,
    necessidadeAET,
    justificativaAET,
    classificacaoMedidaSugerida,
    recomendacoesAutomaticas,
  };
}
