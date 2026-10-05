import { DdsTemaItem } from "../../types";

export const TEMAS_OPERACIONAL_SAUDE: DdsTemaItem[] = [
  // --- Primeiros Socorros no Ambiente de Trabalho ---
  {
    id: "dds_ps_01",
    codigo: "PS-01",
    titulo: "Primeiros Socorros: Hemorragias Graves e Compressão Direta",
    categoria: "Primeiros Socorros e Emergências",
    nrReferencia: "NR-07",
    objetivo: "Ensinar a técnica correta de controle de hemorragias externas graves através de pressão direta contínua e acionamento do socorro médico.",
    pontosPrincipais: [
      "Uma hemorragia arterial severa não controlada pode levar ao choque hipovolêmico e parada cardíaca em menos de 3 minutos.",
      "Ação imediata: calçar luvas de proteção biológica e aplicar compressão direta firme sobre o ferimento com gaze ou pano limpo.",
      "NUNCA remova curativos saturados de sangue: aplique novos panos por cima mantendo a pressão contínua ininterrupta.",
      "O torniquete é uma técnica avançada reservada estritamente para amputações traumáticas completas de membros e sangramentos arteriais incontroláveis.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje é de extrema importância para salvar vidas: 'Primeiros Socorros no Controle de Hemorragias Graves e Ferimentos Profundos'.

Em um ambiente industrial ou canteiro de obras, acidentes com esmerilhadeiras, serras, chapas metálicas ou tombamento de peças podem provocar cortes profundos com rompimento de artérias e veias calibrosas. O corpo humano adulto possui cerca de 5 litros de sangue circulante. A perda rápida de apenas 1,5 a 2 litros de sangue leva à queda brusca da pressão arterial, perda de consciência, choque hipovolêmico e morte em poucos minutos se ninguém agir de forma correta e imediata.

Como você deve agir para conter uma hemorragia grave enquanto o socorro médico (SAMU 192 ou Resgate 193) está a caminho?
1. Proteção Individual: antes de tocar no ferimento, calce luvas de procedimento descartáveis para se proteger contra contaminações biológicas;
2. Pressão Direta Contínua: coloque uma compressa de gaze estéril ou um pano limpo diretamente sobre o corte e faça uma pressão manual firme e constante com a palma da mão;
3. Não retire panos encharcados: se o sangue começar a vazar pelo pano, NUNCA retire o primeiro pano! A retirada do pano arrancaria o coágulo de fibrina que o próprio corpo está tentando formar. Coloque novos panos ou ataduras por cima do primeiro e continue apertando com força;
4. Elevação do membro: se o ferimento for no braço ou na perna e não houver suspeita de fratura óssea, mantenha o membro ferido ligeiramente elevado acima do nível do coração para diminuir a pressão sanguínea local;
5. Mantenha a vítima calma e aquecida: deite a pessoa de costas no chão, cubra-a com uma manta para evitar a hipotermia (o sangue perdido faz a temperatura corporal cair rapidamente) e nunca dê água ou comida para a vítima. A sua calma e rapidez na compressão direta mantêm o sangue fluindo para o cérebro até a chegada dos paramédicos!`,
    perguntasDebate: [
      "Onde está localizada a caixa de primeiros socorros com gazes e ataduras mais próxima do seu setor?",
      "Por que nunca devemos retirar o primeiro curativo encharcado de sangue de cima do corte profundo?",
      "Qual é o número de telefone de emergência médica que você deve discar imediatamente diante de um acidente grave?",
    ],
  },
  {
    id: "dds_ps_02",
    codigo: "PS-02",
    titulo: "Desengasgo de Emergência: A Manobra de Heimlich que Salva Vidas",
    categoria: "Primeiros Socorros e Emergências",
    nrReferencia: "NR-07",
    objetivo: "Capacitar a equipe a reconhecer a obstrução total das vias aéreas por corpos estranhos (engasgo) e executar a Manobra de Heimlich com perfeição.",
    pontosPrincipais: [
      "Sinal universal de engasgo: a pessoa leva as duas mãos ao pescoço, não consegue falar, tossir ou respirar, e a face começa a ficar roxa (cianose).",
      "Se a pessoa estiver tossindo com força (obstrução parcial), NÃO bata nas costas: apenas a incentive a continuar tossindo com força.",
      "Na obstrução total: posicione-se atrás da vítima, feche uma mão em punho contra o abdômen (entre o umbigo e o osso esterno) e faça compressões rápidas para dentro e para cima em formato de 'J'.",
      "Se a vítima perder a consciência: deite-a no chão de costas e inicie imediatamente manobras de Reanimação Cardiorrespiratória (RCP).",
    ],
    conteudo: `Olá a todos! Hoje nosso Diálogo traz uma capacitação prática que você pode precisar usar tanto aqui no refeitório da empresa quanto na mesa de almoço com sua família em casa: o 'Desengasgo de Emergência e a Manobra de Heimlich'.

O engasgo grave por pedaços de carne, ossos, pão ou pequenos objetos é uma emergência médica assustadora. Quando um pedaço de alimento desce pelo caminho errado e se aloja na traqueia, a passagem de ar para os pulmões é bloqueada 100%. Em menos de 4 minutos sem oxigênio, o cérebro começa a sofrer lesões neurológicas irreversíveis e o coração entra em parada.

Como identificar e agir imediatamente:
1. Obstrução Parcial: se a pessoa engasgou, mas ainda consegue falar com voz fraca ou tossir com barulho, as vias aéreas não estão totalmente fechadas. Nesse caso, NUNCA dê tapas nas costas da pessoa nem dê água para beber (o tapa nas costas pode empurrar o alimento ainda mais fundo). Apenas fique ao lado dela e diga calmamente: 'Tussa com força! Continue tossindo!';
2. Obstrução Total: se a pessoa arregalar os olhos em pânico, levar as duas mãos ao pescoço (sinal universal de asfixia), não conseguir emitir nenhum som e a boca começar a ficar arroxeada, ela está em asfixia total. Aja em menos de 10 segundos executando a Manobra de Heimlich:
   - Posicione-se em pé atrás da vítima, abrindo suas pernas para criar uma base sólida;
   - Abrace a cintura da pessoa por trás;
   - Feche uma das mãos em punho, com o polegar voltado para o abdômen da vítima, e posicione a mão dois dedos acima do umbigo (bem abaixo do osso esterno do peito);
   - Segure o punho com a sua outra mão espalmada;
   - Aplique puxões secos, fortes e rápidos para DENTRO E PARA CIMA (como se estivesse desenhando a letra 'J' no ar).

Esse movimento comprime o diafragma e empurra o ar residual que sobrou dentro dos pulmões para fora, criando uma pressão que ejeta o alimento como uma rolha de champanhe. Repita o movimento até o corpo estranho sair ou a pessoa voltar a respirar. Essa técnica simples já salvou centenas de milhares de vidas no mundo!`,
    perguntasDebate: [
      "Você já presenciou alguém engasgando gravemente no refeitório ou em casa?",
      "Qual é a posição exata das mãos para executar a manobra de desengasgo (Heimlich)?",
      "Por que nunca devemos oferecer água para uma pessoa que está em processo de engasgamento total?",
    ],
  },
  {
    id: "dds_ps_03",
    codigo: "PS-03",
    titulo: "Parada Cardiorrespiratória (PCR), Massagem Cardíaca (RCP) e Uso do DEA",
    categoria: "Primeiros Socorros e Emergências",
    nrReferencia: "NR-07",
    objetivo: "Treinar a cadeia de sobrevivência da parada cardíaca, o reconhecimento da ausência de pulso/respiração e o ritmo de compressões torácicas.",
    pontosPrincipais: [
      "A cada minuto que uma vítima de parada cardíaca fica sem massagem cardíaca, a chance de sobrevivência cai cerca de 10%.",
      "Reconhecimento: chame a pessoa pelos ombros com vigor e verifique se o peito sobe e desce em até 10 segundos. Se não responder e não respirar, é Parada Cardíaca!",
      "Ação imediata: aponte para alguém específico e comande 'Ligue para o SAMU 192 e traga o DEA!'; inicie imediatamente as compressões torácicas.",
      "Frequência e profundidade: comprimir o centro do peito com os braços esticados no ritmo de 100 a 120 compressões por minuto (ritmo da música 'Stayin' Alive') e profundidade de 5 cm.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje é o procedimento de maior impacto em emergências médicas mundiais: a 'Reanimação Cardiorrespiratória (RCP) e a Utilização do Desfibrilador Externo Automático (DEA)'.

O infarto agudo do miocárdio e a parada cardiorrespiratória súbita podem acontecer com qualquer pessoa, a qualquer momento e em qualquer idade. Quando o coração para de bater, o sangue oxigenado para instantaneamente de circular para o cérebro. Se ninguém iniciar as manobras de massagem cardíaca externa imediatamente, as células do cérebro morrem após 4 a 6 minutos. Quando a ambulância do SAMU chegar 10 ou 15 minutos depois, já será tarde demais. Quem realmente salva a vida da vítima é a pessoa que está ao lado dela nos primeiros 5 minutos!

Passo a passo da Cadeia de Sobrevivência:
1. Avalie a responsividade: ajoelhe-se ao lado da vítima, bata firmemente com as duas mãos nos dois ombros dela e chame em voz alta: 'SENHOR! SENHOR! VOCÊ ESTÁ ME OUVINDO?';
2. Verifique a respiração: aproxime seu rosto do nariz da vítima e olhe para o peito por no máximo 10 segundos. Se a pessoa não responder e não estiver respirando (ou apenas com suspiros agônicos tipo 'gasping'), ela está em PARADA CARDÍACA;
3. Peça ajuda de forma direta: aponte o dedo para uma pessoa específica e comande com autoridade: 'VOCÊ! Ligue 192 para o SAMU e traga o aparelho DEA do setor imediatamente!';
4. Inicie as Compressões Torácicas (RCP):
   - Posicione o calcanhar de uma mão no centro do peito da vítima (na metade inferior do osso esterno, entre os mamilos);
   - Entrelace os dedos da outra mão por cima;
   - Mantenha os braços totalmente retos e esticados (sem dobrar os cotovelos), usando o peso do seu próprio tronco para empurrar o peito;
   - Comprima o tórax com profundidade de 5 a 6 centímetros, permitindo que o peito retorne totalmente à posição inicial entre cada compressão;
   - Mantenha o ritmo acelerado e constante de 100 a 120 batimentos por minuto (você pode mentalizar o ritmo da famosa música 'Stayin' Alive' dos Bee Gees).
5. Se houver o DEA disponível: abra a tampa do aparelho, cole as pás adesivas no peito nu da vítima conforme o desenho e siga rigorosamente as instruções de voz do aparelho. Continue a massagem sem parar até a chegada dos médicos. A sua coragem de iniciar a massagem é o que faz a diferença entre a vida e a morte!`,
    perguntasDebate: [
      "Você sabe onde fica guardado o Desfibrilador Externo Automático (DEA) nas instalações da empresa?",
      "Qual é a posição correta do corpo e dos braços para fazer uma massagem cardíaca eficiente sem se cansar rapidamente?",
      "Por que é fundamental apontar para uma pessoa específica ao pedir para ligar para o SAMU em vez de gritar para o grupo?",
    ],
  },

  // --- Direção Defensiva e Segurança no Trânsito ---
  {
    id: "dds_transito_01",
    codigo: "DIR-01",
    titulo: "Direção Defensiva: Os Perigos do Celular ao Volante e a Distração",
    categoria: "Direção Defensiva e Trânsito",
    nrReferencia: "Código de Trânsito",
    objetivo: "Sensibilizar motoristas e motociclistas sobre o risco mortal do uso de smartphones, mensagens de texto e aplicativos durante a condução.",
    pontosPrincipais: [
      "Digitar ou ler uma mensagem no celular a 80 km/h equivale a dirigir vendado por uma distância de quase 100 metros (um campo de futebol inteiro).",
      "O uso do celular multiplica por 23 vezes a probabilidade de colisão grave ou atropelamento.",
      "Viva-voz e mensagens de áudio geram distração cognitiva severa que reduz em mais de 50% o campo visual periférico.",
      "Se precisar atender uma chamada urgente ou consultar o GPS, pare o veículo em local seguro e regulamentado.",
    ],
    conteudo: `Olá a todos! Nosso DDS de hoje trata de um dos maiores vilões das ruas e rodovias contemporâneas: o uso do Telefone Celular durante a condução de veículos e motocicletas no trabalho e nos trajetos diários.

O trânsito brasileiro é um dos mais violentos do planeta, ceifando mais de 30 mil vidas todos os anos e deixando centenas de milhares de pessoas com sequelas permanentes e amputações. Historicamente, o álcool e o excesso de velocidade eram os principais causadores de acidentes. Hoje, segundo estudos da Associação Brasileira de Medicina do Tráfego (ABRAMET), a distração causada pelo smartphone já é a terceira maior causa de mortes no trânsito nacional!

Muitos motoristas experientes dizem: 'Ah, eu só dou uma olhadinha rápida de 3 segundos na notificação do WhatsApp no semáforo ou na reta'. Vamos fazer as contas da física: um veículo transitando a 80 km/h percorre mais de 22 metros a cada segundo. Ao desviar os olhos e o cérebro para o visor do celular por apenas 4 segundos, você percorreu quase 100 metros totalmente cego para o que está acontecendo na pista à sua frente! É o tempo suficiente para não ver um pedestre atravessando na faixa, não enxergar um motociclista freando ou invadir a pista contrária de frente contra uma carreta.

Além disso, a distração do celular não é apenas visual; ela é cognitiva e mental. Quando você escuta ou grava um áudio complicado, a parte do seu cérebro responsável pelo processamento espacial e tempo de reação fica sobrecarregada, reduzindo drasticamente seus reflexos de frenagem. A mensagem de texto pode esperar, a notificação da rede social pode esperar, mas a sua vida e a vida de quem está no trânsito não têm volta. Celular e direção nunca se misturam!`,
    perguntasDebate: [
      "Você já se pegou olhando para a tela do celular enquanto dirigia ou pilotava sua motocicleta?",
      "Você costuma usar suporte veicular adequado para o GPS e programa a rota antes de dar a partida no motor?",
      "O que você sente quando está como passageiro em um veículo e percebe que o motorista está digitando ao volante?",
    ],
  },
  {
    id: "dds_transito_02",
    codigo: "DIR-02",
    titulo: "Distância de Seguimento, Chuva, Pista Molhada e Aquaplanagem",
    categoria: "Direção Defensiva e Trânsito",
    nrReferencia: "Código de Trânsito",
    objetivo: "Ensinar a regra dos 3 segundos para distância de segurança entre veículos e como agir em situações de pista molhada e perda de aderência.",
    pontosPrincipais: [
      "Em pista seca, mantenha a 'Regra dos 3 Segundos' de distância do veículo à frente; em pista molhada ou chuva, dobre para 6 segundos.",
      "Aquaplanagem: ocorre quando os pneus perdem o contato com o asfalto e passam a flutuar sobre uma lâmina de água acumulada.",
      "O que fazer na aquaplanagem: NUNCA pise no freio bruscamente nem dê golpes no volante; tire o pé do acelerador suavemente e segure o volante reto.",
      "Pneus carecas e palhetas do limpador ressecadas multiplicam o risco de acidentes graves em dias de chuva.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje é a 'Condução Segura sob Condições Adversas de Chuva e a Prevenção da Aquaplanagem'.

Quando o céu escurece e a chuva começa a cair nas ruas e rodovias, as condições de atrito entre os pneus do veículo e o pavimento mudam radicalmente. Nos primeiros minutos de chuva, a água se mistura com a poeira e o óleo acumulados no asfalto, transformando a pista em um verdadeiro sabão escorregadio. A distância necessária para frear um carro ou caminhão com segurança mais do que dobra em comparação com a pista seca.

Como aplicar os princípios da Direção Defensiva em dias chuvosos:
1. Regra dos 3 Segundos em Pista Seca / 6 Segundos na Chuva: quando o veículo da sua frente passar por um ponto de referência fixo (uma placa, poste ou árvore), comece a contar mentalmente: 'Mil e um, mil e dois, mil e três, mil e quatro, mil e cinco, mil e seis'. Se você passar pelo mesmo ponto antes de terminar a contagem, você está colado demais e não terá espaço para parar caso ele freie bruscamente;
2. Reduza a Velocidade: os limites de velocidade das placas são calculados para condições perfeitas de tempo bom. Com chuva, reduza sua velocidade em pelo menos 20% a 30% e acenda os faróis baixos (nunca farol alto em neblina);
3. Como reagir à Aquaplanagem: se o seu carro passar por uma poça profunda em velocidade e a direção ficar subitamente leve (o carro começa a flutuar sobre a água sem responder ao volante), MANTENHA A CALMA!
   - Erro Fatal: pisar no freio com força ou puxar o volante bruscamente. Se você fizer isso, quando os pneus tocarem o asfalto novamente o veículo capotará ou rodará na pista;
   - Procedimento Correto: retire o pé do acelerador suavemente, segure o volante com as duas mãos perfeitamente alinhado em linha reta e deixe o próprio atrito natural da água desacelerar o carro até os pneus retomarem o contato firme com o solo. Dirija com prudência e chegue seguro ao seu destino!`,
    perguntasDebate: [
      "Você sabe como medir a profundidade dos sulcos (frisos) dos pneus do seu veículo através do indicador TWI?",
      "Você já passou pela experiência de aquaplanar em uma rodovia durante uma chuva forte?",
      "Por que devemos dobrar a distância de segurança do veículo da frente em dias de pista molhada?",
    ],
  },

  // --- Saúde Mental, Prevenção ao Burnout e Fatores Psicossociais ---
  {
    id: "dds_psico_01",
    codigo: "PSI-01",
    titulo: "Saúde Mental no Trabalho: Prevenção ao Esgotamento e Burnout (NR-01)",
    categoria: "Saúde Mental e Bem-Estar",
    nrReferencia: "NR-01",
    objetivo: "Sensibilizar sobre os impactos dos fatores psicossociais, identificação de sintomas de estresse crônico e a importância de buscar apoio.",
    pontosPrincipais: [
      "A Síndrome de Burnout (esgotamento profissional crônico) é reconhecida oficialmente pela OMS como doença do trabalho.",
      "Sintomas clássicos: exaustão física e emocional profunda, insônia frequente, perda de entusiasmo, irritabilidade e sensação de ineficácia.",
      "Cuidar da mente é tão importante quanto usar EPIs físicos: a sobrecarga mental diminui a atenção e aumenta o risco de acidentes.",
      "A empresa oferece canais de escuta e acolhimento confidencial para quem estiver passando por momentos de sofrimento mental.",
    ],
    conteudo: `Olá a todos! Nosso Diálogo Diário de Segurança de hoje traz um tema de extrema relevância humana e que tem sido cada vez mais valorizado pela legislação trabalhista e pela NR-01: a 'Saúde Mental no Ambiente de Trabalho e a Prevenção ao Burnout'.

Por muitas décadas, a segurança do trabalho focou quase exclusivamente nos riscos visíveis: capacetes, máquinas cortantes, ruídos e produtos químicos. No entanto, o ser humano é uma unidade completa de corpo e mente. Se a mente estiver sobrecarregada, exausta ou sofrendo com ansiedade crônica e depressão, todo o corpo adoece. Um trabalhador mentalmente esgotado perde a concentração, tem a imunidade rebaixada e fica muito mais vulnerável a sofrer acidentes operacionais graves.

A Síndrome de Burnout é o estado de exaustão extrema resultante do estresse crônico no ambiente de trabalho que não foi gerenciado com sucesso. Ela não surge de um dia para o outro; ela se manifesta aos poucos através de sinais de alarme:
- Dificuldade crônica para dormir e sensação de acordar já cansado e sem energia;
- Dores musculares de cabeça e estômago sem causa clínica aparente;
- Irritabilidade excessiva, isolamento dos colegas e perda do prazer nas atividades que antes gostava de fazer;
- Sensação de que nada do que você faz tem valor ou é suficiente.

Como cultivar o bem-estar mental diário:
1. Respeite os seus limites: faça pausas regulares durante a jornada para respirar fundo e relaxar;
2. Desconecte-se após o expediente: ao chegar em casa, dê atenção à sua família, pratique uma atividade física e evite ficar checando mensagens de trabalho fora do horário;
3. Não guarde a angústia para si: falar sobre o que você sente não é fraqueza, é um ato de coragem! Se você estiver se sentindo sobrecarregado, converse com a sua liderança, com o SESMT ou com o nosso serviço de apoio psicológico. Cuidar de você é a nossa maior prioridade!`,
    perguntasDebate: [
      "O que você costuma fazer para aliviar a tensão e o estresse após um dia puxado de trabalho?",
      "Você consegue se desligar mentalmente das obrigações profissionais quando está de folga com sua família?",
      "Como podemos construir um clima de companheirismo e apoio mútuo mais leve na nossa equipe?",
    ],
  },
  {
    id: "dds_psico_02",
    codigo: "PSI-02",
    titulo: "Respeito Mútuo, Cultura de Paz e Combate ao Assédio no Trabalho (NR-05)",
    categoria: "Saúde Mental e Bem-Estar",
    nrReferencia: "NR-05",
    objetivo: "Conscientizar sobre a tolerância zero contra assédio moral, assédio sexual, preconceitos e brincadeiras ofensivas no ambiente corporativo.",
    pontosPrincipais: [
      "Todo trabalhador tem o direito inalienável a um ambiente de trabalho digno, respeitoso e livre de humilhações.",
      "Assédio moral: condutas abusivas reiteradas, piadas humilhantes, isolamento social ou cobranças desmedidas com xingamentos.",
      "Assédio sexual: qualquer conduta de natureza sexual não solicitada, constrangimento ou investidas verbais/físicas indesejadas.",
      "Utilize os canais confidenciais de denúncia e ouvidoria da empresa para relatar desvios de conduta com total sigilo e proteção.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje é a 'Cultura de Respeito, Ética nas Relações e Combate a Todas as Formas de Assédio', conforme estabelece a legislação brasileira e as novas diretrizes da NR-05 e CIPA.

Passamos mais tempo com nossos colegas de trabalho durante a semana do que com nossas próprias famílias em casa. Por isso, o ambiente de trabalho deve ser um local de acolhimento, colaboração, aprendizado e respeito mútuo. Nenhuma meta produtiva, prazo de entrega ou cargo de chefia justifica a falta de respeito, a grosseria ou a humilhação de um ser humano.

Vamos compreender os limites claros da convivência profissional:
1. Assédio Moral: é a exposição repetida e prolongada de uma pessoa a situações vexatórias, gritos, ofensas verbais em público, isolamento deliberado ou atribuição de apelidos pejorativos que firam a honra e a dignidade do colega. Aquela velha desculpa de que 'era só uma brincadeira' não é aceitável quando a outra pessoa se sente diminuída ou ofendida;
2. Assédio Sexual: são propostas, toques não consentidos, comentários invasivos sobre o corpo ou chantagens de favorecimento que geram constrangimento e violam a liberdade e a dignidade da pessoa. A empresa adota tolerância zero absoluta para esse tipo de conduta;
3. Diversidade e Inclusão: o respeito a todas as origens, raças, gêneros, religiões e orientações é um valor inegociável da nossa organização.

Se você estiver sofrendo ou presenciando qualquer conduta de assédio ou preconceito, não se cale! Procure a CIPA, o setor de Recursos Humanos ou utilize o Canal de Denúncias Confidencial da empresa, onde o anonimato é garantido por lei e as investigações são conduzidas com rigor e imparcialidade. Um ambiente saudável é construído pelo respeito de cada um de nós!`,
    perguntasDebate: [
      "Qual é a diferença entre uma brincadeira sadia entre amigos e um comentário que gera humilhação e desrespeito?",
      "Você conhece os canais seguros e confidenciais de denúncia disponibilizados pela empresa?",
      "Como você contribui diariamente para que nosso setor tenha um clima de colaboração e acolhimento positivo?",
    ],
  },

  // --- Programa 5S, Ordem, Limpeza e Prevenção de Quedas ---
  {
    id: "dds_5s_01",
    codigo: "5S-01",
    titulo: "Metodologia 5S: A Base da Produtividade e da Prevenção de Acidentes",
    categoria: "Organização e Programa 5S",
    nrReferencia: "NR-01",
    objetivo: "Explicar os 5 Sensos (Utilização, Organização, Limpeza, Padronização e Autodisciplina) e seu impacto direto na segurança operacional.",
    pontosPrincipais: [
      "Seiri (Utilização): separar o que é útil do que é inútil e descartar o excesso de entulho do posto.",
      "Seiton (Organização): um lugar para cada coisa e cada coisa no seu devido lugar (ferramentas identificadas e acessíveis).",
      "Seiso (Limpeza): limpar inspecionando e eliminando fontes de sujeira, vazamentos e poeira.",
      "Seiketsu (Padronização) e Shitsuke (Disciplina): manter os padrões estabelecidos e praticar o autocuidado contínuo.",
    ],
    conteudo: `Olá a todos! Nosso Diálogo Diário de Segurança de hoje trata da 'Metodologia 5S e sua Ligação Direta com a Prevenção de Acidentes de Trabalho'.

Muitas pessoas pensam que o Programa 5S é apenas uma 'faxina geral' para deixar o setor bonito quando a gerência ou clientes visitam a fábrica. Esse é um grande equívoco. O 5S é uma filosofia de trabalho originada no Japão que estabelece a base fundamental para qualquer ambiente seguro, ergonômico e de alta produtividade. Um ambiente bagunçado, sujo e desorganizado é um ímã que atrai acidentes, desperdícios e retrabalho.

Vamos relembrar o significado prático de cada um dos 5 Sensos no nosso dia a dia:
1. SEIRI (Senso de Utilização): olhe para a sua bancada ou armário de trabalho hoje. O que você realmente usa todo dia? O que não serve mais deve ser descartado ou enviado para a reciclagem. Ferramentas quebradas e sucatas acumuladas roubam espaço e causam acidentes;
2. SEITON (Senso de Organização): 'Um lugar para cada coisa e cada coisa em seu lugar'. Ao terminar de usar uma chave de fenda, uma furadeira ou um produto químico, guarde-o imediatamente no painel de ferramentas ou prateleira correta. Quando as coisas estão no lugar certo, ninguém perde tempo procurando nem corre o risco de pegar a ferramenta errada com pressa;
3. SEISO (Senso de Limpeza): mais importante do que limpar é NÃO SUJAR e eliminar as fontes de sujeira na raiz. Limpar uma máquina é a melhor oportunidade para inspecionar parafusos soltos, vazamentos de mangueiras hidráulicas ou fios roídos;
4. SEIKETSU (Senso de Saúde e Padronização): criar regras visuais claras, manter pisos demarcados, lixeiras sinalizadas e cuidar da higiene pessoal e dos uniformes;
5. SHITSUKE (Senso de Autodisciplina): fazer o que é certo mesmo quando ninguém estiver olhando. Praticar o 5S todos os dias transforma a organização em um hábito natural. Posto limpo e organizado é posto seguro!`,
    perguntasDebate: [
      "Como está a organização da sua bancada de trabalho e do painel de ferramentas no dia de hoje?",
      "Você já perdeu tempo ou quase se machucou procurando uma ferramenta em um local desorganizado?",
      "Qual dos 5 Sensos você considera que nossa equipe precisa aprimorar mais no setor?",
    ],
  },
  {
    id: "dds_5s_02",
    codigo: "5S-02",
    titulo: "Prevenção de Tropeços, Escorregões e Quedas de Mesmo Nível (NR-01)",
    categoria: "Organização e Programa 5S",
    nrReferencia: "NR-01",
    objetivo: "Sensibilizar sobre as quedas de mesmo nível, que representam a maior causa de lesões leves a moderadas no trabalho diário.",
    pontosPrincipais: [
      "Escorregões em pisos molhados/oleosos e tropeços em cabos soltos respondem por mais de 20% de todas as entorses, fraturas e contusões industriais.",
      "Regra imediata do 'Quem viu, limpou/recolheu': não passe por cima de poças de água, óleo ou fios esticados sem agir.",
      "Uso obrigatório de calçado de segurança com solado antiderrapante em perfeito estado de conservação (sem solas lisas gastas).",
      "Manter atenção ao caminhar e segurar sempre no corrimão ao subir e descer escadas.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje parece simples, mas trata de um dos maiores responsáveis por atestados médicos, entorses de tornozelo e fraturas de punho em todo o mundo: os 'Tropeços, Escorregões e Quedas de Mesmo Nível'.

Quando pensamos em quedas perigosas, imaginamos alguém caindo de cima de um telhado a 10 metros de altura. No entanto, estatisticamente, ocorrem dez vezes mais lesões por quedas de mesmo nível — ou seja, pessoas que tropeçam no chão plano enquanto caminham pelo pátio, escritório ou galpão. Uma queda boba para trás em piso duro de concreto pode fazer a cabeça bater com violência no chão, provocando traumatismo craniano grave, ou romper os ligamentos do joelho e tornozelo.

Quais são as três principais causas das quedas de mesmo nível?
1. Pisos Escorregadios: poças de água de limpeza sem placa de sinalização 'Piso Molhado', pingos de óleo lubrificante de máquinas ou restos de graxa. Se você notar qualquer líquido no chão, não passe reto pensando 'alguém vai limpar'. Se for pequeno, limpe na hora com pano absorvente; se for grande, sinalize o local e avise a equipe de higienização imediatamente;
2. Obstáculos no Caminho: cabos de extensões elétricas cruzando corredores de pedestres sem canaleta de proteção de borracha, caixas de papelão deixadas no piso, paletes vazios nos cantos e ferramentas caídas. Mantenha os caminhos 100% livres;
3. Comportamento do Trabalhador: correr dentro da empresa, carregar pilhas de caixas tão altas nos braços que tapam a visão dos próprios pés, e descer escadas olhando para o celular sem segurar no corrimão.

A regra de ouro nas escadarias: UMA MÃO PARA VOCÊ, UMA MÃO PARA O CORRIMÃO! Desça degrau por degrau, sem pressa e sempre com a mão firme no corrimão. Se você escorregar, o corrimão segurará seu peso e evitará a queda. Caminhe com atenção e segurança em cada passo!`,
    perguntasDebate: [
      "Você sempre segura no corrimão ao subir e descer as escadas da empresa?",
      "O que você faz no mesmo instante em que derrama água ou óleo acidentalmente no chão?",
      "O solado da sua botina de segurança está com as ranhuras antiderrapantes íntegras ou já está desgastado e liso?",
    ],
  },

  // --- Meio Ambiente e Sustentabilidade Operacional ---
  {
    id: "dds_amb_01",
    codigo: "AMB-01",
    titulo: "Contenção de Vazamentos Químicos e Uso do Kit de Emergência Ambiental",
    categoria: "Meio Ambiente e Sustentabilidade",
    nrReferencia: "ISO 14001 / NR-20",
    objetivo: "Treinar o procedimento de resposta a emergências ambientais em caso de vazamento de óleo e produtos perigosos.",
    pontosPrincipais: [
      "Um único litro de óleo lubrificante despejado em bueiro ou solo pode contaminar até 1 milhão de litros de água potável subterrânea.",
      "Ação imediata: estancar a fonte do vazamento (fechar registro/tombar o galão para cima) e conter o espalhamento antes que atinja canaletas ou ralos.",
      "Utilização do Kit de Mitigação Ambiental: cordões absorventes de polipropileno para cercar a poça, mantas absorventes e turfa vegetal.",
      "Todo material contaminado utilizado na contenção deve ser descartado em tambores identificados como Resíduo Perigoso Classe I.",
    ],
    conteudo: `Olá a todos! Nosso Diálogo Diário de hoje trata de um compromisso ético e legal vital da nossa organização: a 'Proteção Ambiental, Prevenção da Poluição e Resposta a Vazamentos de Óleo e Produtos Químicos'.

Em nossas operações cotidianas, manuseamos tambores de óleo hidráulico, óleo de corte, combustíveis e produtos químicos. Se uma mangueira romper, se uma empilhadeira perfurar um tambor com o garfo ou se uma válvula falhar, centenas de litros de produtos tóxicos podem escorrer pelo pátio. Se esse produto atingir a canaleta de águas pluviais ou o solo, ele contaminará rios, lençóis freáticos e causará crimes ambientais graves com pesadas multas e danos ecológicos irreparáveis.

Como responder com rapidez e eficácia diante de um vazamento acidental:
1. Controle na Fonte: se puder ser feito com segurança e com os devidos EPIs, feche a válvula, aperte a conexão ou vire o tambor tombado com o furo para cima para interromper a saída do produto;
2. Bloqueio de Ralos e Canaletas: a prioridade absoluta número um é IMPEDIR QUE O LÍQUIDO ENTRE EM RALOS OU NA TERRA! Pegue os cordões absorventes do Kit Ambiental ou use terra/areia para formar uma barreira de contenção (dique) ao redor de todos os bueiros próximos;
3. Absorção da Mancha: jogue turfa vegetal absorvente orgânica ou aplique as mantas de polipropileno absorvente sobre a poça de óleo até que todo o líquido seja totalmente absorvido;
4. Recolhimento e Descarte Correto: recolha as mantas encharcadas, a turfa e o solo contaminado com pá antichispa e coloque-os dentro dos sacos plásticos grossos ou bombonas amarelas identificadas como 'RESÍDUO CLASSE I - CONTAMINADO COM ÓLEO'. NUNCA jogue água com mangueira para 'lavar' a poça de óleo para o ralo! A responsabilidade ambiental é dever de cada um de nós!`,
    perguntasDebate: [
      "Você sabe onde fica localizado o Kit de Emergência Ambiental (cordões, mantas e turfa) no seu setor?",
      "Por que é expressamente proibido lavar vazamentos de óleo com mangueira de água em direção aos ralos?",
      "Qual é o procedimento de descarte correto para panos, estopas e luvas contaminadas com graxa e óleo?",
    ],
  },
];
