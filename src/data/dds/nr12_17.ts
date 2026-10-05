import { DdsTemaItem } from "../../types";

export const TEMAS_NR12_17: DdsTemaItem[] = [
  // --- NR-12: Segurança no Trabalho em Máquinas e Equipamentos ---
  {
    id: "dds_nr12_01",
    codigo: "NR12-01",
    titulo: "Proteções Fixas e Móveis Intertravadas em Máquinas (NR-12)",
    categoria: "Máquinas e Equipamentos (NR-12)",
    nrReferencia: "NR-12",
    objetivo: "Sensibilizar sobre a importância vital das proteções mecânicas e a proibição absoluta de burlar ou desativar sensores de segurança.",
    pontosPrincipais: [
      "As proteções de máquinas existem para criar uma barreira física intransponível entre o operador e as partes móveis perigosas.",
      "Proteções móveis com chave de segurança intertravada desligam o motor instantaneamente quando a porta ou tampa é aberta.",
      "Burlar, jumpear ou retirar uma proteção é falta grave que coloca a vida e membros do operador em risco imediato de amputação.",
      "Se uma proteção estiver frouxa, quebrada ou com sensor inoperante, a máquina deve ser paralisada imediatamente.",
    ],
    conteudo: `Bom dia a todos! O tema do nosso DDS de hoje é a Norma Regulamentadora nº 12 (NR-12), com foco especial nas Proteções Físicas de Máquinas e nos Sistemas de Intertravamento de Segurança.

Máquinas industriais — como tornos, fresas, prensas, dobradeiras, guilhotinas, calandras, esteiras transportadoras e misturadores — são projetadas para transformar materiais brutos com forças titânicas e rotações de milhares de RPMs. A força e a velocidade dessas engrenagens, cilindros e navalhas são centenas de vezes superiores à resistência dos ossos e músculos humanos. Um dedo, mão, cabelo solto ou manga de uniforme que encoste em um eixo rotativo será tragado e esmagado em menos de meio segundo, sem qualquer chance de reação humana.

Por essa razão, a NR-12 exige que todas as zonas perigosas de máquinas possuam proteções rigorosas:
1. Proteções Fixas: grades ou chapas metálicas presas por parafusos que só podem ser abertas com ferramentas específicas por pessoal de manutenção qualificado.
2. Proteções Móveis Intertravadas: portas de acrílico ou telas de acesso que possuem sensores magnéticos ou chaves eletromecânicas de segurança. Ao abrir a porta, o sensor envia um sinal ao relé de segurança e o motor elétrico da máquina é desenergizado e frenado instantaneamente.

Infelizmente, ainda existem pessoas que tentam 'burlar' o sensor de segurança — colocando um ímã no sensor ou amarrando uma fita na chave para fazer a máquina funcionar com a porta aberta e 'ganhar tempo' na produção. Burlar uma proteção é como desativar os freios de um caminhão descendo a serra! Nunca cometa esse ato criminoso contra a sua própria integridade física. Se uma proteção de máquina estiver danificada, sem parafuso ou com o sensor falhando, pare a operação na hora, aplique o cartão de impedimento e chame a manutenção. A sua segurança física é inegociável!`,
    perguntasDebate: [
      "Você já viu alguém tentando trabalhar em uma máquina com a porta de proteção aberta ou com sensor desativado?",
      "Quais máquinas do seu setor possuem proteções intertravadas e você testa os sensores no início do turno?",
      "O que você faz se perceber que uma grade de proteção está vibrando ou com parafusos frouxos?",
    ],
  },
  {
    id: "dds_nr12_02",
    codigo: "NR12-02",
    titulo: "Botão de Parada de Emergência: Quando e Como Acionar?",
    categoria: "Máquinas e Equipamentos (NR-12)",
    nrReferencia: "NR-12",
    objetivo: "Esclarecer o funcionamento correto do botão tipo cogumelo de parada de emergência e sua diferença em relação ao botão de parada normal.",
    pontosPrincipais: [
      "O botão de emergência (formato cogumelo vermelho com fundo amarelo) deve estar sempre acessível e desobstruído.",
      "Ele deve ser acionado diante de qualquer situação anormal, ruído estranho, risco iminente de acidente ou socorro a um colega.",
      "O botão de emergência NÃO deve ser utilizado como chave de rotina para ligar e desligar a máquina no dia a dia.",
      "Após o acionamento, a máquina só pode ser reinicializada após o desarme manual do cogumelo e rearme no painel principal.",
    ],
    conteudo: `Olá, equipe! No nosso diálogo de hoje vamos falar sobre o dispositivo de segurança mais visível e importante de qualquer painel industrial: o Botão de Parada de Emergência, conforme normatizado pela NR-12.

Todos nós conhecemos aquele botão vermelho proeminente, em formato de cogumelo, montado sobre uma placa amarela e localizado em pontos estratégicos das máquinas, painéis de comando e ao longo de esteiras transportadoras com cabos de emergência. Mas você sabe exatamente como ele funciona e quando deve ser acionado?

O circuito de parada de emergência é um sistema de Categoria 4 de segurança que opera em malha fechada e independente do comando do operador. A sua função é uma só: diante de uma anomalia grave — como uma peça que travou, um ruído anormal de rolamento estourando, uma fumaça repentina ou, no pior dos cenários, um colega preso ou ferido —, qualquer pessoa presente no setor pode bater a palma da mão no botão de emergência para cortar instantaneamente a energia de força do equipamento e acionar o sistema de freio mecânico.

Regras fundamentais de segurança sobre o botão de emergência:
1. Desobstrução Total: NUNCA coloque caixas, ferramentas, panos ou garrafas na frente de um botão ou cabo de emergência. Ele precisa ser alcançado em fração de segundo sem que a pessoa precise se esticar ou pular obstáculos;
2. Não usar para parada de rotina: o botão de emergência foi construído para situações críticas. Para desligar a máquina no final do turno ou para pausas normais, use o botão normal 'Desligar' (preto ou verde), evitando o desgaste prematuro dos contatos internos de segurança;
3. Reinicialização segura: ao puxar ou girar o botão de cogumelo para destravá-lo, a máquina NUNCA deve dar a partida sozinha; ela precisa que o operador vá ao botão 'Reset/Partida' no painel principal, garantindo que ninguém esteja dentro da máquina no momento da retomada. Mantenha os botões de emergência sempre visíveis e prontos para salvar vidas!`,
    perguntasDebate: [
      "Onde estão localizados todos os botões de emergência das máquinas que você opera diariamente?",
      "Você já precisou acionar um botão de emergência durante uma pane ou situação de risco na empresa?",
      "Existe algum botão de emergência no seu setor que está de difícil acesso ou obstruído por materiais?",
    ],
  },
  {
    id: "dds_nr12_03",
    codigo: "NR12-03",
    titulo: "Zona de Prensamento, Alimentação Segura e Uso de Ferramentas Manuais Auxiliares",
    categoria: "Máquinas e Equipamentos (NR-12)",
    nrReferencia: "NR-12",
    objetivo: "Orientar sobre a proibição de colocar as mãos dentro da zona de prensamento e o uso obrigatório de pinças, tenazes e ferramentas de aproximação.",
    pontosPrincipais: [
      "A zona de prensamento (ponto de operação) é a área onde a ferramenta ou matriz se fecha contra a peça para prensar, furar ou cortar.",
      "NUNCA coloque as mãos ou dedos na zona de prensamento enquanto o volante da prensa ou acionamento hidráulico estiver ligado.",
      "Utilize ferramentas auxiliares manuais (pinças de alumínio, ventosas pneumáticas, garras magnéticas) para alimentar e retirar peças pequenas.",
      "Comandos bimanual com sincronismo temporal exigem que as duas mãos estejam apoiadas nos botões fora da área perigosa.",
    ],
    conteudo: `Bom dia, pessoal! O tema do nosso DDS de hoje é a 'Zona de Prensamento e a Proteção das Mãos em Prensas, Guilhotinas e Dispositivos Hidráulicos', com base na NR-12 e na Convenção nº 119 da OIT.

A zona de prensamento, também chamada tecnicamente de ponto de operação, é a região exata onde a matriz superior desce sobre a matriz inferior para estampar, cortar, moldar ou dobrar o material. A pressão exercida por uma prensa excêntrica ou hidráulica pode variar de algumas toneladas até centenas de toneladas de força concentrada. Se uma mão estiver posicionada dentro dessa zona quando o ciclo for acionado, a consequência é a amputação traumática imediata e irreversível dos membros, além de choque hemorrágico grave.

Para anular esse risco gravíssimo, a engenharia de segurança adota múltiplas camadas de proteção:
1. Comandos Bimanual com Simultaneidade: para acionar a máquina, o operador precisa pressionar simultaneamente dois botões afastados entre si usando as duas mãos em uma janela de tempo de menos de 0,5 segundo. Isso garante que ambas as mãos estejam fisicamente fora da zona de perigo no momento do golpe. É terminantemente proibido amarrar fita em um dos botões ou tentar acionar com o cotovelo para liberar uma das mãos;
2. Cortinas de Luz e Sensores Ópticos: feixes invisíveis de luz infravermelha cobrem a abertura frontal da máquina. Se a mão do operador cruzar a cortina de luz durante a descida da matriz, o movimento perigoso é interrompido instantaneamente;
3. Ferramentas Manuais Auxiliares: para colocar ou retirar chapas e peças pequenas da matriz, utilize sempre pinças de latão ou alumínio, bastões com ventosa magnética ou puxadores pneumáticos. Se algo cair dentro da ferramenta, nunca tente pegar com as mãos: pare a máquina, desligue a força e use a ferramenta auxiliar. Lembre-se: as mãos que você usa para trabalhar são as mesmas que você usa para abraçar quem você ama em casa. Proteja-as sempre!`,
    perguntasDebate: [
      "Quais máquinas do seu setor possuem cortina de luz de segurança ou comando bimanual?",
      "Você utiliza ferramentas manuais auxiliares (pinças, ventosas) para alimentar peças sem colocar as mãos na matriz?",
      "O que você faria se percebesse que a cortina de luz de uma máquina não está parando o movimento ao ser interrompida?",
    ],
  },

  // --- NR-13: Caldeiras, Vasos de Pressão, Tubulações e Tanques Metálicos ---
  {
    id: "dds_nr13_01",
    codigo: "NR13-01",
    titulo: "Vasos de Pressão, Compressores de Ar e Válvulas de Alívio (NR-13)",
    categoria: "Vasos sob Pressão (NR-13)",
    nrReferencia: "NR-13",
    objetivo: "Sensibilizar sobre a energia acumulada em vasos sob pressão e compressores de ar comprimido, e os perigos de explosão por falha estrutural.",
    pontosPrincipais: [
      "Compressores e reservatórios de ar comprimido armazenam energia pneumática que, em caso de ruptura, gera onda de choque com efeito de bomba.",
      "A válvula de segurança (PSV) e o manômetro calibrado são os itens mais críticos para impedir a sobrepressão.",
      "Nunca realize soldas, furos ou reparos improvisados na carcaça metálica de um vaso sob pressão.",
      "A purga diária de água condensada evita a corrosão interna precoce do fundo do reservatório.",
    ],
    conteudo: `Olá a todos! Nosso Diálogo Diário de Segurança de hoje traz um tema de alta relevância técnica: a Norma Regulamentadora nº 13 (NR-13), focando especialmente nos Vasos de Pressão, Compressores de Ar Comprimido e Autoclaves.

O ar comprimido é uma das utilidades mais comuns em qualquer empresa: nós o usamos para movimentar pistões pneumáticos, alimentar pistolas de pintura, acionar ferramentas de aperto e fazer limpezas em linhas produtivas. No entanto, muitas pessoas esquecem que dentro daquele cilindro metálico do compressor de ar existe uma pressão de 8, 10 ou 12 bar (cerca de 120 a 175 libras por polegada quadrada). Se um vaso de pressão de 500 litros romper devido à corrosão ou sobrepressão, a expansão súbita daquele ar confinado libera uma energia destrutiva equivalente à detonação de dinamite, destruindo paredes, arremessando fragmentos metálicos perfurantes e matando quem estiver ao redor.

Para garantir que os vasos sob pressão operem com risco zero, a NR-13 estabelece requisitos inegociáveis:
1. Válvula de Segurança (PSV): é a válvula com mola que se abre automaticamente se a pressão subir acima do limite seguro de trabalho (PMTA). A válvula de segurança nunca deve ser travada, amarrada com arame ou ter seu peso alterado por conta própria;
2. Manômetro Calibrado: o ponteiro do manômetro deve estar limpo, visível e com a faixa de pressão máxima claramente indicada em vermelho;
3. Purga Diária de Condensado: o ar atmosférico puxado pelo compressor contém umidade. Essa umidade se condensa em água e acumula-se no fundo do tanque. Se a drenagem (purga) diária não for feita, a água acumulada provoca a oxidação e corrosão interna das chapas de aço, afinando a espessura da parede do tanque até ele explodir sob pressão normal;
4. Inspeções Periódicas com Engenheiro Mecânico Habilitado: todo vaso de pressão precisa passar por testes hidrostáticos, medição de espessura por ultrassom e possuir Prontuário técnico atualizado. Nunca tente furar, soldar ou fazer 'gambiarras' no corpo de um vaso de pressão!`,
    perguntasDebate: [
      "Você realiza a drenagem diária da água acumulada (purga) nos compressores e filtros do seu setor?",
      "Você sabe onde verificar o manômetro e a plaqueta de identificação de pressão máxima (PMTA) do equipamento?",
      "Por que o ar comprimido nunca deve ser utilizado para limpar a poeira da própria roupa ou pele?",
    ],
  },

  // --- NR-17: Ergonomia no Trabalho ---
  {
    id: "dds_nr17_01",
    codigo: "NR17-01",
    titulo: "Levantamento e Transporte Manual de Cargas (NR-17)",
    categoria: "Ergonomia no Trabalho (NR-17)",
    nrReferencia: "NR-17",
    objetivo: "Ensinar a biomecânica correta da coluna vertebral para levantamento de cargas do solo, evitando hérnias de disco e lombalgias crônicas.",
    pontosPrincipais: [
      "A coluna vertebral não foi projetada como um guindaste: dobrar o tronco com as pernas esticadas multiplica a pressão nos discos lombares por mais de 10 vezes.",
      "Técnica correta: aproxime-se da carga, flexione os joelhos, mantenha as costas retas e use a força dos músculos das pernas e glúteos para erguer o peso.",
      "Mantenha o objeto o mais colado possível ao centro do seu corpo (tórax) durante todo o transporte.",
      "Para cargas superiores a 20-25 kg ou volumosas, peça ajuda a um colega ou utilize meios mecânicos (carrinhos, transpaletes, talhas).",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje é a Norma Regulamentadora nº 17 (NR-17) e a prevenção das dores nas costas através da técnica correta de Levantamento e Transporte Manual de Cargas.

A dor na coluna lombar (lombalgia) e as hérnias de disco estão entre as três maiores causas de afastamento do trabalho e aposentadorias precoces por invalidez em todo o território nacional. E por que isso acontece com tanta frequência? Porque a maioria das pessoas tem o péssimo hábito de levantar caixas e sacos pesados curvando as costas para a frente com as pernas totalmente esticadas.

Quando você dobra a coluna para pegar um peso de 20 kg no chão mantendo os joelhos retos, a sua coluna age como uma alavanca desfavorável. O peso de 20 kg na ponta dos seus braços gera uma sobrecarga de mais de 300 kg de pressão concentrada nos minúsculos discos intervertebrais da região L4-L5 e L5-S1 da sua lombar! Com o passar dos meses, essa pressão esmaga os discos, provocando fissuras, extrusão do líquido interno e a temida hérnia de disco que comprime o nervo ciático, gerando dores insuportáveis e perda de mobilidade.

Como proteger a sua coluna para o resto da vida? Siga a regra de ouro da biomecânica:
1. Posicionamento dos pés: afaste os pés na largura dos ombros, garantindo uma base estável, com um pé ligeiramente mais à frente do que o outro;
2. Aproxime-se da carga: quanto mais distante a carga estiver do seu corpo, maior o esforço na coluna. Fique o mais perto possível do objeto;
3. Dobre os joelhos: agache-se flexionando as pernas e mantendo as costas eretas e o abdômen contraído;
4. Pegada firme: segure o objeto com as duas mãos pelas alças ou pela base;
5. Suba usando as pernas: faça a força com os músculos das coxas e glúteos — que são os músculos mais fortes do corpo humano — e nunca gire o tronco enquanto estiver com o peso nos braços (se precisar virar de lado, mova os pés primeiro!). Se o peso for excessivo, não tente bancar o herói: use um carrinho ou chame um colega. Cuide da sua coluna todos os dias!`,
    perguntasDebate: [
      "Você costuma dobrar os joelhos para erguer caixas ou ainda curva as costas com as pernas esticadas?",
      "Você já sentiu dores ou 'travamento' na região lombar após carregar peso de forma inadequada?",
      "Quais equipamentos auxiliares (carrinhos hidráulicos, esteiras) estão disponíveis no seu setor para facilitar a movimentação?",
    ],
  },
  {
    id: "dds_nr17_02",
    codigo: "NR17-02",
    titulo: "Postura Sentada, Trabalho com Telas e Prevenção de LER/DORT (NR-17)",
    categoria: "Ergonomia no Trabalho (NR-17)",
    nrReferencia: "NR-17",
    objetivo: "Orientar sobre a regulagem correta da cadeira ergonômica, monitor, teclado, mouse e a importância das micropausas para quem trabalha em escritório ou postos informatizados.",
    pontosPrincipais: [
      "Ajustar a altura da cadeira para que os pés fiquem 100% apoiados no piso (ou em apoio para pés) e os joelhos formem ângulo de 90 a 100 graus.",
      "O topo da tela do monitor deve estar alinhado à altura dos olhos para evitar sobrecarga e dores na coluna cervical (pescoço).",
      "Manter os antebraços e punhos em posição neutra e apoiados durante a digitação para prevenir Síndrome do Túnel do Carpo e tendinites.",
      "Realizar pausas ativas de 5 minutos a cada hora para mudar de postura e alongar o corpo.",
    ],
    conteudo: `Olá a todos! Nosso DDS de hoje é dedicado à Ergonomia no Trabalho Informatizado e em Postos Administrativos, tema central da NR-17.

Muitas pessoas acreditam que os riscos à saúde existem apenas nas atividades pesadas do chão de fábrica e que trabalhar sentado em frente ao computador é totalmente inofensivo. No entanto, passar de 6 a 8 horas diárias sentado na mesma posição estática, olhando para um monitor mal posicionado e digitando repetidamente sem pausas é uma das formas mais agressivas de desgastar articulações, tendões e a coluna vertebral, gerando as famosas LER/DORT (Lesões por Esforços Repetitivos / Distúrbios Osteomusculares Relacionados ao Trabalho).

Para ajustar o seu posto de trabalho de acordo com a NR-17 e trabalhar com total conforto e saúde:
1. Ajuste da Cadeira: sente-se com o quadril bem encostado no fundo do encosto, apoiando a curva da lombar. Regule a altura do assento de modo que suas coxas fiquem paralelas ao solo e seus pés fiquem totalmente apoiados no chão. Se seus pés ficarem flutuando, utilize um apoio ergonômico para pés;
2. Altura do Monitor: a borda superior da tela deve ficar exatamente na linha horizontal dos seus olhos. Se a tela estiver muito baixa (como na tela de um notebook sobre a mesa), você é obrigado a curvar o pescoço para a frente — e a cabeça humana, que pesa cerca de 5 kg, passa a exercer uma tração de até 25 kg sobre os discos da cervical quando inclinada para a frente! Utilize suporte elevador para notebook com teclado e mouse externos;
3. Teclado e Mouse: mantenha os punhos retos e alinhados, sem dobrá-los para cima ou para os lados durante a digitação. Evite apoiar os pulsos diretamente sobre quinas vivas de mesas;
4. Micropausas e Mudança de Postura: o corpo humano foi feito para o movimento. A cada 50 ou 60 minutos, levante-se por 2 ou 3 minutos, estique as pernas, caminhe até o bebedouro e olhe para um ponto distante pela janela para relaxar os músculos oculares. Pequenos ajustes diários garantem uma carreira produtiva e sem dores crônicas!`,
    perguntasDebate: [
      "A altura do seu monitor e da sua cadeira estão ajustadas corretamente para o seu biotipo?",
      "Você costuma sentir tensão no pescoço, ombros ou punhos no final da jornada de trabalho?",
      "Você pratica micropausas e alongamentos durante o seu dia de trabalho em frente ao computador?",
    ],
  },
  {
    id: "dds_nr17_03",
    codigo: "NR17-03",
    titulo: "Ginástica Laboral, Pausas Ativas e a Luta Contra a Fadiga Muscular",
    categoria: "Ergonomia no Trabalho (NR-17)",
    nrReferencia: "NR-17",
    objetivo: "Sensibilizar sobre os benefícios biomecânicos e circulatórios dos exercícios de alongamento no início e durante a jornada de trabalho.",
    pontosPrincipais: [
      "A ginástica laboral aquece a musculatura, lubrifica as articulações com líquido sinovial e melhora a oxigenação dos tecidos.",
      "Reduz comprovadamente a incidência de tendinites, bursites, epicondilites e dores lombares.",
      "Promove o alívio da tensão emocional, diminui o estresse e melhora a interação social e o clima entre a equipe.",
      "Participar ativamente e com seriedade dos exercícios diários é investir no seu próprio bem-estar.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso Diálogo de Segurança de hoje é a 'Ginástica Laboral e a Importância das Pausas Ativas para a Saúde do Trabalhador', em total consonância com as diretrizes da NR-17.

Você já reparou que nenhum atleta entra em campo para disputar uma partida sem antes fazer um aquecimento cuidadoso e alongar todos os principais grupos musculares? No nosso trabalho diário é exatamente a mesma coisa: durante 8 horas por dia, nós submetemos nossos músculos, tendões, ligamentos e articulações a esforços repetitivos, posturas estáticas e cargas físicas. Iniciar o trabalho com o corpo 'frio' e rígido é o caminho mais rápido para sofrer um estiramento muscular, uma inflamação de tendão (tendinite) ou dores nas costas.

A prática diária de 5 a 10 minutos de Ginástica Laboral traz benefícios comprovados pela medicina esportiva e ocupacional:
1. Aquecimento e Lubrificação Articular: os movimentos suaves estimulam a produção de líquido sinovial nas articulações dos ombros, cotovelos, punhos, joelhos e coluna, reduzindo o atrito interno entre as cartilagens;
2. Estímulo da Circulação Sanguínea: o alongamento bombeia sangue oxigenado para os tecidos musculares e acelera a remoção do ácido lático e toxinas acumuladas, combatendo a sensação de peso e fadiga nas pernas e braços;
3. Prevenção de Encurtamentos Musculares: compensa as posturas forçadas adotadas durante as tarefas, prevenindo desvios posturais e contraturas;
4. Alívio Mental: os exercícios de respiração profunda e relaxamento reduzem os níveis de cortisol (hormônio do estresse), aumentando a disposição mental e a capacidade de foco para o restante do dia.

Por isso, quando o facilitador de ginástica ou o líder de equipe chamar para o momento de alongamento no início do turno ou após o almoço, não tenha vergonha nem fique parado! Participe com entusiasmo, faça os movimentos na amplitude correta e sinta a diferença no seu corpo. Movimente-se pela sua saúde!`,
    perguntasDebate: [
      "Você costuma participar ativamente da ginástica laboral no seu setor ou costuma ficar de braços cruzados?",
      "Qual grupo muscular do seu corpo você mais sente sobrecarregado ao final do expediente de trabalho?",
      "Você conhece alongamentos simples que pode fazer no próprio posto de trabalho durante pequenas pausas?",
    ],
  },
];
