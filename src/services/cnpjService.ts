/**
 * Serviço de Consulta de CNPJ com múltiplos fallbacks e tratamento de erros
 */

export interface CNPJResponseData {
  razao_social?: string;
  nome_fantasia?: string;
  cnae_fiscal?: string | number;
  cnae_fiscal_descricao?: string;
  descricao_tipo_de_logradouro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string | number;
  ddd_telefone_1?: string;
  email?: string;
  data_inicio_atividade?: string;
  qsa?: Array<{
    nome_socio?: string;
    qualificacao_socio?: string;
  }>;
}

export async function fetchCNPJData(cnpjDigits: string): Promise<CNPJResponseData> {
  const cleanCnpj = cnpjDigits.replace(/\D/g, "");
  if (cleanCnpj.length !== 14) {
    throw new Error("CNPJ inválido. Digite os 14 dígitos.");
  }

  // Tentativa 1: BrasilAPI
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
      headers: { Accept: "application/json" },
    });
    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      const data = await res.json();
      return {
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia,
        cnae_fiscal: data.cnae_fiscal,
        cnae_fiscal_descricao: data.cnae_fiscal_descricao,
        descricao_tipo_de_logradouro: data.descricao_tipo_de_logradouro,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        municipio: data.municipio,
        uf: data.uf,
        cep: data.cep,
        ddd_telefone_1: data.ddd_telefone_1 || data.telefone,
        email: data.email,
        data_inicio_atividade: data.data_inicio_atividade,
        qsa: data.qsa?.map((s: any) => ({
          nome_socio: s.nome_socio,
          qualificacao_socio: s.qualificacao_socio,
        })),
      };
    }
  } catch (err) {
    console.warn("BrasilAPI falhou ou bloqueada por CORS, tentando fallback...", err);
  }

  // Tentativa 2: Minha Receita
  try {
    const res = await fetch(`https://minhareceita.org/${cleanCnpj}`, {
      headers: { Accept: "application/json" },
    });
    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      const data = await res.json();
      return {
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia,
        cnae_fiscal: data.cnae_fiscal,
        cnae_fiscal_descricao: data.cnae_fiscal_descricao,
        logradouro: [data.descricao_tipo_de_logradouro, data.logradouro].filter(Boolean).join(" "),
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        municipio: data.municipio,
        uf: data.uf,
        cep: data.cep,
        ddd_telefone_1: data.ddd_telefone_1 || data.telefone,
        email: data.email,
        data_inicio_atividade: data.data_inicio_atividade,
        qsa: data.qsa?.map((s: any) => ({
          nome_socio: s.nome_socio,
          qualificacao_socio: s.qualificacao_socio,
        })),
      };
    }
  } catch (err) {
    console.warn("MinhaReceita falhou, tentando fallback...", err);
  }

  // Tentativa 3: CNPJ.ws Pública
  try {
    const res = await fetch(`https://publica.cnpj.ws/cnpj/${cleanCnpj}`, {
      headers: { Accept: "application/json" },
    });
    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      const data = await res.json();
      const estab = data.estabelecimento || {};
      return {
        razao_social: data.razao_social,
        nome_fantasia: estab.nome_fantasia,
        cnae_fiscal: estab.atividade_principal?.id,
        cnae_fiscal_descricao: estab.atividade_principal?.descricao,
        logradouro: [estab.tipo_logradouro, estab.logradouro].filter(Boolean).join(" "),
        numero: estab.numero,
        complemento: estab.complemento,
        bairro: estab.bairro,
        municipio: estab.cidade?.nome,
        uf: estab.estado?.sigla,
        cep: estab.cep,
        ddd_telefone_1: estab.ddd1 && estab.telefone1 ? `${estab.ddd1}${estab.telefone1}` : undefined,
        email: estab.email,
        data_inicio_atividade: estab.data_inicio_atividade,
        qsa: data.socios?.map((s: any) => ({
          nome_socio: s.nome,
          qualificacao_socio: s.qualificacao_socio?.descricao,
        })),
      };
    }
  } catch (err) {
    console.warn("CNPJ.ws falhou:", err);
  }

  throw new Error("Não foi possível obter dados automáticos do CNPJ nas bases públicas. Por favor, preencha as informações manualmente.");
}
