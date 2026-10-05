import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Company, ESocialCatRegistro, ESocialS2240Registro, PcmsoRegistroAso } from "../types";

// ==========================================
// 1. EMISSÃO DA FICHA OFICIAL DE CAT (S-2210)
// ==========================================
export function generateCatPdf(
  company: Company,
  cat: ESocialCatRegistro,
  via: "1ª Via - Empregador" | "2ª Via - INSS / Previdência" | "3ª Via - Segurado / Acidentado" | "4ª Via - Sindicato" | "Completa (Todas as 4 Vias)" = "Completa (Todas as 4 Vias)"
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  const vias =
    via === "Completa (Todas as 4 Vias)"
      ? [
          "1ª VIA - EMPREGADOR",
          "2ª VIA - INSS / PREVIDÊNCIA SOCIAL",
          "3ª VIA - SEGURADO (ACIDENTADO)",
          "4ª VIA - SINDICATO DOS TRABALHADORES",
        ]
      : [via.toUpperCase()];

  vias.forEach((viaNome, index) => {
    if (index > 0) doc.addPage();

    const emp = company.empresa || {};

    // Header CAT
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(0, 0, pageWidth, 55, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("CAT - COMUNICAÇÃO DE ACIDENTE DE TRABALHO", margin, 26);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("eSocial Evento S-2210 • Lei nº 8.213/91 Art. 22 • Portaria MTP nº 671/2021", margin, 42);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(234, 179, 8); // Amber 400
    doc.text(viaNome, pageWidth - margin - doc.getTextWidth(viaNome), 34);

    let yPos = 70;

    // Quadro 1 - Emitente e Tipo
    autoTable(doc, {
      startY: yPos,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 8.5, fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 3.5, lineColor: [203, 213, 225], textColor: [15, 23, 42] },
      head: [["I. IDENTIFICAÇÃO DO EMITENTE E DA OCORRÊNCIA", "DADOS DO PROTOCOLO"]],
      body: [
        [
          `Tipo de CAT: ${cat.tipoCat === "1" ? "1 - Inicial" : cat.tipoCat === "2" ? "2 - Reabertura" : "3 - Comunicação de Óbito"}\nRazão Social: ${emp.emp_razao || "N/I"}\nCNPJ/MF: ${emp.emp_cnpj || "N/I"}\nCNAE: ${emp.emp_cnae || "N/I"} - Grau de Risco: ${emp.emp_grau_risco || "2"}\nEndereço: ${emp.emp_endereco || "N/I"}, ${emp.emp_bairro || ""} - ${emp.emp_cidade || ""}/${emp.emp_uf || ""}`,
          `Nº Controle Interno: ${cat.id.slice(0, 10).toUpperCase()}\nData de Emissão: ${new Date().toLocaleDateString("pt-BR")}\nRecibo eSocial: ${cat.reciboESocial || "Gerado pelo Sistema"}\nFilial / Unidade: Matriz`,
        ],
      ],
    });

    yPos = (doc as any).lastAutoTable.finalY + 8;

    // Quadro 2 - Acidentado
    autoTable(doc, {
      startY: yPos,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 8.5, fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 3.5, lineColor: [203, 213, 225], textColor: [15, 23, 42] },
      head: [["II. INFORMAÇÕES DO TRABALHADOR ACIDENTADO", "DADOS CONTRATUAIS"]],
      body: [
        [
          `Nome: ${cat.trabalhador.nome || "Não informado"}\nCPF: ${cat.trabalhador.cpf || "N/I"}\nData Nasc: ${cat.trabalhador.dataNascimento || "N/I"}\nSexo: ${cat.trabalhador.sexo === "F" ? "Feminino" : "Masculino"}\nEstado Civil: ${cat.trabalhador.estadoCivil || "Solteiro(a)"}`,
          `Matrícula: ${cat.trabalhador.matricula || "000001"}\nCargo / Função: ${cat.trabalhador.funcaoNome || "Operacional"}\nCBO: ${cat.trabalhador.cbo || "N/I"}\nRemuneração Mensal: Conforme Folha de Pagamento\nTipo de Contrato: CLT - Prazo Indeterminado`,
        ],
      ],
    });

    yPos = (doc as any).lastAutoTable.finalY + 8;

    // Quadro 3 - Acidente ou Doença
    autoTable(doc, {
      startY: yPos,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 8.5, fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 3.5, lineColor: [203, 213, 225], textColor: [15, 23, 42] },
      head: [["III. DADOS DO ACIDENTE OU DOENÇA OCUPACIONAL", "LOCAL E CARACTERIZAÇÃO"]],
      body: [
        [
          `Data do Acidente: ${cat.dtAcidente ? new Date(cat.dtAcidente + "T00:00:00").toLocaleDateString("pt-BR") : "N/I"}\nHora do Acidente: ${cat.hrAcidente || "08:00"}\nHoras Trabalhadas antes do Acidente: ${cat.hrsTrabAntesAcidente || "02:00"}\nTipo de Acidente: ${cat.tpAcidente === "1" ? "Típico" : cat.tpAcidente === "2" ? "Doença Ocupacional" : "Trajeto"}\nHouve Afastamento?: ${cat.indAfastamento === "S" ? "SIM" : "NÃO"}\nHouve Óbito?: ${cat.indMorte === "S" ? `SIM (Data: ${cat.dtObito || "N/I"})` : "NÃO"}\nHouve Registro Policial (B.O.)?: ${cat.houvePolicia === "S" ? "SIM" : "NÃO"}`,
          `Tipo do Local: ${cat.localAcidente.tpLocal === "1" ? "Estabelecimento do Empregador" : cat.localAcidente.tpLocal === "2" ? "Estabelecimento de Terceiros" : cat.localAcidente.tpLocal === "3" ? "Via Pública" : "Outros"}\nDescrição do Local: ${cat.localAcidente.dscLocal || "Setor Operacional"}\nLogradouro: ${cat.localAcidente.dscLogradouro || emp.emp_endereco || "N/I"}, Nº ${cat.localAcidente.nrLogradouro || "S/N"}\nBairro: ${cat.localAcidente.bairro || emp.emp_bairro || ""}\nMunicípio/UF: ${cat.localAcidente.uf || emp.emp_uf || "SP"} - CEP: ${cat.localAcidente.cep || emp.emp_cep || ""}`,
        ],
      ],
    });

    yPos = (doc as any).lastAutoTable.finalY + 8;

    // Quadro 4 - Parte do Corpo e Agente Causador
    autoTable(doc, {
      startY: yPos,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 8.5, fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 3.5, lineColor: [203, 213, 225], textColor: [15, 23, 42] },
      head: [["IV. PARTE DO CORPO ATINGIDA (TABELA 13)", "V. AGENTE CAUSADOR (TABELA 14/15)"]],
      body: [
        [
          `Código eSocial: ${cat.parteAtingida.codParteAtingida}\nDescrição: ${cat.parteAtingida.dscParteAtingida}\nLateralidade: ${cat.parteAtingida.lateralidade === "1" ? "Esquerda" : cat.parteAtingida.lateralidade === "2" ? "Direita" : cat.parteAtingida.lateralidade === "3" ? "Ambas" : "Não Aplicável"}`,
          `Código eSocial: ${cat.agenteCausador.codAgenteCausador}\nDescrição: ${cat.agenteCausador.dscAgenteCausador}`,
        ],
      ],
    });

    yPos = (doc as any).lastAutoTable.finalY + 8;

    // Quadro 5 - Atestado Médico
    autoTable(doc, {
      startY: yPos,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 8.5, fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 3.5, lineColor: [203, 213, 225], textColor: [15, 23, 42] },
      head: [["VI. LAUDO / ATESTADO MÉDICO (TABELA 17)", "MÉDICO ASSISTENTE"]],
      body: [
        [
          `Data do Atendimento: ${cat.atestadoMedico.dtAtendimento ? new Date(cat.atestadoMedico.dtAtendimento + "T00:00:00").toLocaleDateString("pt-BR") : "N/I"} às ${cat.atestadoMedico.hrAtendimento || "09:00"}\nHouve Internação?: ${cat.atestadoMedico.indInternacao === "S" ? "SIM" : "NÃO"}\nDuração Provável do Tratamento: ${cat.atestadoMedico.durTrat || 0} dia(s)\nNatureza da Lesão: ${cat.atestadoMedico.dscLesao} (${cat.atestadoMedico.codLesao})\nDiagnóstico Provável: ${cat.atestadoMedico.diagnosticoProvavel || "Lesão Traumática"}\nCódigo CID-10: ${cat.atestadoMedico.codCID || "Não informado"}`,
          `Nome do Médico: ${cat.atestadoMedico.medicoNome || "Dr. Médico Assistente"}\nConselho de Classe: CRM / ${cat.atestadoMedico.medicoUfOC || "SP"}\nNúmero do Registro: ${cat.atestadoMedico.medicoNrOC || "00000"}\n\nAssinatura / Carimbo do Médico:\n\n__________________________________`,
        ],
      ],
    });

    yPos = (doc as any).lastAutoTable.finalY + 18;

    // Assinaturas de Rodapé
    doc.setDrawColor(148, 163, 184);
    doc.line(margin, yPos + 22, margin + 220, yPos + 22);
    doc.line(pageWidth - margin - 220, yPos + 22, pageWidth - margin, yPos + 22);

    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text("Assinatura do Empregador / Emitente", margin + 20, yPos + 32);
    doc.text("Assinatura do Segurado / Representante", pageWidth - margin - 200, yPos + 32);

    // Footer da Página
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Ficha de CAT gerada conforme layout eSocial S-2210 • ${emp.emp_razao || "Empresa"} • CNPJ: ${emp.emp_cnpj || "N/I"}`,
      margin,
      pageHeight - 16
    );
  });

  doc.save(`CAT_S2210_${cat.trabalhador.nome.replace(/\s+/g, "_") || "Trabalhador"}.pdf`);
}

// ==========================================
// 2. DOSSIÊ GERAL DE CONFORMIDADE ESOCIAL SST
// ==========================================
export function generateESocialComplianceDossierPdf(
  company: Company,
  s2240List: ESocialS2240Registro[],
  catList: ESocialCatRegistro[],
  asoList: PcmsoRegistroAso[]
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  const emp = company.empresa || {};

  // Header Cover
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 90, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("DOSSIÊ DE CONFORMIDADE ESOCIAL SST", margin, 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text("Eventos de Segurança e Saúde no Trabalho: S-2210 (CAT), S-2220 (ASO) e S-2240 (Condições Ambientais)", margin, 58);
  doc.text(`Empresa: ${emp.emp_razao || "Empresa"} • CNPJ: ${emp.emp_cnpj || "N/I"} • Data: ${new Date().toLocaleDateString("pt-BR")}`, margin, 72);

  let yPos = 110;

  // Resumo Executivo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("1. Resumo Quantitativo de Eventos do eSocial", margin, yPos);
  yPos += 12;

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    theme: "striped",
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8.5, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 4 },
    head: [["Evento eSocial", "Nome do Evento", "Finalidade Legal", "Qtd. Registros", "Status Geral"]],
    body: [
      ["S-2210", "Comunicação de Acidente de Trabalho", "Notificação de acidentes típicos, trajeto e doenças (Art. 22 Lei 8.213/91)", `${catList.length} CATs`, catList.length > 0 ? "Registrado" : "Sem Ocorrências"],
      ["S-2220", "Monitoramento da Saúde do Trabalhador", "Atestados de Saúde Ocupacional - ASO (NR-07 e Art. 168 CLT)", `${asoList.length} ASOs`, asoList.length > 0 ? "Conforme" : "Pendente"],
      ["S-2240", "Condições Ambientais de Trabalho", "Agentes nocivos e aposentadoria especial (LTCAT e Dec. 3.048/99)", `${s2240List.length} Cargos/Setores`, s2240List.length > 0 ? "Conforme" : "Pendente"],
    ],
  });

  yPos = (doc as any).lastAutoTable.finalY + 18;

  // Quadro de S-2240
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("2. Inventário de Agentes Nocivos por Função (Evento S-2240)", margin, yPos);
  yPos += 12;

  const s2240Rows: any[] = [];
  s2240List.forEach((item) => {
    const agentesDesc =
      item.agentesNocivos.length > 0
        ? item.agentesNocivos.map((a) => `${a.codAgNoc} - ${a.dscAgNoc} (EPI: ${a.utilizaEpi === "2" ? "Sim" : "Não"})`).join("\n")
        : "09.01.001 - Ausência de fator de risco";

    s2240Rows.push([
      item.funcaoNome,
      item.setorNome,
      item.cbo || "N/I",
      agentesDesc,
      item.statusEnvio,
    ]);
  });

  if (s2240Rows.length === 0) {
    s2240Rows.push(["Nenhuma função vinculada", "-", "-", "Ausência de agentes cadastrados", "Pendente"]);
  }

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 7.5, cellPadding: 3.5 },
    head: [["Função / Cargo", "Setor", "CBO", "Fatores de Risco (Tabela 24 eSocial)", "Status XML"]],
    body: s2240Rows,
  });

  yPos = (doc as any).lastAutoTable.finalY + 18;

  // Quadro de ASOs (S-2220)
  if (yPos > pageHeight - 120) {
    doc.addPage();
    yPos = 40;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("3. Histórico de Monitoramento da Saúde / ASOs (Evento S-2220)", margin, yPos);
  yPos += 12;

  const asoRows: any[] = [];
  asoList.forEach((aso) => {
    asoRows.push([
      aso.nomeEmpregado,
      aso.cpf,
      aso.funcaoNome,
      aso.tipoAso,
      aso.dataRealizacao,
      aso.resultado,
      `CRM ${aso.medicoExaminadorCrm}/${aso.medicoExaminadorUf || "SP"}`,
    ]);
  });

  if (asoRows.length === 0) {
    asoRows.push(["Nenhum ASO registrado no período", "-", "-", "-", "-", "-", "-"]);
  }

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: [13, 148, 136], textColor: 255, fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 7.5, cellPadding: 3.5 },
    head: [["Trabalhador", "CPF", "Função", "Tipo ASO", "Data Realização", "Aptidão", "Médico Examinador"]],
    body: asoRows,
  });

  // Footer da Página
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Dossiê eSocial SST • ${emp.emp_razao || "Empresa"} • CNPJ: ${emp.emp_cnpj || "N/I"} • Página ${i} de ${totalPages}`,
      margin,
      pageHeight - 16
    );
  }

  doc.save(`ESocial_SST_Dossie_${emp.emp_razao?.replace(/\s+/g, "_") || "Empresa"}.pdf`);
}
