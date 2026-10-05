export interface ModeloExtintor {
  modelo: string;
  classe: string;
  capacidades: string;
  uso: string;
}

export const MODELOS_EXTINTOR: ModeloExtintor[] = [
  {
    modelo: "Água Pressurizada (AP)",
    classe: "Classe A",
    capacidades: "10 Litros",
    uso: "Materiais sólidos combustíveis (madeira, papel, tecido, fibras).",
  },
  {
    modelo: "Pó Químico Seco ABC (Multiuso)",
    classe: "Classes A:B:C",
    capacidades: "4 kg, 6 kg, 8 kg, 12 kg",
    uso: "Sólidos, líquidos inflamáveis e equipamentos elétricos energizados.",
  },
  {
    modelo: "Dióxido de Carbono (CO2)",
    classe: "Classes B:C",
    capacidades: "4 kg, 6 kg, 10 kg",
    uso: "Equipamentos elétricos energizados (sem deixar resíduos) e líquidos inflamáveis.",
  },
  {
    modelo: "Pó Químico Seco BC",
    classe: "Classes B:C",
    capacidades: "4 kg, 6 kg, 8 kg, 12 kg",
    uso: "Líquidos inflamáveis, graxas, gases e equipamentos elétricos.",
  },
  {
    modelo: "Espuma Mecânica (LGE)",
    classe: "Classes A:B",
    capacidades: "9 Litros / 10 Litros",
    uso: "Líquidos inflamáveis e combustíveis sólidos.",
  },
  {
    modelo: "Classe K (Agente Saponificante)",
    classe: "Classe K",
    capacidades: "6 Litros",
    uso: "Óleos e gorduras vegetais/animais em cozinhas profissionais e coifas.",
  },
  {
    modelo: "Sobre Rodas - Pó Químico ABC/BC (Carreta)",
    classe: "Classes A:B:C ou B:C",
    capacidades: "20 kg, 50 kg",
    uso: "Áreas industriais de alto risco e depósitos de combustíveis.",
  },
  {
    modelo: "Sobre Rodas - Água Pressurizada (Carreta)",
    classe: "Classe A",
    capacidades: "50 L, 75 L, 150 L",
    uso: "Grandes depósitos de madeira, papel e paletes.",
  },
  {
    modelo: "Sobre Rodas - CO2 (Carreta)",
    classe: "Classes B:C",
    capacidades: "25 kg, 50 kg",
    uso: "Salas de transformadores, geradores e subestações.",
  },
];

export const EQUIPAMENTOS_EMERGENCIA_OPCOES = [
  "Hidrante / Abrigo com Mangueira e Esguicho",
  "Iluminação de Emergência em Bloco Autônomo",
  "Sinalização Fotoluminescente de Rota de Fuga",
  "Porta Corta-Fogo com Barra Antipânico",
  "Alarme de Incêndio / Botoeira Manual",
  "Detector Óptico de Fumaça / Térmico",
  "Chuveiro Automático (Sprinkler)",
  "Kit de Primeiros Socorros / Maleta CIPA",
  "Maca Rígida de Resgate com Cintos e Colar Cervical",
  "Chuveiro e Lava-Olhos de Emergência",
  "Central de Gás GLP com Válvula de Bloqueio",
  "Bacia de Contenção de Derramamento Químico / Palete",
  "DEA - Desfibrilador Externo Automático",
  "Conjunto Autônomo de Respiração (Cilindro de Ar Comprimido)",
  "Tripé de Resgate com Guincho para Espaço Confinado (NR-33)",
  "Detector Portátil Multigás (O2, CO, H2S, LEL)",
  "Kit de Bloqueio e Etiquetagem LOTO (Lockout/Tagout - NR-10/NR-12)",
  "Cinto Paraquedista e Talabarte para Altura (NR-35)",
  "Escada de Emergência / Rota de Fuga Externa",
  "Sistema Fixo de Supressão por CO2 / FM-200",
  "Kit de Mitigação e Absorção de Vazamento de Óleo/Químicos",
  "Outro Equipamento de Emergência / Resgate (Descrever)",
];

export const DEFAULT_HORARIO_TRABALHO = "Segunda a Sexta-feira: 08:00 às 17:00 (1h de intervalo)";
export const DEFAULT_CARGA_HORARIA = "8";
