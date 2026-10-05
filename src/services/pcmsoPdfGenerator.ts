import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Company, PcmsoRegistroAso } from "../types";

export function generatePcmsoDocumentoBasePdf(company: Company): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  const emp = company.empresa || {};
  const funcoes = company.funcoes || [];

  const addHeaderFooter = (pageNumber: number, totalPages: number) => {
    doc.setFillColor(13, 148, 136); // Teal 600
    doc.rect(0, 0, pageWidth, 26, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("PROGRAMA DE CONTROLE MÉDICO DE SAÚDE OCUPACIONAL - PCMSO (NR-07)", margin, 17);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Portaria MTP nº 6.734/2020 • Art. 168 CLT", pageWidth - margin - 190, 17);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(margin, pageHeight - 28, pageWidth - margin, pageHeight - 28);

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${emp.emp_razao || "Empresa"} • CNPJ: ${emp.emp_cnpj || "N/I"}`,
      margin,
      pageHeight - 14
    );
    doc.text(
      `Página ${pageNumber} de ${totalPages}`,
      pageWidth - margin - 60,
      pageHeight - 14
    );
  };

  // ================= CAPA =================
  doc.setFillColor(240, 253, 250); // Teal 50
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setFillColor(13, 148, 136); // Teal 600
  doc.rect(0, 0, pageWidth, 115, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text("PCMSO - DOCUMENTO BASE", margin, 52);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("PROGRAMA DE CONTROLE MÉDICO DE SAÚDE OCUPACIONAL", margin, 72);
  doc.setFontSize(8.5);
  doc.setTextColor(204, 251, 241);
  doc.text("Conforme Norma Regulamentadora nº 07 (NR-07), Portaria MTP 6.734/2020 e Art. 168 da CLT", margin, 90);

  if (emp.emp_consultoria_logo || emp.emp_logo) {
    try {
      const logo = emp.emp_consultoria_logo || emp.emp_logo;
      doc.addImage(logo!, "JPEG", pageWidth - margin - 85, 25, 85, 48, undefined, "FAST");
    } catch {}
  }

  // Box 1: Identificação do Estabelecimento
  let y = 140;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(20, 184, 166);
  doc.roundedRect(margin, y, contentWidth, 180, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(13, 148, 136);
  doc.text("1. IDENTIFICAÇÃO DA EMPRESA", margin + 14, y + 22);

  doc.setDrawColor(204, 251, 241);
  doc.line(margin + 14, y + 30, pageWidth - margin - 14, y + 30);

  const empY = y + 48;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Razão Social:", margin + 14, empY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(emp.emp_razao || "Não informada", margin + 80, empY);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("CNPJ:", margin + 14, empY + 24);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(emp.emp_cnpj || "N/I", margin + 80, empY + 24);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("CNAE / Grau Risco:", margin + 280, empY + 24);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(`${emp.emp_cnae || "N/I"} (Grau ${emp.emp_grau_risco || "2"})`, margin + 375, empY + 24);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Endereço:", margin + 14, empY + 48);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(`${emp.emp_endereco || ""} - ${emp.emp_cidade || ""}/${emp.emp_uf || ""}`, margin + 80, empY + 48);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Vigência do Plano:", margin + 14, empY + 72);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  const anoAtual = new Date().getFullYear();
  doc.text(`Janeiro/${anoAtual} a Dezembro/${anoAtual} (12 Meses)`, margin + 105, empY + 72);

  // Box 2: Responsabilidade Médica
  y = 340;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(20, 184, 166);
  doc.roundedRect(margin, y, contentWidth, 115, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(13, 148, 136);
  doc.text("2. RESPONSABILIDADE MÉDICA (MÉDICO COORDENADOR / EXAMINADOR)", margin + 14, y + 22);

  const medNome = emp.emp_medico_coordenador || emp.emp_ass_tec_nome || "Médico do Trabalho Coordenador";
  const medCrm = emp.emp_medico_crm || emp.emp_ass_tec_registro || "CRM/UF Habilitado";

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Médico Coordenador:", margin + 14, y + 50);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(medNome, margin + 130, y + 50);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Registro CRM / RQE:", margin + 14, y + 70);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(medCrm, margin + 130, y + 70);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Diretriz Normativa:", margin + 14, y + 90);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text("Elaborado em consonância com o PGR / Inventário de Riscos Ocupacionais (NR-01)", margin + 130, y + 90);

  // Box 3: Objetivo do PCMSO
  y = 475;
  doc.setFillColor(240, 253, 250);
  doc.setDrawColor(153, 246, 228);
  doc.roundedRect(margin, y, contentWidth, 140, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(13, 148, 136);
  doc.text("3. OBJETIVO DO PROGRAMA MÉDICO (NR-07)", margin + 14, y + 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(19, 78, 74);
  const objTexto =
    "O PCMSO tem como objetivo promover e preservar a saúde do conjunto dos trabalhadores da empresa, mediante o rastreamento e diagnóstico precoce dos agravos à saúde relacionados ao trabalho, inclusive de natureza subclínica, além da constatação da existência de casos de doenças profissionais ou danos irreversíveis à saúde dos trabalhadores.\n\nEste programa baseia-se no reconhecimento dos riscos ocupacionais identificados e classificados no PGR (NR-01), estabelecendo os exames médicos clínicos e complementares específicos para cada Grupo Homogêneo de Exposição (GHE).";
  doc.text(doc.splitTextToSize(objTexto, contentWidth - 28), margin + 14, y + 36);

  // ================= PÁGINA 2: PROTOCOLO DE EXAMES POR CARGO / GHE =================
  doc.addPage();
  let currentY = 40;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(13, 148, 136);
  doc.text("4. PLANEJAMENTO DE EXAMES CLÍNICOS E COMPLEMENTARES POR FUNÇÃO", margin, currentY);
  currentY += 16;

  funcoes.forEach((func) => {
    const setor = company.setores.find((s) => s.setor_nome === func.func_setor || s.id === func.func_setor);
    const funcRiscos = company.riscos[func.id] || [];

    // Header do Cargo
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(20, 184, 166);
    doc.roundedRect(margin, currentY, contentWidth, 24, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(13, 148, 136);
    doc.text(`CARGO: ${func.func_nome.toUpperCase()} • Setor: ${setor?.setor_nome || func.func_setor || "Geral"} • CBO: ${func.func_cbo || "N/I"}`, margin + 8, currentY + 16);

    currentY += 28;

    // Gerar exames inteligentes conforme os riscos
    const examesRows: any[] = [
      ["Avaliação Clínica Ocupacional (Anamnese + Exame Físico)", "Todos os Riscos", "Admissional, Periódico Anual, Demissional, Retorno e Mudança", "Médico Examinador"],
    ];

    const hasRuido = funcRiscos.some((r) => r.toLowerCase().includes("ruído") || r.toLowerCase().includes("ruido"));
    const hasQuimico = funcRiscos.some((r) => r.toLowerCase().includes("químico") || r.toLowerCase().includes("solvente") || r.toLowerCase().includes("óleo") || r.toLowerCase().includes("fumo"));
    const hasPoeira = funcRiscos.some((r) => r.toLowerCase().includes("poeira") || r.toLowerCase().includes("sílica"));
    const hasAltura = funcRiscos.some((r) => r.toLowerCase().includes("altura") || r.toLowerCase().includes("queda"));
    const hasConfinado = funcRiscos.some((r) => r.toLowerCase().includes("confinado"));

    if (hasRuido) {
      examesRows.push(["Audiometria Ocupacional Tonal e Vocal", "Exposição a Ruído (Anexo II NR-07)", "Admissional, 6º mês, Periódico Anual e Demissional", "Fonoaudiólogo / Médico"]);
    }
    if (hasQuimico) {
      examesRows.push(["Hemograma Completo + Plaquetas", "Exposição a Vapores / Solventes", "Admissional, Semestral / Anual e Demissional", "Laboratório Clínico"]);
      examesRows.push(["Exames Toxicológicos / Indicadores Biológicos (IBE)", "Químicos Específicos (Quadro I NR-07)", "Conforme periodicidade do Anexo I", "Laboratório Clínico"]);
    }
    if (hasPoeira) {
      examesRows.push(["Radiografia de Tórax Padrão OIT", "Inalação de Poeiras Minerais", "Admissional, Bienal e Demissional", "Clínica Radiológica"]);
      examesRows.push(["Espirometria Ocupacional", "Inalação de Poeiras / Fumos", "Admissional, Bienal e Demissional", "Pneumologista"]);
    }
    if (hasAltura || hasConfinado) {
      examesRows.push(["Eletrocardiograma (ECG)", "Trabalho em Altura / Espaço Confinado", "Admissional, Anual e Demissional", "Cardiologista / Clínica"]);
      examesRows.push(["Eletroencefalograma (EEG)", "Trabalho em Altura / Espaço Confinado", "Admissional, Anual e Demissional", "Neurologista / Clínica"]);
      examesRows.push(["Glicemia de Jejum", "Avaliação Metabólica para Risco de Queda", "Admissional, Anual e Demissional", "Laboratório Clínico"]);
      examesRows.push(["Acuidade Visual / Teste de Visão", "Segurança Operacional", "Admissional, Anual e Demissional", "Oftalmologista / Clínica"]);
    }

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["Exame Clínico / Complementar", "Fator de Risco / Indicação", "Periodicidade Recomendada", "Profissional / Executante"]],
      body: examesRows,
      theme: "grid",
      headStyles: {
        fillColor: [13, 148, 136],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [15, 23, 42],
      },
      columnStyles: {
        0: { cellWidth: 150, fontStyle: "bold" },
        1: { cellWidth: 120 },
        2: { cellWidth: 150 },
        3: { cellWidth: contentWidth - 420 },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 16;

    if (currentY > pageHeight - 120) {
      doc.addPage();
      currentY = 40;
    }
  });

  // ================= PÁGINA FINAL: DIRETRIZES E ENCERRAMENTO =================
  doc.addPage();
  let endY = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(13, 148, 136);
  doc.text("5. DIRETRIZES TÉCNICAS E CRITÉRIOS DE APTIDÃO (NR-07)", margin, endY);
  endY += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const diretrizesTexto =
    "1. Todo exame médico ocupacional deverá compreender avaliação clínica (anamnese ocupacional e exame físico e mental) e os exames complementares específicos previstos neste programa.\n" +
    "2. Para cada exame realizado, o médico emitirá o ASO (Atestado de Saúde Ocupacional) em 2 (duas) vias, com entrega obrigatória da segunda via ao trabalhador mediante recibo.\n" +
    "3. Constatada ocorrência ou agravamento de doença relacionada ao trabalho, o médico coordenador notificará a empresa para emissão de CAT (Comunicação de Acidente de Trabalho) e reavaliação dos riscos no PGR.\n" +
    "4. Os dados médicos serão mantidos em prontuário clínico individual sob responsabilidade médica pelo período mínimo de 20 (vinte) anos após o desligamento do trabalhador.";
  doc.text(doc.splitTextToSize(diretrizesTexto, contentWidth), margin, endY);

  endY += 140;

  // Assinaturas
  const colWidth = (contentWidth - 30) / 2;

  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 20, endY + 40, margin + colWidth - 20, endY + 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(emp.emp_medico_coordenador || "Médico Coordenador do PCMSO", margin + colWidth / 2, endY + 55, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(emp.emp_medico_crm || "CRM/UF - Médico do Trabalho", margin + colWidth / 2, endY + 68, { align: "center" });

  const rightX = margin + colWidth + 30;
  doc.line(rightX + 20, endY + 40, rightX + colWidth - 20, endY + 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(emp.emp_ass_rep_nome || emp.emp_responsavel || "Representante Legal da Empresa", rightX + colWidth / 2, endY + 55, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`${emp.emp_razao || "Empresa"}`, rightX + colWidth / 2, endY + 68, { align: "center" });

  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) {
      addHeaderFooter(i, totalPages);
    }
  }

  const nomeEmpresa = (emp.emp_razao || "empresa").replace(/[^\w\d-_]+/g, "_").slice(0, 35);
  doc.save(`PCMSO_NR07_${nomeEmpresa}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function generateAsoIndividualPdf(company: Company, aso: PcmsoRegistroAso): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  const emp = company.empresa || {};

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 55, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("ASO - ATESTADO DE SAÚDE OCUPACIONAL", margin, 26);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text(`Tipo de Exame: ${aso.tipoAso.toUpperCase()} • Conforme NR-07 e Art. 168 da CLT`, margin, 42);

  if (emp.emp_logo || emp.emp_consultoria_logo) {
    try {
      const logo = emp.emp_logo || emp.emp_consultoria_logo;
      doc.addImage(logo!, "JPEG", pageWidth - margin - 60, 8, 60, 38, undefined, "FAST");
    } catch {}
  }

  let y = 70;

  // 1. Identificação da Empresa e do Trabalhador
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["1. DADOS DA EMPRESA E IDENTIFICAÇÃO DO TRABALHADOR", ""]],
    body: [
      ["Razão Social / CNPJ:", `${emp.emp_razao || "Empresa"} • CNPJ: ${emp.emp_cnpj || "N/I"}`],
      ["Nome do Colaborador:", aso.nomeEmpregado.toUpperCase()],
      ["CPF / Matrícula:", `${aso.cpf} • Matrícula: ${aso.matricula || "N/I"}`],
      ["Data de Nascimento:", aso.dataNascimento ? aso.dataNascimento.split("-").reverse().join("/") : "Não informada"],
      ["Cargo / Função:", `${aso.funcaoNome} • Setor: ${aso.setorNome}`],
      ["Data da Realização:", aso.dataRealizacao ? aso.dataRealizacao.split("-").reverse().join("/") : new Date().toLocaleDateString("pt-BR")],
    ],
    theme: "plain",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 140, fontStyle: "bold", textColor: [71, 85, 105] },
      1: { cellWidth: contentWidth - 140 },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // 2. Riscos Ocupacionais do PGR
  const funcaoRiscos = company.riscos[aso.funcaoId] || [];
  const riscosText = funcaoRiscos.length > 0 ? funcaoRiscos.join(", ") : "Ausência de riscos específicos / Risco padrão";

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["2. FATORES DE RISCOS OCUPACIONAIS IDENTIFICADOS (PGR / GRO)"]],
    body: [[riscosText]],
    theme: "grid",
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [15, 23, 42],
      cellPadding: 5,
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // 3. Exames Médicos Realizados
  const examesTableBody =
    aso.examesRealizados && aso.examesRealizados.length > 0
      ? aso.examesRealizados.map((e) => [
          e.nome,
          e.data ? e.data.split("-").reverse().join("/") : aso.dataRealizacao,
          e.resultado,
        ])
      : [["Avaliação Clínica Ocupacional", aso.dataRealizacao, "Normal"]];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Exame Realizado", "Data", "Resultado Clínico"]],
    body: examesTableBody,
    theme: "grid",
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 280, fontStyle: "bold" },
      1: { cellWidth: 100, halign: "center" },
      2: { cellWidth: contentWidth - 380, halign: "center" },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // 4. Parecer de Aptidão Médica
  const isApto = aso.resultado === "Apto";
  const isRestricao = aso.resultado === "Apto com Restrição";

  doc.setFillColor(isApto ? 240 : 254, isApto ? 253 : 242, isApto ? 244 : 242);
  doc.setDrawColor(isApto ? 34 : 239, isApto ? 197 : 68, isApto ? 94 : 68);
  doc.roundedRect(margin, y, contentWidth, 55, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(isApto ? 22 : 185, isApto ? 101 : 28, isApto ? 52 : 28);
  doc.text(`PARECER MÉDICO CONCLUSIVO: ${aso.resultado.toUpperCase()}`, margin + 12, y + 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    isApto
      ? "O trabalhador acima qualificado foi submetido aos exames clínicos e complementares preconizados no PCMSO e encontra-se APTO para o exercício de suas funções habituais."
      : isRestricao
      ? `O trabalhador encontra-se APTO COM RESTRIÇÕES para o exercício das atividades: ${aso.restricoes || "Conforme orientação médica anexa"}.`
      : "O trabalhador encontra-se INAPTO temporariamente ou definitivamente para a função avaliada.",
    margin + 12,
    y + 38,
    { maxWidth: contentWidth - 24 }
  );

  y += 75;

  // 5. Assinaturas
  const colW = (contentWidth - 30) / 2;

  // Médico Examinador
  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 10, y + 30, margin + colW - 10, y + 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(aso.medicoExaminadorNome || "Médico Examinador", margin + colW / 2, y + 42, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`CRM: ${aso.medicoExaminadorCrm} / ${aso.medicoExaminadorUf}`, margin + colW / 2, y + 53, { align: "center" });

  // Assinatura Trabalhador
  const rightX = margin + colW + 30;
  doc.line(rightX + 10, y + 30, rightX + colW - 10, y + 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(aso.nomeEmpregado || "Assinatura do Trabalhador", rightX + colW / 2, y + 42, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text("Declaro ter recebido a 2ª via deste ASO", rightX + colW / 2, y + 53, { align: "center" });

  const nomeArquivo = `ASO_${aso.tipoAso}_${aso.nomeEmpregado.replace(/[^\w\d-_]+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(nomeArquivo);
}

export function generateConvocacaoAsoPdf(
  company: Company,
  aso: PcmsoRegistroAso,
  examesRecomendados: string[] = []
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  const emp = company.empresa || {};

  // Cabeçalho Oficial
  doc.setFillColor(13, 148, 136); // Teal 600
  doc.rect(0, 0, pageWidth, 55, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("CONVOCAÇÃO OFICIAL PARA EXAME MÉDICO OCUPACIONAL", margin, 28);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Programa de Controle Médico de Saúde Ocupacional - NR-07 • Art. 168 CLT", margin, 44);

  let y = 80;

  // Informações da Empresa
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("EMPRESA CONVOCANTE:", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `${emp.emp_razao || emp.emp_fantasia || "Empresa"} | CNPJ: ${emp.emp_cnpj || "Não informado"}`,
    margin,
    y + 14
  );
  doc.text(
    `Endereço: ${emp.emp_endereco || ""} ${emp.emp_bairro || ""} - ${emp.emp_cidade || ""}/${emp.emp_uf || ""}`,
    margin,
    y + 27
  );

  y += 50;

  // Bloco Trabalhador
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 75, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(13, 148, 136);
  doc.text("DADOS DO COLABORADOR CONVOCADO", margin + 12, y + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Nome:", margin + 12, y + 33);
  doc.setFont("helvetica", "normal");
  doc.text(aso.nomeEmpregado, margin + 48, y + 33);

  doc.setFont("helvetica", "bold");
  doc.text("CPF:", margin + 280, y + 33);
  doc.setFont("helvetica", "normal");
  doc.text(aso.cpf || "-", margin + 308, y + 33);

  doc.setFont("helvetica", "bold");
  doc.text("Cargo / Função:", margin + 12, y + 50);
  doc.setFont("helvetica", "normal");
  doc.text(aso.funcaoNome, margin + 92, y + 50);

  doc.setFont("helvetica", "bold");
  doc.text("Setor:", margin + 280, y + 50);
  doc.setFont("helvetica", "normal");
  doc.text(aso.setorNome, margin + 312, y + 50);

  if (aso.telefone) {
    doc.setFont("helvetica", "bold");
    doc.text("WhatsApp/Tel:", margin + 12, y + 66);
    doc.setFont("helvetica", "normal");
    doc.text(aso.telefone, margin + 85, y + 66);
  }

  y += 92;

  // Texto da Convocação
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("COMUNICADO DE AGENDAMENTO DE EXAME OCUPACIONAL", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const textoConvocacao = `Vimos por meio deste instrumento CONVOCAR V. Sa. para a realização do EXAME MÉDICO OCUPACIONAL PERIÓDICO, em cumprimento às disposições legais contidas na Norma Regulamentadora nº 07 (NR-07) do Ministério do Trabalho e Emprego e no Artigo 168 da Consolidação das Leis do Trabalho (CLT).\n\nA realização do exame médico periódico é OBRIGATÓRIA e visa exclusivamente à preservação e monitoramento da sua saúde e aptidão física e mental para o exercício de suas funções, sem qualquer custo financeiro para o empregado.`;

  const splitTexto = doc.splitTextToSize(textoConvocacao, contentWidth);
  doc.text(splitTexto, margin, y + 15);

  y += splitTexto.length * 12 + 25;

  // Dados do Agendamento / Vencimento
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(248, 113, 113);
  doc.roundedRect(margin, y, contentWidth, 55, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(185, 28, 28);
  doc.text("PRAZO LIMITE / DATA DE VENCIMENTO DO ASO PERIÓDICO:", margin + 12, y + 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(
    aso.dataValidade ? aso.dataValidade.split("-").reverse().join("/") : "Imediato",
    margin + 12,
    y + 36
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Clínica / Local: ${aso.clinicaExame || "Clínica de Medicina Ocupacional credenciada / SESMT"}`,
    margin + 160,
    y + 36
  );

  y += 70;

  // Lista de Exames a Realizar
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("EXAMES PRECONIZADOS NO PROTOCOLO NR-07:", margin, y);

  y += 12;
  const listaExames = examesRecomendados.length > 0
    ? examesRecomendados
    : ["Avaliação Clínica Ocupacional (Anamnese + Exame Físico Geral)", "Exames complementares conforme riscos do PGR"];

  listaExames.forEach((ex, idx) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`• ${ex}`, margin + 10, y + (idx * 14));
  });

  y += (listaExames.length * 14) + 20;

  // Instruções e Orientações
  doc.setFillColor(240, 253, 250);
  doc.setDrawColor(94, 234, 212);
  doc.roundedRect(margin, y, contentWidth, 50, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(13, 148, 136);
  doc.text("ORIENTAÇÕES IMPORTANTES PARA O DIA DO EXAME:", margin + 10, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text("1. Comparecer munido de documento oficial de identidade com foto (RG, CNH ou Carteira de Trabalho digital).", margin + 10, y + 26);
  doc.text("2. Em caso de exames de sangue laboratoriais, respeitar o jejum prescrito de 8 a 12 horas.", margin + 10, y + 36);
  doc.text("3. Para exame de audiometria, manter repouso auditivo de pelo menos 14 horas anteriores ao teste.", margin + 10, y + 46);

  y += 75;

  // Termo de Ciência e Protocolo de Recebimento
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.75);
  doc.line(margin, y, pageWidth - margin, y);

  y += 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("TERMO DE CIÊNCIA E PROTOCOLO DE RECEBIMENTO DO TRABALHADOR", margin, y);

  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Declaro que fui devidamente notificado e convocado em _____/_____/_________ para a realização dos exames ocupacionais acima descritos, comprometendo-me a comparecer na data e horário agendados.`,
    margin,
    y,
    { maxWidth: contentWidth }
  );

  y += 45;

  const colW = (contentWidth - 40) / 2;

  // Assinatura do Empregador / RH
  doc.line(margin, y, margin + colW, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("Responsável RH / Medicina do Trabalho", margin + colW / 2, y + 12, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(emp.emp_razao || "Empresa Empregadora", margin + colW / 2, y + 22, { align: "center" });

  // Assinatura do Trabalhador
  const rightX = margin + colW + 40;
  doc.line(rightX, y, rightX + colW, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(aso.nomeEmpregado, rightX + colW / 2, y + 12, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`CPF: ${aso.cpf || "Assinatura do Empregado"}`, rightX + colW / 2, y + 22, { align: "center" });

  const nomeArquivo = `Convocacao_ASO_${aso.nomeEmpregado.replace(/[^\w\d-_]+/g, "_")}.pdf`;
  doc.save(nomeArquivo);
}
