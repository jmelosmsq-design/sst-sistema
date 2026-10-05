import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Company, DdsRegistro } from "../types";

export interface GenerateDdsPdfOptions {
  company: Company;
  registro: DdsRegistro;
  printBlankSignatures?: boolean;
}

export function generateDdsPdf(
  arg1: GenerateDdsPdfOptions | Company,
  arg2?: DdsRegistro,
  arg3?: boolean
): jsPDF {
  let company: Company;
  let registro: DdsRegistro;
  let printBlankSignatures = false;

  if ("company" in arg1 && "registro" in arg1) {
    company = arg1.company;
    registro = arg1.registro;
    printBlankSignatures = arg1.printBlankSignatures || false;
  } else {
    company = arg1 as Company;
    registro = arg2!;
    printBlankSignatures = arg3 || false;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // 1. Header Box (Company and Document Title - Ink Saver / Eco-Print Mode)
  const empLogo = company.empresa?.emp_logo;
  const consultoriaLogo = company.empresa?.emp_consultoria_logo;
  const hasLeftLogo = Boolean(empLogo);
  const hasRightLogo = Boolean(consultoriaLogo);

  // Clean Light Header Box (Saves 95% Ink vs Solid Black/Slate)
  doc.setFillColor(248, 250, 252); // Slate-50 light
  doc.setDrawColor(203, 213, 225); // Slate-300 fine border
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, "FD");

  // Render Left Logo (Empresa) if present
  let titleStartX = margin;
  let titleWidth = contentWidth;

  if (hasLeftLogo) {
    try {
      doc.addImage(empLogo!, "PNG", margin + 2, y + 2, 22, 16, undefined, "FAST");
      titleStartX += 24;
      titleWidth -= 24;
    } catch (e) {
      console.warn("Não foi possível carregar o logo da empresa no PDF do DDS:", e);
    }
  }

  // Render Right Logo (Consultoria) if present
  if (hasRightLogo) {
    try {
      doc.addImage(consultoriaLogo!, "PNG", margin + contentWidth - 24, y + 2, 22, 16, undefined, "FAST");
      titleWidth -= 24;
    } catch (e) {
      console.warn("Não foi possível carregar o logo da consultoria no PDF do DDS:", e);
    }
  }

  const titleCenterX = titleStartX + titleWidth / 2;

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("REGISTRO DE DIÁLOGO DE SEGURANÇA (DDS / DSS / DMS)", titleCenterX, y + 7.5, {
    align: "center",
  });

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    `COMPROVANTE DE CONSCIENTIZAÇÃO E PARTICIPAÇÃO EM SST • NR-01 / GRO-PGR`,
    titleCenterX,
    y + 13.5,
    { align: "center" }
  );

  y += 24;

  // 2. Company & Session Metadata Grid
  const empNome = company.empresa?.emp_razao || "Empresa Não Informada";
  const empCnpj = company.empresa?.emp_cnpj || "Não informado";
  const empCnae = company.empresa?.emp_cnae || "-";
  const empGrau = company.empresa?.emp_grau_risco || "-";
  const empCidade = `${company.empresa?.emp_cidade || ""} - ${company.empresa?.emp_uf || ""}`.trim();

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
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      fontSize: 8,
    },
    body: [
      [
        { content: "EMPRESA / RAZÃO SOCIAL:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: empNome, colSpan: 3 },
        { content: "CNPJ:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: empCnpj },
      ],
      [
        { content: "UNIDADE / LOCAL:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: registro.localSetor || empCidade || "Instalações da Empresa", colSpan: 3 },
        { content: "GRAU DE RISCO:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: `Grau ${empGrau}` },
      ],
      [
        { content: "DATA DO DIÁLOGO:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: formatDate(registro.data) },
        { content: "HORÁRIO / DURAÇÃO:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: `${registro.horarioInicio || "07:30"} às ${registro.horarioTermino || "07:45"} (${registro.duracaoMinutos || "15 min"})` },
        { content: "PERIODICIDADE:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: registro.frequencia || "Diário (DDS)" },
      ],
      [
        { content: "FACILITADOR / MINISTRANTE:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: `${registro.ministranteNome} ${registro.ministranteCargo ? `(${registro.ministranteCargo})` : ""} ${registro.ministranteRegistro ? `• Reg: ${registro.ministranteRegistro}` : ""}`, colSpan: 5 },
      ],
    ],
  });

  y = (doc as any).lastAutoTable.finalY + 4;

  // 3. DDS Topic & Content Box
  doc.setFillColor(239, 246, 255); // Blue-50
  doc.setDrawColor(191, 219, 254); // Blue-200
  doc.roundedRect(margin, y, contentWidth, 6, 1, 1, "FD");

  doc.setTextColor(30, 64, 175); // Blue-800
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  const refText = registro.nrReferencia ? ` [Ref: ${registro.nrReferencia}]` : "";
  const codText = registro.temaCodigo ? ` (${registro.temaCodigo})` : "";
  doc.text(`TEMA ABORDADO: ${registro.temaTitulo.toUpperCase()}${codText}${refText}`, margin + 3, y + 4.2);

  y += 7.5;

  // Summary and discussion points
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);

  const cleanConteudo = (registro.temaConteudo || "").trim();
  const splitConteudo = doc.splitTextToSize(cleanConteudo, contentWidth - 5);
  // Limit to reasonable height on page 1 so signatures table remains dense and single-page friendly
  const maxLines = 10;
  const renderedLines = splitConteudo.slice(0, maxLines);
  const contentBoxHeight = renderedLines.length * 3.2 + 4;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, contentBoxHeight, 1, 1, "FD");

  doc.text(renderedLines, margin + 2.5, y + 3.5);
  y += contentBoxHeight + 3.5;

  // 4. Compact Signatures Grid (Ink Saver Mode)
  // Designed with compact cells (6mm height each) so up to 25-30 participants fit on a single page!
  const participants = registro.participantes || [];

  doc.setFillColor(241, 245, 249); // Slate-100 (Ink Saver)
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.rect(margin, y, contentWidth, 5.5, "FD");
  doc.setTextColor(15, 23, 42); // Dark slate
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`LISTA DE PRESENÇA E ASSINATURA DOS TRABALHADORES PARTICIPANTES (${participants.length} REGISTRADOS)`, margin + 3, y + 3.8);

  y += 6.5;

  // Prepare table rows for participants
  const tableData: any[] = participants.map((p, idx) => [
    { content: String(idx + 1).padStart(2, "0"), styles: { halign: "center", fontStyle: "bold" } },
    { content: p.nome || "Não informado", styles: { fontStyle: "bold" } },
    { content: p.cpfOuMatricula || "-" },
    { content: p.funcao || "-" },
    { content: p.setor || "-" },
    { content: "", styles: { minCellHeight: 8 } }, // Signature column (filled in didDrawCell)
  ]);

  // If there are few participants, add blank rows so it can be printed and signed physically
  if (printBlankSignatures && tableData.length < 15) {
    const remaining = 15 - tableData.length;
    for (let i = 0; i < remaining; i++) {
      const idx = tableData.length + 1;
      tableData.push([
        { content: String(idx).padStart(2, "0"), styles: { halign: "center" } },
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
      fontSize: 7,
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
      fontSize: 7.5,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" }, // Nº
      1: { cellWidth: 54 }, // Nome
      2: { cellWidth: 26 }, // CPF / Matrícula
      3: { cellWidth: 36 }, // Função
      4: { cellWidth: 26 }, // Setor
      5: { cellWidth: 36 }, // Assinatura
    },
    head: [["Nº", "NOME COMPLETO", "CPF / MATRÍCULA", "FUNÇÃO", "SETOR", "ASSINATURA DIGITAL / RUBRICA"]],
    body: tableData as any,
    didDrawCell: (data) => {
      // Signature image placement in column 5
      if (data.section === "body" && data.column.index === 5) {
        const participant = participants[data.row.index];
        if (participant && participant.assinaturaImg && !printBlankSignatures) {
          try {
            const cell = data.cell;
            const imgPadding = 0.8;
            const imgX = cell.x + imgPadding;
            const imgY = cell.y + imgPadding;
            const imgW = cell.width - imgPadding * 2;
            const imgH = cell.height - imgPadding * 2;
            doc.addImage(participant.assinaturaImg, "PNG", imgX, imgY, imgW, imgH, undefined, "FAST");
          } catch (e) {
            console.warn("Could not embed participant signature image:", e);
          }
        } else {
          // If no image, draw a light dotted baseline for physical signing
          const cell = data.cell;
          doc.setDrawColor(203, 213, 225);
          doc.setLineDashPattern([1, 1], 0);
          doc.line(cell.x + 2, cell.y + cell.height - 2, cell.x + cell.width - 2, cell.y + cell.height - 2);
          doc.setLineDashPattern([], 0); // reset
        }
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 5;

  // Check if we have space on page for the footer signatures and declarations; if not, add page
  if (y > pageHeight - 35) {
    doc.addPage();
    y = margin;
  }

  // 5. Final Confirmation & Facilitator Signature
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("DECLARAÇÃO DE PARTICIPAÇÃO E CONSCIENTIZAÇÃO EM SST:", margin + 3, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  const termo = "Declaramos que participamos da instrução de SST sobre o tema acima especificado, compreendemos as orientações e riscos discutidos e comprometemo-nos a cumprir integralmente os procedimentos preventivos e normas de segurança da empresa.";
  const splitTermo = doc.splitTextToSize(termo, contentWidth - 65);
  doc.text(splitTermo, margin + 3, y + 8.5);

  // Facilitator signature box on the right
  const sigBoxX = margin + contentWidth - 60;
  doc.setDrawColor(203, 213, 225);
  doc.line(sigBoxX + 2, y + 17, sigBoxX + 58, y + 17);

  if (registro.ministranteAssinaturaImg && !printBlankSignatures) {
    try {
      doc.addImage(registro.ministranteAssinaturaImg, "PNG", sigBoxX + 10, y + 4, 38, 12, undefined, "FAST");
    } catch {}
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text(registro.ministranteNome, sigBoxX + 30, y + 19.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text("Responsável / Facilitador SST", sigBoxX + 30, y + 22.5, { align: "center" });

  // Add Page Numbers & Footer Watermark to all pages (No time/date stamp as requested)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);

    doc.text(
      `Registro de Diálogo de Segurança (DDS) • ${empNome}`,
      margin,
      pageHeight - 6
    );

    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: "right" });
  }

  const sanitizedTema = (registro.temaTitulo || "DDS")
    .replace(/[^\w\d-_]+/g, "_")
    .slice(0, 30);
  const sanitizedEmpresa = (empNome || "Empresa")
    .replace(/[^\w\d-_]+/g, "_")
    .slice(0, 25);
  const dataFormatada = (registro.data || "").replace(/[^\w\d-_]+/g, "-");

  const fileName = `Ata_DDS_${sanitizedTema}_${sanitizedEmpresa}_${dataFormatada || "sessao"}.pdf`;
  try {
    doc.save(fileName);
  } catch (err) {
    console.error("Erro ao salvar PDF do DDS:", err);
  }

  return doc;
}

export function generateConsolidatedDdsPdf(company: Company): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const registros = company.ddsRegistros || [];
  if (registros.length === 0) {
    alert("Nenhum Diálogo de Segurança (DDS) registrado para gerar relatório.");
    return doc;
  }

  // Gera cada DDS
  registros.forEach((reg, index) => {
    if (index > 0) {
      doc.addPage();
    }
    // Renderiza cada registro usando a mesma lógica
    renderSingleDdsPage(doc, company, reg, false);
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
      `Registro Consolidado de Diálogos de Segurança (DDS) • ${empNome}`,
      margin,
      pageHeight - 6
    );

    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: "right" });
  }

  const sanitizedEmpresa = (empNome || "Empresa")
    .replace(/[^\w\d-_]+/g, "_")
    .slice(0, 30);
  const fileName = `Atas_DDS_Consolidado_${sanitizedEmpresa}_${new Date().toISOString().slice(0, 10)}.pdf`;
  try {
    doc.save(fileName);
  } catch (err) {
    console.error("Erro ao salvar PDF consolidado do DDS:", err);
  }

  return doc;
}

function renderSingleDdsPage(
  doc: jsPDF,
  company: Company,
  registro: DdsRegistro,
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
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, "FD");

  let titleStartX = margin;
  let titleWidth = contentWidth;

  if (hasLeftLogo) {
    try {
      doc.addImage(empLogo!, "PNG", margin + 2, y + 2, 22, 16, undefined, "FAST");
      titleStartX += 24;
      titleWidth -= 24;
    } catch (e) {}
  }

  if (hasRightLogo) {
    try {
      doc.addImage(consultoriaLogo!, "PNG", margin + contentWidth - 24, y + 2, 22, 16, undefined, "FAST");
      titleWidth -= 24;
    } catch (e) {}
  }

  const titleCenterX = titleStartX + titleWidth / 2;

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("REGISTRO DE DIÁLOGO DE SEGURANÇA (DDS / DSS / DMS)", titleCenterX, y + 7.5, {
    align: "center",
  });

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    `COMPROVANTE DE CONSCIENTIZAÇÃO E PARTICIPAÇÃO EM SST • NR-01 / GRO-PGR`,
    titleCenterX,
    y + 13.5,
    { align: "center" }
  );

  y += 24;

  // 2. Company & Session Metadata Grid
  const empNome = company.empresa?.emp_razao || "Empresa Não Informada";
  const empCnpj = company.empresa?.emp_cnpj || "Não informado";
  const empGrau = company.empresa?.emp_grau_risco || "-";
  const empCidade = `${company.empresa?.emp_cidade || ""} - ${company.empresa?.emp_uf || ""}`.trim();

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
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      fontSize: 8,
    },
    body: [
      [
        { content: "EMPRESA / RAZÃO SOCIAL:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: empNome, colSpan: 3 },
        { content: "CNPJ:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: empCnpj },
      ],
      [
        { content: "UNIDADE / LOCAL:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: registro.localSetor || empCidade || "Instalações da Empresa", colSpan: 3 },
        { content: "GRAU DE RISCO:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: `Grau ${empGrau}` },
      ],
      [
        { content: "DATA DO DIÁLOGO:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: formatDate(registro.data) },
        { content: "HORÁRIO / DURAÇÃO:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: `${registro.horarioInicio || "07:30"} às ${registro.horarioTermino || "07:45"} (${registro.duracaoMinutos || "15 min"})` },
        { content: "PERIODICIDADE:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: registro.frequencia || "Diário (DDS)" },
      ],
      [
        { content: "FACILITADOR / MINISTRANTE:", styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
        { content: `${registro.ministranteNome} ${registro.ministranteCargo ? `(${registro.ministranteCargo})` : ""} ${registro.ministranteRegistro ? `• Reg: ${registro.ministranteRegistro}` : ""}`, colSpan: 5 },
      ],
    ],
  });

  y = (doc as any).lastAutoTable.finalY + 4;

  // 3. DDS Topic & Content Box
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(margin, y, contentWidth, 6, 1, 1, "FD");

  doc.setTextColor(30, 64, 175);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  const refText = registro.nrReferencia ? ` [Ref: ${registro.nrReferencia}]` : "";
  const codText = registro.temaCodigo ? ` (${registro.temaCodigo})` : "";
  doc.text(`TEMA ABORDADO: ${registro.temaTitulo.toUpperCase()}${codText}${refText}`, margin + 3, y + 4.2);

  y += 7.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);

  const cleanConteudo = (registro.temaConteudo || "").trim();
  const splitConteudo = doc.splitTextToSize(cleanConteudo, contentWidth - 5);
  const maxLines = 10;
  const renderedLines = splitConteudo.slice(0, maxLines);
  const contentBoxHeight = renderedLines.length * 3.2 + 4;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, contentBoxHeight, 1, 1, "FD");

  doc.text(renderedLines, margin + 2.5, y + 3.5);
  y += contentBoxHeight + 3.5;

  // 4. Compact Signatures Grid
  const participants = registro.participantes || [];

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.rect(margin, y, contentWidth, 5.5, "FD");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`LISTA DE PRESENÇA E ASSINATURA DOS TRABALHADORES PARTICIPANTES (${participants.length} REGISTRADOS)`, margin + 3, y + 3.8);

  y += 6.5;

  const tableData: any[] = participants.map((p, idx) => [
    { content: String(idx + 1).padStart(2, "0"), styles: { halign: "center", fontStyle: "bold" } },
    { content: p.nome || "Não informado", styles: { fontStyle: "bold" } },
    { content: p.cpfOuMatricula || "-" },
    { content: p.funcao || "-" },
    { content: p.setor || "-" },
    { content: "", styles: { minCellHeight: 8 } },
  ]);

  if (printBlankSignatures && tableData.length < 15) {
    const remaining = 15 - tableData.length;
    for (let i = 0; i < remaining; i++) {
      const idx = tableData.length + 1;
      tableData.push([
        { content: String(idx).padStart(2, "0"), styles: { halign: "center" } },
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
      fontSize: 7,
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
      fontSize: 7.5,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 54 },
      2: { cellWidth: 26 },
      3: { cellWidth: 36 },
      4: { cellWidth: 26 },
      5: { cellWidth: 36 },
    },
    head: [["Nº", "NOME COMPLETO", "CPF / MATRÍCULA", "FUNÇÃO", "SETOR", "ASSINATURA DIGITAL / RUBRICA"]],
    body: tableData as any,
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 5) {
        const participant = participants[data.row.index];
        if (participant && participant.assinaturaImg && !printBlankSignatures) {
          try {
            const cell = data.cell;
            const imgPadding = 0.8;
            const imgX = cell.x + imgPadding;
            const imgY = cell.y + imgPadding;
            const imgW = cell.width - imgPadding * 2;
            const imgH = cell.height - imgPadding * 2;
            doc.addImage(participant.assinaturaImg, "PNG", imgX, imgY, imgW, imgH, undefined, "FAST");
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

  y = (doc as any).lastAutoTable.finalY + 5;

  if (y > pageHeight - 35) {
    doc.addPage();
    y = margin;
  }

  // 5. Final Confirmation & Facilitator Signature
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("DECLARAÇÃO DE PARTICIPAÇÃO E CONSCIENTIZAÇÃO EM SST:", margin + 3, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  const termo = "Declaramos que participamos da instrução de SST sobre o tema acima especificado, compreendemos as orientações e riscos discutidos e comprometemo-nos a cumprir integralmente os procedimentos preventivos e normas de segurança da empresa.";
  const splitTermo = doc.splitTextToSize(termo, contentWidth - 65);
  doc.text(splitTermo, margin + 3, y + 8.5);

  const sigBoxX = margin + contentWidth - 60;
  doc.setDrawColor(203, 213, 225);
  doc.line(sigBoxX + 2, y + 17, sigBoxX + 58, y + 17);

  if (registro.ministranteAssinaturaImg && !printBlankSignatures) {
    try {
      doc.addImage(registro.ministranteAssinaturaImg, "PNG", sigBoxX + 10, y + 4, 38, 12, undefined, "FAST");
    } catch {}
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text(registro.ministranteNome, sigBoxX + 30, y + 19.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text("Responsável / Facilitador SST", sigBoxX + 30, y + 22.5, { align: "center" });
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return new Date().toLocaleDateString("pt-BR");
  try {
    const [year, month, day] = dateStr.split("-");
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
  } catch {}
  return dateStr;
}
