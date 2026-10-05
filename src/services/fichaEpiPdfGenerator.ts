import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Company, FuncaoData, EpiItem } from "../types";

export interface FichaEpiOptions {
  nomeEmpregado?: string;
  cpfEmpregado?: string;
  matricula?: string;
  dataAdmissao?: string;
  ctps?: string;
}

export function generateFichaEpiPdf(
  company: Company,
  funcao?: FuncaoData,
  options?: FichaEpiOptions
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  const emp = company.empresa || {};
  const setor = funcao
    ? company.setores.find((s) => s.setor_nome === funcao.func_setor || s.id === funcao.func_setor)
    : null;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 55, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("FICHA DE CONTROLE E ENTREGA DE EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL (EPI)", margin, 26);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text("Conforme Norma Regulamentadora nº 06 (NR-06 Item 6.5.1) e Artigo 166 da CLT", margin, 42);

  if (emp.emp_logo || emp.emp_consultoria_logo) {
    try {
      const logo = emp.emp_logo || emp.emp_consultoria_logo;
      doc.addImage(logo!, "JPEG", pageWidth - margin - 60, 8, 60, 38, undefined, "FAST");
    } catch {}
  }

  let y = 70;

  // 1. Dados Cadastrais
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["1. IDENTIFICAÇÃO DA EMPRESA E DO EMPREGADO", ""]],
    body: [
      ["Empregador:", `${emp.emp_razao || "Empresa"} • CNPJ: ${emp.emp_cnpj || "N/I"}`],
      ["Nome do Empregado:", options?.nomeEmpregado || "______________________________________________________"],
      ["CPF / Matrícula:", `${options?.cpfEmpregado || "___.___.___-__"} • Matrícula: ${options?.matricula || "________"}`],
      ["Cargo / Função:", `${funcao ? funcao.func_nome.toUpperCase() : "Geral / Conforme Admissão"} • CBO: ${funcao?.func_cbo || "N/I"}`],
      ["Setor de Trabalho:", setor?.setor_nome || funcao?.func_setor || "Geral"],
      ["Data de Admissão:", options?.dataAdmissao || "___/___/______"],
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
      0: { cellWidth: 130, fontStyle: "bold", textColor: [71, 85, 105] },
      1: { cellWidth: contentWidth - 130 },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // 2. Termo de Responsabilidade (NR-06 Item 6.5.1)
  const termoNR06 =
    "Declaro ter recebido da empresa os Equipamentos de Proteção Individual (EPI) abaixo relacionados, novos e em perfeitas condições de uso, e que recebi o devido treinamento para sua correta utilização, guarda e conservação. Comprometo-me a:\n" +
    "a) Usar o EPI fornecido exclusivamente para a finalidade a que se destina, durante toda a jornada de trabalho;\n" +
    "b) Responsabilizar-me pela sua guarda, higienização e conservação periódica;\n" +
    "c) Comunicar imediatamente à empresa qualquer alteração, desgaste ou extravio que o torne impróprio para uso;\n" +
    "d) Devolver os EPIs quando substituídos por novos ou na rescisão do contrato de trabalho;\n" +
    "Estou ciente de que o uso inadequado ou a recusa injustificada ao uso constitui ato faltoso passível de punição disciplinar conforme o Art. 158 da CLT.";

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["2. TERMO DE COMPROMISSO, GUARDA E RESPONSABILIDADE (NR-06)"]],
    body: [[termoNR06]],
    theme: "grid",
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [15, 23, 42],
      cellPadding: 4,
    },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // 3. Tabela de Registro de Entrega e Devolução dos EPIs
  const episSugeridos: { nome: string; ca: string; fabricante?: string }[] = [];

  if (funcao?.func_epis_lista && funcao.func_epis_lista.length > 0) {
    funcao.func_epis_lista.forEach((epi) => {
      episSugeridos.push({
        nome: epi.nome,
        ca: epi.ca || "N/I",
        fabricante: epi.fabricante || "Conforme CA",
      });
    });
  }

  // Se tiver poucos ou nenhum, adiciona linhas padrão pré-preenchidas e linhas em branco para uso
  const rows: any[] = [];
  const hoje = new Date().toLocaleDateString("pt-BR");

  if (episSugeridos.length > 0) {
    episSugeridos.forEach((epi) => {
      rows.push([
        hoje,
        epi.nome,
        epi.fabricante || "Nacional",
        epi.ca,
        "01",
        "Novo",
        "",
        "",
        "",
      ]);
    });
  }

  // Preencher até 12 linhas para o técnico/almoxarifado poder usar para futuras entregas
  const totalLinhasDesejadas = 12;
  const linhasRestantes = Math.max(totalLinhasDesejadas - rows.length, 5);

  for (let i = 0; i < linhasRestantes; i++) {
    rows.push(["", "", "", "", "", "", "", "", ""]);
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [
      [
        "Data Entrega",
        "Descrição do EPI",
        "Fabricante",
        "Nº CA",
        "Qtd",
        "Motivo",
        "Assinatura do Empregado",
        "Data Devol.",
        "Visto",
      ],
    ],
    body: rows,
    theme: "grid",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [15, 23, 42],
      minCellHeight: 20,
    },
    columnStyles: {
      0: { cellWidth: 52, halign: "center" },
      1: { cellWidth: 125 },
      2: { cellWidth: 65 },
      3: { cellWidth: 45, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 28, halign: "center" },
      5: { cellWidth: 45, halign: "center" },
      6: { cellWidth: 88, halign: "center" },
      7: { cellWidth: 45, halign: "center" },
      8: { cellWidth: 30, halign: "center" },
    },
  });

  // Footer da página
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Ficha de Registro Individual de EPI • Empresa: ${emp.emp_razao || "Empresa"} • CNPJ: ${emp.emp_cnpj || "N/I"}`,
    margin,
    pageHeight - 16
  );

  const cargoNome = funcao ? funcao.func_nome.replace(/[^\w\d-_]+/g, "_") : "Geral";
  const nomeArquivo = `Ficha_EPI_NR06_${cargoNome}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(nomeArquivo);
}
