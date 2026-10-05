import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Company, FuncaoData, SetorData, AvaliacaoRiscoItem } from "../types";
import { RISKS_CATALOG } from "../data/risksCatalog";

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length === 6) {
    const num = parseInt(cleanHex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  return [30, 41, 59];
}

export function generateLtcatPdf(company: Company, selectedFuncaoId?: string): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  const emp = company.empresa || {};
  const funcoesToRender = selectedFuncaoId
    ? company.funcoes.filter((f) => f.id === selectedFuncaoId)
    : company.funcoes;

  const primaryColor: [number, number, number] = [30, 58, 138]; // Blue 900
  const secondaryColor: [number, number, number] = [71, 85, 105]; // Slate 600

  // Header & Footer Helper
  const addHeaderFooter = (pageNumber: number, totalPages: number) => {
    // Top Bar
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("LTCAT - LAUDO TÉCNICO DAS CONDIÇÕES AMBIENTAIS DO TRABALHO", margin, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Decreto 3.048/99 • IN INSS/PRES nº 128/2022", pageWidth - margin - 190, 18);

    // Bottom Bar
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${emp.emp_razao || "Empresa"} • CNPJ: ${emp.emp_cnpj || "N/I"}`,
      margin,
      pageHeight - 16
    );
    doc.text(
      `Página ${pageNumber} de ${totalPages}`,
      pageWidth - margin - 60,
      pageHeight - 16
    );
  };

  // ================= PAGE 1: CAPA TÉCNICA OFICIAL =================
  // Background styling
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Top header banner
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, pageWidth, 120, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("LTCAT", margin, 55);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("LAUDO TÉCNICO DAS CONDIÇÕES AMBIENTAIS DO TRABALHO", margin, 75);
  doc.setFontSize(8.5);
  doc.setTextColor(224, 231, 255);
  doc.text("Conforme Art. 58 da Lei nº 8.213/91, Decreto Federal nº 3.048/99 e IN INSS/PRES nº 128/2022", margin, 92);

  // Logo da consultoria ou da empresa
  if (emp.emp_consultoria_logo || emp.emp_logo) {
    try {
      const logo = emp.emp_consultoria_logo || emp.emp_logo;
      doc.addImage(logo!, "JPEG", pageWidth - margin - 90, 25, 90, 50, undefined, "FAST");
    } catch {
      // fallback
    }
  }

  // Box: Identificação do Estabelecimento
  let y = 145;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 190, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text("1. IDENTIFICAÇÃO DO ESTABELECIMENTO / EMPRESA", margin + 14, y + 22);

  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 14, y + 30, pageWidth - margin - 14, y + 30);

  const empRows = [
    [
      { text: "Razão Social:", bold: true },
      { text: emp.emp_razao || "Não informada", bold: false },
      { text: "Nome Fantasia:", bold: true },
      { text: emp.emp_fantasia || "Não informado", bold: false },
    ],
    [
      { text: "CNPJ:", bold: true },
      { text: emp.emp_cnpj || "Não informado", bold: false },
      { text: "CNAE / Grau Risco:", bold: true },
      { text: `${emp.emp_cnae || "N/I"} - Grau de Risco ${emp.emp_grau_risco || "N/I"}`, bold: false },
    ],
    [
      { text: "Atividade Principal:", bold: true },
      { text: emp.emp_cnae_desc || "Conforme cadastro CNAE", bold: false },
      { text: "Nº Empregados:", bold: true },
      { text: `${emp.emp_total_func || "Não informado"} colaboradores`, bold: false },
    ],
    [
      { text: "Endereço:", bold: true },
      {
        text: `${emp.emp_endereco || ""} ${emp.emp_bairro ? "- " + emp.emp_bairro : ""} - ${emp.emp_cidade || ""}/${emp.emp_uf || ""} - CEP: ${emp.emp_cep || ""}`,
        bold: false,
      },
      { text: "Data da Vistoria:", bold: true },
      { text: emp.emp_vistoria ? emp.emp_vistoria.split("-").reverse().join("/") : new Date().toLocaleDateString("pt-BR"), bold: false },
    ],
  ];

  let empY = y + 48;
  empRows.forEach((row) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text(row[0].text, margin + 14, empY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(doc.splitTextToSize(row[1].text, 180), margin + 80, empY);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text(row[2].text, margin + 280, empY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(doc.splitTextToSize(row[3].text, 160), margin + 375, empY);
    empY += 32;
  });

  // Box: Responsável Técnico & Emissão
  y = 350;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 120, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text("2. RESPONSABILIDADE TÉCNICA PELA ELABORAÇÃO", margin + 14, y + 22);

  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 14, y + 30, pageWidth - margin - 14, y + 30);

  const tecNome = emp.emp_ass_tec_nome || emp.emp_consultoria_tecnico || emp.emp_tecnico || "Engenheiro de Segurança do Trabalho";
  const tecReg = emp.emp_ass_tec_registro || emp.emp_consultoria_registro || "CREA / MTE Conforme Art. 58 Lei 8.213/91";
  const consultoria = emp.emp_consultoria_razao || emp.emp_consultoria || "Consultoria Especializada em SST";

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Profissional Habilitado:", margin + 14, y + 50);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(tecNome, margin + 130, y + 50);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Registro Profissional:", margin + 14, y + 70);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(tecReg, margin + 130, y + 70);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Empresa de Assessoria:", margin + 14, y + 90);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(consultoria, margin + 130, y + 90);

  // Box: Objetivo e Amparo Legal
  y = 485;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(margin, y, contentWidth, 140, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text("3. OBJETIVO E AMPARO LEGAL PREVIDENCIÁRIO", margin + 14, y + 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  const objetivoTexto =
    "O presente Laudo Técnico das Condições Ambientais do Trabalho (LTCAT) tem por finalidade registrar as condições ambientais de trabalho e avaliar a exposição a agentes nocivos químicos, físicos, biológicos ou associação de agentes prejudiciais à saúde ou à integridade física do trabalhador, para fins de comprovação perante a Previdência Social (INSS), nos termos do Art. 58 da Lei Federal nº 8.213/1991, do Anexo IV do Decreto Federal nº 3.048/1999 e da Instrução Normativa INSS/PRES nº 128/2022, servindo de base legal para a emissão do PPP (Perfil Profissiográfico Previdenciário) e envio do evento S-2240 ao eSocial.";
  doc.text(doc.splitTextToSize(objetivoTexto, contentWidth - 28), margin + 14, y + 36);

  // Footer da capa com data de emissão
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Emissão oficial gerada em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
    margin,
    pageHeight - 20
  );

  // ================= PÁGINAS DE CARACTERIZAÇÃO DOS SETORES E FUNÇÕES =================
  funcoesToRender.forEach((func) => {
    doc.addPage();
    let currentY = 42;

    const setor = company.setores.find((s) => s.setor_nome === func.func_setor || s.id === func.func_setor);
    const funcRiscos = company.riscos[func.id] || [];
    const avaliacoesMap = company.avaliacoesRiscos?.[func.id] || {};

    // Header da Função / GHE
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, currentY, contentWidth, 75, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text(`CARGO / GHE: ${func.func_nome.toUpperCase()}`, margin + 10, currentY + 18);

    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Setor / Lotação: ${setor?.setor_nome || func.func_setor || "Geral"}`, margin + 10, currentY + 34);
    doc.text(`CBO: ${func.func_cbo || "N/I"} ${func.func_cbo_titulo ? "- " + func.func_cbo_titulo : ""}`, margin + 10, currentY + 48);
    doc.text(`Jornada: ${func.func_jornada || func.func_turno || "44h semanais"} • Efetivo: ${func.func_qtd || "1"} trabalhador(es)`, margin + 10, currentY + 62);

    currentY += 88;

    // Descrição das Atividades
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 58, 138);
    doc.text("4. DESCRIÇÃO DETALHADA DAS ATIVIDADES E ROTINA DE TRABALHO", margin, currentY);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    const descText = func.func_descricao || "Atividades desempenhadas conforme rotina do cargo e padrões operacionais do setor.";
    const splitDesc = doc.splitTextToSize(descText, contentWidth);
    doc.text(splitDesc, margin, currentY + 6);
    currentY += splitDesc.length * 10 + 14;

    // Tabela de Agentes Nocivos (Anexo IV Dec. 3048/99)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 58, 138);
    doc.text("5. AVALIAÇÃO DOS AGENTES NOCIVOS E ENQUADRAMENTO PREVIDENCIÁRIO", margin, currentY);
    currentY += 8;

    let hasEspecial = false;
    const tableBody: any[] = [];

    if (funcRiscos.length === 0) {
      tableBody.push([
        "Ausência de Agentes Nocivos",
        "Conforme avaliação qualitativa / quantitativa",
        "Habitual",
        "Ausente",
        "09.01.001 (eSocial)",
        "NÃO ENSEJA",
      ]);
    } else {
      funcRiscos.forEach((riscoNome) => {
        const avaliacao = avaliacoesMap[riscoNome];
        const isRuido = riscoNome.toLowerCase().includes("ruído") || riscoNome.toLowerCase().includes("ruido");
        const isQuimico = riscoNome.toLowerCase().includes("químico") || riscoNome.toLowerCase().includes("quimico") || riscoNome.toLowerCase().includes("solvente") || riscoNome.toLowerCase().includes("tinta") || riscoNome.toLowerCase().includes("óleo");
        const isCalor = riscoNome.toLowerCase().includes("calor");
        const isBiologico = riscoNome.toLowerCase().includes("biológico") || riscoNome.toLowerCase().includes("vírus") || riscoNome.toLowerCase().includes("bactéria");

        let codEsocial = "99.99.999";
        let criterio = "Qualitativo (NR-15 / Dec 3048)";
        let enquadramento = "NÃO ENSEJA";

        if (isRuido) {
          codEsocial = "01.01.001";
          criterio = "Quantitativo NHO-01 / NR-15";
          if (avaliacao && (avaliacao.severidade >= 4 || avaliacao.probabilidade >= 4)) {
            enquadramento = "ENSEJA (25 Anos - Cód GFIP 02)";
            hasEspecial = true;
          }
        } else if (isCalor) {
          codEsocial = "01.01.018";
          criterio = "Quantitativo IBUTG (NHO-06)";
        } else if (isQuimico) {
          codEsocial = "02.01.001";
          criterio = "Qualitativo/Quantitativo (Anexo 11/13 NR-15)";
        } else if (isBiologico) {
          codEsocial = "03.01.001";
          criterio = "Qualitativo (Anexo 14 NR-15 / Anexo IV)";
        }

        tableBody.push([
          riscoNome,
          avaliacao?.fonteGeradora || "Processo operacional do setor",
          func.func_tempo_exposicao || "Habitual e Permanente",
          criterio,
          codEsocial,
          enquadramento,
        ]);
      });
    }

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [
        [
          "Agente Nocivo / Fator de Risco",
          "Fonte Geradora",
          "Exposição",
          "Metodologia de Medição",
          "Cód. eSocial Tabela 24",
          "Enquadramento Dec. 3048/99",
        ],
      ],
      body: tableBody,
      theme: "grid",
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [15, 23, 42],
      },
      columnStyles: {
        0: { cellWidth: 100, fontStyle: "bold" },
        1: { cellWidth: 100 },
        2: { cellWidth: 70, halign: "center" },
        3: { cellWidth: 90 },
        4: { cellWidth: 75, halign: "center" },
        5: { cellWidth: 88, halign: "center", fontStyle: "bold" },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 16;

    // Eficácia de EPI / EPC (STF Tema 555 & IN 128)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 58, 138);
    doc.text("6. ANÁLISE DE EFICÁCIA DOS EQUIPAMENTOS DE PROTEÇÃO (EPI / EPC)", margin, currentY);
    currentY += 8;

    const epiList = func.func_epis_lista && func.func_epis_lista.length > 0
      ? func.func_epis_lista.map((e) => `${e.nome} (CA: ${e.ca || "N/I"})`).join(", ")
      : func.func_epis || "Conforme necessidade da atividade";

    const epiTableData = [
      ["EPCs Disponíveis:", func.func_epcs || "Ventilação natural/artificial e proteções coletivas existentes"],
      ["EPIs Fornecidos e CA:", epiList],
      ["Certificado de Aprovação (CA) Válido:", "SIM - Todos os EPIs possuem CA regular junto ao MTE"],
      ["Periodicidade de Troca e Higienização:", "SIM - Substituição periódica garantida e registrada em Ficha de EPI"],
      ["Treinamento e Uso Efetivo:", "SIM - Trabalhadores orientados quanto ao uso correto (NR-06)"],
      ["Critério STF (Tema 555 - Ruído):", "Atenuação de Ruído via EPI NÃO descaracteriza Aposentadoria Especial"],
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      body: epiTableData,
      theme: "plain",
      bodyStyles: {
        fontSize: 7.5,
        textColor: [30, 41, 59],
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 190, fontStyle: "bold", textColor: [30, 58, 138] },
        1: { cellWidth: contentWidth - 190 },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 16;

    // Parecer Conclusivo Previdenciário
    doc.setFillColor(hasEspecial ? 254 : 240, hasEspecial ? 242 : 253, hasEspecial ? 242 : 244);
    doc.setDrawColor(hasEspecial ? 239 : 187, hasEspecial ? 68 : 247, hasEspecial ? 68 : 208);
    doc.roundedRect(margin, currentY, contentWidth, 55, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(hasEspecial ? 185 : 22, hasEspecial ? 28 : 101, hasEspecial ? 28 : 52);
    doc.text(
      hasEspecial
        ? "CONCLUSÃO PREVIDENCIÁRIA: CARACTERIZADA CONDIÇÃO ESPECIAL (APOSENTADORIA ESPECIAL)"
        : "CONCLUSÃO PREVIDENCIÁRIA: NÃO CARACTERIZADA CONDIÇÃO ESPECIAL",
      margin + 10,
      currentY + 18
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(
      hasEspecial
        ? "Os trabalhadores nesta função exercem atividades com exposição nociva aos agentes avaliados acima dos limites de tolerância previstos no Anexo IV do Decreto 3.048/99. Código GFIP: 02 (25 Anos)."
        : "Os trabalhadores nesta função NÃO estão expostos a agentes nocivos de forma habitual e permanente capazes de ensejar a concessão de Aposentadoria Especial conforme Anexo IV do Decreto nº 3.048/99. Código GFIP: 01 (Sem exposição).",
      margin + 10,
      currentY + 32,
      { maxWidth: contentWidth - 20 }
    );
  });

  // ================= PÁGINA FINAL: TERMO DE ENCERRAMENTO E ASSINATURAS =================
  doc.addPage();
  let endY = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 58, 138);
  doc.text("7. CONSIDERAÇÕES FINAIS E TERMO DE ENCERRAMENTO", margin, endY);
  endY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const encerramentoText =
    "O presente Laudo Técnico das Condições Ambientais do Trabalho (LTCAT) foi elaborado com estrita observância aos critérios técnicos e legais estabelecidos na Lei Federal nº 8.213/1991, no Decreto Federal nº 3.048/1999 e na Instrução Normativa INSS/PRES nº 128/2022. As conclusões técnicas aqui exaradas retratam fielmente a realidade das condições ambientais e operacionais constatadas no momento da avaliação pericial no estabelecimento avaliado.\n\nEste documento é de guarda obrigatória da empresa pelo prazo mínimo de 20 (vinte) anos, conforme preconizado pela legislação previdenciária em vigor, devendo ser atualizado sempre que houver modificação nos ambientes, layout, processos de trabalho ou introdução de novas tecnologias e agentes ambientais.";
  doc.text(doc.splitTextToSize(encerramentoText, contentWidth), margin, endY);

  endY += 120;

  // Assinaturas
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text("8. RESPONSÁVEIS PELA EMISSÃO E APROVAÇÃO", margin, endY);
  endY += 30;

  const colWidth = (contentWidth - 30) / 2;

  // Box Assinatura Técnico
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, endY, colWidth, 140, 4, 4, "FD");

  if (emp.emp_ass_tec_img) {
    try {
      doc.addImage(emp.emp_ass_tec_img, "PNG", margin + 20, endY + 20, colWidth - 40, 45, undefined, "FAST");
    } catch {}
  } else {
    doc.setDrawColor(148, 163, 184);
    doc.line(margin + 20, endY + 70, margin + colWidth - 20, endY + 70);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(emp.emp_ass_tec_nome || emp.emp_consultoria_tecnico || emp.emp_tecnico || "Responsável Técnico SST", margin + colWidth / 2, endY + 88, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(emp.emp_ass_tec_registro || emp.emp_consultoria_registro || "Engenheiro de Segurança do Trabalho / Médico", margin + colWidth / 2, endY + 102, { align: "center" });
  doc.text(`Data: ${emp.emp_ass_tec_data || new Date().toLocaleDateString("pt-BR")}`, margin + colWidth / 2, endY + 116, { align: "center" });

  // Box Assinatura Representante Legal da Empresa
  const rightX = margin + colWidth + 30;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(rightX, endY, colWidth, 140, 4, 4, "FD");

  if (emp.emp_ass_rep_img) {
    try {
      doc.addImage(emp.emp_ass_rep_img, "PNG", rightX + 20, endY + 20, colWidth - 40, 45, undefined, "FAST");
    } catch {}
  } else {
    doc.setDrawColor(148, 163, 184);
    doc.line(rightX + 20, endY + 70, rightX + colWidth - 20, endY + 70);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(emp.emp_ass_rep_nome || emp.emp_responsavel || "Representante Legal da Empresa", rightX + colWidth / 2, endY + 88, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(emp.emp_cargo_resp || "Diretoria / Gestão do Estabelecimento", rightX + colWidth / 2, endY + 102, { align: "center" });
  doc.text(`Data: ${emp.emp_ass_rep_data || new Date().toLocaleDateString("pt-BR")}`, rightX + colWidth / 2, endY + 116, { align: "center" });

  // Apply Headers and Footers to all pages except cover
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) {
      addHeaderFooter(i, totalPages);
    }
  }

  const nomeEmpresa = (emp.emp_razao || "empresa").replace(/[^\w\d-_]+/g, "_").slice(0, 35);
  const sufixo = selectedFuncaoId ? "_Individual" : "_Completo";
  doc.save(`LTCAT_Dec3048_${nomeEmpresa}${sufixo}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
