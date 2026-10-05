import React, { useState, useMemo } from "react";
import { Search, Sparkles, BookOpen, Check, X, ShieldCheck, Briefcase, ChevronRight, Layers, Clock, AlertCircle, Loader2 } from "lucide-react";
import { CATALOGO_CBO, CboItem, buscarCboNoCatalogo } from "../data/cboCatalog";

interface CboSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCbo: (cboData: CboItem) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
  initialQuery?: string;
}

export const CboSearchModal: React.FC<CboSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCbo,
  onAlert,
  initialQuery = "",
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedGrupo, setSelectedGrupo] = useState<string>("Todos");
  const [selectedItem, setSelectedItem] = useState<CboItem | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);

  // Filter groups
  const grupos = useMemo(() => {
    const set = new Set<string>();
    CATALOGO_CBO.forEach((item) => set.add(item.grupoOcupacional));
    return ["Todos", ...Array.from(set)];
  }, []);

  // Filtered items from catalog
  const filteredItems = useMemo(() => {
    let items = buscarCboNoCatalogo(searchTerm);
    if (selectedGrupo !== "Todos") {
      items = items.filter((item) => item.grupoOcupacional === selectedGrupo);
    }
    return items;
  }, [searchTerm, selectedGrupo]);

  if (!isOpen) return null;

  const handleSearchWithAi = async () => {
    const term = searchTerm.trim();
    if (!term) {
      onAlert("info", "Digite o nome da função ou código CBO para pesquisar na base oficial.");
      return;
    }

    try {
      setIsAiSearching(true);
      onAlert("info", "Buscando dados oficiais do CBO / MTE e eSocial com IA...");

      const res = await fetch("/api/cbo/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: term }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const item: CboItem = {
          cbo: json.data.cbo || "CBO Oficial",
          titulo: json.data.titulo || term,
          sinonimos: json.data.sinonimos || [term],
          descricaoSumaria: json.data.descricaoSumaria || "Descrição de atividades conforme base oficial do CBO.",
          atividadesDetalhadas: json.data.atividadesDetalhadas || [],
          grupoOcupacional: json.data.grupoOcupacional || "Geral",
          jornadaSugerida: json.data.jornadaSugerida || "44h semanais",
          turnoPadrao: json.data.turnoPadrao || "Diurno",
          episSugeridos: json.data.episSugeridos || [],
          epcsSugeridos: json.data.epcsSugeridos || "",
          medidasSugeridas: json.data.medidasSugeridas || "",
          riscosTipicos: json.data.riscosTipicos || [],
        };

        setSelectedItem(item);
        onAlert("success", `CBO ${item.cbo} (${item.titulo}) localizado com sucesso!`);
      } else {
        throw new Error("Não foi possível localizar o CBO informado.");
      }
    } catch (err: any) {
      onAlert("error", "Erro ao consultar base do CBO. Selecione uma opção do catálogo padrão.");
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleApply = (item: CboItem) => {
    onSelectCbo(item);
    onClose();
    onAlert("success", `Função "${item.titulo}" (CBO ${item.cbo}) e suas atividades foram importadas com sucesso!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl my-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] sm:max-h-[92vh] overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Catálogo Oficial de CBO & Atividades
                <span className="inline-flex items-center rounded-md bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:text-blue-300">
                  MTE / eSocial
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Busca de cargos, código CBO oficial, descrição de atividades, EPIs normativos e medidas de controle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredItems.length === 0) {
                    handleSearchWithAi();
                  }
                }}
                placeholder="Digite o cargo ou CBO (ex: Soldador, 7822-20, Limpeza, Eletricista, Cozinheiro)..."
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleSearchWithAi}
              disabled={isAiSearching || !searchTerm.trim()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex-shrink-0"
              title="Pesquisar cargo com Inteligência Artificial na base completa do Governo/MTE"
            >
              {isAiSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Consultando MTE...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Buscar com IA no MTE</span>
                </>
              )}
            </button>
          </div>

          {/* Filtro por Grupo Ocupacional */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap pr-1 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" /> Grupos:
            </span>
            {grupos.map((grupo) => (
              <button
                key={grupo}
                type="button"
                onClick={() => setSelectedGrupo(grupo)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedGrupo === grupo
                    ? "bg-blue-600 text-white shadow-2xs font-bold"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {grupo}
              </button>
            ))}
          </div>
        </div>

        {/* Corpo com Grid Dividido (Lista à esquerda / Detalhes à direita) */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Coluna da Esquerda: Lista de Ocupações */}
          <div className="md:col-span-5 border-r border-slate-100 dark:border-slate-800 overflow-y-auto p-3 sm:p-4 space-y-2 max-h-[300px] md:max-h-full">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ocupações Encontradas ({filteredItems.length})
              </span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center space-y-2.5">
                <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nenhum cargo local correspondente.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Clique em <strong>"Buscar com IA no MTE"</strong> para consultar qualquer função oficial no banco governamental.
                </p>
                <button
                  type="button"
                  onClick={handleSearchWithAi}
                  disabled={isAiSearching || !searchTerm.trim()}
                  className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Consultar "{searchTerm || "Função"}" com IA</span>
                </button>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedItem?.cbo === item.cbo;
                return (
                  <button
                    key={item.cbo}
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-950/50 border-blue-400 dark:border-blue-700 shadow-2xs"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-slate-900 dark:bg-slate-700 text-white">
                          {item.cbo}
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {item.grupoOcupacional}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.titulo}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {item.descricaoSumaria}
                      </p>
                    </div>
                    <ChevronRight className={`h-4 w-4 flex-shrink-0 mt-2 transition-transform ${isSelected ? "text-blue-600 translate-x-0.5" : "text-slate-400"}`} />
                  </button>
                );
              })
            )}
          </div>

          {/* Coluna da Direita: Detalhamento da Ocupação Selecionada */}
          <div className="md:col-span-7 overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[400px] md:max-h-full bg-slate-50/30 dark:bg-slate-900/30">
            {selectedItem ? (
              <div className="space-y-4">
                {/* Header da Ocupação */}
                <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 border border-blue-200 dark:border-blue-900/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs sm:text-sm font-bold px-2.5 py-1 rounded-xl bg-blue-600 text-white shadow-2xs">
                        CBO {selectedItem.cbo}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {selectedItem.grupoOcupacional}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="h-3.5 w-3.5" /> {selectedItem.jornadaSugerida}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    {selectedItem.titulo}
                  </h3>

                  {selectedItem.sinonimos && selectedItem.sinonimos.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400">Sinônimos:</span>
                      {selectedItem.sinonimos.map((s, idx) => (
                        <span key={idx} className="text-[10.5px] bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Descrição Sumária Oficial */}
                <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    Descrição Sumária das Atividades (Oficial MTE)
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedItem.descricaoSumaria}
                  </p>
                </div>

                {/* Atividades Detalhadas */}
                {selectedItem.atividadesDetalhadas && selectedItem.atividadesDetalhadas.length > 0 && (
                  <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-600" />
                      Rotinas e Atividades Típicas do Cargo
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {selectedItem.atividadesDetalhadas.map((atv, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                          <span>{atv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* EPIs Sugeridos com CAs Homologados */}
                {selectedItem.episSugeridos && selectedItem.episSugeridos.length > 0 && (
                  <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 border border-blue-100 dark:border-blue-900/60 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                        EPIs Normativos Vinculados ({selectedItem.episSugeridos.length})
                      </h4>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                        Pré-preenchimento automático com CAs
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {selectedItem.episSugeridos.map((epi, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 p-2.5 text-xs flex items-start justify-between gap-2"
                        >
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                                CA: {epi.ca}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                                {epi.nome}
                              </span>
                            </div>
                            {epi.protecao && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                {epi.protecao}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medidas Técnicas e EPCs */}
                {(selectedItem.epcsSugeridos || selectedItem.medidasSugeridas) && (
                  <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Proteções Coletivas (EPCs) & Recomendações
                    </h4>
                    {selectedItem.epcsSugeridos && (
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        <strong>EPCs:</strong> {selectedItem.epcsSugeridos}
                      </p>
                    )}
                    {selectedItem.medidasSugeridas && (
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        <strong>Recomendações:</strong> {selectedItem.medidasSugeridas}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-xs">
                  <Search className="h-6 w-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Selecione uma Ocupação na Lista
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ou digite o nome de qualquer função no campo de busca para visualizar as atribuições oficiais do MTE e aplicar ao laudo.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé Fixo Padronizado em Grid de Largura Total */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 sm:p-5 bg-slate-50 dark:bg-slate-900 flex-shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span>Cancelar</span>
            </button>

            <button
              type="button"
              disabled={!selectedItem}
              onClick={() => selectedItem && handleApply(selectedItem)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>{selectedItem ? `Aplicar CBO ${selectedItem.cbo} & Preencher Tudo` : "Selecione uma Ocupação"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
