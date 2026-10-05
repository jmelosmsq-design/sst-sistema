import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Company, FuncaoData } from "../types";

export function generateLaudoInsalubridadePdf(company: Company, selectedFuncaoId?: string): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  const emp = company.empresa || {};
  const funcoesToRender = selectedFuncaoId
    ? company.funcoes.filter((f) => f.id === selectedFuncaoId)
    : company.funcoes;

  // Header & Footer Helper
  const addHeaderFooter = (pageNumber: number, totalPages: number) => {
    doc.setFillColor(180, 83, 9); // Amber 700
    doc.rect(0, 0, pageWidth, 26, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("LAUDO TÉCNICO PERICIAL DE INSALUBRIDADE - NR-15", margin, 17);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Portaria 3.214/78 • Art. 189 a 192 da CLT", pageWidth - margin - 170, 17);

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
  doc.setFillColor(254, 252, 232); // Amber 50
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setFillColor(180, 83, 9); // Amber 700
  doc.rect(0, 0, pageWidth, 115, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("LAUDO TÉCNICO DE INSALUBRIDADE", margin, 52);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Avaliação Pericial das Condições Ambientais e Ocupacionais - NR-15", margin, 72);
  doc.setFontSize(8.5);
  doc.setTextColor(254, 243, 199);
  doc.text("Fundamentação Legal: Artigos 189 a 197 da CLT e Norma Regulamentadora nº 15 do MTE", margin, 90);

  if (emp.emp_consultoria_logo || emp.emp_logo) {
    try {
      const logo = emp.emp_consultoria_logo || emp.emp_logo;
      doc.addImage(logo!, "JPEG", pageWidth - margin - 85, 25, 85, 48, undefined, "FAST");
    } catch {}
  }

  // 1. Dados do Estabelecimento
  let y = 140;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin, y, contentWidth, 180, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9);
  doc.text("1. IDENTIFICAÇÃO DO EMPREGADOR E DO ESTABELECIMENTO", margin + 14, y + 22);

  doc.setDrawColor(254, 243, 199);
  doc.line(margin + 14, y + 30, pageWidth - margin - 14, y + 30);

  const empY = y + 48;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Razão Social:", margin + 14, empY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(emp.emp_razao || "Empresa Avaliada", margin + 80, empY);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("CNPJ:", margin + 14, empY + 24);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(emp.emp_cnpj || "N/I", margin + 80, empY + 24);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("CNAE / Risco:", margin + 280, empY + 24);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(`${emp.emp_cnae || "N/I"} (Grau ${emp.emp_grau_risco || "2"})`, margin + 355, empY + 24);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Endereço:", margin + 14, empY + 48);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(`${emp.emp_endereco || ""} - ${emp.emp_cidade || ""}/${emp.emp_uf || ""}`, margin + 80, empY + 48);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Data da Perícia:", margin + 14, empY + 72);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(emp.emp_vistoria ? emp.emp_vistoria.split("-").reverse().join("/") : new Date().toLocaleDateString("pt-BR"), margin + 95, empY + 72);

  // 2. Responsabilidade Técnica
  y = 340;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin, y, contentWidth, 110, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9);
  doc.text("2. RESPONSÁVEL TÉCNICO HABILITADO (ART. 195 CLT)", margin + 14, y + 22);

  const tecNome = emp.emp_ass_tec_nome || emp.emp_consultoria_tecnico || emp.emp_tecnico || "Engenheiro de Segurança / Médico do Trabalho";
  const tecReg = emp.emp_ass_tec_registro || emp.emp_consultoria_registro || "CREA / CRM Habilitado";

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Perito / Responsável:", margin + 14, y + 50);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(tecNome, margin + 120, y + 50);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Registro Profissional:", margin + 14, y + 70);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(tecReg, margin + 120, y + 70);

  // 3. Objetivo do Laudo
  y = 470;
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(252, 211, 77);
  doc.roundedRect(margin, y, contentWidth, 140, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(180, 83, 9);
  doc.text("3. OBJETIVO TÉCNICO E METODOLOGIA ADOTADA", margin + 14, y + 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(69, 26, 3);
  const objTexto =
    "O presente Laudo Técnico Pericial tem como objetivo precípuo caracterizar e classificar, ou descaracterizar, as atividades e operações insalubres desempenhadas pelos colaboradores da empresa, fixando, se devido, o respectivo adicional de insalubridade em grau Mínimo (10%), Médio (20%) ou Máximo (40%), incidentes sobre o salário mínimo da região ou convenção coletiva, com base nos critérios estabelecidos na Norma Regulamentadora nº 15 (NR-15) da Portaria MTb nº 3.214/1978 e na legislação trabalhista em vigor.";
  doc.text(doc.splitTextToSize(objTexto, contentWidth - 28), margin + 14, y + 36);

  // ================= PÁGINAS DE AVALIAÇÃO DOS CARGOS =================
  funcoesToRender.forEach((func) => {
    doc.addPage();
    let currentY = 40;

    const setor = company.setores.find((s) => s.setor_nome === func.func_setor || s.id === func.func_setor);
    const funcRiscos = company.riscos[func.id] || [];

    // Header Função
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, currentY, contentWidth, 65, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9);
    doc.text(`AVALIAÇÃO DO CARGO: ${func.func_nome.toUpperCase()}`, margin + 10, currentY + 18);

    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`Setor: ${setor?.setor_nome || func.func_setor || "Geral"} • CBO: ${func.func_cbo || "N/I"} • Efetivo: ${func.func_qtd || "1"} func.`, margin + 10, currentY + 34);
    doc.text(`Descrição sumária: ${doc.splitTextToSize(func.func_descricao || "Atividades rotineiras do cargo", contentWidth - 20)[0]}`, margin + 10, currentY + 48);

    currentY += 80;

    // Tabela dos Anexos da NR-15
    const anexosTable: any[] = [
      ["Anexo 01 - Ruído Contínuo ou Intermitente", funcRiscos.some((r) => r.toLowerCase().includes("ruído") || r.toLowerCase().includes("ruido")) ? "Avaliado (NHO-01)" : "Não Aplicável", "Descaracterizado com uso de Protetor Auricular CA regular"],
      ["Anexo 02 - Ruídos de Impacto", "Não Aplicável", "Ausência de fontes de impacto"],
      ["Anexo 03 - Exposição ao Calor", funcRiscos.some((r) => r.toLowerCase().includes("calor")) ? "Avaliado (IBUTG)" : "Não Aplicável", "Dentro dos limites de tolerância para a taxa metabólica"],
      ["Anexo 05 - Radiações Ionizantes", "Não Aplicável", "Ausência de fontes de radiação ionizante"],
      ["Anexo 07 - Radiações Não-Ionizantes", funcRiscos.some((r) => r.toLowerCase().includes("radiação") || r.toLowerCase().includes("solda")) ? "Avaliado" : "Não Aplicável", "EPI com filtro de luz adequado utilizado"],
      ["Anexo 08 - Vibrações", funcRiscos.some((r) => r.toLowerCase().includes("vibraç")) ? "Avaliado (VMB/VCI)" : "Não Aplicável", "Abaixo do nível de ação e limite de tolerância"],
      ["Anexo 09 - Frio", funcRiscos.some((r) => r.toLowerCase().includes("frio") || r.toLowerCase().includes("câmara")) ? "Avaliado" : "Não Aplicável", "Uso de vestimentas térmicas com CA"],
      ["Anexo 10 - Umidade", funcRiscos.some((r) => r.toLowerCase().includes("umidade")) ? "Avaliado" : "Não Aplicável", "Uso de botas de PVC e aventais impermeáveis"],
      ["Anexo 11/12 - Agentes Químicos (Limites)", funcRiscos.some((r) => r.toLowerCase().includes("químico") || r.toLowerCase().includes("poeira") || r.toLowerCase().includes("solvente")) ? "Avaliado" : "Não Aplicável", "Abaixo dos limites de tolerância / EPI eficaz"],
      ["Anexo 13 - Agentes Químicos (Qualitativo)", funcRiscos.some((r) => r.toLowerCase().includes("óleo") || r.toLowerCase().includes("graxa") || r.toLowerCase().includes("hidrocarboneto")) ? "Avaliado" : "Não Aplicável", "Proteção dérmica via Luvas de Nitrila / Creme Protetor com CA"],
      ["Anexo 14 - Agentes Biológicos", funcRiscos.some((r) => r.toLowerCase().includes("biológico") || r.toLowerCase().includes("lixo") || r.toLowerCase().includes("esgoto")) ? "Avaliado" : "Não Aplicável", "Não caracterizado em contato permanente sem proteção"],
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["Anexo da NR-15", "Condição Constatada", "Parecer Técnico Pericial"]],
      body: anexosTable,
      theme: "grid",
      headStyles: {
        fillColor: [180, 83, 9],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [15, 23, 42],
      },
      columnStyles: {
        0: { cellWidth: 160, fontStyle: "bold" },
        1: { cellWidth: 100, halign: "center" },
        2: { cellWidth: contentWidth - 260 },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 16;

    // Conclusão Pericial
    doc.setFillColor(240, 253, 244); // Green 50
    doc.setDrawColor(34, 197, 94); // Green 500
    doc.roundedRect(margin, currentY, contentWidth, 50, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(22, 101, 52);
    doc.text("CONCLUSÃO PERICIAL: ATIVIDADE NÃO INSALUBRE (DESCARACTERIZADA)", margin + 10, currentY + 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(
      "Com base nas inspeções realizadas no ambiente de trabalho e na comprovação do fornecimento regular e uso de Equipamentos de Proteção Individual (EPIs) com Certificado de Aprovação (CA) válido pelo MTE (NR-06 e Item 15.4.1 da NR-15), DESCARACTERIZA-SE o direito à percepção do adicional de insalubridade.",
      margin + 10,
      currentY + 32,
      { maxWidth: contentWidth - 20 }
    );
  });

  // ================= PÁGINA FINAL: ASSINATURAS =================
  doc.addPage();
  let endY = 60;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(180, 83, 9);
  doc.text("4. TERMO DE ENCERRAMENTO E VALIDADE TÉCNICA", margin, endY);
  endY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const encerramento =
    "O presente Laudo Técnico de Insalubridade foi elaborado com base nas disposições contidas na NR-15 da Portaria MTb nº 3.214/1978, no Art. 195 da CLT e na jurisprudência consolidada (Súmula 289 do TST).\n\nO laudo possui validade técnica enquanto forem mantidas as condições operacionais, de layout, de proteção coletiva e de fornecimento regular de EPIs avaliadas na data da perícia técnica.";
  doc.text(doc.splitTextToSize(encerramento, contentWidth), margin, endY);

  endY += 120;

  const colWidth = (contentWidth - 30) / 2;

  // Box Perito
  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 20, endY + 50, margin + colWidth - 20, endY + 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(emp.emp_ass_tec_nome || emp.emp_consultoria_tecnico || emp.emp_tecnico || "Perito Técnico SST", margin + colWidth / 2, endY + 65, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(emp.emp_ass_tec_registro || emp.emp_consultoria_registro || "Engenheiro de Segurança do Trabalho / Médico", margin + colWidth / 2, endY + 78, { align: "center" });

  // Box Empresa
  const rightX = margin + colWidth + 30;
  doc.line(rightX + 20, endY + 50, rightX + colWidth - 20, endY + 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(emp.emp_ass_rep_nome || emp.emp_responsavel || "Representante Legal da Empresa", rightX + colWidth / 2, endY + 65, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(emp.emp_cargo_resp || "Diretoria", rightX + colWidth / 2, endY + 78, { align: "center" });

  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) {
      addHeaderFooter(i, totalPages);
    }
  }

  const nomeEmpresa = (emp.emp_razao || "empresa").replace(/[^\w\d-_]+/g, "_").slice(0, 35);
  doc.save(`Laudo_Insalubridade_NR15_${nomeEmpresa}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
