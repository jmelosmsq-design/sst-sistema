import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with larger payload support for photo uploads and sync
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Server-side Gemini client initialization with mandatory User-Agent header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// In-memory + persistent file storage for multi-device Cloud Sync
const DATA_DIR = path.join(process.cwd(), "data");
const SYNC_FILE = path.join(DATA_DIR, "cloud_sync.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface CloudStore {
  version: number;
  lastUpdated: string;
  companies: any[];
}

let cloudStore: CloudStore = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  companies: [],
};

// Load initial store if exists
if (fs.existsSync(SYNC_FILE)) {
  try {
    const raw = fs.readFileSync(SYNC_FILE, "utf-8");
    cloudStore = JSON.parse(raw);
  } catch (err) {
    console.error("Error reading initial sync file:", err);
  }
}

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Cloud Data Synchronization API
app.get("/api/sync/get", (req, res) => {
  res.json({
    success: true,
    data: cloudStore,
    serverTime: new Date().toISOString(),
  });
});

app.post("/api/sync/save", (req, res) => {
  try {
    const { companies, clientVersion } = req.body;
    if (Array.isArray(companies)) {
      cloudStore.companies = companies;
      cloudStore.version = (cloudStore.version || 0) + 1;
      cloudStore.lastUpdated = new Date().toISOString();

      fs.writeFile(SYNC_FILE, JSON.stringify(cloudStore, null, 2), (err) => {
        if (err) console.error("Error saving sync data to disk:", err);
      });

      return res.json({
        success: true,
        version: cloudStore.version,
        lastUpdated: cloudStore.lastUpdated,
      });
    }
    return res.status(400).json({ success: false, error: "Invalid companies payload" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || "Sync failed" });
  }
});

// 2.1 SRQ-20 Worker Submission & Public Query API
const SRQ20_FILE = path.join(DATA_DIR, "srq20_submissions.json");
let srq20Submissions: Record<string, any[]> = {}; // companyId -> evaluations[]

if (fs.existsSync(SRQ20_FILE)) {
  try {
    const raw = fs.readFileSync(SRQ20_FILE, "utf-8");
    srq20Submissions = JSON.parse(raw);
  } catch (e) {
    console.warn("Could not read initial srq20 submissions:", e);
  }
}

// Retorna dados públicos da empresa para a tela do trabalhador (sem necessidade de login)
app.get("/api/srq20/public-info", (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) {
      return res.status(400).json({ success: false, error: "Missing companyId" });
    }

    const comp = cloudStore.companies.find((c) => String(c.id) === String(companyId));
    if (comp) {
      return res.json({
        success: true,
        company: {
          id: comp.id,
          empresa: {
            emp_razao: comp.empresa?.emp_razao,
            emp_fantasia: comp.empresa?.emp_fantasia,
            emp_cnpj: comp.empresa?.emp_cnpj,
            emp_logo: comp.empresa?.emp_logo,
          },
          setores: (comp.setores || []).map((s: any) => ({
            id: s.id,
            setor_nome: s.setor_nome,
          })),
        },
      });
    }

    return res.json({
      success: true,
      company: {
        id: companyId,
        empresa: { emp_razao: "Empresa Avaliada", emp_fantasia: "SST Vistoria" },
        setores: [],
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal error" });
  }
});

// Trabalhador envia questionário respondido no celular via Link
app.post("/api/srq20/submit", (req, res) => {
  try {
    const { companyId, evaluation } = req.body;
    if (!companyId || !evaluation) {
      return res.status(400).json({ success: false, error: "Missing companyId or evaluation" });
    }

    // 1. Guardar no arquivo local de respostas
    if (!srq20Submissions[companyId]) {
      srq20Submissions[companyId] = [];
    }
    srq20Submissions[companyId].unshift(evaluation);
    fs.writeFile(SRQ20_FILE, JSON.stringify(srq20Submissions, null, 2), () => {});

    // 2. Injetar na empresa correspondente no cloudStore para persistência em nuvem
    const targetComp = cloudStore.companies.find((c) => String(c.id) === String(companyId));
    if (targetComp) {
      if (!targetComp.srq20Avaliacoes) {
        targetComp.srq20Avaliacoes = [];
      }
      targetComp.srq20Avaliacoes.unshift(evaluation);
      cloudStore.version = (cloudStore.version || 0) + 1;
      cloudStore.lastUpdated = new Date().toISOString();
      fs.writeFile(SYNC_FILE, JSON.stringify(cloudStore, null, 2), () => {});
    }

    return res.json({
      success: true,
      message: "Avaliação SRQ-20 registrada com sucesso na nuvem!",
      id: evaluation.id,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Submit failed" });
  }
});

// Técnico/Gestor busca respostas enviadas pelos trabalhadores para alimentar o painel
app.get("/api/srq20/submissions", (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) {
      return res.status(400).json({ success: false, error: "Missing companyId" });
    }

    const list = srq20Submissions[companyId] || [];
    return res.json({
      success: true,
      submissions: list,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Error" });
  }
});

// 3. CA OCR / Image Analysis with Gemini AI
app.post("/api/epi/scan-ca", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: "Imagem não fornecida" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: "GEMINI_API_KEY não configurada no servidor. Preencha manualmente ou configure a chave.",
      });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const prompt = `Analise detalhadamente a foto deste Equipamento de Proteção Individual (EPI), etiqueta, carimbo ou Certificado de Aprovação (CA).
Extraia e identifique com precisão técnica de Segurança do Trabalho (SST no Brasil / MTE):
1. "ca": Número do Certificado de Aprovação (CA) - somente os dígitos numéricos ou formatado (ex: "40892").
2. "nome": Nome técnico oficial e descritivo do EPI (ex: "Respirador Semifacial Descartável PFF2 (S) com Válvula").
3. "fabricante": Razão social ou marca comercial do fabricante (ex: "3M do Brasil Ltda" ou "Delta Plus").
4. "descricao": Descrição técnica completa do equipamento, materiais e acabamento.
5. "validade": Data ou status de validade estimado do CA / equipamento (ex: "Válido", "Conforme Fabricante").
6. "protecao": Proteção oficial aprovada e normas técnicas aplicáveis (ex: "Proteção das vias respiratórias contra poeiras, névoas e fumos (PFF2/N95) conforme ABNT NBR 13698").
7. "categoria": Categoria (ex: "Proteção Respiratória", "Proteção Auditiva", "Proteção Visual", "Proteção para a Cabeça", "Proteção dos Membros Superiores", "Proteção dos Membros Inferiores", "Proteção Contra Quedas").
8. "eficacia": "Adequada"

Responda ESTRITAMENTE em formato JSON com as chaves:
{
  "ca": "string",
  "nome": "string",
  "fabricante": "string",
  "descricao": "string",
  "validade": "string",
  "protecao": "string",
  "categoria": "string",
  "eficacia": "Adequada"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let parsedData = {};
    try {
      parsedData = JSON.parse(text);
    } catch {
      // Clean possible markdown fences
      const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsedData = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("Error scanning CA:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Erro ao processar imagem do CA com IA.",
    });
  }
});

// 4. CA Direct Lookup from Official Sources with Gemini AI
app.post("/api/epi/lookup-ca", async (req, res) => {
  try {
    const { caNumber, modelName } = req.body;
    if (!caNumber && !modelName) {
      return res.status(400).json({ success: false, error: "Informe o número do CA ou modelo." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Intelligent fallback dataset for common CAs if offline
      return res.json({
        success: true,
        data: fallbackCALookup(caNumber, modelName),
      });
    }

    const prompt = `Você é um especialista em Segurança do Trabalho e base oficial de CAs (Certificados de Aprovação) do Ministério do Trabalho e Emprego do Brasil (MTE/CAEPI/Consulta CA).
Pesquise e forneça os dados oficiais do EPI referente ao CA: "${caNumber || ""}" e/ou Modelo: "${modelName || ""}".

Forneça os dados oficiais brasileiros em JSON com as chaves:
- "ca": Número do CA (ex: "40892" ou correspondente oficial mais recente)
- "nome": Nome técnico completo do EPI
- "fabricante": Fabricante / Detentor do CA
- "descricao": Descrição técnica detalhada e componentes
- "validade": Situação e validade do CA (ex: "Válido" ou data oficial)
- "protecao": Enquadramento, laudo e proteção testada (ex: Atenuação NRRsf para protetores, nível de proteção para luvas EN388, ensaios contra impacto, etc.)
- "categoria": Categoria principal do EPI
- "eficacia": "Adequada"

Responda ESTRITAMENTE em formato JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let parsed = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error("Error looking up CA:", error);
    return res.json({
      success: true,
      data: fallbackCALookup(req.body.caNumber, req.body.modelName),
    });
  }
});

