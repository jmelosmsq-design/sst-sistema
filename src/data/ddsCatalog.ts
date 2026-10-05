import { DdsTemaItem } from "../types";
import { TEMAS_NR01_06 } from "./dds/nr01_06";
import { TEMAS_NR07_11 } from "./dds/nr07_11";
import { TEMAS_NR12_17 } from "./dds/nr12_17";
import { TEMAS_NR18_26 } from "./dds/nr18_26";
import { TEMAS_NR33_38 } from "./dds/nr33_38";
import { TEMAS_OPERACIONAL_SAUDE } from "./dds/operacional_saude";
import { TEMAS_NR_AVANCADAS } from "./dds/nr_avancadas";
import { TEMAS_CULTURA_COMPORTAMENTO } from "./dds/cultura_comportamento";
import { TEMAS_ATIVIDADES_CRITICAS } from "./dds/atividades_criticas";
import { TEMAS_NR_ESPECIAIS } from "./dds/nr_especiais";
import { TEMAS_ACERVO_GERAL_100 } from "./dds/acervo_geral_100";
import { TEMAS_COMPORTAMENTAL_EXTRA } from "./dds/seguranca_comportamental_extra";

// Helper de agregação e garantia de unicidade por ID
const todosTemasAgregados: DdsTemaItem[] = [
  ...TEMAS_NR01_06,
  ...TEMAS_NR07_11,
  ...TEMAS_NR12_17,
  ...TEMAS_NR18_26,
  ...TEMAS_NR33_38,
  ...TEMAS_OPERACIONAL_SAUDE,
  ...TEMAS_NR_AVANCADAS,
  ...TEMAS_CULTURA_COMPORTAMENTO,
  ...TEMAS_ATIVIDADES_CRITICAS,
  ...TEMAS_NR_ESPECIAIS,
  ...TEMAS_ACERVO_GERAL_100,
  ...TEMAS_COMPORTAMENTAL_EXTRA,
];

// Deduplicação garantida por ID para manter integridade absoluta
const mapTemas = new Map<string, DdsTemaItem>();
for (const tema of todosTemasAgregados) {
  if (!mapTemas.has(tema.id)) {
    mapTemas.set(tema.id, tema);
  }
}

export const CATALOGO_DDS_TEMAS: DdsTemaItem[] = Array.from(mapTemas.values());

// Helper para obter categorias únicas de temas cadastrados
export const CATEGORIAS_DDS_DISPONIVEIS: string[] = Array.from(
  new Set(CATALOGO_DDS_TEMAS.map((t) => t.categoria))
).sort();
