import { Nr16AnexoItem, Nr16AvaliacaoItem } from "../types";

export interface Nr16AnexoDefinition {
  id: "anexo1" | "anexo2" | "anexo3" | "anexo4" | "anexo5" | "anexoRad";
  codigo: string;
  titulo: string;
  subtitulo: string;
  legislacao: string;
  icone: string;
  perguntasNormativas: {
    id: string;
    pergunta: string;
    itemNorma: string;
    areaRiscoSugerida: string;
    justificativaPadrao: string;
    medidasRecomendadas: string[];
  }[];
  areasRiscoPadrao: string[];
  limitesIsencao: string[];
}

export const NR16_ANEXOS: Nr16AnexoDefinition[] = [
  {
    id: "anexo1",
    codigo: "Anexo 1",
    titulo: "Explosivos",
    subtitulo: "Atividades e operações perigosas com explosivos",
    legislacao: "Portaria MTE nº 3.214/1978, NR-16 Anexo 1 e R-105 do Exército Brasileiro",
    icone: "Bomb",
    perguntasNormativas: [
      {
        id: "exp_1",
        pergunta: "Realiza fabricação, transformação ou refino de substâncias explosivas?",
        itemNorma: "Quadro nº 1, Item 1, alínea 'a'",
        areaRiscoSugerida: "Toda a área de fabricação e depósito, obedecidas as distâncias regulamentares.",
        justificativaPadrao: "O empregado atua na fabricação de substâncias explosivas, exposto permanentemente a risco iminente de detonação com destruição catastrófica.",
        medidasRecomendadas: [
          "Cumprir rigorosamente as tabelas de quantidades e distâncias de segurança da NR-16.",
          "Instalar sistema contra descargas atmosféricas (SPDA) certificado e aterramentos dissipativos antiestáticos.",
          "Manter plano de contingência e evacuação com simulados periódicos.",
        ],
      },
      {
        id: "exp_2",
        pergunta: "Realiza armazenamento, manuseio ou estocagem de pólvoras, espoletas, dinamites ou explosivos?",
        itemNorma: "Quadro nº 1, Item 1, alínea 'b' e 'c'",
        areaRiscoSugerida: "Área interna do paiol/depósito de explosivos e faixa externa conforme Tabela de Distâncias.",
        justificativaPadrao: "Atividade habitual em paióis e depósitos de material bélico/explosivo, permanecendo em área com perigo constante de combustão e detonação.",
        medidasRecomendadas: [
          "Controle de acesso rigoroso apenas a pessoal devidamente treinado e autorizado.",
          "Proibição absoluta de fumo, chamas abertas e ferramentas suscetíveis à geração de centelhas.",
        ],
      },
      {
        id: "exp_3",
        pergunta: "Realiza transporte ou carregamento de materiais explosivos e detonadores?",
        itemNorma: "Quadro nº 1, Item 1, alínea 'd'",
        areaRiscoSugerida: "Veículo de transporte e faixa de isolamento no carregamento/descarregamento.",
        justificativaPadrao: "Operação de transporte rodoviário ou interno de substâncias explosivas em quantidades superiores aos limites de isenção de trânsito.",
        medidasRecomendadas: [
          "Veículo com certificação MOPP (Movimentação Operacional de Produtos Perigosos) e isolamento térmico.",
          "Proibição de transporte conjunto de detonadores com explosivos na mesma carroceria.",
        ],
      },
      {
        id: "exp_4",
        pergunta: "Executa detonação, fogo ou queima de explosivos (Blaster)?",
        itemNorma: "Quadro nº 1, Item 1, alínea 'e'",
        areaRiscoSugerida: "Área de tiro e raio de projeção de fragmentos e onda de choque.",
        justificativaPadrao: "Atividade direta de preparação de minas, escorva e detonação a céu aberto ou subterrâneo por profissional blaster habilitado.",
        medidasRecomendadas: [
          "Acionamento por comando elétrico à distância com abrigo blindado comprovado.",
          "Sinalização sonora de aviso de detonação em três toques regulamentares.",
        ],
      },
    ],
    areasRiscoPadrao: [
      "Área interna do paiol/depósito de explosivos",
      "Raio de segurança conforme Tabela de Distâncias da NR-16",
      "Área de carregamento e detonação (raio de tiro)",
      "Veículo de transporte de explosivos",
      "Não há exposição / Não aplicável",
    ],
    limitesIsencao: [
      "Transporte de explosivos em quantidade inferior a 10 kg de pólvora de caça em embalagens originais certificadas.",
      "Produtos químicos sem características detonantes ou inflamabilidade espontânea.",
    ],
  },
  {
    id: "anexo2",
    codigo: "Anexo 2",
    titulo: "Inflamáveis",
    subtitulo: "Atividades e operações perigosas com líquidos e gases liquefeitos inflamáveis",
    legislacao: "Portaria MTE nº 3.214/1978, NR-16 Anexo 2, Portarias MTE 1.357/2019 e 1.109/2016",
    icone: "Flame",
    perguntasNormativas: [
      {
        id: "inf_1",
        pergunta: "Opera em postos de reabastecimento de combustível líquido ou GLP (Frentista / Operador de Pista)?",
        itemNorma: "Quadro nº 3, Item 1, alínea 'm' (Postos de serviço e bombas de combustível)",
        areaRiscoSugerida: "Círculo com raio de 7,5 metros com centro nas bombas de abastecimento e faixa de 3 metros dos respiros.",
        justificativaPadrao: "O trabalhador atua habitualmente na pista de abastecimento de veículos automotores, operando bombas de combustíveis inflamáveis líquidos (gasolina, etanol, diesel) ou permanecendo dentro da área de risco regulamentar de 7,5 metros.",
        medidasRecomendadas: [
          "Treinamento obrigatório da NR-20 (Intermediário ou Avançado).",
          "Uso de vestimenta de proteção antiestática em algodão 100% e calçado de segurança com biqueira e solado antiestático.",
          "Disponibilização de aterramento para descargas eletrostáticas durante a trasfega.",
        ],
      },
      {
        id: "inf_2",
        pergunta: "Realiza transporte, trasfega, enchimento ou vazamento de inflamáveis líquidos em tambores/recipientes?",
        itemNorma: "Quadro nº 3, Item 1, alínea 'b' e 'j'",
        areaRiscoSugerida: "Toda a bacia de contenção e faixa de 3 metros de largura ao redor dos pontos de enchimento/tanques.",
        justificativaPadrao: "Atividade de manuseio direto e trasfega de líquidos inflamáveis (ponto de fulgor ≤ 60ºC), permanecendo em área com emissão contínua de vapores inflamáveis.",
        medidasRecomendadas: [
          "Instalação de exaustão localizada nas fontes geradoras de vapores.",
          "Equipamentos elétricos à prova de explosão (Ex) certificados pelo INMETRO no recinto.",
        ],
      },
      {
        id: "inf_3",
        pergunta: "Permanece em recintos fechados onde há armazenamento de inflamáveis líquidos em volume superior a 200 litros ou gases em volume superior a 135 kg?",
        itemNorma: "Quadro nº 3, Item 1, alínea 's' e Item 3, alínea 's'",
        areaRiscoSugerida: "Toda a área interna do recinto / almoxarifado de inflamáveis.",
        justificativaPadrao: "Trabalho executado em recinto fechado onde são armazenados inflamáveis líquidos em recipientes não lacrados ou em quantidade superior ao limite legal de 200 litros (ou tanques elevados/aéreos), tornando todo o recinto área de risco.",
        medidasRecomendadas: [
          "Ventilação natural cruzada permanente ou sistema mecânico de insuflamento/exaustão com classificação à prova de explosão.",
          "Diques de contenção estanques com volume mínimo igual a 110% da capacidade do maior tanque.",
        ],
      },
      {
        id: "inf_4",
        pergunta: "Realiza troca de cilindros de GLP (P-20) em empilhadeiras ou central de gás?",
        itemNorma: "Quadro nº 3, Item 1, alínea 'j' e Item 3, alínea 'q'",
        areaRiscoSugerida: "Raio de 3 metros ao redor da válvula de conexão do cilindro de GLP / central de abastecimento.",
        justificativaPadrao: "O operador realiza conexão, desconexão e troca de cilindro de gás liquefeito de petróleo (GLP - P20), com potencial liberação de gás inflamável durante a manobra.",
        medidasRecomendadas: [
          "Treinamento prático de engate rápido e teste de estanqueidade com solução de água e sabão (nunca com chama).",
          "Uso de luvas de proteção criogênica/antichama e óculos de proteção.",
        ],
      },
      {
        id: "inf_5",
        pergunta: "Aplica tintas, vernizes ou solventes inflamáveis com pistola em recinto fechado sem cabine de pintura com exaustão certificada?",
        itemNorma: "Quadro nº 3, Item 1, alínea 'n'",
        areaRiscoSugerida: "Toda a área interna do recinto de pintura.",
        justificativaPadrao: "Operação de pintura por pulverização com produtos inflamáveis em ambiente fechado, gerando atmosfera explosiva na totalidade do compartimento de trabalho.",
        medidasRecomendadas: [
          "Cabine de pintura com cortina d'água ou filtros secos e sistema de exaustão com vazão nominal certificada.",
          "Instalação de detectores de gases inflamáveis e luminárias seladas herméticas.",
        ],
      },
    ],
    areasRiscoPadrao: [
      "Círculo com raio de 7,5 metros com centro nas bombas de abastecimento",
      "Raio de 3,0 metros com centro nos pontos de transferência/enchimento/válvulas",
      "Faixa de 15,0 metros ao redor dos tanques de armazenamento aéreo de gás inflamável",
      "Toda a bacia de contenção dos tanques de líquidos inflamáveis",
      "Toda a área interna do recinto fechado onde se armazenam inflamáveis",
      "Não há exposição / Não aplicável",
    ],
    limitesIsencao: [
      "Armazenamento de líquidos inflamáveis em recipientes certificados até 200 litros (Portaria MTE nº 1.357/2019).",
      "Armazenamento de até 135 kg de GLP em recipientes transportáveis instalados no exterior da edificação.",
      "Tanques de combustível originais de fábrica ou certificados pelo CONTRAN para propulsão do próprio veículo automotor ou máquinas.",
      "Produtos embalados em pequenos recipientes lacrados para venda a varejo (até 5 litros).",
    ],
  },
  {
    id: "anexo3",
    codigo: "Anexo 3",
    titulo: "Segurança Pessoal e Patrimonial",
    subtitulo: "Exposição a roubos ou outras espécies de violência física",
    legislacao: "Portaria MTE nº 1.885/2013, Art. 193, II da CLT e Lei Federal nº 7.102/1983",
    icone: "ShieldAlert",
    perguntasNormativas: [
      {
        id: "seg_1",
        pergunta: "Exerce atividade profissional de vigilância patrimonial (armada ou desarmada) em estabelecimentos públicos ou privados?",
        itemNorma: "Item 1 e 2, alínea 'a' (Vigilância Patrimonial)",
        areaRiscoSugerida: "Todo o perímetro do posto de serviço e vias de ronda do estabelecimento.",
        justificativaPadrao: "O trabalhador atua na atividade de vigilância patrimonial em postos de serviço, garantindo a segurança de bens e pessoas, com exposição direta e permanente ao risco de roubos e violência física.",
        medidasRecomendadas: [
          "Curso de Formação de Vigilante e reciclagem bienal em escola autorizada pelo DPF.",
          "Colete de proteção balística individual nível II-A ou superior dentro do prazo de validade.",
          "Sistema de comunicação bidirecional de emergência (rádio HT ou botão de pânico).",
        ],
      },
      {
        id: "seg_2",
        pergunta: "Executa transporte de valores, numerários ou escolta armada de cargas?",
        itemNorma: "Item 2, alíneas 'b' e 'c' (Transporte de Valores e Escolta Armada)",
        areaRiscoSugerida: "Veículo blindado e itinerário de trânsito de cargas e numerários.",
        justificativaPadrao: "Operação direta de guarda e transporte de valores em carro-forte ou veículos de escolta armada, sujeitos a emboscadas e assaltos armados.",
        medidasRecomendadas: [
          "Veículo blindado com certificação do Exército Brasileiro e DPF.",
          "Armamento regulamentar e munição sob custódia e plano de rotas dinâmico.",
        ],
      },
      {
        id: "seg_3",
        pergunta: "Atua na segurança pessoal privada de executivos, autoridades ou pessoas sob ameaça?",
        itemNorma: "Item 2, alínea 'd' (Segurança Pessoal)",
        areaRiscoSugerida: "Locais de deslocamento e permanência do protegido.",
        justificativaPadrao: "Acompanhamento e proteção aproximada de pessoas físicas com risco potencial à integridade física.",
        medidasRecomendadas: [
          "Treinamento específico de direção defensiva/evasiva e defesa pessoal.",
          "Colete balístico velado discreto.",
        ],
      },
    ],
    areasRiscoPadrao: [
      "Perímetro do posto de serviço / Instalações vigiadas",
      "Itinerário de transporte e escolta de valores",
      "Locais de deslocamento e eventos públicos/privados",
      "Não há exposição / Não aplicável",
    ],
    limitesIsencao: [
      "Atividades de portaria simples, recepção, vigia de condomínio residencial sem atribuições de segurança armada/patrimonial e sem cadastro na PF.",
      "Atendentes de caixa e operadores de comércio em geral sem atribuição de defesa armada do patrimônio.",
    ],
  },
  {
    id: "anexo4",
    codigo: "Anexo 4",
    titulo: "Energia Elétrica",
    subtitulo: "Atividades e operações perigosas com energia elétrica",
    legislacao: "Portaria MTE nº 1.078/2014 e NR-10 (Segurança em Instalações e Serviços em Eletricidade)",
    icone: "Zap",
    perguntasNormativas: [
      {
        id: "ele_1",
        pergunta: "Executa manutenção, intervenção, medição ou operação em circuitos elétricos energizados de Baixa Tensão (> 50V em CA ou > 120V em CC) ou em Zona de Risco/Controlada?",
        itemNorma: "Item 1, alínea 'c' (Trabalho em circuitos elétricos energizados em BT)",
        areaRiscoSugerida: "Zona de Risco e Zona Controlada (quadros elétricos, barramentos, cabines de força e painéis de comando).",
        justificativaPadrao: "O profissional realiza medições, testes de grandezas, manutenção preventiva e corretiva com painéis e quadros elétricos de baixa tensão energizados ou nas proximidades de partes vivas desprotegidas dentro da zona controlada/risco.",
        medidasRecomendadas: [
          "Treinamento obrigatório da NR-10 Básico (40h) e reciclagem bienal.",
          "Procedimento de desenergização e bloqueio LOTO (Lockout & Tagout) com as 10 etapas da NR-10.",
          "Vestimenta de proteção contra arco elétrico ATPF categoria 2 (NFPA 70E) e luvas isolantes de borracha com luvas de vaqueta de cobertura.",
        ],
      },
      {
        id: "ele_2",
        pergunta: "Trabalha no Sistema Elétrico de Potência (SEP) - subestações, linhas aéreas de transmissão/distribuição ou cabines primárias de média/alta tensão (> 1000V)?",
        itemNorma: "Item 1, alínea 'a' e 'b' (Instalações do SEP e AT)",
        areaRiscoSugerida: "Subestações de força, pátio de transformadores, cabines primárias e redes aéreas de AT.",
        justificativaPadrao: "Atividades habituais no Sistema Elétrico de Potência (SEP) e instalações elétricas de alta tensão, com risco iminente de choque elétrico letal por toque ou arco elétrico de alta energia.",
        medidasRecomendadas: [
          "Treinamento NR-10 Básico + NR-10 Complementar SEP (40h).",
          "Emissão diária de Análise de Risco (APR) e Permissão de Trabalho (PT).",
          "Varas de manobra certificadas, detector de ausência de tensão e conjunto de aterramento temporário rápido.",
        ],
      },
      {
        id: "ele_3",
        pergunta: "Realiza inspeções visuais em subestações ou manobras de chaves seccionadoras e disjuntores de média/alta tensão?",
        itemNorma: "Item 1, alínea 'a' e 'd'",
        areaRiscoSugerida: "Interior de cabines primárias e subestações transformadoras.",
        justificativaPadrao: "Ingresso em cabines e áreas confinadas de transformadores energizados para manobras operacionais e medições de rotina.",
        medidasRecomendadas: [
          "Equipamentos de proteção coletiva (tapetes isolantes e barreiras dielétricas).",
          "Capacete classe B com viseira facial de policarbonato contra arco elétrico.",
        ],
      },
    ],
    areasRiscoPadrao: [
      "Zona de Risco e Zona Controlada (conforme Anexo II da NR-10)",
      "Cabines primárias e subestações de média/alta tensão",
      "Pátio de manobra e transformadores de força",
      "Quadros e painéis elétricos industriais energizados",
      "Não há exposição / Não aplicável",
    ],
    limitesIsencao: [
      "Instalações elétricas totalmente desenergizadas e liberadas para trabalho conforme as 10 etapas do item 10.5 da NR-10.",
      "Circuitos alimentados em Extra-Baixa Tensão (tensão ≤ 50V em CA ou ≤ 120V em CC).",
      "Operação com aparelhos eletrodomésticos, troca de lâmpadas residenciais comuns e conexão de plugues em tomadas convencionais protegidas (Item 2, alínea 'd' do Anexo 4).",
    ],
  },
  {
    id: "anexo5",
    codigo: "Anexo 5",
    titulo: "Motocicleta e Veículos de Duas Rodas",
    subtitulo: "Atividades laborais desempenhadas com utilização de motocicleta ou motoneta em vias públicas",
    legislacao: "Portaria MTE nº 1.565/2014, Art. 193, § 4º da CLT",
    icone: "Bike",
    perguntasNormativas: [
      {
        id: "mot_1",
        pergunta: "Utiliza motocicleta, motoneta ou ciclomotor em vias públicas para entregas, coletas, fiscalização, suporte técnico ou serviços externos?",
        itemNorma: "Item 1 (Uso de motocicleta em vias públicas)",
        areaRiscoSugerida: "Ruas, avenidas, estradas e rodovias públicas utilizadas no trajeto de trabalho.",
        justificativaPadrao: "O empregado conduz habitualmente motocicleta/motoneta em vias públicas no exercício de suas atribuições profissionais (entregas, fiscalização ou visitas técnicas), exposto permanentemente ao tráfego de veículos e risco crítico de sinistros de trânsito.",
        medidasRecomendadas: [
          "Uso de capacete motociclístico regulamentado pelo CONTRAN com viseira transparente e adesivos refletivos.",
          "Colete de alta visibilidade com elementos retrorrefletivos.",
          "Manutenção preventiva periódica do veículo (pneus, freios, iluminação e transmissão).",
          "CNH categoria 'A' válida e curso de motofrete/mototaxi quando exigível pelo município.",
        ],
      },
    ],
    areasRiscoPadrao: [
      "Vias públicas municipais, estaduais e federais no perímetro de trabalho",
      "Não há circulação em vias públicas / Não aplicável",
    ],
    limitesIsencao: [
      "Uso de motocicleta estritamente no percurso da residência para o local de trabalho e vice-versa (in itinere).",
      "Atividades em vias privadas que não tenham circulação de veículos de terceiros ou em locais fechados sem circulação pública (Item 2, alínea 'b').",
      "Uso eventual ou fortuito, assim considerado o que não faz parte das obrigações funcionais do trabalhador.",
    ],
  },
  {
    id: "anexoRad",
    codigo: "Anexo (*)",
    titulo: "Radiações Ionizantes",
    subtitulo: "Atividades com exposição a radiações ionizantes ou substâncias radioativas",
    legislacao: "Portaria MTE nº 518/2003, NR-16 Anexo (*) e Normas Regulatórias da CNEN (Comissão Nacional de Energia Nuclear)",
    icone: "Radioactive",
    perguntasNormativas: [
      {
        id: "rad_1",
        pergunta: "Opera equipamentos de radiografia industrial (Gamagrafia / Ensaios Não Destrutivos com fontes de Ir-192, Se-75 ou Co-60)?",
        itemNorma: "Quadro nº 1, Item 1, alínea 'b' (Gamagrafia Industrial)",
        areaRiscoSugerida: "Área de isolamento radiológico calculada e delimitada com cordão de segurança e sinalização trifólio.",
        justificativaPadrao: "Operação direta de fontes seladas de alta atividade para ensaios não destrutivos de soldas e estruturas, com exposição a feixes gama de alta penetração.",
        medidasRecomendadas: [
          "Supervisão por Supervisor de Radioproteção qualificado pela CNEN.",
          "Monitoração individual obrigatória com dosímetro TLD/OSL e monitor de taxa de dose calibrado.",
          "Cálculo prévio da barreira de isolamento para taxa de dose de no máximo 2,5 µSv/h na linha de controle.",
        ],
      },
      {
        id: "rad_2",
        pergunta: "Opera aparelhos de raios-X em diagnóstico médico/odontológico ou veterinário permanecendo na sala durante o disparo?",
        itemNorma: "Quadro nº 1, Item 1, alínea 'd' e Portaria MTE 518/2003",
        areaRiscoSugerida: "Sala de exames e área controlada da unidade radiológica.",
        justificativaPadrao: "Permanência na sala de exames durante a emissão do feixe de radiação sem biombo plumbífero fixo de proteção integral.",
        medidasRecomendadas: [
          "Disparo atrás de biombo com vidro plumbífero equivalente a 2,0 mmPb.",
          "Avental de chumbo (0,5 mmPb), protetor de tireoide e óculos plumbíferos quando necessária contenção do paciente.",
          "Dosimetria individual mensal com relatório de doses arquivado por 30 anos.",
        ],
      },
    ],
    areasRiscoPadrao: [
      "Área Controlada e Área Supervisionada (conforme norma CNEN-NN-3.01)",
      "Sala de exames radiológicos e aceleradores lineares",
      "Área de isolamento da gamagrafia industrial",
      "Não há exposição / Não aplicável",
    ],
    limitesIsencao: [
      "Operação com fontes radioativas seladas encapsuladas em blindagens certificadas de transporte.",
      "Operação de raio-X médico/odontológico em comando remoto externo à sala de exames devidamente blindada e aprovada pela Vigilância Sanitária.",
    ],
  },
];

