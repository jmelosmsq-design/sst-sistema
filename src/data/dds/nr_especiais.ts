import { DdsTemaItem } from "../../types";

export const TEMAS_NR_ESPECIAIS: DdsTemaItem[] = [
  // --- NR-14: Fornos Industriais ---
  {
    id: "dds_nr14_01",
    codigo: "NR14-01",
    titulo: "Segurança na Operação de Fornos Industriais e Carga Térmica (NR-14)",
    categoria: "Fornos e Carga Térmica (NR-14)",
    nrReferencia: "NR-14",
    objetivo: "Sensibilizar sobre os riscos de explosão na ignição de fornos a gás/óleo, queimaduras por radiação infravermelha e estresse térmico.",
    pontosPrincipais: [
      "Realizar a purga prévia obrigatória com ar da câmara de combustão antes de acender qualquer forno a gás ou óleo combustível.",
      "Instalação de sensores de chama com corte automático de combustível em caso de extinção involuntária do fogo.",
      "Uso de vestimentas aluminizadas antichama, capuz com viseira espelhada contra radiação infravermelha e luvas de fibra de aramida.",
      "Revestimento refratário externo isolante para manter a temperatura da carcaça externa dentro dos limites de segurança.",
    ],
    conteudo: `Bom dia a todos! Nosso Diálogo Diário de Segurança de hoje trata da Norma Regulamentadora nº 14 (NR-14) e da Operação Segura de Fornos Industriais, Estufas e Tratamento Térmico de Metais.

Os fornos industriais operam em faixas extremas de temperatura — frequentemente ultrapassando 800ºC, 1.200ºC ou mais — e consomem grandes vazões de gases combustíveis (gás natural, GLP) ou óleo pesado. A operação inadequada dessas instalações pode provocar explosões devastadoras de câmaras de combustão ou queimaduras térmicas extensas nos operadores.

O momento mais crítico e perigoso na operação de um forno é o ACENDIMENTO DA CHAMA. Se o queimador falhou na primeira tentativa e o operador tentar reacender imediatamente sem ventilar a câmara, o gás combustível acumulado no interior do forno entrará em contato com a nova faísca e explodirá com a violência de uma bomba, arrancando portas refratárias e arremessando labaredas. Por isso, a regra inegociável da NR-14 exige a PURGA COMPLETA com ar forçado por vários minutos antes de qualquer tentativa de ignição!

Além disso, a radiação térmica infravermelha emitida pela boca do forno danifica os olhos (catarata precoce) e a pele se não forem utilizadas vestimentas aluminizadas refletivas com viseiras de policarbonato espelhado. Mantenha os sensores de chama sempre limpos e calibrados e nunca obstrua os visores de inspeção. Opere com disciplina térmica e segurança total!`,
    perguntasDebate: [
      "Por que é fundamental realizar a purga com ar antes de reacender a chama de um forno industrial?",
      "Você utiliza a viseira com proteção contra radiação infravermelha ao inspecionar a queima do forno?",
      "Quais são os procedimentos de emergência caso ocorra vazamento de gás no queimador?",
    ],
  },

  // --- NR-16: Atividades e Operações Perigosas ---
  {
    id: "dds_nr16_01",
    codigo: "NR16-01",
    titulo: "Periculosidade com Motocicletas e Deslocamento em Duas Rodas (NR-16 - Anexo 5)",
    categoria: "Atividades Perigosas (NR-16)",
    nrReferencia: "NR-16",
    objetivo: "Sensibilizar motoristas e motoboys que utilizam motocicletas a serviço da empresa sobre pilotagem defensiva e manutenção do veículo.",
    pontosPrincipais: [
      "O trabalho com motocicleta em vias públicas é legalmente classificado como Atividade Perigosa pelo Anexo 5 da NR-16.",
      "O motociclista não tem lataria de proteção: o próprio corpo recebe o impacto direto em caso de colisão ou queda.",
      "Uso obrigatório de Capacete Integral com viseira transparente fechada e selo do Inmetro dentro do prazo de validade.",
      "Proibido costurar em alta velocidade no 'corredor' entre carretas e ônibus nos pontos cegos dos retrovisores.",
    ],
    conteudo: `Olá, equipe! Nosso DDS de hoje aborda o Anexo 5 da Norma Regulamentadora nº 16 (NR-16) e a Segurança na Pilotagem de Motocicletas a Serviço da Empresa.

A profissão e as tarefas executadas com motocicleta proporcionam agilidade incomparável no trânsito urbano, mas cobram um preço altíssimo em termos de vulnerabilidade humana. Em uma moto, não há airbag de proteção, não há célula de sobrevivência de aço e não há cinto de segurança: em qualquer colisão contra um poste, carro ou asfalto, é o corpo do trabalhador que absorve 100% da energia do impacto cinético.

Pilares inegociáveis para o motociclista seguro:
1. Capacete com Selo do Inmetro e Viseira Fechada: o capacete deve ter tamanho exato para sua cabeça (firme sem folgas) e estar com a jugular devidamente afivelada. Pilotar com a viseira aberta ou levantada expõe os olhos a pedras soltas, besouros e ciscos de poeira que causam perda instantânea do controle da moto;
2. Vestimentas Protetoras: use sempre calça de tecido resistente, jaqueta com proteções acolchoadas nos ombros e cotovelos, luvas de couro e botas de cano médio. Em caso de queda, essas roupas evitam o abrasamento doloroso da pele contra o asfalto quente;
3. Respeito aos Pontos Cegos dos Caminhões: nunca permaneça emparelhado ao lado de carretas ou caminhões basculantes. Se você não consegue ver o rosto do motorista pelo retrovisor dele, ele também não está te enxergando!
4. Cautela nos Cruzamentos: nunca confie 100% no semáforo verde; diminua a velocidade e olhe para ambos os lados antes de cruzar. A sua pressa para entregar uma encomenda nunca vale mais do que a sua vida!`,
    perguntasDebate: [
      "Você costuma revisar a calibragem dos pneus, nível de óleo e tensão da corrente da sua moto antes de sair?",
      "Por que pilotar no corredor entre caminhões grandes em alta velocidade é tão perigoso?",
      "O seu capacete possui o selo holográfico do Inmetro e está dentro do prazo de validade recomendado?",
    ],
  },

  // --- NR-24: Condições Sanitárias e de Conforto nos Locais de Trabalho ---
  {
    id: "dds_nr24_01",
    codigo: "NR24-01",
    titulo: "Higiene Pessoal, Conforto nos Vestiários e Refeitórios (NR-24)",
    categoria: "Condições Sanitárias (NR-24)",
    nrReferencia: "NR-24",
    objetivo: "Sensibilizar sobre a conservação das áreas de vivência, higiene dos sanitários, água potável e acondicionamento correto de alimentos.",
    pontosPrincipais: [
      "As instalações sanitárias, vestiários e refeitórios são direitos fundamentais do trabalhador garantidos pela NR-24.",
      "Manter o vaso sanitário, pias e pisos limpos após o uso é um dever cívico e de respeito aos próprios colegas de equipe.",
      "Lavar sempre as mãos com água e sabão antes das refeições e após utilizar o banheiro para evitar contaminações gastrointestinais.",
      "Guardar marmitas e alimentos perecíveis em refrigeradores apropriados para evitar intoxicações alimentares bacterianas.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje trata da Norma Regulamentadora nº 24 (NR-24) e do Cuidado com as Nossas Áreas de Vivência: Vestiários, Banheiros, Refeitórios e Pontos de Água Potável.

O ambiente de trabalho é a nossa segunda casa. Passamos muitas horas do dia convivendo nos mesmos espaços, compartilhando mesas de almoço, chuveiros e sanitários. Ter um local limpo, higienizado, com água fresca e ambiente agradável não é apenas uma exigência legal da NR-24, mas um requisito básico de dignidade e saúde humana.

A manutenção da limpeza das áreas de vivência depende diretamente da postura de cada um de nós:
1. Respeito nos Banheiros: após utilizar o sanitário, dê descarga completa, jogue o papel higiênico dentro da lixeira (nunca no chão ou dentro do vaso para não entupir a rede) e mantenha a tampa e o assento limpos. Lave sempre as mãos com água e sabão líquido ao sair do banheiro;
2. Guarda de Roupas nos Vestiários: mantenha seu armário organizado. Em atividades com poeira ou produtos químicos (NR-24), utilize armários duplos para separar o uniforme sujo da sua roupa civil limpa, impedindo que a contaminação industrial viaje para a sua casa;
3. Higiene no Refeitório: ao terminar de almoçar ou lanchar, recolha seus pratos, talheres e copos, limpe os farelos da mesa e descarte as sobras orgânicas na lixeira correta. Guarde sempre sua marmita na geladeira do refeitório assim que chegar pela manhã para que o calor não estrague a comida;
4. Água Potável: beba água apenas nos bebedouros industriais com filtros higienizados. Nunca encoste a boca diretamente na saída de água do bebedouro para não transmitir bactérias aos colegas. Cuidar do nosso espaço coletivo é cuidar de todos nós!`,
    perguntasDebate: [
      "Como você contribui para manter o refeitório e o vestiário limpos e organizados para o próximo colega?",
      "Você costuma separar o uniforme de trabalho das suas roupas limpas dentro do armário do vestiário?",
      "Por que lavar as mãos antes de se alimentar é uma das regras de saúde mais eficientes contra infecções?",
    ],
  },

  // --- NR-25: Resíduos Industriais ---
  {
    id: "dds_nr25_01",
    codigo: "NR25-01",
    titulo: "Gestão de Resíduos Industriais, Efluentes e Emissões Atmosféricas (NR-25)",
    categoria: "Resíduos Industriais (NR-25)",
    nrReferencia: "NR-25",
    objetivo: "Orientar sobre a segregação na fonte de resíduos sólidos, líquidos e gasosos de origem industrial e a conformidade com as normas ambientais.",
    pontosPrincipais: [
      "A NR-25 determina que resíduos industriais perigosos (Classe I) sejam coletados, tratados e dispostos sem riscos à saúde e ao meio ambiente.",
      "Segregação na fonte: nunca misture estopas embebidas em solvente com lixo comum ou sobras metálicas.",
      "Proibido despejar tintas, óleos ou efluentes químicos na rede pública de esgoto ou de águas pluviais.",
      "Armazenamento de tambores de resíduos perigosos sobre bacias de contenção impermeabilizadas.",
    ],
    conteudo: `Olá a todos! Nosso Diálogo Diário de Segurança de hoje aborda a Norma Regulamentadora nº 25 (NR-25) e o Controle de Resíduos Industriais e Efluentes Químicos no Ambiente Fabril.

Toda atividade industrial gera subprodutos e resíduos durante os processos de usinagem, estamparia, solda, pintura ou montagem. Se esses resíduos forem descartados de maneira inadequada ou misturados aleatoriamente, geram reações químicas perigosas, risco iminente de incêndio espontâneo e contaminação grave do ar, do solo e da água que abastece nossas cidades.

Diretrizes indispensáveis para a correta gestão de resíduos industriais:
1. Segregação Correta na Origem: a separação do lixo deve ser feita exatamente no ponto onde ele é gerado. Estopas sujas de óleo, filtros usados, latas de tinta vazias e embalagens plásticas de produtos químicos são Resíduos Classe I (Perigosos) e devem ir estritamente para os tambores vermelhos/amarelos identificados;
2. Metais e Sucatas: cavacos de usinagem de aço, cobre e alumínio devem ser armazenados em caçambas metálicas secas para posterior reciclagem siderúrgica;
3. Bacias de Contenção Secundária: todos os tambores e tanques contendo efluentes líquidos perigosos devem permanecer sobre bacias de contenção estanques com volume mínimo de 110% da capacidade do maior tanque. Se houver vazamento na carcaça do tambor, o líquido ficará retido dentro da bacia sem tocar o piso de concreto;
4. Proibição de Queimas a Céu Aberto e Despejos Clandestinos: é terminantemente proibido queimar qualquer tipo de resíduo no pátio ou despejar solventes e tintas em ralos de água pluvial. Trate os resíduos da nossa empresa com respeito e responsabilidade ecológica total!`,
    perguntasDebate: [
      "Como é feita a separação dos resíduos industriais perigosos no seu posto de trabalho?",
      "Você sabe o que fazer se uma bacia de contenção de tambores de resíduos estiver com acúmulo de água de chuva?",
      "Por que estopas embebidas em óleo e solvente nunca devem ser jogadas em lixeiras de papelão comum?",
    ],
  },

  // --- NR-36: Segurança e Saúde no Trabalho em Frigoríficos e Abatedouros ---
  {
    id: "dds_nr36_01",
    codigo: "NR36-01",
    titulo: "Segurança em Frigoríficos: Uso de Facas, Luvas de Malha de Aço e Frio (NR-36)",
    categoria: "Frigoríficos e Abates (NR-36)",
    nrReferencia: "NR-36",
    objetivo: "Orientar sobre o uso de facas afiadas com chaira, luva de malha de aço na mão de apoio, avental anticorte e pausas térmicas da NR-36.",
    pontosPrincipais: [
      "O manuseio contínuo de facas afiadas exige o uso obrigatório de Luva de Malha de Aço inoxidável na mão contrária (mão de apoio).",
      "Faca sem fio (cega) exige força muscular excessiva e escorrega com facilidade: manter a lâmina perfeitamente afiada e chairada.",
      "Uso de avental de malha de aço ou plástico rígido no abdômen para proteger contra golpes de faca direcionados ao próprio corpo.",
      "Cumprimento rigoroso das pausas psicofisiológicas e pausas térmicas da NR-36 para recuperação muscular e aquecimento.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje é a Norma Regulamentadora nº 36 (NR-36), com foco na Segurança e Ergonomia nos Trabalhos em Indústrias de Abate e Processamento de Carnes e Derivados (Frigoríficos).

O trabalho em linhas de desossa, cortes e embalagem de carnes envolve uma combinação intensa de riscos: ambiente artificialmente refrigerado (frio), umidade constante nos pisos, manuseio ininterrupto de facas com fio cirúrgico e movimentos rápidos e repetitivos dos membros superiores. Sem proteção e técnica adequadas, o risco de cortes profundos com secção de tendões e lesões musculares é altíssimo.

Normas essenciais de sobrevivência e segurança em frigoríficos:
1. Luva de Malha de Aço na Mão de Apoio: ao manusear a faca com a mão dominante, a outra mão — que segura a peça de carne — DEVE estar protegida por uma luva de malha de elos de aço inoxidável com ajuste no punho. Se a faca escapar por um osso ou gordura, a lâmina baterá no aço sem cortar seus dedos;
2. Avental Protetor Anticorte: para operações onde o corte da carne é feito puxando a faca na direção do próprio corpo (desossa), é obrigatório o uso de avental de malha de aço ou placa plástica rígida cobrindo o peito e o abdômen;
3. Afiação e Manutenção da Faca: uma faca 'cega' é muito mais perigosa do que uma faca afiada, pois obriga o operador a fazer o dobro de força muscular e a fazer movimentos bruscos que provocam escorregões. Mantenha sua faca sempre com o fio perfeito e utilize chaira com proteção de punho;
4. Pausas Térmicas e Ginástica: respeite com rigor os horários das pausas de recuperação térmica previstas na NR-36 (20 minutos a cada 1h40 de trabalho contínuo no frio). Aproveite as pausas para se aquecer na sala de descanso climatizada, tomar bebidas quentes e alongar os ombros e punhos. Proteja seu corpo no frio!`,
    perguntasDebate: [
      "A sua luva de malha de aço está no tamanho correto e ajustada confortavelmente na mão de apoio?",
      "Você costuma chairar e calibrar o fio da sua faca de desossa antes de começar a produção?",
      "Como você aproveita os intervalos de pausas térmicas e ergonômicas para relaxar a musculatura?",
    ],
  },
];
