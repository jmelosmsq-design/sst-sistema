import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Company,
  SetorData,
  FuncaoData,
  FotoEvidencia,
  ExtintorItem,
  EquipamentoEmergencia,
  PlanoAcaoItem,
  MatrixDimension,
  AvaliacaoRiscoItem,
  AepItem,
  AepConformidade,
  Nr16AvaliacaoItem,
  Nr16AnexoItem,
} from "../types";
import { RISKS_CATALOG } from "../data/risksCatalog";
import { RISK_MATRIX_MODELS } from "../data/riskMatrixModels";
import { getRiscoTemplate } from "../data/riskTemplates";

export function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length === 6) {
    const num = parseInt(cleanHex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  return [30, 41, 59];
}

export function parseFotos(fotosStr?: string | FotoEvidencia[]): FotoEvidencia[] {
  if (!fotosStr) return [];
  if (Array.isArray(fotosStr)) return fotosStr;
  try {
    const parsed = JSON.parse(fotosStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseExtintores(extStr?: string): ExtintorItem[] {
  if (!extStr) return [];
  try {
    const parsed = JSON.parse(extStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseEquipamentos(equipStr?: string): EquipamentoEmergencia[] {
  if (!equipStr) return [];
  try {
    const parsed = JSON.parse(equipStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parsePlanoAcao(
  planoItensStr?: string,
  legacyPlanoAcao?: string,
  legacyPrioridade?: string,
  legacyPrazo?: string
): PlanoAcaoItem[] {
  if (planoItensStr) {
    try {
      const parsed = JSON.parse(planoItensStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // fallback
    }
  }

  if (legacyPlanoAcao && legacyPlanoAcao.trim().length > 0) {
    return [
      {
        id: "legacy-1",
        item: legacyPlanoAcao.trim(),
        prioridade: (legacyPrioridade as any) || "Alta",
        prazo: legacyPrazo || "30 dias",
        status: "Pendente",
      },
    ];
  }

  return [];
}

export function gerarPDFEmpresa(company: Company): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  montarEstruturaPDF(doc, company);
  const nomeEmpresa = (company.empresa.emp_razao || company.empresa.emp_fantasia || "empresa")
    .replace(/[^\w\d-_]+/g, "_")
    .slice(0, 40);
  doc.save(`Relatorio_SST_${nomeEmpresa}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function gerarPDFTodasEmpresas(companies: Company[]): void {
  if (!companies.length) return;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  companies.forEach((company, index) => {
    if (index > 0) doc.addPage();
    montarEstruturaPDF(doc, company);
  });
  doc.save(`Relatorio_SST_Consolidado_Todas_Empresas_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function gerarPDFAEP(company: Company, aepOrId?: string | AepItem): void {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    montarEstruturaAEPPDF(doc, company, aepOrId);
    const nomeEmpresa = ((company?.empresa?.emp_razao || company?.empresa?.emp_fantasia || "Empresa") as string)
      .replace(/[^\w\d-_]+/g, "_")
      .slice(0, 40);
    doc.save(`AEP_NR17_${nomeEmpresa}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (error) {
    console.error("Erro ao gerar PDF da AEP:", error);
    throw error;
  }
}

function montarEstruturaPDF(doc: jsPDF, company: Company): void {
  const e = company.empresa || {};
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const primaryColor: [number, number, number] = [26, 95, 63]; // #1a5f3f
  const accentColor: [number, number, number] = [13, 59, 37];
  const tableMargin = { left: 35, right: 35 };

  // ==========================================
  // Header Banner
  // ==========================================
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 58, "F");

  // Renderizar Logotipo da Empresa / Consultoria se disponível
  const empLogo = e.emp_logo || e.emp_consultoria_logo;
  let textMaxW = pageWidth - 70;

  if (empLogo) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageWidth - 95, 6, 60, 46, 3, 3, "F");
      doc.addImage(empLogo, "PNG", pageWidth - 92, 9, 54, 40, undefined, "FAST");
      textMaxW = pageWidth - 140;
    } catch (err) {
      console.warn("Erro ao renderizar logo no PDF:", err);
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.text("RELATÓRIO DE COLETA E RECONHECIMENTO TÉCNICO DE SST", 35, 26, { maxWidth: textMaxW });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Instrumento de Coleta Preliminar para PGR (NR-01), PCMSO (NR-07), LTCAT e Laudos Técnicos",
    35,
    42,
    { maxWidth: textMaxW }
  );

  // ==========================================
  // 1. IDENTIFICAÇÃO DA EMPRESA
  // ==========================================
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("1. IDENTIFICAÇÃO DA EMPRESA E RESPONSÁVEIS", 35, 78);

  const dadosGeraisRows = [
    ["Razão Social:", e.emp_razao || "Não informada", "Nome Fantasia:", e.emp_fantasia || "Não informado"],
    ["CNPJ:", e.emp_cnpj || "Não informado", "Inscrição Estadual:", e.emp_ie || "Isento / Não inf."],
    [
      "CNAE Principal:",
      `${e.emp_cnae || ""} - ${e.emp_cnae_desc || "Não informado"}`,
      "Grau de Risco (NR-04):",
      e.emp_grau_risco ? `Grau ${e.emp_grau_risco}` : "Não informado",
    ],
    [
      "Total de Funcionários:",
      e.emp_total_func ? `${e.emp_total_func} trabalhador(es)` : "Não informado",
      "Data da Vistoria:",
      e.emp_vistoria || "Não informada",
    ],
    [
      "Endereço Completo:",
      [e.emp_endereco, e.emp_bairro, e.emp_cidade, e.emp_uf, e.emp_cep].filter(Boolean).join(" - ") || "Não informado",
      "Contato / Telefone:",
      `${e.emp_telefone || ""} | ${e.emp_email || ""}`,
    ],
    [
      "Responsável Legal:",
      `${e.emp_responsavel || "Não informado"} (${e.emp_cargo_resp || "Cargo não inf."}) - CPF: ${e.emp_cpf_resp || "Não inf."}`,
      "Técnico Vistoriador:",
      `${e.emp_consultoria_tecnico || e.emp_tecnico || "Não informado"}${e.emp_consultoria_registro ? ` (${e.emp_consultoria_registro})` : ""}`,
    ],
    [
      "Geolocalização / GPS:",
      e.emp_localizacao || "Não capturada",
      "Consultoria SST:",
      e.emp_consultoria_razao || e.emp_consultoria || "Consultoria SST",
    ],
    [
      "Observações Gerais:",
      { content: e.emp_obs || "Nenhuma observação adicional.", colSpan: 3 },
    ],
  ];

  autoTable(doc, {
    startY: 86,
    body: dadosGeraisRows as any,
    theme: "grid",
    styles: { fontSize: 7.5, cellPadding: 3.5, font: "helvetica", textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 105, fillColor: [241, 248, 243] },
      1: { cellWidth: 160 },
      2: { fontStyle: "bold", cellWidth: 105, fillColor: [241, 248, 243] },
      3: { cellWidth: 155 },
    },
    margin: tableMargin,
  });

  let currentY = (doc as any).lastAutoTable.finalY + 16;

  // ==========================================
  // 2. SETORES E AMBIENTES DE TRABALHO
  // ==========================================
  if (currentY > 660) {
    doc.addPage();
    currentY = 45;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentColor);
  doc.text("2. CARACTERIZAÇÃO DOS SETORES E AMBIENTES DE TRABALHO", 35, currentY);
  currentY += 8;

  const setores = company.setores || [];
  if (setores.length === 0) {
    autoTable(doc, {
      startY: currentY,
      head: [["Setor", "Caracterização do Ambiente Físico", "Máquinas / Equipamentos", "Medidas de Controle"]],
      body: [["Nenhum setor cadastrado", "-", "-", "-"]],
      theme: "striped",
      headStyles: { fillColor: primaryColor, fontSize: 8 },
      margin: tableMargin,
    });
    currentY = (doc as any).lastAutoTable.finalY + 16;
  } else {
    const setoresRows = setores.map((s) => {
      const fotosCount = parseFotos(s.setor_fotos).length;
      const ambienteDetalhado = [
        `- Edificação: ${s.setor_edificacao || "Não informada"} (${s.setor_area ? s.setor_area + " m²" : "Área não inf."} - ${s.setor_andares || 1} pav.)`,
        `- Iluminação: ${s.setor_iluminacao || "Não informada"}`,
        `- Ventilação: ${s.setor_ventilacao || "Não informada"}`,
        `- Piso: ${s.setor_piso || "Não informado"}`,
        `- Paredes / Fechamento: ${s.setor_fechamento || "Não informado"}`,
        `- Horário: ${s.setor_horario_desc || "Segunda a Sexta"} (Carga: ${s.setor_carga || "8"}h/dia)`,
        s.setor_obs ? `- Obs.: ${s.setor_obs}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const controlesAcao = [
        s.setor_controles ? `Controles Existentes:\n${s.setor_controles}` : "Controles: Conforme rotinas",
        fotosCount > 0 ? `\n[${fotosCount} foto(s) anexada(s) no anexo fotográfico]` : "",
      ]
        .filter(Boolean)
        .join("\n");

      return [
        s.setor_nome || "Setor",
        ambienteDetalhado,
        s.setor_maquinas || "Processos operacionais e manuais padrão",
        controlesAcao,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Nome do Setor", "Condições Ambientais e Estruturais", "Máquinas, Equipamentos e Processos", "Medidas de Controle Existentes"]],
      body: setoresRows,
      theme: "grid",
      headStyles: { fillColor: primaryColor, fontSize: 8, fontStyle: "bold" },
      styles: { fontSize: 7, cellPadding: 4, valign: "top", font: "helvetica" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 85, fillColor: [248, 250, 252] },
        1: { cellWidth: 170 },
        2: { cellWidth: 130 },
        3: { cellWidth: 140 },
      },
      margin: tableMargin,
    });

    currentY = (doc as any).lastAutoTable.finalY + 16;
  }

  // ==========================================
  // 3. EQUIPAMENTOS DE COMBATE A INCÊNDIO E EMERGÊNCIA
  // ==========================================
  if (currentY > 640) {
    doc.addPage();
    currentY = 45;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentColor);
  doc.text("3. EQUIPAMENTOS DE COMBATE A INCÊNDIO E EMERGÊNCIA", 35, currentY);
  currentY += 10;

  // 3.1 Extintores de Incêndio
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("3.1 Extintores de Incêndio e Meios de Primeiro Combate:", 35, currentY);
  currentY += 6;

  const extintoresRows: string[][] = [];
  setores.forEach((s) => {
    const extList = parseExtintores(s.setor_extintores);
    if (extList.length > 0) {
      extList.forEach((ext) => {
        extintoresRows.push([
          s.setor_nome || "Setor",
          `${ext.modelo} (${ext.classe || "A:B:C"})`,
          `${ext.qtd || "1"} un. - ${ext.capacidade || "Padrão"}`,
          ext.local ? ext.local : "Próximo à circulação",
          `Val: ${ext.validade || "Válido"}\nSinalizado: ${ext.sinalizado || "Sim"}\nDesobstruído: ${ext.desobstruido || "Sim"}`,
        ]);
      });
    }
  });

  autoTable(doc, {
    startY: currentY,
    head: [["Setor", "Modelo / Agente Extintor", "Quantidade / Capacidade", "Localização no Posto", "Validade e Condições"]],
    body: extintoresRows.length ? extintoresRows : [["Todos os setores", "Sem registros de extintores específicos", "-", "-", "-"]],
    theme: "grid",
    headStyles: { fillColor: [40, 116, 80], fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 7, cellPadding: 3.5, font: "helvetica", valign: "top" },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 95, fillColor: [248, 250, 252] },
      1: { cellWidth: 125 },
      2: { cellWidth: 95 },
      3: { cellWidth: 105 },
      4: { cellWidth: 105 },
    },
    margin: tableMargin,
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // 3.2 Outros Equipamentos de Emergência e Resgate
  if (currentY > 660) {
    doc.addPage();
    currentY = 45;
  }

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("3.2 Outros Equipamentos e Sistemas de Emergência e Resgate:", 35, currentY);
  currentY += 6;

  const outrosEquipRows: string[][] = [];
  setores.forEach((s) => {
    const equipList = parseEquipamentos(s.setor_equipamentos);
    if (equipList.length > 0) {
      equipList.forEach((equip) => {
        outrosEquipRows.push([
          s.setor_nome || "Setor",
          equip.tipo,
          `${equip.qtd || "1"} unidade(s)`,
          equip.obs || "Em condições normais de uso e operação.",
        ]);
      });
    }
  });

  autoTable(doc, {
    startY: currentY,
    head: [["Setor", "Equipamento / Sistema de Emergência", "Quantidade", "Condições Operacionais / Observações"]],
    body: outrosEquipRows.length
      ? outrosEquipRows
      : [["Todos os setores", "Iluminação de emergência e rotas desobstruídas conforme rotina", "Conforme layout", "Verificado durante a vistoria técnica."]],
    theme: "grid",
    headStyles: { fillColor: [30, 90, 65], fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 7, cellPadding: 3.5, font: "helvetica", valign: "top" },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 105, fillColor: [248, 250, 252] },
      1: { cellWidth: 195 },
      2: { cellWidth: 75 },
      3: { cellWidth: 150 },
    },
    margin: tableMargin,
  });

  currentY = (doc as any).lastAutoTable.finalY + 16;

  // ==========================================
  // 4. FUNÇÕES, ATIVIDADES E RISCOS OCUPACIONAIS
  // ==========================================
  if (currentY > 660) {
    doc.addPage();
    currentY = 45;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentColor);
  doc.text("4. FUNÇÕES, ATIVIDADES, EXPOSIÇÃO E RISCOS OCUPACIONAIS", 35, currentY);
  currentY += 8;

  const funcoes = company.funcoes || [];
  if (funcoes.length === 0) {
    autoTable(doc, {
      startY: currentY,
      head: [["Função / Cargo", "Setor / Efetivo", "Descrição Detalhada das Atividades", "Riscos Ocupacionais Identificados", "EPI / EPC / Medidas Recomendadas"]],
      body: [["Nenhuma função cadastrada", "-", "-", "-", "-"]],
      theme: "striped",
      headStyles: { fillColor: primaryColor, fontSize: 8 },
      margin: tableMargin,
    });
    currentY = (doc as any).lastAutoTable.finalY + 16;
  } else {
    const funcoesRows = funcoes.map((f) => {
      const setorObj = setores.find((s) => s.id === f.func_setor);
      const riscosList = company.riscos?.[f.id] || [];

      // Categorizar riscos
      let riscosFormatados = "Nenhum risco vinculado";
      if (riscosList.length > 0) {
        riscosFormatados = riscosList.map((r, i) => `${i + 1}. ${r}`).join("\n");
      }

      // Formatação sequencial e organizada dos EPIs: CA, Descrição e Informações/Eficácia
      let epiBloco = "";
      if (f.func_epis_lista && f.func_epis_lista.length > 0) {
        epiBloco = f.func_epis_lista
          .map((epi, idx) => {
            const linhaCa = epi.ca ? `• C.A.: ${epi.ca}` : `• EPI ${idx + 1}`;
            const linhaDesc = `  Descrição: ${epi.nome}${epi.fabricante ? ` (${epi.fabricante})` : ""}`;
            const detalhes = [];
            if (epi.validade) detalhes.push(`Validade: ${epi.validade}`);
            if (epi.eficacia) detalhes.push(`Eficácia: ${epi.eficacia}`);
            if (epi.protecao) detalhes.push(`Proteção: ${epi.protecao}`);
            const linhaDetalhes = detalhes.length > 0 ? `  Info: ${detalhes.join(" | ")}` : "";
            return [linhaCa, linhaDesc, linhaDetalhes].filter(Boolean).join("\n");
          })
          .join("\n\n");
      } else if (f.func_epis || f.func_epis_ca) {
        const partes = [];
        if (f.func_epis_ca) partes.push(`• C.A.: ${f.func_epis_ca}`);
        if (f.func_epis) partes.push(`  Descrição: ${f.func_epis.replace(/\n+/g, " - ")}`);
        const infoExtra = [];
        if (f.func_epis_validade) infoExtra.push(`Validade: ${f.func_epis_validade}`);
        if (f.func_epis_eficacia) infoExtra.push(`Eficácia: ${f.func_epis_eficacia}`);
        if (infoExtra.length > 0) partes.push(`  Info: ${infoExtra.join(" | ")}`);
        epiBloco = partes.join("\n");
      } else {
        epiBloco = "• EPIs: Não aplicável / Não informados";
      }

      const epcMedidas = [
        f.func_epcs ? `• EPCs: ${f.func_epcs}` : "",
        f.func_frequencia || f.func_tempo_exposicao
          ? `• Exposição: ${f.func_frequencia || "Habitual"} (${f.func_tempo_exposicao || "Jornada integral"})`
          : "",
        f.func_medidas ? `• Medidas Recomendadas:\n${f.func_medidas}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const colunaEpiCompleta = [epiBloco, epcMedidas].filter(Boolean).join("\n\n");

      const cargoComCbo = f.func_cbo
        ? `${f.func_nome || "Função"}\n• CBO: ${f.func_cbo}`
        : (f.func_nome || "Função");

      return [
        cargoComCbo,
        `${setorObj?.setor_nome || "Setor não vinculado"}\n• Efetivo: ${f.func_qtd || "1"} trab.\n• Turno: ${f.func_turno || "Diurno"}`,
        f.func_descricao || "Execução das tarefas inerentes ao cargo e rotinas operacionais.",
        riscosFormatados,
        colunaEpiCompleta,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Função / Cargo", "Setor / Efetivo", "Descrição Detalhada das Atividades", "Matriz de Riscos Vinculados", "EPIs (C.A., Descrição) / EPCs"]],
      body: funcoesRows,
      theme: "grid",
      headStyles: { fillColor: primaryColor, fontSize: 8, fontStyle: "bold" },
      styles: { fontSize: 7, cellPadding: 3.5, valign: "top", font: "helvetica", overflow: "linebreak" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 90, fillColor: [248, 250, 252] },
        1: { cellWidth: 85 },
        2: { cellWidth: 115 },
        3: { cellWidth: 105 },
        4: { cellWidth: 130 },
      },
      margin: tableMargin,
    });

    currentY = (doc as any).lastAutoTable.finalY + 16;
  }

  // ==========================================
  // 4.1. INVENTÁRIO DE PRODUTOS QUÍMICOS
  // ==========================================
  const produtosQuimicos = company.produtosQuimicos || [];
  const produtosPorFuncao = company.produtosPorFuncao || {};
  const hasProdutosCadastrados = produtosQuimicos.length > 0;
  const funcoesComProdutos = funcoes.filter((f) => (produtosPorFuncao[f.id] || []).length > 0);

  if (hasProdutosCadastrados || funcoesComProdutos.length > 0) {
    if (currentY > 640) {
      doc.addPage();
      currentY = 45;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...accentColor);
    doc.text("4.1. INVENTÁRIO DE PRODUTOS QUÍMICOS E GESTÃO DE RISCOS (GHS / NR-15)", 35, currentY);
    currentY += 10;

    // Tabela A: Inventário Geral de Produtos Químicos da Empresa
    if (produtosQuimicos.length > 0) {
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("A) Inventário Geral de Produtos Químicos da Empresa:", 35, currentY);
      currentY += 6;

      const quimicosRows = produtosQuimicos.map((p) => {
        const identificacao = `${p.nome}\n${p.nomeQuimico ? `• Substância: ${p.nomeQuimico}\n` : ""}• CAS: ${p.cas || "Mistura"}${p.onu ? ` | ${p.onu}` : ""}\n• Fabricante: ${p.fabricante || "Nacional"}`;
        const perigos = `${p.classificacaoGhs || "Sob avaliação FDS"}\n${p.frasesPerigo ? `Frases H: ${p.frasesPerigo}` : ""}`;
        const controleEpis = `EPIs: ${p.episRecomendados || "Luvas e proteção respiratória conforme FDS"}\n${p.medidasControle ? `EPCs: ${p.medidasControle}` : ""}`;

        return [
          identificacao,
          p.estadoFisico || "Líquido",
          p.finalidadeUso || "Uso operacional / limpeza / manutenção",
          perigos,
          controleEpis,
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [["Produto / Identificação Química", "Estado", "Finalidade de Uso", "Classificação GHS / Perigos", "EPIs e Medidas de Controle"]],
        body: quimicosRows,
        theme: "grid",
        headStyles: { fillColor: [185, 28, 28], fontSize: 8, fontStyle: "bold" },
        styles: { fontSize: 6.5, cellPadding: 3, valign: "top", font: "helvetica" },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 135, fillColor: [254, 242, 242] },
          1: { cellWidth: 55 },
          2: { cellWidth: 105 },
          3: { cellWidth: 120 },
          4: { cellWidth: 110 },
        },
        margin: tableMargin,
      });

      currentY = (doc as any).lastAutoTable.finalY + 12;
    }

    // Tabela B: Quadro de Exposição aos Agentes Químicos por Função
    if (funcoesComProdutos.length > 0) {
      if (currentY > 640) {
        doc.addPage();
        currentY = 45;
      }

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("B) Relação de Exposição aos Agentes Químicos por Função / Posto de Trabalho:", 35, currentY);
      currentY += 6;

      const exposicaoRows: any[] = [];
      funcoesComProdutos.forEach((f) => {
        const vinculos = produtosPorFuncao[f.id] || [];
        const setor = setores.find((s) => s.id === f.func_setor);

        vinculos.forEach((v) => {
          const prodObj = produtosQuimicos.find((p) => p.id === v.produtoId);
          exposicaoRows.push([
            `${f.func_nome}\n(${setor?.setor_nome || "Setor"})`,
            `${v.produtoNome}\nCAS: ${v.cas || prodObj?.cas || "Mistura"}`,
            v.tempoExposicao || "Habitual (6h a 8h/dia)",
            v.concentracao || "Puro (100%)",
            v.formaUso || "Aplicação manual",
            v.viaExposicao || "Inalatória e Dérmica",
            prodObj?.episRecomendados || f.func_epis || "EPIs conforme NR-06",
          ]);
        });
      });

      autoTable(doc, {
        startY: currentY,
        head: [["Função / Posto", "Produto Químico (CAS)", "Tempo de Exposição", "Concentração", "Forma de Uso", "Via de Exposição", "EPIs Utilizados"]],
        body: exposicaoRows,
        theme: "grid",
        headStyles: { fillColor: [153, 27, 27], fontSize: 7.5, fontStyle: "bold" },
        styles: { fontSize: 6.5, cellPadding: 3, valign: "top", font: "helvetica" },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 80, fillColor: [248, 250, 252] },
          1: { cellWidth: 85 },
          2: { cellWidth: 75 },
          3: { cellWidth: 70 },
          4: { cellWidth: 75 },
          5: { cellWidth: 70 },
          6: { cellWidth: 70 },
        },
        margin: tableMargin,
      });

      currentY = (doc as any).lastAutoTable.finalY + 16;
    }
  }

  // ==========================================
  // 4.2. METODOLOGIA DA MATRIZ DE RISCOS (NR-01 / GRO)
  // ==========================================
  const tipoMatriz: MatrixDimension = company.tipoMatrizPadrao || "5x5";
  const matrixModel = RISK_MATRIX_MODELS[tipoMatriz] || RISK_MATRIX_MODELS["5x5"];

  if (currentY > 620) {
    doc.addPage();
    currentY = 45;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentColor);
  doc.text(`4.2. METODOLOGIA DA MATRIZ DE RISCO (${tipoMatriz}) E REFERÊNCIAS NORMATIVAS`, 35, currentY);
  currentY += 8;

  // Quadro de Referências Normativas
  const refNormativas = matrixModel.referenciasPrincipais.map((r) => `• ${r.codigo}: ${r.nome} (${r.tipo})`).join("\n");
  const textoMetodologia = `Metodologia Adotada: ${matrixModel.titulo}\n${matrixModel.descricaoNormativa}\n\nPrincipais Normas e Diretrizes Técnicas de Enquadramento:\n${refNormativas}`;

  autoTable(doc, {
    startY: currentY,
    head: [["Fundamentação Legal e Normativa da Avaliação de Riscos (GRO / NR-01)"]],
    body: [[textoMetodologia]],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 59], fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 7, cellPadding: 4, font: "helvetica", fillColor: [248, 250, 252] },
    margin: tableMargin,
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Grade Visual da Matriz de Risco com Cores Oficiais
  if (currentY > 640) {
    doc.addPage();
    currentY = 45;
  }

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(`Estrutura e Gradação Matricial Probabilidade × Severidade (${tipoMatriz}):`, 35, currentY);
  currentY += 5;

  const matrixHead = ["Probabilidade \\ Severidade", ...matrixModel.severidades.map((s) => `${s.rotulo} (S=${s.valor})`)];
  const matrixBody = matrixModel.probabilidades.map((p, pIdx) => {
    const row = [`${p.rotulo} (P=${p.valor})`];
    matrixModel.severidades.forEach((s, sIdx) => {
      const cell = matrixModel.grid[pIdx]?.[sIdx];
      row.push(cell ? `${cell.rotulo}\n(Score ${p.valor * s.valor})` : "-");
    });
    return row;
  });

  autoTable(doc, {
    startY: currentY,
    head: [matrixHead],
    body: matrixBody,
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], fontSize: 7.5, fontStyle: "bold", halign: "center" },
    styles: { fontSize: 6.5, cellPadding: 3, font: "helvetica", halign: "center", valign: "middle" },
    columnStyles: {
      0: { fontStyle: "bold", halign: "left", fillColor: [241, 245, 249], cellWidth: 90 },
    },
    didParseCell: (data) => {
      // Colorir as células internas da matriz de acordo com o nível de risco
      if (data.section === "body" && data.column.index > 0) {
        const pIdx = data.row.index;
        const sIdx = data.column.index - 1;
        const cellInfo = matrixModel.grid[pIdx]?.[sIdx];
        if (cellInfo) {
          data.cell.styles.fillColor = hexToRgb(cellInfo.corHex);
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: tableMargin,
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // ==========================================
  // 4.3. INVENTÁRIO DE GRADAÇÃO DE RISCOS (PGR / GRO)
  // ==========================================
  const avaliacoesMap = company.avaliacoesRiscos || {};
  const todasAvaliacoes: { funcaoNome: string; setorNome: string; risco: string; av?: AvaliacaoRiscoItem }[] = [];

  funcoes.forEach((f) => {
    const s = setores.find((setor) => setor.id === f.func_setor);
    const riscos = company.riscos?.[f.id] || [];
    riscos.forEach((r) => {
      const av = avaliacoesMap[f.id]?.[r];
      todasAvaliacoes.push({
        funcaoNome: f.func_nome || "Função",
        setorNome: s?.setor_nome || "Setor",
        risco: r,
        av,
      });
    });
  });

  if (todasAvaliacoes.length > 0) {
    if (currentY > 640) {
      doc.addPage();
      currentY = 45;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...accentColor);
    doc.text("4.3. INVENTÁRIO DE RISCOS OCUPACIONAIS, GRADAÇÃO E ENQUADRAMENTO LEGAL", 35, currentY);
    currentY += 8;

    const inventarioRows = todasAvaliacoes.map((item) => {
      const av = item.av;
      const funcaoSetor = `${item.funcaoNome}\n(${item.setorNome})`;
      const riscoNome = item.risco;
      const tpl = getRiscoTemplate(riscoNome);
      
      let gradacao = "Não graduado";
      let nivelRisco = "Pendente";
      let enquadramento = tpl ? tpl.normasSugeridas.join("\n") : "NR-01 (GRO)";
      let detalhes = tpl ? `Fonte: ${tpl.fonteGeradora}\nDanos: ${tpl.possiveisDanos}` : "Avaliação preliminar";
      let medidas = tpl
        ? `Existente: ${tpl.medidasControleExistentes}\nProposta: ${tpl.medidasControlePropostas}`
        : "Manter medidas de controle operacionais e organizacionais";

      if (av) {
        gradacao = `P: ${av.probabilidade} × S: ${av.severidade}\nScore: ${av.nivelRiscoScore}`;
        nivelRisco = `${av.nivelRiscoRotulo}\nPrioridade: ${av.prioridadeAcao || "Média"}\nPrazo: ${av.prazoSugerido || "Conforme cronograma"}`;
        
        const normas = [av.referenciaNormativaMatriz.split("-")[0]?.trim() || "NR-01", ...(av.normasComplementares || (tpl ? tpl.normasSugeridas : []))];
        enquadramento = Array.from(new Set(normas.filter(Boolean))).join("\n");

        const partesDet = [];
        if (av.fonteGeradora) partesDet.push(`Fonte: ${av.fonteGeradora}`);
        else if (tpl?.fonteGeradora) partesDet.push(`Fonte: ${tpl.fonteGeradora}`);

        if (av.possiveisDanos) partesDet.push(`Danos: ${av.possiveisDanos}`);
        else if (tpl?.possiveisDanos) partesDet.push(`Danos: ${tpl.possiveisDanos}`);

        detalhes = partesDet.length > 0 ? partesDet.join("\n") : (tpl ? `Fonte: ${tpl.fonteGeradora}\nDanos: ${tpl.possiveisDanos}` : "Atividades rotineiras");

        const partesMed = [];
        if (av.medidasControleExistentes) partesMed.push(`Existente: ${av.medidasControleExistentes}`);
        else if (tpl?.medidasControleExistentes) partesMed.push(`Existente: ${tpl.medidasControleExistentes}`);

        if (av.medidasControlePropostas) partesMed.push(`Proposta: ${av.medidasControlePropostas}`);
        else if (tpl?.medidasControlePropostas) partesMed.push(`Proposta: ${tpl.medidasControlePropostas}`);

        medidas = partesMed.length > 0 ? partesMed.join("\n") : (tpl ? `Proposta: ${tpl.medidasControlePropostas}` : "Medidas de engenharia, administrativas e organizacionais aplicáveis");
      }

      return [
        funcaoSetor,
        riscoNome,
        gradacao,
        nivelRisco,
        enquadramento,
        detalhes,
        medidas,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Função / Setor", "Perigo / Fator de Risco", "Gradação (P×S)", "Nível de Risco & Prazo", "Enquadramento Legal (NRs)", "Fonte Geradora & Danos", "Medidas de Controle"]],
      body: inventarioRows,
      theme: "grid",
      headStyles: { fillColor: [30, 58, 138], fontSize: 7.5, fontStyle: "bold" },
      styles: { fontSize: 6.5, cellPadding: 3, valign: "top", font: "helvetica" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 70, fillColor: [248, 250, 252] },
        1: { cellWidth: 80 },
        2: { cellWidth: 50, halign: "center" },
        3: { cellWidth: 75 },
        4: { cellWidth: 65 },
        5: { cellWidth: 85 },
        6: { cellWidth: 100 },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 3) {
          const item = todasAvaliacoes[data.row.index];
          if (item?.av?.nivelRiscoCorHex) {
            data.cell.styles.fillColor = hexToRgb(item.av.nivelRiscoCorHex);
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      margin: tableMargin,
    });

    currentY = (doc as any).lastAutoTable.finalY + 16;
  }

  // ==========================================
  // 5. PLANO DE AÇÃO PREVENTIVO / CORRETIVO E PENDÊNCIAS (NR-01 - 5W2H)
  // ==========================================
  if (currentY > 640) {
    doc.addPage();
    currentY = 45;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentColor);
  doc.text("5. PLANO DE AÇÃO PREVENTIVO E CORRETIVO CONSOLIDADO (NR-01 GRO/PGR - 5W2H)", 35, currentY);
  currentY += 8;

  const planoAcaoRows: string[][] = [];

  // Se houver plano de ação global consolidado
  if (company.planoAcaoGlobal && company.planoAcaoGlobal.length > 0) {
    company.planoAcaoGlobal.forEach((item, idx) => {
      const nr = item.nrReferencia || "NR-01";
      const oQue = item.item;
      const onde = item.ondeLocal || "Geral";
      const quem = item.responsavel || "SESMT / Gestão";
      const quando = item.prazo + (item.dataSugerida ? ` (${item.dataSugerida})` : "");
      const como = item.comoFazer ? `\nComo: ${item.comoFazer}` : "";
      const status = item.status || "Pendente";
      const prioridade = item.prioridade || "Alta";

      planoAcaoRows.push([
        `${nr}\n${onde}`,
        `${oQue}${como}`,
        prioridade,
        quando,
        `Resp: ${quem}\nStatus: ${status}`,
      ]);
    });
  } else {
    // Fallback para setores cadastrados
    setores.forEach((s) => {
      const itens = parsePlanoAcao(
        s.setor_plano_itens,
        s.setor_plano_acao,
        s.setor_plano_prioridade,
        s.setor_plano_prazo
      );

      if (itens.length > 0) {
        itens.forEach((p, idx) => {
          const itemDesc = p.origemOuRisco ? `[${p.origemOuRisco}] ${p.item}` : p.item;
          const prazoFormatado = p.dataSugerida
            ? `${p.prazo || "Prazo"} (${p.dataSugerida})`
            : (p.prazo || "30 dias");
          const respFormatado = p.responsavel || s.setor_plano_responsavel || "Gestão / Manutenção";
          const statusFormatado = p.status || "Pendente";

          const setorLabel = itens.length > 1
            ? `${s.setor_nome || "Setor"} (Item ${idx + 1})`
            : (s.setor_nome || "Setor");

          planoAcaoRows.push([
            setorLabel,
            itemDesc,
            p.prioridade || "Alta",
            prazoFormatado,
            `Resp: ${respFormatado}\nStatus: ${statusFormatado}`,
          ]);
        });
      } else {
        planoAcaoRows.push([
          s.setor_nome || "Setor",
          "Manter monitoramento contínuo das rotinas operacionais e inspeções periódicas.",
          "Baixa",
          "Rotina Contínua",
          "Resp: Gestão do Setor\nStatus: Conforme",
        ]);
      }
    });
  }

  autoTable(doc, {
    startY: currentY,
    head: [["NR / Local (Where)", "Medida de Controle / Ação Técnica (What & How)", "Prioridade", "Prazo (When)", "Responsável (Who) / Status"]],
    body: planoAcaoRows.length
      ? planoAcaoRows
      : [["NR-01 - Geral", "Elaborar inventário de riscos definitivo e cronograma de metas no PGR", "Alta", "30 dias", "Resp: SESMT\nStatus: Pendente"]],
    theme: "grid",
    headStyles: { fillColor: [30, 58, 138], fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 7, cellPadding: 3.5, font: "helvetica", valign: "top" },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 85, fillColor: [248, 250, 252] },
      1: { cellWidth: 205 },
      2: { cellWidth: 65, fontStyle: "bold" },
      3: { cellWidth: 85 },
      4: { cellWidth: 85 },
    },
    margin: tableMargin,
  });

  currentY = (doc as any).lastAutoTable.finalY + 16;

  // ==========================================
  // 6. REGISTROS E EVIDÊNCIAS FOTOGRÁFICAS
  // ==========================================
  const setoresComFotos = setores
    .map((s) => ({ setor: s, fotos: parseFotos(s.setor_fotos) }))
    .filter((item) => item.fotos.length > 0);

  if (setoresComFotos.length > 0) {
    const minPhotoHeightNeeded = 145;
    if (currentY + minPhotoHeightNeeded > 740) {
      doc.addPage();
      currentY = 40;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...accentColor);
    doc.text("6. REGISTROS E EVIDÊNCIAS FOTOGRÁFICAS DA VISTORIA", 35, currentY);
    currentY += 14;

    let photoX = 35;
    let photoY = currentY;
    const imgWidth = 160;
    const imgHeight = 104;
    const titleAreaHeight = 16;
    const itemTotalHeight = titleAreaHeight + imgHeight;
    const colSpacing = 12;
    const rowSpacing = 14;

    setoresComFotos.forEach((item) => {
      item.fotos.forEach((foto, idx) => {
        // Verifica quebra de página com folga adequada para cabeçalho + imagem
        if (photoY + itemTotalHeight > pageHeight - 45) {
          doc.addPage();
          photoX = 35;
          photoY = 40;
        }

        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);

        // Previne qualquer colisão com a imagem: o texto quebra em até 2 linhas e a imagem começa abaixo
        const rawLabel = `${item.setor.setor_nome || "Setor"} - Evidência ${idx + 1}`;
        const splitLines = doc.splitTextToSize(rawLabel, imgWidth);
        const linesToPrint = splitLines.slice(0, 2);
        doc.text(linesToPrint, photoX, photoY + 5.5, { maxWidth: imgWidth, lineHeightFactor: 1.15 });

        try {
          doc.addImage(foto.dataUrl, "JPEG", photoX, photoY + titleAreaHeight, imgWidth, imgHeight);
        } catch {
          doc.setDrawColor(203, 213, 225);
          doc.rect(photoX, photoY + titleAreaHeight, imgWidth, imgHeight);
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.text("Imagem não renderizada", photoX + 10, photoY + titleAreaHeight + 50);
        }

        photoX += imgWidth + colSpacing;
        if (photoX + imgWidth > pageWidth - 35) {
          photoX = 35;
          photoY += itemTotalHeight + rowSpacing;
        }
      });
    });

    // Atualiza a posição Y corrente para o final das fotos considerando se parou no meio de uma linha
    currentY = photoY + itemTotalHeight + 24;
  }

  // ==========================================
  // 7. TERMO DE ENCERRAMENTO E ASSINATURAS (SEMPRE NO FINAL, SEM SOBREPOSIÇÃO)
  // ==========================================
  const neededSignatureSpace = 160;
  if (currentY > pageHeight - neededSignatureSpace) {
    doc.addPage();
    currentY = 45;
  }

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("7. TERMO DE ENCERRAMENTO E VALIDAÇÃO DA VISTORIA TÉCNICA", 35, currentY);

  currentY += 12;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  const textoTermo =
    "Atestamos que os dados cadastrais, inventário de riscos ocupacionais, produtos químicos e condições ambientais descritos neste documento foram inspecionados 'in loco' com a anuência dos signatários abaixo.";
  doc.text(textoTermo, 35, currentY, { maxWidth: pageWidth - 70 });

  currentY += 24;

  const colWidth = (pageWidth - 90) / 2;
  const repX = 35;
  const tecX = 35 + colWidth + 20;

  const maxSigW = 120;
  const maxSigH = 34;

  // 1. Bloco Representante da Empresa
  const repNome = e.emp_ass_rep_nome || e.emp_responsavel || "Representante da Empresa";
  const repCargo = e.emp_ass_rep_cargo_cpf || e.emp_cargo_resp || "Representante / Acompanhante";

  if (e.emp_ass_rep_img) {
    try {
      // Centralizar a assinatura com proporção natural
      const sigOffset = (colWidth - maxSigW) / 2;
      doc.addImage(e.emp_ass_rep_img, "PNG", repX + sigOffset, currentY + 4, maxSigW, maxSigH);
    } catch {
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text("(Assinatura Digital Coletada)", repX + colWidth / 2, currentY + 24, { align: "center" });
    }
  }

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.75);
  doc.line(repX + 10, currentY + 42, repX + colWidth - 10, currentY + 42);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(repNome, repX + colWidth / 2, currentY + 52, { align: "center", maxWidth: colWidth - 10 });

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(repCargo, repX + colWidth / 2, currentY + 61, { align: "center", maxWidth: colWidth - 10 });

  // 2. Bloco Técnico / Vistoriador
  const tecNome = e.emp_ass_tec_nome || e.emp_consultoria_tecnico || e.emp_tecnico || "Técnico Vistoriador";
  const tecReg = e.emp_ass_tec_registro || e.emp_consultoria_registro || "Registro Profissional CREA / MTE";

  if (e.emp_ass_tec_img) {
    try {
      const sigOffset = (colWidth - maxSigW) / 2;
      doc.addImage(e.emp_ass_tec_img, "PNG", tecX + sigOffset, currentY + 4, maxSigW, maxSigH);
    } catch {
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text("(Assinatura Digital Coletada)", tecX + colWidth / 2, currentY + 24, { align: "center" });
    }
  }

  doc.line(tecX + 10, currentY + 42, tecX + colWidth - 10, currentY + 42);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(tecNome, tecX + colWidth / 2, currentY + 52, { align: "center", maxWidth: colWidth - 10 });

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(tecReg, tecX + colWidth / 2, currentY + 61, { align: "center", maxWidth: colWidth - 10 });

  // ==========================================
  // Rodapé Institucional com Paginação Precisa
  // ==========================================
  const pageCount = (doc as any).internal.getNumberOfPages();
  const consultoriaNome =
    e.emp_consultoria_razao || e.emp_consultoria || "SMSQ Consultoria e Engenharia de Segurança do Trabalho";

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pHeight = doc.internal.pageSize.getHeight();

    // Linha divisória sutil do rodapé
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(35, pHeight - 26, pageWidth - 35, pHeight - 26);

    // Texto do Rodapé
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(consultoriaNome, 35, pHeight - 14);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Relatório Técnico de Inspeção SST", pageWidth / 2, pHeight - 14, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 35, pHeight - 14, { align: "right" });
  }
}

/**
 * Monta a Avaliação Ergonômica Preliminar (AEP) - NR-17
 */
function montarEstruturaAEPPDF(doc: jsPDF, company: Company, aepOrId?: string | AepItem): void {
  const e = (company && company.empresa) || ({} as any);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const primaryColor: [number, number, number] = [49, 46, 129]; // #312e81 (Indigo 900)
  const secondaryColor: [number, number, number] = [79, 70, 229]; // #4f46e5 (Indigo 600)
  const accentColor: [number, number, number] = [30, 27, 75];
  const tableMargin = { left: 35, right: 35 };

  // Determinar AEPs a imprimir
  let aeps: AepItem[] = [];
  if (aepOrId && typeof aepOrId === "object") {
    aeps = [aepOrId];
  } else if (typeof aepOrId === "string") {
    aeps = (company?.aepAvaliacoes || []).filter((a) => a.id === aepOrId);
  } else {
    aeps = company?.aepAvaliacoes || [];
  }

  // ==========================================
  // Header Banner Oficial da AEP
  // ==========================================
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 58, "F");

  const aepLogo = e.emp_logo || e.emp_consultoria_logo;
  let aepTextMaxW = pageWidth - 70;

  if (aepLogo) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageWidth - 95, 6, 60, 46, 3, 3, "F");
      doc.addImage(aepLogo, "PNG", pageWidth - 92, 9, 54, 40, undefined, "FAST");
      aepTextMaxW = pageWidth - 140;
    } catch (err) {
      console.warn("Erro ao renderizar logo no PDF AEP:", err);
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.text("AVALIAÇÃO ERGONÔMICA PRELIMINAR (AEP) — NR-17", 35, 24, { maxWidth: aepTextMaxW });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Em conformidade com a NR-17 (Portaria MTP nº 423/2021) e NR-01 (GRO / PGR)",
    35,
    38,
    { maxWidth: aepTextMaxW }
  );
  doc.setFontSize(7);
  doc.text(
    `Empresa: ${e.emp_razao || e.emp_fantasia || "Não informada"} | CNPJ: ${e.emp_cnpj || "Não informado"}`,
    35,
    50,
    { maxWidth: aepTextMaxW }
  );

  // ==========================================
  // 1. IDENTIFICAÇÃO DA EMPRESA E AVALIADOR
  // ==========================================
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.text("1. IDENTIFICAÇÃO DA EMPRESA E RESPONSÁVEIS TÉCNICOS", 35, 78);

  const dadosGeraisRows = [
    [
      "Razão Social:",
      e.emp_razao || "Não informada",
      "Nome Fantasia:",
      e.emp_fantasia || "Não informado",
    ],
    [
      "CNPJ:",
      e.emp_cnpj || "Não informado",
      "Grau de Risco / CNAE:",
      `GR ${e.emp_grau_risco || "2"} | CNAE: ${e.emp_cnae || "Não inf."}`,
    ],
    [
      "Total de Trabalhadores:",
      e.emp_total_func ? `${e.emp_total_func} funcionários` : "Não informado",
      "Data do Levantamento:",
      e.emp_vistoria || new Date().toLocaleDateString("pt-BR"),
    ],
    [
      "Endereço da Unidade:",
      [e.emp_endereco, e.emp_bairro, e.emp_cidade, e.emp_uf].filter(Boolean).join(" - ") || "Não informado",
      "Consultoria SST:",
      e.emp_consultoria_razao || e.emp_consultoria || "SMSQ Consultoria e Engenharia",
    ],
    [
      "Responsável Legal:",
      `${e.emp_responsavel || "Diretoria"} (${e.emp_cargo_resp || "Representante"})`,
      "Avaliador / Ergonomista:",
      `${e.emp_consultoria_tecnico || e.emp_tecnico || "Técnico de Segurança / Ergonomista"}${e.emp_consultoria_registro ? ` (${e.emp_consultoria_registro})` : ""}`,
    ],
  ];

  autoTable(doc, {
    startY: 86,
    body: dadosGeraisRows as any,
    theme: "grid",
    styles: { fontSize: 7.5, cellPadding: 3.5, font: "helvetica", textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 105, fillColor: [243, 244, 246] },
      1: { cellWidth: 160 },
      2: { fontStyle: "bold", cellWidth: 105, fillColor: [243, 244, 246] },
      3: { cellWidth: 155 },
    },
    margin: tableMargin,
  });

  let currentY = (doc as any).lastAutoTable.finalY + 16;

  // Se não houver AEPs cadastradas
  if (aeps.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Nenhuma Avaliação Ergonômica Preliminar (AEP) registrada para esta empresa.", 35, currentY);
    currentY += 20;
  } else {
    // Para cada AEP registrada
    aeps.forEach((aep, idx) => {
      if (idx > 0 || currentY > 580) {
        doc.addPage();
        currentY = 45;
      }

      // Título da Seção do Posto
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...accentColor);
      doc.text(`2.${idx + 1}. AEP DO POSTO: ${aep.funcaoNome.toUpperCase()} (${aep.setorNome || "Setor Geral"})`, 35, currentY);
      currentY += 8;

      // Quadro 1: Dados do Posto e Atividades Reais
      const dadosPostoRows = [
        ["Função / Cargo:", aep.funcaoNome, "Setor / Local:", aep.setorNome || "Setor Geral"],
        ["Tipo de Posto:", aep.tipoPosto, "Data da Avaliação:", aep.dataAvaliacao || e.emp_vistoria || "Hoje"],
        ["Atividades Reais / Tarefas:", { content: aep.atividadesDescricao || "Rotinas operacionais e administrativas habituais.", colSpan: 3 }],
      ];

      autoTable(doc, {
        startY: currentY,
        body: dadosPostoRows as any,
        theme: "grid",
        styles: { fontSize: 7.5, cellPadding: 3, font: "helvetica" },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 90, fillColor: [238, 242, 255] },
          1: { cellWidth: 175 },
          2: { fontStyle: "bold", cellWidth: 90, fillColor: [238, 242, 255] },
          3: { cellWidth: 170 },
        },
        margin: tableMargin,
      });

      currentY = (doc as any).lastAutoTable.finalY + 12;

      // Quadro 2: Checklist dos 5 Domínios da NR-17
      const confLabel = (c: AepConformidade) => (c === "C" ? "Conforme (C)" : c === "NC" ? "Não Conforme (NC)" : "Não Aplicável (NA)");

      const checklistRows = [
        [
          "1. Organização do Trabalho (Item 17.4)",
          `Pausas Estruturadas: ${confLabel(aep.org_pausas)}\nAlternância Postural: ${confLabel(aep.org_alternancia)}\nRitmo/Metas Compatíveis: ${confLabel(aep.org_ritmo_metas)}\nHoras Extras Controladas: ${confLabel(aep.org_horas_extras)}`,
          aep.org_obs || "Condições organizacionais dentro dos parâmetros observados.",
        ],
        [
          "2. Movimentação de Cargas (Item 17.5)",
          `Peso e Frequência: ${confLabel(aep.cargas_peso_frequencia)}\nPega e Distância: ${confLabel(aep.cargas_pega_distancia)}\nMeios Mecânicos: ${confLabel(aep.cargas_meios_mecanicos)}`,
          aep.cargas_obs || "Limites biomecânicos e equipamentos de transporte.",
        ],
        [
          "3. Mobiliário do Posto (Item 17.6)",
          `Cadeira Regulável: ${confLabel(aep.mob_cadeira_ajustavel)}\nMesa e Espaço Pernas: ${confLabel(aep.mob_mesa_espaco)}\nApoio de Pés: ${confLabel(aep.mob_apoio_pes)}\nMonitor na Linha Visual: ${confLabel(aep.mob_monitor_visao)}`,
          aep.mob_obs || "Ajustabilidade e dimensionamento do mobiliário.",
        ],
        [
          "4. Máquinas e Ferramentas (Item 17.7)",
          `Empunhadura Anatômica: ${confLabel(aep.maq_empunhadura)}\nEsforço de Acionamento: ${confLabel(aep.maq_esforco_acionamento)}\nVibração e Impacto: ${confLabel(aep.maq_vibracao)}`,
          aep.maq_obs || "Ferramentas com design ergonômico.",
        ],
        [
          "5. Conforto Ambiental (Item 17.8)",
          `Ruído de Conforto: ${confLabel(aep.amb_ruido)}\nTemperatura (20°C a 25°C): ${confLabel(aep.amb_temperatura)}\nIluminância no Campo: ${confLabel(aep.amb_iluminancia)}`,
          aep.amb_obs || "Níveis ambientais conformes às normas de conforto.",
        ],
      ];

      autoTable(doc, {
        startY: currentY,
        head: [["Domínio da NR-17", "Parâmetros Avaliados (C / NC / NA)", "Constatações Técnicas & Observações"]],
        body: checklistRows,
        theme: "grid",
        headStyles: { fillColor: primaryColor, fontSize: 8, fontStyle: "bold" },
        styles: { fontSize: 7, cellPadding: 3.5, font: "helvetica", valign: "top" },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 125, fillColor: [248, 250, 252] },
          1: { cellWidth: 165 },
          2: { cellWidth: 235 },
        },
        margin: tableMargin,
      });

      currentY = (doc as any).lastAutoTable.finalY + 12;

      // Quadro 3: Triagem de Risco e AET
      if (currentY > 620) {
        doc.addPage();
        currentY = 45;
      }

      const triagemRows = [
        [
          "Classificação do Risco (GRO/PGR):",
          aep.classificacaoRisco || "Baixo / Situação Conforme",
          "Necessidade de AET (Item 17.3.2):",
          aep.necessidadeAET ? "SIM — Realizar Análise Ergonômica do Trabalho" : "NÃO — AEP Suficiente para o PGR",
        ],
        [
          "Justificativa Técnica da Triagem:",
          { content: aep.justificativaAET || "Posto com condições biomecânicas e ambientais controladas pelas medidas preventivas da AEP.", colSpan: 3 },
        ],
      ];

      autoTable(doc, {
        startY: currentY,
        body: triagemRows as any,
        theme: "grid",
        styles: { fontSize: 7.5, cellPadding: 3.5, font: "helvetica" },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 120, fillColor: [238, 242, 255] },
          1: { cellWidth: 145, fontStyle: "bold" },
          2: { fontStyle: "bold", cellWidth: 120, fillColor: [238, 242, 255] },
          3: { cellWidth: 140, fontStyle: "bold" },
        },
        margin: tableMargin,
      });

      currentY = (doc as any).lastAutoTable.finalY + 12;

      // Quadro 4: Recomendações e Plano de Ação Ergonômico (tabela de 2 colunas)
      const recomendacoesText = aep.recomendacoes && aep.recomendacoes.length > 0
        ? aep.recomendacoes.map((r, i) => `${i + 1}. ${r}`).join("\n")
        : "Manter as condições atuais de trabalho e realizar treinamentos de conscientização postural.";

      const planoRows = [
        ["Recomendações e Medidas de Adequação Ergonômica (Plano de Ação):", recomendacoesText],
        ["Parecer Técnico Conclusivo:", aep.parecerTecnico || "A situação de trabalho atende aos preceitos da NR-17."],
      ];

      autoTable(doc, {
        startY: currentY,
        body: planoRows as any,
        theme: "grid",
        styles: { fontSize: 7.5, cellPadding: 3.5, font: "helvetica", valign: "top" },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 140, fillColor: [248, 250, 252] },
          1: { cellWidth: 385 },
        },
        margin: tableMargin,
      });

      currentY = (doc as any).lastAutoTable.finalY + 14;

      // Quadro 5: Fotos da AEP (se houver)
      const fotosAep = aep.fotos || [];
      if (fotosAep.length > 0) {
        if (currentY + 130 > 720) {
          doc.addPage();
          currentY = 45;
        }

        doc.setFontSize(9.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...accentColor);
        doc.text(`Evidências Fotográficas do Posto — ${aep.funcaoNome}`, 35, currentY);
        currentY += 10;

        let pX = 35;
        let pY = currentY;
        const imgW = 155;
        const imgH = 100;

        fotosAep.forEach((foto, fIdx) => {
          if (pY + imgH + 24 > 760) {
            doc.addPage();
            pY = 45;
            pX = 35;
          }

          try {
            const format = foto.dataUrl && foto.dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
            doc.addImage(foto.dataUrl, format, pX, pY, imgW, imgH);
            doc.setFontSize(6.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(50, 50, 50);
            doc.text(foto.legenda || `Foto ${fIdx + 1}: Postura e posto de trabalho`, pX, pY + imgH + 8, { maxWidth: imgW });
          } catch {
            doc.setDrawColor(203, 213, 225);
            doc.rect(pX, pY, imgW, imgH);
            doc.setFontSize(7);
            doc.setTextColor(148, 163, 184);
            doc.text("Foto anexada à avaliação", pX + 10, pY + 50);
          }

          pX += imgW + 15;
          if (pX + imgW > pageWidth - 35) {
            pX = 35;
            pY += imgH + 22;
          }
        });

        currentY = pY + imgH + 24;
      }
    });
  }

  // ==========================================
  // BLOCO DE ASSINATURAS DA AEP
  // ==========================================
  if (currentY + 80 > 750) {
    doc.addPage();
    currentY = 45;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentColor);
  doc.text("RESPONSÁVEIS PELA ELABORAÇÃO E VALIDAÇÃO DA AEP", 35, currentY);
  currentY += 14;

  const colWidth = (pageWidth - 70 - 20) / 2;
  const repX = 35;
  const tecX = 35 + colWidth + 20;

  // 1. Representante Empresa
  const repNome = e.emp_ass_rep_nome || e.emp_responsavel || "Representante Legal da Empresa";
  const repCargo = e.emp_ass_rep_cargo_cpf || e.emp_cargo_resp || "Diretoria / Gestão";

  if (e.emp_ass_rep_img) {
    try {
      doc.addImage(e.emp_ass_rep_img, "PNG", repX + (colWidth - 110) / 2, currentY, 110, 32);
    } catch {}
  }
  doc.setDrawColor(148, 163, 184);
  doc.line(repX + 10, currentY + 36, repX + colWidth - 10, currentY + 36);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(repNome, repX + colWidth / 2, currentY + 46, { align: "center", maxWidth: colWidth - 10 });
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(repCargo, repX + colWidth / 2, currentY + 54, { align: "center" });

  // 2. Técnico / Ergonomista
  const tecNome = e.emp_ass_tec_nome || e.emp_consultoria_tecnico || e.emp_tecnico || "Técnico / Ergonomista";
  const tecReg = e.emp_ass_tec_registro || e.emp_consultoria_registro || "Registro Profissional MTE / CREA";

  if (e.emp_ass_tec_img) {
    try {
      doc.addImage(e.emp_ass_tec_img, "PNG", tecX + (colWidth - 110) / 2, currentY, 110, 32);
    } catch {}
  }
  doc.line(tecX + 10, currentY + 36, tecX + colWidth - 10, currentY + 36);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(tecNome, tecX + colWidth / 2, currentY + 46, { align: "center", maxWidth: colWidth - 10 });
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(tecReg, tecX + colWidth / 2, currentY + 54, { align: "center" });

  // Rodapé institucional com paginação
  const pageCount = (doc as any).internal.getNumberOfPages();
  const consultoriaNome =
    e.emp_consultoria_razao || e.emp_consultoria || "SMSQ Consultoria e Engenharia de Segurança do Trabalho";

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(35, pHeight - 26, pageWidth - 35, pHeight - 26);

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(consultoriaNome, 35, pHeight - 14);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Avaliação Ergonômica Preliminar (AEP) — NR-17", pageWidth / 2, pHeight - 14, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 35, pHeight - 14, { align: "right" });
  }
}

// =========================================================================
// GERADOR DO LAUDO TÉCNICO PERICIAL DE PERICULOSIDADE (NR-16 / ART. 193 CLT)
// =========================================================================
export function gerarPDFLaudoPericulosidade(company: Company, nr16ItemEspecifico?: Nr16AvaliacaoItem): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const e = company.empresa || {};
  const accentColor: [number, number, number] = [185, 28, 28]; // Vermelho periculosidade #B91C1C
  const tableMargin = { left: 35, right: 35 };

  const avaliacoes: Nr16AvaliacaoItem[] = nr16ItemEspecifico
    ? [nr16ItemEspecifico]
    : company.nr16Avaliacoes && company.nr16Avaliacoes.length > 0
    ? company.nr16Avaliacoes
    : [];

  // ==========================================
  // CABEÇALHO DA PRIMEIRA PÁGINA
  // ==========================================
  let currentY = 32;

  // Logo da consultoria ou da empresa se houver
  const nr16Logo = e.emp_logo || e.emp_consultoria_logo;
  if (nr16Logo) {
    try {
      doc.addImage(nr16Logo, "PNG", 35, currentY, 110, 36, undefined, "FAST");
    } catch {}
  }

  // Título e Subtítulo do Laudo
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentColor);
  doc.text("LAUDO TÉCNICO DE PERICULOSIDADE", pageWidth - 35, currentY + 12, { align: "right" });

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("AVALIAÇÃO NORMATIVA — NR-16 / ART. 193 DA CLT", pageWidth - 35, currentY + 24, { align: "right" });

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Emissão: ${new Date().toLocaleDateString("pt-BR")} | Vistoria: ${e.emp_vistoria || "In Loco"}`,
    pageWidth - 35,
    currentY + 34,
    { align: "right" }
  );

  currentY += 46;

  // Linha divisória de topo
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(1.5);
  doc.line(35, currentY, pageWidth - 35, currentY);
  currentY += 12;

  // ==========================================
  // 1. IDENTIFICAÇÃO DA EMPRESA E RESPONSÁVEL
  // ==========================================
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentColor);
  doc.text("1. IDENTIFICAÇÃO DO ESTABELECIMENTO E RESPONSABILIDADE TÉCNICA", 35, currentY);
  currentY += 8;

  const empresaRows = [
    [
      "Razão Social:",
      e.emp_razao || "Não informada",
      "Nome Fantasia:",
      e.emp_fantasia || "-",
    ],
    [
      "CNPJ:",
      e.emp_cnpj || "Não informado",
      "CNAE Principal:",
      `${e.emp_cnae || "-"} — ${e.emp_cnae_desc || "-"}`,
    ],
    [
      "Grau de Risco:",
      e.emp_grau_risco ? `Grau ${e.emp_grau_risco} (NR-04)` : "Não informado",
      "Total Trabalhadores:",
      e.emp_total_func ? `${e.emp_total_func} colaboradores` : "-",
    ],
    [
      "Endereço / Unidade:",
      `${e.emp_endereco || ""} ${e.emp_bairro || ""} ${e.emp_cidade || ""}-${e.emp_uf || ""}`,
      "Responsável Empresa:",
      e.emp_responsavel || "-",
    ],
    [
      "Consultoria / SESMT:",
      e.emp_consultoria_razao || e.emp_consultoria || "SMSQ Consultoria e Engenharia",
      "Responsável Técnico:",
      `${e.emp_consultoria_tecnico || e.emp_tecnico || "Técnico / Engenheiro de Segurança"} (${e.emp_consultoria_registro || e.emp_ass_tec_registro || "MTE / CREA"})`,
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    body: empresaRows,
    theme: "grid",
    styles: { fontSize: 7.5, cellPadding: 3.5, font: "helvetica" },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 105, fillColor: [254, 242, 242] },
      1: { cellWidth: 155 },
      2: { fontStyle: "bold", cellWidth: 105, fillColor: [254, 242, 242] },
      3: { cellWidth: 160 },
    },
    margin: tableMargin,
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // ==========================================
  // 2. OBJETIVO, METODOLOGIA E BASE LEGAL
  // ==========================================
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentColor);
  doc.text("2. OBJETIVO, BASE NORMATIVA E METODOLOGIA PERICIAL", 35, currentY);
  currentY += 8;

  const metodologiaRows = [
    [
      "Objetivo do Laudo:",
      "Avaliar tecnicamente as condições de trabalho e as atividades exercidas pelos empregados para caracterização ou descaracterização do direito à percepção do Adicional de Periculosidade de 30% (trinta por cento) sobre o salário-base, nos termos da legislação trabalhista federal.",
    ],
    [
      "Embasamento Legal e Normativo:",
      "• Consolidação das Leis do Trabalho (CLT) — Artigos 193 a 197;\n• Portaria MTP nº 3.214/1978 — Norma Regulamentadora nº 16 (Atividades e Operações Perigosas) e seus Anexos 1 a 5 e Radiações Ionizantes;\n• Portaria MTE nº 1.357/2019 (Regulamentação de limites de isenção de recipientes e tanques de combustível);\n• Portaria MTE nº 1.078/2014 (Anexo 4 - Energia Elétrica) e NR-10;\n• Portaria MTE nº 1.565/2014 (Anexo 5 - Motocicleta) e Art. 193, § 4º da CLT;\n• Súmula nº 364 do Tribunal Superior do Trabalho (TST) referente ao tempo de exposição habitual, intermitente e fortuito.",
    ],
    [
      "Metodologia Aplicada:",
      "Inspeção técnica pericial 'in loco', análise descritiva dos postos de trabalho e processos operacionais, entrevistas com trabalhadores e gestores, verificação de estoques e recipientes de inflamáveis/gases, medição de distâncias de segurança e delimitação topográfica das Áreas de Risco normativas.",
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    body: metodologiaRows,
    theme: "grid",
    styles: { fontSize: 7.5, cellPadding: 3.5, font: "helvetica", valign: "top" },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 125, fillColor: [254, 242, 242] },
      1: { cellWidth: 400 },
    },
    margin: tableMargin,
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // ==========================================
  // 3. QUADRO RESUMO GERAL DE ENQUADRAMENTO
  // ==========================================
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentColor);
  doc.text("3. QUADRO RESUMO DE ENQUADRAMENTO DA PERICULOSIDADE", 35, currentY);
  currentY += 8;

  const funcoesEmpresa = company.funcoes || [];
  const resumoRows: any[] = [];

  funcoesEmpresa.forEach((func, idx) => {
    const av = avaliacoes.find((a) => a.funcaoId === func.id || a.funcaoNome.toLowerCase() === func.func_nome.toLowerCase());
    const statusText = av ? av.resultadoGlobal : "Não Avaliado Formalmente";
    const anexosText = av && av.anexosCaracterizados && av.anexosCaracterizados.length > 0
      ? av.anexosCaracterizados.join(", ")
      : av?.resultadoGlobal === "Isenção Normativa"
      ? "Isenção (Portaria 1.357/19)"
      : "Nenhum Anexo";

    const adicional = av?.resultadoGlobal.includes("30%") ? "SIM (30%)" : "NÃO";

    resumoRows.push([
      (idx + 1).toString(),
      func.func_nome,
      func.func_setor || "Geral",
      func.func_qtd || "1",
      anexosText,
      statusText,
      adicional,
    ]);
  });

  if (resumoRows.length === 0) {
    resumoRows.push(["1", "Nenhuma função cadastrada", "-", "-", "-", "Sem dados", "NÃO"]);
  }

  autoTable(doc, {
    startY: currentY,
    head: [["Item", "Função / Cargo", "Setor", "Efetivo", "Anexos NR-16 Aplicáveis", "Resultado Técnico", "Adicional 30%"]],
    body: resumoRows,
    theme: "grid",
    headStyles: { fillColor: [...accentColor], textColor: 255, fontStyle: "bold", fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 3, font: "helvetica", valign: "middle" },
    columnStyles: {
      0: { cellWidth: 25, halign: "center" },
      1: { cellWidth: 105, fontStyle: "bold" },
      2: { cellWidth: 75 },
      3: { cellWidth: 40, halign: "center" },
      4: { cellWidth: 120 },
      5: { cellWidth: 105 },
      6: { cellWidth: 55, halign: "center", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 6) {
        if (data.cell.raw === "SIM (30%)") {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fillColor = [254, 226, 226];
        } else {
          data.cell.styles.textColor = [21, 128, 61];
          data.cell.styles.fillColor = [240, 253, 244];
        }
      }
    },
    margin: tableMargin,
  });

  currentY = (doc as any).lastAutoTable.finalY + 16;

  // ==========================================
  // 4. ANÁLISE PORMENORIZADA DE CADA FUNÇÃO
  // ==========================================
  if (avaliacoes.length > 0) {
    avaliacoes.forEach((av, avIdx) => {
      if (currentY + 180 > 750) {
        doc.addPage();
        currentY = 45;
      }

      // Cabeçalho da Função
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(35, currentY, pageWidth - 70, 24, 4, 4, "FD");

      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...accentColor);
      doc.text(
        `4.${avIdx + 1} ANÁLISE TÉCNICA: ${av.funcaoNome.toUpperCase()} ${av.setorNome ? `(${av.setorNome})` : ""}`,
        42,
        currentY + 16
      );
      currentY += 30;

      // Descrição das Atividades
      const funcRows = [
        ["Atividades Exercidas:", av.atividadesExecutadas || "Conforme descrição de cargo."],
        ["Resultado da Avaliação:", av.resultadoGlobal],
        ["Base Legal Aplicada:", av.baseLegal || "Art. 193 da CLT / NR-16"],
      ];

      autoTable(doc, {
        startY: currentY,
        body: funcRows,
        theme: "grid",
        styles: { fontSize: 7.5, cellPadding: 3, font: "helvetica", valign: "top" },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 120, fillColor: [254, 242, 242] },
          1: { cellWidth: 405 },
        },
        margin: tableMargin,
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;

      // Anexos da NR-16 avaliados para esta função
      const anexosRows: any[] = [];
      const anxKeys = Object.keys(av.anexos || {});

      anxKeys.forEach((k) => {
        const ax = av.anexos[k];
        if (ax) {
          const statusBadge = ax.enquadrado
            ? "ENQUADRADO (PERICULOSO)"
            : ax.status === "Isenção Normativa"
            ? "ISENTO (PORTARIA)"
            : "NÃO ENQUADRADO";

          anexosRows.push([
            ax.anexoNome,
            ax.itemEspecifico || "-",
            ax.areaRisco || "Não aplicável",
            ax.tempoExposicao || "Não exposto",
            statusBadge,
          ]);
        }
      });

      if (anexosRows.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [["Anexo da NR-16", "Item Normativo", "Área de Risco", "Exposição", "Parecer"]],
          body: anexosRows,
          theme: "grid",
          headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: "bold", fontSize: 7 },
          styles: { fontSize: 6.8, cellPadding: 3, font: "helvetica" },
          columnStyles: {
            0: { cellWidth: 110, fontStyle: "bold" },
            1: { cellWidth: 130 },
            2: { cellWidth: 140 },
            3: { cellWidth: 70 },
            4: { cellWidth: 75, fontStyle: "bold", halign: "center" },
          },
          didParseCell: (data) => {
            if (data.section === "body" && data.column.index === 4) {
              if (data.cell.raw === "ENQUADRADO (PERICULOSO)") {
                data.cell.styles.textColor = [185, 28, 28];
                data.cell.styles.fillColor = [254, 226, 226];
              } else if (data.cell.raw === "ISENTO (PORTARIA)") {
                data.cell.styles.textColor = [30, 64, 175];
                data.cell.styles.fillColor = [239, 246, 255];
              } else {
                data.cell.styles.textColor = [71, 85, 105];
              }
            }
          },
          margin: tableMargin,
        });

        currentY = (doc as any).lastAutoTable.finalY + 8;
      }

      // Parecer Conclusivo e Recomendações
      const conclusaoRows = [
        ["Parecer Técnico Conclusivo:", av.parecerTecnicoConclusivo],
        [
          "Medidas e Recomendações de SST:",
          av.recomendacoesSST && av.recomendacoesSST.length > 0
            ? av.recomendacoesSST.map((r, i) => `${i + 1}. ${r}`).join("\n")
            : "Manter as condições regulares de trabalho e cumprimento das NRs.",
        ],
      ];

      autoTable(doc, {
        startY: currentY,
        body: conclusaoRows,
        theme: "grid",
        styles: { fontSize: 7.5, cellPadding: 3.5, font: "helvetica", valign: "top" },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 120, fillColor: [248, 250, 252] },
          1: { cellWidth: 405 },
        },
        margin: tableMargin,
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;

      // Fotos da avaliação de periculosidade (se houver)
      const fotosNr16 = av.fotos || [];
      if (fotosNr16.length > 0) {
        if (currentY + 130 > 720) {
          doc.addPage();
          currentY = 45;
        }

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...accentColor);
        doc.text(`Evidências Fotográficas — ${av.funcaoNome}`, 35, currentY);
        currentY += 8;

        let pX = 35;
        let pY = currentY;
        const imgW = 155;
        const imgH = 100;

        fotosNr16.forEach((foto, fIdx) => {
          if (pY + imgH + 24 > 760) {
            doc.addPage();
            pY = 45;
            pX = 35;
          }

          try {
            const format = foto.dataUrl && foto.dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
            doc.addImage(foto.dataUrl, format, pX, pY, imgW, imgH);
            doc.setFontSize(6.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(50, 50, 50);
            doc.text(foto.legenda || `Evidência ${fIdx + 1}: Posto de trabalho / Área de risco`, pX, pY + imgH + 8, { maxWidth: imgW });
          } catch {
            doc.setDrawColor(203, 213, 225);
            doc.rect(pX, pY, imgW, imgH);
            doc.setFontSize(7);
            doc.setTextColor(148, 163, 184);
            doc.text("Foto anexada à avaliação", pX + 10, pY + 50);
          }

          pX += imgW + 15;
          if (pX + imgW > pageWidth - 35) {
            pX = 35;
            pY += imgH + 22;
          }
        });

        currentY = pY + imgH + 20;
      }
    });
  }

  // ==========================================
  // BLOCO DE ASSINATURAS E ENCERRAMENTO
  // ==========================================
  if (currentY + 90 > 750) {
    doc.addPage();
    currentY = 45;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentColor);
  doc.text("5. ENCERRAMENTO E RESPONSÁVEIS PELA EMISSÃO DO LAUDO", 35, currentY);
  currentY += 14;

  const colWidth = (pageWidth - 70 - 20) / 2;
  const repX = 35;
  const tecX = 35 + colWidth + 20;

  // 1. Representante Legal
  const repNome = e.emp_ass_rep_nome || e.emp_responsavel || "Representante Legal da Empresa";
  const repCargo = e.emp_ass_rep_cargo_cpf || e.emp_cargo_resp || "Diretoria / Gestão";

  if (e.emp_ass_rep_img) {
    try {
      doc.addImage(e.emp_ass_rep_img, "PNG", repX + (colWidth - 110) / 2, currentY, 110, 32);
    } catch {}
  }
  doc.setDrawColor(148, 163, 184);
  doc.line(repX + 10, currentY + 36, repX + colWidth - 10, currentY + 36);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(repNome, repX + colWidth / 2, currentY + 46, { align: "center", maxWidth: colWidth - 10 });
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(repCargo, repX + colWidth / 2, currentY + 54, { align: "center" });

  // 2. Responsável Técnico SST
  const tecNome = e.emp_ass_tec_nome || e.emp_consultoria_tecnico || e.emp_tecnico || "Técnico / Engenheiro de Segurança do Trabalho";
  const tecReg = e.emp_ass_tec_registro || e.emp_consultoria_registro || "Registro Profissional MTE / CREA";

  if (e.emp_ass_tec_img) {
    try {
      doc.addImage(e.emp_ass_tec_img, "PNG", tecX + (colWidth - 110) / 2, currentY, 110, 32);
    } catch {}
  }
  doc.line(tecX + 10, currentY + 36, tecX + colWidth - 10, currentY + 36);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(tecNome, tecX + colWidth / 2, currentY + 46, { align: "center", maxWidth: colWidth - 10 });
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(tecReg, tecX + colWidth / 2, currentY + 54, { align: "center" });

  // Rodapé institucional com paginação
  const pageCount = (doc as any).internal.getNumberOfPages();
  const consultoriaNome =
    e.emp_consultoria_razao || e.emp_consultoria || "SMSQ Consultoria e Engenharia de Segurança do Trabalho";

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(35, pHeight - 26, pageWidth - 35, pHeight - 26);

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(consultoriaNome, 35, pHeight - 14);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Laudo Técnico Pericial de Periculosidade — NR-16 / Art. 193 CLT", pageWidth / 2, pHeight - 14, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 35, pHeight - 14, { align: "right" });
  }

  const nomeEmpresa = (company.empresa.emp_razao || company.empresa.emp_fantasia || "empresa")
    .replace(/[^\w\d-_]+/g, "_")
    .slice(0, 40);
  doc.save(`Laudo_Periculosidade_NR16_${nomeEmpresa}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * GERAÇÃO DE RELATÓRIO DO PLANO DE AÇÃO CONSOLIDADO (5W2H / NR-01 GRO-PGR)
 */
export async function gerarPDFPlanoAcao5W2H(company: Company, itensParam?: PlanoAcaoItem[]): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const e = company.empresa;
  const primaryColor: [number, number, number] = [30, 58, 138];
  const accentColor: [number, number, number] = [15, 23, 42];

  const itens = itensParam && itensParam.length > 0
    ? itensParam
    : company.planoAcaoGlobal && company.planoAcaoGlobal.length > 0
    ? company.planoAcaoGlobal
    : [];

  let currentY = 35;

  // Header
  doc.setFillColor(30, 58, 138);
  doc.rect(30, currentY, pageWidth - 60, 48, "F");

  const p5w2hLogo = e.emp_logo || e.emp_consultoria_logo;
  if (p5w2hLogo) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageWidth - 95, currentY + 5, 55, 38, 2, 2, "F");
      doc.addImage(p5w2hLogo, "PNG", pageWidth - 92, currentY + 7, 49, 34, undefined, "FAST");
    } catch {}
  }

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("PLANO DE AÇÃO CONSOLIDADO — METODOLOGIA 5W2H (NR-01 GRO / PGR)", 45, currentY + 20);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(224, 231, 255);
  doc.text(`Empresa: ${e.emp_razao || "Empresa"} | CNPJ: ${e.emp_cnpj || "Não inf."} | Data da Emissão: ${new Date().toLocaleDateString("pt-BR")}`, 45, currentY + 36);

  currentY += 60;

  // Resumo de Métricas
  const total = itens.length;
  const concluidos = itens.filter((i) => i.status === "Concluído").length;
  const emAndamento = itens.filter((i) => i.status === "Em Andamento").length;
  const pendentes = itens.filter((i) => !i.status || i.status === "Pendente").length;
  const criticas = itens.filter((i) => i.prioridade === "Crítica / Imediata" || i.prioridade === "Alta").length;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(30, currentY, pageWidth - 60, 32, 4, 4, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(`Total de Ações: ${total}`, 45, currentY + 19);
  doc.setTextColor(185, 28, 28);
  doc.text(`Críticas / Altas: ${criticas}`, 160, currentY + 19);
  doc.setTextColor(180, 83, 9);
  doc.text(`Em Andamento: ${emAndamento}`, 290, currentY + 19);
  doc.setTextColor(100, 116, 139);
  doc.text(`Pendentes: ${pendentes}`, 430, currentY + 19);
  doc.setTextColor(21, 128, 61);
  doc.text(`Concluídas: ${concluidos} (${total > 0 ? Math.round((concluidos / total) * 100) : 0}%)`, 540, currentY + 19);

  currentY += 42;

  // Tabela 5W2H
  const rows = itens.map((item, idx) => {
    return [
      `#${idx + 1}\n${item.nrReferencia || "NR-01"}`,
      item.item,
      item.porQueFazer || `Mitigação de riscos conforme ${item.nrReferencia || "NR-01"}`,
      item.ondeLocal || "Geral",
      item.responsavel || "SESMT / Manutenção",
      item.prazo + (item.dataSugerida ? `\n(${item.dataSugerida})` : ""),
      item.comoFazer || "Procedimento técnico e registro fotográfico.",
      item.indicadorEficacia || "Inspeção e evidência de conclusão no PGR.",
      item.prioridade || "Alta",
      item.status || "Pendente",
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        "NR / Item",
        "O Que Fazer (What)",
        "Por Que (Why)",
        "Onde (Where)",
        "Quem (Who)",
        "Quando (When)",
        "Como Fazer (How)",
        "Eficácia (How Check)",
        "Prioridade",
        "Status",
      ],
    ],
    body: rows.length > 0 ? rows : [["NR-01", "Elaborar inventário de riscos no PGR", "Cumprimento legal", "Geral", "SESMT", "30 dias", "Mapeamento em campo", "Relatório emitido", "Alta", "Pendente"]],
    theme: "grid",
    headStyles: { fillColor: [30, 58, 138], fontSize: 7.5, fontStyle: "bold", halign: "center", valign: "middle" },
    styles: { fontSize: 6.5, cellPadding: 3, font: "helvetica", valign: "top" },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: "bold", halign: "center", fillColor: [248, 250, 252] },
      1: { cellWidth: 120, fontStyle: "bold" },
      2: { cellWidth: 105 },
      3: { cellWidth: 70 },
      4: { cellWidth: 70 },
      5: { cellWidth: 55, halign: "center" },
      6: { cellWidth: 110 },
      7: { cellWidth: 95 },
      8: { cellWidth: 50, halign: "center", fontStyle: "bold" },
      9: { cellWidth: 55, halign: "center", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 9) {
        const val = String(data.cell.raw);
        if (val === "Concluído") {
          data.cell.styles.fillColor = [220, 252, 231];
          data.cell.styles.textColor = [22, 101, 52];
        } else if (val === "Em Andamento") {
          data.cell.styles.fillColor = [224, 242, 254];
          data.cell.styles.textColor = [3, 105, 161];
        } else {
          data.cell.styles.fillColor = [254, 243, 199];
          data.cell.styles.textColor = [146, 64, 14];
        }
      }
      if (data.section === "body" && data.column.index === 8) {
        const val = String(data.cell.raw);
        if (val.includes("Crítica")) {
          data.cell.styles.textColor = [185, 28, 28];
        } else if (val.includes("Alta")) {
          data.cell.styles.textColor = [194, 65, 12];
        }
      }
    },
    margin: { left: 30, right: 30 },
  });

  // Rodapé em todas as páginas
  const pageCount = (doc as any).internal.getNumberOfPages();
  const consultoriaNome =
    e.emp_consultoria_razao || e.emp_consultoria || "SMSQ Consultoria e Engenharia de Segurança do Trabalho";

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(30, pageHeight - 22, pageWidth - 30, pageHeight - 22);

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(consultoriaNome, 30, pageHeight - 11);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Plano de Ação 5W2H do PGR — NR-01 (Portaria MTP 6.730 / NR-01 a NR-38)", pageWidth / 2, pageHeight - 11, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 30, pageHeight - 11, { align: "right" });
  }

  const nomeEmpresa = (company.empresa.emp_razao || company.empresa.emp_fantasia || "empresa")
    .replace(/[^\w\d-_]+/g, "_")
    .slice(0, 40);
  doc.save(`Plano_de_Acao_5W2H_${nomeEmpresa}_${new Date().toISOString().slice(0, 10)}.pdf`);
}



