export interface EmpresaData {
  emp_cnpj: string;
  emp_razao: string;
  emp_fantasia: string;
  emp_ie: string;
  emp_im: string;
  emp_fundacao: string;
  emp_vistoria: string;
  emp_endereco: string;
  emp_bairro: string;
  emp_cidade: string;
  emp_uf: string;
  emp_cep: string;
  emp_telefone: string;
  emp_email: string;
  emp_cnae: string;
  emp_cnae_desc: string;
  emp_grau_risco: string;
  emp_total_func: string;
  emp_responsavel: string;
  emp_cargo_resp: string;
  emp_cpf_resp: string;
  emp_tecnico: string;
  emp_medico_coordenador?: string;
  emp_medico_crm?: string;
  emp_logo?: string; // Logotipo oficial da Empresa / Estabelecimento (Base64 PNG/JPEG)
  emp_consultoria?: string;
  emp_consultoria_razao?: string;
  emp_consultoria_cnpj?: string;
  emp_consultoria_registro?: string;
  emp_consultoria_tecnico?: string;
  emp_consultoria_cargo?: string;
  emp_consultoria_telefone?: string;
  emp_consultoria_email?: string;
  emp_consultoria_logo?: string;
  // Assinatura Digital do Representante da Empresa (na tela)
  emp_ass_rep_img?: string;
  emp_ass_rep_nome?: string;
  emp_ass_rep_cargo_cpf?: string;
  emp_ass_rep_data?: string;
  // Assinatura Digital do Vistoriador / Técnico SST (na tela)
  emp_ass_tec_img?: string;
  emp_ass_tec_nome?: string;
  emp_ass_tec_registro?: string;
  emp_ass_tec_data?: string;
  emp_localizacao: string;
  emp_obs: string;
}

export interface FotoEvidencia {
  id?: string;
  nome: string;
  dataUrl: string;
  data: string;
  legenda?: string;
}

export interface ExtintorItem {
  id?: string;
  modelo: string;
  classe: string;
  capacidade: string;
  qtd: string;
  validade: string;
  local: string;
  sinalizado: string;
  desobstruido: string;
}

export interface EquipamentoEmergencia {
  id?: string;
  tipo: string;
  qtd: string;
  obs: string;
}

export interface PlanoAcaoItem {
  id: string;
  item: string; // descrição da pendência / recomendação técnica (O Que - What)
  origemOuRisco?: string; // ex: "NR-12 (Máquinas)", "NR-10 (Elétrica)", "NR-23 (Incêndio)", "NR-17 (Ergonomia)", "NR-06 (EPI)", "NR-01 (Geral)"
  nrReferencia?: string; // ex: "NR-12", "NR-10", "NR-24", "NR-35", "NR-01"
  porQueFazer?: string; // Justificativa / Risco mitigado / Perigo controlado (Por Que - Why)
  ondeLocal?: string; // Setor / Posto de Trabalho / Máquina / Instalação (Onde - Where)
  responsavel?: string; // ex: "Manutenção", "Gestão do Setor", "SESMT", "Diretoria", "RH" (Quem - Who)
  prazo: string; // ex: "15 dias", "30 dias", "60 dias", "90 dias", "120 dias", "180 dias", "Imediato (48h)" (Quando - When)
  dataSugerida?: string; // DD/MM/AAAA ou data específica
  dataConclusao?: string; // DD/MM/AAAA
  comoFazer?: string; // Ação Técnica / Método de implantação / Procedimento (Como - How)
  custoEstimado?: string; // Custo estimado / Recursos necessários (Quanto custa - How Much)
  indicadorEficacia?: string; // Critério / Indicador para verificação da eficácia da medida
  prioridade: "Crítica / Imediata" | "Alta" | "Média" | "Baixa";
  status?: "Pendente" | "Em Andamento" | "Concluído";
  origemTipo?: "risco" | "setor" | "aep" | "nr16" | "manual" | "nrPreset";
  referenciaId?: string; // id do risco, setor, aep ou nr16 de origem
}

