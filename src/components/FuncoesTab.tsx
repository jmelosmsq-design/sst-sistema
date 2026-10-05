import React, { useState } from "react";
import { Plus, Edit2, Trash2, Camera, Search, Sparkles, X, Check, ShieldCheck, UserCheck, BookOpen, Clock, Briefcase, FileText, Layers } from "lucide-react";
import { FuncaoData, SetorData, EpiItem } from "../types";
import { CATALOGO_EPIS, StandardEPI } from "../data/epiCatalog";
import { CATALOGO_CBO, CboItem, buscarCboNoCatalogo } from "../data/cboCatalog";
import { EpiScanModal } from "./EpiScanModal";
import { CboSearchModal } from "./CboSearchModal";
import { ConfirmModal } from "./ConfirmModal";
import { maskInteger } from "../utils/masks";

interface FuncoesTabProps {
  funcoes: FuncaoData[];
  setores: SetorData[];
  riscosPorFuncao: Record<string, string[]>;
  onSaveFuncao: (funcao: FuncaoData) => void;
  onDeleteFuncao: (id: string) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

export const FuncoesTab: React.FC<FuncoesTabProps> = ({
  funcoes,
  setores,
  riscosPorFuncao,
  onSaveFuncao,
  onDeleteFuncao,
  onAlert,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [cboModalOpen, setCboModalOpen] = useState(false);
  const [cboInitialQuery, setCboInitialQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [funcToDelete, setFuncToDelete] = useState<{ id: string; name: string } | null>(null);
  const [epiToDeleteIdx, setEpiToDeleteIdx] = useState<number | null>(null);

  // Form Fields
  const [nome, setNome] = useState("");
  const [cbo, setCbo] = useState("");
  const [cboTitulo, setCboTitulo] = useState("");
  const [setorId, setSetorId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [qtd, setQtd] = useState("1");
  const [turno, setTurno] = useState("Diurno");
  const [episLista, setEpisLista] = useState<EpiItem[]>([]);
  const [episTexto, setEpisTexto] = useState("");
  const [episCA, setEpisCA] = useState("");
  const [episValidade, setEpisValidade] = useState("Válido");
  const [episEficacia, setEpisEficacia] = useState("Adequada");
  const [epcsTexto, setEpcsTexto] = useState("");
  const [intensidade, setIntensidade] = useState("Moderada");
  const [frequencia, setFrequencia] = useState("Habitual");
  const [tempoExposicao, setTempoExposicao] = useState("8h/dia (Jornada integral)");
  const [medidas, setMedidas] = useState("");

  const [loadingCALookup, setLoadingCALookup] = useState(false);

  const syncEpisTextAndCAs = (newList: EpiItem[]) => {
    setEpisLista(newList);
    const cas = newList.map((e) => e.ca).filter(Boolean).join(", ");
    const textLines = newList.map((e) => `• ${e.nome}${e.fabricante ? ` (${e.fabricante})` : ""}`).join("\n");
    setEpisCA(cas);
    setEpisTexto(textLines);
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setNome("");
    setCbo("");
    setCboTitulo("");
    setSetorId(setores[0]?.id || "");
    setDescricao("");
    setQtd("1");
    setTurno("Diurno");
    setEpisLista([]);
    setEpisTexto("");
    setEpisCA("");
    setEpisValidade("Válido");
    setEpisEficacia("Adequada");
    setEpcsTexto("");
    setIntensidade("Moderada");
    setFrequencia("Habitual");
    setTempoExposicao("8h/dia (Jornada integral)");
    setMedidas("");
    setModalOpen(true);
  };

  const handleOpenEdit = (f: FuncaoData) => {
    setEditingId(f.id);
    setNome(f.func_nome || "");
    setCbo(f.func_cbo || "");
    setCboTitulo(f.func_cbo_titulo || "");
    setSetorId(f.func_setor || "");
    setDescricao(f.func_descricao || "");
    setQtd(f.func_qtd || "1");
    setTurno(f.func_turno || "Diurno");

    // Reconstruir lista estruturada se não existir
    let listaInicial: EpiItem[] = f.func_epis_lista || [];
    if (listaInicial.length === 0 && (f.func_epis || f.func_epis_ca)) {
      const cas = (f.func_epis_ca || "").split(/[,;/]+/).map((s) => s.trim()).filter(Boolean);
      const nomes = (f.func_epis || "").split("\n").map((s) => s.replace(/^[•\-\*\s]+/, "").trim()).filter(Boolean);
      
      if (nomes.length > 0) {
        listaInicial = nomes.map((n, i) => ({
          id: `epi_${Date.now()}_${i}`,
          nome: n,
          ca: cas[i] || cas[0] || "",
          validade: f.func_epis_validade || "Válido",
          eficacia: f.func_epis_eficacia || "Adequada",
        }));
      } else if (cas.length > 0) {
        listaInicial = cas.map((ca, i) => ({
          id: `epi_${Date.now()}_${i}`,
          nome: "Equipamento de Proteção Individual Homologado",
          ca,
          validade: f.func_epis_validade || "Válido",
          eficacia: f.func_epis_eficacia || "Adequada",
        }));
      }
    }

    setEpisLista(listaInicial);
    setEpisTexto(f.func_epis || "");
    setEpisCA(f.func_epis_ca || "");
    setEpisValidade(f.func_epis_validade || "Válido");
    setEpisEficacia(f.func_epis_eficacia || "Adequada");
    setEpcsTexto(f.func_epcs || "");
    setIntensidade(f.func_intensidade || "Moderada");
    setFrequencia(f.func_frequencia || "Habitual");
    setTempoExposicao(f.func_tempo_exposicao || "8h/dia");
    setMedidas(f.func_medidas || "");
    setModalOpen(true);
  };

  // Handler for applying CBO item selected from catalog or AI
  const handleApplyCbo = (cboItem: CboItem) => {
    setNome(cboItem.titulo);
    setCbo(cboItem.cbo);
    setCboTitulo(cboItem.titulo);

    // Format detailed activities or summary
    let descCompleta = cboItem.descricaoSumaria;
    if (cboItem.atividadesDetalhadas && cboItem.atividadesDetalhadas.length > 0) {
      descCompleta += `\n\nPrincipais Atividades:\n${cboItem.atividadesDetalhadas.map((a) => `• ${a}`).join("\n")}`;
    }
    setDescricao(descCompleta);

    if (cboItem.turnoPadrao) setTurno(cboItem.turnoPadrao);
    if (cboItem.jornadaSugerida) setTempoExposicao(cboItem.jornadaSugerida);
    if (cboItem.epcsSugeridos) setEpcsTexto(cboItem.epcsSugeridos);
    if (cboItem.medidasSugeridas) setMedidas(cboItem.medidasSugeridas);

    // Auto-populate suggested EPIs
    if (cboItem.episSugeridos && cboItem.episSugeridos.length > 0) {
      const novosEpis: EpiItem[] = cboItem.episSugeridos.map((e, idx) => ({
        id: `epi_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
        nome: e.nome,
        ca: e.ca,
        fabricante: e.fabricante || "Nacional Homologado",
        validade: "Válido",
        eficacia: "Adequada",
        protecao: e.protecao,
        categoria: e.categoria,
      }));
      syncEpisTextAndCAs(novosEpis);
    }

    if (!modalOpen) {
      setModalOpen(true);
    }
  };

  // Quick Select EPI Model from Catalog
  const handleSelectEpiModel = (modelId: string) => {
    if (!modelId) return;
    const epi = CATALOGO_EPIS.find((e) => e.id === modelId);
    if (!epi) return;

    const newEpiItem: EpiItem = {
      id: `epi_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      nome: epi.nome,
      ca: epi.caSugerido,
      fabricante: epi.fabricante,
      validade: "Válido",
      eficacia: "Adequada",
      protecao: epi.protecao,
      categoria: epi.categoria,
    };

    const nextList = [...episLista, newEpiItem];
    syncEpisTextAndCAs(nextList);

    if (epi.protecao && !medidas.includes(epi.protecao)) {
      setMedidas((prev) => (prev ? `${prev}\n• ${epi.protecao}` : `• ${epi.protecao}`));
    }
    onAlert("success", `EPI "${epi.nome}" adicionado com CA ${epi.caSugerido}!`);
  };

  // Direct Lookup by CA number
  const handleConsultarCA = async () => {
    const rawCA = episCA.trim();
    if (!rawCA) {
      onAlert("info", "Digite o número do CA no campo correspondente para consultar.");
      return;
    }

    try {
      setLoadingCALookup(true);
      onAlert("info", "Consultando base oficial do Ministério do Trabalho...");

      const res = await fetch("/api/epi/lookup-ca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caNumber: rawCA }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const data = json.data;
        const newEpiItem: EpiItem = {
          id: `epi_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          nome: data.nome || `EPI Homologado CA ${rawCA}`,
          ca: rawCA,
          fabricante: data.fabricante || "Nacional",
          validade: data.validade || "Válido",
          eficacia: data.eficacia || "Adequada",
          protecao: data.protecao || "",
        };

        const nextList = [...episLista, newEpiItem];
        syncEpisTextAndCAs(nextList);

        if (data.validade) setEpisValidade(data.validade);
        if (data.eficacia) setEpisEficacia(data.eficacia);
        if (data.protecao && !medidas.includes(data.protecao)) {
          setMedidas((prev) => (prev ? `${prev}\n• ${data.protecao}` : `• ${data.protecao}`));
        }
        onAlert("success", `CA ${rawCA} verificado e cadastrado com sucesso!`);
      } else {
        throw new Error("Não foi possível localizar o CA informado.");
      }
    } catch (err: any) {
      onAlert("error", "Não foi possível consultar o CA na base. Verifique os dígitos.");
    } finally {
      setLoadingCALookup(false);
    }
  };

  const handleApplyScannedEpi = (scanned: any) => {
    const newEpiItem: EpiItem = {
      id: `epi_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      nome: scanned.nome || "Equipamento Identificado por Foto",
      ca: scanned.ca || "",
      fabricante: scanned.fabricante || "Identificado via IA",
      validade: scanned.validade || "Válido",
      eficacia: scanned.eficacia || "Adequada",
      protecao: scanned.protecao || "",
    };

    const nextList = [...episLista, newEpiItem];
    syncEpisTextAndCAs(nextList);

    if (scanned.validade) setEpisValidade(scanned.validade);
    if (scanned.protecao && !medidas.includes(scanned.protecao)) {
      setMedidas((prev) => (prev ? `${prev}\n• Proteção: ${scanned.protecao}` : `• Proteção: ${scanned.protecao}`));
    }
    onAlert("success", "EPI digitalizado e adicionado com sucesso!");
  };

  const handleRemoveEpiItem = (index: number) => {
    const nextList = episLista.filter((_, idx) => idx !== index);
    syncEpisTextAndCAs(nextList);
    setEpiToDeleteIdx(null);
    onAlert("info", "EPI removido da função.");
  };

  const handleSave = () => {
    if (!nome.trim()) {
      onAlert("error", "Informe o nome da função/cargo.");
      return;
    }
    if (!setorId) {
      onAlert("error", "Selecione o setor da função.");
      return;
    }

    const funcao: FuncaoData = {
      id: editingId || String(Date.now()),
      func_nome: nome.trim(),
      func_cbo: cbo.trim(),
      func_cbo_titulo: cboTitulo.trim(),
      func_setor: setorId,
      func_descricao: descricao,
      func_qtd: qtd,
      func_turno: turno,
      func_jornada: tempoExposicao,
      func_epis: episTexto,
      func_epis_ca: episCA,
      func_epis_validade: episValidade,
      func_epis_eficacia: episEficacia,
      func_epis_lista: episLista,
      func_epcs: epcsTexto,
      func_intensidade: intensidade,
      func_frequencia: frequencia,
      func_tempo_exposicao: tempoExposicao,
      func_medidas: medidas,
    };

    onSaveFuncao(funcao);
    setModalOpen(false);
    onAlert("success", `Função "${nome}" salva com sucesso!`);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800 transition-colors">
        
        {/* Cabeçalho com Ações em Grid de Largura Total */}
        <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-800 text-xs font-bold text-white shadow-xs">
              3
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Funções e Cargos dos Trabalhadores
                <span className="inline-flex items-center rounded-md bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:text-blue-300">
                  CBO / MTE
                </span>
              </h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Classificação Brasileira de Ocupações, descrição oficial de atividades e gestão de EPIs/CAs
              </p>
            </div>
          </div>

          {/* Grid de Ações Padronizado em h-11 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
            <button
              type="button"
              onClick={handleOpenNew}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Função / Cargo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCboInitialQuery("");
                setCboModalOpen(true);
              }}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/40 px-4 text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              <BookOpen className="h-4 w-4" />
              <span>Buscar CBO Oficial (MTE)</span>
            </button>

            <button
              type="button"
              onClick={() => setScanModalOpen(true)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              <Camera className="h-4 w-4" />
              <span>Escanear Foto do CA (IA)</span>
            </button>
          </div>
        </div>

        {funcoes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Nenhuma função cadastrada ainda.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Cadastre as funções dos trabalhadores ou busque no <strong>Catálogo Oficial de CBO do Governo</strong> para preenchimento automático das atribuições, jornadas e EPIs.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md mx-auto pt-2">
              <button
                type="button"
                onClick={() => {
                  setCboInitialQuery("");
                  setCboModalOpen(true);
                }}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 active:scale-95 shadow-xs cursor-pointer"
              >
                <BookOpen className="h-4 w-4" />
                <span>Buscar Ocupação no CBO</span>
              </button>

              <button
                type="button"
                onClick={handleOpenNew}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 shadow-2xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Cadastrar Manual</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {funcoes.map((funcao) => {
              const setor = setores.find((s) => s.id === funcao.func_setor);
              const riscosCount = (riscosPorFuncao[funcao.id] || []).length;

              return (
                <div
                  key={funcao.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {funcao.func_cbo && (
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white shadow-2xs">
                          CBO {funcao.func_cbo}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {funcao.func_nome}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                      {setor?.setor_nome || "Setor não vinculado"} • {funcao.func_qtd || "1"} trabalhador(es) • {funcao.func_turno || "Diurno"} •{" "}
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{riscosCount} risco(s)</span>
                    </p>

                    {funcao.func_epis_ca && (
                      <p className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold truncate mt-0.5 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>CA: {funcao.func_epis_ca}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleOpenEdit(funcao)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 active:scale-95 shadow-2xs transition-all cursor-pointer"
                      title="Editar Função"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setFuncToDelete({ id: funcao.id, name: funcao.func_nome })}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 active:scale-95 transition-all cursor-pointer"
                      title="Excluir Função"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Função - Completo e Otimizado */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl my-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[88vh] sm:max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {editingId ? "Editar Função / Cargo" : "Nova Função / Cargo"}
                    {cbo && (
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                        CBO: {cbo}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Cadastre a função, atribuições oficiais do MTE e configure os EPIs/EPCs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1 overscroll-contain">
              
              {/* SEÇÃO INTELIGENTE DE CBO & PREENCHIMENTO AUTOMÁTICO */}
              <div className="rounded-2xl border border-blue-200 dark:border-blue-900/80 bg-blue-50/60 dark:bg-blue-950/40 p-3.5 sm:p-4 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      Preenchimento Automático via CBO Oficial (MTE)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCboInitialQuery(nome || "");
                      setCboModalOpen(true);
                    }}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 text-xs font-bold text-white hover:bg-blue-700 shadow-2xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Abrir Catálogo / Buscar CBO</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Clique abaixo para selecionar uma ocupação e preencher automaticamente a descrição das tarefas, turno, EPIs com CAs e proteções recomendadas:
                </p>

                {/* Chips de Ocupações Rápidas mais comuns */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    "Soldador",
                    "Operador de Empilhadeira",
                    "Faxineiro / Limpeza",
                    "Eletricista de Manutenção",
                    "Mecânico Industrial",
                    "Assistente Administrativo",
                    "Pedreiro de Obras",
                    "Motorista de Caminhão",
                    "Almoxarife",
                    "Cozinheiro",
                    "Vigilante",
                    "Frentista",
                  ].map((cargo) => {
                    const found = CATALOGO_CBO.find(
                      (c) => c.titulo.toLowerCase().includes(cargo.toLowerCase()) || c.sinonimos.some((s) => s.toLowerCase().includes(cargo.toLowerCase()))
                    );
                    return (
                      <button
                        key={cargo}
                        type="button"
                        onClick={() => {
                          if (found) {
                            handleApplyCbo(found);
                          } else {
                            setCboInitialQuery(cargo);
                            setCboModalOpen(true);
                          }
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          nome.toLowerCase().includes(cargo.toLowerCase()) || (cbo && found?.cbo === cbo)
                            ? "bg-blue-600 text-white font-bold shadow-2xs"
                            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-100/60 dark:hover:bg-slate-700"
                        }`}
                      >
                        {cargo}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Linha: Nome do Cargo & Código CBO */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Nome da Função / Cargo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Soldador MIG, Operador de Empilhadeira, Auxiliar Administrativo..."
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                    <span>Código CBO (MTE)</span>
                    {cbo && <span className="text-[10px] text-emerald-600 font-bold">Oficial</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cbo}
                      onChange={(e) => setCbo(e.target.value)}
                      placeholder="Ex: 7241-10"
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Setor de Alocação e Turno */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Setor de Alocação <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={setorId}
                    onChange={(e) => setSetorId(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">Selecione o Setor</option>
                    {setores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.setor_nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Turno de Trabalho
                  </label>
                  <select
                    value={turno}
                    onChange={(e) => setTurno(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="Diurno">Diurno</option>
                    <option value="Noturno">Noturno</option>
                    <option value="Misto (Comercial / Administrativo)">Misto (Comercial / Administrativo)</option>
                    <option value="Escala 12x36">Escala 12x36</option>
                    <option value="Escala 6x1">Escala 6x1</option>
                    <option value="Revezamento / Rodízio">Revezamento / Rodízio</option>
                  </select>
                </div>
              </div>

              {/* Quantidade e Tempo de Exposição */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Qtd. Trabalhadores Expostos
                  </label>
                  <input
                    type="text"
                    value={qtd}
                    onChange={(e) => setQtd(maskInteger(e.target.value, 4))}
                    placeholder="1"
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Jornada / Tempo de Exposição
                  </label>
                  <input
                    type="text"
                    value={tempoExposicao}
                    onChange={(e) => setTempoExposicao(e.target.value)}
                    placeholder="Ex: 8h/dia (Jornada integral), 44h semanais"
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Descrição Detalhada das Atividades */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>Descrição Detalhada das Atividades (Rotinas / Posto de Trabalho)</span>
                  {descricao && (
                    <span className="text-[10px] text-blue-600 font-semibold">
                      {descricao.length} caracteres
                    </span>
                  )}
                </label>
                <textarea
                  rows={4}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva as tarefas diárias, postos ocupados, ferramentas utilizadas, atribuições..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                />
              </div>

              {/* SEÇÃO INTELIGENTE DE EPIS COM IA, FOTO DO CA E CATÁLOGO */}
              <div className="rounded-2xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    Equipamentos de Proteção Individual (EPI)
                  </h4>
                  <button
                    type="button"
                    onClick={() => setScanModalOpen(true)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Tirar Foto do CA</span>
                  </button>
                </div>

                {/* Catálogo Rápido de EPIs */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Selecionar Modelo Padrão de EPI (Preenchimento Rápido)
                  </label>
                  <select
                    onChange={(e) => {
                      handleSelectEpiModel(e.target.value);
                      e.target.value = "";
                    }}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Selecione um modelo no catálogo...</option>
                    {CATALOGO_EPIS.map((epi) => (
                      <option key={epi.id} value={epi.id}>
                        {epi.categoria} • {epi.nome} (CA: {epi.caSugerido})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Campo CA e Busca Oficial */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Número(s) do CA (Certificado de Aprovação)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={episCA}
                      onChange={(e) => setEpisCA(e.target.value)}
                      placeholder="Ex: 40892, 5674, 10346"
                      className="h-11 flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleConsultarCA}
                      disabled={loadingCALookup}
                      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 flex-shrink-0 shadow-2xs transition-all cursor-pointer"
                    >
                      <Search className="h-3.5 w-3.5" />
                      <span>Consultar CA</span>
                    </button>
                  </div>
                </div>

                {/* Lista Visual de EPIs Cadastrados Separadamente */}
                {episLista.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        EPIs Vinculados à Função ({episLista.length})
                      </span>
                      <span className="text-[10px] text-slate-500">Clique na lixeira para remover</span>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {episLista.map((epi, idx) => (
                        <div
                          key={epi.id || idx}
                          className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs shadow-2xs transition-all hover:border-blue-300 dark:hover:border-blue-600"
                        >
                          <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              {epi.ca ? (
                                <span className="inline-flex items-center rounded-md bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 dark:text-blue-300">
                                  CA: {epi.ca}
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                                  Sem CA
                                </span>
                              )}
                              <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs">
                                {epi.nome}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                              {epi.fabricante && <span>Fab: {epi.fabricante}</span>}
                              {epi.validade && <span>• Val: {epi.validade}</span>}
                              {epi.eficacia && <span>• Eficácia: {epi.eficacia}</span>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEpiToDeleteIdx(idx)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all flex-shrink-0 cursor-pointer"
                            title="Remover EPI"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Resumo / Descrição dos EPIs (Editável Livremente)
                  </label>
                  <textarea
                    rows={2}
                    value={episTexto}
                    onChange={(e) => setEpisTexto(e.target.value)}
                    placeholder="Ex: Respirador PFF2, Protetor auricular tipo plug, Óculos ampla visão, Luvas de vaqueta..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Validade Padrão</label>
                    <select
                      value={episValidade}
                      onChange={(e) => setEpisValidade(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Válido">Válido e Homologado</option>
                      <option value="Válido com CA conforme MTE">Válido conforme MTE</option>
                      <option value="Conforme Fabricante">Conforme Fabricante</option>
                      <option value="Em Renovação">Em Renovação</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Eficácia dos EPIs</label>
                    <select
                      value={episEficacia}
                      onChange={(e) => setEpisEficacia(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Adequada">Adequada (Atenua o Risco)</option>
                      <option value="Parcial">Parcial (Necessita Ajuste)</option>
                      <option value="Inadequada">Inadequada</option>
                      <option value="Não Avaliada">Não Avaliada</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* EPCs */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Equipamentos de Proteção Coletiva (EPCs)
                </label>
                <textarea
                  rows={2}
                  value={epcsTexto}
                  onChange={(e) => setEpcsTexto(e.target.value)}
                  placeholder="Ex: Sistema de exaustão localizada, enclausuramento acústico, cortina de solda, corrimão com rodapé, linha de vida..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Medidas Preventivas */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Medidas Preventivas e Recomendações Técnicas
                </label>
                <textarea
                  rows={2}
                  value={medidas}
                  onChange={(e) => setMedidas(e.target.value)}
                  placeholder="Recomendações técnicas para inclusão no PGR, LTCAT, PCMSO e laudos periciais..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Modal Footer Pinned Padronizado */}
            <div className="border-t border-slate-100 dark:border-slate-800 p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-900 flex-shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Salvar Função</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Função */}
      <ConfirmModal
        isOpen={Boolean(funcToDelete)}
        title="Excluir Função"
        message={`Deseja realmente excluir a função "${funcToDelete?.name}"? Esta ação removerá a função e seus EPIs associados.`}
        confirmLabel="Sim, Excluir Função"
        onConfirm={() => {
          if (funcToDelete) {
            onDeleteFuncao(funcToDelete.id);
            setFuncToDelete(null);
          }
        }}
        onCancel={() => setFuncToDelete(null)}
      />

      {/* Modal de Confirmação de Exclusão de EPI */}
      <ConfirmModal
        isOpen={epiToDeleteIdx !== null}
        title="Remover EPI"
        message={`Deseja realmente remover o EPI "${epiToDeleteIdx !== null ? episLista[epiToDeleteIdx]?.nome || "selecionado" : ""}" desta função?`}
        confirmLabel="Sim, Remover EPI"
        onConfirm={() => {
          if (epiToDeleteIdx !== null) {
            handleRemoveEpiItem(epiToDeleteIdx);
          }
        }}
        onCancel={() => setEpiToDeleteIdx(null)}
      />

      {/* Modal de Câmera / Escanear CA com IA */}
      <EpiScanModal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        onApplyEpi={handleApplyScannedEpi}
        onAlert={onAlert}
      />

      {/* Modal de Busca Oficial de CBO & Atividades do MTE */}
      <CboSearchModal
        isOpen={cboModalOpen}
        onClose={() => setCboModalOpen(false)}
        onSelectCbo={handleApplyCbo}
        onAlert={onAlert}
        initialQuery={cboInitialQuery}
      />
    </div>
  );
};