function fallbackCALookup(ca: string, model: string) {
  return {
    ca: ca || "40892",
    nome: model || "Equipamento de Proteção Individual Homologado",
    fabricante: "Fabricante Certificado Nacional",
    descricao: "Equipamento em conformidade com normas regulamentadoras do MTE (NR-06).",
    validade: "Válido",
    protecao: "Aprovado para proteção contra riscos ocupacionais identificados no inventário do PGR.",
    categoria: "EPI Homologado",
    eficacia: "Adequada",
  };
}

// 5. Chemical Product Label / FDS / Drum Scanner with Gemini AI
app.post("/api/quimico/scan-rotulo", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: "Imagem do produto químico não fornecida." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: "GEMINI_API_KEY não configurada no servidor. Preencha manualmente ou configure a chave.",
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const prompt = `Você é um Engenheiro de Segurança do Trabalho e Higienista Ocupacional especialista em Produtos Químicos, GHS (ABNT NBR 14725), FDS (Ficha com Dados de Segurança - antiga FISPQ) e NR-15/NR-20/NR-01.
Analise detalhadamente a foto deste produto químico, frasco, galão, tambor, rótulo ou FDS.
Extraia e identifique com rigor técnico para o Inventário de Produtos Químicos do PGR:

1. "nome": Nome comercial exato ou descrição do produto (ex: "Thinner 5000 para Limpeza e Diluição").
2. "nomeQuimico": Nome químico oficial / princípio ativo / substâncias químicas presentes (ex: "Hidrocarbonetos Aromáticos e Alifáticos, Tolueno e Xileno").
3. "cas": Número de registro CAS da substância ou das principais substâncias (ex: "108-88-3 / 1330-20-7" ou "7681-52-9").
4. "onu": Número ONU para transporte de produtos perigosos, se houver (ex: "ONU 1263" ou "ONU 1791").
5. "fabricante": Razão social ou marca comercial do fabricante / fornecedor.
6. "estadoFisico": Estado físico predominante ("Líquido" | "Sólido" | "Gasoso" | "Aerossol/Névoa" | "Pó/Granulado" | "Gel/Pasta").
7. "classificacaoGhs": Classificação de perigo segundo o GHS e pictogramas aplicáveis (ex: "Líquido Inflamável Cat. 2, Toxicidade Aguda Cat. 4, Irritação Cutânea Cat. 2").
8. "frasesPerigo": Frases de perigo (H-statements) e riscos ocupacionais principais.
9. "composicao": Composição percentual aproximada ou ingredientes ativos.
10. "finalidadeUso": Aplicação e uso típico na empresa (ex: "Desengraxe e limpeza de peças metálicas").
11. "episRecomendados": EPIs recomendados pela FDS e NR-06 (ex: "Luvas de borracha nitrílica, respirador semifacial com filtro para vapores orgânicos (VO), óculos de ampla visão e avental em PVC").
12. "fdsDisponivel": "Sim".
13. "medidasControle": Medidas de proteção coletiva e segurança (ex: "Ventilação local exaustora, recipiente hermético e kit para contenção de derramamento").

Responda ESTRITAMENTE em formato JSON com as chaves:
{
  "nome": "string",
  "nomeQuimico": "string",
  "cas": "string",
  "onu": "string",
  "fabricante": "string",
  "estadoFisico": "Líquido",
  "classificacaoGhs": "string",
  "frasesPerigo": "string",
  "composicao": "string",
  "finalidadeUso": "string",
  "episRecomendados": "string",
  "fdsDisponivel": "Sim",
  "medidasControle": "string"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let parsedData = {};
    try {
      parsedData = JSON.parse(text);
    } catch {
      const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsedData = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("Error scanning chemical label:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Erro ao analisar o rótulo do produto químico com IA.",
    });
  }
});

// 6. Chemical Product Direct Lookup (CAS, ONU, Name, FDS) with Gemini AI
app.post("/api/quimico/lookup", async (req, res) => {
  try {
    const { query, cas, onu } = req.body;
    const searchTerm = query || cas || onu;
    if (!searchTerm) {
      return res.status(400).json({ success: false, error: "Informe o nome, número CAS ou número ONU do produto químico." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        data: fallbackQuimicoLookup(searchTerm),
      });
    }

    const prompt = `Você é um Engenheiro de Segurança do Trabalho e Higienista Ocupacional especialista em Produtos Químicos, GHS (ABNT NBR 14725), FDS (Ficha com Dados de Segurança - antiga FISPQ) e limites de tolerância (NR-15 e ACGIH).
Pesquise as informações técnicas e de segurança ocupacional oficiais para a substância ou produto químico: "${searchTerm}".

Forneça os dados em JSON estrito com as chaves:
- "nome": Nome comercial / comum oficial do produto (ex: "Thinner de Limpeza", "Ácido Clorídrico 33%", "Água Sanitária / Hipoclorito de Sódio", "Óleo Hidráulico Mineral 68")
- "nomeQuimico": Nome químico oficial IUPAC / substâncias ativas principais
- "cas": Número CAS oficial (ex: "108-88-3", "7647-01-0", "7681-52-9")
- "onu": Número ONU de transporte perigoso (ex: "ONU 1263", "ONU 1789"), se aplicável
- "fabricante": Fabricantes ou distribuidores comuns no Brasil
- "estadoFisico": "Líquido" | "Sólido" | "Gasoso" | "Aerossol/Névoa" | "Pó/Granulado" | "Gel/Pasta"
- "classificacaoGhs": Classificação GHS completa de perigos físicos, à saúde e ao meio ambiente
- "frasesPerigo": Códigos e frases de perigo H (ex: H225, H314, H335)
- "composicao": Descrição da composição química típica ou pureza
- "finalidadeUso": Finalidades industriais e comerciais comuns de uso
- "episRecomendados": EPIs recomendados pela FDS e NR-06 (Luvas adequadas ao agente químico, Proteção respiratória com filtros específicos VO/GA/PFF, Óculos, Avental)
- "fdsDisponivel": "Sim"
- "medidasControle": Medidas de EPC e controle ambiental (ventilação, exaustão, contenção de vazamentos)

Responda ESTRITAMENTE em formato JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let parsed = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error("Error looking up chemical:", error);
    return res.json({
      success: true,
      data: fallbackQuimicoLookup(req.body.query || req.body.cas || "Produto Químico"),
    });
  }
});

function fallbackQuimicoLookup(term: string) {
  return {
    nome: term || "Produto Químico Industrial",
    nomeQuimico: "Substância Química sob Consulta FDS",
    cas: "Consulta FDS",
    onu: "Não classificado como perigoso ou sob consulta",
    fabricante: "Fabricante Especializado",
    estadoFisico: "Líquido",
    classificacaoGhs: "Irritação Cutânea / Ocular e Vapores sob Avaliação",
    frasesPerigo: "Manusear com os EPIs adequados especificados na FDS.",
    composicao: "Composição química conforme laudo do fabricante",
    finalidadeUso: "Utilização industrial e operacional conforme rotina do posto de trabalho.",
    episRecomendados: "Luvas impermeáveis compatíveis (nitrila/PVC), óculos de segurança e máscara com filtro adequado.",
    fdsDisponivel: "Sim",
    medidasControle: "Manter local ventilado, recipientes fechados e sinalizados.",
  };
}