export interface SetorData {
  id: string;
  setor_nome: string;
  setor_horario_desc: string;
  setor_carga: string;
  setor_andares: string;
  setor_edificacao: string;
  setor_area: string;
  setor_iluminacao: string;
  setor_ventilacao: string;
  setor_piso: string;
  setor_fechamento: string;
  setor_obs: string;
  setor_maquinas: string;
  setor_fotos: string; // JSON FotoEvidencia[]
  setor_extintores: string; // JSON ExtintorItem[]
  setor_equipamentos: string; // JSON EquipamentoEmergencia[]
  setor_controles: string;
  setor_plano_acao: string;
  setor_plano_itens?: string; // JSON PlanoAcaoItem[]
  setor_plano_prioridade?: string; // "Alta" | "Média" | "Baixa" | "Crítica / Imediata"
  setor_plano_prazo?: string; // "Imediato (24-48h)" | "15 dias" | "30 dias" | "60 dias" | "90 dias" | "120 dias"
  setor_plano_responsavel?: string; // "Manutenção" | "Gestão do Setor" | "SESMT" | "Diretoria"
  setor_plano_status?: string; // "Pendente" | "Em Andamento" | "Concluído"
}

export interface EpiItem {
  id: string;
  ca: string;
  nome: string;
  fabricante?: string;
  validade?: string;
  protecao?: string;
  categoria?: string;
  eficacia?: string;
}

export interface ProdutoQuimicoItem {
  id: string;
  nome: string; // Nome comercial (ex: Thinner 5000, Água Sanitária)
  nomeQuimico?: string; // Nome químico / substâncias ativas (ex: Tolueno, Hidrocarbonetos, Hipoclorito)
  cas?: string; // Número CAS (ex: 108-88-3, 7681-52-9)
  onu?: string; // Número ONU (ex: ONU 1263, ONU 1791)
  fabricante?: string;
  estadoFisico: "Líquido" | "Sólido" | "Gasoso" | "Aerossol/Névoa" | "Pó/Granulado" | "Gel/Pasta";
  classificacaoGhs?: string; // Classes GHS e perigos
  frasesPerigo?: string; // Frases H e riscos
  composicao?: string;
  finalidadeUso?: string;
  episRecomendados?: string;
  fdsDisponivel?: string; // "Sim" | "Não"
  fispqDisponivel?: string; // Retrocompatibilidade "Sim" | "Não"
  medidasControle?: string;
}

export interface VinculoProdutoFuncao {
  id: string;
  produtoId: string;
  produtoNome: string;
  cas?: string;
  tempoExposicao: string; // ex: "Habitual (6h a 8h/dia)", "Intermitente (2h a 4h/dia)", "Eventual (<1h/dia)"
  concentracao: string; // ex: "Puro (100%)", "Diluído a 5%", "Mistura"
  formaUso?: string; // ex: "Aplicação por pistola/spray", "Pano/trincha", "Imersão"
  viaExposicao?: string; // ex: "Inalatória e Dérmica", "Dérmica", "Inalatória", "Ocular"
  episUtilizados?: string;
}

export interface FuncaoData {
  id: string;
  func_nome: string;
  func_setor: string;
  func_cbo?: string; // Código CBO Oficial (ex: "7241-10")
  func_cbo_titulo?: string; // Título Oficial da Ocupação no CBO/MTE
  func_descricao: string;
  func_qtd: string;
  func_turno: string;
  func_jornada?: string;
  func_experiencia_min?: string;
  func_escolaridade?: string;
  func_epis: string;
  func_epis_ca: string;
  func_epis_validade: string;
  func_epis_eficacia: string;
  func_epis_lista?: EpiItem[];
  func_epcs: string;
  func_intensidade: string;
  func_frequencia: string;
  func_tempo_exposicao: string;
  func_medidas: string;
}

export interface FuncionarioData {
  id: string;
  nome: string;
  cpf: string;
  matricula?: string;
  rg?: string;
  dataNascimento?: string;
  sexo?: "M" | "F" | "Outro";
  ctps?: string;
  ctpsNumero?: string;
  ctpsSerie?: string;
  ctpsUf?: string;
  pis?: string; // NIS / PIS / PASEP
  pisPasep?: string;
  categoriaEsocial?: string; // Tabela 01 do eSocial (ex: "101 - Empregado Geral (CLT)")
  regimeTrabalhista?: "1 - CLT (RGPS)" | "2 - Estatutário (RPPS)";
  cnhNumero?: string;
  cnhCategoria?: string; // ex: "B", "C", "D", "E", "AB"
  cnhValidade?: string;
  isMotoristaProfissional?: boolean; // Se exerce atividade de motorista sujeita ao S-2221
  setorId?: string;
  setorNome: string;
  funcaoId?: string;
  funcaoNome: string;
  cbo?: string;
  dataAdmissao?: string;
  telefone?: string;
  email?: string;
  status: "Ativo" | "Afastado" | "Férias" | "Desligado";
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  nome: string;
  cargo?: string;
  registro?: string;
  consultoria?: string;
  telefone?: string;
  role?: "admin" | "tecnico" | "usuario";
  createdAt?: string;
  updatedAt?: string;
}

