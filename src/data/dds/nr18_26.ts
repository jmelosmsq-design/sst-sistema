import { DdsTemaItem } from "../../types";

export const TEMAS_NR18_26: DdsTemaItem[] = [
  // --- NR-18: Segurança e Saúde no Trabalho na Indústria da Construção ---
  {
    id: "dds_nr18_01",
    codigo: "NR18-01",
    titulo: "Andaimes Tubulares e Fachadeiros: Montagem e Uso Seguro (NR-18)",
    categoria: "Construção Civil (NR-18)",
    nrReferencia: "NR-18",
    objetivo: "Orientar sobre a estabilidade, travamento, forração completa do piso, rodapés e guarda-corpos em andaimes na construção civil.",
    pontosPrincipais: [
      "Andaimes devem ser montados sobre sapatas rígidas e niveladas, com travamentos diagonais (cruzetas) e ancoragem na estrutura do edifício.",
      "O piso de trabalho deve ser 100% metálico antiderrapante ou com pranchas de madeira travadas, sem vãos ou frestas.",
      "Guarda-corpo duplo obrigatório: travessão superior a 1,20 m, travessão intermediário a 0,70 m e rodapé de 15 a 20 cm.",
      "Proibido sobrecarregar o andaime com excesso de blocos, argamassa ou pessoas além do limite de carga da placa.",
    ],
    conteudo: `Bom dia a todos! Hoje nosso Diálogo Diário de Segurança aborda a Norma Regulamentadora nº 18 (NR-18) e o trabalho seguro em Andaimes Tubulares e Fachadeiros na Indústria da Construção.

O andaime é a estrutura provisória que nos permite executar alvenaria, reboco, pintura de fachadas, instalações elétricas e hidráulicas em alturas elevadas. No entanto, a montagem inadequada ou o uso negligente de andaimes é responsável por um número alarmante de acidentes fatais por queda de altura e desabamento de estruturas em canteiros de obras.

Para que um andaime seja considerado seguro para uso conforme a NR-18 e a NR-35, ele deve cumprir requisitos técnicos rigorosos:
1. Base e Fundação: os montantes verticais devem se apoiar sobre sapatas metálicas com placas de base rígidas sobre solo nivelado e compactado. É terminantemente proibido calçar pés de andaimes com pedaços soltos de madeira, tijolos furados, blocos de concreto ou latas de tinta!
2. Travamento e Ancoragem: as torres de andaime devem receber travamentos diagonais em 'X' (cruzetas de contraventamento) em todos os lances e ser amarradas e ancoradas solidamente na estrutura permanente da edificação para suportar a força dos ventos;
3. Piso de Trabalho sem Vãos: o piso onde o trabalhador pisa deve ser totalmente forrado, antiderrapante e travado nas extremidades para evitar o efeito de 'gangorra'. Não podem existir frestas por onde ferramentas ou pés possam escorregar;
4. Sistema de Proteção Coletiva: o andaime precisa ter guarda-corpo rígido com travessão superior a 1,20 m, travessão intermediário a 0,70 m e rodapé de 15 a 20 cm na base para impedir que ferramentas e pedras rolem do piso e caiam sobre quem está embaixo.
5. Liberação Formal: antes de subir no andaime no início de cada jornada, verifique a placa de liberação: Placa Verde = Liberado; Placa Vermelha = Interditado/Em Manutenção. E nunca se esqueça: o uso do cinto tipo paraquedista ancorado em linha de vida independente é obrigatório!`,
    perguntasDebate: [
      "Você confere a placa de liberação verde antes de acessar qualquer andaime no canteiro?",
      "Você já encontrou andaimes com calços improvisados de tijolos e o que fez ao constatar o risco?",
      "Por que o rodapé de 15-20 cm na borda do piso do andaime é tão importante para proteger os colegas no solo?",
    ],
  },
  {
    id: "dds_nr18_02",
    codigo: "NR18-02",
    titulo: "Escavações, Valas e Estabilidade de Taludes (NR-18)",
    categoria: "Construção Civil (NR-18)",
    nrReferencia: "NR-18",
    objetivo: "Sensibilizar sobre os riscos mortais de soterramento em abertura de valas e a necessidade de escoramento de taludes.",
    pontosPrincipais: [
      "A terra é extremamente pesada: 1 metro cúbico de solo úmido pesa cerca de 1,5 a 1,8 tonelada (peso de um carro).",
      "Escavações com mais de 1,25 m de profundidade exigem escoramento com pranchões e estroncas metálicas ou inclinação segura do talude.",
      "Manter a terra escavada e materiais pesados a pelo menos 1,0 metro de distância da borda da vala.",
      "Instalação obrigatória de escadas ou rampas de acesso para saída rápida de emergência.",
    ],
    conteudo: `Olá, equipe! O tema do nosso DDS de hoje é a Segurança em Escavações, Valas e Abertura de Tubulações em Obras, conforme estabelece a NR-18.

O soterramento em valas é um dos acidentes mais silenciosos e fatais da construção civil. Uma pessoa soterrada até o peito por uma camada de terra não consegue expandir a caixa torácica para respirar devido à compressão brutal do solo, vindo a óbito por asfixia em menos de 3 a 5 minutos, antes mesmo que os colegas consigam pegar pás para cavar. Muitas pessoas subestimam o peso da terra: apenas um metro cúbico de solo escavado pesa entre 1.500 e 1.800 quilos!

Para garantir que nenhuma vala se transforme em uma armadilha, devemos aplicar as regras essenciais da NR-18:
1. Escoramento e Entroncamento: qualquer escavação com profundidade superior a 1,25 metro em solo instável deve possuir contenção lateral com pranchões de madeira e estroncas metálicas (blindagem de vala) ou possuir talude inclinado com ângulo de repouso calculado por engenheiro geotécnico;
2. Borda Livre e Afastamento: todo o material retirado da escavação (bota-fora), bem como tubos pesados e máquinas em movimento (retroescavadeiras, caminhões basculantes), devem permanecer a uma distância mínima de segurança de 1 metro da borda da vala para não sobrecarregar as paredes laterais;
3. Rotas de Fuga e Acessos: em valas com mais de 1,25 m, é obrigatória a instalação de escadas de mão ou rampas próximas aos postos de trabalho para permitir uma evacuação rápida caso a terra comece a ceder ou ocorra inundação repentina por rompimento de tubulações subterrâneas;
4. Identificação de Redes Subterrâneas: antes de iniciar qualquer escavação mecânica, consulte a planta de interferências e faça sondagens manuais cuidadosas para localizar redes enterradas de água, esgoto, cabos de fibra óptica e, principalmente, dutos de gás combustível e eletricidade de alta tensão. Escave com segurança e proteja sua vida!`,
    perguntasDebate: [
      "Quais cuidados você toma antes de entrar em uma vala de escavação com mais de 1,25 m de profundidade?",
      "Você mantém a terra escavada e máquinas pesadas afastadas da borda da vala?",
      "O que você faria se percebesse trincas longitudinais no solo ao redor de uma escavação aberta?",
    ],
  },

  // --- NR-20: Segurança e Saúde no Trabalho com Inflamáveis e Combustíveis ---
  {
    id: "dds_nr20_01",
    codigo: "NR20-01",
    titulo: "Inflamáveis e Combustíveis: Vapores, Eletricidade Estática e Aterramento (NR-20)",
    categoria: "Inflamáveis e Combustíveis (NR-20)",
    nrReferencia: "NR-20",
    objetivo: "Explicar como ocorrem as explosões de vapores de líquidos inflamáveis e a obrigatoriedade do aterramento elétrico durante o transvase.",
    pontosPrincipais: [
      "Não é o líquido inflamável que queima ou explode, mas sim a mistura dos seus VAPORES com o oxigênio do ar.",
      "Vapores de gasolina, álcool, tíner e solventes são mais pesados que o ar e se acumulam rentes ao chão, podendo viajar dezenas de metros até uma fonte de ignição.",
      "O atrito do líquido fluindo pela mangueira gera eletricidade estática: o cabo de aterramento equipotencial com garras tipo jacaré é obrigatório.",
      "Proibido fumar, usar ferramentas de aço que geram faíscas ou celulares em áreas classificadas com risco de explosão.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje é a Norma Regulamentadora nº 20 (NR-20), com foco no manuseio seguro de Líquidos Inflamáveis e Combustíveis e no controle da Eletricidade Estática.

Muitas pessoas têm uma percepção equivocada sobre os líquidos inflamáveis: acreditam que a gasolina, o álcool, o diesel, o tíner ou o tolueno pegam fogo no estado líquido. Mas a química e a física nos ensinam que o que realmente queima e explode são os VAPORES liberados pelo líquido que se misturam com o oxigênio do ar na proporção exata da faixa de inflamabilidade (LEL/UEL).

Os vapores de solventes e combustíveis possuem uma característica perigosa: são mais densos e pesados do que o ar atmosférico. Isso significa que eles não sobem; eles descem, escorrem pelo piso, acumulam-se em canaletas, ralos e poços de elevador e podem viajar silenciosamente por 20 ou 30 metros até encontrar uma fonte de ignição distante — como uma faísca de esmeril, um motor elétrico comum, a chama de um fogareiro ou até mesmo a faísca gerada pelo botão de acender uma luz. Ao atingir a faísca, o vapor pega fogo e a chama retorna em velocidade supersônica até o tambor de combustível (efeito flashover/explosão).

Outro perigo invisível e letal é a Eletricidade Estática gerada durante o transvase de líquidos inflamáveis de um tambor para um balde. O simples atrito do líquido escorrendo dentro do funil ou mangueira acumula milhares de volts de carga estática. Quando a quantidade de carga atinge o ponto crítico, salta uma faísca estática invisível que detona os vapores instantaneamente. Por isso, a regra na NR-20 é categórica: SEMPRE CONECTE O CABO DE ATERRAMENTO EQUIPOTENCIAL COM GARRA METÁLICA ENTRE O TAMBOR E O RECIPIENTE RECEPTOR antes de abrir qualquer registro! Armazene inflamáveis apenas em recipientes metálicos de segurança com corta-chama e mantenha o setor 100% ventilado. Respeite os inflamáveis!`,
    perguntasDebate: [
      "Você sempre conecta a garra de aterramento estático antes de transferir solventes ou combustíveis de tambores?",
      "Onde são armazenados os produtos inflamáveis no seu setor e como é a ventilação do local?",
      "Por que é terminantemente proibido utilizar ferramentas de aço que geram centelhas em áreas de pintura ou estoque de solventes?",
    ],
  },

  // --- NR-23: Proteção Contra Incêndios ---
  {
    id: "dds_nr23_01",
    codigo: "NR23-01",
    titulo: "Classes de Fogo e Escolha Correta do Extintor de Incêndio (NR-23)",
    categoria: "Proteção Contra Incêndios (NR-23)",
    nrReferencia: "NR-23",
    objetivo: "Capacitar a equipe a identificar rapidamente as Classes de Incêndio (A, B, C, D, K) e operar o agente extintor correto sem agravar o sinistro.",
    pontosPrincipais: [
      "Classe A: Sólidos combustíveis (madeira, papel, tecido, plástico) — apagar com Água Pressurizada (H2O) ou Pó ABC.",
      "Classe B: Líquidos inflamáveis (gasolina, óleo, tinta, tíner) — NUNCA USAR ÁGUA (usar Pó Químico Seco PQS ou CO2).",
      "Classe C: Equipamentos elétricos energizados (painéis, motores, computadores) — usar CO2 (Gás Carbônico) ou Pó ABC (nunca água condutiva).",
      "Método P.A.S.S. para operar o extintor: Puxar o pino/lacre, Apontar a mangueira para a base do fogo, Apertar o gatilho e Fazer movimento de Varredura suave.",
    ],
    conteudo: `Olá a todos! Nosso DDS de hoje é dedicado à Norma Regulamentadora nº 23 (NR-23) e à Proteção e Combate a Princípios de Incêndio.

Um incêndio descontrolado consome instalações industriais inteiras em questão de minutos e destrói empregos, histórias e vidas. No entanto, quase todo grande incêndio começou como uma pequena chama — um princípio de incêndio que poderia ter sido facilmente apagado nos primeiros 30 segundos se a pessoa que presenciou soubesse exatamente qual extintor utilizar e como operá-lo.

O maior perigo no combate ao fogo é usar o agente extintor errado para a classe de queima. Vamos revisar as classes de fogo com máxima atenção:
1. CLASSE A (Materiais Sólidos): madeira, papel, papelão, tecido, borracha e plásticos. Queimam em superfície e em profundidade, deixando brasas e cinzas. O extintor ideal é Água Pressurizada (AP) por resfriamento ou Pó Químico ABC;
2. CLASSE B (Líquidos e Gases Inflamáveis): álcool, tíner, graxas, tintas e gasolina. Queimam apenas na superfície e não deixam cinzas. NUNCA JOGUE ÁGUA EM FOGO CLASSE B! A água é mais pesada que o óleo; ela afunda, evapora instantaneamente em contato com o calor extremo e faz o líquido inflamável explodir para todos os lados ('boilover'). Use Extintor de Pó Químico (BC ou ABC) ou CO2 (Gás Carbônico);
3. CLASSE C (Equipamentos Elétricos Energizados): quadros de distribuição, disjuntores, transformadores, motores e computadores. NUNCA USE ÁGUA! A água conduz a corrente elétrica do painel diretamente para o operador através do jato, causando choque elétrico fatal. Use Extintor de CO2 (não conduz eletricidade e não danifica componentes eletrônicos) ou Pó ABC.

Como operar o extintor com o método internacional P.A.S.S.:
- P: Puxe a trava e rompa o lacre plástico com um giro firme;
- A: Aponte a ponta da mangueira ou difusor sempre para a BASE das chamas, nunca para o topo do fogo;
- S: Aperte o gatilho até o fim mantendo o extintor na vertical;
- S: Faça movimentos de varredura suave de um lado para o outro cobrindo toda a base do combustível. Lembre-se: em caso de fogo fora de controle ou muita fumaça tóxica, abandone a área imediatamente e acione a Brigada de Incêndio e o Corpo de Bombeiros (193)!`,
    perguntasDebate: [
      "Onde está localizado o extintor mais próximo do seu posto de trabalho e qual é o tipo de agente extintor dele (Água, PQS, CO2 ou ABC)?",
      "O que aconteceria se alguém jogasse um jato de água pressurizada em uma frigideira com óleo pegando fogo ou em um painel elétrico ligado?",
      "Você sabe como romper o lacre e qual a distância segura para se posicionar ao combater um princípio de incêndio?",
    ],
  },
  {
    id: "dds_nr23_02",
    codigo: "NR23-02",
    titulo: "Rotas de Fuga, Portas Corta-Fogo e Plano de Abandono de Emergência",
    categoria: "Proteção Contra Incêndios (NR-23)",
    nrReferencia: "NR-23",
    objetivo: "Orientar sobre a desobstrução permanente de saídas de emergência, sinalização fotoluminescente e conduta em simulações de evacuação.",
    pontosPrincipais: [
      "As rotas de fuga, corredores e escadas de emergência devem permanecer 100% livres de obstáculos e caixas 24 horas por dia.",
      "Portas corta-fogo com barra antipânico nunca devem ser calçadas com cunhas de madeira ou trancadas com cadeados.",
      "Ao soar o alarme de incêndio: mantenha a calma, desligue equipamentos, caminhe rápido (sem correr ou empurrar) e dirija-se ao Ponto de Encontro.",
      "Em caso de fumaça densa: abaixe-se e rasteje próximo ao piso, onde o ar é mais fresco e respirável.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje é o 'Plano de Abandono de Emergência, Rotas de Fuga e Comportamento Seguro em Evacuações', conforme preconiza a NR-23.

Em uma emergência real com fogo, vazamento de gás tóxico ou colapso estrutural, o tempo disponível para evacuar todas as pessoas com segurança é medido em poucos minutos. Numa situação dessas, a fumaça preta e os gases asfixiantes como o monóxido de carbono (CO) e cianeto de hidrogênio sobem para o teto, cortam a iluminação natural e reduzem a visibilidade a zero, provocando pânico e desorientação.

Para que todos consigam sair com vida, o sistema de rotas de fuga deve funcionar com perfeição absoluta:
1. Desobstrução Permanente: NUNCA, sob nenhuma justificativa, deixe pallets, caixas de papelão, carrinhos de transporte, tambores ou materiais temporários depositados nos corredores de saída, escadarias ou em frente a portas de emergência. Um tropeço no escuro durante uma evacuação gera um efeito dominó de pessoas caindo e sendo pisoteadas;
2. Portas Corta-Fogo: as portas corta-fogo instaladas em escadas e divisões de setores têm a função vital de isolar o fogo e a fumaça por 60, 90 ou 120 minutos, permitindo a fuga segura. Essas portas devem permanecer sempre fechadas, mas NUNCA trancadas a chave! É terminantemente proibido colocar calços de madeira, pedras ou extintores para manter a porta aberta;
3. Sinalização Fotoluminescente: repare nas placas verdes com setas e luminárias de emergência nas paredes. Elas brilham no escuro para indicar o caminho seguro até a saída externa;
4. Conduta no Abandono de Área: ao ouvir a sirene de emergência contínua, pare o que estiver fazendo, desligue sua máquina, pegue apenas seus documentos pessoais (se estiverem à mão), não volte para pegar mochilas, não use elevadores em hipótese alguma e caminhe em fila indiana pelas laterais da escada até o Ponto de Encontro Externo. No ponto de encontro, permaneça com seu grupo para a contagem de chamada da brigada. A disciplina na evacuação salva a vida de toda a equipe!`,
    perguntasDebate: [
      "Você sabe qual é a rota de fuga principal e a rota de fuga secundária a partir do seu posto de trabalho?",
      "Onde fica localizado o Ponto de Encontro de Emergência da nossa empresa?",
      "Por que nunca devemos tentar voltar para buscar pertences pessoais durante uma ordem de evacuação de emergência?",
    ],
  },

  // --- NR-26: Sinalização de Segurança e Classificação de Produtos Químicos ---
  {
    id: "dds_nr26_01",
    codigo: "NR26-01",
    titulo: "Sinalização de Segurança, Sistema GHS e Ficha de Dados de Segurança (NR-26)",
    categoria: "Sinalização e Químicos (NR-26)",
    nrReferencia: "NR-26",
    objetivo: "Ensinar a leitura dos pictogramas de perigo do GHS nos rótulos de produtos químicos e a consulta obrigatória da FDS/FISPQ.",
    pontosPrincipais: [
      "O Sistema Globalmente Harmonizado (GHS) utiliza pictogramas padronizados em losango com borda vermelha para indicar perigos químicos.",
      "Todo frasco, galão ou recipiente secundário DEVE conter rótulo legível de identificação do produto e avisos de risco (proibido frascos sem identificação).",
      "A FDS (Ficha com Dados de Segurança de Produtos Químicos - antiga FISPQ) contém 16 seções detalhando primeiros socorros, EPIs e controle de vazamentos.",
      "Nunca reutilize garrafas pet de refrigerante ou copos descartáveis para guardar produtos químicos (risco fatal de ingestão acidental).",
    ],
    conteudo: `Olá a todos! Nosso Diálogo Diário de Segurança de hoje trata da Norma Regulamentadora nº 26 (NR-26) e da Identificação, Rotulagem e Manuseio Seguro de Produtos Químicos pelo Sistema GHS.

No nosso ambiente industrial, lidamos com dezenas de substâncias químicas: óleos lubrificantes, desengraxantes alcalinos, solventes, ácidos de decapagem, resinas e tintas. Muitas dessas substâncias são incolores e transparentes, parecendo água à primeira vista. Se uma pessoa inexperiente pegar um frasco sem rótulo e cheirar ou ingerir por engano, as consequências podem ser fatais, incluindo queimaduras internas de esôfago, cegueira ou intoxicação sistêmica grave.

Para padronizar os avisos em todo o planeta, a NR-26 adotou o sistema internacional GHS (Globally Harmonized System). Nos rótulos dos produtos, você encontrará pictogramas em formato de losango branco com borda vermelha e símbolos claros:
- Chama: produto inflamável;
- Chama sobre círculo: substância oxidante/comburente que acelera o fogo;
- Bomba explodindo: risco de explosão por calor ou choque;
- Corrosão (tubo de ensaio pingando na mão e no metal): produto corrosivo que destrói a pele e metais;
- Caveira com ossos cruzados: toxicidade aguda severa que pode levar à morte em doses minúsculas;
- Ponto de exclamação: produto irritante para a pele, olhos e vias respiratórias;
- Silhueta humana com estrela no peito: perigo grave à saúde humana a longo prazo (cancerígeno, mutagênico ou tóxico para a reprodução);
- Árvore e peixe morto: perigo ao meio ambiente e à vida aquática.

Regra de ouro da NR-26: NUNCA FRACIONE PRODUTO QUÍMICO EM GARRAFA PET DE REFRIGERANTE OU COPO PLÁSTICO! Todo frasco secundário deve ter etiqueta adesiva com o nome do produto, o fabricante e os pictogramas de perigo. E antes de usar qualquer químico novo, consulte a FDS (Ficha com Dados de Segurança) disponível no nosso arquivo do SESMT para saber exatamente quais luvas usar e o que fazer em caso de respingo. Conhecimento químico é segurança de verdade!`,
    perguntasDebate: [
      "Você conhece os pictogramas de perigo do GHS presentes nas embalagens químicas que você manuseia?",
      "Você já viu alguém guardando solvente ou combustível em garrafa pet de refrigerante no ambiente de trabalho?",
      "Onde fica o arquivo de FDS (Fichas com Dados de Segurança) dos produtos químicos utilizados no seu setor?",
    ],
  },
];
