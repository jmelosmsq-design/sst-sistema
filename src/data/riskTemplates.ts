export interface RiscoTemplateInfo {
  risco: string;
  categoria: "fisico" | "quimico" | "biologico" | "ergonomico" | "psicossocial" | "acidente";
  fonteGeradora: string;
  possiveisDanos: string;
  meioPropagacao: string;
  medidasControleExistentes: string;
  medidasControlePropostas: string;
  normasSugeridas: string[];
}

export const RISCO_DETALHES_TEMPLATES: Record<string, RiscoTemplateInfo> = {
  // ==========================================
  // RISCOS ERGONÔMICOS (BIOMECÂNICOS)
  // ==========================================
  "Mobiliário e posto de trabalho incompatíveis": {
    risco: "Mobiliário e posto de trabalho incompatíveis",
    categoria: "ergonomico",
    fonteGeradora: "Mesas e bancadas sem regulagem de altura, cadeiras sem conformidade com a NR-17, falta de apoio para pés e braços, monitor fora da linha de visão",
    possiveisDanos: "Lombalgias, cervicalgias, fadiga muscular, LER/DORT, desvios posturais e desconforto musculoesquelético",
    meioPropagacao: "Interação direta do trabalhador com a estação e mobiliário de trabalho",
    medidasControleExistentes: "Cadeiras giratórias com rodízios e encosto ajustável",
    medidasControlePropostas: "Realizar Análise Ergonômica do Trabalho (AET/AEP - NR-17), adequar mobiliário com cadeiras ergonômicas reguláveis (NR-17 / NBR 13962), suporte regulável para monitores, apoio para os pés e pausas orientadas para alternância de postura",
    normasSugeridas: ["NR-17", "NR-01"],
  },
  "Levantamento e transporte manual de pesos": {
    risco: "Levantamento e transporte manual de pesos",
    categoria: "ergonomico",
    fonteGeradora: "Movimentação manual de cargas, caixas, sacarias, peças pesadas e matérias-primas sem auxílio mecânico",
    possiveisDanos: "Lombociatalgias, hérnias de disco, contraturas musculares, distensões e microlesões articulares",
    meioPropagacao: "Esforço mecânico e biomecânico direto sobre a coluna vertebral e membros",
    medidasControleExistentes: "Carrinhos manuais de apoio e orientação verbal",
    medidasControlePropostas: "Disponibilizar equipamentos de auxílio mecânico (carrinhos hidráulicos, talhas, empilhadeiras), limitar peso máximo manual conforme NR-17/ISO 11228-1, realizar treinamento de técnicas de levantamento correto de cargas e rodízio de tarefas",
    normasSugeridas: ["NR-17", "NR-01"],
  },
  "Postura estática ou inadequada": {
    risco: "Postura estática ou inadequada",
    categoria: "ergonomico",
    fonteGeradora: "Permanência prolongada na mesma posição, flexão ou torção frequente de tronco/pescoço e alcance excessivo de materiais",
    possiveisDanos: "Mialgias, compressão de discos vertebrais, fadiga postural crônica, LER/DORT e tendinopatias",
    meioPropagacao: "Sobrecarga estática continuada nas estruturas osteomusculares",
    medidasControleExistentes: "Pausas informais durante a jornada de trabalho",
    medidasControlePropostas: "Ajustar layout operacional aproximando ferramentas e materiais da zona de alcance ótimo, implantar pausas programadas ativas e programa de ginástica laboral preparatória/compensatória",
    normasSugeridas: ["NR-17", "NR-01"],
  },
  "Movimentos repetitivos de membros superiores": {
    risco: "Movimentos repetitivos de membros superiores",
    categoria: "ergonomico",
    fonteGeradora: "Digitação contínua, operações de montagem, etiquetagem, corte ou empacotamento em alta cadência",
    possiveisDanos: "Tendinites, tenossinovites, síndrome do túnel do carpo, epicondilite e bursite",
    meioPropagacao: "Ciclos de trabalho curtos com repetição continuada dos mesmos grupos musculares",
    medidasControleExistentes: "Intervalos intrajornada regulamentares",
    medidasControlePropostas: "Implantar rodízio de atividades entre postos de trabalho com exigências biomecânicas distintas, respeitar pausas ergonômicas de 10 min a cada 50 min de atividade repetitiva e otimizar dispositivos manuais",
    normasSugeridas: ["NR-17", "NR-01"],
  },
  "Trabalho em pé prolongado": {
    risco: "Trabalho em pé prolongado",
    categoria: "ergonomico",
    fonteGeradora: "Atendimento ao público em balcão, operação de máquinas em linhas de produção e postos sem assento",
    possiveisDanos: "Insuficiência venosa, varizes nos membros inferiores, fascite plantar, sobrecarga nos joelhos e coluna lombar",
    meioPropagacao: "Gravidade e estase venosa por manutenção da posição ortostática",
    medidasControleExistentes: "Calçados com solado absorvedor de impacto",
    medidasControlePropostas: "Fornecer assentos para descanso nos intervalos e pausas breves (atendendo o item 17.6.3 da NR-17), instalar tapetes antifadiga ergonômicos e alternância de posturas",
    normasSugeridas: ["NR-17", "NR-01"],
  },
  "Trabalho sentado prolongado sem alternância": {
    risco: "Trabalho sentado prolongado sem alternância",
    categoria: "ergonomico",
    fonteGeradora: "Jornada integral em computadores ou estações de controle sem possibilidade de trabalho em pé",
    possiveisDanos: "Estagnação circulatória, dores lombares por aumento de pressão intradiscal, fadiga glútea e sedentarismo ocupacional",
    meioPropagacao: "Imobilidade e compressão de coxas e nádegas contra o assento",
    medidasControleExistentes: "Cadeira de escritório",
    medidasControlePropostas: "Incentivar pequenas pausas para hidratação e caminhada, mesas com ajuste de altura (sit-stand desks) quando viável e orientação postural aos operadores",
    normasSugeridas: ["NR-17", "NR-01"],
  },
  "Exigência de esforço físico intenso": {
    risco: "Exigência de esforço físico intenso",
    categoria: "ergonomico",
    fonteGeradora: "Empurrar/puxar cargas volumosas, esforço muscular para acionamento de alavancas ou peças pesadas",
    possiveisDanos: "Sobrecarga cardiorrespiratória, exaustão física, distensões musculares e entorses",
    meioPropagacao: "Exigência metabólica e contrações musculares intensas",
    medidasControleExistentes: "Divisão de tarefas entre colaboradores",
    medidasControlePropostas: "Mecanização das operações de tração e empuxo, manutenção preventiva das rodas e rolamentos de carrinhos industriais e readequação de processos",
    normasSugeridas: ["NR-17", "NR-01"],
  },
  "Iluminação deficiente ou ofuscamento no posto": {
    risco: "Iluminação deficiente ou ofuscamento no posto",
    categoria: "ergonomico",
    fonteGeradora: "Luminárias queimadas ou mal posicionadas, sombras sobre o plano de trabalho e reflexos diretos em telas",
    possiveisDanos: "Fadiga visual (astenopia), cefaleias, ardor ocular e aumento na probabilidade de acidentes e erros",
    meioPropagacao: "Feixe luminoso inadequado ou contraste insuficiente no campo visual",
    medidasControleExistentes: "Iluminação geral artificial",
    medidasControlePropostas: "Realizar avaliação quantitativa de iluminância em lux conforme NHO 11 / ABNT NBR ISO/CIE 8995-1, instalar luminárias LED difusas e adequar cortinas/persianas anti-ofuscamento",
    normasSugeridas: ["NR-17", "NHO 11", "NR-01"],
  },
  "Compressão mecânica de tecidos corporais": {
    risco: "Compressão mecânica de tecidos corporais",
    categoria: "ergonomico",
    fonteGeradora: "Bordas duras ou vivas de mesas sobre o punho/antebraço, ferramentas manuais sem cabo anatômico e assentos com quina frontal rígida",
    possiveisDanos: "Parestesias, compressão de nervos periféricos (nervo ulnar, mediano), calosidades e dor localizada",
    meioPropagacao: "Pressão mecânica de superfícies rígidas contra a pele e tecidos moles",
    medidasControleExistentes: "Superfícies de bancadas comuns",
    medidasControlePropostas: "Arredondar cantos vivos e bordas de mesas e bancadas, fornecer apoios anatômicos acolchoados para punhos e ferramentas com empunhadura ergonômica emborrachada",
    normasSugeridas: ["NR-17", "NR-01"],
  },

  // ==========================================
  // RISCOS PSICOSSOCIAIS E ORGANIZACIONAIS
  // ==========================================
  "Sobrecarga mental e cognitiva": {
    risco: "Sobrecarga mental e cognitiva",
    categoria: "psicossocial",
    fonteGeradora: "Processamento de múltiplos dados simultâneos, pressão temporal crítica e vigilância mental constante",
    possiveisDanos: "Esgotamento mental (Burnout), insônia, ansiedade, cefaleia tensional e lapsos de concentração",
    meioPropagacao: "Exigência neuropsíquica e cognitiva elevada no fluxo produtivo",
    medidasControleExistentes: "Divisão operacional de setores",
    medidasControlePropostas: "Revisar fluxos de trabalho e distribuição de demandas, implementar procedimentos claros e simplificados e programas de apoio psicológico e bem-estar",
    normasSugeridas: ["NR-17", "NR-01"],
  },
  "Estresse e pressão ocupacional contínua": {
    risco: "Estresse e pressão ocupacional contínua",
    categoria: "psicossocial",
    fonteGeradora: "Prazos exíguos constantes, alta responsabilidade por resultados críticos e volume excessivo de atendimento",
    possiveisDanos: "Crises de ansiedade, hipertensão arterial secundária ao estresse, distúrbios digestivos e Síndrome de Burnout",
    meioPropagacao: "Clima organizacional e exigências psicofisiológicas contínuas",
    medidasControleExistentes: "Feedbacks periódicos de liderança",
    medidasControlePropostas: "Capacitar gestores em liderança positiva e gestão de clima, organizar cronogramas realistas e disponibilizar canais de acolhimento psicossocial",
    normasSugeridas: ["NR-17", "NR-01"],
  },
  "Monotonia e repetitividade com baixa autonomia": {
    risco: "Monotonia e repetitividade com baixa autonomia",
    categoria: "psicossocial",
    fonteGeradora: "Atividades industriais ou cadastrais hiperpadronizadas sem margem para tomada de decisão individual",
    possiveisDanos: "Desmotivação profunda, desatenção, sonolência diurna e predisposição a acidentes operacionais",
    meioPropagacao: "Estrutura do processo de trabalho e falta de variação cognitiva",
    medidasControleExistentes: "Padrão operacional existente",
    medidasControlePropostas: "Enriquecimento de tarefas com ampliação do escopo de atribuições, rodízio funcional e incentivo à participação em melhorias contínuas",
    normasSugeridas: ["NR-17", "NR-01"],
  },
  "Cobrança excessiva por metas e prazos": {
    risco: "Cobrança excessiva por metas e prazos",
    categoria: "psicossocial",
    fonteGeradora: "Metas inatingíveis, monitoramento ostensivo e pressão competitiva desproporcional",
    possiveisDanos: "Transtornos de ansiedade generalizada, depressão ocupacional, taquicardia e estresse crônico",
    meioPropagacao: "Modelo de gestão e cobrança corporativa",
    medidasControleExistentes: "Acompanhamento mensal de metas",
    medidasControlePropostas: "Alinhar metas a parâmetros factíveis de produtividade, proibir práticas de cobrança vexatória e implementar canal anônimo de ouvidoria",
    normasSugeridas: ["NR-17", "NR-01"],
  },
  "Jornadas prolongadas e horas extras habituais": {
    risco: "Jornadas prolongadas e horas extras habituais",
    categoria: "psicossocial",
    fonteGeradora: "Extensão habitual da jornada diária, dobras de turno e insuficiência de efetivo de trabalho",
    possiveisDanos: "Fadiga crônica, distúrbios do sono, perda de reflexos, conflitos sociofamiliares e acidentes de trajeto",
    meioPropagacao: "Organização e dimensionamento das escalas de trabalho",
    medidasControleExistentes: "Controle de ponto eletrônico",
    medidasControlePropostas: "Redimensionar o quadro de colaboradores para extinguir horas extras sistemáticas e garantir descanso interjornada mínimo de 11 horas (CLT)",
    normasSugeridas: ["NR-01", "NR-17"],
  },
  "Trabalho em turnos e trabalho noturno": {
    risco: "Trabalho em turnos e trabalho noturno",
    categoria: "psicossocial",
    fonteGeradora: "Escalas rotativas 12x36 ou 6x2 com horários noturnos e inversão do ciclo circadiano",
    possiveisDanos: "Dessincronização circadiana, distúrbios gastrointestinais e metabólicos, irritabilidade e fadiga persistente",
    meioPropagacao: "Alteração nos padrões fisiológicos e biológicos vigília-sono",
    medidasControleExistentes: "Adicional noturno e intervalos regulamentares",
    medidasControlePropostas: "Organizar escalas com rodízio no sentido horário (manhã-tarde-noite), disponibilizar local adequado para descanso intrajornada e exames médicos periódicos com foco metabólico",
    normasSugeridas: ["NR-01", "NR-17"],
  },
  "Risco de violência, assédio ou conflitos laborais": {
    risco: "Risco de violência, assédio ou conflitos laborais",
    categoria: "psicossocial",
    fonteGeradora: "Atendimento a público hostil, conflitos internos, assédio moral ou sexual no ambiente de trabalho",
    possiveisDanos: "Transtorno de estresse pós-traumático (TEPT), crises de pânico, depressão e absenteísmo",
    meioPropagacao: "Relações interpessoais e vulnerabilidade na segurança patrimonial/organizacional",
    medidasControleExistentes: "Políticas gerais de conduta",
    medidasControlePropostas: "Implantar código de ética e comitê de integridade, canal confidencial de denúncias (Lei 14.457/22 - CIPA+A), treinamento contra assédio e barreiras de segurança física no atendimento",
    normasSugeridas: ["NR-01", "NR-05 (CIPA+A)"],
  },

  // ==========================================
  // RISCOS FÍSICOS
  // ==========================================
  "Ruído contínuo ou intermitente": {
    risco: "Ruído contínuo ou intermitente",
    categoria: "fisico",
    fonteGeradora: "Motores, compressores, prensas, bombas hidráulicas, ferramentas pneumáticas e maquinários industriais",
    possiveisDanos: "PAIR (Perda Auditiva Induzida por Ruído), zumbido permanente (tinnitus), irritabilidade, perda de concentração e estresse",
    meioPropagacao: "Ondas acústicas propagadas pelo ar",
    medidasControleExistentes: "Fornecimento de Protetor Auditivo tipo plug ou concha com CA válido e substituição periódica",
    medidasControlePropostas: "Realizar avaliação quantitativa (dosimetria conforme NHO 01 / NR-15 Anexo 1), implantação de Programa de Conservação Auditiva (PCA), enclausuramento acústico ou barreiras sonoras na fonte e manutenção preventiva das máquinas",
    normasSugeridas: ["NR-15 Anexo 1", "NHO 01", "NR-01", "NR-06"],
  },
  "Ruído de impacto": {
    risco: "Ruído de impacto",
    categoria: "fisico",
    fonteGeradora: "Prensas excêntricas, marteletes, forjarias, guilhotinas e impactos metálicos repentinos",
    possiveisDanos: "Trauma acústico agudo, perfuração timpânica e perda auditiva repentina",
    meioPropagacao: "Picos de pressão sonora com duração inferior a 1 segundo",
    medidasControleExistentes: "Protetor auditivo concha de alta atenuação",
    medidasControlePropostas: "Medição de níveis de pico (dB Linear / C-Fast conforme NR-15 Anexo 2), amortecedores de impacto e automação da alimentação das prensas",
    normasSugeridas: ["NR-15 Anexo 2", "NHO 01", "NR-01"],
  },
  "Calor (sobrecarga térmica)": {
    risco: "Calor (sobrecarga térmica)",
    categoria: "fisico",
    fonteGeradora: "Fornos industriais, caldeiras, estufas, maçaricos ou exposição solar direta a céu aberto",
    possiveisDanos: "Desidratação, insolação, cãibras de calor, síncope térmica, choque térmico e sobrecarga cardiovascular",
    meioPropagacao: "Radiação térmica infravermelha, convecção e condução no ar ambiente",
    medidasControleExistentes: "Disponibilização de água fresca potável e ventilação mecânica existente",
    medidasControlePropostas: "Avaliação quantitativa do IBUTG e taxa metabólica conforme NHO 06 / NR-09 Anexo 3 / NR-15 Anexo 3, isolamento térmico de tubulações quentes, sistema de ventilação/exaustão forçada e pausas térmicas programadas em local termicamente ameno",
    normasSugeridas: ["NR-15 Anexo 3", "NR-09 Anexo 3", "NHO 06", "NR-01"],
  },
  "Frio intenso (câmaras/intempéries)": {
    risco: "Frio intenso (câmaras/intempéries)",
    categoria: "fisico",
    fonteGeradora: "Câmaras frigoríficas de resfriamento/congelamento, túneis de congelamento e trabalhos em intempéries frias",
    possiveisDanos: "Hipotermia, ulcerações por congelamento (frostbite), broncoespasmos e dormência nas extremidades",
    meioPropagacao: "Convecção e condução térmica do ar frio ambiente",
    medidasControleExistentes: "Japona térmica, calça térmica, botas térmicas e luvas frigoríficas (CA válido)",
    medidasControlePropostas: "Cumprimento rigoroso do intervalo térmico legal (Art. 253 da CLT: 20 min de repouso a cada 1h40 de trabalho), manutenção das portas e cortinas térmicas e fornecimento de vestimentas de proteção contra frio completas",
    normasSugeridas: ["NR-15 Anexo 9", "Art. 253 CLT", "NR-01"],
  },
  "Vibração de corpo inteiro (VCI)": {
    risco: "Vibração de corpo inteiro (VCI)",
    categoria: "fisico",
    fonteGeradora: "Operação e condução de caminhões, tratores, retroescavadeiras, empilhadeiras e ônibus",
    possiveisDanos: "Degeneração dos discos intervertebrais, lombalgias graves, hérnia de disco e alterações viscerais",
    meioPropagacao: "Transmissão mecânica pelo assento e assoalho do veículo/equipamento",
    medidasControleExistentes: "Bancos com amortecimento básico e manutenção veicular",
    medidasControlePropostas: "Avaliação quantitativa de AREN e VDVR conforme NHO 09 / NR-09 Anexo 1 / NR-15 Anexo 8, substituição/manutenção de bancos com suspensão pneumática com regulagem de peso, pavimentação de vias internas e rodízio operacional",
    normasSugeridas: ["NR-15 Anexo 8", "NHO 09", "NR-09 Anexo 1", "NR-01"],
  },
  "Vibração de mãos e braços (VMB)": {
    risco: "Vibração de mãos e braços (VMB)",
    categoria: "fisico",
    fonteGeradora: "Uso de lixadeiras, esmerilhadeiras, motosserras, marteletes rompedores e compactadores manuais",
    possiveisDanos: "Síndrome de Raynaud (dedos brancos), perda de sensibilidade tátil, neuropatias e artrose nos membros superiores",
    meioPropagacao: "Transmissão oscilatória mecânica pelas empunhaduras de ferramentas manuais",
    medidasControleExistentes: "Luvas de raspa ou vaqueta",
    medidasControlePropostas: "Avaliação quantitativa de AREN conforme NHO 10 / NR-09 / NR-15 Anexo 8, adoção de ferramentas com sistema antivibração integrado, uso de luvas antivibratórias certificadas e pausas intercaladas",
    normasSugeridas: ["NR-15 Anexo 8", "NHO 10", "NR-09 Anexo 1", "NR-01"],
  },
  "Radiações ionizantes (raios X, gama)": {
    risco: "Radiações ionizantes (raios X, gama)",
    categoria: "fisico",
    fonteGeradora: "Aparelhos de radiografia médica/odontológica/industrial, gamagrafia e fontes seladas",
    possiveisDanos: "Mutagênese, carcinogênese, queimaduras radiológicas (radiodermites), cataratas e danos hematopoiéticos",
    meioPropagacao: "Radiação eletromagnética ionizante de alta energia através do espaço",
    medidasControleExistentes: "Biombos plumbíferos, avental de chumbo e protetor de tireoide",
    medidasControlePropostas: "Plano de Proteção Radiológica aprovado pela CNEN, dosimetria individual mensal com dosímetro de tórax, blindagem baritada das salas e sinalização radiológica de área restrita",
    normasSugeridas: ["NR-15 Anexo 5", "Normas CNEN", "NR-32", "NR-01"],
  },
  "Radiações não ionizantes (solda, UV, laser)": {
    risco: "Radiações não ionizantes (solda, UV, laser)",
    categoria: "fisico",
    fonteGeradora: "Arco elétrico de solda (MIG, TIG, Eletrodo Revestido), corte plasma, fontes de laser industrial e radiação solar",
    possiveisDanos: "Fotooftalmia (queimadura na córnea), conjuntivite actínica, eritema cutâneo e envelhecimento precoce da pele",
    meioPropagacao: "Ondas eletromagnéticas na faixa ultravioleta, visível e infravermelha",
    medidasControleExistentes: "Máscara de solda com lente escura e luvas de raspa",
    medidasControlePropostas: "Máscara de solda com escurecimento automático (DIN regulável), biombos e cortinas inactínicas para isolamento dos postos de solda, protetor solar e vestimentas de raspa/couro completas",
    normasSugeridas: ["NR-15 Anexo 7", "NR-18", "NR-01"],
  },
  "Umidade excessiva": {
    risco: "Umidade excessiva",
    categoria: "fisico",
    fonteGeradora: "Lavação contínua de pisos e instalações com mangueiras, tanques de lavagem e drenagens deficientes",
    possiveisDanos: "Micoses, dermatites de contato, maceração cutânea, doenças respiratórias e risco potencializado de quedas",
    meioPropagacao: "Contato aquoso direto e ambiente com piso/superfícies encharcadas",
    medidasControleExistentes: "Botas de PVC impermeáveis e aventais plásticos",
    medidasControlePropostas: "Adequação de canaletas e ralos de drenagem, instalação de estrados antiderrapantes plásticos elevados, fornecimento de vestimentas impermeáveis adequadas e secagem do piso",
    normasSugeridas: ["NR-15 Anexo 10", "NR-01"],
  },

  // ==========================================
  // RISCOS QUÍMICOS
  // ==========================================
  "Poeiras minerais (sílica, carvão, cimento)": {
    risco: "Poeiras minerais (sílica, carvão, cimento)",
    categoria: "quimico",
    fonteGeradora: "Corte, lixamento e quebra de alvenaria/concreto, mistura de cimento/argamassa e jateamento",
    possiveisDanos: "Silicose pulmonar, pneumoconiose, bronquite crônica, irritação ocular e dermatoses",
    meioPropagacao: "Partículas sólidas suspensas no ar (fração respirável e inalável)",
    medidasControleExistentes: "Respirador PFF2 e óculos de proteção ampla visão",
    medidasControlePropostas: "Umidificação compulsória dos processos de corte e desbaste (processo úmido), sistema de captação localizada de poeiras acoplado às ferramentas, proteção respiratória adequada e exames de espirometria periódicos",
    normasSugeridas: ["NR-09", "NR-15 Anexo 12", "NHO 08", "NR-01"],
  },
  "Fumos metálicos (soldagem, fundição)": {
    risco: "Fumos metálicos (soldagem, fundição)",
    categoria: "quimico",
    fonteGeradora: "Processos de soldagem a quente (eletrodo revestido, MIG/MAG, TIG), oxicorte e fusão de metais",
    possiveisDanos: "Febre dos fumos metálicos, siderose pulmonar, irritação traqueobrônquica, intoxicações por manganês, cromo VI ou níquel",
    meioPropagacao: "Vapores metálicos condensados no ar ambiente como aerodispersóides finos",
    medidasControleExistentes: "Respirador semifacial com filtro P2/P3 ou PFF2 específico para fumos de solda",
    medidasControlePropostas: "Instalação de sistema de exaustão localizada móvel com braço articulado no ponto de geração do fumo, ventilação geral diluidora eficaz e monitoramento quantitativo dos fumos conforme NR-09/ACGIH",
    normasSugeridas: ["NR-09", "NR-15 Anexo 11/13", "ACGIH TLVs", "NR-01"],
  },
  "Vapores orgânicos e inorgânicos": {
    risco: "Vapores orgânicos e inorgânicos",
    categoria: "quimico",
    fonteGeradora: "Aplicação de tintas à base de solvente, vernizes, adesivos, redutores, desengraxantes e resinas",
    possiveisDanos: "Cefaleia, tonturas, náuseas, depressão do sistema nervoso central, hepatotoxicidade e irritação respiratória",
    meioPropagacao: "Evaporação de solventes voláteis para a atmosfera do ambiente de trabalho",
    medidasControleExistentes: "Respirador semifacial com cartucho químico para Vapores Orgânicos (VO) e luvas nitrílicas",
    medidasControlePropostas: "Cabine de pintura com cortina d'água e exaustão com filtros de carvão ativado, substituição de tintas solventes por produtos à base de água, recipientes de segurança herméticos e FISPQ/FDS acessível no setor",
    normasSugeridas: ["NR-09", "NR-15 Anexo 11", "NR-20", "NR-26", "NR-01"],
  },
  "Produtos químicos de limpeza e desinfecção (saneantes)": {
    risco: "Produtos químicos de limpeza e desinfecção (saneantes)",
    categoria: "quimico",
    fonteGeradora: "Diluição e manipulação de água sanitária (hipoclorito de sódio), desinfetantes, desincrustantes ácidos e detergentes alcalinos",
    possiveisDanos: "Dermatites de contato, queimaduras químicas na pele e olhos, irritação das vias aéreas superiores e alergias",
    meioPropagacao: "Contato dérmico direto, respingos e inalação de vapores e aerossóis durante a aplicação",
    medidasControleExistentes: "Luvas de borracha látex ou nitrílica de cano longo, óculos de proteção contra respingos e botas de PVC",
    medidasControlePropostas: "Treinamento obrigatório sobre manipulação segura e proibição de mistura inadequada de produtos (ex: hipoclorito + ácido), dosadores automáticos de diluição, disponibilização das Fichas de Dados de Segurança (FDS/FISPQ) e kit de primeiros socorros",
    normasSugeridas: ["NR-09", "NR-26", "NR-06", "NR-01"],
  },
  "Óleos minerais, graxas e hidrocarbonetos": {
    risco: "Óleos minerais, graxas e hidrocarbonetos",
    categoria: "quimico",
    fonteGeradora: "Lubrificação de máquinas, trocas de óleo de motores e redutores, usinagem com fluido de corte e manuseio de graxas",
    possiveisDanos: "Elaioconiose (foliculite por óleo), dermatite de contato alérgica/irritativa, ressecamento cutâneo e risco de absorção sistêmica",
    meioPropagacao: "Contato dérmico continuado e respingos durante operações de manutenção e usinagem",
    medidasControleExistentes: "Luvas de borracha nitrílica específicas para óleos e cremes protetores de segurança para pele (Grupo 3)",
    medidasControlePropostas: "Bandejas de contenção para descarte do óleo usado, panos industriais descartáveis específicos, implantação de proteção coletiva contra névoas de óleo em tornos/fresas e higienização das mãos",
    normasSugeridas: ["NR-09", "NR-15 Anexo 13", "NR-26", "NR-01"],
  },

  // ==========================================
  // RISCOS BIOLÓGICOS
  // ==========================================
  "Vírus (inclusive patógenos respiratórios)": {
    risco: "Vírus (inclusive patógenos respiratórios)",
    categoria: "biologico",
    fonteGeradora: "Atendimento presencial com aglomeração, manipulação de resíduos ou assistência a pacientes sintomáticos",
    possiveisDanos: "Infecções virais agudas, viroses respiratórias, influenza, COVID-19 e morbidades correlatas",
    meioPropagacao: "Gotículas respiratórias, aerossóis e superfícies e fômites contaminados",
    medidasControleExistentes: "Disponibilização de álcool gel 70% e máscaras de proteção",
    medidasControlePropostas: "Garantir renovação contínua de ar no ambiente climatizado conforme PMOC (Portaria MS 3.523/98 / RE-09 ANVISA), higienização frequente de superfícies de contato comum e incentivo à vacinação ocupacional",
    normasSugeridas: ["NR-09", "NR-32", "NR-01"],
  },
  "Bactérias e bacilos": {
    risco: "Bactérias e bacilos",
    categoria: "biologico",
    fonteGeradora: "Limpeza de sanitários de uso público/coletivo, esgoto sanitário, coleta de resíduos e ambientes hospitalares",
    possiveisDanos: "Gastroenterites bacterianas, infecções de pele, leptospirose, tétano e infecções oportunistas",
    meioPropagacao: "Contato dérmico com água/superfícies contaminadas, aerossóis e inoculação acidental",
    medidasControleExistentes: "Luvas impermeáveis de borracha de cano longo e calçado de segurança impermeável",
    medidasControlePropostas: "Procedimento operacional padrão (POP) de higienização com desinfetantes hospitalares/clorados, controle de vacinação em dia (Tétano, Hepatite B) e descarte seguro de resíduos infectantes",
    normasSugeridas: ["NR-15 Anexo 14", "NR-32", "NR-01"],
  },
  "Resíduos de serviços de saúde (RSS)": {
    risco: "Resíduos de serviços de saúde (RSS)",
    categoria: "biologico",
    fonteGeradora: "Descarte e coleta de lixo hospitalar, curativos, materiais biológicos e seringas em clínicas e postos de saúde",
    possiveisDanos: "Contaminação cruzada por patógenos veiculados pelo sangue, hepatites virais e infecções graves",
    meioPropagacao: "Manuseio de sacos plásticos brancos leitosos e caixas de perfurocortantes (Descarpack)",
    medidasControleExistentes: "Uso de luvas de borracha nitrílica e aventais descartáveis",
    medidasControlePropostas: "Elaborar e cumprir Plano de Gerenciamento de Resíduos de Serviços de Saúde (PGRSS conforme RDC 222/2018 ANVISA e NR-32), acondicionamento e abrigo temporário adequado",
    normasSugeridas: ["NR-32", "RDC 222 ANVISA", "NR-01"],
  },

  // ==========================================
  // RISCOS DE ACIDENTES / MECÂNICOS
  // ==========================================
  "Queda de pessoas com diferença de nível (trabalho em altura)": {
    risco: "Queda de pessoas com diferença de nível (trabalho em altura)",
    categoria: "acidente",
    fonteGeradora: "Atividades executadas acima de 2,00m do nível inferior (telhados, andaimes, escadas móveis, plataformas elevatórias e passarelas)",
    possiveisDanos: "Politraumantismos graves, fraturas ósseas, traumatismo cranioencefálico (TCE), incapacidade permanente e óbito",
    meioPropagacao: "Ação da gravidade e perda de equilíbrio ou falha estrutural do sistema de sustentação",
    medidasControleExistentes: "Cinto de segurança tipo paraquedista com talabarte duplo em Y, trava-quedas e capacete com jugular",
    medidasControlePropostas: "Elaboração prévia de Análise de Risco (AR) e Permissão de Trabalho (PT), linha de vida ancorada em pontos certificados (NR-35), instalação de guarda-corpo rígido coletivo (SPIQ) e treinamento NR-35 periódico",
    normasSugeridas: ["NR-35", "NR-18", "NR-01", "NR-06"],
  },
  "Queda de pessoas em mesmo nível (escorregão e tropeço)": {
    risco: "Queda de pessoas em mesmo nível (escorregão e tropeço)",
    categoria: "acidente",
    fonteGeradora: "Pisos molhados, oleosos, irregulares, com desníveis, fios soltos ou obstáculos nas rotas de circulação",
    possiveisDanos: "Escoriações, entorses de tornozelo/joelho, luxações, contusões e fraturas de punho/membros",
    meioPropagacao: "Perda de aderência dos calçados ao solo ou tropeçamento em saliências",
    medidasControleExistentes: "Calçado de segurança com solado de poliuretano bidensidade antiderrapante",
    medidasControlePropostas: "Manutenção do piso mantendo-o limpo e seco, sinalização imediata de piso molhado durante limpezas, organização e desobstrução das passagens (5S) e eliminação de cabos no chão",
    normasSugeridas: ["NR-01", "NR-08", "NR-12"],
  },
  "Choque elétrico (contato direto ou indireto)": {
    risco: "Choque elétrico (contato direto ou indireto)",
    categoria: "acidente",
    fonteGeradora: "Painéis e quadros elétricos, fiação com isolamento danificado, extensões elétricas improvisadas e tomadas sem aterramento",
    possiveisDanos: "Fibrilação ventricular, parada cardiorrespiratória, queimaduras térmicas internas e externas e quedas secundárias",
    meioPropagacao: "Passagem de corrente elétrica através do corpo humano em circuito fechado",
    medidasControleExistentes: "Quadros elétricos fechados com identificação e disjuntores",
    medidasControlePropostas: "Instalação de dispositivo DR (Diferencial Residual) de alta sensibilidade (30mA), aterramento elétrico conforme NBR 5410, manutenção do Prontuário das Instalações Elétricas (PIE - NR-10), bloqueio e etiquetagem (LOTO) e treinamento NR-10",
    normasSugeridas: ["NR-10", "NBR 5410", "NR-01"],
  },
  "Máquinas e equipamentos sem proteção adequada (NR-12)": {
    risco: "Máquinas e equipamentos sem proteção adequada (NR-12)",
    categoria: "acidente",
    fonteGeradora: "Polias, correias, engrenagens, fusos, zonas de corte, esteiras e cilindros rotativos desprovidos de proteção física",
    possiveisDanos: "Amputação de dedos e membros, esmagamento, fraturas expostas e lacerações profundas",
    meioPropagacao: "Aproximação involuntária ou acesso de mãos/corpo às partes móveis perigosas",
    medidasControleExistentes: "Botão de emergência existente na máquina",
    medidasControlePropostas: "Adequação completa à NR-12 com instalação de proteções fixas enclausuradas e móveis intertravadas com chaves de segurança categoria 4, cortinas de luz ópticas, botão de rearme manual e treinamento NR-12",
    normasSugeridas: ["NR-12", "NBR ISO 12100", "NR-01"],
  },
  "Corte, perfuração e laceração por ferramentas": {
    risco: "Corte, perfuração e laceração por ferramentas",
    categoria: "acidente",
    fonteGeradora: "Uso de estiletes comuns, facas industriais, serras manuais, lâminas e ferramentas pontiagudas",
    possiveisDanos: "Ferimentos corto-contusos, hemorragias, secção de tendões e lesões de nervos digitais",
    meioPropagacao: "Contato direto de partes do corpo com arestas cortantes e lâminas",
    medidasControleExistentes: "Luvas de segurança com resistência a corte",
    medidasControlePropostas: "Substituição de estiletes comuns por estiletes de segurança com lâmina autorretrátil, bainhas de proteção para ferramentas de corte, descarte de lâminas em caixas específicas e treinamento de uso seguro",
    normasSugeridas: ["NR-01", "NR-06", "NR-12"],
  },
  "Incêndio e explosão": {
    risco: "Incêndio e explosão",
    categoria: "acidente",
    fonteGeradora: "Estocagem de líquidos inflamáveis, centrais de GLP, curtos-circuitos elétricos, trabalhos a quente em áreas com combustíveis",
    possiveisDanos: "Queimaduras graves de 2º e 3º grau, intoxicação por inalação de fumaça tóxica, asfixia e fatalidades",
    meioPropagacao: "Reação em cadeia de combustão com liberação rápida de calor e gases em alta pressão",
    medidasControleExistentes: "Extintores de incêndio portáteis (Água, PQS, CO2) com carga válida e sinalização de rota de fuga",
    medidasControlePropostas: "Manter AVCB/CLCB do Corpo de Bombeiros em dia, inspeção mensal de extintores e hidrantes, formação e reciclagem da Brigada de Incêndio (NR-23/ITs), bacia de contenção de inflamáveis e eliminação de fontes de ignição",
    normasSugeridas: ["NR-23", "NR-20", "Instruções Técnicas do Corpo de Bombeiros (ITs)", "NR-01"],
  },
};