export type MatrixDimension = "3x3" | "4x4" | "5x5";

export interface NormativeReference {
  codigo: string;
  nome: string;
  tipo: string;
  corBadge: string;
}

export interface NormativeOption {
  codigo: string;
  titulo: string;
  categoria: string;
  corBadge: string;
}

export interface MatrixGridCell {
  nivel: number;
  rotulo: string;
  corHex: string;
  corClasse: string;
  prioridade: "Crítica / Imediata" | "Alta" | "Média" | "Baixa";
  prazo: string;
}

export interface ProbabilityScaleItem {
  valor: number;
  rotulo: string;
  descricao: string;
}

export interface SeverityScaleItem {
  valor: number;
  rotulo: string;
  descricao: string;
}

export interface RiskMatrixModelDefinition {
  dimension: MatrixDimension;
  titulo: string;
  subtitulo: string;
  descricaoNormativa: string;
  referenciasPrincipais: NormativeReference[];
  probabilidades: ProbabilityScaleItem[];
  severidades: SeverityScaleItem[];
  grid: MatrixGridCell[][];
}

export interface AvaliacaoRiscoItem {
  id?: string;
  riscoNome: string;
  categoria?: RiskCategoryKey | string;
  matrizTipo: MatrixDimension;
  probabilidade: number; // 1 a 3, 1 a 4, ou 1 a 5
  severidade: number; // 1 a 3, 1 a 4, ou 1 a 5
  probabilidadeRotulo?: string;
  severidadeRotulo?: string;
  nivelRiscoScore: number;
  nivelRiscoRotulo: string;
  nivelRiscoCorHex: string;
  nivelRiscoClasse: string;
  referenciaNormativaMatriz: string;
  normasComplementares?: string[];
  fonteGeradora?: string;
  meioPropagacao?: string;
  possiveisDanos?: string;
  prioridadeAcao?: "Crítica / Imediata" | "Alta" | "Média" | "Baixa";
  prazoSugerido?: string;
  medidasControleExistentes?: string;
  medidasControlePropostas?: string;
  responsavel?: string;
}

export type AepConformidade = "C" | "NC" | "NA"; // Conforme | Não Conforme | Não Aplicável

export interface AepItem {
  id: string;
  funcaoId: string;
  funcaoNome: string;
  setorNome?: string;
  tipoPosto: string; // ex: "Administrativo / Escritório / Computador", "Operacional / Linha de Produção", etc.
  atividadesDescricao: string;
  fotos?: FotoEvidencia[];

  // 1. Organização do Trabalho (Item 17.4)
  org_pausas: AepConformidade;
  org_alternancia: AepConformidade;
  org_ritmo_metas: AepConformidade;
  org_horas_extras: AepConformidade;
  org_obs?: string;

  // 2. Levantamento, Transporte e Descarga Individual de Cargas (Item 17.5)
  cargas_peso_frequencia: AepConformidade;
  cargas_pega_distancia: AepConformidade;
  cargas_meios_mecanicos: AepConformidade;
  cargas_obs?: string;

  // 3. Mobiliário dos Postos de Trabalho (Item 17.6)
  mob_cadeira_ajustavel: AepConformidade;
  mob_mesa_espaco: AepConformidade;
  mob_apoio_pes: AepConformidade;
  mob_monitor_visao: AepConformidade;
  mob_obs?: string;

  // 4. Trabalho com Máquinas, Equipamentos e Ferramentas (Item 17.7)
  maq_empunhadura: AepConformidade;
  maq_esforco_acionamento: AepConformidade;
  maq_vibracao: AepConformidade;
  maq_obs?: string;

  // 5. Condições de Conforto Ambiental no Posto (Item 17.8)
  amb_ruido: AepConformidade;
  amb_temperatura: AepConformidade;
  amb_iluminancia: AepConformidade;
  amb_obs?: string;

  // Diagnóstico & Conclusão da AEP
  classificacaoRisco: "Baixo / Situação Conforme" | "Médio / Atenção Ergonômica" | "Alto / Situação Crítica";
  necessidadeAET: boolean;
  justificativaAET?: string;
  recomendacoes: string[];
  parecerTecnico: string;
  avaliador?: string;
  dataAvaliacao?: string;

