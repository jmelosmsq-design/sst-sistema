export interface ProtocoloAmostragem {
  id: string;
  agente: string; // Ex: "Thinner (Tolueno / Xileno / Acetona)", "Ruído Contínuo e Intermitente", etc.
  categoria: "quimico" | "fisico" | "poeiras" | "gases" | "biologico";
  sinonimos?: string[];
  cas?: string;
  normasRegulamentadoras: string[]; // Ex: ["NR-15 Anexo 11", "NR-09", "NHO 07", "NIOSH 1501", "ACGIH (TLVs)"]
  metodologiaReferencia: string; // Ex: "NIOSH 1501 / OSHA 111 / NHO 07 Fundacentro"
  resumoObjetivo: string; // Resumo direto da medição
  
  // Parâmetros Técnicos de Coleta
  meioColeta: {
    dispositivo: string; // Ex: "Tubo de Carvão Ativado SKC (Anasorb CSC 226-01)", "Cassete 37mm 3 seções com filtro PVC 5µm"
    especificacao: string; // Ex: "Tubo de vidro 100/50 mg de carvão de casca de coco"
    acessorios: string[]; // Ex: ["Bomba gravimétrica intrinsecamente segura", "Suporte protetor de tubo", "Tubo Tygon flexível", "Calibrador primário ou padrão secundário"]
  };
  
  parametrosBomba: {
    vazaoRecomendada: string; // Ex: "0,05 a 0,20 L/min (50 a 200 mL/min)"
    volumeMinimoLitros: string; // Ex: "1 a 3 Litros"
    volumeMaximoLitros: string; // Ex: "10 a 24 Litros"
    tempoColetaSugerido: string; // Ex: "Amostragem representativa da jornada (ex: 2 a 4 horas por tubo ou amostras consecutivas de 100 min)"
    temperaturaUmidade: string; // Ex: "Registrar temperatura (°C), umidade relativa (%) e pressão atmosférica (mmHg) no início e final da coleta"
  };

  calibragemPassoAPasso: {
    titulo: string;
    instrucoes: string[];
    criterioAceitacao: string; // Ex: "Vazão final não pode diferir mais que ±5% da vazão inicial. Caso > 5%, a amostra é invalidada."
  };

  passoAPassoCampo: {
    etapa: number;
    titulo: string;
    descricao: string;
    dicasPraticas: string;
  }[];

  brancoDeCampo: {
    obrigatorio: boolean;
    instrucao: string; // Ex: "Abrir as duas pontas de 1 tubo de carvão do mesmo lote no local de amostragem, fechá-lo imediatamente com as tampas plásticas sem passar ar pela bomba. Identificar como 'BRANCO DE CAMPO'."
  };

  preservacaoTransporte: {
    acondicionamento: string; // Ex: "Lacre hermético, proteger da luz solar, armazenar refrigerado (aprox. 4°C em caixa de isopor com gelo reciclável)."
    tempoLimiteLaboratorio: string; // Ex: "Enviar ao laboratório de análise cromatográfica em até 7 a 14 dias."
    documentacao: string; // Ex: "Preencher a Cadeia de Custódia (COC) com número de lote do tubo, vazão inicial, vazão final, tempo de coleta (min) e volume total corrigido (L)."
  };

  limitesTolerancia: {
    nr15: string; // Ex: "Tolueno: 78 ppm (290 mg/m³) - Grau de insalubridade médio (20%)"
    acgih: string; // Ex: "TLV-TWA: 20 ppm (Anotação A4 - Não classificável como carcinógeno humano / Notação Pele)"
    nivelAcaoNR09: string; // Ex: "50% do LEO (39 ppm ou 10 ppm ACGIH)"
  };

  calculoAmostrador?: {
    formula: string; // Ex: "Volume (L) = Vazão média (L/min) × Tempo (min)"
    exemplo: string; // Ex: "Vazão: 0,10 L/min × 120 min = 12,0 Litros amostrados."
  };
}