export function getRiscoTemplate(riscoNome: string): RiscoTemplateInfo | null {
  if (!riscoNome) return null;
  if (RISCO_DETALHES_TEMPLATES[riscoNome]) {
    return RISCO_DETALHES_TEMPLATES[riscoNome];
  }

  // Busca fuzzy/aproximada por palavras-chave
  const lower = riscoNome.toLowerCase();
  for (const [key, tpl] of Object.entries(RISCO_DETALHES_TEMPLATES)) {
    const keyLower = key.toLowerCase();
    if (lower.includes(keyLower) || keyLower.includes(lower)) {
      return tpl;
    }
  }

  // Keywords fallback inteligente
  if (lower.includes("mobiliário") || lower.includes("posto") || lower.includes("cadeira") || lower.includes("mesa")) {
    return RISCO_DETALHES_TEMPLATES["Mobiliário e posto de trabalho incompatíveis"];
  }
  if (lower.includes("repetit") || lower.includes("digitação")) {
    return RISCO_DETALHES_TEMPLATES["Movimentos repetitivos de membros superiores"];
  }
  if (lower.includes("peso") || lower.includes("carga") || lower.includes("levantamento")) {
    return RISCO_DETALHES_TEMPLATES["Levantamento e transporte manual de pesos"];
  }
  if (lower.includes("sentado")) {
    return RISCO_DETALHES_TEMPLATES["Trabalho sentado prolongado sem alternância"];
  }
  if (lower.includes("em pé")) {
    return RISCO_DETALHES_TEMPLATES["Trabalho em pé prolongado"];
  }
  if (lower.includes("postura")) {
    return RISCO_DETALHES_TEMPLATES["Postura estática ou inadequada"];
  }
  if (lower.includes("ilumina")) {
    return RISCO_DETALHES_TEMPLATES["Iluminação deficiente ou ofuscamento no posto"];
  }
  if (lower.includes("estresse") || lower.includes("pressão") || lower.includes("meta")) {
    return RISCO_DETALHES_TEMPLATES["Estresse e pressão ocupacional contínua"];
  }
  if (lower.includes("mental") || lower.includes("cognitiv")) {
    return RISCO_DETALHES_TEMPLATES["Sobrecarga mental e cognitiva"];
  }
  if (lower.includes("ruído") || lower.includes("barulho")) {
    return RISCO_DETALHES_TEMPLATES["Ruído contínuo ou intermitente"];
  }
  if (lower.includes("calor") || lower.includes("térmic")) {
    return RISCO_DETALHES_TEMPLATES["Calor (sobrecarga térmica)"];
  }
  if (lower.includes("frio") || lower.includes("câmara")) {
    return RISCO_DETALHES_TEMPLATES["Frio intenso (câmaras/intempéries)"];
  }
  if (lower.includes("vibraç")) {
    return RISCO_DETALHES_TEMPLATES["Vibração de corpo inteiro (VCI)"];
  }
  if (lower.includes("altura") || lower.includes("queda")) {
    return RISCO_DETALHES_TEMPLATES["Queda de pessoas com diferença de nível (trabalho em altura)"];
  }
  if (lower.includes("elétric") || lower.includes("choque")) {
    return RISCO_DETALHES_TEMPLATES["Choque elétrico (contato direto ou indireto)"];
  }
  if (lower.includes("máquina") || lower.includes("prensa") || lower.includes("nr-12")) {
    return RISCO_DETALHES_TEMPLATES["Máquinas e equipamentos sem proteção adequada (NR-12)"];
  }
  if (lower.includes("corte") || lower.includes("ferramenta") || lower.includes("estilete")) {
    return RISCO_DETALHES_TEMPLATES["Corte, perfuração e laceração por ferramentas"];
  }
  if (lower.includes("incêndio") || lower.includes("fogo") || lower.includes("explos")) {
    return RISCO_DETALHES_TEMPLATES["Incêndio e explosão"];
  }
  if (lower.includes("limpeza") || lower.includes("saneante") || lower.includes("detergente")) {
    return RISCO_DETALHES_TEMPLATES["Produtos químicos de limpeza e desinfecção (saneantes)"];
  }
  if (lower.includes("óleo") || lower.includes("graxa") || lower.includes("lubrificante")) {
    return RISCO_DETALHES_TEMPLATES["Óleos minerais, graxas e hidrocarbonetos"];
  }
  if (lower.includes("fumo") || lower.includes("solda")) {
    return RISCO_DETALHES_TEMPLATES["Fumos metálicos (soldagem, fundição)"];
  }
  if (lower.includes("poeira") || lower.includes("cimento") || lower.includes("sílica")) {
    return RISCO_DETALHES_TEMPLATES["Poeiras minerais (sílica, carvão, cimento)"];
  }
  if (lower.includes("vapor") || lower.includes("solvente") || lower.includes("tinta")) {
    return RISCO_DETALHES_TEMPLATES["Vapores orgânicos e inorgânicos"];
  }
  if (lower.includes("vírus") || lower.includes("bactér") || lower.includes("biológic")) {
    return RISCO_DETALHES_TEMPLATES["Vírus (inclusive patógenos respiratórios)"];
  }

  return null;
}