  // Metodologia Hudson Couto (Checklist Oficial AEP 18 Itens)
  metodologia?: "couto" | "dominios_nr17";
  trabalhadorNome?: string;
  coutoRespostas?: Record<string, "sim" | "nao" | "na">;
  coutoTotalSim?: number;
  coutoClassificacaoMedida?: "a" | "b" | "c"; // (a) baixo investimento, (b) solução conhecida, (c) estudo aprofundado AET
  coutoObservacoesDetalhadas?: string;
}

export type Nr16StatusEnquadramento = "Caracterizada" | "Descaracterizada" | "Isenção Normativa" | "Não Aplicável";

export interface Nr16AnexoItem {
  anexoId: "anexo1" | "anexo2" | "anexo3" | "anexo4" | "anexo5" | "anexoRad";
  anexoNome: string; // Ex: "Anexo 1 - Explosivos", "Anexo 2 - Inflamáveis", etc.
  enquadrado: boolean;
  status: Nr16StatusEnquadramento;
  itemEspecifico?: string; // Ex: "Item 1, Alínea 'm' - Postos de reabastecimento de combustível"
  descricaoAtividade?: string;
  areaRisco?: string; // Ex: "Raio de 7,5m com centro nas bombas de abastecimento"
  tempoExposicao?: "Habitual e Permanente" | "Intermitente" | "Eventual / Fortuito" | "Não Exposto";
  frequenciaTempo?: string; // Ex: "8h/dia", "15 min durante o turno"
  fundamentacaoTecnica?: string; // Embasa a decisão técnica
  medidasPrevenconais?: string;
}

export interface Nr16AvaliacaoItem {
  id: string;
  funcaoId: string;
  funcaoNome: string;
  setorNome?: string;
  atividadesExecutadas: string;
  resultadoGlobal: "Periculosidade Caracterizada (Adicional 30%)" | "Periculosidade Descaracterizada (Não Enseja Adicional)" | "Isenção Normativa";
  anexosCaracterizados: string[]; // Ex: ["Anexo 2 - Inflamáveis", "Anexo 4 - Eletricidade"]
  anexos: Record<string, Nr16AnexoItem>;
  parecerTecnicoConclusivo: string;
  baseLegal: string;
  recomendacoesSST: string[];
  fotos?: FotoEvidencia[];
  avaliador?: string;
  registroAvaliador?: string;
  dataAvaliacao?: string;
}

export interface DdsTemaItem {
  id: string;
  codigo?: string;
  titulo: string;
  categoria: string;
  nrReferencia?: string;
  objetivo: string;
  pontosPrincipais: string[];
  conteudo: string;
  perguntasDebate?: string[];
  isCustom?: boolean;
}

export interface DdsParticipante {
  id: string;
  nome: string;
  cpfOuMatricula?: string;
  funcao?: string;
  empresa?: string;
  setor?: string;
  assinaturaImg?: string; // base64 PNG
  assinadoEm?: string;
  dataAssinatura?: string;
  presente: boolean;
}

export interface DdsRegistro {
  id: string;
  empresaId?: string;
  temaId: string;
  temaCodigo?: string;
  temaTitulo: string;
  temaCategoria: string;
  temaConteudo: string;
  nrReferencia?: string;
  frequencia: "Diário (DDS)" | "Semanal (DSS)" | "Mensal (DMS)" | "Quinzenal" | "Extraordinário / Alinhamento Crítico";
  data: string; // YYYY-MM-DD
  horarioInicio?: string; // HH:MM
  horarioTermino?: string; // HH:MM
  duracaoMinutos?: string; // ex: "15 min"
  localSetor?: string;
  ministranteNome: string;
  ministranteCargo?: string;
  ministranteRegistro?: string; // MTE / CREA / CFT / Coren
  ministranteAssinaturaImg?: string;
  observacoes?: string;
  acoesSugeridas?: string;
  participantes: DdsParticipante[];
  fotos?: FotoEvidencia[];
  createdAt: string;
  updatedAt: string;
}

export type PtTipoAtividadeKey =
  | "altura"
  | "espaco_confinado"
  | "quente"
  | "eletricidade"
  | "escavacao"
  | "icamento"
  | "quimico"
  | "hidrojato"
  | "bloqueio_loto"
  | "pemp_plataforma"
  | "alpinismo_cordas"
  | "radiacao_gamagrafia"
  | "caldeira_vaso_pressao"
  | "asfalto_impermeabilizacao"
  | "telhados_fragiis"
  | "gas_combustivel"
  | "civil_demolicao"
  | "manutencao_mecanica"
  | "outros";

