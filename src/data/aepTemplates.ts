import { AepItem } from "../types";

export interface AepTemplate {
  id: string;
  nome: string;
  categoria: string;
  descricaoCargo: string;
  atividadesPadrao: string;
  dadosAep: Omit<AepItem, "id" | "funcaoId" | "funcaoNome" | "setorNome">;
}

export const AEP_TEMPLATES: AepTemplate[] = [
  {
    id: "admin-escritorio",
    nome: "Administrativo / Escritório / Computador",
    categoria: "Trabalho em Computador / Tela",
    descricaoCargo: "Trabalho predominantemente sentado com uso contínuo de computador, mouse e teclado.",
    atividadesPadrao: "Digitação de dados, atendimento telefônico/digital, elaboração de relatórios, envio de e-mails e análise de planilhas.",
    dadosAep: {
      tipoPosto: "Administrativo / Escritório / Computador",
      atividadesDescricao: "Execução de rotinas administrativas, atendimento, digitação, visualização contínua de monitores e manuseio de documentos em ambiente climatizado.",
      fotos: [],
      // 1. Organização
      org_pausas: "C",
      org_alternancia: "C",
      org_ritmo_metas: "C",
      org_horas_extras: "C",
      org_obs: "Possibilidade de pequenas pausas espontâneas e alternância com tarefas de impressão ou reuniões.",
      // 2. Cargas
      cargas_peso_frequencia: "C",
      cargas_pega_distancia: "C",
      cargas_meios_mecanicos: "NA",
      cargas_obs: "Não há levantamento de cargas pesadas além de resmas de papel ocasionais (< 3kg).",
      // 3. Mobiliário
      mob_cadeira_ajustavel: "C",
      mob_mesa_espaco: "C",
      mob_apoio_pes: "C",
      mob_monitor_visao: "C",
      mob_obs: "Cadeira giratória com regulagem a gás de altura do assento e encosto lombar. Monitor posicionado na altura da linha de visão.",
      // 4. Máquinas e Ferramentas
      maq_empunhadura: "C",
      maq_esforco_acionamento: "C",
      maq_vibracao: "NA",
      maq_obs: "Mouse óptico e teclado ergonômico padrão ABNT2 com comandos leves.",
      // 5. Conforto Ambiental
      amb_ruido: "C",
      amb_temperatura: "C",
      amb_iluminancia: "C",
      amb_obs: "Ambiente com iluminação difusa (300 a 500 lux) sem ofuscamento e climatização controlada (20°C a 23°C conforme NR-17.8).",
      // Conclusão
      classificacaoRisco: "Baixo / Situação Conforme",
      necessidadeAET: false,
      justificativaAET: "Condições ergonômicas atendem integralmente aos requisitos básicos da NR-17. Não há queixas musculoesqueléticas ou nexo causal de adoecimento.",
      recomendacoes: [
        "Manter pausas de 5 minutos a cada 50 minutos de digitação contínua (NR-17.4).",
        "Estimular ajustes posturais e alongamentos periódicos.",
        "Disponibilizar apoio de pés regulável para colaboradores de menor estatura cujos pés não toquem totalmente o piso.",
      ],
      parecerTecnico: "A situação de trabalho analisada apresenta conformidade com as diretrizes da NR-17. O mobiliário e as condições de conforto ambiental encontram-se adequados, sendo a AEP suficiente para a gestão do risco no PGR.",
    },
  },
  {
    id: "operacional-producao",
    nome: "Operacional / Linha de Produção / Montagem Industrial",
    categoria: "Indústria & Manufatura",
    descricaoCargo: "Trabalho em linha de produção com movimentos repetitivos e alternância postural.",
    atividadesPadrao: "Montagem mecânica manual de componentes, inspeção visual de peças em esteira, embalagem e encaixotamento.",
    dadosAep: {
      tipoPosto: "Operacional / Linha de Produção",
      atividadesDescricao: "Montagem seriada de peças e componentes em bancada/esteira rolante, com movimentos de pinça e preensão manual e alternância entre posturas sentado e em pé.",
      fotos: [],
      // 1. Organização
      org_pausas: "C",
      org_alternancia: "C",
      org_ritmo_metas: "C",
      org_horas_extras: "C",
      org_obs: "Adotado sistema de rodízio de postos (job rotation) a cada 2 horas e pausas ergonômicas programadas.",
      // 2. Cargas
      cargas_peso_frequencia: "C",
      cargas_pega_distancia: "C",
      cargas_meios_mecanicos: "C",
      cargas_obs: "Cargas unitárias não excedem 8 kg na bancada. Caixas maiores são movimentadas com paleteira ou bancada de roletes.",
      // 3. Mobiliário
      mob_cadeira_ajustavel: "C",
      mob_mesa_espaco: "C",
      mob_apoio_pes: "C",
      mob_monitor_visao: "NA",
      mob_obs: "Bancadas de montagem com altura compatível com a linha dos cotovelos e tapetes antifadiga nas estações em pé.",
      // 4. Máquinas e Ferramentas
      maq_empunhadura: "C",
      maq_esforco_acionamento: "C",
      maq_vibracao: "C",
      maq_obs: "Parafusadeiras pneumáticas sustentadas por balancins de mola com empunhadura emborrachada, eliminando o peso estático para o operador.",
      // 5. Conforto Ambiental
      amb_ruido: "C",
      amb_temperatura: "C",
      amb_iluminancia: "C",
      amb_obs: "Iluminação suplementar sobre o ponto de montagem (500 lux) e ventilação geral mecânica.",
      // Conclusão
      classificacaoRisco: "Médio / Atenção Ergonômica",
      necessidadeAET: false,
      justificativaAET: "O rodízio de tarefas e o uso de balancins atenuam a repetitividade. Acompanhar no PCMSO através dos exames periódicos.",
      recomendacoes: [
        "Garantir o cumprimento rigoroso da escala de rodízio de postos (job rotation) entre montagem leve e pesada.",
        "Realizar manutenção preventiva periódica dos balancins de ferramentas e parafusadeiras.",
        "Manter ginástica laboral preparatória no início do turno.",
      ],
      parecerTecnico: "A atividade apresenta exigência biomecânica moderada nos membros superiores, compensada satisfatoriamente pelo rodízio de tarefas e balancins de alívio. AEP considerada suficiente com inclusão no plano de ação do PGR.",
    },
  },
  {
    id: "logistica-almoxarifado",
    nome: "Logística / Almoxarifado / Movimentação de Cargas",
    categoria: "Armazenagem & Cargas",
    descricaoCargo: "Movimentação manual e mecanizada de mercadorias, separação de pedidos e estocagem em prateleiras.",
    atividadesPadrao: "Carga e descarga de caminhões, separação de caixas (picking), conferência de notas e transporte com carrinhos manuais e paleteiras.",
    dadosAep: {
      tipoPosto: "Logística / Almoxarifado / Movimentação de Cargas",
      atividadesDescricao: "Recebimento, conferência, movimentação de caixas e fardos de mercadorias, estocagem em prateleiras e paletes com auxílio de paleteiras manuais e carrinhos hidráulicos.",
      fotos: [],
      // 1. Organização
      org_pausas: "C",
      org_alternancia: "C",
      org_ritmo_metas: "C",
      org_horas_extras: "C",
      org_obs: "Ritmo autogerenciado pelos operadores conforme chegada e expedição de cargas.",
      // 2. Cargas
      cargas_peso_frequencia: "C",
      cargas_pega_distancia: "C",
      cargas_meios_mecanicos: "C",
      cargas_obs: "Disponibilizadas paleteiras manuais e elétricas. Volumes acima de 20 kg exigem movimentação compartilhada em duas pessoas.",
      // 3. Mobiliário
      mob_cadeira_ajustavel: "NA",
      mob_mesa_espaco: "C",
      mob_apoio_pes: "NA",
      mob_monitor_visao: "C",
      mob_obs: "Bancada de conferência de notas fiscais com terminal de computador na altura adequada.",
      // 4. Máquinas e Ferramentas
      maq_empunhadura: "C",
      maq_esforco_acionamento: "C",
      maq_vibracao: "NA",
      maq_obs: "Paleteiras com timão ergonômico e rodízios de poliuretano com baixo atrito de rolagem.",
      // 5. Conforto Ambiental
      amb_ruido: "C",
      amb_temperatura: "C",
      amb_iluminancia: "C",
      amb_obs: "Galpão com ventilação natural cruzada e lanternins, iluminância média de 250 lux nas zonas de circulação e 350 lux na conferência.",
      // Conclusão
      classificacaoRisco: "Médio / Atenção Ergonômica",
      necessidadeAET: false,
      justificativaAET: "Medidas mecânicas de auxílio implementadas. Manter treinamento de técnicas de movimentação correta de cargas.",
      recomendacoes: [
        "Posicionar os itens de maior giro e maior peso nas prateleiras intermediárias (entre altura dos joelhos e dos ombros).",
        "Reforçar treinamento de postura correta para içamento de cargas (flexão de joelhos e coluna ereta).",
        "Proibir movimentação manual individual de fardos ou caixas superiores a 20 kg sem auxílio de colega ou equipamento.",
      ],
      parecerTecnico: "A atividade de movimentação de cargas está resguardada por equipamentos auxiliares (paleteiras e carrinhos) e métodos de trabalho seguros. Situação controlada pelo PGR.",
    },
  },
  {
    id: "caixa-atendimento",
    nome: "Operador de Caixa / Atendimento ao Público (Anexo I NR-17)",
    categoria: "Comércio & Varejo",
    descricaoCargo: "Atendimento no balcão de checkout, leitura óptica de produtos, recebimento de pagamentos e empacotamento.",
    atividadesPadrao: "Registro de mercadorias com leitor de código de barras, conferência de valores, manuseio de máquina de cartão e atendimento aos clientes.",
    dadosAep: {
      tipoPosto: "Caixa / Atendimento ao Público",
      atividadesDescricao: "Operação contínua de checkout de atendimento e cobrança, registro de produtos por leitor óptico e digitação de valores.",
      fotos: [],
      // 1. Organização
      org_pausas: "C",
      org_alternancia: "C",
      org_ritmo_metas: "C",
      org_horas_extras: "C",
      org_obs: "Conformidade com o Anexo I da NR-17: pausas regulamentares de 10 minutos a cada período de atendimento e liberdade para ida ao sanitário.",
      // 2. Cargas
      cargas_peso_frequencia: "C",
      cargas_pega_distancia: "C",
      cargas_meios_mecanicos: "C",
      cargas_obs: "Itens pesados são lidos no próprio carrinho do cliente com leitor óptico manual tipo pistola.",
      // 3. Mobiliário
      mob_cadeira_ajustavel: "C",
      mob_mesa_espaco: "C",
      mob_apoio_pes: "C",
      mob_monitor_visao: "C",
      mob_obs: "Cadeira tipo caixa alta com aro para apoio de pés regulável, encosto estofado e esteira transportadora ou plano deslizante.",
      // 4. Máquinas e Ferramentas
      maq_empunhadura: "C",
      maq_esforco_acionamento: "C",
      maq_vibracao: "NA",
      maq_obs: "Leitor óptico omnidirecional na bancada e leitor manual tipo pistola sem necessidade de girar produtos pesados.",
      // 5. Conforto Ambiental
      amb_ruido: "C",
      amb_temperatura: "C",
      amb_iluminancia: "C",
      amb_obs: "Níveis sonoros inferiores a 65 dB(A) e temperatura mantida entre 20°C e 23°C.",
      // Conclusão
      classificacaoRisco: "Baixo / Situação Conforme",
      necessidadeAET: false,
      justificativaAET: "O posto de trabalho atende aos parâmetros normativos específicos do Anexo I da NR-17 para operadores de checkout.",
      recomendacoes: [
        "Garantir a disponibilização de empacotador nos horários de pico de movimento para redução da sobrecarga muscular do operador.",
        "Manter o apoio de pés regulável sempre ajustado à altura anatômica do colaborador de turno.",
      ],
      parecerTecnico: "O posto de checkout atende aos requisitos do Anexo I da NR-17. Não foram evidenciadas posturas críticas ou incompatibilidade ergonômica.",
    },
  },
  {
    id: "limpeza-servicos-gerais",
    nome: "Limpeza / Conservação Predial / Serviços Gerais",
    categoria: "Serviços Gerais & Facilities",
    descricaoCargo: "Higienização de pisos, instalações sanitárias, recolhimento de lixo e limpeza de vidros e mobiliário.",
    atividadesPadrao: "Varrição, lavagem de pisos com mops, aplicação de desinfetantes, higienização de banheiros e reposição de descartáveis.",
    dadosAep: {
      tipoPosto: "Limpeza / Serviços Gerais / Manutenção",
      atividadesDescricao: "Limpeza e higienização geral de dependências prediais, escritórios, sanitários e áreas comuns, com uso de mops, rodos e produtos diluídos.",
      fotos: [],
      // 1. Organização
      org_pausas: "C",
      org_alternancia: "C",
      org_ritmo_metas: "C",
      org_horas_extras: "C",
      org_obs: "Ritmo de trabalho flexível com alternância entre tarefas de varrição, recolhimento de resíduos e descanso intercalado.",
      // 2. Cargas
      cargas_peso_frequencia: "C",
      cargas_pega_distancia: "C",
      cargas_meios_mecanicos: "C",
      cargas_obs: "Uso de balde com espremedor mecânico e carrinho funcional com rodízios para transporte de materiais, evitando carregar baldes cheios manualmente.",
      // 3. Mobiliário
      mob_cadeira_ajustavel: "NA",
      mob_mesa_espaco: "NA",
      mob_apoio_pes: "NA",
      mob_monitor_visao: "NA",
      mob_obs: "Trabalho em constante movimentação e postura dinâmica.",
      // 4. Máquinas e Ferramentas
      maq_empunhadura: "C",
      maq_esforco_acionamento: "C",
      maq_vibracao: "NA",
      maq_obs: "Cabos de vassoura e mops com comprimento adequado (altura do queixo) para evitar flexão excessiva da coluna vertebral lombar.",
      // 5. Conforto Ambiental
      amb_ruido: "C",
      amb_temperatura: "C",
      amb_iluminancia: "C",
      amb_obs: "Ambientes bem ventilados e com iluminação natural/artificial adequada.",
      // Conclusão
      classificacaoRisco: "Baixo / Situação Conforme",
      necessidadeAET: false,
      justificativaAET: "O uso de carrinhos de limpeza funcionais e cabos de altura ergonômica previne sobrecarga física na coluna e membros superiores.",
      recomendacoes: [
        "Inspecionar periodicamente os cabos e espremedores mecânicos para garantir que não haja esforço excessivo nos punhos.",
        "Fracionar sacos de lixo pesados para manter o peso unitário abaixo de 10 kg por içamento.",
      ],
      parecerTecnico: "A atividade é desenvolvida de forma dinâmica e com equipamentos adequados de conservação predial. Situação ergonômica em conformidade.",
    },
  },
  {
    id: "mecanica-usinagem",
    nome: "Mecânica / Usinagem / Operador de Máquinas",
    categoria: "Metalurgia & Manutenção Mecânica",
    descricaoCargo: "Operação de torno, fresa, serra de fita, centro de usinagem e manutenção preventiva/corretiva de máquinas.",
    atividadesPadrao: "Fixação de peças em morsa/placa, regulagem de ferramentas de corte, monitoramento de usinagem, medição com paquímetro e troca de óleo/fluidos.",
    dadosAep: {
      tipoPosto: "Operador de Máquinas / Usinagem",
      atividadesDescricao: "Operação de equipamentos industriais, ajustes de parâmetros, fixação de peças metálicas, medição dimensional e manuseio de ferramentas manuais na oficina.",
      fotos: [],
      // 1. Organização
      org_pausas: "C",
      org_alternancia: "C",
      org_ritmo_metas: "C",
      org_horas_extras: "C",
      org_obs: "Trabalho técnico com pausas entre ciclos de usinagem e alternância entre programação de máquina e operação manual.",
      // 2. Cargas
      cargas_peso_frequencia: "C",
      cargas_pega_distancia: "C",
      cargas_meios_mecanicos: "C",
      cargas_obs: "Peças brutas pesadas (> 15 kg) são içadas com talha elétrica de corrente ou ponte rolante da oficina.",
      // 3. Mobiliário
      mob_cadeira_ajustavel: "C",
      mob_mesa_espaco: "C",
      mob_apoio_pes: "NA",
      mob_monitor_visao: "C",
      mob_obs: "Bancadas de ajustes mecânicos em altura compatível e painel CNC posicionado na linha de visão.",
      // 4. Máquinas e Ferramentas
      maq_empunhadura: "C",
      maq_esforco_acionamento: "C",
      maq_vibracao: "C",
      maq_obs: "Manípulos e volantes de ajuste com esforço leve e ferramentas manuais (chaves, alicates) com empunhadura anatômica.",
      // 5. Conforto Ambiental
      amb_ruido: "C",
      amb_temperatura: "C",
      amb_iluminancia: "C",
      amb_obs: "Luminárias articuladas com haste flexível instaladas em cada máquina para iluminação pontual de precisão (500 lux).",
      // Conclusão
      classificacaoRisco: "Médio / Atenção Ergonômica",
      necessidadeAET: false,
      justificativaAET: "Exigências posturais e de precisão visual mitigadas pelas talhas de içamento e iluminação suplementar articulada.",
      recomendacoes: [
        "Instalar tapetes de borracha antifadiga em frente aos tornos e bancadas de usinagem contínua em pé.",
        "Manter lubrificação periódica dos fusos e manípulos de comando para garantir acionamento leve.",
      ],
      parecerTecnico: "A operação de máquinas e bancadas mecânicas conta com dispositivos adequados de movimentação de cargas e iluminação de campo. Condição preliminar conforme.",
    },
  },
];