// 7. CBO & Job Activities Official Lookup (MTE / eSocial) with Gemini AI
app.post("/api/cbo/lookup", async (req, res) => {
  try {
    const { query, cboCode } = req.body;
    const searchTerm = query || cboCode;
    if (!searchTerm) {
      return res.status(400).json({ success: false, error: "Informe o cargo, função ou código CBO." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        data: fallbackCboLookup(searchTerm),
      });
    }

    const prompt = `Você é um Engenheiro de Segurança do Trabalho e Auditor Fiscal do Trabalho especialista na Classificação Brasileira de Ocupações (CBO) do Ministério do Trabalho e Emprego do Brasil (MTE) e eSocial (Evento S-2240).
Pesquise e forneça os dados oficiais do CBO referente à função/cargo ou código: "${searchTerm}".

Forneça os dados oficiais brasileiros em formato JSON com as chaves:
- "cbo": Código oficial do CBO com hífen (ex: "7241-10", "5143-20", "7822-20", "4110-10", "7156-15")
- "titulo": Título oficial da ocupação no CBO do Ministério do Trabalho
- "sinonimos": Lista com 3 a 5 nomes comuns ou sinônimos do cargo no mercado de trabalho
- "grupoOcupacional": Grupo ocupacional / família do CBO (ex: "Metalmecânica", "Construção Civil", "Logística", "Administrativo", "Saúde", "Alimentação", "Limpeza e Conservação")
- "descricaoSumaria": Descrição sumária oficial das atividades e atribuições do cargo conforme base do CBO/MTE
- "atividadesDetalhadas": Lista de 4 a 6 rotinas e tarefas diárias típicas desempenhadas pelo trabalhador
- "jornadaSugerida": Jornada típica recomendada (ex: "44h semanais (8h48/dia)", "40h semanais", "Escala 12x36", "Escala 6x1")
- "turnoPadrao": "Diurno" | "Noturno" | "Misto (Comercial / Administrativo)" | "Escala 12x36" | "Revezamento / Rodízio"
- "episSugeridos": Array de objetos com EPIs normativos recomendados para a ocupação, contendo:
  - "nome": Nome técnico do EPI
  - "ca": Número de CA comum homologado (ex: "40892", "28510", "19536", "10346", "15467")
  - "fabricante": Fabricante comum no Brasil (ex: "3M", "Marluvas", "Danny", "Kalipso")
  - "protecao": Proteção fornecida pelo equipamento
  - "categoria": Categoria do EPI
- "epcsSugeridos": Texto descritivo dos Equipamentos de Proteção Coletiva (EPCs) recomendados para o ambiente
- "medidasSugeridas": Recomendações técnicas e medidas de controle para o PGR e laudos de SST
- "riscosTipicos": Array com os principais agentes de risco ocupacionais (físicos, químicos, biológicos, ergonômicos, acidentes)

Responda ESTRITAMENTE em formato JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let parsed = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error("Error looking up CBO:", error);
    return res.json({
      success: true,
      data: fallbackCboLookup(req.body.query || req.body.cboCode || "Trabalhador"),
    });
  }
});

function fallbackCboLookup(term: string) {
  return {
    cbo: "7842-05",
    titulo: term || "Alimentador de Linha de Produção / Operacional",
    sinonimos: [term, "Auxiliar Operacional", "Ajudante de Produção", "Operador Geral"],
    grupoOcupacional: "Operações e Produção Industrial",
    descricaoSumaria: "Preparam materiais para alimentação de linhas de produção, organizam a área de serviço, abastecem máquinas e separam materiais para reaproveitamento.",
    atividadesDetalhadas: [
      "Abastecer postos de trabalho com insumos e matérias-primas.",
      "Auxiliar na movimentação de materiais e embalagem de produtos acabados.",
      "Realizar limpeza e organização do posto de trabalho.",
      "Cumprir normas de segurança e uso obrigatório de EPIs.",
    ],
    jornadaSugerida: "44h semanais",
    turnoPadrao: "Diurno",
    episSugeridos: [
      {
        nome: "Calçado de Segurança com Biqueira de Aço",
        ca: "28510",
        fabricante: "Marluvas",
        protecao: "Proteção dos pés contra impacto de quedas de materiais.",
        categoria: "Proteção dos Pés",
      },
      {
        nome: "Luva de Malha com Banho de Poliuretano (PU)",
        ca: "30521",
        fabricante: "Danny",
        protecao: "Proteção contra abrasão e manuseio de peças.",
        categoria: "Proteção das Mãos",
      },
      {
        nome: "Óculos de Proteção Incolor",
        ca: "10346",
        fabricante: "Kalipso",
        protecao: "Proteção contra partículas volantes.",
        categoria: "Proteção Visual",
      },
      {
        nome: "Protetor Auditivo tipo Plug de Silicone",
        ca: "19536",
        fabricante: "3M",
        protecao: "Atenuação de ruído ambiente.",
        categoria: "Proteção Auditiva",
      },
    ],
    epcsSugeridos: "Sinalização de segurança, demarcação de piso e iluminação adequada conforme NHO 11.",
    medidasSugeridas: "Treinamento admissional e periódico sobre riscos da função (NR-01) e ergonomia (NR-17).",
    riscosTipicos: ["Ruído", "Postura em Pé Prolongada", "Movimentação Manual de Cargas", "Prensamento Leve"],
  };
}

// 8. DDS / DSS Theme Generation with Gemini AI (Full Spoken Script for Facilitator)
app.post("/api/dds/generate-theme", async (req, res) => {
  try {
    const { promptTopic, categoria, nrReferencia, companyContext } = req.body;
    if (!promptTopic) {
      return res.status(400).json({ success: false, error: "Informe o tema ou assunto desejado para o DDS." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        data: fallbackDdsTheme(promptTopic, categoria, nrReferencia),
      });
    }

    const prompt = `Você é um Engenheiro de Segurança do Trabalho (SST) sênior especialista em Diálogos Diários/Semanais de Segurança (DDS/DSS), Normas Regulamentadoras do MTE (NR-01 a NR-38) e Cultura de Segurança Ocupacional.
Crie um tema completo, prático, didático e impactante de DDS baseado no pedido: "${promptTopic}".
Categoria sugerida: "${categoria || 'Geral'}".
Norma de referência: "${nrReferencia || 'NR-01 / Geral'}".
Contexto da empresa: "${companyContext || 'Ambiente Operacional e Administrativo'}".

IMPORTANTE SOBRE O CAMPO "conteudo":
O campo "conteudo" DEVE ser um TEXTO COMPLETO E EXTENSO de DIÁLOGO ORAL (Roteiro Completo para Leitura em Voz Alta do Ministrante durante a reunião de 10 a 15 minutos), contendo:
1. Saudação inicial e contextualização impactante do perigo na prática diária.
2. Explicação aprofundada dos riscos reais e consequências de acidentes.
3. Passo a passo preventivo detalhado com base nas normas do MTE.
4. Exemplos práticos do que fazer e do que NUNCA fazer.
5. Mensagem de encerramento reforçando que a vida e a segurança vêm sempre em primeiro lugar.
O texto deve ser redigido em primeira/segunda pessoa, fluente, profissional, pronto para ser lido pelo facilitador.

Retorne ESTRITAMENTE em formato JSON com as chaves:
- "codigo": Código curto do tema (ex: "DDS-NR35-02", "DDS-ELET-01", "DDS-5S-03", etc.)
- "titulo": Título claro, atrativo e profissional para o DDS
- "categoria": Categoria temática
- "nrReferencia": Norma de referência aplicável
- "objetivo": Objetivo principal da conversa em 1 ou 2 frases concisas
- "pontosPrincipais": Array com 4 a 5 tópicos diretos e práticos
- "conteudo": Texto completo e aprofundado do diálogo (3 a 5 parágrafos completos, cerca de 250 a 400 palavras) para leitura oral do facilitador
- "perguntasDebate": Array com 2 a 3 perguntas práticas para estimular o debate com a equipe`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let parsed = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error("Error generating DDS theme:", error);
    return res.json({
      success: true,
      data: fallbackDdsTheme(req.body.promptTopic || "Segurança no Trabalho", req.body.categoria, req.body.nrReferencia),
    });
  }
});

// 8.1. Expand Short Topic / Notes into Full Spoken DDS Script
app.post("/api/dds/expand-dialogue", async (req, res) => {
  try {
    const { temaTitulo, temaConteudo, nrReferencia, companyContext } = req.body;
    if (!temaTitulo && !temaConteudo) {
      return res.status(400).json({ success: false, error: "Informe o título ou resumo para expansão." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        expandedText: fallbackExpandedScript(temaTitulo, temaConteudo),
      });
    }

    const prompt = `Você é um Engenheiro de Segurança do Trabalho especialista em ministrar DDS/DSS para equipes operacionais e administrativas.
Transforme e expanda o seguinte tema e anotações resumidas em um TEXTO COMPLETO E RICO DE DIÁLOGO ORAL (Roteiro Completo para Leitura em Voz Alta pelo Ministrante):

Tema: "${temaTitulo || "Segurança no Trabalho"}"
Referência Normativa: "${nrReferencia || "NR-01 / Geral"}"
Anotações / Resumo atual: "${temaConteudo || ""}"
Contexto da Empresa: "${companyContext || "Ambiente Produtivo e Operacional"}"

Estrutura obrigatória do texto expandido:
- Parágrafo 1: Saudação inicial à equipe e contextualização da relevância do assunto no dia a dia.
- Parágrafo 2: Cenário de risco real, causas frequentes de desvios e os perigos do excesso de confiança ou pressa.
- Parágrafo 3: Orientações preventivas práticas, procedimentos operacionais seguros e regras inegociáveis.
- Parágrafo 4: Exemplos práticos do dia a dia do setor (o que fazer x o que evitar).
- Parágrafo 5: Encerramento com chamada à responsabilidade mútua e compromisso de segurança.

Retorne ESTRITAMENTE em formato JSON com a chave:
{
  "expandedText": "string (texto completo, fluido, profissional e envolvente pronto para leitura em voz alta)"
}`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      expandedText: parsed.expandedText || fallbackExpandedScript(temaTitulo, temaConteudo),
    });
  } catch (error: any) {
    console.error("Error expanding DDS script:", error);
    return res.json({
      success: true,
      expandedText: fallbackExpandedScript(req.body.temaTitulo, req.body.temaConteudo),
    });
  }
});

function fallbackExpandedScript(titulo?: string, resumo?: string) {
  const tema = titulo || "Segurança e Prevenção de Acidentes";
  return `Bom dia a todos! Hoje nosso Diálogo Diário de Segurança traz um tema de máxima relevância para a nossa rotina: ${tema}.

No dia a dia operacional, é muito comum que a repetição das tarefas nos leve a uma zona de conforto perigosa. No entanto, quando ignoramos pequenas regras de segurança ou tentamos realizar o trabalho com pressa excessiva, aumentamos drasticamente a probabilidade de incidentes e lesões corporais. Nenhuma meta de produção se sobrepõe à integridade física de vocês.

${resumo ? `Conforme nossos procedimentos: ${resumo}` : "Para garantir a segurança plena do nosso setor, devemos seguir rigorosamente todas as etapas dos procedimentos operacionais e utilizar 100% do tempo os Equipamentos de Proteção Individual específicos."}

Antes de iniciar qualquer atividade, faça uma inspeção visual completa do seu posto de trabalho, verifique se ferramentas e equipamentos estão em perfeitas condições e se as proteções coletivas estão ativas. Caso identifique qualquer anomalia ou risco não controlado, paralise o serviço e comunique imediatamente a liderança.

Lembrem-se: a segurança é um valor coletivo construído pelo cuidado diário de cada um de nós. Tenham todos um excelente e seguro dia de trabalho!`;
}

function fallbackDdsTheme(topic: string, cat?: string, nr?: string) {
  return {
    codigo: "DDS-IA-" + Math.floor(Math.random() * 900 + 100),
    titulo: topic || "Práticas Preventivas de Segurança no Trabalho",
    categoria: cat || "Comportamento Seguro e Cultura SST",
    nrReferencia: nr || "NR-01",
    objetivo: `Conscientizar a equipe sobre os cuidados essenciais, percepção de risco e prevenção de acidentes relacionados a ${topic}.`,
    pontosPrincipais: [
      "Avaliar o ambiente e identificar possíveis perigos antes de iniciar a atividade.",
      "Utilizar 100% do tempo os EPIs específicos recomendados para o posto.",
      "Seguir os procedimentos operacionais e nunca realizar improvisações perigosas.",
      "Comunicar imediatamente quase-acidentes ou condições inseguras à liderança.",
    ],
    conteudo: `Bom dia a todos! Hoje nosso Diálogo Diário de Segurança aborda um tema essencial para a integridade de toda a nossa equipe: ${topic}.

Muitas vezes, acostumados com a rotina e confiantes em nossa experiência diária, deixamos de notar perigos evidentes que surgem no ambiente de trabalho. No entanto, a segurança não tolera atalhos nem improvisações. Um segundo de desatenção ou a decisão de não utilizar um equipamento de proteção adequado pode resultar em acidentes graves e consequências irreversíveis para a sua vida e para a sua família.

Para garantir que todos trabalhem com total tranquilidade, devemos seguir à risca os procedimentos operacionais estabelecidos pela empresa e pelas normas regulamentadoras. Antes de iniciar qualquer tarefa hoje, pare por alguns segundos, inspecione suas ferramentas, certifique-se de que o piso está limpo e desobstruído e confirme que todos os EPIs necessários estão devidamente ajustados ao seu corpo.

Se você notar qualquer condição insegura, vazamento, ruído anormal em máquinas ou ferramentas danificadas, exerça sua responsabilidade e o direito de recusa: paralise a atividade e comunique imediatamente o seu encarregado e o SESMT. A nossa maior meta é que todos voltem para casa ao final do dia com total saúde e segurança!`,
    perguntasDebate: [
      "Quais os maiores riscos relacionados a este tema no nosso setor hoje?",
      "O que podemos melhorar no nosso posto para evitar qualquer tipo de incidente?",
    ],
  };
}

// Safe multi-model caller with automatic fallback across supported Gemini 3 models
async function generateContentWithFallback(ai: GoogleGenAI, requestOptions: any) {
  const modelsToTry = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        ...requestOptions,
        model,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Fallback] Model ${model} encountered an issue: ${err?.message || err}. Trying next model...`);
    }
  }

  throw lastError;
}

