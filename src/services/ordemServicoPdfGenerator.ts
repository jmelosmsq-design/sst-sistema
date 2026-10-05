import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Company, FuncaoData } from "../types";

export interface OrdemServicoOptions {
  nomeEmpregado?: string;
  cpfEmpregado?: string;
  matricula?: string;
  dataAdmissao?: string;
}

export function generateOrdemServicoPdf(
  company: Company,
  funcao: FuncaoData,
  options?: OrdemServicoOptions
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  const emp = company.empresa || {};
  const setor = company.setores.find((s) => s.setor_nome === funcao.func_setor || s.id === funcao.func_setor);
  const riscos = company.riscos[funcao.id] || [];

  // Header
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, pageWidth, 55, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("ORDEM DE SERVIÇO DE SEGURANÇA E SAÚDE NO TRABALHO", margin, 26);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text("Conforme Norma Regulamentadora nº 01 (NR-01 item 1.4.1) e Art. 157 da CLT", margin, 42);

  if (emp.emp_logo || emp.emp_consultoria_logo) {
    try {
      const logo = emp.emp_logo || emp.emp_consultoria_logo;
      doc.addImage(logo!, "JPEG", pageWidth - margin - 60, 8, 60, 38, undefined, "FAST");
    } catch {}
  }

  let y = 70;

  // 1. Dados da Empresa e do Trabalhador
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["1. DADOS DA EMPRESA E IDENTIFICAÇÃO DO COLABORADOR", ""]],
    body: [
      ["Razão Social:", emp.emp_razao || "Empresa"],
      ["CNPJ / Estabelecimento:", `${emp.emp_cnpj || "N/I"} • CNAE: ${emp.emp_cnae || "N/I"} • Grau de Risco: ${emp.emp_grau_risco || "2"}`],
      ["Colaborador:", options?.nomeEmpregado || "__________________________________________________"],
      ["CPF / Matrícula:", `${options?.cpfEmpregado || "___.___.___-__"} • Matrícula: ${options?.matricula || "________"}`],
      ["Função / Cargo:", `${funcao.func_nome.toUpperCase()} • CBO: ${funcao.func_cbo || "N/I"}`],
      ["Setor / Lotação:", setor?.setor_nome || funcao.func_setor || "Geral"],
      ["Jornada de Trabalho:", funcao.func_jornada || funcao.func_turno || "44 horas semanais"],
    ],
    theme: "plain",
    headStyles: {
      fillColor: [51, 65, 85],
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

  y = (doc as any).lastAutoTable.finalY + 12;

  // 2. Descrição das Atividades
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["2. DESCRIÇÃO DAS ATIVIDADES DA FUNÇÃO"]],
    body: [
      [
        funcao.func_descricao ||
          "Executar tarefas inerentes ao cargo com estrita observância às normas de segurança, procedimentos operacionais estabelecidos e instruções da liderança.",
      ],
    ],
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

  y = (doc as any).lastAutoTable.finalY + 12;

  // 3. Riscos Ocupacionais Identificados
  const riscosTexto =
    riscos.length > 0
      ? riscos.map((r, i) => `${i + 1}. ${r}`).join("   •   ")
      : "Risco padrão leve inerente à atividade (físico, ergonômico ou de acidentes leves).";

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["3. RISCOS OCUPACIONAIS IDENTIFICADOS NO POSTO (PGR / GRO)"]],
    body: [[riscosTexto]],
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

  y = (doc as any).lastAutoTable.finalY + 12;

  // 4. Equipamentos de Proteção Obrigatórios (EPI e EPC)
  const epiItems =
    funcao.func_epis_lista && funcao.func_epis_lista.length > 0
      ? funcao.func_epis_lista.map((e) => `• ${e.nome} (CA: ${e.ca || "N/I"})`).join("\n")
      : funcao.func_epis
      ? `• ${funcao.func_epis}`
      : "• Calçado de segurança com biqueira\n• Óculos de proteção\n• Protetor auricular (quando aplicável)\n• Luvas de proteção adequadas";

  const epcItems = funcao.func_epcs || "• Ventilação adequada, extintores de incêndio sinalizados e guarda-corpos.";

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["4. EQUIPAMENTOS DE PROTEÇÃO INDIVIDUAL (EPI) E COLETIVA (EPC) OBRIGATÓRIOS"]],
    body: [
      [`EPIs DE USO OBRIGATÓRIO (NR-06):\n${epiItems}\n\nEPCs EXISTENTES NO SETOR:\n${epcItems}`],
    ],
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

  y = (doc as any).lastAutoTable.finalY + 12;

  // 5. Procedimentos Preventivos e Normas Internas
  const normasTexto =
    "• Cumprir integralmente as disposições legais e regulamentares sobre segurança e saúde no trabalho, inclusive as ordens de serviço expedidas pelo empregador;\n" +
    "• Usar obrigatoriamente e de forma correta todos os EPIs fornecidos pela empresa durante toda a jornada de trabalho;\n" +
    "• Comunicar imediatamente à chefia imediata e ao SESMT qualquer anomalia, quebra ou defeito nos equipamentos e ferramentas de trabalho;\n" +
    "• Manter o local de trabalho limpo, desobstruído e organizado (princípios de 5S e segurança);\n" +
    "• Submeter-se aos exames médicos previstos no PCMSO (Admissional, Periódico, Retorno, Mudança de Risco e Demissional).";

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["5. MEDIDAS PREVENTIVAS E PROCEDIMENTOS OPERACIONAIS DE SEGURANÇA"]],
    body: [[normasTexto]],
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

  y = (doc as any).lastAutoTable.finalY + 12;

  // Se o espaço não for suficiente para proibições e assinatura, adiciona nova página
  if (y > pageHeight - 200) {
    doc.addPage();
    y = 40;
  }

  // 6. Proibições e Atos Inseguros
  const proibicoesTexto =
    "• Executar serviços para os quais não esteja autorizado, capacitado e formalmente treinado;\n" +
    "• Operar máquinas sem as devidas proteções coletivas ou burlar dispositivos de segurança (NR-12);\n" +
    "• Ingerir bebidas alcoólicas, substâncias entorpecentes ou trabalhar sob efeito de medicamentos sedativos;\n" +
    "• Deixar de utilizar os EPIs recomendados ou utilizá-los de forma indevida e danificada;\n" +
    "• Realizar brincadeiras, correr ou promover distrações durante o exercício de atividades de risco.";

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["6. PROIBIÇÕES EXPRESSAS (ATOS INSEGUROS E INFRAÇÕES)"]],
    body: [[proibicoesTexto]],
    theme: "grid",
    headStyles: {
      fillColor: [185, 28, 28], // Red 700
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

  y = (doc as any).lastAutoTable.finalY + 12;

  // 7. Termo de Ciência e Compromisso
  const termoCiencia =
    "Declaro que recebi cópia desta ORDEM DE SERVIÇO DE SEGURANÇA E SAÚDE NO TRABALHO, fui devidamente orientado e treinado quanto aos riscos das minhas atividades, às medidas de prevenção e ao uso obrigatório dos EPIs. Comprometo-me a cumprir todas as instruções aqui contidas, estando ciente de que o não cumprimento constitui ato faltoso passível de penalidades disciplinares conforme o Art. 158 da CLT.";

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["7. TERMO DE RECEBIMENTO, CIÊNCIA E COMPROMISSO DO COLABORADOR"]],
    body: [[termoCiencia]],
    theme: "grid",
    headStyles: {
      fillColor: [30, 58, 138], // Blue 900
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

  y = (doc as any).lastAutoTable.finalY + 28;

  // Campos de Assinatura
  const colW = (contentWidth - 30) / 2;

  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 10, y + 25, margin + colW - 10, y + 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(options?.nomeEmpregado || "Assinatura do Colaborador", margin + colW / 2, y + 37, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Data: ___/___/______`, margin + colW / 2, y + 48, { align: "center" });

  const rightX = margin + colW + 30;
  doc.line(rightX + 10, y + 25, rightX + colW - 10, y + 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(emp.emp_tecnico || emp.emp_responsavel || "Responsável SST / Empresa", rightX + colW / 2, y + 37, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`${emp.emp_razao || "Empresa Empregadora"}`, rightX + colW / 2, y + 48, { align: "center" });

  const nomeArquivo = `OS_NR01_${funcao.func_nome.replace(/[^\w\d-_]+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(nomeArquivo);
}

export function generateAllOrdensServicoConsolidado(company: Company): void {
  if (!company.funcoes || company.funcoes.length === 0) return;
  company.funcoes.forEach((funcao) => {
    generateOrdemServicoPdf(company, funcao);
  });
}
