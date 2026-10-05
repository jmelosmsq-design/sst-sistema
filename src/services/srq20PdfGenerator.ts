import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Company, Srq20AvaliacaoItem } from "../types";
import { SRQ20_PERGUNTAS, SRQ20_PONTO_DE_CORTE, classificarRiscoSetorialPgr } from "../data/srq20Catalog";

/**
 * 1. Gera o Relatório Técnico Individual de Avaliação Psicossocial (SRQ-20)
 */
export function gerarPdfSrq20Individual(company: Company, avaliacao: Srq20AvaliacaoItem): void {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 35;
    const contentWidth = pageWidth - margin * 2;

    const e = company.empresa;
    const isAtencao = avaliacao.classificacao === "Atenção Necessária";
    const primaryColor: [number, number, number] = [15, 23, 42]; // slate-900
    const accentColor: [number, number, number] = isAtencao ? [220, 38, 38] : [16, 185, 129]; // red-600 ou emerald-600

    // Rodapé
    const addFooter = (pageNum: number, totalPages: number) => {
      doc.setPage(pageNum);
      const consultoria = e.emp_consultoria_razao || e.emp_consultoria || "SST Vistoria • Gerenciamento de Riscos";
      const contato = [e.emp_consultoria_telefone, e.emp_consultoria_email].filter(Boolean).join(" | ");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);

      doc.text(`${consultoria} • Rastreamento Psicossocial SRQ-20 (NR-1 & NR-17)${contato ? ` • ${contato}` : ""}`, margin, pageHeight - 18);
      doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin, pageHeight - 18, { align: "right" });
    };

    // ==========================================
    // CABEÇALHO
    // ==========================================
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 60, "F");

    const logo = e.emp_logo || e.emp_consultoria_logo;
    let textMaxW = contentWidth;

    if (logo) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(pageWidth - 85, 8, 48, 44, 4, 4, "F");
        doc.addImage(logo, "PNG", pageWidth - 83, 10, 44, 40, undefined, "FAST");
        textMaxW = contentWidth - 65;
      } catch {
        // fallback
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("RELATÓRIO DE AVALIAÇÃO PSICOSSOCIAL • SRQ-20", margin, 26);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    doc.text(
      `Empresa: ${(e.emp_razao || e.emp_fantasia || "Empresa Avaliada").substring(0, 50)} | CNPJ: ${e.emp_cnpj || "N/I"}`,
      margin,
      40
    );
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Rastreamento de Transtornos Mentais Comuns (OMS) • Atendimento à NR-01 (1.5.3.2.1) e NR-17", margin, 52);

    let y = 76;

    // ==========================================
    // BOX DE ENQUADRAMENTO LEGAL
    // ==========================================
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, y, contentWidth, 34, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("FUNDAMENTAÇÃO NORMATIVA:", margin + 8, y + 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const nrText =
      "Item 1.5.3.2.1 da NR-1: A organização deve considerar as condições de trabalho nos termos da NR-17, incluindo os fatores de riscos psicossociais relacionados ao trabalho. Instrumento SRQ-20 validado pela OMS para triagem e suporte ao PGR/PCMSO.";
    doc.text(doc.splitTextToSize(nrText, contentWidth - 16), margin + 8, y + 24);

    y += 44;

    // ==========================================
    // DADOS DO TRABALHADOR E AVALIAÇÃO
    // ==========================================
    const nomeExibicao = avaliacao.anonimo ? "Trabalhador sob Sigilo Ético (Participação Anônima)" : avaliacao.avaliadoNome || "Colaborador";
    const dataFormatada = avaliacao.data ? avaliacao.data.split("-").reverse().join("/") : new Date().toLocaleDateString("pt-BR");

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      head: [["DADOS DO AVALIADO", "LOCAL DE TRABALHO & AVALIAÇÃO"]],
      body: [
        [
          `Nome: ${nomeExibicao}\nIdade: ${avaliacao.avaliadoIdade ? `${avaliacao.avaliadoIdade} anos` : "N/I"} | Sexo: ${avaliacao.avaliadoSexo || "N/I"}\nIdentificação: ${avaliacao.anonimo ? "Código Seguro LGPD" : "Identificado"}`,
          `Setor: ${avaliacao.setorNome || "Geral"}\nFunção: ${avaliacao.funcaoNome || "GHE Padrão"}\nData da Avaliação: ${dataFormatada} • Origem: ${avaliacao.origem === "link_trabalhador" ? "Autoaplicação via Link Digital" : "Entrevista Técnica Presencial"}`,
        ],
      ],
      headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8, fontStyle: "bold", cellPadding: 4 },
      bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59], cellPadding: 5 },
      columnStyles: { 0: { cellWidth: contentWidth / 2 }, 1: { cellWidth: contentWidth / 2 } },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // ==========================================
    // RESULTADO & SCORE
    // ==========================================
    doc.setFillColor(isAtencao ? 254 : 240, isAtencao ? 242 : 253, isAtencao ? 242 : 244);
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(1.2);
    doc.roundedRect(margin, y, contentWidth, 54, 5, 5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...accentColor);
    doc.text(
      `RESULTADO: ${avaliacao.classificacao.toUpperCase()} (${avaliacao.pontuacao} / 20 Pontos)`,
      margin + 12,
      y + 18
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const scoreText = isAtencao
      ? `Pontuação igual ou superior ao ponto de corte (>= 7 pontos). Indica a presença de sintomas associados a sobrecarga ou sofrimento psíquico nos últimos 30 dias. Recomenda-se acolhimento e suporte especializado.`
      : `Pontuação abaixo do ponto de corte (< 7 pontos). Sugere ausência de indicativos estatísticos expressivos de sofrimento psíquico no período de referência.`;
    doc.text(doc.splitTextToSize(scoreText, contentWidth - 24), margin + 12, y + 32);

    // Barra gráfica de score
    const barX = margin + 12;
    const barY = y + 43;
    const barW = contentWidth - 24;
    const barH = 5;
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(barX, barY, barW, barH, 2, 2, "F");
    const fillW = Math.max(4, (Math.min(avaliacao.pontuacao, 20) / 20) * barW);
    doc.setFillColor(...accentColor);
    doc.roundedRect(barX, barY, fillW, barH, 2, 2, "F");

    y += 66;

    // ==========================================
    // TABELA DAS 20 RESPOSTAS (2 COLUNAS)
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text("RESPOSTAS DO QUESTIONÁRIO (REFERÊNCIA: ÚLTIMOS 30 DIAS)", margin, y);
    y += 6;

    const half = 10;
    const tableRows: any[] = [];
    for (let i = 0; i < half; i++) {
      const q1 = SRQ20_PERGUNTAS[i];
      const q2 = SRQ20_PERGUNTAS[i + half];
      const r1 = avaliacao.respostas[q1.id] ? "SIM" : "NÃO";
      const r2 = avaliacao.respostas[q2.id] ? "SIM" : "NÃO";
      tableRows.push([q1.id, q1.texto, r1, q2.id, q2.texto, r2]);
    }

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      head: [["#", "Pergunta (1 a 10)", "Resp.", "#", "Pergunta (11 a 20)", "Resp."]],
      body: tableRows,
      styles: { fontSize: 6.8, cellPadding: 3, textColor: [30, 41, 59], lineColor: [226, 232, 240], lineWidth: 0.5 },
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 7, fontStyle: "bold", cellPadding: 3.5 },
      columnStyles: {
        0: { cellWidth: 16, halign: "center", fontStyle: "bold" },
        1: { cellWidth: contentWidth / 2 - 38 },
        2: { cellWidth: 22, halign: "center", fontStyle: "bold" },
        3: { cellWidth: 16, halign: "center", fontStyle: "bold" },
        4: { cellWidth: contentWidth / 2 - 38 },
        5: { cellWidth: 22, halign: "center", fontStyle: "bold" },
      },
      didParseCell: (data) => {
        if ((data.column.index === 2 || data.column.index === 5) && data.section === "body") {
          const val = data.cell.raw;
          if (val === "SIM") {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fillColor = [254, 242, 242];
          } else {
            data.cell.styles.textColor = [16, 185, 129];
            data.cell.styles.fillColor = [240, 253, 244];
          }
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // ==========================================
    // RECOMENDAÇÕES E CANAIS DE APOIO
    // ==========================================
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.6);
    doc.roundedRect(margin, y, contentWidth, 50, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("ORIENTAÇÕES TÉCNICAS E CANAIS DE APOIO INSTITUCIONAL:", margin + 8, y + 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    const apoioText =
      "• Este questionário é um instrumento padronizado de rastreamento e NÃO constitui diagnóstico clínico.\n• Centro de Valorização da Vida (CVV): Ligue 188 (gratuito e sigiloso 24h) | Acesse: cvv.org.br\n• Rede Pública de Saúde: Procure o CAPS (Centro de Atenção Psicossocial) ou a UBS mais próxima para acompanhamento profissional gratuito.\n• Para a Empresa: Os dados individuais devem ser resguardados com sigilo estrito (LGPD), utilizando-se apenas dados consolidados para o PGR/AEP.";
    doc.text(doc.splitTextToSize(apoioText, contentWidth - 16), margin + 8, y + 23);

    y += 62;

    // ==========================================
    // ASSINATURAS
    // ==========================================
    const tecNome = e.emp_consultoria_tecnico || e.emp_tecnico || "Técnico / Responsável SST";
    const tecReg = e.emp_consultoria_registro || "Reg. Profissional";

    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.6);
    const sigW = 200;
    const sigX = pageWidth / 2 - sigW / 2;

    doc.line(sigX, y + 20, sigX + sigW, y + 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(tecNome, pageWidth / 2, y + 29, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`${tecReg} • Avaliador Responsável`, pageWidth / 2, y + 38, { align: "center" });

    addFooter(1, 1);

    const safeNome = (avaliacao.avaliadoNome || "Anonimo").replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`SRQ20_Individual_${safeNome}_${avaliacao.data || "data"}.pdf`);
  } catch (err) {
    console.error("Erro ao gerar PDF individual SRQ-20:", err);
    alert("Não foi possível gerar o PDF. Verifique os dados e tente novamente.");
  }
}