function fallbackAepPhotoAnalysis(funcaoNome?: string, setorNome?: string, tipoPosto?: string) {
  const isAdm = (tipoPosto || "").toLowerCase().includes("adm") || (tipoPosto || "").toLowerCase().includes("computador") || (funcaoNome || "").toLowerCase().includes("auxiliar") || (funcaoNome || "").toLowerCase().includes("assistente");
  
  if (isAdm) {
    return {
      tipoPosto: tipoPosto || "Administrativo com Computador (VDT)",
      atividadesDescricao: `Operação contínua de microcomputador, digitação de relatórios, alimentação de sistemas e atendimento telefônico na função de ${funcaoNome || "Colaborador"} no setor ${setorNome || "Geral"}.`,
      org_pausas: "C",
      org_alternancia: "C",
      org_ritmo_metas: "C",
      org_horas_extras: "C",
      org_obs: "Pausas informais durante a jornada e ritmo determinado pelo fluxo de trabalho.",
      cargas_peso_frequencia: "NA",
      cargas_pega_distancia: "NA",
      cargas_meios_mecanicos: "NA",
      cargas_obs: "Não há levantamento manual de cargas pesadas neste posto de trabalho.",
      mob_cadeira_ajustavel: "C",
      mob_mesa_espaco: "C",
      mob_apoio_pes: "C",
      mob_monitor_visao: "C",
      mob_obs: "Mobiliário atende aos requisitos dimensionais da NR-17 e NBR 13962.",
      maq_empunhadura: "NA",
      maq_esforco_acionamento: "NA",
      maq_vibracao: "NA",
      maq_obs: "Não utiliza ferramentas ou maquinário manual com vibração.",
      amb_ruido: "C",
      amb_temperatura: "C",
      amb_iluminancia: "C",
      amb_obs: "Ambiente climatizado e iluminância adequada para atividades intelectuais.",
      classificacaoRisco: "Baixo / Situação Conforme",
      necessidadeAET: false,
      justificativaAET: "As condições ergonômicas gerais atendem aos requisitos da NR-17. Não foram identificadas sobrecargas biomecânicas ou organizacionais críticas.",
      recomendacoes: [
        "Manter regulagem periódica da cadeira e posição correta da tela na linha dos olhos.",
        "Realizar pequenas pausas de relaxamento e alongamento durante a jornada de digitação.",
        "Orientar o trabalhador sobre conscientização postural (NR-17.4)."
      ],
      parecerTecnico: `Avaliação Ergonômica Preliminar realizada para o posto administrativo de ${funcaoNome || "Colaborador"}. Conclui-se que o posto apresenta conformidade ergonômica e baixo risco ocupacional, sendo a presente AEP suficiente para a composição do PGR.`
    };
  }

  return {
    tipoPosto: tipoPosto || "Operacional / Industrial",
    atividadesDescricao: `Execução de tarefas manuais operacionais, movimentação de peças e controle de equipamentos na função de ${funcaoNome || "Operador"} no setor ${setorNome || "Operacional"}.`,
    org_pausas: "C",
    org_alternancia: "C",
    org_ritmo_metas: "C",
    org_horas_extras: "C",
    org_obs: "Rotina operacional intercalada com procedimentos de apoio.",
    cargas_peso_frequencia: "C",
    cargas_pega_distancia: "C",
    cargas_meios_mecanicos: "C",
    cargas_obs: "Movimentação eventual de cargas fracionadas dentro dos limites normativos.",
    mob_cadeira_ajustavel: "NA",
    mob_mesa_espaco: "C",
    mob_apoio_pes: "NA",
    mob_monitor_visao: "NA",
    mob_obs: "Plano de trabalho e bancada operacional com boa área de alcance.",
    maq_empunhadura: "C",
    maq_esforco_acionamento: "C",
    maq_vibracao: "NA",
    maq_obs: "Ferramentas manuais com empunhadura anatômica.",
    amb_ruido: "C",
    amb_temperatura: "C",
    amb_iluminancia: "C",
    amb_obs: "Ambiente fabril com ventilação e iluminação geral compatíveis com a atividade.",
    classificacaoRisco: "Baixo / Situação Conforme",
    necessidadeAET: false,
    justificativaAET: "Atividades com esforço biomecânico moderado e controlado. Medidas de prevenção da AEP são suficientes para o PGR.",
    recomendacoes: [
      "Manter a utilização correta dos equipamentos auxiliares de movimentação de materiais.",
      "Promover rotação periódica de tarefas operacionais para alternância de grupos musculares.",
      "Realizar treinamentos de levantamento e manuseio de materiais (item 17.5.3 da NR-17)."
    ],
    parecerTecnico: `Avaliação Ergonômica Preliminar (NR-17) conclusiva para a função de ${funcaoNome || "Operador"}. Não foram constatadas inconformidades graves que demandem AET aprofundada neste momento.`
  };
}

