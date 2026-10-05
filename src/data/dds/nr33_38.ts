import { DdsTemaItem } from "../../types";

export const TEMAS_NR33_38: DdsTemaItem[] = [
  // --- NR-33: Segurança e Saúde nos Trabalhos em Espaços Confinados ---
  {
    id: "dds_nr33_01",
    codigo: "NR33-01",
    titulo: "Espaços Confinados: O Que São e Como Reconhecê-los (NR-33)",
    categoria: "Espaços Confinados (NR-33)",
    nrReferencia: "NR-33",
    objetivo: "Conceituar espaço confinado, identificar os riscos de atmosfera perigosa e entender a obrigatoriedade do cadastramento e sinalização do local.",
    pontosPrincipais: [
      "Espaço confinado: qualquer área não projetada para ocupação humana contínua, com meios limitados de entrada/saída e ventilação deficiente.",
      "Exemplos típicos: caixas d'água, galerias subterrâneas, tanques de armazenamento, silos, reatores, poços de visita, tubulações e digestores.",
      "A falta de oxigênio ou acúmulo de gases tóxicos/inflamáveis não podem ser detectados pelo olfato humano.",
      "NUNCA entre em um espaço confinado sem a Permissão de Entrada e Trabalho (PET) formalmente emitida e assinada pelo Supervisor de Entrada.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje é a Norma Regulamentadora nº 33 (NR-33) e o Reconhecimento e Prevenção de Riscos Mortais em Espaços Confinados.

Os acidentes em espaços confinados estão entre os mais trágicos e letais de toda a história industrial. Uma estatística aterradora mundial da OSHA e da Fundacentro mostra que, em mais de 60% das mortes em espaços confinados, as vítimas secundárias são os próprios colegas de trabalho ou supervisores que tentaram entrar no local no impulso para socorrer a primeira vítima e também caíram desmaiados e sem vida em poucos segundos.

Mas afinal, o que é um Espaço Confinado conforme a NR-33? É qualquer área ou ambiente que atende simultaneamente a três características:
1. Não foi projetado para ocupação humana contínua;
2. Possui meios limitados de entrada e saída (como uma boca de visita estreita, escada marinheiro ou bueiro);
3. Possui ventilação natural insuficiente para remover contaminantes perigosos ou pode existir deficiência ou enriquecimento de oxigênio.

Exemplos no nosso dia a dia incluem: tanques de combustível, caixas d'água, reservatórios subterrâneos, galerias de esgoto pluvial, poços de elevador profundos, silos de grãos, fornos industriais e porões de cabos.

O perigo mortal mais frequente é a Atmosfera Imediatamente Perigosa à Vida ou à Saúde (IPVS). A perda de oxigênio consumido por ferrugem metálica ou a liberação silenciosa de gases asfixiantes como o gás sulfídrico (H2S), monóxido de carbono (CO) ou metano não dão aviso prévio. A pessoa dá duas respiradas no ar contaminado, perde a consciência instantaneamente sem dor e o coração para em minutos.

Por isso, a regra de sobrevivência número um da nossa empresa é inegociável: NINGUÉM ENTRA EM UM ESPAÇO CONFINADO SEM CURSO DE NR-33 VÁLIDO, SEM EQUIPE COMPLETA (VIGIA + SUPERVISOR + ENTRANTE) E SEM A PERMISSÃO DE ENTRADA E TRABALHO (PET) PREENCHIDA E APROVADA! Respeite o espaço confinado: a sua vida vale mais que qualquer pressa!`,
    perguntasDebate: [
      "Quais espaços confinados existem nas dependências da nossa empresa ou nas instalações dos nossos clientes?",
      "Por que tantas pessoas morrem tentando resgatar colegas em espaços confinados sem equipamento autônomo de ar?",
      "O que você faz se encontrar a tampa de um espaço confinado aberta sem vigia na porta?",
    ],
  },
  {
    id: "dds_nr33_02",
    codigo: "NR33-02",
    titulo: "O Papel Sagrado do Vigia e o Monitoramento Contínuo da Atmosfera",
    categoria: "Espaços Confinados (NR-33)",
    nrReferencia: "NR-33",
    objetivo: "Explicar as responsabilidades inegociáveis do vigia de espaço confinado, o uso do detector multigás e a proibição de abandonar o posto.",
    pontosPrincipais: [
      "O Vigia de Espaço Confinado NUNCA, sob nenhuma justificativa, pode abandonar a entrada do espaço ou realizar outras tarefas paralelas.",
      "O Vigia NUNCA deve entrar no espaço confinado, nem mesmo para tentar realizar o resgate (seu papel é acionar a equipe de emergência externa).",
      "O detector multigás calibrado deve monitorar continuamente a atmosfera (nível de Oxigênio 19,5% a 23%, LEL combustíveis, H2S e CO).",
      "Ventilação mecânica insufladora/exaustora contínua obrigatória durante 100% do tempo de permanência no interior.",
    ],
    conteudo: `Olá a todos! Nosso DDS de hoje aprofunda um dos papéis mais sagrados e de maior responsabilidade da NR-33: a função do VIGIA DE ESPAÇO CONFINADO e o Monitoramento Atmosférico Contínuo.

Quando uma equipe de trabalhadores autorizados (entrantes) desce através de uma boca de visita para dentro de um tanque ou galeria, a vida deles fica 100% nas mãos da pessoa que permanece do lado de fora: o Vigia. Se o vigia se distrair, sair para tomar um café ou for fazer outra tarefa, os colegas lá embaixo ficam completamente desamparados.

A NR-33 estabelece regras e deveres inquestionáveis para o Vigia:
1. Permanência Contínua: o vigia deve permanecer fisicamente posicionado junto à entrada do espaço confinado durante todo o tempo em que houver pessoas no interior, mantendo comunicação visual ou por rádio constante com os entrantes;
2. Proibição de Tarefas Paralelas: o vigia não pode ajudar a carregar ferramentas, não pode preencher relatórios alheios e não pode olhar para o celular; seu único foco é a segurança da entrada;
3. Proibição Absoluta de Entrar: mesmo que um colega desmaie lá dentro, o vigia NUNCA PODE ENTRAR NO ESPAÇO! Se o vigia entrar sem ar mandado, ele também desmaiará e ninguém sobrará do lado de fora para acionar o resgate. O dever do vigia é operar o tripé com guincho resgatador de fora, insuflar ventilação máxima e acionar imediatamente a equipe de resgate especializada;
4. Monitoramento Atmosférico com Detector 4 Gases: o detector multigás deve ser testado (bump test) e calibrado. Ele monitora 4 parâmetros vitais:
   - Oxigênio (O2): deve estar estritamente entre 19,5% e 23,0% em volume;
   - Explosividade (LEL): deve estar abaixo de 10% do limite inferior de explosividade de gases combustíveis;
   - Monóxido de Carbono (CO): gás asfixiante inodoro que bloqueia o transporte de oxigênio no sangue (limite máximo de 39 ppm);
   - Gás Sulfídrico (H2S): gás extremamente tóxico com cheiro inicial de ovo podre que anestesia o olfato e paralisa a respiração (limite de 8 ppm). Se o alarme do multigás apitar, a ordem é uma só: EVACUAÇÃO IMEDIATA! A segurança não aceita improvisos.`,
    perguntasDebate: [
      "Por que o Vigia de espaço confinado é expressamente proibido de entrar no tanque mesmo para tentar socorrer um colega?",
      "Você sabe quais são os 4 gases monitorados pelo detector multigás utilizado pela nossa equipe?",
      "O que deve ser feito se o sistema de ventilação mecânica parar de funcionar durante a atividade no interior do espaço?",
    ],
  },

  // --- NR-35: Trabalho em Altura ---
  {
    id: "dds_nr35_01",
    codigo: "NR35-01",
    titulo: "Trabalho em Altura: O Que Muda Acima de 2 Metros? (NR-35)",
    categoria: "Trabalho em Altura (NR-35)",
    nrReferencia: "NR-35",
    objetivo: "Sensibilizar sobre o conceito normativo de trabalho em altura (acima de 2,00 m), os riscos da gravidade e o planejamento obrigatório pela APR.",
    pontosPrincipais: [
      "Considera-se trabalho em altura toda atividade executada acima de 2,00 m do nível inferior onde haja risco de queda.",
      "A gravidade não perdoa: em uma queda livre de apenas 2 metros, o corpo humano atinge o solo a cerca de 23 km/h com impacto brutal.",
      "Todo trabalho em altura exige Análise Preliminar de Risco (APR), Permissão de Trabalho (PT) e capacitação bienal de 8 horas.",
      "Aptidão médica comprovada no ASO (avaliação de vertigem, epilepsia, acuidade visual e pressão arterial) é pré-requisito eliminatório.",
    ],
    conteudo: `Bom dia a todos! O tema do nosso DDS de hoje é a Norma Regulamentadora nº 35 (NR-35) e o Trabalho Seguro em Altura.

A queda de pessoas de diferença de nível continua sendo, ano após ano, a maior causa de acidentes fatais e invalidez permanente em todo o setor industrial e na construção civil brasileira. Muitas pessoas têm a falsa impressão de que a altura só é perigosa quando estamos a 10 ou 20 metros do chão. Mas a biomecânica do trauma nos mostra que quedas de apenas 2 a 3 metros de altura — como de cima de uma escada de abrir ou de um andaime baixo — geram traumatismo cranioencefálico grave, fraturas de bacia e lesões irreversíveis na coluna vertebral que deixam a pessoa paraplégica ou tetraplégica.

A NR-35 define que qualquer atividade realizada acima de 2,00 metros do piso com risco de queda é considerada oficialmente Trabalho em Altura e exige o cumprimento de protocolos rígidos:
1. Capacitação Técnica: o trabalhador deve ter participado de treinamento teórico e prático de no mínimo 8 horas, com reciclagem bienal obrigatória;
2. Aptidão Médica no ASO: o médico do trabalho precisa atestar formalmente que o trabalhador não possui labirintite, desmaios, crises de epilepsia, problemas cardíacos ou pressão alta descompensada que possam provocar tonturas nas alturas;
3. Planejamento com APR e PT: nenhuma tarefa em altura pode ser iniciada no improviso. É obrigatório emitir a Análise Preliminar de Risco (APR) e a Permissão de Trabalho (PT), identificando onde os cabos serão ancorados e isolando a área no chão para proteger quem passa embaixo contra queda de ferramentas;
4. Condições Climáticas Adversas: trabalhos a céu aberto em telhados ou postes devem ser paralisados imediatamente em caso de ventos fortes, chuva torrencial ou incidência de raios. Lembre-se: em altura, o erro não dá segunda chance!`,
    perguntasDebate: [
      "Você possui treinamento de NR-35 válido e aptidão física para altura registrada no seu ASO periódico?",
      "Quais os riscos mais comuns de queda de altura que você observa na sua rotina de trabalho diária?",
      "Por que o isolamento da área no solo abaixo do trabalho em altura é tão importante quanto o cinto de segurança?",
    ],
  },
  {
    id: "dds_nr35_02",
    codigo: "NR35-02",
    titulo: "Cinto Paraquedista, Talabarte Duplo em 'Y' e Linhas de Vida (NR-35)",
    categoria: "Trabalho em Altura (NR-35)",
    nrReferencia: "NR-35",
    objetivo: "Ensinar o ajuste correto das fitas do cinto tipo paraquedista, a conexão 100% contínua com talabarte em Y e os pontos de ancoragem homologados.",
    pontosPrincipais: [
      "O cinto de segurança tipo paraquedista deve estar com todas as fitas (coxas, peito, ombros) perfeitamente ajustadas ao corpo, sem folgas excessivas.",
      "Talabarte duplo em Y com absorvedor de energia (ABS): durante a movimentação, NUNCA desconecte os dois ganchos ao mesmo tempo (mantenha sempre pelo menos 1 gancho conectado).",
      "Ponto de Ancoragem: deve ser estruturalmente resistente (mínimo de 15 kN / cerca de 1.500 kgf) e instalado preferencialmente ACIMA da cabeça do trabalhador.",
      "Nunca ancore em tubulações de PVC, eletrocalhas, bandejas de cabos ou guarda-corpos frágeis.",
    ],
    conteudo: `Olá, equipe! Nosso DDS de hoje aprofunda o Sistema de Proteção Individual Contra Quedas (SPIQ), com foco no Cinto Paraquedista, Talabartes em 'Y' e Pontos de Ancoragem Seguros, de acordo com a NR-35.

O Cinto de Segurança tipo Paraquedista é a sua segunda pele quando você está nas alturas. Ele foi projetado para distribuir a força de frenagem da desaceleração do corpo pelas partes mais resistentes do esqueleto humano: os ossos da bacia e das coxas. Mas atenção: para que o cinto funcione de verdade, ele precisa estar ajustado de forma impecável ao seu corpo!

Se as fitas das coxas estiverem muito frouxas, no momento em que você cair e o talabarte esticar, as fitas subirão com força brutal contra a sua virilha, podendo romper a artéria femoral e causar hemorragia interna fatal. Se as fitas estiverem apertadas demais, cortam a circulação sanguínea. A regra de ajuste é simples: ajuste as fivelas de modo que você consiga passar a mão espalmada entre a fita e a sua coxa, mas não consiga fechar a mão em punho.

Regras de ouro do uso de Talabartes e Linhas de Vida:
1. Movimentação com Conexão 100% Contínua: ao subir uma torre ou estrutura metálica com talabarte duplo em Y, conecte o gancho 1 acima da cabeça; ao avançar para o próximo lance, conecte primeiro o gancho 2 no ponto mais alto e só depois desconecte o gancho 1. Você NUNCA, sob nenhuma hipótese, pode ficar com os dois ganchos soltos ao mesmo tempo!
2. Absorvedor de Energia (ABS): o pacote com fita sanfonada (ABS) do talabarte se rasga de forma controlada durante a queda para amortecer o tranco e garantir que a força de impacto no seu corpo não ultrapasse 6 kN (limite máximo suportado pelo corpo humano);
3. Ponto de Ancoragem Confiável: ancore o gancho sempre acima da sua cabeça (fator de queda menor que 1). NUNCA ancore seu talabarte em tubulações finas de água, eletrocalhas de fiação ou telhas de fibrocimento. Ancore apenas em olhais estruturais certificados pelo engenheiro com capacidade mínima de 15 kN ou linhas de vida de cabo de aço homologadas. Conecte-se à vida!`,
    perguntasDebate: [
      "Você sabe verificar se as fitas do seu cinto paraquedista estão no aperto correto antes de subir na estrutura?",
      "Por que é terminantemente proibido desconectar os dois mosquetões do talabarte duplo ao mesmo tempo durante a troca de nível?",
      "O que você faz se chegar em um local de trabalho em altura e não encontrar nenhum ponto de ancoragem seguro acima da cabeça?",
    ],
  },
  {
    id: "dds_nr35_03",
    codigo: "NR35-03",
    titulo: "Fator de Queda, Efeito Pêndulo e Zona Livre de Queda (ZLQ)",
    categoria: "Trabalho em Altura (NR-35)",
    nrReferencia: "NR-35",
    objetivo: "Explicar os conceitos físicos de Fator de Queda (FQ 0, 1 e 2), a influência da ancoragem alta e o cálculo da distância livre para não colidir com o solo.",
    pontosPrincipais: [
      "Fator de Queda = Distância da Queda ÷ Comprimento do Talabarte. Fator 0 (ancoragem alta) é o ideal; Fator 2 (ancoragem no pé) gera a maior gravidade de impacto.",
      "Zona Livre de Queda (ZLQ): distância vertical mínima necessária entre o ponto de ancoragem e o solo para que o trabalhador não atinja o chão ao cair.",
      "Efeito Pêndulo: ocorre quando a ancoragem não está alinhada verticalmente acima da cabeça, fazendo a pessoa oscilar lateralmente e colidir contra paredes ou colunas.",
      "Para alturas baixas (menos de 4 a 5 metros), o talabarte tradicional com ABS pode não abrir a tempo: utilize Trava-Quedas Retrátil.",
    ],
    conteudo: `Bom dia, equipe! O tema do nosso DDS de hoje traz conceitos técnicos avançados da física aplicados à NR-35: o Fator de Queda (FQ), a Zona Livre de Queda (ZLQ) e o Perigo do Efeito Pêndulo.

Muitos trabalhadores pensam: 'Estou usando o cinto de segurança e o talabarte com absorvedor de energia, então estou 100% protegido em qualquer lugar'. Infelizmente, não é tão simples assim. Se a física do trabalho em altura não for respeitada, o equipamento pode não ser suficiente para salvar sua vida.

Vamos entender os três conceitos fundamentais:
1. FATOR DE QUEDA (FQ): é a relação entre a distância que o seu corpo cai e o comprimento da fita do talabarte.
   - Fator 0 (Ideal): quando você ancora o gancho ACIMA da sua cabeça. Se você escorregar, você praticamente não tem queda livre antes da fita esticar;
   - Fator 1: quando você ancora na mesma altura da sua cintura/peito. Você cai a distância exata do comprimento do talabarte;
   - Fator 2 (Pior cenário): quando você prende o gancho lá embaixo, no nível dos seus pés. Se você cair, você despencará duas vezes o comprimento do talabarte em queda livre pura antes que o sistema comece a frear, gerando um tranco violento que pode romper equipamentos e lesionar a coluna. Regra de ouro: SEMPRE ANCORE O MAIS ALTO POSSÍVEL!

2. ZONA LIVRE DE QUEDA (ZLQ): é a distância que você precisa ter livre abaixo dos seus pés até o chão para não se esborrachar. A conta é simples: Comprimento do talabarte (1,40 m) + Abertura do absorvedor de energia ABS (1,20 m) + Altura do corpo do trabalhador (1,50 m) + Margem de segurança de segurança (1,00 m) = TOTAL DE 5,10 METROS! Se você estiver trabalhando a 3 metros do chão usando um talabarte longo com ABS, você atingirá o solo antes do cinto esticar! Nesses casos de baixa altura, é obrigatório substituir o talabarte por um Trava-Quedas Retrátil de fita de bloqueio instantâneo.

3. EFEITO PÊNDULO: nunca trabalhe muito afastado lateralmente do seu ponto de ancoragem. Se você cair longe da linha vertical, você funcionará como o pêndulo de um relógio, balançando de um lado para o outro e colidindo violentamente contra vigas, paredes e estruturas metálicas. Calcule sua ZLQ e ancore-se sempre na vertical!`,
    perguntasDebate: [
      "Você já calculou a Zona Livre de Queda (ZLQ) antes de iniciar um trabalho em uma estrutura metálica ou telhado?",
      "Por que ancorar o talabarte na altura dos pés (Fator 2) é a situação mais perigosa que existe no trabalho em altura?",
      "Quando devemos usar um trava-quedas retrátil em vez de um talabarte com absorvedor de energia tradicional?",
    ],
  },

  // --- NR-38: Segurança e Saúde no Trabalho na Limpeza Urbana e Manejo de Resíduos ---
  {
    id: "dds_nr38_01",
    codigo: "NR38-01",
    titulo: "Descarte Seguro de Materiais Perfurocortantes e Prevenção de Acidentes Biológicos (NR-38)",
    categoria: "Limpeza Urbana e Resíduos (NR-38)",
    nrReferencia: "NR-38",
    objetivo: "Conscientizar sobre o acondicionamento seguro de agulhas, lâminas e vidros quebrados, protegendo a equipe de higienização e coletores.",
    pontosPrincipais: [
      "Agulhas, seringas, lâminas de barbear e cacos de vidro descartados soltos em sacos de lixo comuns causam acidentes graves de perfuração.",
      "Risco biológico de transmissão de patógenos veiculados pelo sangue: HIV, Hepatite B e Hepatite C.",
      "Método correto de descarte: embalar cacos de vidro em garrafas pet cortadas e lacradas ou caixas de papelão rígidas identificadas.",
      "Uso de luvas de proteção mecânica e botas de segurança de cano longo com solado e biqueira protetora.",
    ],
    conteudo: `Olá a todos! Nosso Diálogo Diário de Segurança de hoje trata da Norma Regulamentadora nº 38 (NR-38) e da Proteção Contra Acidentes com Materiais Perfurocortantes e Resíduos Perigosos.

Todos os dias, a nossa equipe de serviços gerais, higienização e coleta de resíduos manuseia centenas de sacos plásticos de lixo em escritórios, refeitórios, banheiros e canteiros operacionais. Quando alguém descarta de forma irresponsável um caco de lâmpada fluorescente quebrado, um copo de vidro estilhaçado, uma lâmina de estilete velha ou uma seringa com agulha diretamente dentro de um saco plástico fino, esse saco se transforma em uma arma perigosa invisível.

Ao recolher o saco de lixo, no momento em que a embalagem encosta na perna ou na mão do trabalhador de limpeza, a ponta de vidro ou a agulha atravessa o plástico e perfura a pele profundamente. Além do corte mecânico e da dor, o perigo biológico é gigantesco: o contato com sangue ou secreções desconhecidas expõe o trabalhador ao risco de contaminação por vírus incuráveis como o HIV (Aids), Hepatite B e Hepatite C, exigindo a realização imediata de coquetel antiviral preventivo por 28 dias e meses de exames de sangue angustiantes.

Como podemos proteger nossos colegas e fazer o descarte correto?
1. Embalagem Rígida Protetora: nunca jogue vidros, agulhas ou pregos diretamente no saco plástico. Coloque-os dentro de uma garrafa pet de plástico grosso, tampe e passe fita adesiva, ou embale dentro de uma caixa de papelão rígida;
2. Identificação Visual Clara: escreva com caneta permanente ou cole uma folha na parte externa com os dizeres: 'CUIDADO: VIDRO QUEBRADO / PERFUROCORTANTE!';
3. Para quem manuseia o lixo: nunca comprima ou aperte sacos de lixo com as mãos ou pés para fazer 'caber mais'. Carregue o saco sempre afastado das suas pernas e utilize luvas grossas de proteção mecânica (nitrílica pesada ou vaqueta com malha resistente). A empatia e a segurança começam no momento em que você descarta o seu lixo!`,
    perguntasDebate: [
      "Como você costuma descartar um copo de vidro quebrado ou lâmina de estilete usada no seu setor?",
      "Você já presenciou ou sofreu algum acidente com agulha ou vidro perfurando o saco de lixo?",
      "Por que nunca devemos tentar empurrar ou compactar o lixo dentro da lixeira usando as mãos ou os pés?",
    ],
  },
];