// Presets de 1-clique para preenchimento rápido em campo
export interface Nr16CargoPreset {
  cargoNome: string;
  palavrasChave: string[];
  resultadoGlobal: "Periculosidade Caracterizada (Adicional 30%)" | "Periculosidade Descaracterizada (Não Enseja Adicional)" | "Isenção Normativa";
  anexoPrincipal: "anexo1" | "anexo2" | "anexo3" | "anexo4" | "anexo5" | "anexoRad" | "nenhum";
  itemNormativo: string;
  areaRisco: string;
  tempoExposicao: "Habitual e Permanente" | "Intermitente" | "Eventual / Fortuito" | "Não Exposto";
  frequencia: string;
  atividadesExecutadas: string;
  fundamentacaoTecnica: string;
  parecerConclusivo: string;
  baseLegal: string;
  recomendacoes: string[];
}

export const NR16_CARGOS_PRESETS: Nr16CargoPreset[] = [
  {
    cargoNome: "Frentista / Operador de Pista de Combustível",
    palavrasChave: ["frentista", "abastecedor", "combustivel", "posto", "lubrificador"],
    resultadoGlobal: "Periculosidade Caracterizada (Adicional 30%)",
    anexoPrincipal: "anexo2",
    itemNormativo: "Anexo 2, Item 1, alínea 'm' e Item 3, alínea 'q' (Operações em postos de serviços e bombas de abastecimento)",
    areaRisco: "Círculo com raio de 7,5 metros com centro nas bombas de abastecimento de combustíveis líquidos.",
    tempoExposicao: "Habitual e Permanente",
    frequencia: "Jornada integral (8h/dia)",
    atividadesExecutadas: "Realiza o abastecimento de veículos automotores (gasolina, etanol, diesel) através de bicos automáticos de bombas medidoras, checagem de fluidos, calibragem de pneus e recebimento de pagamentos na pista de serviço.",
    fundamentacaoTecnica: "O profissional exerce suas atividades dentro da área de risco regulamentar de 7,5 metros com centro nas bombas de abastecimento de combustíveis líquidos, de acordo com o Anexo 2 da NR-16 da Portaria MTP nº 3.214/78. O contato é habitual e permanente durante toda a jornada.",
    parecerConclusivo: "FAZ JUS AO ADICIONAL DE PERICULOSIDADE DE 30% sobre o salário-base, em conformidade com o Artigo 193, Inciso I da CLT e Anexo 2 da NR-16.",
    baseLegal: "Art. 193, I da CLT; NR-16 Anexo 2, Item 1, alínea 'm'; Súmula 364 do TST.",
    recomendacoes: [
      "Garantir treinamento periódico da NR-20 (Mínimo Básico/Intermediário de 8h/16h).",
      "Fornecimento e fiscalização de uniformes 100% algodão e calçado de segurança antiestático.",
      "Manter extintores de incêndio tipo Pó ABC desobstruídos e com inspeção mensal.",
    ],
  },
  {
    cargoNome: "Eletricista de Manutenção / Baixa e Média Tensão",
    palavrasChave: ["eletricista", "eletrotécnico", "eletrônica", "eletricidade", "força"],
    resultadoGlobal: "Periculosidade Caracterizada (Adicional 30%)",
    anexoPrincipal: "anexo4",
    itemNormativo: "Anexo 4, Item 1, alíneas 'a', 'b' e 'c' (Trabalho com circuitos elétricos energizados e proximidade de partes vivas desprotegidas)",
    areaRisco: "Zona de Risco e Zona Controlada em torno de quadros elétricos, disjuntores, barramentos e cabines de força.",
    tempoExposicao: "Habitual e Permanente",
    frequencia: "Rotina diária com intervenções elétricas (4h a 8h/dia)",
    atividadesExecutadas: "Realiza manutenção preventiva e corretiva em instalações elétricas, quadros de distribuição (QGBT), comandos de motores, troca de disjuntores, medições com multímetro/alicate volt-amperímetro em circuitos energizados e passagem de fiação.",
    fundamentacaoTecnica: "O trabalhador atua diretamente em circuitos elétricos energizados de baixa tensão (> 50V em CA) e dentro da zona de risco/controlada, com risco permanente de choque elétrico por contato e arcos elétricos térmicos com liberação de alta energia.",
    parecerConclusivo: "FAZ JUS AO ADICIONAL DE PERICULOSIDADE DE 30% sobre o salário-base, em conformidade com o Artigo 193, Inciso I da CLT e Anexo 4 da NR-16 da Portaria MTE nº 1.078/2014.",
    baseLegal: "Art. 193, I da CLT; NR-16 Anexo 4; NR-10 Item 10.2; Súmula 364 do TST.",
    recomendacoes: [
      "Obrigatoriedade de curso de NR-10 Básico (40h) e NR-10 SEP quando aplicável, com reciclagem a cada 2 anos.",
      "Implementar e auditar o Procedimento LOTO de Desenergização Segura (10 etapas da NR-10).",
      "Fornecer vestimenta com proteção contra arco elétrico (ATPV categoria 2), luvas de borracha isolantes (Classe 0 / 1000V) com luva de cobertura em vaqueta.",
    ],
  },
  {
    cargoNome: "Motoboy / Entregador / Motociclista Profissional",
    palavrasChave: ["motoboy", "moto", "entregador", "motociclista", "motofrete", "courrier"],
    resultadoGlobal: "Periculosidade Caracterizada (Adicional 30%)",
    anexoPrincipal: "anexo5",
    itemNormativo: "Anexo 5, Item 1 (Atividades laborais desempenhadas com utilização de motocicleta ou motoneta em vias públicas)",
    areaRisco: "Vias públicas urbanas, avenidas e rodovias percorridas no desempenho das atividades de entrega e transporte.",
    tempoExposicao: "Habitual e Permanente",
    frequencia: "Jornada integral (6h a 8h/dia em trânsito)",
    atividadesExecutadas: "Conduz motocicleta/motoneta para coleta e entrega de mercadorias, documentos, peças, correspondências ou atendimento técnico a clientes em vias públicas.",
    fundamentacaoTecnica: "A atividade é desempenhada habitualmente com o uso de motocicleta em vias públicas urbanas e rodoviárias, sujeitando o condutor ao risco contínuo de colisão, atropelamento e acidentes viários de alta gravidade.",
    parecerConclusivo: "FAZ JUS AO ADICIONAL DE PERICULOSIDADE DE 30% sobre o salário-base, em conformidade com o Artigo 193, § 4º da CLT e Anexo 5 da NR-16 da Portaria MTE nº 1.565/2014.",
    baseLegal: "Art. 193, § 4º da CLT; Portaria MTE nº 1.565/2014; NR-16 Anexo 5.",
    recomendacoes: [
      "Fornecer capacete integral com selo do INMETRO, viseira cristal e faixas refletivas.",
      "Colete com material retrorrefletivo de alta visibilidade.",
      "Exigir e manter atualizada a CNH na categoria 'A' e curso especializado de motofrete conforme Resolução CONTRAN.",
      "Cronograma rigoroso de manutenção mecânica preventiva da motocicleta.",
    ],
  },
  {
    cargoNome: "Vigilante Patrimonial / Segurança Armada ou Desarmada",
    palavrasChave: ["vigilante", "guarda", "seguranca", "vigia patrimonial", "escolta", "armado"],
    resultadoGlobal: "Periculosidade Caracterizada (Adicional 30%)",
    anexoPrincipal: "anexo3",
    itemNormativo: "Anexo 3, Item 1 e 2, alínea 'a' (Vigilância patrimonial em postos de serviço e estabelecimentos)",
    areaRisco: "Perímetro total do posto de serviço e vias de ronda do estabelecimento vigiado.",
    tempoExposicao: "Habitual e Permanente",
    frequencia: "Escala 12x36 ou 44h semanais",
    atividadesExecutadas: "Executa a vigilância e guarda patrimonial das instalações, controle de acessos, rondas perimetrais preventivas, intervenção em situações suspeitas e defesa do patrimônio e pessoas.",
    fundamentacaoTecnica: "O profissional atua na segurança patrimonial com cadastro e certificação da Polícia Federal, exposto permanentemente a assaltos, invasões armadas e violência física no posto de serviço.",
    parecerConclusivo: "FAZ JUS AO ADICIONAL DE PERICULOSIDADE DE 30% sobre o salário-base, em conformidade com o Artigo 193, Inciso II da CLT e Anexo 3 da NR-16.",
    baseLegal: "Art. 193, II da CLT; Lei Federal nº 12.740/2012; NR-16 Anexo 3 da Portaria MTE nº 1.885/2013.",
    recomendacoes: [
      "Disponibilização de colete de proteção balística individual nível II-A com termo de entrega e CA/validade.",
      "Reciclagem periódica do Curso de Formação de Vigilantes em academia credenciada na PF.",
      "Sistema de acionamento de emergência / botão de pânico conectado com central de monitoramento.",
    ],
  },
  {
    cargoNome: "Operador de Empilhadeira a GLP (com troca de cilindro P-20)",
    palavrasChave: ["empilhadeira", "operador de empilhadeira", "glp", "empilhador"],
    resultadoGlobal: "Periculosidade Caracterizada (Adicional 30%)",
    anexoPrincipal: "anexo2",
    itemNormativo: "Anexo 2, Item 1, alínea 'j' e Item 3, alínea 'q' (Operações de conexão, desconexão e troca de cilindro de gás inflamável GLP)",
    areaRisco: "Raio de 3 metros da central de armazenamento e ponto de substituição de cilindros de GLP.",
    tempoExposicao: "Intermitente",
    frequencia: "Diária (troca de 1 a 3 cilindros por turno)",
    atividadesExecutadas: "Opera empilhadeira para movimentação de pallets e mercadorias e realiza a substituição periódica dos botijões de gás liquefeito de petróleo (P-20) na central de gás da empresa.",
    fundamentacaoTecnica: "A troca de botijões de GLP expõe o operador diretamente à área de risco de 3 metros durante o desengate e engate de conexões com gás pressurizado inflamável, configurando periculosidade por exposição intermitente habitual, nos termos da Súmula 364 do TST.",
    parecerConclusivo: "FAZ JUS AO ADICIONAL DE PERICULOSIDADE DE 30% sobre o salário-base durante o período em que realizar a troca dos cilindros de GLP.",
    baseLegal: "Art. 193, I da CLT; NR-16 Anexo 2, Item 1, alínea 'j'; Súmula 364 do TST.",
    recomendacoes: [
      "Instalar central de troca com aterramento e piso antiestático.",
      "Fornecer luvas térmicas criogênicas/antichama e óculos de ampla visão.",
      "Treinamento prático de operação segura e verificação de vazamento com água e sabão neutro.",
    ],
  },
  {
    cargoNome: "Almoxarife / Estoquista (Produtos em Recipientes Lacrados até 200L)",
    palavrasChave: ["almoxarife", "estoquista", "expedição", "almoxarifado", "repositor"],
    resultadoGlobal: "Isenção Normativa",
    anexoPrincipal: "anexo2",
    itemNormativo: "Anexo 2, Item 4 (Não são consideradas perigosas as atividades em depósitos onde inflamáveis são armazenados em recipientes certificados até 200L)",
    areaRisco: "Não caracterizada área de risco nos termos do Item 4 do Anexo 2 da NR-16.",
    tempoExposicao: "Não Exposto",
    frequencia: "Jornada habitual no depósito",
    atividadesExecutadas: "Recepciona, confere, armazena e distribui tintas, solventes e óleos devidamente lacrados em recipientes comerciais originais fechados de até 200 litros (latas, bombonas e tambores certificados).",
    fundamentacaoTecnica: "O armazenamento de líquidos inflamáveis em recipientes certificados de até 200 litros devidamente lacrados é expressamente isento da caracterização de periculosidade pela Portaria MTE nº 1.357/2019 e Item 4 do Anexo 2 da NR-16.",
    parecerConclusivo: "NÃO CARACTERIZADA A PERICULOSIDADE. Não enseja o pagamento do adicional de 30% devido ao enquadramento nos limites de isenção normativa.",
    baseLegal: "Portaria MTE nº 1.357/2019; NR-16 Anexo 2, Item 4.",
    recomendacoes: [
      "Manter os recipientes estritamente lacrados até o momento da utilização nos setores operacionais.",
      "Ventilação natural constante no depósito e bacias de contenção móveis para eventuais avarias.",
    ],
  },
  {
    cargoNome: "Motorista de Caminhão / Carreta (Tanque Original de Combustível)",
    palavrasChave: ["motorista", "carreteiro", "caminhoneiro", "manobreiro", "chofer"],
    resultadoGlobal: "Isenção Normativa",
    anexoPrincipal: "anexo2",
    itemNormativo: "Anexo 2, Item 4.1 e 4.2 (Tanques de combustível originais e suplementares certificados pelo CONTRAN para propulsão do veículo)",
    areaRisco: "Não caracterizada área de risco nos termos da Portaria SEPRT nº 1.357/2019.",
    tempoExposicao: "Não Exposto",
    frequencia: "Jornada de direção rodoviária",
    atividadesExecutadas: "Conduz caminhão/cavalo mecânico para transporte de cargas gerais. O abastecimento do veículo é realizado por frentistas em postos terceirizados autorizados.",
    fundamentacaoTecnica: "Os tanques de combustível originais de fábrica e suplementares certificados pelo CONTRAN destinados à propulsão do próprio veículo não geram periculosidade, conforme redação expressa dada pela Portaria MTE nº 1.357/2019 ao Item 4.1 do Anexo 2 da NR-16.",
    parecerConclusivo: "NÃO CARACTERIZADA A PERICULOSIDADE. Não enseja o pagamento do adicional de 30% em virtude da isenção normativa expressa para tanques de consumo próprio.",
    baseLegal: "NR-16 Anexo 2, Itens 4.1 e 4.2 (Portaria SEPRT nº 1.357/2019); Art. 193 da CLT.",
    recomendacoes: [
      "Orientar o motorista a permanecer fora da zona de 7,5m durante o abastecimento efetuado por frentistas nos postos de combustíveis.",
      "Manter o tacógrafo e certificados de inspeção veicular sempre vigentes.",
    ],
  },
  {
    cargoNome: "Auxiliar Administrativo / Escritório / Gestão em Geral",
    palavrasChave: ["administrativo", "assistente", "recepcao", "escritorio", "secretaria", "financeiro", "rh", "gerente", "analista", "contador"],
    resultadoGlobal: "Periculosidade Descaracterizada (Não Enseja Adicional)",
    anexoPrincipal: "nenhum",
    itemNormativo: "Não há enquadramento em nenhum dos Anexos da NR-16",
    areaRisco: "Não caracterizada nenhuma área de risco normativo.",
    tempoExposicao: "Não Exposto",
    frequencia: "Sem contato com agentes periculosos",
    atividadesExecutadas: "Trabalho técnico/administrativo desenvolvido exclusivamente em ambiente de escritório, com digitação, atendimento telefônico, conferência documental e gestão de dados em computador.",
    fundamentacaoTecnica: "A função não desempenha atividades e operações perigosas com explosivos, inflamáveis em quantidades de risco, vigilância armada/patrimonial, energia elétrica em SEP/BT energizada, motocicleta em vias públicas ou radiações ionizantes.",
    parecerConclusivo: "NÃO CARACTERIZADA A PERICULOSIDADE. As atividades são isentas de agentes periculosos, não ensejando o direito ao adicional de 30% da NR-16.",
    baseLegal: "Art. 193 da CLT; Portaria MTP nº 3.214/1978, NR-16.",
    recomendacoes: [
      "Manter condições ergonômicas adequadas no posto de trabalho conforme NR-17.",
      "Garantir iluminação e conforto térmico adequados aos ambientes administrativos.",
    ],
  },
  {
    cargoNome: "Operador de Produção / Máquinas em Geral (Sem Inflamáveis/SEP)",
    palavrasChave: ["operador", "montador", "ajudante", "auxiliar de producao", "embalador", "torneiro", "usinagem"],
    resultadoGlobal: "Periculosidade Descaracterizada (Não Enseja Adicional)",
    anexoPrincipal: "nenhum",
    itemNormativo: "Não há enquadramento nos Anexos da NR-16",
    areaRisco: "Não caracterizada área de risco da NR-16 no ambiente de linha produtiva.",
    tempoExposicao: "Não Exposto",
    frequencia: "Sem contato com agentes periculosos",
    atividadesExecutadas: "Operação de máquinas industriais de corte/dobra/embalagem, abastecimento de matéria-prima e montagem de componentes na linha fabril.",
    fundamentacaoTecnica: "As atividades industriais desenvolvidas não envolvem substâncias explosivas, inflamáveis além dos limites de isenção, circuitos elétricos energizados (atuações de manutenção são de equipe especializada externa), vigilância ou veículos de duas rodas em vias públicas.",
    parecerConclusivo: "NÃO CARACTERIZADA A PERICULOSIDADE. A função não se enquadra nos preceitos do Artigo 193 da CLT e anexos da NR-16.",
    baseLegal: "Artigo 193 da CLT; Portaria MTE nº 3.214/78, NR-16.",
    recomendacoes: [
      "Manter as proteções fixas e móveis das máquinas conforme NR-12.",
      "Uso regular dos EPIs indicados no PGR (óculos, protetor auricular e luvas mecânicas).",
    ],
  },
  {
    cargoNome: "Técnico de Radiologia / Operador de Raio-X em Geral",
    palavrasChave: ["radiologia", "raio-x", "radiologista", "gamagrafia", "nuclear"],
    resultadoGlobal: "Periculosidade Caracterizada (Adicional 30%)",
    anexoPrincipal: "anexoRad",
    itemNormativo: "Anexo (*) da NR-16 (Portaria MTE nº 518/2003) e Normas CNEN",
    areaRisco: "Sala de exames radiológicos e área controlada da unidade.",
    tempoExposicao: "Habitual e Permanente",
    frequencia: "Jornada legal especializada (4h a 6h/dia)",
    atividadesExecutadas: "Posicionamento de pacientes/peças e operação de aparelhos emissores de radiação ionizante (raios-X ou fontes gama) para obtenção de imagens radiológicas diagnósticas ou ensaios industriais.",
    fundamentacaoTecnica: "Atividade com exposição a fontes emissoras de radiação eletromagnética ionizante em área controlada/supervisionada com potencial absorção de dose equivalente.",
    parecerConclusivo: "FAZ JUS AO ADICIONAL DE PERICULOSIDADE DE 30% sobre o salário-base ou adicional de radiação correspondente nos termos da legislação federal específica e Portaria MTE nº 518/2003.",
    baseLegal: "Portaria MTE nº 518/2003; Lei Federal nº 7.394/1985; Normas CNEN-NN-3.01.",
    recomendacoes: [
      "Controle de dose através de dosímetro termoluminescente (TLD/OSL) de uso individual obrigatório.",
      "Uso de biombo plumbífero e EPIs de chumbo certificados.",
      "Levantamento radiométrico anual da sala de exames com relatório arquivado.",
    ],
  },
];

