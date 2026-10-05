/**
 * Utilitário de parsing e extração de dados de trabalhadores a partir de texto ditado por voz.
 * Processa comandos falados em português como:
 * - "Carlos Eduardo Silva, função Eletricista, setor Manutenção, matrícula 1042"
 * - "Maria Santos, auxiliar de produção, setor embalagem"
 * - "João Pedro de Oliveira, operador de empilhadeira, cpf 12345678900"
 * - Listas com múltiplos colaboradores separados por ponto ou 'próximo': "Marcos Lima, mecânico. Ana Paula, soldadora"
 */

export interface ParsedWorker {
  id: string;
  nome: string;
  funcao: string;
  setor: string;
  cpfOuMatricula: string;
  presente: boolean;
}

export function removeConsecutiveDuplicateWords(text: string): string {
  if (!text) return "";
  // Remove filler sounds and normalize whitespace
  const cleaned = text
    .replace(/\b(?:hum|humm|ãh|éhh|eh|ahm|né|tipo|assim)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned.split(/\s+/);
  const deduped: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const current = words[i];
    const prev = deduped[deduped.length - 1];
    if (!prev || current.toLowerCase() !== prev.toLowerCase()) {
      deduped.push(current);
    }
  }
  return deduped.join(" ");
}

/**
 * Normaliza o nome para comparação sem acentos e minúsculo
 */
export function normalizeNameForComparison(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Desduplica a lista de trabalhadores e mescla detalhes adicionais
 */
export function deduplicateWorkersList(workers: ParsedWorker[]): ParsedWorker[] {
  const result: ParsedWorker[] = [];

  for (const worker of workers) {
    if (!worker.nome || worker.nome.trim().length < 2) continue;

    const normCurrent = normalizeNameForComparison(worker.nome);
    
    // Verifica se já existe alguém com o mesmo nome ou se o nome atual é um complemento do anterior
    const existingIdx = result.findIndex((existing) => {
      const normExisting = normalizeNameForComparison(existing.nome);
      return (
        normExisting === normCurrent ||
        (normCurrent.startsWith(normExisting) && normExisting.length >= 3) ||
        (normExisting.startsWith(normCurrent) && normCurrent.length >= 3)
      );
    });

    if (existingIdx >= 0) {
      const existing = result[existingIdx];
      // Mantém o nome mais completo
      const longerName = worker.nome.length >= existing.nome.length ? worker.nome : existing.nome;
      result[existingIdx] = {
        ...existing,
        nome: longerName,
        funcao: worker.funcao && worker.funcao !== "Operacional" ? worker.funcao : existing.funcao,
        setor: worker.setor && worker.setor !== "Geral" ? worker.setor : existing.setor,
        cpfOuMatricula: worker.cpfOuMatricula || existing.cpfOuMatricula,
      };
    } else {
      result.push(worker);
    }
  }

  return result;
}

export function parseVoiceWorkerText(
  transcript: string,
  defaultSetor = "",
  defaultFuncao = ""
): ParsedWorker[] {
  const cleanedInput = removeConsecutiveDuplicateWords(transcript);
  if (!cleanedInput || !cleanedInput.trim()) return [];

  // Dividir caso o facilitador tenha falado vários trabalhadores
  // Ex: "Marcos Silva, soldador. Próximo: Carlos Souza, eletricista. E também Juliana Dias..."
  const rawSegments = cleanedInput
    .split(/\b(?:próximo|proximo|ponto|e também|e tambem|seguinte|outro trabalhador|outra pessoa)\b|[;\n\.\!]+/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  const rawList: ParsedWorker[] = [];

  for (const segment of rawSegments) {
    const parsed = parseSingleWorkerSentence(segment, defaultSetor, defaultFuncao);
    if (parsed && parsed.nome) {
      rawList.push(parsed);
    }
  }

  // Se nenhum segmento específico foi dividido, tenta o texto inteiro
  if (rawList.length === 0) {
    const single = parseSingleWorkerSentence(cleanedInput, defaultSetor, defaultFuncao);
    if (single && single.nome) {
      rawList.push(single);
    }
  }

  return deduplicateWorkersList(rawList);
}

function parseSingleWorkerSentence(
  text: string,
  defaultSetor = "",
  defaultFuncao = ""
): ParsedWorker | null {
  let clean = text.trim();
  if (!clean) return null;

  let nome = "";
  let funcao = defaultFuncao || "";
  let setor = defaultSetor || "";
  let cpfOuMatricula = "";

  // 1. Extração de CPF ou Matrícula
  // Padrões como: "cpf 12345678900", "matrícula 1042", "matrícula número 502", "registro 889"
  const docMatch = clean.match(
    /\b(?:cpf|matrícula|matricula|registro|crachá|cracha|chapa|número|numero)\s*(?:é|de|nº|numero|número)?\s*([0-9A-Za-z\.\-\/]+)/i
  );
  if (docMatch) {
    cpfOuMatricula = docMatch[1].replace(/[^\w\d\.\-]/g, "").trim();
    clean = clean.replace(docMatch[0], "").trim();
  }

  // 2. Extração de Setor
  // Padrões como: "setor manutenção", "setor de logística", "na área de pintura", "departamento financeiro"
  const setorMatch = clean.match(
    /\b(?:setor|departamento|área|area|local|unidade)\s*(?:de|da|do)?\s*([^,;.\n]+?)(?=\s*\b(?:função|funcao|cargo|cpf|matrícula|matricula|$))/i
  );
  if (setorMatch) {
    setor = titleCase(setorMatch[1].trim());
    clean = clean.replace(setorMatch[0], "").trim();
  }

  // 3. Extração de Função / Cargo
  // Padrões como: "função eletricista", "cargo soldador", "trabalha como mecânico", "ocupação pintor"
  const funcaoMatch = clean.match(
    /\b(?:função|funcao|cargo|ocupação|ocupacao|trabalha como|como|profissão|profissao)\s*(?:de|da|do)?\s*([^,;.\n]+?)(?=\s*\b(?:setor|área|cpf|matrícula|$))/i
  );
  if (funcaoMatch) {
    funcao = titleCase(funcaoMatch[1].trim());
    clean = clean.replace(funcaoMatch[0], "").trim();
  }

  // 4. Limpeza restante para isolar o Nome Completo
  // Se o texto continha vírgulas, ex: "Carlos Silva, Eletricista, Manutenção"
  const parts = clean
    .split(/[,–—\-]/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length > 0) {
    nome = titleCase(parts[0]);

    // Se ainda não temos função e há uma segunda parte
    if (!funcao && parts.length > 1) {
      funcao = titleCase(parts[1]);
    }
    // Se ainda não temos setor e há uma terceira parte
    if (!setor && parts.length > 2) {
      setor = titleCase(parts[2]);
    }
  } else {
    nome = titleCase(clean);
  }

  // Limpar preposições e palavras parasitas no início do nome
  nome = nome.replace(/^(?:o|a|colaborador|trabalhador|funcionário|funcionario|nome)\s+/i, "").trim();

  if (!nome || nome.length < 2) return null;

  return {
    id: "part_voice_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    nome,
    funcao: funcao || "Operacional",
    setor: setor || defaultSetor || "Geral",
    cpfOuMatricula: cpfOuMatricula || "",
    presente: true,
  };
}

export function titleCase(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (["de", "da", "do", "das", "dos", "e", "em"].includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