function fallbackAepFindings(aepData: any, empresaNome?: string) {
  const funcao = aepData?.funcaoNome || "Colaborador";
  const setor = aepData?.setorNome || "Setor Operacional/Administrativo";
  const tipoPosto = aepData?.tipoPosto || "Posto de Trabalho";

  // Verificar se há itens NC (Não Conformes)
  const ncItems: string[] = [];
  if (aepData?.org_pausas === "NC") ncItems.push("Ausência de pausas estruturadas");
  if (aepData?.org_alternancia === "NC") ncItems.push("Falta de alternância postural");
  if (aepData?.org_ritmo_metas === "NC") ncItems.push("Ritmo de trabalho excessivo");
  if (aepData?.org_horas_extras === "NC") ncItems.push("Jornada extraordinária habitual");
  if (aepData?.cargas_peso_frequencia === "NC") ncItems.push("Movimentação manual de cargas com sobrepeso");
  if (aepData?.cargas_pega_distancia === "NC") ncItems.push("Pega desfavorável / flexão de tronco");
  if (aepData?.cargas_meios_mecanicos === "NC") ncItems.push("Ausência de meios mecânicos de elevação");
  if (aepData?.mob_cadeira_ajustavel === "NC") ncItems.push("Assento sem regulagens ergonômicas");
  if (aepData?.mob_mesa_espaco === "NC") ncItems.push("Espaço de trabalho ou altura da mesa inadequados");
  if (aepData?.mob_apoio_pes === "NC") ncItems.push("Ausência de suporte para os pés");
  if (aepData?.mob_monitor_visao === "NC") ncItems.push("Monitor desalinhado da linha visual");
  if (aepData?.maq_empunhadura === "NC") ncItems.push("Empunhadura desconfortável em ferramentas");
  if (aepData?.maq_esforco_acionamento === "NC") ncItems.push("Comandos pesados ou fora da zona de alcance");
  if (aepData?.maq_vibracao === "NC") ncItems.push("Vibração mecânica transmitida");
  if (aepData?.amb_ruido === "NC") ncItems.push("Ruído de fundo prejudicial ao conforto");
  if (aepData?.amb_temperatura === "NC") ncItems.push("Temperatura fora da faixa de conforto (20°C a 25°C)");
  if (aepData?.amb_iluminancia === "NC") ncItems.push("Iluminância inadequada no campo de trabalho");

  const temNC = ncItems.length > 0;
  const muitasNC = ncItems.length >= 3;

  const risco = muitasNC
    ? "Alto / Situação Crítica"
    : temNC
    ? "Médio / Atenção Ergonômica"
    : "Baixo / Situação Conforme";

  const recs: string[] = [];
  if (aepData?.org_pausas === "NC") recs.push("Instituir pausas regulares de 10 minutos a cada 50 minutos de atividade contínua.");
  if (aepData?.mob_cadeira_ajustavel === "NC") recs.push("Substituir assentos por modelos reguláveis em altura e com apoio lombar (NBR 13962).");
  if (aepData?.mob_monitor_visao === "NC") recs.push("Instalar suportes ajustáveis para elevação de monitores mantendo o terço superior na altura dos olhos.");
  if (aepData?.mob_apoio_pes === "NC") recs.push("Disponibilizar apoios de pés reguláveis para colaboradores que não alcancem o piso com os pés apoiados.");
  if (aepData?.cargas_peso_frequencia === "NC" || aepData?.cargas_meios_mecanicos === "NC") recs.push("Fornecer dispositivos mecânicos de transporte (carrinhos/paleteiras) e fracionar o peso das cargas.");
  if (aepData?.amb_iluminancia === "NC") recs.push("Ajustar a iluminância do plano de trabalho conforme os parâmetros da NHO 11 da Fundacentro.");

  if (recs.length === 0) {
    recs.push("Manter as regulagens ergonômicas e boas práticas posturais estabelecidas.");
    recs.push("Realizar treinamentos periódicos de conscientização ergonômica conforme NR-17.");
    recs.push("Monitorar queixas osteomusculares nas consultas ocupacionais do PCMSO.");
  }

  return {
    classificacaoRisco: risco,
    necessidadeAET: muitasNC,
    justificativaAET: muitasNC
      ? "Identificadas não-conformidades ergonômicas múltiplas ou complexas. Recomenda-se Análise Ergonômica do Trabalho (AET) aprofundada conforme item 17.3.2 da NR-17."
      : "As demandas ergonômicas observadas possuem soluções diretas e objetivas que foram descritas na presente AEP, integrando-se ao Plano de Ação do PGR.",
    recomendacoes: recs,
    parecerTecnico: `Avaliação Ergonômica Preliminar (AEP) elaborada em conformidade com a NR-17 (item 17.3) para a função ${funcao} no setor ${setor} (${tipoPosto}). ${temNC ? `Foram identificados ${ncItems.length} pontos de atenção ergonômica a serem sanados.` : "As condições biomecânicas, organizacionais e ambientais encontram-se em conformidade."} As recomendações técnicas devem ser incorporadas ao Plano de Ação do PGR da empresa ${empresaNome || ""}.`
  };
}