export function criarNr16AvaliacaoPadrao(
  funcaoId: string,
  funcaoNome: string,
  setorNome?: string,
  descricaoAtividades?: string
): Nr16AvaliacaoItem {
  // Procura preset inteligente por similaridade de nome
  const nomeLower = (funcaoNome || "").toLowerCase();
  const preset = NR16_CARGOS_PRESETS.find((p) =>
    p.palavrasChave.some((kw) => nomeLower.includes(kw))
  );

  // Anexos base
  const anexosMap: Record<string, Nr16AnexoItem> = {};
  NR16_ANEXOS.forEach((anx) => {
    anexosMap[anx.id] = {
      anexoId: anx.id,
      anexoNome: `${anx.codigo} - ${anx.titulo}`,
      enquadrado: false,
      status: "Descaracterizada",
      itemEspecifico: "Não há exposição normativa",
      descricaoAtividade: "Não desempenha atividades contempladas neste anexo.",
      areaRisco: "Não caracterizada área de risco",
      tempoExposicao: "Não Exposto",
      frequenciaTempo: "Sem contato",
      fundamentacaoTecnica: "Ausência de agentes e condições periculosas relativas a este anexo.",
      medidasPrevenconais: "Manter as condições regulares de trabalho.",
    };
  });

  if (preset && preset.anexoPrincipal !== "nenhum" && anexosMap[preset.anexoPrincipal]) {
    const isEnquadrado = preset.resultadoGlobal === "Periculosidade Caracterizada (Adicional 30%)";
    const status = isEnquadrado ? "Caracterizada" : preset.resultadoGlobal === "Isenção Normativa" ? "Isenção Normativa" : "Descaracterizada";

    anexosMap[preset.anexoPrincipal] = {
      ...anexosMap[preset.anexoPrincipal],
      enquadrado: isEnquadrado,
      status,
      itemEspecifico: preset.itemNormativo,
      descricaoAtividade: preset.atividadesExecutadas,
      areaRisco: preset.areaRisco,
      tempoExposicao: preset.tempoExposicao,
      frequenciaTempo: preset.frequencia,
      fundamentacaoTecnica: preset.fundamentacaoTecnica,
      medidasPrevenconais: preset.recomendacoes.join(" "),
    };

    return {
      id: `nr16-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      funcaoId,
      funcaoNome,
      setorNome: setorNome || "",
      atividadesExecutadas: descricaoAtividades || preset.atividadesExecutadas,
      resultadoGlobal: preset.resultadoGlobal,
      anexosCaracterizados: isEnquadrado ? [`${NR16_ANEXOS.find(a => a.id === preset.anexoPrincipal)?.codigo} - ${NR16_ANEXOS.find(a => a.id === preset.anexoPrincipal)?.titulo}`] : [],
      anexos: anexosMap,
      parecerTecnicoConclusivo: preset.parecerConclusivo,
      baseLegal: preset.baseLegal,
      recomendacoesSST: preset.recomendacoes,
      fotos: [],
      dataAvaliacao: new Date().toLocaleDateString("pt-BR"),
    };
  }

  // Padrão Geral Descaracterizado
  return {
    id: `nr16-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    funcaoId,
    funcaoNome,
    setorNome: setorNome || "",
    atividadesExecutadas: descricaoAtividades || "Execução das atribuições rotineiras do cargo no estabelecimento da empresa.",
    resultadoGlobal: "Periculosidade Descaracterizada (Não Enseja Adicional)",
    anexosCaracterizados: [],
    anexos: anexosMap,
    parecerTecnicoConclusivo: "NÃO CARACTERIZADA A PERICULOSIDADE. As atividades e locais de trabalho inspecionados não se enquadram em nenhum dos Anexos da NR-16 da Portaria MTP nº 3.214/78, não ensejando o pagamento do adicional de 30%.",
    baseLegal: "Artigo 193 da CLT e Portaria MTP nº 3.214/1978 (NR-16).",
    recomendacoesSST: [
      "Manter o monitoramento contínuo das rotinas de trabalho e ambiente operacional.",
      "Garantir o uso obrigatório e fiscalizado dos Equipamentos de Proteção Individual (EPIs) definidos no PGR.",
    ],
    fotos: [],
    dataAvaliacao: new Date().toLocaleDateString("pt-BR"),
  };
}
