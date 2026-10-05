import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Company, PtPermissaoTrabalho } from "../types";
import { CATALOGO_TIPOS_ATIVIDADE } from "../data/ptTemplates";

export interface GeneratePtPdfOptions {
  company: Company;
  pt: PtPermissaoTrabalho;
  printBlankSignatures?: boolean;
}

export function generatePtPdf(
  arg1: GeneratePtPdfOptions | Company,
  arg2?: PtPermissaoTrabalho,
  arg3?: boolean
): jsPDF {
  let company: Company;
  let pt: PtPermissaoTrabalho;
  let printBlankSignatures = false;

  if ("company" in arg1 && "pt" in arg1) {
    company = arg1.company;
    pt = arg1.pt;
    printBlankSignatures = arg1.printBlankSignatures || false;
  } else {
    company = arg1 as Company;
    pt = arg2!;
    printBlankSignatures = arg3 || false;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  renderSinglePtDocument(doc, company, pt, printBlankSignatures);

  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const empNome = company.empresa?.emp_razao || "Empresa";

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);

    doc.text(
      `Permissão de Trabalho (${pt.numeroPt || "PT"}) • ${empNome} • Segurança e Saúde no Trabalho`,
      margin,
      pageHeight - 6
    );

    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: "right" });
  }

  const sanitizedNumero = (pt.numeroPt || "PT")
    .replace(/[^\w\d-_]+/g, "_")
    .slice(0, 20);
  const sanitizedEmpresa = (empNome || "Empresa")
    .replace(/[^\w\d-_]+/g, "_")
    .slice(0, 25);
  const dataFormatada = (pt.dataInicio || "").replace(/[^\w\d-_]+/g, "-");

  const fileName = `Permissao_Trabalho_${sanitizedNumero}_${sanitizedEmpresa}_${dataFormatada || "doc"}.pdf`;
  try {
    doc.save(fileName);
  } catch (err) {
    console.error("Erro ao salvar PDF da PT:", err);
  }

  return doc;
}

export function generateConsolidatedPtPdf(company: Company): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const permissoes = company.ptPermissoes || [];
  if (permissoes.length === 0) {
    alert("Nenhuma Permissão de Trabalho (PT) registrada para gerar relatório.");
    return doc;
  }

  permissoes.forEach((pt, index) => {
    if (index > 0) {
      doc.addPage();
    }
    renderSinglePtDocument(doc, company, pt, false);
  });

  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const empNome = company.empresa?.emp_razao || "Empresa";

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);

    doc.text(
      `Registro Consolidado de Permissões de Trabalho (PT/PET) • ${empNome}`,
      margin,
      pageHeight - 6
    );

    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: "right" });
  }

  const sanitizedEmpresa = (empNome || "Empresa")
    .replace(/[^\w\d-_]+/g, "_")
    .slice(0, 30);
  const fileName = `Permissoes_Trabalho_Consolidadas_${sanitizedEmpresa}_${new Date().toISOString().slice(0, 10)}.pdf`;
  try {
    doc.save(fileName);
  } catch (err) {
    console.error("Erro ao salvar PDF consolidado das PTs:", err);
  }

  return doc;
}