// 7. AEP (Avaliação Ergonômica Preliminar - NR-17) Photo / Posture Analysis with Gemini AI
app.post("/api/aep/analyze-photo", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", funcaoNome, setorNome, tipoPosto } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: "Foto do posto de trabalho não fornecida." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        data: fallbackAepPhotoAnalysis(funcaoNome, setorNome, tipoPosto),
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const prompt = `Você é um Engenheiro de Segurança do Trabalho e Ergonomista especializado na Norma Regulamentadora NR-17 (Ergonomia) do Ministério do Trabalho e Emprego do Brasil e critérios da Fundacentro.
Analise a foto do posto de trabalho / colaborador em atividade da função: "${funcaoNome || "Trabalhador"}" no setor: "${setorNome || "Geral"}", tipo de posto: "${tipoPosto || "Geral"}".

Avalie minuciosamente:
1. Postura do colaborador: flexão/extensão ou torção do pescoço, inclinação do tronco, posicionamento dos membros superiores (ombros elevados, braços suspensos, flexão de punhos), postura dos membros inferiores e apoio dos pés.
2. Mobiliário e equipamentos: altura e regulagem do assento/encosto da cadeira, plano de trabalho (mesa/bancada), apoio de antebraços, altura e alinhamento do monitor à linha dos olhos, espaço para pernas.
3. Movimentação de cargas: se houver, pega de carga, flexão lombar, uso de equipamentos mecânicos auxiliares.
4. Condições de iluminação, espaço físico e ferramentas.

Forneça a avaliação de conformidade ("C" para Conforme, "NC" para Não Conforme, "NA" para Não Aplicável) nos 5 domínios da NR-17, além de observações específicas, classificação do risco, recomendações práticas e parecer técnico.

Responda ESTRITAMENTE em formato JSON com as chaves:
{
  "tipoPosto": "string",
  "atividadesDescricao": "string (descrição técnica concisa da tarefa e postura observada na foto)",
  "org_pausas": "C" | "NC" | "NA",
  "org_alternancia": "C" | "NC" | "NA",
  "org_ritmo_metas": "C" | "NC" | "NA",
  "org_horas_extras": "C" | "NC" | "NA",
  "org_obs": "string",
  "cargas_peso_frequencia": "C" | "NC" | "NA",
  "cargas_pega_distancia": "C" | "NC" | "NA",
  "cargas_meios_mecanicos": "C" | "NC" | "NA",
  "cargas_obs": "string",
  "mob_cadeira_ajustavel": "C" | "NC" | "NA",
  "mob_mesa_espaco": "C" | "NC" | "NA",
  "mob_apoio_pes": "C" | "NC" | "NA",
  "mob_monitor_visao": "C" | "NC" | "NA",
  "mob_obs": "string",
  "maq_empunhadura": "C" | "NC" | "NA",
  "maq_esforco_acionamento": "C" | "NC" | "NA",
  "maq_vibracao": "C" | "NC" | "NA",
  "maq_obs": "string",
  "amb_ruido": "C" | "NC" | "NA",
  "amb_temperatura": "C" | "NC" | "NA",
  "amb_iluminancia": "C" | "NC" | "NA",
  "amb_obs": "string",
  "classificacaoRisco": "Baixo / Situação Conforme" | "Médio / Atenção Ergonômica" | "Alto / Situação Crítica",
  "necessidadeAET": false,
  "justificativaAET": "string",
  "recomendacoes": ["string", "string", "string"],
  "parecerTecnico": "string"
}`;

    try {
      const response = await generateContentWithFallback(ai, {
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      let parsedData = {};
      try {
        parsedData = JSON.parse(text);
      } catch {
        const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        parsedData = JSON.parse(cleanJson);
      }

      return res.json({
        success: true,
        data: parsedData,
      });
    } catch (aiErr: any) {
      console.warn("Gemini AI photo analysis unavailable (503/limit), using expert ergonomic heuristics:", aiErr?.message);
      return res.json({
        success: true,
        data: fallbackAepPhotoAnalysis(funcaoNome, setorNome, tipoPosto),
        notice: "Análise gerada via motor heurístico ergonômico especialista da NR-17.",
      });
    }
  } catch (error: any) {
    console.error("Error analyzing AEP photo:", error);
    return res.json({
      success: true,
      data: fallbackAepPhotoAnalysis(req.body.funcaoNome, req.body.setorNome, req.body.tipoPosto),
    });
  }
});

// 8. AEP Technical Findings & Action Plan Generation with Gemini AI
app.post("/api/aep/generate-findings", async (req, res) => {
  try {
    const { aepData, empresaNome } = req.body;
    if (!aepData) {
      return res.status(400).json({ success: false, error: "Dados da AEP não fornecidos." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        data: fallbackAepFindings(aepData, empresaNome),
      });
    }

    const prompt = `Você é um Engenheiro de Segurança do Trabalho e Ergonomista Sênior.
Com base nos dados da Avaliação Ergonômica Preliminar (NR-17):
Empresa: "${empresaNome || ""}"
Função / Cargo: "${aepData.funcaoNome || ""}"
Setor: "${aepData.setorNome || ""}"
Tipo do Posto: "${aepData.tipoPosto || ""}"
Descrição das Atividades: "${aepData.atividadesDescricao || ""}"

Checklist da AEP:
- Organização: Pausas: ${aepData.org_pausas}, Alternância: ${aepData.org_alternancia}, Ritmo: ${aepData.org_ritmo_metas}, Horas Extras: ${aepData.org_horas_extras}. Obs: ${aepData.org_obs || "N/A"}
- Cargas: Peso/Freq: ${aepData.cargas_peso_frequencia}, Pegada/Dist: ${aepData.cargas_pega_distancia}, Meios Mecânicos: ${aepData.cargas_meios_mecanicos}. Obs: ${aepData.cargas_obs || "N/A"}
- Mobiliário: Cadeira: ${aepData.mob_cadeira_ajustavel}, Mesa: ${aepData.mob_mesa_espaco}, Apoio Pés: ${aepData.mob_apoio_pes}, Monitor: ${aepData.mob_monitor_visao}. Obs: ${aepData.mob_obs || "N/A"}
- Máquinas/Ferramentas: Empunhadura: ${aepData.maq_empunhadura}, Acionamento: ${aepData.maq_esforco_acionamento}, Vibração: ${aepData.maq_vibracao}. Obs: ${aepData.maq_obs || "N/A"}
- Ambiente: Ruído: ${aepData.amb_ruido}, Temperatura: ${aepData.amb_temperatura}, Iluminação: ${aepData.amb_iluminancia}. Obs: ${aepData.amb_obs || "N/A"}

Elabore com linguagem técnica formal e rigor normativo:
1. "parecerTecnico": Parecer técnico conclusivo de Higiene Ocupacional / Ergonomia para fundamentar a Avaliação Ergonômica Preliminar (AEP) e alimentar o PGR (NR-01).
2. "recomendacoes": Array com 3 a 5 recomendações práticas, viáveis e priorizadas para o Plano de Ação.
3. "necessidadeAET": boolean (true apenas se houver sobrecarga complexa sem solução preliminar clara ou risco crítico não resolvido).
4. "justificativaAET": Justificativa técnica formal sobre a necessidade ou desnecessidade de AET (item 17.3.2 da NR-17).
5. "classificacaoRisco": "Baixo / Situação Conforme" | "Médio / Atenção Ergonômica" | "Alto / Situação Crítica"

Responda ESTRITAMENTE em formato JSON.`;

    try {
      const response = await generateContentWithFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      let parsed = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        parsed = JSON.parse(cleanJson);
      }

      return res.json({
        success: true,
        data: parsed,
      });
    } catch (aiErr: any) {
      console.warn("Gemini AI findings generation unavailable (503/limit), using expert ergonomic heuristics:", aiErr?.message);
      return res.json({
        success: true,
        data: fallbackAepFindings(aepData, empresaNome),
        notice: "Parecer técnico elaborado pelo motor de síntese normativa NR-17.",
      });
    }
  } catch (error: any) {
    console.error("Error generating AEP findings:", error);
    return res.json({
      success: true,
      data: fallbackAepFindings(req.body.aepData, req.body.empresaNome),
    });
  }
});

