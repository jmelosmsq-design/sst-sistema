// Mapeamento oficial de CNAE para Grau de Risco (NR-04 - Quadro I da Portaria MTP nº 4.219/2022)

export function obterGrauRiscoPorCNAE(cnaeInput: string, descricaoAtividade?: string): string {
  if (!cnaeInput && !descricaoAtividade) return "2";
  
  const cnaeClean = String(cnaeInput || "").replace(/\D/g, "");
  const desc = (descricaoAtividade || "").toLowerCase();

  // 1. Verificações por palavras-chave na descrição da atividade (caso CNAE seja genérico)
  if (
    desc.includes("mineração") ||
    desc.includes("extração de minério") ||
    desc.includes("explosivos") ||
    desc.includes("construção de edifícios") ||
    desc.includes("obras de terraplenagem") ||
    desc.includes("fundações") ||
    desc.includes("andaimes") ||
    desc.includes("demolição") ||
    desc.includes("usinagem pesada") ||
    desc.includes("caldeiraria") ||
    desc.includes("frigorífico") ||
    desc.includes("abatedouro")
  ) {
    return "4";
  }

  if (
    desc.includes("indústria") ||
    desc.includes("fabricação") ||
    desc.includes("metalúrgica") ||
    desc.includes("química") ||
    desc.includes("fundição") ||
    desc.includes("carpintaria industrial") ||
    desc.includes("marcenaria") ||
    desc.includes("tinturaria") ||
    desc.includes("coleta de resíduos") ||
    desc.includes("tratamento de esgoto") ||
    desc.includes("hospital") ||
    desc.includes("pronto socorro") ||
    desc.includes("oficina mecânica") ||
    desc.includes("funilaria")
  ) {
    return "3";
  }

  if (
    desc.includes("comércio") ||
    desc.includes("varejista") ||
    desc.includes("atacadista") ||
    desc.includes("armazém") ||
    desc.includes("transporte rodoviário") ||
    desc.includes("restaurante") ||
    desc.includes("lanchonete") ||
    desc.includes("hotel") ||
    desc.includes("posto de combustível")
  ) {
    return "2";
  }

  if (
    desc.includes("escritório") ||
    desc.includes("consultoria") ||
    desc.includes("software") ||
    desc.includes("contabilidade") ||
    desc.includes("advocacia") ||
    desc.includes("treinamento") ||
    desc.includes("ensino") ||
    desc.includes("escola") ||
    desc.includes("agência de publicidade") ||
    desc.includes("desenvolvimento profissional")
  ) {
    return "1";
  }

  if (!cnaeClean) return "2";

  // 2. Mapeamento por Divisão do CNAE (2 primeiros dígitos) conforme NR-04
  const div = parseInt(cnaeClean.slice(0, 2), 10);
  if (isNaN(div)) return "2";

  // Agricultura, Pecuária, Produção Florestal, Pesca (Divisões 01 a 03) -> Grau 3
  if (div >= 1 && div <= 3) return "3";

  // Indústrias Extrativas (Divisões 05 a 09) -> Grau 4
  if (div >= 5 && div <= 9) return "4";

  // Indústrias de Transformação (Divisões 10 a 33) -> Grau 3 (com algumas subatividades grau 2 ou 4)
  if (div >= 10 && div <= 33) {
    // Alimentos e Bebidas (10, 11) -> Grau 3
    // Fabricação de fumo (12) -> Grau 3
    // Têxteis, Vestuário, Couro (13, 14, 15) -> Grau 2 ou 3
    // Madeira (16) -> Grau 3
    // Celulose e papel (17) -> Grau 3
    // Impressão (18) -> Grau 2
    // Coque, derivados de petróleo, biocombustíveis (19) -> Grau 3 ou 4
    // Químicos (20) -> Grau 3
    // Farmacêuticos (21) -> Grau 2
    // Borracha e plástico (22) -> Grau 3
    // Minerais não metálicos (23) -> Grau 3 ou 4
    // Metalurgia (24) -> Grau 4
    // Produtos de metal (25) -> Grau 3
    // Equipamentos de informática e eletrônicos (26) -> Grau 2
    // Máquinas e equipamentos (28) -> Grau 3
    // Veículos automotores (29, 30) -> Grau 3
    // Móveis (31) -> Grau 3
    if (div === 24 || div === 19) return "4";
    if (div === 14 || div === 18 || div === 21 || div === 26) return "2";
    return "3";
  }

  // Eletricidade e Gás (Divisão 35) -> Grau 3
  if (div === 35) return "3";

  // Água, Esgoto, Gestão de Resíduos e Descontaminação (Divisões 36 a 39) -> Grau 3
  if (div >= 36 && div <= 39) return "3";

  // Construção (Divisões 41, 42, 43) -> Grau 4 (Obras de infraestrutura, edifícios, serviços especializados)
  if (div >= 41 && div <= 43) return "4";

  // Comércio e Reparação de Veículos (Divisões 45 a 47) -> Grau 2
  if (div >= 45 && div <= 47) return "2";

  // Transporte, Armazenagem e Correio (Divisões 49 a 53) -> Grau 3 (exceto correios grau 2)
  if (div >= 49 && div <= 53) {
    if (div === 53) return "2";
    return "3";
  }

  // Alojamento e Alimentação (Divisões 55 e 56) -> Grau 2
  if (div === 55 || div === 56) return "2";

  // Informação e Comunicação (Divisões 58 a 63) -> Grau 1
  if (div >= 58 && div <= 63) return "1";

  // Atividades Financeiras, de Seguros e Serviços Relacionados (Divisões 64 a 66) -> Grau 1
  if (div >= 64 && div <= 66) return "1";

  // Atividades Imobiliárias (Divisão 68) -> Grau 1
  if (div === 68) return "1";

  // Atividades Profissionais, Científicas e Técnicas (Divisões 69 a 75) -> Grau 1 (exceto engenharia/ensaios grau 2)
  if (div >= 69 && div <= 75) {
    if (div === 71) return "2"; // Serviços de arquitetura e engenharia; testes e análises técnicas
    return "1";
  }

  // Atividades Administrativas e Serviços Complementares (Divisões 77 a 82) -> Grau 2 ou 3
  if (div >= 77 && div <= 82) {
    if (div === 80 || div === 81) return "3"; // Vigilância, segurança privada, limpeza
    return "1";
  }

  // Administração Pública, Defesa e Seguridade Social (Divisão 84) -> Grau 1
  if (div === 84) return "1";

  // Educação / Treinamento (Divisão 85) -> Grau 1 ou 2
  if (div === 85) return "1";

  // Saúde Humana e Serviços Sociais (Divisões 86 a 88) -> Grau 3 (Hospitais, pronto-socorro) ou Grau 2 (Consultórios)
  if (div >= 86 && div <= 88) {
    if (div === 86) return "3"; // Atividades de atenção à saúde humana
    return "2";
  }

  // Artes, Cultura, Esporte e Recreação (Divisões 90 a 93) -> Grau 2
  if (div >= 90 && div <= 93) return "2";

  // Outras Atividades de Serviços (Divisões 94 a 96) -> Grau 2 (exceto lavanderias grau 3)
  if (div >= 94 && div <= 96) {
    if (div === 96) return "2";
    return "1";
  }

  // Serviços Domésticos (Divisão 97) -> Grau 2
  if (div === 97) return "2";

  return "2";
}