export const PROTOCOLOS_HIGIENE: ProtocoloAmostragem[] = [
  // 1. THINNER / SOLVENTES MISTOS (TOLUENO, XILENO, ACETATO DE ETILA, ACETONA)
  {
    id: "thinner_solventes",
    agente: "Thinner / Vapores de Solventes e Tintas",
    categoria: "quimico",
    sinonimos: ["Thinner", "Tolueno", "Xileno", "Solventes Orgânicos", "Redutor de Pintura", "Aguarrás", "Solvente de Limpeza"],
    cas: "108-88-3 (Tolueno) / 1330-20-7 (Xileno)",
    normasRegulamentadoras: ["NR-15 Anexo 11", "NR-09", "NHO 07 (Fundacentro)", "NIOSH 1501", "ACGIH TLVs"],
    metodologiaReferencia: "NIOSH 1501 / OSHA 111 / NHO 07 Fundacentro (Cromatografia Gasosa com FID)",
    resumoObjetivo: "Determinação quantitativa da concentração média ponderada no tempo (TWA) de hidrocarbonetos aromáticos e vapores de solventes na zona respiratória do trabalhador.",
    meioColeta: {
      dispositivo: "Tubo de Carvão Ativado SKC (Anasorb CSC ou equivalente, 100/50 mg)",
      especificacao: "Tubo de vidro com 2 seções (Amostragem: 100 mg / Segurança: 50 mg) separadas por espuma de poliuretano.",
      acessorios: [
        "Bomba de amostragem individual de baixa vazão (com regulador de fluxo constante de 20 a 200 mL/min)",
        "Suporte protetor de tubo de carvão com presilha de fixação na lapela",
        "Tubo de mangueira Tygon flexível inerte (6 mm diâmetro interno)",
        "Quebrador de pontas de tubos de vidro",
        "Tampas protetoras plásticas coloridas (vermelhas/azuis)",
        "Calibrador de vazão primário (ex: MesaLabs Defender) ou padrão rotâmetro calibrado",
        "Termohigrômetro calibrado e barômetro para cálculo de volume corrigido",
      ],
    },
    parametrosBomba: {
      vazaoRecomendada: "0,05 a 0,20 L/min (50 a 200 mL/min) — ideal 0,10 L/min",
      volumeMinimoLitros: "1 a 3 Litros (para detecção em concentrações baixas)",
      volumeMaximoLitros: "10 a 24 Litros (para evitar saturação e migração para a seção posterior do tubo)",
      tempoColetaSugerido: "Coletas representativas de 60 a 180 minutos por tubo (ou 2 tubos consecutivos para cobrir a jornada de pintura/limpeza)",
      temperaturaUmidade: "Registrar Ta (°C), UR (%) e Pa (mmHg) no início e final da amostragem.",
    },
    calibragemPassoAPasso: {
      titulo: "Calibração da Bomba de Baixa Vazão",
      instrucoes: [
        "Monte o trem de amostragem idêntico ao de campo: Calibrador -> Tubo de carvão ativado de calibração (mesmo lote e quebrado) -> Mangueira Tygon -> Bomba.",
        "Ligue a bomba e ajuste a vazão para 0,100 L/min (ou 0,050 L/min se amostragem longa).",
        "Realize 3 a 5 medições no calibrador de bolha/fluxo e tire a média (ex: Q_inicial = 0,101 L/min).",
        "NÃO utilize o tubo de calibração para a coleta dos trabalhadores!",
        "Após o término da amostragem de campo, repita a calibração com o trem de calibração para obter a vazão final (Q_final).",
      ],
      criterioAceitacao: "O desvio entre a vazão inicial e final deve ser ≤ ±5%. Exemplo: Se começou em 0,100 L/min, a vazão final deve estar entre 0,095 e 0,105 L/min. Se ultrapassar ±5%, o resultado laboratorial é normativamente invalidado.",
    },
    passoAPassoCampo: [
      {
        etapa: 1,
        titulo: "1. Preparação, Quebra e Montagem do Tubo",
        descricao: "Com o quebrador de tubos, quebre as duas extremidades do tubo de carvão. Insira o tubo aberto dentro do suporte protetor. Aponte a seta impressa no tubo NA DIREÇÃO DO FLUXO DE AR (em direção à mangueira da bomba). A seção maior de 100 mg deve ficar voltada para o ar ambiente e a de 50 mg voltada para a bomba.",
        dicasPraticas: "Cuidado com estilhaços de vidro. Se inverter o tubo, os vapores entrarão primeiro na seção de segurança (50 mg) e invalidarão a análise.",
      },
      {
        etapa: 2,
        titulo: "2. Posicionamento na Zona Respiratória (ZRA)",
        descricao: "Prenda o suporte do tubo na lapela/gola do trabalhador, mantendo o bocal a uma distância máxima de 15 a 30 cm do nariz e boca (hemisfério respiratório). Prenda a bomba na cintura com o cinto ergonômico.",
        dicasPraticas: "Mantenha o tubo de carvão na posição VERTICAL (bocal para baixo) durante todo o teste para evitar caminhos preferenciais no leito de carvão.",
      },
      {
        etapa: 3,
        titulo: "3. Monitoramento e Cronometragem",
        descricao: "Inicie o cronômetro da bomba e anote o horário exato de início (hh:mm), temperatura ambiente e pressão atmosférica. Oriente o trabalhador a executar suas rotinas usuais (preparo de tintas, pistola, limpeza de peças com thinner).",
        dicasPraticas: "Verifique periodicamente a cada 30 minutos se a bomba não foi desligada ou se a mangueira não dobrou/estrangulou.",
      },
      {
        etapa: 4,
        titulo: "4. Encerramento e Vedação Imediata",
        descricao: "Ao atingir o tempo planejado (ex: 120 min), desligue a bomba, anote o horário de término e o tempo exato decorrido em minutos. Remova o tubo do suporte e VEDE IMEDIATAMENTE as duas pontas com as tampas plásticas vermelhas/azuis herméticas.",
        dicasPraticas: "Identifique o tubo com etiqueta adesiva no corpo de vidro com código único da amostra (ex: AM-THI-01). Não passe fita adesiva que tampe as extremidades.",
      },
      {
        etapa: 5,
        titulo: "5. Pós-Calibração da Bomba",
        descricao: "Realize a medição de vazão pós-coleta com o tubo de calibração. Calcule o volume total coletado em Litros: V = [(Q_inicial + Q_final) / 2] × Tempo (min).",
        dicasPraticas: "Corrija o volume para as condições de temperatura e pressão padrão (25°C e 760 mmHg) conforme a fórmula dos métodos NIOSH/Fundacentro.",
      },
    ],
    brancoDeCampo: {
      obrigatorio: true,
      instrucao: "Para cada lote de até 10 amostras coletadas, quebre as duas pontas de 1 tubo de carvão virgem no ambiente de amostragem, tampe-o imediatamente com as capas plásticas sem conectá-lo à bomba. Identifique como 'BRANCO DE CAMPO' e envie junto com as amostras para o laboratório descontar possíveis contaminações de lote.",
    },
    preservacaoTransporte: {
      acondicionamento: "Acondicionar os tubos vedados em caixa térmica rígida (isopor) contendo gelo reciclável (gelo seco ou gelo gel), mantendo a temperatura entre 2°C e 8°C. Proteger de choques mecânicos com plástico bolha.",
      tempoLimiteLaboratorio: "Enviar ao laboratório credenciado (ISO 17025) preferencialmente em até 7 dias (máximo 14 dias sob refrigeração).",
      documentacao: "Preencher a Cadeia de Custódia (Chain of Custody - COC) informando: Identificação da empresa, função avaliada, substâncias a analisar (ex: 'Solventes da Mistura Thinner: Tolueno, Xilenos, Acetato de Etila, Acetona, Álcool Isopropílico'), lote do tubo, vazão inicial, vazão final, tempo de coleta e volume total em Litros.",
    },
    limitesTolerancia: {
      nr15: "Tolueno: 78 ppm (290 mg/m³) [Insalubridade Média 20%] | Xilenos: 78 ppm (340 mg/m³) [Insalubridade Média 20%]",
      acgih: "Tolueno: TLV-TWA 20 ppm (Notação Pele / A4) | Xilenos: TLV-TWA 100 ppm / STEL 150 ppm | Acetona: TLV-TWA 250 ppm / STEL 500 ppm",
      nivelAcaoNR09: "50% do limite de tolerância (Tolueno: 39 ppm pela NR-15 ou 10 ppm pela ACGIH)",
    },
    calculoAmostrador: {
      formula: "V (Litros) = Vazão Média (L/min) × Tempo de Amostragem (minutos)",
      exemplo: "Exemplo: Vazão de 0,10 L/min por 120 minutos = 0,10 × 120 = 12,0 Litros de ar coletados.",
    },
  },

  // 2. RUÍDO CONTÍNUO OU INTERMITENTE (NR-15 ANEXO 1 / NHO 01 FUNDACENTRO)
  {
    id: "ruido_continuo",
    agente: "Ruído Contínuo ou Intermitente",
    categoria: "fisico",
    sinonimos: ["Ruído", "Barulho", "Pressão Sonora", "Dosimetria de Ruído", "Decibéis", "dB(A)"],
    normasRegulamentadoras: ["NR-15 Anexo 1", "NR-09", "NHO 01 (Fundacentro)", "Portaria MTP 672/2021", "Instrução Normativa INSS (LTCAT)"],
    metodologiaReferencia: "NHO 01 Fundacentro / NR-15 Anexo 1 (Medição com Audiodosímetro Integrador de Uso Pessoal)",
    resumoObjetivo: "Avaliação da dose de exposição diária ao ruído e determinação do Nível de Exposição Normalizado (NEN) e Nível Médio (Lavg / NE) para PGR, PCMSO, LTCAT (Perfil Profissiográfico Previdenciário) e Insalubridade.",
    meioColeta: {
      dispositivo: "Dosímetro de Ruído / Medidor Integrador de Uso Pessoal (Tipo 2 / Classe 2 conforme IEC 61252 / IEC 61672)",
      especificacao: "Aparelho com registro contínuo de histórico temporal (log), dois canais simultâneos (Canal 1 para NR-15 e Canal 2 para NHO 01/PGR).",
      acessorios: [
        "Calibrador acústico classe 1 ou 2 (94 dB / 114 dB a 1000 Hz) com certificado RBC vigente",
        "Protetor de vento esférico de espuma acústica para o microfone",
        "Presilha de fixação na lapela / ombro",
        "Capa de proteção contra poeira e respingos",
        "Cabo de conexão USB e software de tratamento de dados com gráfico de perfil temporal",
      ],
    },
    parametrosBomba: {
      vazaoRecomendada: "N/A (Medição Física Acústica)",
      volumeMinimoLitros: "N/A",
      volumeMaximoLitros: "N/A",
      tempoColetaSugerido: "Mínimo de 75% a 80% da jornada diária de trabalho (ou tempo suficiente para cobrir todos os ciclos representativos da rotina).",
      temperaturaUmidade: "Operar em condições sem vento excessivo direto no microfone (usar sempre windscreen).",
    },
    calibragemPassoAPasso: {
      titulo: "Ajuste e Calibração Acústica de Campo",
      instrucoes: [
        "Verifique a carga da bateria do dosímetro antes de iniciar a medição (deve suportar > 10 a 12 horas contínuas).",
        "Insira o microfone cuidadosamente no acoplador do Calibrador Acústico.",
        "Ligue o calibrador no nível de referência (ex: 94,0 dB a 1 kHz).",
        "Execute a função de calibração do dosímetro. O visor deve marcar 94,0 dB (tolerância máxima permitida de ± 0,3 dB).",
        "Anote o valor da calibração inicial no relatório de campo.",
        "Ao retirar o dosímetro do trabalhador no final do turno, repita o ensaio com o calibrador acústico (calibração final).",
      ],
      criterioAceitacao: "A diferença entre a calibração acústica inicial e final não pode exceder ± 1,0 dB (segundo NHO 01). Se a variação for > 1,0 dB, a medição deve ser desconsiderada e refeita.",
    },
    passoAPassoCampo: [
      {
        etapa: 1,
        titulo: "1. Programação dos Parâmetros Regulamentares no Dosímetro",
        descricao: "Configure os dois canais normativos: CANAL 1 (NR-15): Critério q=5, Limiar de Integração (Threshold) = 80 dB, Nível Critério = 85 dB, Resposta SLOW, Ponderação A. CANAL 2 (NHO 01 / Previdência / PGR): Critério q=3, Limiar = 60 dB (ou 80 dB), Nível Critério = 85 dB, Resposta SLOW, Ponderação A.",
        dicasPraticas: "Para o LTCAT/PPP é obrigatório o uso do critério da NHO 01 (q=3) com NEN (Nível de Exposição Normalizado). Para a NR-15 Insalubridade, usa-se o critério q=5.",
      },
      {
        etapa: 2,
        titulo: "2. Posicionamento do Microfone na Zona Auditiva",
        descricao: "Fixe o microfone no topo do ombro do trabalhador, na região da lapela/trapézio, a uma distância de 10 a 30 cm do canal auditivo mais exposto. Coloque SEMPRE o protetor de vento de espuma acústica.",
        dicasPraticas: "O microfone deve ficar apontado para cima. Fixe o cabo com fita antialérgica na roupa para que o movimento do pescoço não esbarre no microfone gerando picos falsos.",
      },
      {
        etapa: 3,
        titulo: "3. Trava do Teclado e Registro de Atividades",
        descricao: "Inicie a gravação da dosimetria e ative imediatamente a TRAVA DE TECLADO (Lock) para impedir que o trabalhador pause ou altere a medição. Anote os horários das atividades e das pausas (almoço, café, paradas de máquina).",
        dicasPraticas: "Se o trabalhador sair da empresa no horário de almoço, pause a medição ou remova o dosímetro durante esse intervalo e retome no retorno.",
      },
      {
        etapa: 4,
        titulo: "4. Encerramento, Checagem Final e Download",
        descricao: "Retire o aparelho ao final da jornada, destrave o teclado e finalize a sessão. Faça a verificação de calibração pós-medição acústica com o calibrador. Descarregue o relatório com a curva temporal no software.",
        dicasPraticas: "Analise o gráfico 'Time History': picos anormais de 115 dB+ devem ser inspecionados para verificar se houve batida intencional no microfone.",
      },
    ],
    brancoDeCampo: {
      obrigatorio: false,
      instrucao: "Não se aplica a medições físicas de ruído. A garantia da qualidade é fornecida pelo Calibrador Acústico com certificado RBC e pela verificação pré e pós-teste.",
    },
    preservacaoTransporte: {
      acondicionamento: "Transportar os dosímetros e calibradores em maleta rígida antichoque com berço de espuma recortada. Não expor a calor excessivo no porta-malas.",
      tempoLimiteLaboratorio: "Download direto em campo via notebook ou na consultoria de SST.",
      documentacao: "Emitir Histórico Temporal de Dosimetria constando: Dose diária (%), Nível Médio (Lavg / NE), NEN (dB), Nível Máximo (Lmax), Nível Pico (Lpeak), calibração inicial e final.",
    },
    limitesTolerancia: {
      nr15: "85 dB(A) para 8 horas de trabalho (Dose 100%, taxa de dobra q=5). Nível Máximo permitido sem proteção: 115 dB(A).",
      acgih: "85 dB(A) para 8 horas com taxa de dobra q=3 (Critério NHO 01 / Fundacentro / INSS).",
      nivelAcaoNR09: "80 dB(A) (Dose de 50% para 8 horas de jornada no critério normativo)",
    },
    calculoAmostrador: {
      formula: "NEN = NE + 10 × log10(Te / 480), onde Te é o tempo de exposição diário em minutos e NE é o nível equivalente medido.",
      exemplo: "Exemplo: Medição de NE = 88,0 dB(A) em 420 minutos de jornada efetiva: NEN = 88,0 + 10 × log10(420/480) = 87,4 dB(A).",
    },
  },

  // 3. POEIRAS MINERAIS E FRAÇÃO RESPIRÁVEL / SÍLICA LIVRE (NR-15 ANEXO 12 / NHO 08)
  {
    id: "poeiras_silica",
    agente: "Poeiras Minerais / Sílica Livre Cristalizada (Quartzo) e Poeira Total",
    categoria: "poeiras",
    sinonimos: ["Poeira Respirável", "Sílica", "Quartzo", "Poeira Mineral", "Poeira de Cimento", "Marmoraria", "Construção Civil", "Areia"],
    cas: "14808-60-7 (Quartzo / Sílica)",
    normasRegulamentadoras: ["NR-15 Anexo 12", "NR-09", "NHO 08 (Fundacentro)", "NIOSH 7500 / 0600", "ACGIH TLVs"],
    metodologiaReferencia: "NHO 08 Fundacentro / NIOSH 7500 (Difração de Raios-X - DRX para Sílica) / NIOSH 0600 (Gravimetria)",
    resumoObjetivo: "Quantificação gravimétrica da poeira respirável e teor percentual de sílica livre cristalizada (quartzo, cristobalita, tridimita) para prevenção da Silicose e enquadramento de insalubridade e aposentadoria especial.",
    meioColeta: {
      dispositivo: "Cassete de 37 mm de duas ou três seções com Filtro de Membrana de PVC (porosidade 5,0 µm) acoplado a Ciclone Separador de Fração Respirável (Ciclone de Nylon Dorr-Oliver ou Ciclone de Alumínio Higgins-Dewell).",
      especificacao: "Filtro de PVC pré-pesado e dessecado em balança analítica de 6 casas decimais pelo laboratório credenciado.",
      acessorios: [
        "Bomba de amostragem gravimétrica com compensação eletrônica de fluxo",
        "Ciclone separador de partículas respiráveis (ponto de corte d50 = 4,0 µm)",
        "Suporte de fixação do ciclone na lapela",
        "Câmara de calibração para ciclone (jarra de calibração)",
        "Calibrador de vazão primário (ex: Gilian Gilibrator ou MesaLabs Defender)",
      ],
    },
    parametrosBomba: {
      vazaoRecomendada: "Ciclone de Nylon Dorr-Oliver: EXATAMENTE 1,70 L/min | Ciclone de Alumínio Higgins-Dewell: EXATAMENTE 2,50 L/min | Ciclone SKC GS-1: 2,75 L/min",
      volumeMinimoLitros: "400 a 800 Litros (amostragem em jornadas completas para garantir massa mínima detectável)",
      volumeMaximoLitros: "1000 Litros (evitar sobrecarga de massa no filtro > 2 a 3 mg)",
      tempoColetaSugerido: "Mínimo de 4 a 6 horas (ou jornada inteira de corte de granito/mármore, demolição, fundição ou cimento)",
      temperaturaUmidade: "Registrar condições ambientais. Evitar que o ciclone vire de cabeça para baixo durante a coleta.",
    },
    calibragemPassoAPasso: {
      titulo: "Calibração de Bomba com Ciclone de Poeira Respirável",
      instrucoes: [
        "Monte o conjunto de calibração: Insira um cassete de teste com filtro de PVC no Ciclone.",
        "Conecte o ciclone dentro da Jarra de Calibração (Câmara de Calibração) ou use o adaptador próprio do fabricante.",
        "Conecte a saída da câmara ao Calibrador Primário e a mangueira à Bomba Gravimétrica.",
        "Ligue a bomba e calibre rigorosamente para a vazão de corte do ciclone utilizado (Ex: 1,70 L/min para o ciclone Dorr-Oliver de nylon 10mm).",
        "Realize 3 medições de vazão e confirme a média com precisão de ± 1%.",
        "Ao final da amostragem, faça a checagem pós-calibração com o cassete de teste.",
      ],
      criterioAceitacao: "Vazão final deve permanecer dentro de ± 5% da vazão de calibração inicial. A vazão no ciclone é crítica pois define a curva de corte das partículas respiráveis (< 4 µm).",
    },
    passoAPassoCampo: [
      {
        etapa: 1,
        titulo: "1. Montagem do Cassete Lacrado no Ciclone",
        descricao: "Retire os plugues vermelho e azul do cassete pré-pesado fornecido pelo laboratório. Conecte o cassete firmemente no topo do ciclone respirável, garantindo vedação perfeita. Conecte a mangueira condutora.",
        dicasPraticas: "NUNCA abra o cassete em campo! O cassete deve permanecer lacrado com a fita celulósica de identificação do laboratório.",
      },
      {
        etapa: 2,
        titulo: "2. Fixação e Alerta de Posição Vertical",
        descricao: "Prenda o ciclone com o bocal voltado para frente na ZRA (lapela) do trabalhador. Mantenha o ciclone RIGIDAMENTE NA VERTICAL.",
        dicasPraticas: "ATENÇÃO CRÍTICA: O ciclone possui um copo coletor no fundo para reter as partículas grossas (> 4 µm). Se o ciclone for virado de cabeça para baixo, essas partículas grossas cairão sobre o filtro de PVC, invalidando totalmente a amostra!",
      },
      {
        etapa: 3,
        titulo: "3. Acompanhamento e Desligamento",
        descricao: "Ligue a bomba, inicie a contagem de tempo e acompanhe a atividade. Ao término do período de coleta, desligue a bomba e anote os minutos exatos.",
        dicasPraticas: "Desmonte o cassete com cuidado mantendo-o sempre na vertical. Tampe imediatamente os orifícios do cassete com os plugues de silicone vedantes.",
      },
      {
        etapa: 4,
        titulo: "4. Acondicionamento com a Face voltada para CIMA",
        descricao: "Guarde o cassete dentro do estojo de transporte rígido com a face de entrada do ar voltada SEMPRE PARA CIMA para evitar que a poeira se solte da membrana.",
        dicasPraticas: "Não chacoalhe o cassete e não deixe cair.",
      },
    ],
    brancoDeCampo: {
      obrigatorio: true,
      instrucao: "Levar para o campo 1 cassete lacrado do mesmo lote de fabricação. Retirar os plugues no local, recolocar os plugues imediatamente sem ligar na bomba. Identificar como 'BRANCO DE CAMPO - SÍLICA'.",
    },
    preservacaoTransporte: {
      acondicionamento: "Caixa rígida acolchoada, mantendo os cassetes travados na posição vertical ou com face voltada para cima. Não necessita refrigeração.",
      tempoLimiteLaboratorio: "Até 30 dias para análise gravimétrica e DRX.",
      documentacao: "Ficha de Cadeia de Custódia solicitando: 'Gravimetria de Poeira Respirável e Análise de Sílica Livre Cristalizada / Quartzo por DRX conforme NIOSH 7500'. Informar vazão exata e volume em Litros.",
    },
    limitesTolerancia: {
      nr15: "Limite de Tolerância NR-15 Anexo 12: L.T. = 8 / (% Quartzo + 2) mg/m³ para poeira respirável (Insalubridade em Grau Máximo 40%).",
      acgih: "Sílica Cristalizada (Fração Respirável): TLV-TWA 0,025 mg/m³ (Classificação A2 - Carcinogênico Humano Suspeito).",
      nivelAcaoNR09: "50% do limite de tolerância (0,0125 mg/m³ pela ACGIH)",
    },
    calculoAmostrador: {
      formula: "Concentração (mg/m³) = [Massa líquida coletada no filtro (mg) / Volume total de ar coletado (m³)]",
      exemplo: "Exemplo: 0,85 mg de poeira coletados em 510 Litros (0,510 m³) = 0,85 / 0,510 = 1,67 mg/m³ de Poeira Respirável.",
    },
  },

  // 4. CALOR / SOBRECARGA TÉRMICA (NR-15 ANEXO 3 / NHO 06 FUNDACENTRO)
  {
    id: "calor_ibutg",
    agente: "Calor / Sobrecarga Térmica (Índice IBUTG)",
    categoria: "fisico",
    sinonimos: ["Calor", "IBUTG", "Estresse Térmico", "Temperatura", "Termômetro de Globo", "Fornos", "Trabalho a Céu Aberto"],
    normasRegulamentadoras: ["NR-15 Anexo 3 (Portaria MTP 426/2021)", "NR-09 Anexo 3", "NHO 06 (Fundacentro)", "ACGIH"],
    metodologiaReferencia: "NHO 06 Fundacentro (Avaliação da Exposição Ocupacional ao Calor com Medidor de IBUTG)",
    resumoObjetivo: "Determinação do Índice de Bulbo Úmido Termômetro de Globo (IBUTG) e confronto com a taxa metabólica (M em Watts) para verificação de sobrecarga térmica ocupacional e necessidade de medidas preventivas / pausas térmicas.",
    meioColeta: {
      dispositivo: "Medidor Eletrônico de Sobrecarga Térmica / Termômetro de Globo IBUTG",
      especificacao: "Conjunto de 3 sensores: Termômetro de Bulbo Seco (tbs), Termômetro de Bulbo Úmido Natural (tbun) e Termômetro de Globo de cobre preto de 6 polegadas (tg).",
      acessorios: [
        "Frasco com Água Destilada ou Deionizada de alta pureza",
        "Pavio de algodão limpo e novo para o bulbo úmido",
        "Tripé regulável para sustentação na altura da cintura/tórax (1,2m a 1,5m)",
        "Anemômetro / Termoanemômetro para medição da velocidade do ar (m/s)",
      ],
    },
    parametrosBomba: {
      vazaoRecomendada: "N/A (Medição Física)",
      volumeMinimoLitros: "N/A",
      volumeMaximoLitros: "N/A",
      tempoColetaSugerido: "Período contínuo de 60 minutos mais críticos da jornada (ou ciclo de trabalho representativo mais desfavorável termicamente).",
      temperaturaUmidade: "Medição nas horas mais quentes do dia (geralmente entre 11h e 15h para trabalho a céu aberto com carga solar).",
    },
    calibragemPassoAPasso: {
      titulo: "Estabilização e Preparação do Medidor de IBUTG",
      instrucoes: [
        "Monte o medidor sobre o tripé na altura representativa do tórax do trabalhador (aprox. 1,20 m para trabalho de pé ou 0,80 m para trabalho sentado).",
        "Umedeça o pavio de algodão do sensor de Bulbo Úmido com ÁGUA DESTILADA. O pavio deve envolver todo o sensor e alcançar o reservatório inferior.",
        "NUNCA use água da torneira ou mineral (os sais minerais impregnam o pavio e alteram a taxa de evaporação).",
        "Ligue o aparelho e AGUARDE O TEMPO DE ESTABILIZAÇÃO TÉRMICA de no mínimo 20 a 30 minutos antes de iniciar as leituras oficiais.",
        "Confirme a estabilização quando a temperatura do globo (tg) não variar mais que 0,2°C em 5 minutos.",
      ],
      criterioAceitacao: "Sensor de globo deve estar limpo e fosco (emissividade > 0,95). Água destilada limpa e nível do reservatório completo.",
    },
    passoAPassoCampo: [
      {
        etapa: 1,
        titulo: "1. Identificação do Tipo de Ambiente (Com ou Sem Carga Solar)",
        descricao: "Classifique o local: AMBIENTE INTERNO ou SEM CARGA SOLAR DIRETA (Fórmula: IBUTG = 0,7 tbun + 0,3 tg) OU AMBIENTE EXTERNO COM CARGA SOLAR DIRETA (Fórmula: IBUTG = 0,7 tbun + 0,1 tbs + 0,2 tg).",
        dicasPraticas: "Para trabalhos a céu aberto sob o sol, os três sensores entram no cálculo.",
      },
      {
        etapa: 2,
        titulo: "2. Posicionamento no Ponto de Trabalho",
        descricao: "Coloque o medidor o mais próximo possível do posto de trabalho do operário, sem obstruir o fluxo de ar natural e sem encostar nas roupas ou máquinas que possam irradiar calor falso.",
        dicasPraticas: "Não fique parado na frente do termômetro de globo durante a medição para não fazer sombra ou bloquear a radiação infravermelha.",
      },
      {
        etapa: 3,
        titulo: "3. Registro Contínuo por 60 minutos",
        descricao: "Registre as temperaturas (tbs, tbun, tg e IBUTG) continuamente no período mais desfavorável. Avalie a taxa metabólica do trabalhador (Quadro 2 da NR-09 / NHO 06: leve, moderada, pesada em Watts).",
        dicasPraticas: "Se o trabalhador transita entre postos com temperaturas diferentes, calcule o IBUTG médio ponderado pelo tempo.",
      },
      {
        etapa: 4,
        titulo: "4. Análise do Limite de Exposição Ocupacional",
        descricao: "Compare o valor de IBUTG obtido com o Limite de Tolerância da NR-09 / NR-15 para a respectiva taxa de metabolismo em Watts (ex: Para trabalho pesado de 400 W, o limite máximo de IBUTG é 26,0 °C).",
        dicasPraticas: "Se o IBUTG ultrapassar o limite, deve ser implantado regime de revezamento/pausas em local termicamente ameno e fornecimento de água fresca e eletrólitos.",
      },
    ],
    brancoDeCampo: {
      obrigatorio: false,
      instrucao: "Não aplicável a agentes térmicos.",
    },
    preservacaoTransporte: {
      acondicionamento: "Esvaziar o reservatório de água antes de guardar na maleta para não molhar os circuitos eletrônicos.",
      tempoLimiteLaboratorio: "Download direto do datalogger de calor.",
      documentacao: "Planilha de monitoramento de sobrecarga térmica com IBUTG máximo, médio, cálculo do metabolismo M (Watts), vestimenta utilizada e taxa de correção de vestimenta (CAV).",
    },
    limitesTolerancia: {
      nr15: "Exemplos NR-15 / NR-09: Trabalho Leve (150 W) -> 30,0 °C | Trabalho Moderado (250 W) -> 28,0 °C | Trabalho Pesado (400 W) -> 26,0 °C",
      acgih: "Curvas de TLV de estresse térmico para trabalhadores aclimatizados e não-aclimatizados com aplicação de CAV (Clothing Adjustment Value).",
      nivelAcaoNR09: "IBUTG correspondente ao nível de ação do Quadro 1 da NR-09 Anexo 3.",
    },
    calculoAmostrador: {
      formula: "Sem Carga Solar: IBUTG = (0,7 × tbun) + (0,3 × tg) | Com Carga Solar: IBUTG = (0,7 × tbun) + (0,1 × tbs) + (0,2 × tg)",
      exemplo: "Exemplo Sem Sol: tbun = 22,0°C e tg = 34,0°C -> IBUTG = (0,7 × 22) + (0,3 × 34) = 15,4 + 10,2 = 25,6 °C.",
    },
  },

  // 5. FUMOS METÁLICOS / SOLDA (CHUMBO, FERRO, MANGANÊS, CROMO HEXAVALENTE)
  {
    id: "fumos_solda",
    agente: "Fumos Metálicos (Manganês, Ferro, Cromo VI, Chumbo, Níquel)",
    categoria: "quimico",
    sinonimos: ["Fumos de Solda", "Soldagem MIG/MAG", "Solda Eletrodo Revestido", "Solda TIG", "Manganês", "Oxicorte", "Fumos Metálicos"],
    cas: "7439-96-5 (Manganês) / 18540-29-9 (Cromo VI)",
    normasRegulamentadoras: ["NR-15 Anexos 11 e 12", "NR-09", "NIOSH 7300 / 7303", "NHO Fundacentro", "ACGIH TLVs"],
    metodologiaReferencia: "NIOSH 7300 / NIOSH 7303 (Espectrometria de Emissão Óptica com Plasma Indutivamente Acoplado - ICP-OES)",
    resumoObjetivo: "Avaliação quantitativa da exposição ocupacional a fumos de soldagem e metais tóxicos no processo de união e corte térmico de metais.",
    meioColeta: {
      dispositivo: "Cassete de 37 mm de 3 seções com Filtro de Membrana de Éster Misto de Celulose (MCE) de porosidade 0,8 µm e almofada de suporte de celulose (pad).",
      especificacao: "Filtro MCE livre de contaminação metálica de fundo (background trace metals).",
      acessorios: [
        "Bomba de amostragem individual gravimétrica com vazão constante",
        "Suporte para fixação do cassete de 3 seções na lapela OU sob a máscara de solda (posicionamento intra-máscara)",
        "Mangueira flexível Tygon",
        "Calibrador de vazão primário",
      ],
    },
    parametrosBomba: {
      vazaoRecomendada: "1,5 a 2,0 L/min (habitual: 2,0 L/min)",
      volumeMinimoLitros: "200 a 500 Litros (garantir limite de quantificação laboratorial para manganês e cromo)",
      volumeMaximoLitros: "1000 Litros",
      tempoColetaSugerido: "Coleta representativa durante as operações de arco elétrico aberto e soldagem (2 a 4 horas ou mais)",
      temperaturaUmidade: "Registrar condições ambientais e tipo de processo de solda (MIG, MAG, TIG, Eletrodo, Arame Tubular).",
    },
    calibragemPassoAPasso: {
      titulo: "Calibração para Fumos Metálicos",
      instrucoes: [
        "Monte o trem: Calibrador -> Cassete MCE de calibração aberto -> Mangueira -> Bomba de Amostragem.",
        "Ajuste a vazão para 2,00 L/min no calibrador primário.",
        "Tire a média de 3 leituras consecutivas.",
        "Após o encerramento do ensaio, repita a pós-calibração com o cassete de calibração.",
      ],
      criterioAceitacao: "Variação de vazão pós-coleta ≤ ± 5%.",
    },
    passoAPassoCampo: [
      {
        etapa: 1,
        titulo: "1. Abertura do Cassete (Amostragem com Bocal Aberto / Open-Face)",
        descricao: "Para fumos metálicos, remove-se a tampa frontal do cassete de 3 seções (amostragem em bocal aberto) para que os fumos se depositem uniformemente sobre a membrana MCE sem perda nas paredes da tampa.",
        dicasPraticas: "Guarde a tampa plástica azul em local limpo para fechar o cassete após a coleta.",
      },
      {
        etapa: 2,
        titulo: "2. Posicionamento em Soldadores (Sob a Máscara de Solda)",
        descricao: "Se o soldador utiliza máscara de solda basculante ou escudo de proteção, fixe o cassete na lapela por DENTRO DA MÁSCARA (se houver espaço seguro sem queimar o equipamento) ou o mais próximo possível da zona respiratória.",
        dicasPraticas: "Proteja a mangueira contra fagulhas e respingos de solda incandescentes que possam furar o tubo plástico.",
      },
      {
        etapa: 3,
        titulo: "3. Encerramento e Fechamento com a Tampa Frontal",
        descricao: "Ao finalizar a coleta, desligue a bomba, anote os minutos exatos, coloque a tampa frontal do cassete e insira os plugues vermelho e azul nas extremidades.",
        dicasPraticas: "Identifique a amostra (ex: FUM-SOLDA-01) e anote no diário o tipo de metal-base soldado (aço carbono, inox, alumínio) e arame/eletrodo utilizado.",
      },
    ],
    brancoDeCampo: {
      obrigatorio: true,
      instrucao: "1 cassete MCE virgem por grupo de amostras, aberto no local e fechado imediatamente.",
    },
    preservacaoTransporte: {
      acondicionamento: "Caixa rígida acolchoada, mantendo os cassetes com a face voltada para cima. Enviar em temperatura ambiente.",
      tempoLimiteLaboratorio: "Até 30 dias para digestão ácida e análise por ICP-OES.",
      documentacao: "Cadeia de custódia especificando os elementos a quantificar: Manganês (Mn), Ferro (Fe), Cromo Total / Cromo VI (Cr), Chumbo (Pb), Cobre (Cu), Níquel (Ni).",
    },
    limitesTolerancia: {
      nr15: "Manganês e seus compostos: 1,0 mg/m³ para fumos e poeiras (Insalubridade em Grau Máximo 40% - NR-15 Anexo 12).",
      acgih: "Manganês (Fração Respirável): TLV-TWA 0,02 mg/m³ | Cromo VI: TLV-TWA 0,0002 mg/m³ (Carcinogênico A1).",
      nivelAcaoNR09: "50% do limite de exposição ocupacional.",
    },
    calculoAmostrador: {
      formula: "Concentração do Metal (mg/m³) = Massa de Metal detectada (µg) / [Volume em Litros]",
      exemplo: "Exemplo: 40 µg de Manganês em 480 Litros de ar coletados = 40 / 480 = 0,083 mg/m³ de Mn.",
    },
  },

  // 6. VIBRAÇÃO OCUPACIONAL (VCI E VMB - NHO 09 E NHO 10 FUNDACENTRO / NR-09)
  {
    id: "vibracao_vci_vmb",
    agente: "Vibrações Ocupacionais (VCI - Corpo Inteiro e VMB - Mãos e Braços)",
    categoria: "fisico",
    sinonimos: ["Vibração", "VCI", "VMB", "Tratores", "Empilhadeiras", "Martelete", "Lixadeiras", "Arenq", "VDVR"],
    normasRegulamentadoras: ["NR-15 Anexo 8", "NR-09 Anexo 1", "NHO 09 (VCI Fundacentro)", "NHO 10 (VMB Fundacentro)", "ISO 2631", "ISO 5349"],
    metodologiaReferencia: "NHO 09 (VCI) e NHO 10 (VMB) da Fundacentro com Medidor Integrador Triaxial de Vibração Humana.",
    resumoObjetivo: "Avaliação da aceleração resultante da exposição normalizada (aren) e Valor da Dose de Vibração Resultante (VDVR) para prevenção de distúrbios da coluna vertebral e síndrome dos dedos brancos (Raynaud).",
    meioColeta: {
      dispositivo: "Medidor Integrador de Vibração Humana Triaxial (Ponderação de frequência Wk e Wd para VCI; Wh para VMB)",
      especificacao: "Acelerômetro triaxial ortogonal (eixos x, y, z) montado em almofada de borracha semirrígida (disco para assento de VCI) ou adaptador de empunhadura para VMB.",
      acessorios: [
        "Calibrador de vibração mecânico de campo (159,2 Hz a 10 m/s² ou 1 g)",
        "Adaptadores mecânicos de fixação em ferramentas rotativas e percussivas",
        "Cabo blindado de baixo ruído mecânico",
        "Software de cálculo de aren e VDVR",
      ],
    },
    parametrosBomba: {
      vazaoRecomendada: "N/A (Medição Física)",
      volumeMinimoLitros: "N/A",
      volumeMaximoLitros: "N/A",
      tempoColetaSugerido: "Amostragem de ciclos operacionais completos (ex: 3 a 5 ciclos representativos de operação de empilhadeira em piso irregular ou 20 a 30 minutos de operação contínua de martelete/lixadeira).",
      temperaturaUmidade: "Fixar cabos para evitar efeito triboelétrico.",
    },
    calibragemPassoAPasso: {
      titulo: "Calibração e Teste de Sensibilidade do Acelerômetro Triaxial",
      instrucoes: [
        "Conecte cada um dos eixos (X, Y, Z) do acelerômetro no excitador/calibrador de vibração mecânica.",
        "Acione o calibrador na aceleração de referência (ex: 10,0 m/s² a 159 Hz).",
        "Verifique a leitura em cada canal do medidor e confirme a calibração com desvio < 2%.",
        "Repita a verificação ao final da bateria de medições.",
      ],
      criterioAceitacao: "Sensibilidade dos eixos calibrada com certificado RBC do conjunto medidor/acelerômetro.",
    },
    passoAPassoCampo: [
      {
        etapa: 1,
        titulo: "1. VCI (Corpo Inteiro): Posicionamento no Assento",
        descricao: "Coloque a almofada contendo o acelerômetro triaxial sobre o assento do veículo/máquina (empilhadeira, trator, caminhão), exatamente sob as tuberosidades isquiáticas do operador sentado. O operador deve sentar-se sobre o disco.",
        dicasPraticas: "Oriente o operador a manter a postura normal de condução sem retirar o peso do corpo sobre o sensor.",
      },
      {
        etapa: 2,
        titulo: "2. VMB (Mãos e Braços): Fixação na Empunhadura",
        descricao: "Fixe o acelerômetro triaxial miniatura no adaptador rígido e prenda-o firmemente na manopla/empunhadura da ferramenta vibratória (martelete, motosserra, lixadeira), o mais próximo possível da mão do operador.",
        dicasPraticas: "O acelerômetro não pode ter folga ou deslizar na manopla durante o uso severo.",
      },
      {
        etapa: 3,
        titulo: "3. Registro dos Ciclos de Trabalho",
        descricao: "Cronometre o tempo real de contato da ferramenta com a mão (tempo de gatilho/operação efetiva) ou tempo de condução da máquina na jornada diária.",
        dicasPraticas: "O tempo de exposição efetivo (T_exp) é fundamental para normalizar a aceleração para 8 horas (aren).",
      },
    ],
    brancoDeCampo: {
      obrigatorio: false,
      instrucao: "Não se aplica.",
    },
    preservacaoTransporte: {
      acondicionamento: "Maleta rígida antichoque. Cuidado para não deixar cair os acelerômetros piezelétricos/capacitivos.",
      tempoLimiteLaboratorio: "Processamento via software de vibração ocupacional.",
      documentacao: "Relatório de ensaio com aceleração rms por eixo (awx, awy, awz), fatores de multiplicação (k=1,4 para X/Y em VCI e k=1,0 para Z), aceleração resultante (are) e aren (8h).",
    },
    limitesTolerancia: {
      nr15: "VCI: aren = 1,1 m/s² ou VDVR = 21,0 m/s^1,75 (Insalubridade Grau Médio 20%). VMB: aren = 5,0 m/s² (Insalubridade Grau Médio 20%).",
      acgih: "VCI: 1,1 m/s² | VMB: 5,0 m/s²",
      nivelAcaoNR09: "VCI: aren = 0,5 m/s² ou VDVR = 9,1 m/s^1,75 | VMB: aren = 2,5 m/s²",
    },
    calculoAmostrador: {
      formula: "aren = are × √(Te / 8), onde are é a aceleração resultante ponderada e Te é o tempo de exposição diário em horas.",
      exemplo: "Exemplo VMB: are medida = 4,0 m/s² durante 4 horas de uso de lixadeira -> aren = 4,0 × √(4 / 8) = 4,0 × 0,707 = 2,83 m/s² (Ultrapassa o nível de ação de 2,5 m/s²).",
    },
  },
];

/**
 * Encontra o protocolo de higiene mais adequado para um risco ou produto químico
 */
export function buscarProtocoloHigiene(termoOuNome: string): ProtocoloAmostragem | undefined {
  if (!termoOuNome) return undefined;
  const termoLower = termoOuNome.toLowerCase();

  return PROTOCOLOS_HIGIENE.find((proto) => {
    if (proto.agente.toLowerCase().includes(termoLower) || termoLower.includes(proto.agente.toLowerCase())) return true;
    if (proto.sinonimos?.some((s) => termoLower.includes(s.toLowerCase()) || s.toLowerCase().includes(termoLower))) return true;
    if (proto.cas && termoLower.includes(proto.cas.toLowerCase())) return true;
    return false;
  });
}