function renderSinglePtDocument(
  doc: jsPDF,
  company: Company,
  pt: PtPermissaoTrabalho,
  printBlankSignatures = false
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // 1. Header Box
  const empLogo = company.empresa?.emp_logo;
  const consultoriaLogo = company.empresa?.emp_consultoria_logo;
  const hasLeftLogo = Boolean(empLogo);
  const hasRightLogo = Boolean(consultoriaLogo);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 21, 2, 2, "FD");

  let titleStartX = margin;
  let titleWidth = contentWidth;

  if (hasLeftLogo) {
    try {
      doc.addImage(empLogo!, "PNG", margin + 2, y + 2.5, 22, 16, undefined, "FAST");
      titleStartX += 24;
      titleWidth -= 24;
    } catch (e) {}
  }

  if (hasRightLogo) {
    try {
      doc.addImage(consultoriaLogo!, "PNG", margin + contentWidth - 24, y + 2.5, 22, 16, undefined, "FAST");
      titleWidth -= 24;
    } catch (e) {}
  }

  const titleCenterX = titleStartX + titleWidth / 2;

  const isPET = pt.tiposAtividade?.includes("espaco_confinado");
  const mainTitle = isPET
    ? "PERMISSÃO DE ENTRADA E TRABALHO (PET / PT)"
    : "PERMISSÃO DE TRABALHO (PT)";

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(mainTitle, titleCenterX, y + 7.5, { align: "center" });

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    `CONTROLE DE ATIVIDADES CRÍTICAS • NR-01 / NR-33 / NR-35 / NR-34 / NR-10 / NR-18`,
    titleCenterX,
    y + 13.5,
    { align: "center" }
  );

  y += 24;

  // 2. Company and Document Metadata Grid
  const empNome = company.empresa?.emp_razao || "Empresa Não Informada";
  const empCnpj = company.empresa?.emp_cnpj || "Não informado";
  const empGrau = company.empresa?.emp_grau_risco || "-";

  const atividadesLabels = (pt.tiposAtividade || [])
    .map((k) => {
      const found = CATALOGO_TIPOS_ATIVIDADE.find((a) => a.key === k);
      return found ? `${found.label} (${found.nr})` : k;
    })
    .join(" • ");

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    body: [
      [
        { content: "NÚMERO DA PT:", styles: { fontStyle: "bold", fillColor: [241, 245, 249] } },
        { content: pt.numeroPt || "PT-001", styles: { fontStyle: "bold", textColor: [2, 132, 199] } },
        { content: "STATUS:", styles: { fontStyle: "bold", fillColor: [241, 245, 249] } },
        { content: pt.status || "Em Elaboração", styles: { fontStyle: "bold" } },
        { content: "GRAU DE RISCO:", styles: { fontStyle: "bold", fillColor: [241, 245, 249] } },
        { content: `Grau ${empGrau}` },
      ],
      [
        { content: "EMPRESA / CONTRATANTE:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: empNome, colSpan: 3 },
        { content: "CNPJ:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: empCnpj },
      ],
      [
        { content: "LOCAL / SETOR:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: `${pt.localSetor || "Setor Geral"}${pt.localDetalhado ? ` (${pt.localDetalhado})` : ""}`, colSpan: 3 },
        { content: "EMPRESA EXECUTANTE:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: pt.encarregadoEmpresa || empNome },
      ],
      [
        { content: "DATA E HORA INÍCIO:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: `${formatDate(pt.dataInicio)} às ${pt.horaInicio || "08:00"}` },
        { content: "VALIDADE / TÉRMINO:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: `${formatDate(pt.dataTermino || pt.dataInicio)} às ${pt.horaTermino || "17:00"}` },
        { content: "MODALIDADES:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: atividadesLabels || "Geral" },
      ],
    ],
  });

  y = (doc as any).lastAutoTable.finalY + 3.5;

  // 3. Task Description & Tools
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(margin, y, contentWidth, 5.5, 1, 1, "FD");
  doc.setTextColor(30, 64, 175);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`TÍTULO DA TAREFA: ${pt.titulo ? pt.titulo.toUpperCase() : "SERVIÇO ESPECIAL / CRÍTICO"}`, margin + 3, y + 3.8);

  y += 6.5;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: {
      fontSize: 7.2,
      cellPadding: 1.8,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    body: [
      [
        { content: "DESCRIÇÃO DETALHADA DO TRABALHO:", styles: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 50 } },
        { content: pt.descricaoTrabalho || "Descrição dos serviços técnicos autorizados conforme procedimentos de segurança." },
      ],
      [
        { content: "MÁQUINAS / FERRAMENTAS UTILIZADAS:", styles: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 50 } },
        { content: pt.ferramentasEquipamentos || "Ferramentas manuais e equipamentos específicos inspecionados." },
      ],
    ],
  });

  y = (doc as any).lastAutoTable.finalY + 3.5;

  // 4. Pre-operational Checklist & Risk Controls
  const checklist = pt.checklistControles || [];

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 5.5, 1, 1, "FD");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("CHECKLIST DE SEGURANÇA E MEDIDAS DE CONTROLE PRÉ-OPERACIONAIS", margin + 3, y + 3.8);

  y += 6.5;

  const checklistRows = checklist.map((chk, idx) => {
    let statusText = "NÃO SE APLICA";
    let statusColor: [number, number, number] = [100, 116, 139];
    if (chk.resposta === "sim") {
      statusText = "SIM / CONFORME";
      statusColor = [16, 185, 129];
    } else if (chk.resposta === "nao") {
      statusText = "NÃO / PENDENTE";
      statusColor = [239, 68, 68];
    }

    return [
      { content: String(idx + 1).padStart(2, "0"), styles: { halign: "center", fontStyle: "bold" } },
      { content: chk.item },
      { content: statusText, styles: { halign: "center", fontStyle: "bold", textColor: statusColor } },
      { content: chk.obs || "-" },
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: {
      fontSize: 6.8,
      cellPadding: 1.4,
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      valign: "middle",
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: "bold",
      fontSize: 7.2,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 106 },
      2: { cellWidth: 32, halign: "center" },
      3: { cellWidth: 40 },
    },
    head: [["Nº", "ITEM DE VERIFICAÇÃO / REQUISITO DE SEGURANÇA", "CONFORMIDADE", "OBSERVAÇÃO"]],
    body: checklistRows as any,
  });

  y = (doc as any).lastAutoTable.finalY + 3.5;

  // 5. Gas Atmosphere Measurements (if present or Confined Space)
  if (pt.medicoesGases && pt.medicoesGases.length > 0) {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(251, 191, 36);
    doc.roundedRect(margin, y, contentWidth, 5.5, 1, 1, "FD");
    doc.setTextColor(146, 64, 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("AVALIAÇÃO E MONITORAMENTO DA ATMOSFERA (NR-33 / PET)", margin + 3, y + 3.8);

    y += 6.5;

    const gasRows = pt.medicoesGases.map((m) => [
      { content: m.horario || "-", styles: { halign: "center" } },
      { content: `${m.oxigenio || "-"} % (19,5 - 23%)`, styles: { halign: "center" } },
      { content: `${m.lie || "-"} % (< 10%)`, styles: { halign: "center" } },
      { content: `${m.co || "-"} ppm (< 25 ppm)`, styles: { halign: "center" } },
      { content: `${m.h2s || "-"} ppm (< 8 ppm)`, styles: { halign: "center" } },
      { content: m.outrosGases || "-", styles: { halign: "center" } },
      { content: m.statusAprovado ? "APROVADO" : "REPROVADO", styles: { halign: "center", fontStyle: "bold", textColor: m.statusAprovado ? [16, 185, 129] : [239, 68, 68] } },
      { content: m.responsavelMedicao || "-" },
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      styles: {
        fontSize: 6.8,
        cellPadding: 1.4,
        textColor: [15, 23, 42],
        lineColor: [203, 213, 225],
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: [30, 41, 59],
        fontStyle: "bold",
        fontSize: 7,
      },
      head: [["HORA", "O₂ (%)", "LIE / LEL (%)", "CO (ppm)", "H₂S (ppm)", "OUTROS", "STATUS", "RESPONSÁVEL"]],
      body: gasRows as any,
    });

    y = (doc as any).lastAutoTable.finalY + 3.5;
  }

  // 6. EPIs and EPCs Grid
  if (y > pageHeight - 55) {
    doc.addPage();
    y = margin;
  }

  const episText = (pt.episRequeridos || []).length > 0
    ? pt.episRequeridos.map((e) => `• ${e}`).join("\n")
    : "• Equipamentos de proteção individual padrão da atividade (capacete, óculos, calçado, luvas).";

  const epcsText = (pt.epcsRequeridos || []).length > 0
    ? pt.epcsRequeridos.map((e) => `• ${e}`).join("\n")
    : "• Isolamento e sinalização da área de trabalho.";

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: {
      fontSize: 6.8,
      cellPadding: 1.8,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    head: [["EQUIPAMENTOS DE PROTEÇÃO INDIVIDUAL (EPI)", "EQUIPAMENTOS DE PROTEÇÃO COLETIVA (EPC)"]],
    body: [[{ content: episText }, { content: epcsText }]],
  });

  y = (doc as any).lastAutoTable.finalY + 3.5;

  // 7. Authorized Workers List & Digital Signatures
  const workers = pt.trabalhadores || [];

  if (y > pageHeight - 50) {
    doc.addPage();
    y = margin;
  }

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 5.5, 1, 1, "FD");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`EQUIPE EXECUTANTE AUTORIZADA (${workers.length} TRABALHADORES)`, margin + 3, y + 3.8);

  y += 6.5;

  const workerRows: any[] = workers.map((w, idx) => [
    { content: String(idx + 1).padStart(2, "0"), styles: { halign: "center", fontStyle: "bold" } },
    { content: w.nome || "Não informado", styles: { fontStyle: "bold" } },
    { content: w.cpfOuMatricula || "-" },
    { content: w.funcao || "-" },
    { content: w.asoApto ? "APTO" : "PENDENTE", styles: { halign: "center", fontStyle: "bold", textColor: w.asoApto ? [16, 185, 129] : [239, 68, 68] } },
    { content: w.treinamentoValido ? "VÁLIDO" : "PENDENTE", styles: { halign: "center", fontStyle: "bold", textColor: w.treinamentoValido ? [16, 185, 129] : [239, 68, 68] } },
    { content: "", styles: { minCellHeight: 8 } },
  ]);

  if (printBlankSignatures && workerRows.length < 8) {
    const rem = 8 - workerRows.length;
    for (let i = 0; i < rem; i++) {
      const num = workerRows.length + 1;
      workerRows.push([
        { content: String(num).padStart(2, "0"), styles: { halign: "center" } },
        { content: "" },
        { content: "" },
        { content: "" },
        { content: "" },
        { content: "" },
        { content: "", styles: { minCellHeight: 8 } },
      ]);
    }
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: {
      fontSize: 6.8,
      cellPadding: 1.2,
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      valign: "middle",
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: "bold",
      fontSize: 7.2,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 50 },
      2: { cellWidth: 26 },
      3: { cellWidth: 32 },
      4: { cellWidth: 16, halign: "center" },
      5: { cellWidth: 16, halign: "center" },
      6: { cellWidth: 38 },
    },
    head: [["Nº", "NOME COMPLETO", "CPF / MATRÍCULA", "FUNÇÃO", "ASO", "TREIN.", "ASSINATURA DIGITAL"]],
    body: workerRows as any,
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 6) {
        const worker = workers[data.row.index];
        if (worker && worker.assinaturaImg && !printBlankSignatures) {
          try {
            const cell = data.cell;
            const imgPadding = 0.8;
            const imgX = cell.x + imgPadding;
            const imgY = cell.y + imgPadding;
            const imgW = cell.width - imgPadding * 2;
            const imgH = cell.height - imgPadding * 2;
            doc.addImage(worker.assinaturaImg, "PNG", imgX, imgY, imgW, imgH, undefined, "FAST");
          } catch (e) {}
        } else {
          const cell = data.cell;
          doc.setDrawColor(203, 213, 225);
          doc.setLineDashPattern([1, 1], 0);
          doc.line(cell.x + 2, cell.y + cell.height - 2, cell.x + cell.width - 2, cell.y + cell.height - 2);
          doc.setLineDashPattern([], 0);
        }
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 4;

  if (y > pageHeight - 50) {
    doc.addPage();
    y = margin;
  }

  // 8. Signatures of Responsible Authorities (Emissor, Encarregado, Vigia)
  const isVigiaRequired = pt.tiposAtividade?.includes("espaco_confinado") || Boolean(pt.vigiaNome);
  const colCount = isVigiaRequired ? 3 : 2;
  const colW = contentWidth / colCount;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 30, 1.5, 1.5, "FD");

  // Coluna 1: Emissor / SST
  const col1X = margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text("EMISSOR / RESPONSÁVEL SST:", col1X + 3, y + 4.5);

  if (pt.emissorAssinaturaImg && !printBlankSignatures) {
    try {
      doc.addImage(pt.emissorAssinaturaImg, "PNG", col1X + 8, y + 6, colW - 16, 12, undefined, "FAST");
    } catch {}
  }
  doc.setDrawColor(203, 213, 225);
  doc.line(col1X + 3, y + 20, col1X + colW - 3, y + 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text(pt.emissorNome || "Responsável pela Emissão", col1X + colW / 2, y + 23.5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text(`${pt.emissorCargo || "Técnico / Eng. SST"} ${pt.emissorRegistro ? `• Reg: ${pt.emissorRegistro}` : ""}`, col1X + colW / 2, y + 27, { align: "center" });

  // Coluna 2: Encarregado / Executante Líder
  const col2X = margin + colW;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text("ENCARREGADO / SUPERVISOR:", col2X + 3, y + 4.5);

  if (pt.encarregadoAssinaturaImg && !printBlankSignatures) {
    try {
      doc.addImage(pt.encarregadoAssinaturaImg, "PNG", col2X + 8, y + 6, colW - 16, 12, undefined, "FAST");
    } catch {}
  }
  doc.setDrawColor(203, 213, 225);
  doc.line(col2X + 3, y + 20, col2X + colW - 3, y + 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(30, 41, 59);
  doc.text(pt.encarregadoNome || "Encarregado da Atividade", col2X + colW / 2, y + 23.5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text(`${pt.encarregadoCargo || "Líder de Equipe"} • ${pt.encarregadoEmpresa || "Executante"}`, col2X + colW / 2, y + 27, { align: "center" });

  // Coluna 3: Vigia (se Espaço Confinado)
  if (isVigiaRequired) {
    const col3X = margin + colW * 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text("VIGIA DE ESPAÇO CONFINADO:", col3X + 3, y + 4.5);

    if (pt.vigiaAssinaturaImg && !printBlankSignatures) {
      try {
        doc.addImage(pt.vigiaAssinaturaImg, "PNG", col3X + 8, y + 6, colW - 16, 12, undefined, "FAST");
      } catch {}
    }
    doc.setDrawColor(203, 213, 225);
    doc.line(col3X + 3, y + 20, col3X + colW - 3, y + 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(30, 41, 59);
    doc.text(pt.vigiaNome || "Vigia Designado", col3X + colW / 2, y + 23.5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text("Vigia Capacitado NR-33", col3X + colW / 2, y + 27, { align: "center" });
  }

  y += 33;

  // 9. Encerramento / Baixa da PT
  if (y > pageHeight - 30) {
    doc.addPage();
    y = margin;
  }

  const enc = pt.encerramento;
  const isEncerrada = pt.status === "Encerrada / Concluída" || Boolean(enc?.dataBaixa);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 20, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("ENCERRAMENTO E BAIXA DA PERMISSÃO DE TRABALHO:", margin + 3, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);

  const baixaStatusText = isEncerrada
    ? `Atividade concluída em ${formatDate(enc?.dataBaixa)} às ${enc?.horaBaixa || "--:--"}. Local inspecionado, ferramentas recolhidas e bloqueios desfeitos com segurança.`
    : "A Permissão de Trabalho deve ser baixada e assinada pelo Encarregado e Emissor imediatamente após o término da jornada ou conclusão da atividade.";

  doc.text(baixaStatusText, margin + 3, y + 9);

  if (enc?.responsavelBaixaAssinaturaImg && !printBlankSignatures) {
    try {
      doc.addImage(enc.responsavelBaixaAssinaturaImg, "PNG", margin + contentWidth - 45, y + 2, 40, 10, undefined, "FAST");
    } catch {}
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(margin + contentWidth - 50, y + 14, margin + contentWidth - 2, y + 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(15, 23, 42);
  doc.text(enc?.responsavelBaixaNome || "Assinatura do Responsável pela Baixa", margin + contentWidth - 26, y + 17.5, { align: "center" });
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const clean = dateStr.slice(0, 10);
  const parts = clean.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