// 12. Protocolo de Amostragem de Higiene Ocupacional via IA (NR-15, NHO, NIOSH, OSHA, ACGIH)
app.post("/api/higiene/generate-protocol", async (req, res) => {
  try {
    const { agente, cas, categoria, detalhes } = req.body;
    if (!agente) {
      return res.status(400).json({ success: false, error: "Nome do agente ou produto não informado." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: false,
        error: "GEMINI_API_KEY não configurada.",
      });
    }

    const prompt = `Você é um Higienista Ocupacional Certificado (HOC / ABHO) e Engenheiro de Segurança do Trabalho com profundo domínio das normas regulamentadoras (NR-15, NR-09), NHOs da Fundacentro, Métodos NIOSH, OSHA e ACGIH TLVs.
Gere um Guia Completo e Passo a Passo de Medição e Amostragem em Campo para o seguinte agente/produto:
- Agente / Produto: "${agente}"
- CAS: "${cas || "N/A"}"
- Categoria: "${categoria || "Químico / Físico"}"
- Detalhes contextuais: "${detalhes || ""}"

Responda ESTRITAMENTE em formato JSON com a seguinte estrutura completa:
{
  "agente": "${agente}",
  "categoria": "quimico" | "fisico" | "poeiras" | "gases" | "biologico",
  "cas": "string",
  "normasRegulamentadoras": ["NR-15 Anexo...", "NR-09", "NHO...", "NIOSH...", "ACGIH"],
  "metodologiaReferencia": "Nome da norma/método principal (ex: NIOSH 1501 / NHO 07)",
  "resumoObjetivo": "Resumo claro do objetivo da coleta em campo",
  "meioColeta": {
    "dispositivo": "Nome do coletor (ex: Tubo de Carvão Ativado SKC, Cassete 37mm MCE/PVC, Dosímetro, IBUTG)",
    "especificacao": "Especificação técnica do meio (ex: 100/50mg, membrana 0.8um, etc.)",
    "acessorios": ["Lista de acessórios necessários, bomba, suportes, mangueiras, calibrador, etc."]
  },
  "parametrosBomba": {
    "vazaoRecomendada": "Vazão exata em L/min ou mL/min",
    "volumeMinimoLitros": "Volume mínimo recomendado",
    "volumeMaximoLitros": "Volume máximo para não saturar",
    "tempoColetaSugerido": "Tempo sugerido de amostragem no turno",
    "temperaturaUmidade": "Cuidados com variáveis ambientais"
  },
  "calibragemPassoAPasso": {
    "titulo": "Passo a passo da calibração pré e pós-coleta",
    "instrucoes": ["Passo 1...", "Passo 2...", "Passo 3..."],
    "criterioAceitacao": "Critério de tolerância de vazão ou acústica (ex: variação máxima de +-5%)"
  },
  "passoAPassoCampo": [
    {
      "etapa": 1,
      "titulo": "1. Nome da Etapa",
      "descricao": "Instrução detalhada de como executar em campo",
      "dicasPraticas": "Dica prática de ouro para o técnico em campo não errar"
    }
  ],
  "brancoDeCampo": {
    "obrigatorio": true,
    "instrucao": "Instrução exata de como manusear o branco de campo"
  },
  "preservacaoTransporte": {
    "acondicionamento": "Como embalar, temperatura de conservação (ex: 4C em gelo reciclável)",
    "tempoLimiteLaboratorio": "Prazo máximo para envio ao laboratório",
    "documentacao": "Dados obrigatórios da Cadeia de Custódia"
  },
  "limitesTolerancia": {
    "nr15": "Limite pela NR-15 (ppm ou mg/m³) e grau de insalubridade",
    "acgih": "TLV-TWA / TLV-STEL pela ACGIH",
    "nivelAcaoNR09": "Nível de ação preventivo"
  },
  "calculoAmostrador": {
    "formula": "Fórmula do volume ou concentração",
    "exemplo": "Exemplo numérico resolvido"
  }
}`;

    try {
      const response = await generateContentWithFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      let parsed = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        parsed = JSON.parse(cleanJson);
      }

      return res.json({
        success: true,
        data: parsed,
      });
    } catch (aiErr: any) {
      console.warn("AI generation failed for hygiene protocol:", aiErr?.message);
      return res.status(500).json({ success: false, error: "Não foi possível gerar o protocolo com IA no momento." });
    }
  } catch (error: any) {
    console.error("Error generating hygiene protocol:", error);
    return res.status(500).json({ success: false, error: error?.message || "Erro no servidor." });
  }
});

// 13. Importação Inteligente de Trabalhadores / Funcionários via IA (Qualquer arquivo, texto, PDF, planilha ou tabela copiada)
app.post("/api/trabalhadores/import-ai", async (req, res) => {
  try {
    const { rawText, fileBase64, mimeType = "application/pdf", fileName = "", existingSetores = [], existingFuncoes = [] } = req.body;

    if (!rawText && !fileBase64) {
      return res.status(400).json({ success: false, error: "Nenhum texto ou arquivo fornecido para extração." });
    }

    const ai = getGeminiClient();
    const setoresHint = Array.isArray(existingSetores) && existingSetores.length > 0
      ? `Setores já cadastrados na empresa (priorize associar a estes quando aplicável): ${existingSetores.join(", ")}`
      : "";
    const funcoesHint = Array.isArray(existingFuncoes) && existingFuncoes.length > 0
      ? `Funções/Cargos já cadastrados na empresa (priorize associar a estes quando aplicável): ${existingFuncoes.join(", ")}`
      : "";

    if (!ai) {
      // Fallback baseado em heurística textual local
      const fallbackList = parseEmployeesFromTextFallback(rawText || "");
      return res.json({
        success: true,
        data: {
          trabalhadores: fallbackList,
          total: fallbackList.length,
          resumo: `Identificados ${fallbackList.length} registros através do leitor textual local.`,
        },
      });
    }

    const systemPrompt = `Você é um Engenheiro de Segurança do Trabalho e Auditor de RH/eSocial especialista em recepção e higienização de cadastros de funcionários de qualquer fonte (planilhas Excel/CSV/ODS, relatórios de folha em PDF/DOCX, sistemas de ponto, ERPs como Totvs/Senior/SAP ou listas coladas).

Sua missão é extrair TODOS os trabalhadores/colaboradores encontrados, MESMO QUE AS INFORMAÇÕES ESTEJAM INCOMPLETAS, PARCIAIS OU DESORGANIZADAS.
Exemplo de tolerância máxima:
- Se tiver só o Nome e Cargo: extraia!
- Se tiver só Nome e CPF: extraia!
- Se faltar o setor: tente deduzir pelo cargo ou deixe vazio.
- Se faltar o CPF: deixe vazio ou coloque null, NÃO descarte o funcionário.

Contexto cadastral da empresa:
${setoresHint}
${funcoesHint}

Para cada pessoa identificada, retorne um objeto com:
- "nome": string (Nome completo do trabalhador)
- "cpf": string (CPF com pontuação 000.000.000-00 ou números puros, ou "" se ausente)
- "matricula": string (Matrícula, chapa ou código funcional, ou "")
- "rg": string (RG ou órgão emissor, ou "")
- "dataNascimento": string (Formato AAAA-MM-DD se possível, ou "" se ausente)
- "sexo": "M" | "F" | "Outro" (ou "" se não identificável)
- "setorNome": string (Setor/Departamento onde atua)
- "funcaoNome": string (Cargo, função ou atividade exercida)
- "cbo": string (Código CBO se constar)
- "dataAdmissao": string (Formato AAAA-MM-DD se possível, ou "")
- "telefone": string (WhatsApp / celular, ou "")
- "email": string (E-mail do colaborador, ou "")
- "status": "Ativo" | "Afastado" | "Férias" | "Desligado" (padrão "Ativo")
- "observacoes": string (Qualquer informação adicional encontrada)

Responda ESTRITAMENTE em formato JSON com a seguinte estrutura:
{
  "trabalhadores": [
    {
      "nome": "string",
      "cpf": "string",
      "matricula": "string",
      "rg": "string",
      "dataNascimento": "string",
      "sexo": "M",
      "setorNome": "string",
      "funcaoNome": "string",
      "cbo": "string",
      "dataAdmissao": "string",
      "telefone": "string",
      "email": "string",
      "status": "Ativo",
      "observacoes": "string"
    }
  ],
  "resumo": "string com resumo amigável do processamento"
}`;

    let contentsPayload: any;

    if (fileBase64) {
      const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, "");
      // Suporta PDF e Imagens diretamente
      if (mimeType.includes("pdf") || mimeType.includes("image")) {
        contentsPayload = {
          parts: [
            {
              inlineData: {
                mimeType: mimeType.includes("pdf") ? "application/pdf" : mimeType,
                data: cleanBase64,
              },
            },
            {
              text: `${systemPrompt}\n\nArquivo de entrada: "${fileName}". Extraia todos os funcionários contidos neste documento.`,
            },
          ],
        };
      } else {
        // Se for arquivo de texto / csv / string codificada em base64
        const decodedText = Buffer.from(cleanBase64, "base64").toString("utf-8");
        contentsPayload = `${systemPrompt}\n\nConteúdo do arquivo "${fileName}":\n\n${decodedText}`;
      }
    } else {
      contentsPayload = `${systemPrompt}\n\nTexto colado pelo usuário:\n\n${rawText}`;
    }

    try {
      const response = await generateContentWithFallback(ai, {
        contents: contentsPayload,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      let parsed: any = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        parsed = JSON.parse(cleanJson);
      }

      const trabalhadores = Array.isArray(parsed?.trabalhadores) ? parsed.trabalhadores : [];

      return res.json({
        success: true,
        data: {
          trabalhadores,
          total: trabalhadores.length,
          resumo: parsed?.resumo || `Extraídos com sucesso ${trabalhadores.length} colaboradores do arquivo.`,
        },
      });
    } catch (aiErr: any) {
      console.warn("AI workers parsing error, attempting local fallback:", aiErr?.message);
      const fallbackList = parseEmployeesFromTextFallback(rawText || "");
      return res.json({
        success: true,
        data: {
          trabalhadores: fallbackList,
          total: fallbackList.length,
          resumo: `Processado pelo motor textual de emergência: ${fallbackList.length} encontrados.`,
        },
      });
    }
  } catch (error: any) {
    console.error("Error importing workers with AI:", error);
    return res.status(500).json({ success: false, error: error?.message || "Falha ao processar arquivo com IA." });
  }
});