/**
 * 2. Gera o Relatório Consolidado para PGR / AEP (NR-01 & NR-17)
 */
export function gerarPdfSrq20ConsolidadoPgr(
  company: Company,
  avaliacoes: Srq20AvaliacaoItem[],
  setorFiltro?: string
): void {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 35;
    const contentWidth = pageWidth - margin * 2;

    const e = company.empresa;
    const items = setorFiltro ? avaliacoes.filter((a) => a.setorNome === setorFiltro) : avaliacoes;

    const total = items.length;
    const atencao = items.filter((a) => a.classificacao === "Atenção Necessária").length;
    const favoravel = total - atencao;
    const pctAtencao = total > 0 ? Math.round((atencao / total) * 100) : 0;
    const pctFavoravel = 100 - pctAtencao;
    const nivelRisco = classificarRiscoSetorialPgr(pctAtencao);

    const addFooter = (pageNum: number, totalPages: number) => {
      doc.setPage(pageNum);
      const consultoria = e.emp_consultoria_razao || e.emp_consultoria || "SST Vistoria • Gerenciamento de Riscos";
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);
      doc.text(`${consultoria} • Relatório Consolidado de Riscos Psicossociais (PGR/AEP)`, margin, pageHeight - 18);
      doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin, pageHeight - 18, { align: "right" });
    };

    // ==========================================
    // CABEÇALHO DO LAUDO CONSOLIDADO
    // ==========================================
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 62, "F");

    const logo = e.emp_logo || e.emp_consultoria_logo;
    if (logo) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(pageWidth - 85, 8, 48, 46, 4, 4, "F");
        doc.addImage(logo, "PNG", pageWidth - 83, 10, 44, 42, undefined, "FAST");
      } catch {
        // fallback
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("DIAGNÓSTICO CONSOLIDADO DE RISCOS PSICOSSOCIAIS", margin, 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    doc.text(
      `Inventário de Riscos do PGR (NR-01 item 1.5.3.2.1) & Anexo de Ergonomia (NR-17)`,
      margin,
      39
    );
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Empresa: ${e.emp_razao || e.emp_fantasia || "Empresa"} | CNPJ: ${e.emp_cnpj || "N/I"} ${setorFiltro ? `| Setor Analisado: ${setorFiltro}` : "| Todos os Setores"}`,
      margin,
      52
    );

    let y = 78;

    // ==========================================
    // QUADRO DE INDICADORES PRINCIPAIS (KPIs)
    // ==========================================
    const kpiW = (contentWidth - 12) / 4;
    const kpis = [
      { label: "TRABALHADORES AVALIADOS", val: `${total}`, cor: [30, 41, 59] },
      { label: "FAVORÁVEL (< 7 PTS)", val: `${favoravel} (${pctFavoravel}%)`, cor: [16, 185, 129] },
      { label: "ATENÇÃO NECESSÁRIA", val: `${atencao} (${pctAtencao}%)`, cor: pctAtencao > 25 ? [220, 38, 38] : [234, 88, 12] },
      { label: "NÍVEL DE RISCO PGR", val: nivelRisco.toUpperCase(), cor: nivelRisco === "Baixo" ? [16, 185, 129] : nivelRisco === "Médio" ? [234, 88, 12] : [220, 38, 38] },
    ];

    kpis.forEach((kpi, idx) => {
      const kX = margin + idx * (kpiW + 4);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.8);
      doc.roundedRect(kX, y, kpiW, 40, 4, 4, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(kpi.label, kX + 6, y + 13);

      doc.setFontSize(10);
      doc.setTextColor(kpi.cor[0], kpi.cor[1], kpi.cor[2]);
      doc.text(kpi.val, kX + 6, y + 29);
    });

    y += 50;

    // ==========================================
    // ESTRATIFICAÇÃO POR SETOR / GHE
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text("1. ESTRATIFICAÇÃO DE RISCOS PSICOSSOCIAIS POR SETOR / GHE", margin, y);
    y += 6;

    // Agrupar por setor
    const setoresMap: Record<string, { total: number; atencao: number; favoravel: number }> = {};
    items.forEach((item) => {
      const s = item.setorNome || "Não especificado";
      if (!setoresMap[s]) setoresMap[s] = { total: 0, atencao: 0, favoravel: 0 };
      setoresMap[s].total++;
      if (item.classificacao === "Atenção Necessária") setoresMap[s].atencao++;
      else setoresMap[s].favoravel++;
    });

    const setorRows = Object.entries(setoresMap).map(([setor, dados]) => {
      const taxa = dados.total > 0 ? Math.round((dados.atencao / dados.total) * 100) : 0;
      const risco = classificarRiscoSetorialPgr(taxa);
      return [
        setor,
        `${dados.total} colaboradore(s)`,
        `${dados.favoravel} (${100 - taxa}%)`,
        `${dados.atencao} (${taxa}%)`,
        risco,
        risco === "Baixo" ? "Manter monitoramento anual" : "Priorizar intervenção no Plano de Ação 5W2H",
      ];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      head: [["Setor / Grupo Homogêneo (GHE)", "Total Coletado", "Favorável", "Atenção (>= 7)", "Risco PGR", "Conduta Recomendada"]],
      body: setorRows.length > 0 ? setorRows : [["Nenhum setor registrado", "-", "-", "-", "-", "-"]],
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 7.5, fontStyle: "bold", cellPadding: 4 },
      bodyStyles: { fontSize: 7, textColor: [30, 41, 59], cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 120, fontStyle: "bold" },
        1: { cellWidth: 70, halign: "center" },
        2: { cellWidth: 65, halign: "center" },
        3: { cellWidth: 70, halign: "center", fontStyle: "bold" },
        4: { cellWidth: 60, halign: "center", fontStyle: "bold" },
        5: { cellWidth: contentWidth - 385 },
      },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.section === "body") {
          const val = data.cell.raw;
          if (val === "Crítico" || val === "Elevado") {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = "bold";
          } else if (val === "Médio") {
            data.cell.styles.textColor = [234, 88, 12];
          } else {
            data.cell.styles.textColor = [16, 185, 129];
          }
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 14;

    // ==========================================
    // RANKING DOS SINTOMAS MAIS FREQUENTES
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text("2. RANKING DE SINTOMAS RELATADOS PELOS TRABALHADORES (SRQ-20)", margin, y);
    y += 6;

    // Contar frequências
    const freqPerguntas = SRQ20_PERGUNTAS.map((q) => {
      const count = items.filter((item) => item.respostas[q.id] === true).length;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return { id: q.id, texto: q.texto, dominio: q.dominio, detalhe: q.detalheSST, count, pct };
    }).sort((a, b) => b.count - a.count);

    const topPerguntasRows = freqPerguntas.slice(0, 8).map((p, rank) => [
      `#${rank + 1} (P.${p.id})`,
      p.texto,
      p.dominio,
      `${p.count} (${p.pct}%)`,
      p.detalhe || "-",
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      head: [["Posição", "Sintoma Avaliado", "Domínio", "Frequência Relatada", "Impacto Ocupacional no PGR"]],
      body: topPerguntasRows,
      headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 7.5, fontStyle: "bold", cellPadding: 4 },
      bodyStyles: { fontSize: 7, textColor: [30, 41, 59], cellPadding: 3.5 },
      columnStyles: {
        0: { cellWidth: 50, halign: "center", fontStyle: "bold" },
        1: { cellWidth: 170 },
        2: { cellWidth: 95 },
        3: { cellWidth: 75, halign: "center", fontStyle: "bold" },
        4: { cellWidth: contentWidth - 390 },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 14;

    // ==========================================
    // MEDIDAS DE CONTROLE SUGERIDAS PARA O PLANO DE AÇÃO 5W2H
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text("3. MEDIDAS PREVENTIVAS SUGERIDAS PARA O PLANO DE AÇÃO (PGR / 5W2H)", margin, y);
    y += 6;

    const acoesRecomendadas = [
      ["Organização do Trabalho", "Revisar distribuição de demandas e metas", "Gestão / SESMT", "60 dias", "Reduzir pressão temporal e sobrecarga mental."],
      ["Comunicação & Clima", "Implantar canal confidencial e combate a assédios", "RH / Diretoria", "30 dias", "Preservar a dignidade e saúde mental dos colaboradores."],
      ["Gestão do Estresse", "Capacitar lideranças em gestão humanizada e escuta", "Consultoria SST", "90 dias", "Fortalecer relações interpessoais saudáveis."],
      ["Saúde & Acolhimento", "Programa de apoio psicológico e encaminhamento médico", "Médico Coordenador", "Contínuo", "Acolhimento precoce e redução do absenteísmo."],
    ];

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      head: [["Eixo de Ação", "O Que Fazer (Ação)", "Responsável", "Prazo Sugerido", "Objetivo / Mitigação"]],
      body: acoesRecomendadas,
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 7.5, fontStyle: "bold", cellPadding: 4 },
      bodyStyles: { fontSize: 7, textColor: [30, 41, 59], cellPadding: 3.5 },
      columnStyles: {
        0: { cellWidth: 95, fontStyle: "bold" },
        1: { cellWidth: 160 },
        2: { cellWidth: 80 },
        3: { cellWidth: 60, halign: "center" },
        4: { cellWidth: contentWidth - 395 },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 20;

    // Assinatura
    const tecNome = e.emp_consultoria_tecnico || e.emp_tecnico || "Responsável Técnico SST";
    const tecReg = e.emp_consultoria_registro || "Registro Profissional";

    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.6);
    doc.line(pageWidth / 2 - 100, y + 15, pageWidth / 2 + 100, y + 15);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(tecNome, pageWidth / 2, y + 25, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`${tecReg} • Laudo Consolidado de Riscos Psicossociais`, pageWidth / 2, y + 34, { align: "center" });

    addFooter(1, 1);

    const safeEmp = (e.emp_razao || "Empresa").replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`PGR_Laudo_Riscos_Psicossociais_SRQ20_${safeEmp}.pdf`);
  } catch (err) {
    console.error("Erro ao gerar PDF consolidado SRQ-20:", err);
    alert("Não foi possível gerar o laudo consolidado. Verifique os dados.");
  }
}
