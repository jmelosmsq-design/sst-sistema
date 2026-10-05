import { DdsTemaItem } from "../../types";

export const TEMAS_ACERVO_GERAL_100: DdsTemaItem[] = [
  // --- Químicos Específicos e Riscos Críticos ---
  {
    id: "dds_ac_01",
    codigo: "QUI-01",
    titulo: "Amônia Anidra em Sistemas de Refrigeração: Riscos e Emergências (NR-36 & NR-20)",
    categoria: "Inflamáveis e Químicos (NR-20)",
    nrReferencia: "NR-36",
    objetivo: "Sensibilizar sobre os riscos de vazamentos de amônia (NH3), toxicidade, asfixia química, máscara facial com filtro específico e rotas de fuga contra o vento.",
    pontosPrincipais: [
      "A amônia anidra (NH3) é um gás corrosivo e tóxico que queima os pulmões e a pele, podendo ser fatal em altas concentrações.",
      "Sistemas de refrigeração industrial com amônia devem possuir detectores automáticos de vazamento calibrados e chuveiros de aspersão.",
      "Em caso de alarme de vazamento: saia SEMPRE na direção perpendicular ou CONTRA o sentido do vento, guiando-se pela biruta.",
      "Uso de máscara facial panorâmica com filtro químico específico para amônia (filtro verde K) e vestimentas de nível A/B de proteção química.",
    ],
    conteudo: `Bom dia a todos! Nosso Diálogo Diário de Segurança de hoje aborda um agente químico amplamente utilizado na indústria de alimentos, laticínios, cervejarias e frigoríficos: a Amônia Anidra (NH3).

A amônia é um gás refrigerante de altíssima eficiência termodinâmica, mas com potencial de risco químico extremo. Ao escapar para a atmosfera, a amônia reage instantaneamente com a umidade dos olhos, da boca, da garganta e dos alvéolos pulmonares, formando hidróxido de amônio altamente cáustico. A inalação em concentrações elevadas provoca espasmo na laringe, sufocamento agudo, edema pulmonar grave e queimaduras químicas nos tecidos respiratórios em poucos segundos.

Como agir de forma segura em instalações com amônia:
1. Conheça as Rotas de Fuga e a Posição das Birutas: a nuvem de amônia é arrastada pelas correntes de ar. Em caso de alarme sonoro de vazamento, olhe imediatamente para a Biruta indicadora de vento da fábrica e caminhe na direção perpendicular ou CONTRA o vento (nunca a favor da fumaça!);
2. Máscara de Fuga: todo trabalhador que atua nas salas de máquinas ou áreas de compressores de amônia deve ter sua máscara de fuga de fácil acesso e testada;
3. Resposta a Emergências com Amônia: apenas a Brigada de Emergência Química especializada, equipada com roupas encapsuladas herméticas (Nível A) e aparelho de respiração autônoma (cilindro de ar nas costas), pode entrar no local para fechar válvulas;
4. Chuveiros de Emergência e Lava-Olhos: se a pele ou os olhos entrarem em contato com névoa de amônia, lave imediatamente por no mínimo 15 minutos em água corrente abundante. Respeite os protocolos e proteja a sua respiração!`,
    perguntasDebate: [
      "Você sabe onde está instalada a biruta indicadora da direção do vento na nossa unidade?",
      "Qual é a conduta correta de evacuação ao ouvir o alarme sonoro de vazamento de amônia?",
      "Por que a água nunca deve ser jogada diretamente sobre uma poça de amônia líquida concentrada?",
    ],
  },
  {
    id: "dds_ac_02",
    codigo: "QUI-02",
    titulo: "Ácidos e Bases Corrosivas: Queimaduras Químicas e Regra dos 15 Minutos (NR-26)",
    categoria: "Sinalização e Químicos (NR-26)",
    nrReferencia: "NR-26",
    objetivo: "Orientar sobre o manuseio seguro de Ácido Clorídrico, Sulfúrico e Soda Cáustica, e a ação imediata no chuveiro de emergência.",
    pontosPrincipais: [
      "Ácidos fortes e bases concentradas (soda cáustica) destroem o tecido epitelial humano e causam queimaduras profundas que continuam agindo na pele.",
      "Ao diluir produtos químicos, siga a regra de ouro: 'NUNCA DÊ ÁGUA AO ÁCIDO' (adicione sempre o ácido lentamente sobre a água, nunca o inverso).",
      "Uso de avental de PVC, luvas de borracha nitrílica de cano longo, botas impermeáveis e óculos ampla visão com protetor facial.",
      "Em caso de respingo: ir instantaneamente ao chuveiro de emergência/lava-olhos e lavar por 15 minutos contínuos sem aplicar pomadas ou remédios caseiros.",
    ],
    conteudo: `Olá a todos! Nosso Diálogo de hoje trata de substâncias químicas de alta agressividade presentes no tratamento de água, galvanoplastia e limpeza pesada: os Ácidos e as Bases Corrosivas.

Diferente de uma queimadura térmica por fogo — onde a fonte de calor se afasta e o dano cessa —, a Queimadura Química é contínua. Enquanto a molécula de ácido sulfúrico, ácido clorídrico ou hidróxido de sódio (soda cáustica) estiver impregnada na sua pele ou tecido ocular, ela continuará reagindo quimicamente e destruindo as células vivas em profundidade.

Regras indispensáveis no manuseio de químicos corrosivos:
1. Ordem de Mistura e Diluição: ao preparar soluções ácidas, aplique a regra química fundamental: 'NUNCA ADICIONE ÁGUA AO ÁCIDO'. Se você jogar água dentro de um balde com ácido puro, a reação exotérmica violenta fará a água ferver instantaneamente, espirrando ácido fervente no seu rosto! Adicione sempre o ácido aos poucos sobre a água, com agitação constante;
2. EPIs de Barreira Total: utilize óculos de proteção ampla visão com vedação de borracha, máscara de proteção facial transparente, luvas de borracha impermeáveis de cano longo e avental de PVC cobrindo o peito e as pernas;
3. O Protocolo Sagrado dos 15 Minutos: se ocorrer qualquer respingo na pele ou nos olhos, não perca tempo procurando toalhas ou passando café e pomadas! Vá direto para o chuveiro lava-olhos mais próximo, acione a alavanca e lave o local atingido por NO MÍNIMO 15 MINUTOS ININTERRUPTOS com água corrente, despindo as roupas contaminadas debaixo da água. A água em abundância dilui e remove o produto corrosivo. Agilidade e água corrente salvam a sua pele!`,
    perguntasDebate: [
      "Onde está o chuveiro lava-olhos mais próximo do local onde você manuseia produtos químicos?",
      "Por que nunca devemos jogar água diretamente sobre um recipiente contendo ácido concentrado?",
      "Qual é a primeira atitude imediata em caso de contato de produto corrosivo com os olhos?",
    ],
  },
  {
    id: "dds_ac_03",
    codigo: "QUI-03",
    titulo: "Gases Asfixiantes e Gases Criogênicos: Nitrogênio Líquido e Gelo Seco",
    categoria: "Inflamáveis e Químicos (NR-20)",
    nrReferencia: "NR-20",
    objetivo: "Explicar os riscos de queima pelo frio extremo (-196ºC) e o risco mortal de asfixia simples por deslocamento do oxigênio em ambientes fechados.",
    pontosPrincipais: [
      "O Nitrogênio Líquido está a uma temperatura de -196ºC: o contato com a pele causa congelamento instantâneo e destruição dos tecidos.",
      "Ao evaporar, 1 litro de nitrogênio líquido se expande para quase 700 litros de gás nitrogênio puro, expulsando todo o oxigênio do ambiente.",
      "Gases asfixiantes simples não têm cheiro e matam sem que a vítima sinta sensação de sufocamento prévio.",
      "O transporte e manuseio de botijões criogênicos exige luvas criogênicas especiais e ambiente com ventilação forçada contínua.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje aborda o uso de Gases Criogênicos e Asfixiantes Simples, com foco no Nitrogênio Líquido (LN2) e Dióxido de Carbono (Gelo Seco), utilizados em laboratórios, montagem de rolamentos a frio e inertização de linhas.

O Nitrogênio líquido é uma substância fascinante, mas que exige extremo respeito técnico. Ele se encontra em estado líquido a uma temperatura assustadora de 196 graus Celsius negativos (-196ºC). O contato direto de uma gota desse líquido criogênico com a pele ou olhos congela instantaneamente a água das células, provocando uma queimadura por frio severa (gangrena fria) que requer amputação cirúrgica.

No entanto, o perigo mais mortal e invisível dos gases criogênicos é a ASFIXIA POR DESLOCAMENTO DE OXIGÊNIO. O nitrogênio é um gás inerte, inodoro, incolor e sem sabor que compõe 78% do ar que respiramos. Mas quando 1 litro de nitrogênio líquido ferve e vira gás, ele se expande quase 700 vezes em volume! Se um botijão criogênico vazar dentro de uma sala fechada, elevador ou veículo, o gás nitrogênio preenche todo o ambiente e expulsa o oxigênio.

A pessoa que entra em uma sala sem oxigênio não sente falta de ar nem tosse; ela simplesmente dá duas respirações, perde a consciência em menos de 10 segundos por anóxia cerebral e o coração para em minutos. Por isso, nunca transporte botijões de nitrogênio líquido em elevadores junto com pessoas, use sempre luvas criogênicas térmicas impermeáveis e garanta que o ambiente tenha exaustão contínua com sensor fixo de concentração de oxigênio (O2). A segurança técnica salva vidas!`,
    perguntasDebate: [
      "Por que é expressamente proibido transportar recipientes de nitrogênio líquido em elevadores ocupados por pessoas?",
      "Quais EPIs térmicos especiais são exigidos para o manuseio seguro de líquidos criogênicos a -196ºC?",
      "Como você verifica se a ventilação de um laboratório ou sala de criogenia está ativa?",
    ],
  },

  // --- Máquinas Específicas e Ferramental ---
  {
    id: "dds_ac_04",
    codigo: "MAQ-01",
    titulo: "Segurança na Operação de Serras Circulares de Bancada e Cutelo Divisor (NR-18 & NR-12)",
    categoria: "Máquinas e Equipamentos (NR-12)",
    nrReferencia: "NR-12",
    objetivo: "Sensibilizar sobre os perigos do efeito 'coice' (kickback) em serras de corte de madeira, o uso obrigatório do empurrador e coifa protetora.",
    pontosPrincipais: [
      "O efeito 'coice' (kickback) ocorre quando a madeira fecha atrás da lâmina e é arremessada contra o peito do operador a mais de 150 km/h.",
      "A serra circular DEVE possuir obrigatoriamente: Coifa protetora com dentes antiqueda, Cutelo Divisor de aço e Empurrador de madeira.",
      "NUNCA posicione as mãos a menos de 30 cm da lâmina em rotação: use sempre a guia paralela e o bastão empurrador.",
      "Uso de óculos de segurança, protetor auricular e máscara contra poeira de madeira (proibido o uso de luvas que possam ser puxadas pela lâmina).",
    ],
    conteudo: `Olá a todos! Nosso DDS de hoje é dedicado à Segurança na Operação de Serras Circulares de Bancada e de Esquadria, máquinas presentes em carpintarias de obras, marcenarias e manutenção.

A serra circular é uma das ferramentas que mais geram amputações de dedos e mãos na história da construção civil. A lâmina dentada de carbeto de tungstênio gira a mais de 4.000 RPM com dentes afiados capazes de cortar madeira maciça em milissegundos. Além do risco evidente de corte direto nas mãos, existe o perigo violento do EFEITO COICE (Kickback).

O que é o efeito coice? Quando a madeira sofre uma torção ou fecha a fresta de corte atrás da lâmina, os dentes traseiros que estão subindo cravam na madeira e arremessam a tábua para trás em alta velocidade na direção do abdômen e tórax do operador, podendo quebrar costelas e perfurar órgãos vitais, além de puxar a mão do carpinteiro diretamente para cima da lâmina!

Para anular o efeito coice e operar com segurança absoluta conforme a NR-12 e NR-18:
1. Coifa Protetora com Cutelo Divisor: a lâmina deve estar coberta por uma coifa metálica móvel que se apoia sobre a madeira. Atrás da lâmina DEVE estar instalado o Cutelo Divisor (lâmina de aço temperado curva que mantém a fenda da madeira aberta, impedindo o travamento);
2. Uso do Bastão Empurrador: nos últimos 30 centímetros de corte, NUNCA empurre a madeira com os dedos! Utilize o bastão empurrador de madeira com cabo anatômico para conduzir a peça até o final;
3. Proibição de Luvas: como em qualquer máquina de corte rotativo aberto, NUNCA use luvas de tecido ou raspa ao serrar madeira, pois o tecido pode ser engolido pelos dentes da serra;
4. Desligue a máquina e espere o disco parar totalmente antes de recolher tocos de madeira ou limpar a serragem da bancada. Opere com respeito à madeira e à sua integridade física!`,
    perguntasDebate: [
      "A serra circular do seu setor possui coifa de proteção e cutelo divisor instalados e ajustados?",
      "Você sempre utiliza o bastão empurrador para finalizar o corte de peças pequenas na bancada?",
      "Por que é proibido usar luvas ao operar serras de bancada e furadeiras rotativas?",
    ],
  },
  {
    id: "dds_ac_05",
    codigo: "MAQ-02",
    titulo: "Segurança na Operação de Tornos Mecânicos, Furadeiras Radiais e Eixos Giratórios",
    categoria: "Máquinas e Equipamentos (NR-12)",
    nrReferencia: "NR-12",
    objetivo: "Sensibilizar torneiros e mecânicos sobre os perigos mortais de agarramento de roupas, cabelos soltos e correntes em eixos em rotação.",
    pontosPrincipais: [
      "Eixos lisos ou placas de torno em rotação agarram tecidos soltos com força esmagadora: risco de amputação e morte por esmagamento contra o barramento.",
      "Proibido terminantemente o uso de luvas, anéis, alianças, pulseiras, colares, crachás com cordão no pescoço e cabelos longos soltos.",
      "Proteção de acrílico intertravada sobre a placa do torno e proteção telescópica na broca da furadeira de coluna.",
      "Nunca tente retirar cavacos de usinagem com as mãos ou panos enquanto a máquina estiver girando: use sempre ganchos metálicos manuais.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje trata da Norma Regulamentadora nº 12 (NR-12) e da Operação de Máquinas Operatrizes com Eixos Rotativos: Tornos Mecânicos, Fresadoras e Furadeiras de Coluna.

O torno mecânico é a mãe de todas as ferramentas de usinagem, mas também é um dos maquinários que menos perdoa qualquer desatenção. A placa do torno e a peça metálica giram com torque maciço do motor elétrico. A força de arraste de um eixo giratório não pode ser contida pela força humana: no instante em que uma ponta de tecido é puxada, o corpo do trabalhador é arremessado contra o barramento de ferro fundido em menos de meio segundo.

Regras de ouro para a segurança em tornos e usinagem:
1. Roupa Justa e Cabelos Presos: trabalhe sempre com mangas de camisa abotoadas no punho ou dobradas para cima dos cotovelos. Cabelos compridos devem estar amarrados em coque firme e recolhidos dentro de toucas. Retire rigorosamente qualquer adorno pessoal: anéis, alianças, relógios, correntes no pescoço e crachás com fita solta;
2. Proibição Absoluta de Luvas e Estopas: NUNCA opere torno ou furadeira usando luvas ou segurando panos/estopas perto da peça girando! O pano ou a luva se enrosca na broca ou placa e puxa os dedos para a zona de corte;
3. Remoção Segura de Cavacos: durante a usinagem de aço, formam-se fitas de cavaco longas, afiadas e incandescentes. NUNCA tente puxar um cavaco com as mãos ou bater com a mão na peça! Pare a máquina ou utilize ganchos metálicos com empunhadura protegida para retirar os cavacos;
4. Chave de Placa com Mola: nunca deixe a chave de aperto de castanhas esquecida dentro da placa do torno! Se a máquina for ligada com a chave engatada, ela será disparada como um míssil contra a cabeça do operador. Use chaves de mandril com mola ejetora automática. Usinagem segura exige técnica e disciplina!`,
    perguntasDebate: [
      "Você retira todas as joias, alianças e relógios antes de se aproximar de tornos ou furadeiras?",
      "A chave da placa do seu torno possui mola ejetora para não ficar presa na castanha?",
      "Que ferramenta auxiliar você utiliza para remover os cavacos afiados da usinagem?",
    ],
  },
  {
    id: "dds_ac_06",
    codigo: "MAQ-03",
    titulo: "Células Robotizadas e Segurança com Robôs Industriais (NR-12 - Anexo I)",
    categoria: "Máquinas e Equipamentos (NR-12)",
    nrReferencia: "NR-12",
    objetivo: "Explicar os perímetros de segurança de robôs industriais, cortinas ópticas, tapetes de pressão e o uso do Teach Pendant com botão 'Deadman'.",
    pontosPrincipais: [
      "O braço de um robô industrial move-se em múltiplos eixos a velocidades de até 5 m/s sem capacidade de enxergar humanos na sua trajetória.",
      "O perímetro da célula robotizada deve possuir grades físicas de no mínimo 2,00 m de altura e portas com chaves de segurança intertravadas.",
      "Ao entrar na célula para programação ou setup: acione o botão de habilitação de 3 estágios ('Deadman switch') do Teach Pendant em modo manual com velocidade reduzida (T1).",
      "NUNCA entre na área delimitada pelo raio de ação do robô enquanto o sistema estiver no modo Automático.",
    ],
    conteudo: `Olá a todos! Nosso Diálogo Diário de Segurança de hoje trata da Automação Industrial e da Segurança em Células Robotizadas, conforme as diretrizes do Anexo I da NR-12 e da norma ISO 10218.

Os robôs industriais articulados são máquinas impressionantes que soldam, manipulam peças pesadas, realizam paletização e montagem com precisão cirúrgica e velocidades ultrarrápidas. No entanto, um robô não pensa e não possui olhos biológicos: ele apenas executa trajetórias matemáticas programadas. Se uma pessoa estiver no caminho do braço robótico em modo automático, ela receberá um impacto de centenas de quilos de força mecânica sem que a máquina hesite ou pare por conta própria.

Requisitos fundamentais para a segurança em células com robôs:
1. Enclausuramento Periférico e Travamento: toda célula robotizada deve ser cercada por grades metálicas de proteção com altura mínima de 2,00 metros e portas de acesso monitoradas por chaves de intertravamento de segurança de Categoria 4. Ao abrir a porta, o sinal de segurança cai e o robô para imediatamente;
2. Cortinas Ópticas e Scanners a Laser de Segurança: nas áreas de alimentação contínua de peças, feixes de luz ou scanners de solo criam zonas de alarme e parada caso alguém invada o perímetro;
3. Programação com 'Deadman Switch': quando um técnico precisa entrar na célula para ajustar trajetórias ou programar pontos com o painel manual (Teach Pendant), o robô deve estar estritamente no Modo Manual T1 (velocidade limitada a 250 mm/s) e o operador deve manter pressionado o interruptor de homem-morto de 3 posições. Se o operador soltar o botão ou se apertar com força em pânico, o robô para instantaneamente;
4. NUNCA entre na célula com o painel em Modo Automático e nunca jogue ferramentas para dentro da grade. Respeite os robôs e trabalhe sempre protegido!`,
    perguntasDebate: [
      "Como você verifica se os sensores de intertravamento da porta da célula robotizada estão funcionando?",
      "Por que a velocidade do robô deve ser reduzida para menos de 250 mm/s durante intervenções de programação?",
      "O que você faz se encontrar uma grade de proteção da célula frouxa ou com sensores desativados?",
    ],
  },

  // --- Eletricidade & NR-10 Avançada ---
  {
    id: "dds_ac_07",
    codigo: "ELE-01",
    titulo: "Arco Elétrico (Arc Flash): Risco Térmico, Vestimentas ATPV e Proteção Facial (NR-10)",
    categoria: "Segurança em Eletricidade (NR-10)",
    nrReferencia: "NR-10",
    objetivo: "Sensibilizar eletricistas e mantenedores sobre o fenômeno do Arco Elétrico, que atinge temperaturas superiores à superfície do sol (20.000ºC).",
    pontosPrincipais: [
      "O arco elétrico é uma explosão luminosa e térmica que atinge até 20.000ºC em milissegundos, vaporizando metais e gerando onda de choque acústica e de pressão.",
      "Causa comum: queda acidental de ferramentas metálicas entre barramentos trifásicos, falha de isolamento ou manobra incorreta de chaves seccionadoras.",
      "Uso obrigatório de Uniforme Antichama com classificação ATPV compatível com o estudo de energia incidente do painel (calça, camisa, capuz balaclava).",
      "Protetor facial específico para arco elétrico com tonalidade protetora e capacete classe B isolante.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje é um dos fenômenos mais devastadores de toda a engenharia elétrica: o 'Arco Elétrico' (Arc Flash) e a Proteção Contra Riscos Térmicos, conforme preconiza a NR-10.

Muitos profissionais pensam que o único perigo da eletricidade é o choque elétrico pelo contato direto com partes vivas. Mas existe outro perigo igualmente aterrorizante: a queima provocada pelo Arco Voltaico. Quando ocorre um curto-circuito de alta potência entre fases de um painel de média ou baixa tensão, a corrente elétrica ioniza o ar e cria um plasma de fogo cuja temperatura no epicentro pode atingir inacreditáveis 20.000 graus Celsius — ou seja, quase quatro vezes mais quente do que a superfície do sol!

Em fração de milissegundos, o cobre sólido dos barramentos é vaporizado, expandindo-se em 67.000 vezes de volume e gerando uma explosão mecânica com onda de choque que arremessa o eletricista contra a parede, rompe os tímpanos pelo estampido de mais de 160 decibéis e queima as roupas comuns de poliéster ou algodão, derretendo o plástico diretamente sobre a pele da vítima.

Como se blindar contra o arco elétrico:
1. Vestimentas Específicas com Classificação ATPV: eletricistas que atuam em painéis de força devem usar calças, camisas e capuzes confeccionados em tecido 100% antichama inerente, com índice de proteção térmica (cal/cm²) adequado à categoria do painel. NUNCA use roupas íntimas ou camisas de tecido sintético (poliéster/nylon) por baixo do uniforme antichama, pois elas derretem no calor;
2. Viseira Facial para Arco Elétrico: use protetor facial com absorção UV/IR e absorvedor de energia térmica acoplado ao capacete isolante;
3. Ferramentas Isoladas 1.000V: utilize chaves e alicates isolados conforme a norma IEC 60900 e evite movimentos bruscos perto de barramentos energizados;
4. Desenergize antes de intervir: a melhor proteção contra o arco elétrico é desenergizar e bloquear o painel com LOTO. Trabalhe seguro e protegido!`,
    perguntasDebate: [
      "O seu uniforme de eletricista possui a etiqueta com a indicação do valor de proteção térmica (ATPV em cal/cm²)?",
      "Por que é expressamente proibido usar roupas íntimas de tecido sintético (nylon/poliéster) por baixo do uniforme antichama?",
      "Você utiliza a balaclava e o protetor facial de arco elétrico ao manobrar chaves ou disjuntores de grande porte?",
    ],
  },
  {
    id: "dds_ac_08",
    codigo: "ELE-02",
    titulo: "Descargas Atmosféricas (Raios), Tempestades e Segurança no Trabalho a Céu Aberto (NR-10)",
    categoria: "Segurança em Eletricidade (NR-10)",
    nrReferencia: "NR-10",
    objetivo: "Orientar sobre os riscos de raios durante tempestades, paralisação imediata de trabalhos em altura e locais seguros para abrigo.",
    pontosPrincipais: [
      "O Brasil é o país com maior incidência de raios do mundo (mais de 70 milhões de descargas por ano).",
      "A regra do 'Trovão após o Relâmpago': se o tempo entre ver o relâmpago e ouvir o trovão for menor que 30 segundos, a tempestade está perigosamente perto (menos de 10 km).",
      "Paralisação imediata de trabalhos em telhados, andaimes, postes, gruas e campos abertos ao menor sinal de tempestade com raios.",
      "NUNCA se abrigue embaixo de árvores isoladas, perto de cercas de arame farpado ou dentro de estruturas metálicas abertas.",
    ],
    conteudo: `Olá a todos! Nosso Diálogo Diário de Segurança de hoje traz orientações meteorológicas e elétricas vitais: 'A Prevenção de Acidentes com Raios e Descargas Atmosféricas', de acordo com a NR-10 e a norma ABNT NBR 5419.

O Brasil é o líder mundial em ocorrência de raios na atmosfera. Uma única descarga atmosférica carrega uma corrente de 20 mil a mais de 100 mil amperes e dezenas de milhões de volts de tensão. Se uma pessoa for atingida direta ou indiretamente por uma tensão de passo no solo, a parada cardíaca e as queimaduras internas são fulminantes.

Como se comportar de forma segura diante de tempestades com raios:
1. Regra 30/30 de Alerta: conte os segundos entre o clarão do relâmpago e o som do trovão. A cada 3 segundos de diferença, o raio caiu a cerca de 1 km de distância. Se o tempo for de 30 segundos ou menos, o perigo de queda de raios sobre você é iminente!
2. Paralisação Imediata de Tarefas Críticas: todo trabalho em altura (telhados, andaimes, postes elétricos, torres de comunicação), operação de guindastes, movimentação em pátios abertos e trabalhos rurais devem ser PARALISADOS IMEDIATAMENTE ao primeiro estrondo de trovão;
3. Onde NUNCA se abrigar:
   - NUNCA fique embaixo de árvores isoladas (a árvore atrai o raio e o tronco explode, arremessando madeira e transferindo a eletricidade para o solo);
   - NUNCA fique próximo a cercas de arame, tubulações metálicas ou postes de iluminação;
   - NUNCA permaneça em lagos, poças de água ou dentro de barcos abertos;
4. Locais Seguros para Abrigo: entre no interior de edificações de alvenaria com Sistema de Proteção contra Descargas Atmosféricas (SPDA) instalado ou dentro de veículos fechados com carroceria metálica (Gaiola de Faraday). Permaneça abrigado até 30 minutos após o último trovão audível. A natureza é poderosa: respeite o perigo dos raios!`,
    perguntasDebate: [
      "Qual é o procedimento de segurança adotado no seu setor quando começa uma tempestade com raios?",
      "Por que os veículos fechados de lataria metálica são abrigos seguros contra raios (efeito Gaiola de Faraday)?",
      "Você costuma avisar a equipe quando nota nuvens carregadas e relâmpagos se aproximando no horizonte?",
    ],
  },

  // --- Logística e Movimentação de Cargas Avançada ---
  {
    id: "dds_ac_09",
    codigo: "LOG-01",
    titulo: "Segurança em Docas de Carga e Descarga: Calço de Rodas e Travamento de Carretas (NR-11)",
    categoria: "Movimentação e Cargas (NR-11)",
    nrReferencia: "NR-11",
    objetivo: "Prevenir a temida queda de empilhadeiras no vão da doca causada pelo deslocamento involuntário do caminhão durante a operação.",
    pontosPrincipais: [
      "O 'Creep' (deslocamento lento do caminhão para a frente pelo tranco da empilhadeira entrando e saindo) cria um vão livre mortal entre a doca e o baú.",
      "Uso obrigatório de Calço de Roda de borracha/aço travando os pneus traseiros do caminhão antes de abrir a porta da doca.",
      "Retirada obrigatória da chave de ignição da carreta, que deve permanecer em posse do conferente da doca durante toda a operação.",
      "Niveladora de doca com capacidade de carga nominal certificada e sem desníveis perigosos.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje é a 'Segurança nas Operações de Docas de Carga e Descarga em Centros de Distribuição', com base na NR-11.

A área de docas é o coração da logística, onde caminhões, carretas, empilhadeiras e pedestres se cruzam o tempo todo. Porém, um dos acidentes mais aterrorizantes e frequentes nos armazéns ocorre quando uma empilhadeira carregada entra no baú do caminhão para pegar um pallet, e o caminhão se move para a frente. A rampa niveladora escorrega e a empilhadeira despenca de costas de uma altura de 1,30 m no vão entre a doca e o caminhão, esmagando o operador contra o solo ou prendendo suas pernas.

Por que o caminhão se move sozinho?
- Primeiro, pelo próprio tranco e aceleração da empilhadeira de 4 toneladas freando dentro do baú (fenômeno conhecido como 'Trailer Creep');
- Segundo, por falha de comunicação, quando o motorista da carreta pensa que a carga já terminou e dá a partida acelerando para sair enquanto a empilhadeira ainda está lá dentro!

Como anular 100% esse risco com o Procedimento Padrão de Doca:
1. Aplicação do Calço de Roda: assim que o caminhão encostar na doca e puxar o freio estacionário, o ajudante ou o próprio motorista DEVE colocar calços de roda de borracha maciça de alta aderência travando os dois lados dos pneus traseiros;
2. Retirada da Chave de Ignição: a chave do caminhão deve ser entregue ao conferente da doca e guardada dentro de um quadro de bloqueio trancado. O motorista só recebe a chave de volta após o término da conferência, fechamento das portas do baú e recolhimento da rampa niveladora;
3. Cavalete de Segurança para Carretas Desatreladas: se a carreta estiver desengatada do cavalo mecânico, instale cavaletes de apoio sob a dianteira do semirreboque para impedir que o baú tombe de bico para a frente com o peso da empilhadeira;
4. Semáforo de Doca: respeite rigorosamente as luzes de sinalização: Luz Vermelha = Caminhão bloqueado, operação em andamento; Luz Verde = Operação finalizada, caminhão liberado para partir. Operação de doca segura é padrão absoluto!`,
    perguntasDebate: [
      "Você sempre confere se as rodas do caminhão estão calçadas antes de autorizar a entrada da empilhadeira no baú?",
      "Onde são guardadas as chaves dos caminhões durante o processo de carregamento na nossa empresa?",
      "Por que os cavaletes de apoio são indispensáveis sob carretas que estão desatreladas do cavalo mecânico?",
    ],
  },
  {
    id: "dds_ac_10",
    codigo: "LOG-02",
    titulo: "Amarração Segura de Cargas em Carretas: Cintas Catraca, Correntes e Ângulos de Tração",
    categoria: "Movimentação e Cargas (NR-11)",
    nrReferencia: "NR-11",
    objetivo: "Capacitar motoristas e ajudantes sobre a distribuição de peso por eixo, cálculo de cintas de amarração conforme a Resolução CONTRAN 552 e inspeção de catracas.",
    pontosPrincipais: [
      "Cargas mal amarradas ou com peso mal distribuído tombam nas curvas de rodovias e provocam acidentes fatais graves com outros veículos.",
      "Proibido terminantemente o uso de cordas de sisal/nylon para amarração de cargas: uso obrigatório de cintas têxteis com catraca ou correntes de aço.",
      "A capacidade total de amarração deve ser igual ou superior ao peso da própria carga transportada.",
      "Cantoneiras de proteção plásticas ou de borracha nas quinas vivas para impedir que a cinta seja cortada pelo atrito durante a viagem.",
    ],
    conteudo: `Olá a todos! Nosso Diálogo Diário de Segurança de hoje trata da 'Amarração e Distribuição Segura de Cargas em Veículos de Transporte Rodoviário', de acordo com a NR-11 e a Resolução nº 552 do CONTRAN.

Ao colocar uma carga de várias toneladas sobre a carroceria de um caminhão, devemos lembrar que as leis da inércia agem com violência durante o transporte. Quando o caminhão faz uma curva acentuada, a força centrífuga empurra a carga para o lado de fora; quando freia bruscamente, a carga quer continuar em movimento para a frente, podendo esmagar a cabine do motorista.

Regras indispensáveis para uma viagem 100% segura:
1. Proibição Absoluta de Cordas: desde a regulamentação do Contran, o uso de cordas comuns para fixação de carga é estritamente proibido no Brasil (cordas só podem ser usadas para fixar a lona de cobertura contra chuva). Toda a carga deve ser amarrada exclusivamente por Cintas de Poliéster com Catraca de aperto ou Correntes de Aço Grau 8 com tensionadores tipo sapo;
2. Proteção das Cintas nas Quinas Vivas: se a cinta passar sobre a quina afiada de uma chapa metálica, palete de madeira ou bloco de concreto, o atrito da viagem cortará a fita de poliéster em poucos quilômetros. Instale sempre Cantoneiras Protetoras de plástico resistente sob a cinta para amortecer o atrito;
3. Distribuição Correta do Peso por Eixo: nunca concentre todo o peso no fundo da carroceria (o que deixa a direção da frente leve e sem controle) nem tudo colado na cabine (o que sobrecarrega os pneus dianteiros). Distribua a carga ao longo de todo o chassi respeitando os limites da balança;
4. Reinspeção na Estrada: após rodar os primeiros 10 a 20 quilômetros de viagem, pare o caminhão no acostamento seguro e reaperte todas as catracas! As mercadorias se assentam com a trepidação inicial e as cintas podem afrouxar. Amarre com técnica e garanta viagens sem sinistros!`,
    perguntasDebate: [
      "Você costuma inspecionar as catracas e o estado das cintas de amarração antes de liberar o caminhão para a estrada?",
      "Por que as cantoneiras de proteção são fundamentais nas quinas vivas das mercadorias?",
      "Qual é a importância de parar após os primeiros quilômetros para reapertar as catracas de fixação?",
    ],
  },

  // --- Trabalho em Altura & Telhados Avançado ---
  {
    id: "dds_ac_11",
    codigo: "ALT-01",
    titulo: "Trabalho em Telhados e Coberturas: O Perigo Mortal das Telhas Frágeis (NR-35 & NR-18)",
    categoria: "Trabalho em Altura (NR-35)",
    nrReferencia: "NR-35",
    objetivo: "Sensibilizar sobre a proibição absoluta de pisar diretamente sobre telhas de fibrocimento, translúcidas ou metálicas, e o uso obrigatório de pranchas de distribuição de peso e linha de vida.",
    pontosPrincipais: [
      "Telhas de fibrocimento, policarbonato e telhas antigas NÃO suportam o peso do corpo humano: elas se rompem sem aviso prévio.",
      "A queda através do telhado é uma das maiores causas de mortes na construção e manutenção predial.",
      "NUNCA pise diretamente sobre as telhas: utilize pranchões de madeira travados de no mínimo 30 cm de largura para distribuir o peso sobre as terças.",
      "Cinto tipo paraquedista ancorado 100% do tempo em Linha de Vida horizontal independente fixada na estrutura do prédio (nunca no madeiramento frágil do telhado).",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje trata de uma das atividades mais arriscadas da manutenção predial e industrial: o 'Trabalho em Telhados, Coberturas e Galpões', conforme a NR-35 e NR-18.

Quantas notícias trágicas já vimos de trabalhadores que subiram em um telhado para desentupir uma calha, trocar uma telha quebrada ou fazer uma vedação de rufos e caíram de uma altura de 6 a 12 metros direto no piso de concreto? A telha de fibrocimento ou policarbonato tem uma aparência enganosa de rigidez, mas ela não foi projetada para receber carga concentrada. Ao colocar o peso de um homem de 80 kg sobre uma telha ressecada pelo sol, ela se estilhaça como vidro e a pessoa despenca no vazio.

Protocolo obrigatório para subida em telhados:
1. Proibição Terminante de Pisar no Meio da Telha: NUNCA dê passos diretamente sobre a superfície das telhas! Para caminhar sobre a cobertura, instale Pranchas de Madeira ou Passadiços Metálicos de circulação com no mínimo 30 cm de largura, apoiados e amarrados sobre a estrutura metálica das terças e vigas de sustentação;
2. Linha de Vida Horizontal de Cabo de Aço ou Fita Certificada: antes de colocar o pé no telhado, o trabalhador deve conectar o talabarte ou trava-quedas a uma linha de vida previamente instalada e dimensionada por engenheiro mecânico legalmente habilitado;
3. Redes de Segurança sob o Telhado: para manutenções extensas de troca de telhas em galpões, é obrigatória a instalação de redes de proteção coletiva sob a cobertura para segurar qualquer queda acidental de pessoas ou materiais;
4. Parada Imediata em Caso de Chuva e Vento: telhados molhados ficam extremamente escorregadios pelo limo acumulado, e rajadas de vento podem desequilibrar o trabalhador ou levantar telhas soltas. Telhado molhado é telhado interditado! Suba com planejamento e volte para casa com vida!`,
    perguntasDebate: [
      "Você já presenciou alguém tentando andar em cima de telhas de fibrocimento sem pranchas de madeira?",
      "Onde deve ser ancorada a linha de vida antes de alguém acessar o telhado da empresa?",
      "Por que qualquer trabalho em cobertura deve ser paralisado imediatamente ao começar a chover ou ventar forte?",
    ],
  },
  {
    id: "dds_ac_12",
    codigo: "ALT-02",
    titulo: "Plataformas Elevatórias Móveis de Trabalho (PEMT / PTA): Operação Segura (NR-35 - Anexo IV)",
    categoria: "Trabalho em Altura (NR-35)",
    nrReferencia: "NR-35",
    objetivo: "Orientar sobre a operação segura de plataformas tipo Tesoura (Pantográfica) e Articulada (Lança), ancoragem no olhal interno e isolamento da área no solo.",
    pontosPrincipais: [
      "Capacitação específica de 8h obrigatória para operadores de PEMT/PTA (Plataforma Elevatória Móvel de Trabalho).",
      "Uso obrigatório de cinto paraquedista com talabarte de retenção curto ancorado EXCLUSIVAMENTE no ponto de ancoragem do cesto da máquina.",
      "NUNCA suba nos guarda-corpos do cesto nem utilize escadas ou caixas dentro da plataforma para alcançar pontos mais altos.",
      "Inspecione o solo (tampas de bueiro, buracos, desníveis e inclinações) e verifique a presença de redes elétricas aéreas próximas.",
    ],
    conteudo: `Olá a todos! Nosso Diálogo Diário de Segurança de hoje traz as regras do Anexo IV da NR-35 sobre a 'Operação de Plataformas Elevatórias Móveis de Trabalho' (PEMT, também conhecidas como PTA ou plataformas tesoura/articuladas).

As plataformas elevatórias são equipamentos modernos e fantásticos que substituíram muitos andaimes tradicionais, proporcionando rapidez e mobilidade em alturas elevadas. No entanto, por serem máquinas motorizadas com braços telescópicos e hidráulicos, qualquer manobra errada ou desnivelamento do solo pode provocar o tombamento da máquina ou arremessar o operador para fora do cesto como uma catapulta!

Regras essenciais para operar plataformas elevatórias com risco zero:
1. Inspeção Pré-Uso Diária (Checklist): verifique o funcionamento dos controles de emergência no solo e no cesto, buzina, sensor de inclinação (tilt), vazamentos de óleo hidráulico e integridade das baterias/motor;
2. Ancoragem no Ponto Certo: dentro do cesto existe um olhal de ancoragem de aço soldado e identificado pelo fabricante. O operador deve estar com o cinto de segurança e talabarte conectado nesse olhal! ATENÇÃO: NUNCA ancore seu cinto em estruturas externas à plataforma (se a máquina se mover, você será puxado pelo cinto);
3. Pés Sempre Apoiados no Piso do Cesto: é terminantemente proibido subir nas barras do guarda-corpo, sentar na borda ou colocar caixas, tambores e escadas dentro do cesto para tentar 'ganhar altura extra'. Se a plataforma não alcança o ponto desejado, troque a máquina por um modelo de maior alcance;
4. Distância de Redes Elétricas: mantenha uma distância mínima de segurança de 3 a 5 metros de qualquer fiação de média ou alta tensão da rede pública para evitar arcos elétricos mortais;
5. Isolamento no Solo: isole toda a área de movimentação no chão com cones e correntes zebradas para impedir que pessoas transitem sob o cesto. Opere com suavidade nos manetes e trabalhe nas alturas com total proteção!`,
    perguntasDebate: [
      "Você sempre realiza o checklist diário da plataforma elevatória antes de elevar o cesto?",
      "Por que é proibido ancorar o talabarte em uma viga do prédio enquanto você estiver dentro da plataforma?",
      "Qual é a distância mínima que devemos manter de fiações elétricas energizadas ao manobrar a lança articulada?",
    ],
  },

  // --- Ergonomia e Fisiologia Avançada ---
  {
    id: "dds_ac_13",
    codigo: "ERG-01",
    titulo: "Trabalho em Pé Prolongado, Retorno Venoso e Tapetes Antifadiga (NR-17)",
    categoria: "Ergonomia no Trabalho (NR-17)",
    nrReferencia: "NR-17",
    objetivo: "Explicar a sobrecarga circulatória nas pernas e na coluna pelo trabalho ortostático contínuo, a importância do apoio alternado e bancos semi-sentados.",
    pontosPrincipais: [
      "Ficar em pé parado por longas horas comprime as veias das pernas, dificultando o retorno do sangue ao coração e gerando varizes, inchaço e dor lombar.",
      "A NR-17 determina a disponibilização de assentos ou bancos semi-sentados para pausas nos postos onde o trabalho é executado em pé.",
      "Utilizar tapetes ergonômicos de borracha antifadiga para amortecer o impacto contra o piso duro de concreto.",
      "Praticar a alternância de apoio: apoiar um pé ligeiramente elevado em um descanso para diminuir a curvatura e pressão na lombar.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje trata de um desafio ergonômico comum em linhas de montagem, esteiras, balcões e postos de usinagem: 'A Gestão da Fadiga no Trabalho em Pé Prolongado', conforme as diretrizes da NR-17.

O corpo humano foi projetado para se movimentar, e não para permanecer como uma estátua rígida na mesma posição por 8 horas seguidas. Quando permanecemos em pé estáticos por longos períodos sobre o piso duro de concreto, os músculos das pernas, panturrilhas e da região lombar ficam em contração contínua (contração isométrica). Essa contração comprime os vasos sanguíneos, dificultando o retorno do sangue das pernas de volta para o coração. O resultado é a sensação de pernas pesadas, inchaço nos tornozelos, queimação na sola dos pés, surgimento de varizes e dores crônicas na coluna lombar.

Como aliviar a sobrecarga do trabalho em pé de acordo com a NR-17:
1. Tapetes Ergonômicos Antifadiga: o uso de tapetes emborrachados com amortecimento elástico no piso do posto estimula micro-movimentos imperceptíveis nos músculos da panturrilha, funcionando como uma 'bomba muscular' natural que ajuda o sangue a subir;
2. Descanso Alternado para os Pés: utilize um apoio para pés ou pequeno degrau metálico de 10 a 15 cm de altura sob a bancada. Alterne o apoio, colocando ora o pé direito, ora o pé esquerdo elevado por alguns minutos. Essa elevação relaxa a musculatura do quadril e retira a pressão concentrada nos discos da lombar;
3. Uso dos Assentos Ergonômicos nas Pausas: aproveite os bancos ergonômicos semi-sentados disponibilizados no setor para alternar a postura de tempos em tempos durante os ciclos que permitirem;
4. Calçados com Absorção de Impacto: utilize meias confortáveis e certifique-se de que a palmilha da sua botina de segurança possui sistema de amortecimento no calcanhar. Cuide das suas pernas e da sua circulação todos os dias!`,
    perguntasDebate: [
      "Você costuma alternar o peso do corpo e apoiar um pé de cada vez no descanso sob a bancada?",
      "Como você sente suas pernas e pés ao final da jornada de trabalho em postos em pé?",
      "Você utiliza os tapetes antifadiga disponíveis na linha de produção?",
    ],
  },
  {
    id: "dds_ac_14",
    codigo: "ERG-02",
    titulo: "Movimentos Repetitivos dos Punhos: Prevenção da Síndrome do Túnel do Carpo (NR-17)",
    categoria: "Ergonomia no Trabalho (NR-17)",
    nrReferencia: "NR-17",
    objetivo: "Sensibilizar sobre a compressão do nervo mediano no punho, sintomas de formigamento nas mãos e exercícios de relaxamento miofascial.",
    pontosPrincipais: [
      "A flexão, extensão e desvio ulnar repetitivo dos punhos com uso de força inflama os tendões e comprime o nervo mediano no túnel do carpo.",
      "Sintomas clássicos: formigamento, dormência e perda de força nos dedos polegar, indicador e médio, principalmente à noite durante o sono.",
      "Evitar o uso de ferramentas com cabos inadequados que exijam 'pega em pinça' excessiva com as pontas dos dedos.",
      "Realizar pausas regulares para alongar os tendões flexores e extensores do antebraço e punho.",
    ],
    conteudo: `Olá a todos! Nosso Diálogo de hoje trata de uma das patologias ocupacionais mais dolorosas e frequentes na indústria e escritórios: a 'Síndrome do Túnel do Carpo e as Tendinites de Punho', conforme a NR-17.

No interior do nosso punho existe uma passagem anatômica estreita formada por ossos e ligamentos rígidos chamada Túnel do Carpo. Por dentro desse túnel passam nove tendões flexores que movimentam os dedos e um nervo vital: o Nervo Mediano, responsável pela sensibilidade e força de grande parte da nossa mão.

Quando executamos movimentos rápidos e repetitivos com o punho dobrado para cima, para baixo ou para os lados — como parafusar repetidamente, digitar com teclado torto, cortar com tesoura dura ou usar alicates pesados —, o atrito contínuo inflama a bainha dos tendões (tenossinovite). Como o túnel carpal é rígido e não se expande, os tendões inchados esmagam o nervo mediano contra o osso.

Quais são os sintomas de alerta:
- Acordar no meio da noite com as mãos dormentes ou com sensação de 'agulhadas' e formigamento nos dedos;
- Dificuldade para segurar objetos simples, como uma xícara ou chave, com sensação de que os objetos 'escapam' da mão;
- Dor que sobe do punho em direção ao cotovelo e ombro.

Como prevenir no seu dia a dia:
1. Mantenha os Punhos em Posição Neutra (Retos): ajuste a altura da bancada, cadeira e ferramentas de modo que seu punho trabalhe reto, como se você estivesse cumprimentando alguém com um aperto de mão;
2. Escolha Ferramentas Ergonômicas: use parafusadeiras elétricas com empunhadura tipo pistola ou reta adequadas ao ângulo da tarefa para não forçar a articulação;
3. Alongamentos Diários: estenda o braço para a frente com a palma da mão voltada para a frente (sinal de 'pare') e puxe suavemente os dedos para trás com a outra mão por 20 segundos; depois vire a mão para baixo e repita. Punhos saudáveis garantem o seu sustento e bem-estar!`,
    perguntasDebate: [
      "Você já sentiu dormência ou formigamento nas mãos e dedos ao acordar pela manhã?",
      "As ferramentas manuais que você utiliza permitem trabalhar com o punho reto e alinhado?",
      "Você pratica os alongamentos de punho e dedos durante as pausas na produção?",
    ],
  },

  // --- Primeiros Socorros & Situações Especiais ---
  {
    id: "dds_ac_15",
    codigo: "PS-04",
    titulo: "Crises Convulsivas no Trabalho: O Que Fazer e o Que NUNCA Fazer (NR-07)",
    categoria: "Primeiros Socorros e Emergências",
    nrReferencia: "NR-07",
    objetivo: "Desmistificar mitos perigosos sobre epilepsia e ensinar o protocolo correto de proteção da cabeça, lateralização e acionamento do socorro médico.",
    pontosPrincipais: [
      "A crise convulsiva é uma descarga elétrica cerebral súbita que provoca contrações musculares involuntárias generalizadas, perda de consciência e salivação.",
      "MITO PERIGOSO: NUNCA tente segurar a língua da vítima nem coloque colheres, dedos ou panos dentro da boca dela (risco de quebrar dentes e amputar dedos).",
      "Ação correta: afastar móveis e objetos cortantes ao redor, apoiar algo macio (uma blusa dobrada) sob a cabeça e cronometrar a duração da crise.",
      "Ao término das contrações: virar a vítima delicadamente de lado na Posição Lateral de Segurança (PLS) para manter as vias aéreas livres de secreções.",
    ],
    conteudo: `Bom dia a todos! Nosso Diálogo Diário de Segurança de hoje traz orientações de Primeiros Socorros sobre como agir com tranquilidade e técnica correta diante de uma 'Crise Convulsiva ou Ataque Epiléptico no Ambiente de Trabalho'.

Presenciar uma pessoa sofrendo uma convulsão pode ser uma experiência chocante para quem nunca viu: o trabalhador cai subitamente ao chão, o corpo fica rígido e em seguida começa a debater braços e pernas de forma desordenada, com olhos virados e liberação de saliva com espuma pela boca. Devido à falta de informação, muitas pessoas entram em pânico e cometem erros graves que podem machucar seriamente a vítima e a si próprios.

O QUE NUNCA DEVE SER FEITO (Os Grandes Mitos):
1. NUNCA tente puxar ou segurar a língua da pessoa! É anatomicamente impossível uma pessoa engolir a própria língua. Ao enfiar os dedos ou uma colher dentro da boca da vítima que está com a mandíbula travada com força de centenas de quilos, você quebrará os dentes da pessoa e terá seus próprios dedos decepados pela mordida involuntária;
2. NUNCA tente segurar os braços ou conter as contrações à força: a força da musculatura pode romper ligamentos e quebrar ossos se for travada;
3. NUNCA jogue água no rosto nem dê nada para a pessoa cheirar ou beber.

O PASSO A PASSO CORRETO DE SOCORRO:
1. Afaste o Perigo: retire rapidamente caixas, ferramentas pontiagudas, mesas e máquinas ao redor para que a pessoa não bata a cabeça e os membros contra quinas vivas;
2. Proteja a Cabeça: coloque uma jaqueta dobrada, uma mochila ou suas próprias mãos espalmadas sob a cabeça da vítima para amortecer as batidas contra o chão duro;
3. Afrouxe as Roupas: solte botões da gola da camisa, gravata e cinto para facilitar a respiração;
4. Cronometre a Crise e Ligue 192 (SAMU): a maioria das convulsões dura entre 1 e 3 minutos e cessa espontaneamente;
5. Posição Lateral de Segurança (PLS): assim que as contrações pararem, a pessoa ficará sonolenta e confusa. Vire o corpo dela delicadamente de lado. Essa posição impede que a saliva ou vômito escorram para os pulmões. Fique ao lado dela conversando com voz calma até a chegada dos médicos. O conhecimento correto salva vidas sem desespero!`,
    perguntasDebate: [
      "Você sabia que nunca se deve tentar colocar a mão dentro da boca de alguém convulsionando?",
      "Por que a lateralização do corpo (virar de lado) após a crise é tão importante para a respiração?",
      "Qual é a primeira providência a ser tomada ao redor de uma pessoa que acabou de cair em convulsão?",
    ],
  },
  {
    id: "dds_ac_16",
    codigo: "PS-05",
    titulo: "Animais Peçonhentos no Trabalho: Cobras, Aranhas e Escorpiões (NR-31 & NR-18)",
    categoria: "Primeiros Socorros e Emergências",
    nrReferencia: "NR-07",
    objetivo: "Sensibilizar sobre os riscos de picadas de animais peçonhentos em entulhos, canteiros e áreas rurais, uso de perneiras e o protocolo do Soro Antiveneno.",
    pontosPrincipais: [
      "Escorpiões amarelos, aranhas armadeiras e cobras (jararacas, cascavéis) escondem-se em pilhas de madeira, blocos de entulho, botas de segurança e áreas escuras.",
      "Uso obrigatório de Botas de Segurança de cano alto com Perneiras de raspa/couro e Luvas de vaqueta pesada ao manusear materiais estocados.",
      "Bata sempre e inspecione as botas e luvas antes de calçá-las pela manhã.",
      "Em caso de picada: NUNCA faça torniquetes, NUNCA corte o local com faca e NUNCA tente chupar o veneno; lave com água e sabão e vá imediatamente ao hospital de referência com soro antiofídico/antiescorpiônico.",
    ],
    conteudo: `Olá a todos! Nosso Diálogo de hoje trata de um perigo biológico silencioso e frequente em canteiros de obras, almoxarifados, áreas verdes e no setor rural: os 'Acidentes com Animais Peçonhentos e Venenosos'.

No Brasil, os acidentes com escorpiões amarelos, aranhas marrons e armadeiras, abelhas e serpentes peçonhentas (como a jararaca, cascavel e surucucu) atingem mais de 250 mil pessoas por ano. Esses animais procuram abrigo em locais escuros, úmidos e com acúmulo de materiais — como pilhas de tijolos, restos de madeira, pallets velhos, caixas de papelão e, muitas vezes, dentro das próprias botinas de segurança deixadas nos vestiários!

Medidas preventivas essenciais:
1. Inspeção Prévia das Botinas e Luvas: antes de enfiar os pés nas botas ou as mãos nas luvas pela manhã, vire-as de cabeça para baixo, sacuda com energia e bata no chão! O escorpião costuma se alojar no fundo da bota durante a noite;
2. Uso de EPIs de Barreira: ao movimentar entulhos, troncos ou capinar, use sempre luvas grossas de vaqueta ou nitrila pesada e perneiras de raspa cobrindo a canela e o peito do pé (mais de 80% das picadas de cobra atingem a região abaixo do joelho);
3. Ordem e Limpeza no Pátio: mantenha o pátio limpo, sem mato alto e sem restos de comida, que atraem baratas e ratos — o prato predileto de escorpiões e serpentes;

O QUE FAZER EM CASO DE PICADA:
- NUNCA faça torniquetes ou amarre panos apertados na perna (o torniquete prende o veneno no membro e acelera a necrose e gangrena local);
- NUNCA fure, corte ou queime o local da picada e NUNCA tente 'chupar o veneno' com a boca;
- Lave a ferida apenas com água e sabão neutro, mantenha a vítima deitada e em repouso absoluto (o esforço físico acelera os batimentos e espalha o veneno no sangue) e transporte imediatamente para o Hospital de Referência Regional mais próximo para a aplicação do Soro Antiveneno específico. Se possível, tire uma foto do animal com o celular de distância segura para ajudar os médicos a identificarem o soro correto. A prevenção e a calma salvam vidas!`,
    perguntasDebate: [
      "Você costuma sacudir e inspecionar suas botas de segurança antes de calçá-las?",
      "Você sabe qual é o hospital público da nossa região que possui soro antiescorpiônico e antiofídico?",
      "Por que nunca se deve amarrar um torniquete no braço ou perna após a picada de uma cobra?",
    ],
  },

  // --- Cultura, Integração e Meio Ambiente ---
  {
    id: "dds_ac_17",
    codigo: "CUL-05",
    titulo: "Acolhimento e Segurança de Novos Colaboradores e Terceirizados",
    categoria: "Comportamento Seguro e Cultura SST",
    nrReferencia: "NR-01",
    objetivo: "Sensibilizar a equipe sobre a responsabilidade coletiva de orientar, acolher e proteger os profissionais recém-admitidos e prestadores de serviços.",
    pontosPrincipais: [
      "Os primeiros 90 dias de trabalho concentram a maior taxa proporcional de acidentes devido ao desconhecimento dos fluxos e máquinas locais.",
      "Terceirizados e novos contratados não possuem a mesma familiaridade com as regras e rotas da nossa empresa.",
      "Seja um 'Padrinho de Segurança': oriente com paciência, mostre os perigos do setor e corrija com gentileza.",
      "A cultura da nossa empresa não faz distinção: a vida do trabalhador terceiro tem exatamente o mesmo valor inestimável da vida do funcionário direto.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje trata de solidariedade, empatia e inclusão: 'O Cuidado e a Segurança com Novos Colaboradores e Trabalhadores Terceirizados', com base na NR-01.

Lembre-se do seu primeiro dia de trabalho nesta empresa: tudo era novo e desconhecido. Onde ficavam as saídas de emergência? Quais empilhadeiras transitavam mais rápido? Qual máquina tinha um ruído estranho? Quando uma pessoa é recém-contratada ou quando uma equipe terceirizada entra na fábrica para prestar um serviço temporário, ela está em um ambiente estranho. Por mais que tenha recebido o treinamento de integração do SESMT, na prática da linha de produção ela ainda não desenvolveu o 'olhar clínico' para os riscos específicos do nosso chão de fábrica.

Estatísticas mostram que os profissionais nos seus primeiros três meses de empresa sofrem quase três vezes mais acidentes graves do que funcionários veteranos. E a razão é simples: a novidade gera ansiedade para agradar e mostrar serviço, fazendo com que o novato tenha vergonha de perguntar quando tem dúvidas.

Como podemos fazer a diferença:
1. Seja um Mentor e Padrinho: acolha o novato no seu setor. Apresente os colegas, mostre onde ficam os botões de emergência, os extintores, os bebedouros e os caminhos seguros de pedestres;
2. Incentive a Pergunta: diga a ele com franqueza: 'Se você tiver qualquer dúvida sobre como ligar essa máquina ou como pegar essa peça com segurança, nunca adivinhe. Me pergunte que eu te ajudo!';
3. Cuide dos Terceirizados: nunca pense 'ele é terceiro, a empresa dele que cuide dele'. Um acidente com um terceirizado dentro do nosso teto é uma tragédia humana sob nossa responsabilidade solidária. Se vir um prestador de serviço sem capacete ou prestes a cometer um ato inseguro, aproxime-se com respeito e oriente. Todos nós somos uma única família pela segurança!`,
    perguntasDebate: [
      "Como foi a sua recepção no seu primeiro dia de trabalho na empresa e quem te ajudou a aprender as regras?",
      "O que você faz quando vê um colaborador terceirizado trabalhando sem conhecer os perigos do setor?",
      "Como podemos incentivar os novos funcionários a tirarem dúvidas de segurança sem medo ou vergonha?",
    ],
  },
  {
    id: "dds_ac_18",
    codigo: "AMB-02",
    titulo: "Uso Consciente de Recursos Naturais: Água, Energia e Redução do Desperdício",
    categoria: "Meio Ambiente e Sustentabilidade",
    nrReferencia: "ISO 14001",
    objetivo: "Sensibilizar sobre o impacto ecológico do desperdício de insumos, combate a vazamentos de ar comprimido e desligamento de máquinas ociosas.",
    pontosPrincipais: [
      "A sustentabilidade operacional começa nas pequenas atitudes diárias de cada colaborador no seu posto de trabalho.",
      "Vazamentos de ar comprimido em mangueiras e engates rápidos desperdiçam até 30% de toda a energia elétrica consumida pelos compressores.",
      "Desligar luzes, aparelhos de ar-condicionado e máquinas em horários de almoço e ao final do turno.",
      "Uso racional da água potável e comunicação imediata de torneiras e válvulas de descarga vazando.",
    ],
    conteudo: `Olá a todos! Nosso Diálogo Diário de Segurança e Meio Ambiente de hoje traz uma reflexão sobre a nossa 'Pegada Ecológica e o Uso Consciente dos Recursos Naturais e Energia'.

Tudo o que utilizamos na nossa empresa — desde a energia elétrica que move os motores, o ar comprimido das ferramentas, a água dos banheiros até o papel toalha e embalagens plásticas — tem um custo de extração da natureza. Quando desperdiçamos esses recursos por descuido ou preguiça, estamos gerando poluição, aumentando a emissão de gases de efeito estufa e comprometendo o futuro do planeta para os nossos filhos e netos.

Pequenas atitudes com impacto gigante:
1. Elimine os Vazamentos de Ar Comprimido: o ar comprimido é uma das formas de energia mais caras da indústria. Um pequeno furo de apenas 3 milímetros em uma mangueira pneumática chia silenciosamente e desperdiça milhares de reais em eletricidade por mês. Se ouvir um assobio de ar em mangueiras ou engates rápidos no seu setor, avise a manutenção para trocar a conexão;
2. Desligue Máquinas Ociosas: se a esteira, torno ou computador não for utilizado durante o almoço ou intervalo longo, desligue o equipamento! Motores girando em falso consomem energia e desgastam rolamentos à toa;
3. Cuidado com a Água: feche bem as torneiras após lavar as mãos e reporte imediatamente qualquer vaso sanitário ou torneira que esteja com vazamento contínuo;
4. Redução de Papel e Plástico: utilize garrafas reutilizáveis (squeezes) em vez de copos descartáveis plásticos e imprima documentos somente quando estritamente necessário. Sustentabilidade se faz na prática com a consciência de todos nós!`,
    perguntasDebate: [
      "Você já notou algum vazamento de ar comprimido ou água no seu setor que precisa de manutenção?",
      "Você costuma utilizar garrafa térmica permanente em vez de gastar vários copos plásticos descartáveis por dia?",
      "Quais máquinas ou luzes podem ser desligadas no seu posto de trabalho durante os intervalos para economizar energia?",
    ],
  },
];
