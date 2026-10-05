import {
  Company,
  ESocialCatRegistro,
  ESocialS2240Registro,
  ESocialS2221Registro,
  PcmsoRegistroAso,
  ESocialConfig,
} from "../types";
import { mapearExameParaTabela27 } from "../data/esocialCatalogs";

// Helper de limpeza de documento (apenas dígitos)
export function sanitizeDoc(val?: string): string {
  if (!val) return "";
  return val.replace(/\D/g, "");
}

// Formatar data AAAA-MM-DD para o eSocial
export function formatXmlDate(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString().slice(0, 10);
  // Se for DD/MM/AAAA converter
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  return dateStr.slice(0, 10);
}

// Formatar hora HH:MM para HHMM
export function formatXmlTime(timeStr?: string): string {
  if (!timeStr) return "0800";
  return timeStr.replace(/\D/g, "").slice(0, 4).padEnd(4, "0");
}

// Escape de caracteres especiais em XML
export function escapeXml(str?: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Gerar ID padrão do eSocial: ID + tpInsc (1 dig) + nrInsc (14 dig) + timestamp (14 dig) + sequencial (5 dig)
export function generateESocialId(cnpjOrCpf: string, seq: number = 1): string {
  const cleanDoc = sanitizeDoc(cnpjOrCpf).padEnd(14, "0").slice(0, 14);
  const tpInsc = cleanDoc.length === 11 ? "2" : "1";
  const now = new Date();
  const timestamp =
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0") +
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0");
  const seqStr = String(seq).padStart(5, "0");
  return `ID${tpInsc}${cleanDoc}${timestamp}${seqStr}`;
}

export interface ESocialValidationIssue {
  tipo: "erro" | "alerta";
  campo: string;
  mensagem: string;
}

export interface ESocialXmlResult {
  xml: string;
  issues: ESocialValidationIssue[];
  validation: ESocialValidationIssue[];
}

// ==========================================
// 1. GERADOR DO EVENTO S-2210 (CAT)
// ==========================================
export function generateS2210Xml(
  company: Company,
  cat: ESocialCatRegistro,
  config?: ESocialConfig
): ESocialXmlResult {
  const issues: ESocialValidationIssue[] = [];
  const cnpj = sanitizeDoc(company.empresa?.emp_cnpj);
  const cpfTrab = sanitizeDoc(cat.trabalhador.cpf);
  const dtAcid = formatXmlDate(cat.dtAcidente);
  const hrAcid = formatXmlTime(cat.hrAcidente);
  const tpAmb = config?.tpAmb || "1";
  const procEmi = config?.procEmi || "1";
  const verProc = config?.verProc || "2.5.0";

  // Validações
  if (!cnpj) {
    issues.push({ tipo: "erro", campo: "CNPJ da Empresa", mensagem: "O CNPJ da empresa é obrigatório para gerar o XML do eSocial." });
  }
  if (!cpfTrab || cpfTrab.length !== 11) {
    issues.push({ tipo: "erro", campo: "CPF do Trabalhador", mensagem: "O CPF do acidentado deve conter 11 dígitos válidos." });
  }
  if (!cat.trabalhador.matricula) {
    issues.push({ tipo: "alerta", campo: "Matrícula do Trabalhador", mensagem: "Matrícula não informada. O eSocial exige a matrícula cadastrada no evento S-2200." });
  }
  if (!cat.atestadoMedico.codCID) {
    issues.push({ tipo: "erro", campo: "Código CID-10", mensagem: "O código CID-10 da lesão é obrigatório no atestado médico da CAT." });
  }
  if (!cat.atestadoMedico.medicoNrOC) {
    issues.push({ tipo: "erro", campo: "CRM do Médico", mensagem: "O número de registro no CRM/Conselho do médico assistente é obrigatório." });
  }

  const evtId = generateESocialId(cnpj || "00000000000000", 1);
  const matricula = cat.trabalhador.matricula || "000001";
  const codMun = cat.localAcidente.codMunicipio ? `<codMunic>${cat.localAcidente.codMunicipio}</codMunic>` : "";
  const dtObitoXml = cat.indMorte === "S" && cat.dtObito ? `<dtObito>${formatXmlDate(cat.dtObito)}</dtObito>` : "";
  const recOrigem = cat.tipoCat !== "1" && cat.nrRecCatOrigem ? `<nrRecCatOrig>${cat.nrRecCatOrigem}</nrRecCatOrig>` : "";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtCAT/v_S_01_02_00">
  <evtCAT Id="${evtId}">
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>${tpAmb}</tpAmb>
      <procEmi>${procEmi}</procEmi>
      <verProc>${escapeXml(verProc)}</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${cnpj.padEnd(14, "0").slice(0, 14)}</nrInsc>
    </ideEmpregador>
    <ideTrabalhador>
      <cpfTrab>${cpfTrab}</cpfTrab>
      <matricula>${escapeXml(matricula)}</matricula>
    </ideTrabalhador>
    <cat>
      <dtAcid>${dtAcid}</dtAcid>
      <tpAcid>${cat.tpAcidente}</tpAcid>
      <hrAcid>${hrAcid}</hrAcid>
      <hrsTrabAntesAcid>${formatXmlTime(cat.hrsTrabAntesAcidente)}</hrsTrabAntesAcid>
      <tpCat>${cat.tipoCat}</tpCat>
      <indCatObito>${cat.indMorte}</indCatObito>
      ${dtObitoXml}
      <indComunPolicia>${cat.houvePolicia}</indComunPolicia>
      <codSitGeradora>${escapeXml(cat.agenteCausador.codAgenteCausador)}</codSitGeradora>
      <iniciatCAT>1</iniciatCAT>
      ${recOrigem}
      <localAcidente>
        <tpLocal>${cat.localAcidente.tpLocal}</tpLocal>
        <dscLocal>${escapeXml(cat.localAcidente.dscLocal || "Local de Trabalho")}</dscLocal>
        <dscLograd>${escapeXml(cat.localAcidente.dscLogradouro || company.empresa?.emp_endereco || "Rua")}</dscLograd>
        <nrLograd>${escapeXml(cat.localAcidente.nrLogradouro || "S/N")}</nrLograd>
        <bairro>${escapeXml(cat.localAcidente.bairro || company.empresa?.emp_bairro || "Centro")}</bairro>
        <cep>${sanitizeDoc(cat.localAcidente.cep || company.empresa?.emp_cep || "00000000")}</cep>
        ${codMun}
        <uf>${cat.localAcidente.uf || company.empresa?.emp_uf || "SP"}</uf>
      </localAcidente>
      <parteAtingida>
        <codParteAting>${escapeXml(cat.parteAtingida.codParteAtingida)}</codParteAting>
        <lateralidade>${cat.parteAtingida.lateralidade}</lateralidade>
      </parteAtingida>
      <agenteCausador>
        <codAgntCausador>${escapeXml(cat.agenteCausador.codAgenteCausador)}</codAgntCausador>
      </agenteCausador>
      <atestado>
        <dtAtend>${formatXmlDate(cat.atestadoMedico.dtAtendimento)}</dtAtend>
        <hrAtend>${formatXmlTime(cat.atestadoMedico.hrAtendimento)}</hrAtend>
        <indInternacao>${cat.atestadoMedico.indInternacao}</indInternacao>
        <durTrat>${cat.atestadoMedico.durTrat || 1}</durTrat>
        <indAfast>${cat.atestadoMedico.indAfastamento}</indAfast>
        <dscLesao>${escapeXml(cat.atestadoMedico.codLesao)}</dscLesao>
        <codCID>${escapeXml(cat.atestadoMedico.codCID)}</codCID>
        <emitente>
          <nmEmit>${escapeXml(cat.atestadoMedico.medicoNome || "Dr. Médico Assistente")}</nmEmit>
          <ideOC>${cat.atestadoMedico.medicoIdeOC}</ideOC>
          <nrOC>${escapeXml(cat.atestadoMedico.medicoNrOC)}</nrOC>
          <ufOC>${cat.atestadoMedico.medicoUfOC || "SP"}</ufOC>
        </emitente>
      </atestado>
    </cat>
  </evtCAT>
</eSocial>`;

  return { xml, issues, validation: issues };
}

// ==========================================
// 2. GERADOR DO EVENTO S-2220 (MONITORAMENTO DA SAÚDE / ASO)
// ==========================================
export function generateS2220Xml(
  company: Company,
  aso: PcmsoRegistroAso,
  config?: ESocialConfig
): ESocialXmlResult {
  const issues: ESocialValidationIssue[] = [];
  const cnpj = sanitizeDoc(company.empresa?.emp_cnpj);
  const cpfTrab = sanitizeDoc(aso.cpf);
  const dtAso = formatXmlDate(aso.dataRealizacao);
  const tpAmb = config?.tpAmb || "1";
  const procEmi = config?.procEmi || "1";
  const verProc = config?.verProc || "2.5.0";

  // Mapear Tipo de ASO do PCMSO para eSocial (0 - Admissional, 1 - Periódico, 2 - Retorno, 3 - Mudança de Risco, 9 - Demissional)
  let tpExameOcup = "1";
  if (aso.tipoAso === "Admissional") tpExameOcup = "0";
  else if (aso.tipoAso === "Periódico") tpExameOcup = "1";
  else if (aso.tipoAso === "Retorno ao Trabalho") tpExameOcup = "2";
  else if (aso.tipoAso === "Mudança de Riscos Ocupacionais") tpExameOcup = "3";
  else if (aso.tipoAso === "Demissional") tpExameOcup = "9";

  const resAso = aso.resultado === "Inapto" ? "2" : "1"; // 1 - Apto, 2 - Inapto

  if (!cnpj) {
    issues.push({ tipo: "erro", campo: "CNPJ da Empresa", mensagem: "O CNPJ da empresa é obrigatório." });
  }
  if (!cpfTrab || cpfTrab.length !== 11) {
    issues.push({ tipo: "erro", campo: "CPF do Trabalhador", mensagem: "O CPF do colaborador deve conter 11 dígitos." });
  }
  if (!aso.medicoExaminadorCrm) {
    issues.push({ tipo: "erro", campo: "CRM do Médico Examinador", mensagem: "CRM do médico examinador é obrigatório no S-2220." });
  }

  const evtId = generateESocialId(cnpj || "00000000000000", 2);
  const matricula = aso.matricula || "000001";

  // Exames complementares e clínico (Tabela 27)
  let examesXml = "";
  if (aso.examesRealizados && aso.examesRealizados.length > 0) {
    aso.examesRealizados.forEach((ex) => {
      const procInfo = mapearExameParaTabela27(ex.nome);
      let indRes = "1"; // 1 - Normal, 2 - Alterado, 3 - Estável
      if (ex.resultado === "Alterado") indRes = "2";
      if (ex.resultado === "Estável") indRes = "3";

      examesXml += `
        <exame>
          <dtExm>${formatXmlDate(ex.data || aso.dataRealizacao)}</dtExm>
          <procRealizado>${procInfo.codigo}</procRealizado>
          <obsProc>${escapeXml(ex.nome)}</obsProc>
          <ordExm>1</ordExm>
          <indResult>${indRes}</indResult>
        </exame>`;
    });
  } else {
    // Adicionar pelo menos Avaliação Clínica Ocupacional (0050)
    examesXml = `
        <exame>
          <dtExm>${dtAso}</dtExm>
          <procRealizado>0050</procRealizado>
          <obsProc>Avaliação Clínica Ocupacional</obsProc>
          <ordExm>1</ordExm>
          <indResult>1</indResult>
        </exame>`;
  }

  // Médico Coordenador do PCMSO (se houver)
  const medCoordNome = aso.medicoCoordenadorNome || company.empresa?.emp_medico_coordenador;
  const medCoordCrm = aso.medicoCoordenadorCrm || company.empresa?.emp_medico_crm;
  let medicoRespXml = "";
  if (medCoordNome && medCoordCrm) {
    medicoRespXml = `
        <respMonit>
          <cpfResp>${sanitizeDoc(config?.responsavelTecnicoCpf || "00000000000")}</cpfResp>
          <nmMed>${escapeXml(medCoordNome)}</nmMed>
          <nrCRM>${sanitizeDoc(medCoordCrm)}</nrCRM>
          <ufCRM>${company.empresa?.emp_uf || "SP"}</ufCRM>
        </respMonit>`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtMonit/v_S_01_02_00">
  <evtMonit Id="${evtId}">
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>${tpAmb}</tpAmb>
      <procEmi>${procEmi}</procEmi>
      <verProc>${escapeXml(verProc)}</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${cnpj.padEnd(14, "0").slice(0, 14)}</nrInsc>
    </ideEmpregador>
    <ideTrabalhador>
      <cpfTrab>${cpfTrab}</cpfTrab>
      <matricula>${escapeXml(matricula)}</matricula>
    </ideTrabalhador>
    <aso>
      <dtAso>${dtAso}</dtAso>
      <tpExameOcup>${tpExameOcup}</tpExameOcup>
      <resAso>${resAso}</resAso>
      ${examesXml}
      <medico>
        <nmMed>${escapeXml(aso.medicoExaminadorNome || "Médico Examinador")}</nmMed>
        <nrCRM>${sanitizeDoc(aso.medicoExaminadorCrm || "00000")}</nrCRM>
        <ufCRM>${aso.medicoExaminadorUf || company.empresa?.emp_uf || "SP"}</ufCRM>
      </medico>
      ${medicoRespXml}
    </aso>
  </evtMonit>
</eSocial>`;

  return { xml, issues, validation: issues };
}

// ==========================================
// 3. GERADOR DO EVENTO S-2240 (CONDIÇÕES AMBIENTAIS / AGENTES NOCIVOS)
// ==========================================
export function generateS2240Xml(
  company: Company,
  reg: ESocialS2240Registro,
  config?: ESocialConfig
): ESocialXmlResult {
  const issues: ESocialValidationIssue[] = [];
  const cnpj = sanitizeDoc(company.empresa?.emp_cnpj);
  const cpfTrab = sanitizeDoc(reg.cpfTrabalhador || "00000000000");
  const dtIni = formatXmlDate(reg.dtInicioCondicao);
  const tpAmb = config?.tpAmb || "1";
  const procEmi = config?.procEmi || "1";
  const verProc = config?.verProc || "2.5.0";

  if (!cnpj) {
    issues.push({ tipo: "erro", campo: "CNPJ da Empresa", mensagem: "CNPJ da empresa é obrigatório." });
  }
  if (!reg.cbo) {
    issues.push({ tipo: "alerta", campo: "CBO do Cargo", mensagem: "Código CBO não informado para a função." });
  }
  if (!reg.responsavelAmbiental.cpf || sanitizeDoc(reg.responsavelAmbiental.cpf).length !== 11) {
    issues.push({ tipo: "erro", campo: "CPF do Responsável Técnico", mensagem: "CPF do responsável técnico dos registros ambientais (CREA/CRM) é obrigatório." });
  }

  const evtId = generateESocialId(cnpj || "00000000000000", 3);
  const matricula = reg.matriculaTrabalhador || "000001";

  // Agentes Nocivos
  let agNocXml = "";
  if (reg.agentesNocivos && reg.agentesNocivos.length > 0) {
    reg.agentesNocivos.forEach((ag) => {
      let epcXml = "";
      if (ag.utilizaEpc !== "0") {
        epcXml = `
            <epc>
              <utilizEPC>${ag.utilizaEpc}</utilizEPC>
              <eficEpc>${ag.epcEficaz || "S"}</eficEpc>
            </epc>`;
      }

      let epiXml = "";
      if (ag.utilizaEpi === "2" && ag.epis && ag.epis.length > 0) {
        let episDetail = "";
        ag.epis.forEach((item) => {
          episDetail += `
              <epi>
                <docAval>${sanitizeDoc(item.ca) || "0000"}</docAval>
                <dscEPI>${escapeXml(item.descricao)}</dscEPI>
                <eficEpi>${item.eficaz || "S"}</eficEpi>
                <medProtecao>${item.medidasProtecao ? "S" : "N"}</medProtecao>
                <condFuncto>${item.condicoesFuncionamento ? "S" : "N"}</condFuncto>
                <usoInint>${item.usoIninterrupto ? "S" : "N"}</usoInint>
                <przValid>${item.prazoValidade ? "S" : "N"}</przValid>
                <periodicTroca>${item.periodicidadeTroca ? "S" : "N"}</periodicTroca>
                <higienizacao>${item.higienizacao ? "S" : "N"}</higienizacao>
              </epi>`;
        });

        epiXml = `
            <epi>
              <utilizEPI>2</utilizEPI>
              <epiCompl>
                ${episDetail}
              </epiCompl>
            </epi>`;
      } else {
        epiXml = `
            <epi>
              <utilizEPI>${ag.utilizaEpi}</utilizEPI>
            </epi>`;
      }

      let medicaoXml = "";
      if (ag.tpAval === "1") {
        medicaoXml = `
            <intConc>${ag.intConc || "0.00"}</intConc>
            <limTol>${ag.limTol || "0.00"}</limTol>
            <unMed>${ag.unMed || "3"}</unMed>
            <tecMedicao>${escapeXml(ag.tecMedicao || "NHO-01 / NR-15")}</tecMedicao>`;
      }

      agNocXml += `
        <agNoc>
          <codAgNoc>${ag.codAgNoc}</codAgNoc>
          <dscAgNoc>${escapeXml(ag.dscAgNoc)}</dscAgNoc>
          <tpAval>${ag.tpAval}</tpAval>
          ${medicaoXml}
          ${epcXml}
          ${epiXml}
        </agNoc>`;
    });
  } else {
    // Ausência de Risco
    agNocXml = `
        <agNoc>
          <codAgNoc>09.01.001</codAgNoc>
          <dscAgNoc>Ausência de fator de risco ou atividades não enquadradas no Anexo IV do RPS</dscAgNoc>
          <tpAval>2</tpAval>
        </agNoc>`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtExpRisco/v_S_01_02_00">
  <evtExpRisco Id="${evtId}">
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>${tpAmb}</tpAmb>
      <procEmi>${procEmi}</procEmi>
      <verProc>${escapeXml(verProc)}</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${cnpj.padEnd(14, "0").slice(0, 14)}</nrInsc>
    </ideEmpregador>
    <ideTrabalhador>
      <cpfTrab>${cpfTrab}</cpfTrab>
      <matricula>${escapeXml(matricula)}</matricula>
    </ideTrabalhador>
    <infoExpRisco>
      <dtIniCond>${dtIni}</dtIniCond>
      <infoAmb>
        <localAmb>1</localAmb>
        <dscSetor>${escapeXml(reg.setorNome || "Setor Operacional")}</dscSetor>
        <tpInsc>1</tpInsc>
        <nrInsc>${cnpj.padEnd(14, "0").slice(0, 14)}</nrInsc>
      </infoAmb>
      <infoAtiv>
        <dscAtivDes>${escapeXml(reg.descricaoAtividades || "Execução das atividades da função")}</dscAtivDes>
      </infoAtiv>
      ${agNocXml}
      <respReg>
        <cpfResp>${sanitizeDoc(reg.responsavelAmbiental.cpf)}</cpfResp>
        <ideOC>${reg.responsavelAmbiental.ideOC || "4"}</ideOC>
        <dscOC>CREA</dscOC>
        <nrOC>${escapeXml(reg.responsavelAmbiental.nrOC || "000000")}</nrOC>
        <ufOC>${reg.responsavelAmbiental.ufOC || company.empresa?.emp_uf || "SP"}</ufOC>
      </respReg>
    </infoExpRisco>
  </evtExpRisco>
</eSocial>`;

  return { xml, issues, validation: issues };
}

// ==========================================
// 4. GERADOR DO EVENTO S-2221 (Exame Toxicológico do Motorista Profissional)
// Portaria MTE nº 612/2024 e CLT art. 168 § 6º e 7º
// ==========================================
export function generateS2221Xml(
  company: Company,
  reg: ESocialS2221Registro,
  config?: ESocialConfig
): ESocialXmlResult {
  const issues: ESocialValidationIssue[] = [];
  const cnpj = sanitizeDoc(company.empresa?.emp_cnpj);
  const cpfTrab = sanitizeDoc(reg.cpfTrabalhador);
  const matricula = (reg.matriculaTrabalhador || "").trim();
  const dtExame = formatXmlDate(reg.dtExame);
  const cnpjLab = sanitizeDoc(reg.cnpjLab);
  const codSeqExame = (reg.codSeqExame || "").trim().toUpperCase();
  const crmMed = sanitizeDoc(reg.medicoRevisorCrm);
  const ufMed = (reg.medicoRevisorUf || "").trim().toUpperCase();
  const nmMed = (reg.medicoRevisorNome || "").trim();

  const tpAmb = config?.tpAmb || "1";
  const procEmi = config?.procEmi || "1";
  const verProc = config?.verProc || "2.5.0";

  // Validações Oficiais
  if (!cnpj) {
    issues.push({ tipo: "erro", campo: "CNPJ do Empregador", mensagem: "O CNPJ da empresa é obrigatório para transmissão ao eSocial." });
  }
  if (!cpfTrab || cpfTrab.length !== 11) {
    issues.push({ tipo: "erro", campo: "CPF do Trabalhador", mensagem: "O CPF do motorista deve conter 11 dígitos numéricos válidos." });
  }
  if (!matricula) {
    issues.push({ tipo: "alerta", campo: "Matrícula do Trabalhador", mensagem: "Matrícula no eSocial não preenchida. Recomendada para empregados CLT." });
  }
  if (!cnpjLab || cnpjLab.length !== 14) {
    issues.push({ tipo: "erro", campo: "CNPJ do Laboratório", mensagem: "O CNPJ do laboratório credenciado deve conter 14 dígitos." });
  }
  if (!codSeqExame) {
    issues.push({ tipo: "erro", campo: "Código do Exame Toxicológico", mensagem: "O código sequencial do laudo laboratorial (ex: SP123456789) é obrigatório." });
  }
  if (!crmMed) {
    issues.push({ tipo: "erro", campo: "CRM do Médico Revisor", mensagem: "O CRM do médico revisor responsável é obrigatório." });
  }
  if (!ufMed) {
    issues.push({ tipo: "erro", campo: "UF do CRM", mensagem: "A Unidade Federativa (UF) do CRM do médico revisor é obrigatória." });
  }

  const evtId = generateESocialId(cnpj || cpfTrab, Math.floor(Math.random() * 90000) + 10000);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtToxic/v_S_01_02_00">
  <evtToxic Id="${evtId}">
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>${tpAmb}</tpAmb>
      <procEmi>${procEmi}</procEmi>
      <verProc>${escapeXml(verProc)}</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${cnpj.padEnd(14, "0").slice(0, 14)}</nrInsc>
    </ideEmpregador>
    <ideTrabalhador>
      <cpfTrab>${cpfTrab}</cpfTrab>
      <matricula>${escapeXml(matricula)}</matricula>
    </ideTrabalhador>
    <toxico>
      <dtExame>${dtExame}</dtExame>
      <cnpjLab>${cnpjLab.padEnd(14, "0").slice(0, 14)}</cnpjLab>
      <codSeqExame>${escapeXml(codSeqExame)}</codSeqExame>
      <medico>
        <nmMed>${escapeXml(nmMed || "Médico Revisor")}</nmMed>
        <nrCRM>${escapeXml(crmMed)}</nrCRM>
        <ufCRM>${escapeXml(ufMed || "SP")}</ufCRM>
      </medico>
    </toxico>
  </evtToxic>
</eSocial>`;

  return { xml, issues, validation: issues };
}

// Download de arquivo XML no navegador
export function downloadXmlFile(xmlContent: string, fileName: string): void {
  const blob = new Blob([xmlContent], { type: "application/xml;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName.endsWith(".xml") ? fileName : `${fileName}.xml`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Download de múltiplos arquivos XML concatenados ou pacote em lote
export function downloadBatchXmlFiles(
  files: { name: string; content: string }[],
  zipName: string = "esocial_sst_lote"
): void {
  if (files.length === 1) {
    downloadXmlFile(files[0].content, files[0].name);
    return;
  }

  // Gera um arquivo consolidado legível com separadores para importadores de ERP
  let batchContent = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- PACOTE DE EVENTOS ESOCIAL SST - ${files.length} EVENTOS -->\n<loteEventosESocial>\n`;
  files.forEach((f, idx) => {
    batchContent += `  <!-- EVENTO ${idx + 1}: ${f.name} -->\n`;
    // Retira o cabeçalho <?xml...> individual para compor o lote
    const body = f.content.replace(/<\?xml[^>]*\?>/g, "").trim();
    batchContent += `  ${body}\n\n`;
  });
  batchContent += `</loteEventosESocial>`;

  downloadXmlFile(batchContent, `${zipName}.xml`);
}