export type PtStatus =
  | "Em Elaboração"
  | "Aprovada / Liberada"
  | "Em Execução"
  | "Encerrada / Concluída"
  | "Cancelada";

export interface PtChecklistItem {
  id: string;
  item: string;
  categoria?: "geral" | "altura" | "confinado" | "quente" | "eletricidade" | "escavacao" | "icamento" | "quimico" | "hidrojato" | "bloqueio_loto" | "emergencia" | string;
  resposta: "sim" | "nao" | "na";
  obs?: string;
}

export interface PtMedicaoGas {
  id: string;
  horario: string;
  oxigenio: string; // % O2 (Ideal 19.5% a 23%)
  lie: string; // % LIE (Inflamabilidade < 10%)
  co: string; // ppm Monóxido de Carbono (< 25 ppm)
  h2s: string; // ppm Sulfeto de Hidrogênio (< 8 ppm)
  outrosGases?: string; // COV / Amônia / Outros
  responsavelMedicao: string;
  statusAprovado: boolean;
}

export interface PtTrabalhador {
  id: string;
  nome: string;
  cpfOuMatricula?: string;
  funcao?: string;
  empresa?: string;
  asoApto: boolean;
  treinamentoValido: boolean;
  assinaturaImg?: string;
  assinadoEm?: string;
}

export interface PtPermissaoTrabalho {
  id: string;
  numeroPt: string; // ex: "PT-2026/001"
  titulo: string;
  tiposAtividade: PtTipoAtividadeKey[];
  status: PtStatus;
  localSetor: string;
  localDetalhado?: string;
  dataInicio: string; // YYYY-MM-DD
  horaInicio: string; // HH:MM
  dataTermino: string; // YYYY-MM-DD
  horaTermino: string; // HH:MM
  descricaoTrabalho: string;
  ferramentasEquipamentos?: string;
  
  // Riscos e Controles
  riscosIdentificados: string[];
  checklistControles: PtChecklistItem[];
  medicoesGases?: PtMedicaoGas[];
  
  // EPIs e EPCs
  episRequeridos: string[];
  epcsRequeridos: string[];
  
  // Responsáveis e Equipe
  emissorNome: string;
  emissorCargo?: string;
  emissorRegistro?: string; // CREA / CFT / MTE
  emissorEmpresa?: string;
  emissorAssinaturaImg?: string;
  emissorAssinadoEm?: string;
  
  encarregadoNome: string;
  encarregadoCargo?: string;
  encarregadoEmpresa?: string;
  encarregadoAssinaturaImg?: string;
  encarregadoAssinadoEm?: string;
  
  vigiaNome?: string;
  vigiaFuncao?: string;
  vigiaAssinaturaImg?: string;
  vigiaAssinadoEm?: string;
  
  trabalhadores: PtTrabalhador[];
  
  // Procedimentos de Emergência e Resgate
  procedimentoEmergencia?: string;
  ramalEmergencia?: string;
  
  // Encerramento / Baixa
  encerramento?: {
    dataBaixa?: string;
    horaBaixa?: string;
    localLimpoEOrganizado: boolean;
    bloqueiosRemovidos: boolean;
    trabalhoConcluido: boolean;
    observacoesEncerramento?: string;
    responsavelBaixaNome?: string;
    responsavelBaixaAssinaturaImg?: string;
    emissorBaixaAssinaturaImg?: string;
  };
  
  fotos?: FotoEvidencia[];
  createdAt: string;
  updatedAt: string;
}

export interface PcmsoExameProtocolo {
  id: string;
  exameNome: string;
  periodicidade: "Admissional" | "Periódico Anual" | "Periódico Semestral" | "Periódico Bienal" | "Demissional" | "Retorno" | "Mudança de Risco";
  criterioIndicacao: string;
  materialBiologico?: string;
  laboratorioSugerido?: string;
}

export interface ClinicaCredenciada {
  id: string;
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  medicoResponsavel?: string;
  crm?: string;
  crmUf?: string;
  especialidade?: string;
  site?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  observacoes?: string;
}

export interface ExameSolicitadoItem {
  id: string;
  codigoEsocial: string; // Tabela 27 do eSocial (ex: "0295", "0215")
  nome: string;
  detalhe?: string;
}

export type AsoEncaminhamentoStatus =
  | "Pendente"
  | "Realizado"
  | "Inapto"
  | "NaoCompareceu"
  | "Cancelado";

