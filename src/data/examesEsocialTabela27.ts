export interface ExameTabela27Item {
  id: string;
  codigoEsocial: string; // Código de 4 dígitos da Tabela 27 do eSocial (ex: "0295")
  nome: string;
  grupo: string;
  detalhe?: string;
  obrigatorio?: boolean;
}

export const EXAMES_TABELA_27: ExameTabela27Item[] = [
  // 1. Avaliação Clínica Obrigatória
  {
    id: "clinico",
    codigoEsocial: "0295",
    nome: "Avaliação Clínica Ocupacional (Anamnese + Exame Físico)",
    grupo: "Avaliação Clínica Obrigatória",
    detalhe: "Obrigatório em todos os ASOs conforme NR-07 (item 7.5.6)",
    obrigatorio: true,
  },

  // 2. Audiologia e Audiometria
  {
    id: "audiometria",
    codigoEsocial: "0215",
    nome: "Audiometria Tonal Liminar (ATL)",
    grupo: "Audiologia e Visão",
    detalhe: "Obrigatório na exposição a níveis de pressão sonora elevados (NR-07 Anexo II)",
  },
  {
    id: "audiometria_voz",
    codigoEsocial: "0216",
    nome: "Audiometria Vocal (Logoaudiometria)",
    grupo: "Audiologia e Visão",
    detalhe: "Avaliação da discriminação vocal para vigilância auditiva",
  },
  {
    id: "imitanciometria",
    codigoEsocial: "0217",
    nome: "Imitanciometria / Impedanciometria",
    grupo: "Audiologia e Visão",
    detalhe: "Avaliação da orelha média e reflexos estapedianos",
  },
  {
    id: "acuidade",
    codigoEsocial: "0230",
    nome: "Teste de Acuidade Visual (Snellen)",
    grupo: "Audiologia e Visão",
    detalhe: "Obrigatório para trabalho em altura (NR-35), motoristas e operadores de máquinas",
  },
  {
    id: "campimetria",
    codigoEsocial: "0231",
    nome: "Campimetria Computadorizada",
    grupo: "Audiologia e Visão",
    detalhe: "Avaliação de campo visual periférico e central",
  },
  {
    id: "cromatismo",
    codigoEsocial: "0232",
    nome: "Teste de Visão de Cores (Ishihara / Cromatismo)",
    grupo: "Audiologia e Visão",
    detalhe: "Diferenciação de cores para eletricistas (NR-10), maquinistas e inspetores",
  },

  // 3. Respiratório e Pulmonar
  {
    id: "espirometria",
    codigoEsocial: "0200",
    nome: "Espirometria Ocupacional (Capacidade Vital Forçada)",
    grupo: "Respiratório e Radiologia",
    detalhe: "Obrigatório na exposição a poeiras minerais, sílica, asbesto e fumos metálicos",
  },
  {
    id: "rx_torax",
    codigoEsocial: "0001",
    nome: "Radiografia do Tórax Padrão OIT (PA + Perfil)",
    grupo: "Respiratório e Radiologia",
    detalhe: "Investigação e rastreamento de pneumoconioses conforme critérios OIT",
  },
  {
    id: "rx_coluna_l",
    codigoEsocial: "0005",
    nome: "Radiografia da Coluna Lombossacra",
    grupo: "Respiratório e Radiologia",
    detalhe: "Avaliação osteomuscular para levantamento e transporte manual de cargas",
  },
  {
    id: "rx_coluna_c",
    codigoEsocial: "0003",
    nome: "Radiografia da Coluna Cervical",
    grupo: "Respiratório e Radiologia",
    detalhe: "Investigação de sobrecarga postural na coluna cervical",
  },
  {
    id: "oximetria",
    codigoEsocial: "0203",
    nome: "Oximetria de Pulso em Repouso",
    grupo: "Respiratório e Radiologia",
    detalhe: "Monitoramento de saturação periférica de oxigênio",
  },

  // 4. Eletrocardiograma e Cardiológicos
  {
    id: "ecg",
    codigoEsocial: "0175",
    nome: "Eletrocardiograma de Repouso (ECG)",
    grupo: "Cardiológico e Neurológico",
    detalhe: "Obrigatório para Trabalho em Altura (NR-35), Espaço Confinado (NR-33) e Eletricidade (NR-10)",
  },
  {
    id: "ergometria",
    codigoEsocial: "0176",
    nome: "Teste Ergométrico (ECG de Esforço)",
    grupo: "Cardiológico e Neurológico",
    detalhe: "Avaliação cardiovascular sob esforço em trabalhos pesados e brigadistas",
  },
  {
    id: "eeg",
    codigoEsocial: "0181",
    nome: "Eletroencefalograma Ocupacional (EEG)",
    grupo: "Cardiológico e Neurológico",
    detalhe: "Rastreamento neurológico de crises convulsivas e ausências (NR-35 / NR-33)",
  },

  // 5. Hematologia e Bioquímica
  {
    id: "hemograma",
    codigoEsocial: "0301",
    nome: "Hemograma Completo com Plaquetas",
    grupo: "Hematologia e Bioquímica",
    detalhe: "Avaliação geral e monitoramento de exposição a solventes, benzeno e hidrocarbonetos",
  },
  {
    id: "glicemia",
    codigoEsocial: "0320",
    nome: "Glicemia de Jejum",
    grupo: "Hematologia e Bioquímica",
    detalhe: "Prevenção de quadros hipoglicêmicos e desmaios em atividades de risco crítico",
  },
  {
    id: "hba1c",
    codigoEsocial: "0328",
    nome: "Hemoglobina Glicada (HbA1c)",
    grupo: "Hematologia e Bioquímica",
    detalhe: "Controle metabólico de glicose a médio/longo prazo",
  },
  {
    id: "colesterol",
    codigoEsocial: "0336",
    nome: "Perfil Lipídico (Colesterol Total, HDL, LDL, VLDL)",
    grupo: "Hematologia e Bioquímica",
    detalhe: "Risco cardiovascular global em trabalhadores de turnos e operadores",
  },
  {
    id: "triglicerides",
    codigoEsocial: "0339",
    nome: "Triglicerídeos Séricos",
    grupo: "Hematologia e Bioquímica",
    detalhe: "Avaliação do metabolismo lipídico",
  },
  {
    id: "ureia",
    codigoEsocial: "0356",
    nome: "Ureia Sérica",
    grupo: "Função Renal e Hepática",
    detalhe: "Avaliação da função de filtração renal",
  },
  {
    id: "creatinina",
    codigoEsocial: "0357",
    nome: "Creatinina Sérica",
    grupo: "Função Renal e Hepática",
    detalhe: "Avaliação da taxa de filtração glomerular",
  },
  {
    id: "urinalise",
    codigoEsocial: "0116",
    nome: "Urinálise Completa (EAS / Urina Tipo I)",
    grupo: "Função Renal e Hepática",
    detalhe: "Pesquisa de elementos anormais, sedimento e proteinúria",
  },
  {
    id: "tgo",
    codigoEsocial: "0340",
    nome: "TGO / AST (Transaminase Oxalacética)",
    grupo: "Função Renal e Hepática",
    detalhe: "Avaliação hepática em exposição a agentes hepatotóxicos",
  },
  {
    id: "tgp",
    codigoEsocial: "0341",
    nome: "TGP / ALT (Transaminase Pirúvica)",
    grupo: "Função Renal e Hepática",
    detalhe: "Enzima marcadora específica de lesão hepática celular",
  },
  {
    id: "gama_gt",
    codigoEsocial: "0342",
    nome: "Gama-Glutamil Transferase (GGT / Gama GT)",
    grupo: "Função Renal e Hepática",
    detalhe: "Indicador sensível de sobrecarga hepática e colestase",
  },

  // 6. Toxicologia Ocupacional e Indicadores Biológicos (IBE)
  {
    id: "toxicologico",
    codigoEsocial: "0280",
    nome: "Exame Toxicológico com Larga Janela de Detecção (90 dias)",
    grupo: "Toxicologia e IBE (NR-07)",
    detalhe: "Obrigatório para motoristas profissionais conforme Art. 168 da CLT e Código de Trânsito",
  },
  {
    id: "chumbo_sangue",
    codigoEsocial: "0282",
    nome: "Chumbo no Sangue (Plumbemia - BEI/IBE)",
    grupo: "Toxicologia e IBE (NR-07)",
    detalhe: "NR-07 Quadro I - Exposição a Chumbo inorgânico e soldas",
  },
  {
    id: "acido_tt_muconico",
    codigoEsocial: "0283",
    nome: "Ácido trans,trans-Mucônico na Urina (Benzeno)",
    grupo: "Toxicologia e IBE (NR-07)",
    detalhe: "Indicador biológico de exposição ao Benzeno (postos de combustíveis e petroquímica)",
  },
  {
    id: "mercurio_urina",
    codigoEsocial: "0284",
    nome: "Mercúrio na Urina (BEI/IBE)",
    grupo: "Toxicologia e IBE (NR-07)",
    detalhe: "Monitoramento biológico de exposição a Mercúrio metálico e compostos",
  },
  {
    id: "colinesterase",
    codigoEsocial: "0285",
    nome: "Colinesterase Eritrocitária e Plasmática",
    grupo: "Toxicologia e IBE (NR-07)",
    detalhe: "Exposição a defensivos agrícolas organofosforados e carbamatos",
  },

  // 7. Sorologia e Riscos Biológicos (NR-32)
  {
    id: "hbs_ag",
    codigoEsocial: "0422",
    nome: "HBsAg — Hepatite B (Antígeno de Superfície)",
    grupo: "Sorologia e Risco Biológico (NR-32)",
    detalhe: "Triagem para profissionais de saúde e exposição a perfurocortantes (NR-32)",
  },
  {
    id: "anti_hbs",
    codigoEsocial: "0423",
    nome: "Anti-HBs — Imunidade à Hepatite B (Titulação)",
    grupo: "Sorologia e Risco Biológico (NR-32)",
    detalhe: "Confirmação de eficácia vacinal em trabalhadores expostos a material biológico",
  },
  {
    id: "anti_hcv",
    codigoEsocial: "0425",
    nome: "Anti-HCV — Hepatite C",
    grupo: "Sorologia e Risco Biológico (NR-32)",
    detalhe: "Rastreio de exposição e contaminação cruzada por vírus HCV",
  },
  {
    id: "ppd_tuberculina",
    codigoEsocial: "0470",
    nome: "Teste Tuberculínico (PPD / Reação de Mantoux)",
    grupo: "Sorologia e Risco Biológico (NR-32)",
    detalhe: "Triagem de infecção latente por tuberculose em ambientes hospitalares",
  },
  {
    id: "vdrl",
    codigoEsocial: "0430",
    nome: "VDRL / Teste Não Treponêmico",
    grupo: "Sorologia e Risco Biológico (NR-32)",
    detalhe: "Sorologia de triagem geral",
  },

  // 8. Avaliação Psicossocial e Aptidão Específica NRs
  {
    id: "psicossocial",
    codigoEsocial: "0251",
    nome: "Avaliação Psicológica / Psicossocial Ocupacional",
    grupo: "Psicossocial e NRs Específicas",
    detalhe: "Obrigatório para Trabalho em Altura (NR-35) e Espaço Confinado (NR-33)",
  },
  {
    id: "aptidao_altura_nr35",
    codigoEsocial: "0295",
    nome: "Avaliação Específica de Aptidão para Trabalho em Altura (NR-35)",
    grupo: "Psicossocial e NRs Específicas",
    detalhe: "Parecer de aptidão física e mental para atividades com risco de queda (NR-35)",
  },
  {
    id: "aptidao_confinado_nr33",
    codigoEsocial: "0295",
    nome: "Avaliação Específica para Entrada em Espaço Confinado (NR-33)",
    grupo: "Psicossocial e NRs Específicas",
    detalhe: "Parecer médico para trabalhador autorizado e vigia de espaço confinado (NR-33)",
  },
  {
    id: "aptidao_eletricidade_nr10",
    codigoEsocial: "0295",
    nome: "Avaliação Específica para Serviços em Eletricidade (NR-10)",
    grupo: "Psicossocial e NRs Específicas",
    detalhe: "Aptidão para trabalhos em instalações elétricas de baixa e alta tensão",
  },
];
