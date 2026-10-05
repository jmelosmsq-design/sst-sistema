import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Company, AepItem, FotoEvidencia } from "../types";
import {
  COUTO_OPERACIONAIS_ITEMS,
  COUTO_INFORMATIZADOS_ITEMS,
  calculateCoutoDiagnosis,
} from "../data/coutoChecklistCatalog";

export function gerarPDFChecklistCouto(company: Company, aep: AepItem): void {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 35;
    const contentWidth = pageWidth - margin * 2;

    const primaryColor: [number, number, number] = [30, 41, 59]; // slate-800
    const e = company.empresa;
    const respostas = aep.coutoRespostas || {};
    const diagnosis = calculateCoutoDiagnosis(respostas);

    // Função para rodapé
    const addFooter = (pageNum: number, totalPages: number) => {
      doc.setPage(pageNum);
      const consultoriaNome = e.emp_consultoria_razao || e.emp_consultoria || "SST Vistoria • Avaliação Ergonômica NR-17";
      const consultoriaContato = [e.emp_consultoria_telefone, e.emp_consultoria_email]
        .filter(Boolean)
        .join(" | ");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);

      // Linha divisória
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 32, pageWidth - margin, pageHeight - 32);

      // Texto do rodapé
      doc.text(consultoriaNome + (consultoriaContato ? ` • ${consultoriaContato}` : ""), margin, pageHeight - 20);
      doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin, pageHeight - 20, { align: "right" });
    };

    // ==========================================
    // 1. CABEÇALHO DO LAUDO COUTO
    // ==========================================
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 56, "F");

    const logo = e.emp_logo || e.emp_consultoria_logo;
    let textMaxW = contentWidth;

    if (logo) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(pageWidth - 85, 6, 50, 44, 3, 3, "F");
        doc.addImage(logo, "PNG", pageWidth - 83, 8, 46, 40, undefined, "FAST");
        textMaxW = contentWidth - 65;
      } catch {
        // Fallback se logo falhar
      }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("AVALIAÇÃO ERGONÔMICA PRELIMINAR (AEP) — CHECKLIST DE COUTO", margin, 22, { maxWidth: textMaxW });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      "Baseado no Checklist de Avaliação Ergonômica Preliminar de Hudson Couto • NR-17 / NR-01 (GRO/PGR)",
      margin,
      35,
      { maxWidth: textMaxW }
    );

    doc.setFontSize(7);
    doc.setTextColor(226, 232, 240);
    doc.text(
      `Empresa: ${e.emp_razao || e.emp_fantasia || "Não informada"} | CNPJ: ${e.emp_cnpj || "Não informado"}`,
      margin,
      47,
      { maxWidth: textMaxW }
    );

    let currentY = 70;

    // Aviso Metodológico do Autor
    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(199, 210, 254);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, currentY, contentWidth, 26, 4, 4, "FD");

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 58, 138);
    const avisoTexto =
      "Regra Metodológica: Aplicar de forma objetiva a cada posto de trabalho. Não pensar na solução durante a checagem, mas sim após, na busca de melhorias junto à gerência e trabalhadores.";
    doc.text(avisoTexto, margin + 8, currentY + 16, { maxWidth: contentWidth - 16 });

    currentY += 34;

    // ==========================================
    // 2. DADOS DA AVALIAÇÃO DO POSTO
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text("DADOS DO POSTO DE TRABALHO E AVALIAÇÃO", margin, currentY);
    currentY += 6;

    const dadosRows = [
      [
        "Empresa:",
        e.emp_razao || e.emp_fantasia || "Não informada",
        "CNPJ:",
        e.emp_cnpj || "Não informado",
      ],
      [
        "Setor Avaliado:",
        aep.setorNome || "Setor Operacional",
        "Posto / Função:",
        aep.funcaoNome || "Função Geral",
      ],
      [
        "Data da Avaliação:",
        aep.dataAvaliacao ? new Date(aep.dataAvaliacao + "T12:00:00").toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR"),
        "Trabalhador Avaliado:",
        aep.trabalhadorNome || "Equipe do Posto (Coletivo)",
      ],
      [
        "Avaliador Responsável:",
        aep.avaliador || e.emp_consultoria_tecnico || e.emp_tecnico || "Avaliador SST",
        "Registro Profissional:",
        e.emp_consultoria_registro || "MTE / CREA / CFT",
      ],
    ];

    autoTable(doc, {
      startY: currentY,
      body: dadosRows as any,
      theme: "grid",
      styles: { fontSize: 7.5, cellPadding: 3.5, font: "helvetica", textColor: [30, 41, 59] },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 95, fillColor: [248, 250, 252] },
        1: { cellWidth: 165 },
        2: { fontStyle: "bold", cellWidth: 105, fillColor: [248, 250, 252] },
        3: { cellWidth: 160 },
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // ==========================================
    // 3. TABELA 1: ATIVIDADES OPERACIONAIS EM GERAL (13 ITENS)
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text("1. ATIVIDADES OPERACIONAIS EM GERAL (CHECKLIST DE COUTO)", margin, currentY);
    currentY += 6;

    const opRows = COUTO_OPERACIONAIS_ITEMS.map((item) => {
      const resp = respostas[item.id] || "nao";
      const respText = resp === "sim" ? "SIM" : resp === "na" ? "N/A" : "NÃO";
      return [
        `Item ${item.numero}`,
        item.descricao,
        respText,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Item", "Descrição do Critério Ergonômico de Hudson Couto", "Situação"]],
      body: opRows,
      theme: "grid",
      headStyles: { fillColor: primaryColor, fontSize: 8, fontStyle: "bold" },
      styles: { fontSize: 7, cellPadding: 3, font: "helvetica", valign: "middle" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, halign: "center", fillColor: [248, 250, 252] },
        1: { cellWidth: 415 },
        2: { fontStyle: "bold", cellWidth: 60, halign: "center" },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 2) {
          const val = data.cell.raw as string;
          if (val === "SIM") {
            data.cell.styles.fillColor = [254, 226, 226]; // red-100
            data.cell.styles.textColor = [185, 28, 28]; // red-700
          } else if (val === "NÃO") {
            data.cell.styles.fillColor = [220, 252, 231]; // green-100
            data.cell.styles.textColor = [21, 128, 61]; // green-700
          } else {
            data.cell.styles.fillColor = [241, 245, 249];
            data.cell.styles.textColor = [100, 116, 139];
          }
        }
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // Se aproximar do fim da página, cria nova página
    if (currentY > 620) {
      doc.addPage();
      currentY = 40;
    }

    // ==========================================
    // 4. TABELA 2: POSTOS INFORMATIZADOS (5 ITENS)
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text("2. POSTOS DE TRABALHO INFORMATIZADOS (CHECKLIST DE COUTO)", margin, currentY);
    currentY += 6;

    const infoRows = COUTO_INFORMATIZADOS_ITEMS.map((item) => {
      const resp = respostas[item.id] || "nao";
      const respText = resp === "sim" ? "SIM" : resp === "na" ? "N/A" : "NÃO";
      return [
        `Item ${item.numero}`,
        item.descricao,
        respText,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Item", "Descrição do Critério para Trabalho com Computador / Telas", "Situação"]],
      body: infoRows,
      theme: "grid",
      headStyles: { fillColor: [71, 85, 105], fontSize: 8, fontStyle: "bold" },
      styles: { fontSize: 7, cellPadding: 3.5, font: "helvetica", valign: "middle" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, halign: "center", fillColor: [248, 250, 252] },
        1: { cellWidth: 415 },
        2: { fontStyle: "bold", cellWidth: 60, halign: "center" },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 2) {
          const val = data.cell.raw as string;
          if (val === "SIM") {
            data.cell.styles.fillColor = [254, 226, 226];
            data.cell.styles.textColor = [185, 28, 28];
          } else if (val === "NÃO") {
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.textColor = [21, 128, 61];
          } else {
            data.cell.styles.fillColor = [241, 245, 249];
            data.cell.styles.textColor = [100, 116, 139];
          }
        }
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // Se necessário, nova página para síntese e conclusões
    if (currentY > 580) {
      doc.addPage();
      currentY = 40;
    }

    // ==========================================
    // 5. QUADRO DE RESULTADOS E TRIAGEM COUTO
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text("3. DIAGNÓSTICO ERGONÔMICO CONSOLIDADO E CLASSIFICAÇÃO", margin, currentY);
    currentY += 6;

    const medidaTexto =
      aep.coutoClassificacaoMedida === "b"
        ? "(b) Solução conhecida sendo necessário replicá-la no posto"
        : aep.coutoClassificacaoMedida === "c"
        ? "(c) Situação cuja melhoria necessita de estudo em maior profundidade (AET)"
        : "(a) Situação passível de melhorias de baixo investimento ou pequenas melhorias";

    const resultadoRows = [
      [
        "Total de Itens Pontuados (SIM):",
        `${diagnosis.simCount} item(ns) com exigência ergonômica identificada`,
        "Classificação do Risco (PGR):",
        aep.classificacaoRisco || diagnosis.classificacaoRisco,
      ],
      [
        "Indicação de AET (NR-17.3.2):",
        aep.necessidadeAET || diagnosis.necessidadeAET
          ? "SIM — Recomenda-se Análise Ergonômica do Trabalho Aprofundada"
          : "NÃO — Avaliação Ergonômica Preliminar (AEP) é Suficiente",
        "Classificação da Medida (Couto):",
        medidaTexto,
      ],
      [
        "Parecer Técnico / Justificativa:",
        {
          content:
            aep.parecerTecnico ||
            aep.justificativaAET ||
            diagnosis.justificativaAET ||
            "As condições ergonômicas atendem aos parâmetros de conforto da NR-17.",
          colSpan: 3,
        },
      ],
    ];

    autoTable(doc, {
      startY: currentY,
      body: resultadoRows as any,
      theme: "grid",
      styles: { fontSize: 7.5, cellPadding: 3.5, font: "helvetica" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 135, fillColor: [248, 250, 252] },
        1: { cellWidth: 130, fontStyle: "bold" },
        2: { fontStyle: "bold", cellWidth: 125, fillColor: [248, 250, 252] },
        3: { cellWidth: 135, fontStyle: "bold" },
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // ==========================================
    // 6. OBSERVAÇÕES E RECOMENDAÇÕES DE MELHORIA
    // ==========================================
    const obsText = aep.coutoObservacoesDetalhadas || aep.atividadesDescricao || "Nenhuma observação adicional apontada.";
    const recsList =
      aep.recomendacoes && aep.recomendacoes.length > 0
        ? aep.recomendacoes
        : diagnosis.recomendacoesAutomaticas.length > 0
        ? diagnosis.recomendacoesAutomaticas
        : ["Manter as condições de trabalho e realizar orientações posturais periódicas."];

    const planoRows = [
      ["Anotações Detalhadas dos Itens Pontuados:", obsText],
      ["Plano de Ação / Recomendações Ergonômicas:", recsList.map((r, i) => `${i + 1}. ${r}`).join("\n")],
    ];

    autoTable(doc, {
      startY: currentY,
      body: planoRows as any,
      theme: "grid",
      styles: { fontSize: 7.5, cellPadding: 4, font: "helvetica", valign: "top" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 145, fillColor: [248, 250, 252] },
        1: { cellWidth: 380 },
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // ==========================================
    // 7. DOCUMENTAÇÃO FOTOGRÁFICA
    // ==========================================
    const fotos: FotoEvidencia[] = aep.fotos || [];
    if (fotos.length > 0) {
      if (currentY > 520) {
        doc.addPage();
        currentY = 40;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text("4. DOCUMENTAÇÃO FOTOGRÁFICA DO POSTO DE TRABALHO", margin, currentY);
      currentY += 8;

      const photoWidth = 155;
      const photoHeight = 98;
      const spacingX = 15;
      const spacingY = 16;
      let col = 0;
      let rowStartY = currentY;

      fotos.forEach((foto, fIdx) => {
        if (rowStartY + photoHeight + 25 > pageHeight - 50) {
          doc.addPage();
          rowStartY = 40;
          col = 0;
        }

        const posX = margin + col * (photoWidth + spacingX);
        const posY = rowStartY;

        try {
          doc.setDrawColor(203, 213, 225);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(posX, posY, photoWidth, photoHeight, 3, 3, "FD");
          doc.addImage(foto.dataUrl, "JPEG", posX + 2, posY + 2, photoWidth - 4, photoHeight - 4, undefined, "FAST");

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(51, 65, 85);
          const legenda = foto.legenda || `Foto ${fIdx + 1}: Posto de ${aep.funcaoNome}`;
          doc.text(legenda, posX + photoWidth / 2, posY + photoHeight + 9, {
            align: "center",
            maxWidth: photoWidth,
          });
        } catch {
          // Imagem inválida
        }

        col++;
        if (col >= 3) {
          col = 0;
          rowStartY += photoHeight + spacingY + 8;
        }
      });

      if (col !== 0) {
        currentY = rowStartY + photoHeight + spacingY + 8;
      } else {
        currentY = rowStartY;
      }
    }

    // ==========================================
    // 8. BLOCO DE ASSINATURAS
    // ==========================================
    if (currentY > pageHeight - 110) {
      doc.addPage();
      currentY = 40;
    } else {
      currentY += 10;
    }

    const sigBoxW = (contentWidth - 25) / 2;
    const sigY = currentY + 30;

    // Assinatura Avaliador
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.8);
    doc.line(margin, sigY, margin + sigBoxW, sigY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(
      aep.avaliador || e.emp_consultoria_tecnico || e.emp_tecnico || "Responsável Técnico / Avaliador SST",
      margin + sigBoxW / 2,
      sigY + 11,
      { align: "center" }
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Ergonomia e Segurança do Trabalho • ${e.emp_consultoria_registro || "MTE / CREA"}`,
      margin + sigBoxW / 2,
      sigY + 20,
      { align: "center" }
    );

    // Assinatura Trabalhador / Empresa
    const posX2 = margin + sigBoxW + 25;
    doc.line(posX2, sigY, posX2 + sigBoxW, sigY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(aep.trabalhadorNome || "Trabalhador Avaliado / Representante da Empresa", posX2 + sigBoxW / 2, sigY + 11, {
      align: "center",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${e.emp_razao || e.emp_fantasia || "Empresa"} • Ciência do Levantamento`,
      posX2 + sigBoxW / 2,
      sigY + 20,
      { align: "center" }
    );

    // Numerar todas as páginas e adicionar rodapés
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      addFooter(i, totalPages);
    }

    const nomeEmpresa = ((e.emp_razao || e.emp_fantasia || "Empresa") as string).replace(/[^\w\d-_]+/g, "_");
    const nomeFuncao = (aep.funcaoNome || "Funcao").replace(/[^\w\d-_]+/g, "_");
    const dataStr = new Date().toISOString().slice(0, 10);
    const fileName = `Laudo_AEP_Couto_${nomeEmpresa}_${nomeFuncao}_${dataStr}.pdf`;

    doc.save(fileName);
  } catch (error) {
    console.error("Erro ao gerar PDF do Checklist de Couto:", error);
    throw error;
  }
}