export interface AsoEncaminhamento {
  id: string;
  empresaId: string;
  empresaRazao: string;
  empresaCnpj: string;
  tipoTrabalhador: "colaborador" | "candidato"; // Candidato / Pré-admissão vs Colaborador com Vínculo
  colaboradorId?: string; // ID se for colaborador já registrado
  nomeTrabalhador: string;
  cpf: string;
  rg?: string;
  dataNascimento?: string;
  sexo?: "M" | "F" | "Outro";
  cargo: string;
  setor: string;
  funcaoId?: string;
  cbo?: string;
  ctps?: string;
  pis?: string;
  telefone?: string;
  email?: string;
  clinicaId: string;
  clinicaNome: string;
  tipoExame: "Admissional" | "Periódico" | "Retorno ao Trabalho" | "Mudança de Riscos Ocupacionais" | "Demissional";
  dataEmissao: string; // YYYY-MM-DD
  dataValidade?: string; // YYYY-MM-DD
  riscosOcupacionais: string[];
  examesSolicitados: ExameSolicitadoItem[];
  observacoes?: string;
  status: AsoEncaminhamentoStatus;
  asoVinculadoId?: string; // ID do PcmsoRegistroAso quando concluído/efetivado
  dataAtendimento?: string;
  resultadoAptidao?: "Apto" | "Inapto" | "Apto com Restrição";
  createdAt: string;
  updatedAt?: string;
}

export interface PcmsoRegistroAso {
  id: string;
  nomeEmpregado: string;
  cpf: string;
  matricula?: string;
  telefone?: string; // Telefone / WhatsApp do colaborador para avisos
  email?: string; // E-mail do colaborador
  funcaoId: string;
  funcaoNome: string;
  setorNome: string;
  dataNascimento?: string;
  dataAdmissao?: string;
  tipoAso: "Admissional" | "Periódico" | "Retorno ao Trabalho" | "Mudança de Riscos Ocupacionais" | "Demissional";
  periodicidadeMeses?: number; // Periodicidade em meses (ex: 6, 12, 24 meses)
  dataRealizacao: string;
  dataValidade: string;
  clinicaExame?: string; // Clínica credenciada / local agendado
  resultado: "Apto" | "Inapto" | "Apto com Restrição";
  restricoes?: string;
  examesRealizados: {
    nome: string;
    data: string;
    resultado: "Normal" | "Alterado" | "Estável";
  }[];
  medicoExaminadorNome: string;
  medicoExaminadorCrm: string;
  medicoExaminadorUf: string;
  medicoCoordenadorNome?: string;
  medicoCoordenadorCrm?: string;
  medicoCoordenadorUf?: string;
  observacoesMedicas?: string;
  notificacaoEnviadaEm?: string; // Registro de data/hora do último aviso enviado
}

export interface ESocialConfig {
  tpAmb: "1" | "2"; // 1 - Produção, 2 - Produção Restrita / Testes
  procEmi: "1"; // 1 - Aplicativo do empregador
  verProc: string; // Versão da aplicação (ex: "2.5.0")
  tpInscTransmissor: "1" | "2"; // 1 - CNPJ, 2 - CPF
  nrInscTransmissor?: string;
  responsavelTecnicoNome?: string;
  responsavelTecnicoCpf?: string;
  responsavelTecnicoConselho?: "1" | "4" | "9"; // 1 - CRM, 4 - CREA, 9 - Outros (CFT/MTE)
  responsavelTecnicoNr?: string;
  responsavelTecnicoUf?: string;
}

