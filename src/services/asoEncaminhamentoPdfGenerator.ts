import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Company, AsoEncaminhamento, ClinicaCredenciada } from "../types";

export function generateAsoEncaminhamentoPdf(
  company: Company,
  encaminhamento: AsoEncaminhamento,
  clinica?: ClinicaCredenciada
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 28;
  const contentWidth = pageWidth - margin * 2;

  const emp = company.empresa || {};
  const isCandidato = encaminhamento.tipoTrabalhador === "candidato";

  // Formatação de data brasileira (DD/MM/AAAA)
  const formatarData = (d?: string) => {
    if (!d) return "—";
    try {
      const [y, m, day] = d.split("-");
      if (y && m && day) return `${day}/${m}/${y}`;
      return d;
    } catch {
      return d;
    }
  };

  // Cálculo de idade
  const calcIdade = (nasc?: string) => {
    if (!nasc) return "";
    try {
      const d = new Date(nasc);
      const hoje = new Date();
      let idade = hoje.getFullYear() - d.getFullYear();
      if (
        hoje.getMonth() < d.getMonth() ||
        (hoje.getMonth() === d.getMonth() && hoje.getDate() < d.getDate())
      ) {
        idade--;
      }
      return idade > 0 ? `${idade} anos` : "";
    } catch {
      return "";
    }
  };

  // =========================================================================
  // 1. BARRA SUPERIOR (CABEÇALHO DA VIA)
  // Conforme solicitação: removido "SST VISTORIA" e removido
  // "GUIA DE ENCAMINHAMENTO OCUPACIONAL (NR-07)"
  // Se houver consultoria cadastrada na empresa, exibe o nome da consultoria.
  // =========================================================================
  const consultoriaTop = (emp.emp_consultoria_razao || emp.emp_consultoria || "").trim();
  let y = 24;

  if (consultoriaTop) {
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, pageWidth, 24, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(52, 211, 153); // Emerald 400
    doc.text(consultoriaTop.toUpperCase(), margin, 16);
    y = 32;
  }

  // =========================================================================
  // 2. CABEÇALHO: DADOS DA CLÍNICA & IDENTIFICAÇÃO DO EXAME
  // Prevenção de corte horizontal: textos da clínica contidos e organizados
  // =========================================================================
  const cardClinicaH = 84;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.roundedRect(margin, y, contentWidth, cardClinicaH, 5, 5, "FD");

  // Largura reservada para o bloco da direita (Título e Pill de Exame)
  const boxRightW = 185;
  const boxRightX = pageWidth - margin - boxRightW - 10;
  const maxClinicaW = boxRightX - margin - 14;

  // Lado esquerdo: Dados da Clínica Credenciada
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const nomeClinica = clinica?.nome || encaminhamento.clinicaNome || "Clínica Credenciada de Medicina Ocupacional";
  const nomeClinicaLines = doc.splitTextToSize(nomeClinica, maxClinicaW);
  doc.text(nomeClinicaLines[0] || nomeClinica, margin + 10, y + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  const medTxt = [
    clinica?.especialidade || "Medicina do Trabalho",
    clinica?.medicoResponsavel ? `Médico Resp.: ${clinica.medicoResponsavel}` : "",
    clinica?.crm ? `CRM: ${clinica.crm}${clinica.crmUf ? "/" + clinica.crmUf : ""}` : "",
  ]
    .filter(Boolean)
    .join(" • ");
  if (medTxt) {
    const medLines = doc.splitTextToSize(medTxt, maxClinicaW);
    doc.text(medLines[0], margin + 10, y + 29);
  }

  const logradouroFormatado = [
    clinica?.logradouro ? `${clinica.logradouro}${clinica.numero ? ", " + clinica.numero : ""}` : "",
    clinica?.complemento || "",
  ]
    .filter(Boolean)
    .join(" - ");

  const endClinica = [
    logradouroFormatado,
    clinica?.bairro || "",
    clinica?.cidade ? `${clinica.cidade}${clinica.uf ? "/" + clinica.uf : ""}` : "",
    clinica?.cep ? `CEP: ${clinica.cep}` : "",
  ]
    .filter(Boolean)
    .join(" - ");
  if (endClinica) {
    const endLines = doc.splitTextToSize(endClinica, maxClinicaW);
    doc.text(endLines[0], margin + 10, y + 42);
  }

  // Linha 1 de contato: Telefones
  const tels = [
    clinica?.telefone ? `Tel: ${clinica.telefone}` : "",
    clinica?.whatsapp ? `WhatsApp: ${clinica.whatsapp}` : "",
  ]
    .filter(Boolean)
    .join(" • ");
  if (tels) {
    const telsLines = doc.splitTextToSize(tels, maxClinicaW);
    doc.text(telsLines[0], margin + 10, y + 55);
  }

  // Linha 2 de contato: E-mail em linha própria (evita corte horizontal)
  if (clinica?.email) {
    const emailTxt = `E-mail: ${clinica.email}`;
    const emailLines = doc.splitTextToSize(emailTxt, maxClinicaW);
    doc.text(emailLines[0], margin + 10, y + 68);
  }

  // Lado direito: Título do Documento e Badge do Tipo de Exame
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129); // Emerald 600
  doc.text("ENCAMINHAMENTO MÉDICO", boxRightX, y + 18);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("NR-07 • Portaria MTP 6.734/2020 • Art. 168 CLT", boxRightX, y + 30);

  // Tipo de Exame Pill com texto perfeitamente centralizado
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(boxRightX, y + 38, boxRightW, 22, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  const tipoTxt = `EXAME ${encaminhamento.tipoExame.toUpperCase()}`;
  const tipoTxtW = doc.getTextWidth(tipoTxt);
  doc.text(tipoTxt, boxRightX + (boxRightW - tipoTxtW) / 2, y + 52);

  y += cardClinicaH + 6;

  // =========================================================================
  // 3. BOX: INSTRUÇÕES PARA O ATENDIMENTO
  // =========================================================================
  const cardInstrH = 26;
  doc.setFillColor(240, 253, 244); // Green 50
  doc.setDrawColor(187, 247, 208); // Green 200
  doc.roundedRect(margin, y, contentWidth, cardInstrH, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52); // Green 800
  doc.text("INSTRUÇÕES IMPORTANTES PARA O ATENDIMENTO:", margin + 8, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(21, 128, 61);
  doc.text(
    "Apresentar este documento com documento oficial com foto e CPF original ou CNH. Em caso de exames laboratoriais, observar jejum se orientado.",
    margin + 8,
    y + 20
  );

  y += cardInstrH + 6;

  // =========================================================================
  // 4. GRID DE DADOS: EMPRESA SOLICITANTE E TRABALHADOR
  // =========================================================================
  const colW = (contentWidth - 10) / 2;
  const cardGridH = 94;

  // Coluna 1: Empresa Contratante
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, colW, cardGridH, 4, 4, "FD");

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, colW, 18, 4, 4, "F");
  doc.rect(margin, y + 10, colW, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("DADOS DA EMPRESA SOLICITANTE", margin + 8, y + 12);

  let empY = y + 28;
  const addField = (lbl: string, val: string, xPos: number, yPos: number, maxW: number = colW - 75) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(lbl, xPos, yPos);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    const textTrunc = doc.splitTextToSize(val || "—", maxW);
    doc.text(textTrunc[0] || "—", xPos + 58, yPos);
  };

  addField("Razão Social:", encaminhamento.empresaRazao || emp.emp_razao || "—", margin + 8, empY);
  empY += 13;
  addField("CNPJ:", encaminhamento.empresaCnpj || emp.emp_cnpj || "—", margin + 8, empY);
  empY += 13;
  addField("CNAE:", emp.emp_cnae || "—", margin + 8, empY);
  empY += 13;
  addField("Grau Risco:", emp.emp_grau_risco ? `Grau ${emp.emp_grau_risco} (NR-04)` : "—", margin + 8, empY);
  empY += 13;
  const endEmpCompleto = [
    emp.emp_endereco || "",
    emp.emp_bairro || "",
    emp.emp_cidade ? `${emp.emp_cidade}/${emp.emp_uf || ""}` : "",
  ]
    .filter(Boolean)
    .join(", ");
  addField("Endereço:", endEmpCompleto || "—", margin + 8, empY);

  // Coluna 2: Dados do Trabalhador / Candidato
  const col2X = margin + colW + 10;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(col2X, y, colW, cardGridH, 4, 4, "FD");

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(col2X, y, colW, 18, 4, 4, "F");
  doc.rect(col2X, y + 10, colW, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const tituloTrab = isCandidato
    ? "DADOS DO CANDIDATO (PRÉ-ADMISSÃO)"
    : "DADOS DO TRABALHADOR";
  doc.text(tituloTrab, col2X + 8, y + 12);

  let trabY = y + 28;
  addField("Nome:", encaminhamento.nomeTrabalhador || "—", col2X + 8, trabY);
  trabY += 13;
  addField("CPF:", encaminhamento.cpf || "—", col2X + 8, trabY);
  trabY += 13;
  const nascTxt = encaminhamento.dataNascimento
    ? `${formatarData(encaminhamento.dataNascimento)} ${calcIdade(encaminhamento.dataNascimento) ? "(" + calcIdade(encaminhamento.dataNascimento) + ")" : ""}`
    : "—";
  addField("Nascimento:", nascTxt, col2X + 8, trabY);
  trabY += 13;
  addField("Cargo / Função:", encaminhamento.cargo || "—", col2X + 8, trabY);
  trabY += 13;
  const setorCbo = [
    encaminhamento.setor ? `Setor: ${encaminhamento.setor}` : "",
    encaminhamento.cbo ? `CBO: ${encaminhamento.cbo}` : "",
  ]
    .filter(Boolean)
    .join(" • ");
  addField("Setor / CBO:", setorCbo || "—", col2X + 8, trabY);

  y += cardGridH + 6;

  // =========================================================================
  // 5. BOX: RISCOS OCUPACIONAIS IDENTIFICADOS NO PGR (NR-01)
  // =========================================================================
  const cardRiscosH = 40;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, cardRiscosH, 4, 4, "FD");

  doc.setFillColor(254, 243, 199); // Amber 100
  doc.roundedRect(margin, y, contentWidth, 16, 4, 4, "F");
  doc.rect(margin, y + 8, contentWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.text("FATORES DE RISCO OCUPACIONAIS IDENTIFICADOS NO PGR (NR-01)", margin + 8, y + 11);

  const riscosList = encaminhamento.riscosOcupacionais || [];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);

  if (riscosList.length > 0) {
    const riscosFormatados = riscosList.join(" • ");
    const riscosLines = doc.splitTextToSize(riscosFormatados, contentWidth - 16);
    doc.text(riscosLines.slice(0, 2), margin + 8, y + 26);
  } else {
    doc.text(
      "Ausência de riscos específicos / Riscos não classificados como nocivos segundo inventário do PGR.",
      margin + 8,
      y + 26
    );
  }

  y += cardRiscosH + 6;

  // =========================================================================
  // 6. TABELA DE EXAMES SOLICITADOS (NR-07 + TABELA 27 DO ESOCIAL)
  // Utiliza pageBreak: 'avoid' para não quebrar a página
  // =========================================================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `EXAMES MÉDICOS E COMPLEMENTARES SOLICITADOS (${encaminhamento.examesSolicitados.length})`,
    margin,
    y + 8
  );

  const tableRows = encaminhamento.examesSolicitados.map((ex, idx) => [
    String(idx + 1),
    ex.nome,
    ex.codigoEsocial ? `Tabela 27: ${ex.codigoEsocial}` : "—",
    ex.detalhe || "Conforme protocolo médico NR-07",
    "[   ] Realizado",
  ]);

  autoTable(doc, {
    startY: y + 13,
    margin: { left: margin, right: margin },
    pageBreak: "avoid",
    head: [["#", "Procedimento Diagnóstico / Exame", "Cód. eSocial", "Indicação / Observação", "Visto Clínico"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "left",
      cellPadding: 3.5,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 3,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { cellWidth: 20, halign: "center" },
      1: { cellWidth: 195, fontStyle: "bold" },
      2: { cellWidth: 85, textColor: [37, 99, 235], fontStyle: "bold" },
      3: { cellWidth: 145, textColor: [71, 85, 105] },
      4: { cellWidth: 94, halign: "center", fontStyle: "bold" },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || y + 60;
  y = finalY + 6;

  // =========================================================================
  // 7. OBSERVAÇÕES CLÍNICAS (SE EXISTIREM)
  // =========================================================================
  if (encaminhamento.observacoes) {
    const cardObsH = 26;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, cardObsH, 4, 4, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text("OBSERVAÇÕES CLÍNICAS / ORIENTAÇÕES:", margin + 8, y + 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    const obsLines = doc.splitTextToSize(encaminhamento.observacoes, contentWidth - 16);
    doc.text(obsLines.slice(0, 2), margin + 8, y + 19);
    y += cardObsH + 6;
  }

  // =========================================================================
  // 8. FUNDAMENTAÇÃO LEGAL E ARQUIVAMENTO
  // =========================================================================
  const cardLegalH = 22;
  doc.setFillColor(254, 242, 242); // Red 50
  doc.setDrawColor(254, 202, 202); // Red 200
  doc.roundedRect(margin, y, contentWidth, cardLegalH, 4, 4, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(153, 27, 27); // Red 800
  doc.text("FUNDAMENTAÇÃO LEGAL E ARQUIVAMENTO (NR-07 item 7.5.19):", margin + 8, y + 9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "O ASO final emitido deve ser guardado pelo empregador pelo período mínimo de 20 (vinte) anos após o desligamento do trabalhador.",
    margin + 8,
    y + 18
  );

  y += cardLegalH + 6;

  // =========================================================================
  // 9. ASSINATURAS E CARIMBO (3 COLUNAS)
  // Posicionamento dinâmico calculado com folga para NUNCA cortar na impressão
  // =========================================================================
  const signBoxW = (contentWidth - 20) / 3;
  // Garante que fique assentado de forma harmoniosa acima do rodapé
  const yAssinaturas = Math.max(y + 12, pageHeight - 110);

  // Assinatura 1: Empresa Solicitante
  const sign1X = margin;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.75);
  doc.line(sign1X, yAssinaturas + 32, sign1X + signBoxW, yAssinaturas + 32);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  const empRazaoCurta = (emp.emp_razao || "Empresa Solicitante").substring(0, 34);
  doc.text(empRazaoCurta, sign1X + signBoxW / 2, yAssinaturas + 42, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Emissão: ${formatarData(encaminhamento.dataEmissao)}`,
    sign1X + signBoxW / 2,
    yAssinaturas + 52,
    { align: "center" }
  );

  // Assinatura 2: Trabalhador / Candidato
  const sign2X = margin + signBoxW + 10;
  doc.line(sign2X, yAssinaturas + 32, sign2X + signBoxW, yAssinaturas + 32);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  const nomeTrabCurto = (encaminhamento.nomeTrabalhador || "Trabalhador(a)").substring(0, 34);
  doc.text(nomeTrabCurto, sign2X + signBoxW / 2, yAssinaturas + 42, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `CPF: ${encaminhamento.cpf || "—"}`,
    sign2X + signBoxW / 2,
    yAssinaturas + 52,
    { align: "center" }
  );

  // Assinatura 3: Médico Examinador (Clínica)
  const sign3X = margin + (signBoxW + 10) * 2;
  doc.line(sign3X, yAssinaturas + 32, sign3X + signBoxW, yAssinaturas + 32);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  const medNomeCurto = (clinica?.medicoResponsavel || "Médico Examinador").substring(0, 34);
  doc.text(medNomeCurto, sign3X + signBoxW / 2, yAssinaturas + 42, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Carimbo e Data do Exame`,
    sign3X + signBoxW / 2,
    yAssinaturas + 52,
    { align: "center" }
  );

  // =========================================================================
  // 10. RODAPÉ (VIA ÚNICA)
  // Conforme solicitação: removido "SST Vistoria", removido
  // "NR-07 / Portaria MTP 6.734/2020 • Documento Operacional"
  // Margem inferior segura de 14 pt para nunca cortar na impressão física.
  // =========================================================================
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, pageHeight - 24, pageWidth - margin, pageHeight - 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const rodapeTexto = consultoriaTop
    ? `${consultoriaTop} • Guia de Encaminhamento Ocupacional • ID: ${encaminhamento.id}`
    : `Guia de Encaminhamento Ocupacional • ID: ${encaminhamento.id}`;
  doc.text(
    rodapeTexto,
    margin,
    pageHeight - 14
  );

  // =========================================================================
  // 11. DOWNLOAD DO ARQUIVO PDF (VIA ÚNICA)
  // =========================================================================
  const nomeLimpo = (encaminhamento.nomeTrabalhador || "Encaminhamento_ASO")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .substring(0, 30);
  const dataHoje = new Date().toISOString().slice(0, 10);
  doc.save(`Encaminhamento_ASO_${nomeLimpo}_${dataHoje}.pdf`);
}
