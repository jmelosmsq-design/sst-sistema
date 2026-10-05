export interface Srq20PerguntaItem {
  id: number;
  texto: string;
  dominio: "Sintomas Somáticos" | "Humor Depressivo/Ansioso" | "Decréscimo de Energia" | "Ideação / Desempenho no Trabalho";
  detalheSST?: string;
}

export const SRQ20_PERGUNTAS: Srq20PerguntaItem[] = [
  {
    id: 1,
    texto: "Você tem dores de cabeça frequentes?",
    dominio: "Sintomas Somáticos",
    detalheSST: "Cefaleia tensional relacionada a ritmo, ruído ou estresse ocupacional.",
  },
  {
    id: 2,
    texto: "Tem falta de apetite?",
    dominio: "Decréscimo de Energia",
    detalheSST: "Alteração nos padrões alimentares e queixas gastrointestinais.",
  },
  {
    id: 3,
    texto: "Dorme mal (dificuldade para adormecer, sono agitado ou acordar cansado)?",
    dominio: "Decréscimo de Energia",
    detalheSST: "Privação de sono, trabalho em turnos ou hipervigilância pelo trabalho.",
  },
  {
    id: 4,
    texto: "Assusta-se com facilidade?",
    dominio: "Humor Depressivo/Ansioso",
    detalheSST: "Sobressalto, hiper-reatividade e sobrecarga sensorial no ambiente.",
  },
  {
    id: 5,
    texto: "Tem tremores nas mãos?",
    dominio: "Sintomas Somáticos",
    detalheSST: "Tensão neuromuscular exacerbada por estresse ou ansiedade.",
  },
  {
    id: 6,
    texto: "Sente-se nervoso(a), tenso(a) ou preocupado(a)?",
    dominio: "Humor Depressivo/Ansioso",
    detalheSST: "Pressão temporal, cobrança excessiva de metas ou insegurança no cargo.",
  },
  {
    id: 7,
    texto: "Tem má digestão?",
    dominio: "Sintomas Somáticos",
    detalheSST: "Somatização visceral por estado prolongado de alerta.",
  },
  {
    id: 8,
    texto: "Tem dificuldade de pensar com clareza ou se concentrar?",
    dominio: "Ideação / Desempenho no Trabalho",
    detalheSST: "Fadiga mental e perda de foco com potencial de causar acidentes operacionais.",
  },
  {
    id: 9,
    texto: "Tem se sentido triste ultimamente?",
    dominio: "Humor Depressivo/Ansioso",
    detalheSST: "Humor deprimido e desmotivação laboral.",
  },
  {
    id: 10,
    texto: "Tem chorado mais do que de costume?",
    dominio: "Humor Depressivo/Ansioso",
    detalheSST: "Labilidade emocional e esgotamento psíquico (Burnout).",
  },
  {
    id: 11,
    texto: "Encontra dificuldades para realizar com satisfação suas atividades diárias?",
    dominio: "Ideação / Desempenho no Trabalho",
    detalheSST: "Anedonia e queda na satisfação com tarefas ocupacionais.",
  },
  {
    id: 12,
    texto: "Tem dificuldades para tomar decisões no dia a dia?",
    dominio: "Ideação / Desempenho no Trabalho",
    detalheSST: "Insegurança cognitiva e bloqueio decisório sob estresse.",
  },
  {
    id: 13,
    texto: "Tem dificuldades no serviço (seu trabalho é penoso, lhe causa sofrimento)?",
    dominio: "Ideação / Desempenho no Trabalho",
    detalheSST: "Conflito direto com as exigências ou clima organizacional da função.",
  },
  {
    id: 14,
    texto: "Sente-se incapaz de desempenhar um papel útil em sua vida?",
    dominio: "Ideação / Desempenho no Trabalho",
    detalheSST: "Sentimento de desvalorização e perda de propósito.",
  },
  {
    id: 15,
    texto: "Tem perdido o interesse pelas coisas que antes gostava?",
    dominio: "Humor Depressivo/Ansioso",
    detalheSST: "Perda de engajamento pessoal e profissional.",
  },
  {
    id: 16,
    texto: "Você se sente uma pessoa inútil, sem préstimo?",
    dominio: "Ideação / Desempenho no Trabalho",
    detalheSST: "Baixa autoestima agravada por assédio moral ou falta de reconhecimento.",
  },
  {
    id: 17,
    texto: "Tem tido ideia de acabar com a vida?",
    dominio: "Humor Depressivo/Ansioso",
    detalheSST: "Alerta crítico imediato para intervenção de saúde mental e acolhimento.",
  },
  {
    id: 18,
    texto: "Sente-se cansado(a) o tempo todo?",
    dominio: "Decréscimo de Energia",
    detalheSST: "Fadiga crônica laboral e esgotamento físico-cognitivo.",
  },
  {
    id: 19,
    texto: "Você tem sensações desagradáveis no estômago?",
    dominio: "Sintomas Somáticos",
    detalheSST: "Epigastralgia e somatização de tensão nervosa.",
  },
  {
    id: 20,
    texto: "Você se cansa com facilidade em tarefas rotineiras?",
    dominio: "Decréscimo de Energia",
    detalheSST: "Baixa tolerância ao esforço físico e cognitivo.",
  },
];

export const SRQ20_PONTO_DE_CORTE = 7; // Ponto de corte clássico da OMS e validado no Brasil (>= 7 indica atenção)

export interface Srq20EstatisticasSetor {
  setorNome: string;
  totalAvaliados: number;
  totalAtencao: number;
  totalFavoravel: number;
  taxaAtencaoPct: number;
  taxaFavoravelPct: number;
  nivelRiscoPgr: "Baixo" | "Médio" | "Elevado" | "Crítico";
  sintomasMaisFrequentes: { perguntaId: number; texto: string; count: number; pct: number }[];
}

export function calcularClassificacaoSrq20(score: number): "Favorável" | "Atenção Necessária" {
  return score >= SRQ20_PONTO_DE_CORTE ? "Atenção Necessária" : "Favorável";
}

export function classificarRiscoSetorialPgr(taxaAtencaoPct: number): "Baixo" | "Médio" | "Elevado" | "Crítico" {
  if (taxaAtencaoPct >= 50) return "Crítico";
  if (taxaAtencaoPct >= 30) return "Elevado";
  if (taxaAtencaoPct >= 15) return "Médio";
  return "Baixo";
}