export interface ESocialCatRegistro {
  id: string;
  tipoEvento: "S-2210";
  tipoCat: "1" | "2" | "3"; // 1 - Inicial, 2 - Reabertura, 3 - Comunicação de Óbito
  nrRecCatOrigem?: string;
  dtAcidente: string; // AAAA-MM-DD
  hrAcidente: string; // HH:MM
  hrsTrabAntesAcidente: string; // HHMM
  tpAcidente: "1" | "2" | "3"; // 1 - Típico, 2 - Doença, 3 - Trajeto
  indAfastamento: "S" | "N";
  indMorte: "S" | "N";
  dtObito?: string;
  houvePolicia: "S" | "N";
  localAcidente: {
    tpLocal: "1" | "2" | "3" | "4" | "5" | "6" | "9"; // 1 - Estab. empregador, 2 - Estab. terceiros, 3 - Via pública, etc.
    dscLocal: string;
    dscLogradouro: string;
    nrLogradouro: string;
    complemento?: string;
    bairro: string;
    cep: string;
    codMunicipio?: string;
    uf: string;
  };
  parteAtingida: {
    codParteAtingida: string; // Código Tabela 13
    dscParteAtingida: string;
    lateralidade: "0" | "1" | "2" | "3"; // 0 - Não aplicável, 1 - Esquerda, 2 - Direita, 3 - Ambas
  };
  agenteCausador: {
    codAgenteCausador: string; // Código Tabela 14/15
    dscAgenteCausador: string;
  };
  atestadoMedico: {
    dtAtendimento: string;
    hrAtendimento: string;
    indInternacao: "S" | "N";
    durTrat: number; // dias de afastamento
    indAfastamento: "S" | "N";
    codLesao: string; // Código Tabela 17
    dscLesao: string;
    diagnosticoProvavel?: string;
    codCID: string;
    medicoNome: string;
    medicoIdeOC: "1" | "2" | "3"; // 1 - CRM, 2 - CRO, 3 - RMS
    medicoNrOC: string;
    medicoUfOC: string;
  };
  trabalhador: {
    cpf: string;
    matricula: string;
    nome: string;
    funcaoId?: string;
    funcaoNome?: string;
    cbo?: string;
    dataNascimento?: string;
    sexo?: "M" | "F";
    estadoCivil?: string;
  };
  statusEnvio: "Pendente" | "Validado" | "Exportado" | "Transmitido";
  xmlGerado?: string;
  reciboESocial?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ESocialS2240Agente {
  codAgNoc: string; // Código Tabela 24 do eSocial (ex: "01.01.001", "09.01.001")
  dscAgNoc: string;
  tpAval: "1" | "2"; // 1 - Quantitativo, 2 - Qualitativo
  intConc?: string;
  limTol?: string;
  unMed?: string; // Tabela 23
  tecMedicao?: string; // ex: NHO-01, NR-15
  nrReferencia?: string;
  utilizaEpc: "0" | "1" | "2"; // 0 - Não se aplica, 1 - Não implementado, 2 - Implementado
  epcEficaz?: "S" | "N";
  utilizaEpi: "0" | "1" | "2"; // 0 - Não se aplica, 1 - Não utilizado, 2 - Utilizado
  epis?: {
    ca: string;
    descricao: string;
    eficaz: "S" | "N";
    medidasProtecao: boolean;
    condicoesFuncionamento: boolean;
    usoIninterrupto: boolean;
    prazoValidade: boolean;
    periodicidadeTroca: boolean;
    higienizacao: boolean;
  }[];
}

export interface ESocialS2240Registro {
  id: string;
  tipoEvento: "S-2240";
  funcaoId: string;
  funcaoNome: string;
  setorNome: string;
  cbo: string;
  cpfTrabalhador?: string;
  matriculaTrabalhador?: string;
  nomeTrabalhador?: string;
  dtInicioCondicao: string; // AAAA-MM-DD
  descricaoAmbiente: string;
  descricaoAtividades: string;
  agentesNocivos: ESocialS2240Agente[];
  responsavelAmbiental: {
    cpf: string;
    nome: string;
    ideOC: "1" | "4" | "9"; // 1 - CRM, 4 - CREA, 9 - Outros (CFT/MTE)
    nrOC: string;
    ufOC: string;
  };
  statusEnvio: "Pendente" | "Validado" | "Exportado" | "Transmitido";
  xmlGerado?: string;
  reciboESocial?: string;
  createdAt: string;
  updatedAt?: string;
}

// Evento S-2221 - Exame Toxicológico do Motorista Profissional (Portaria MTE nº 612/2024 e CLT art. 168 § 6º e 7º)
export interface ESocialS2221Registro {
  id: string;
  tipoEvento: "S-2221";
  cpfTrabalhador: string;
  matriculaTrabalhador: string;
  nomeTrabalhador: string;
  cbo?: string;
  funcaoNome?: string;
  dtExame: string; // AAAA-MM-DD
  cnpjLab: string; // CNPJ do Laboratório (14 dígitos)
  nomeLab?: string; // Razão social / Nome fantasia do laboratório credenciado
  codSeqExame: string; // Código sequencial do laudo fornecido pelo laboratório (ex: "SP123456789")
  medicoRevisorNome: string;
  medicoRevisorCrm: string;
  medicoRevisorUf: string;
  statusEnvio: "Pendente" | "Validado" | "Exportado" | "Transmitido";
  xmlGerado?: string;
  reciboESocial?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Srq20AvaliacaoItem {
  id: string;
  empresaId: string;
  empresaNome?: string;
  setorId?: string;
  setorNome: string;
  funcaoId?: string;
  funcaoNome?: string;
  avaliadoNome?: string;
  avaliadoIdade?: string;
  avaliadoSexo?: "Masculino" | "Feminino" | "Outro" | "";
  anonimo: boolean;
  respostas: Record<number, boolean>; // 1 a 20: true = Sim, false = Não
  pontuacao: number; // 0 a 20
  classificacao: "Favorável" | "Atenção Necessária"; // >= 7 é Atenção Necessária
  data: string; // YYYY-MM-DD
  avaliadorNome?: string;
  avaliadorRegistro?: string;
  origem: "link_trabalhador" | "presencial";
  observacoes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Company {
  id: string;
  userId?: string;
  empresa: Partial<EmpresaData>;
  setores: SetorData[];
  funcoes: FuncaoData[];
  riscos: Record<string, string[]>; // funcId -> array of risk names
  tipoMatrizPadrao?: MatrixDimension; // "3x3" | "4x4" | "5x5" (padrão da empresa)
  referenciaMatrizPadrao?: string; // ex: "NR-01 (GRO/PGR)", "BS 8800", "ISO 31010"
  avaliacoesRiscos?: Record<string, Record<string, AvaliacaoRiscoItem>>; // funcId -> { [riscoNome]: AvaliacaoRiscoItem }
  produtosQuimicos?: ProdutoQuimicoItem[]; // Inventário geral de produtos químicos da empresa
  produtosPorFuncao?: Record<string, VinculoProdutoFuncao[]>; // funcId -> produtos químicos vinculados
  aepAvaliacoes?: AepItem[]; // Avaliações Ergonômicas Preliminares (NR-17)
  nr16Avaliacoes?: Nr16AvaliacaoItem[]; // Laudos / Avaliações de Periculosidade (NR-16)
  planoAcaoGlobal?: PlanoAcaoItem[]; // Plano de Ação Consolidado do PGR (NR-01 - 5W2H)
  asosRegistrados?: PcmsoRegistroAso[]; // Histórico de ASOs emitidos
  pcmsoProtocolos?: Record<string, PcmsoExameProtocolo[]>; // Protocolos de exames por função
  ddsRegistros?: DdsRegistro[]; // Diálogos de Segurança (DDS/DSS/DMS)
  customDdsTemas?: DdsTemaItem[]; // Temas personalizados cadastrados pelo usuário
  ptPermissoes?: PtPermissaoTrabalho[]; // Permissões de Trabalho / PET (NR-33, NR-35, NR-34, NR-10, etc.)
  esocialCats?: ESocialCatRegistro[]; // Eventos S-2210 (Comunicação de Acidente de Trabalho)
  esocialS2240?: ESocialS2240Registro[]; // Eventos S-2240 (Condições Ambientais - Fatores de Risco)
  esocialS2221?: ESocialS2221Registro[]; // Eventos S-2221 (Exame Toxicológico do Motorista Profissional)
  esocialConfig?: ESocialConfig; // Configurações de ambiente e transmissor do eSocial
  clinicasCredenciadas?: ClinicaCredenciada[]; // Clínicas credenciadas de medicina ocupacional
  encaminhamentosAso?: AsoEncaminhamento[]; // Guias de encaminhamento médico para ASO
  srq20Avaliacoes?: Srq20AvaliacaoItem[]; // Avaliações Psicossociais SRQ-20 (NR-01 & NR-17)
  funcionarios?: FuncionarioData[]; // Cadastro Geral de Trabalhadores / Funcionários
  createdAt?: string;
  updatedAt?: string;
  sharedWith?: string[];
}

export type TabType = "empresa" | "setores" | "funcoes" | "funcionarios" | "pcmso" | "riscos" | "esocial" | "plano" | "nr16" | "aep" | "srq20" | "dds" | "pt" | "relatorio";

export type RiskCategoryKey = "fisico" | "quimico" | "biologico" | "ergonomico" | "psicossocial" | "acidente";

export interface RiskCategory {
  key: RiskCategoryKey;
  titulo: string;
  corNome: string;
  corHex: string;
  corBgClass: string;
  corTextClass: string;
  corBorderClass: string;
  corChipClass: string;
  corBadgeClass: string;
  riscos: string[];
}