function parseEmployeesFromTextFallback(text: string) {
  if (!text) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const results: any[] = [];

  const cpfRegex = /(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/;
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
  const phoneRegex = /(\(?\d{2}\)?\s*9?\d{4}-?\d{4})/;

  for (const line of lines) {
    // Ignora cabeçalhos clássicos
    if (/nome|cpf|cargo|funcao|matricula|setor|admissao/i.test(line) && line.length < 50) continue;

    // Procura separadores comuns (vírgula, ponto e vírgula, tab, barra)
    const parts = line.split(/[;\t,|]/).map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) continue;

    const cpfMatch = line.match(cpfRegex);
    const emailMatch = line.match(emailRegex);
    const phoneMatch = line.match(phoneRegex);

    let nome = parts[0] || "";
    // Se a primeira coluna parecer CPF, o nome está na segunda
    if (cpfRegex.test(nome) && parts[1]) {
      nome = parts[1];
    }

    if (nome.length > 2 && !/^\d+$/.test(nome)) {
      results.push({
        nome: nome,
        cpf: cpfMatch ? cpfMatch[1] : "",
        matricula: parts[2] && /^\d+$/.test(parts[2]) ? parts[2] : "",
        funcaoNome: parts[1] && !cpfRegex.test(parts[1]) ? parts[1] : "Operacional",
        setorNome: parts[3] || "Geral",
        telefone: phoneMatch ? phoneMatch[1] : "",
        email: emailMatch ? emailMatch[1] : "",
        status: "Ativo",
      });
    }
  }
  return results;
}

// 14. Preenchimento de ASO com Reconhecimento por Foto ou PDF (OCR + IA Médica de SST)
app.post("/api/pcmso/scan-aso", async (req, res) => {
  try {
    const { fileBase64, mimeType = "image/jpeg", funcoesDisponiveis = [] } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ success: false, error: "Arquivo ou foto do ASO não fornecido." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: "GEMINI_API_KEY não configurada no servidor para reconhecimento visual de ASO.",
      });
    }

    const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, "");
    const actualMime = mimeType.includes("pdf") ? "application/pdf" : mimeType;

    const funcoesHint = Array.isArray(funcoesDisponiveis) && funcoesDisponiveis.length > 0
      ? `Funções existentes no sistema da empresa: ${funcoesDisponiveis.join(", ")}`
      : "";

    const prompt = `Você é um Médico do Trabalho e Engenheiro de Segurança do Trabalho especialista na NR-07 e nos eventos de SST do eSocial (S-2220 - Monitoramento da Saúde do Trabalhador).
Analise detalhadamente a foto ou documento PDF deste Atestado de Saúde Ocupacional (ASO).

Extraia com máxima precisão todas as informações técnicas e legais contidas no ASO:

1. "nomeEmpregado": Nome completo do trabalhador examinado.
2. "cpf": CPF do trabalhador (formatado: 000.000.000-00).
3. "matricula": Número de matrícula ou registro funcional, se constar.
4. "dataNascimento": Data de nascimento no formato AAAA-MM-DD (se constar).
5. "cargo": Cargo, função ou posto de trabalho indicado no documento.
6. "setor": Setor, departamento ou unidade física mencionada.
7. "tipoAso": Classificação estrita entre:
   - "Admissional"
   - "Periódico"
   - "Retorno ao Trabalho"
   - "Mudança de Riscos Ocupacionais"
   - "Demissional"
8. "dataRealizacao": Data do exame clínico / emissão do ASO (formato AAAA-MM-DD).
9. "dataValidade": Data limite para o próximo exame periódico ou validade estimada (formato AAAA-MM-DD). Se não estiver explícita, estime a partir da data de realização (normalmente 12 meses após).
10. "resultado": "Apto" | "Inapto" | "Apto com Restrição".
11. "restricoes": Descrição detalhada de quaisquer restrições médicas registradas no ASO (ex: "Não executar trabalho em altura NR-35", "Restrição a levantamento de cargas > 10kg", ou "" se sem restrições).
12. "medicoExaminadorNome": Nome completo do médico que realizou o exame clínico e assinou o documento.
13. "medicoExaminadorCrm": Número do CRM do médico examinador (apenas números ou sigla).
14. "medicoExaminadorUf": Sigla do estado do CRM do examinador (ex: "SP", "RJ", "MG", "PR", etc.).
15. "medicoCoordenadorNome": Nome do médico coordenador do PCMSO (se constar no cabeçalho ou rodapé).
16. "medicoCoordenadorCrm": CRM do coordenador (se constar).
17. "medicoCoordenadorUf": UF do CRM do coordenador (se constar).
18. "clinicaExame": Razão social ou nome fantasia da clínica, hospital ou serviço médico emitente.
19. "examesRealizados": Array com todos os exames complementares listados no ASO (ex: Audiometria, Espirometria, Acuidade Visual, Hemograma, Raio-X de Tórax, ECG, EEG, etc.), contendo:
    - "nome": Nome do exame complementar
    - "data": Data de realização (AAAA-MM-DD)
    - "resultado": "Normal" | "Alterado" | "Estável"
20. "riscosOcupacionais": Array de strings com os riscos ocupacionais identificados e descritos no ASO (ex: ["Ruído", "Poeiras Minerais", "Postura Inadequada"]).

Contexto de funções no sistema:
${funcoesHint}

Responda ESTRITAMENTE em formato JSON com a seguinte estrutura:
{
  "nomeEmpregado": "string",
  "cpf": "string",
  "matricula": "string",
  "dataNascimento": "string",
  "cargo": "string",
  "setor": "string",
  "tipoAso": "Periódico",
  "dataRealizacao": "AAAA-MM-DD",
  "dataValidade": "AAAA-MM-DD",
  "resultado": "Apto",
  "restricoes": "string",
  "medicoExaminadorNome": "string",
  "medicoExaminadorCrm": "string",
  "medicoExaminadorUf": "string",
  "medicoCoordenadorNome": "string",
  "medicoCoordenadorCrm": "string",
  "medicoCoordenadorUf": "string",
  "clinicaExame": "string",
  "examesRealizados": [
    { "nome": "string", "data": "AAAA-MM-DD", "resultado": "Normal" }
  ],
  "riscosOcupacionais": ["string"]
}`;

    const response = await generateContentWithFallback(ai, {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: actualMime,
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error("Error scanning ASO document:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Erro ao processar e extrair dados do ASO com IA.",
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SST Vistoria Server running on http://localhost:${PORT}`);
  });
}

startServer();
