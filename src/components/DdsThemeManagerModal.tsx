import React, { useState } from "react";
import { DdsTemaItem } from "../types";
import { CATALOGO_DDS_TEMAS } from "../data/ddsCatalog";
import {
  Sparkles,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  BookOpen,
  Check,
  Tag,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Layers,
  ArrowRight,
} from "lucide-react";

interface DdsThemeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customTemas: DdsTemaItem[];
  onSaveCustomTema: (tema: DdsTemaItem) => void;
  onDeleteCustomTema: (temaId: string) => void;
  onSelectTema: (tema: DdsTemaItem) => void;
  empresaRamo?: string;
}

export const DdsThemeManagerModal: React.FC<DdsThemeManagerModalProps> = ({
  isOpen,
  onClose,
  customTemas,
  onSaveCustomTema,
  onDeleteCustomTema,
  onSelectTema,
  empresaRamo,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [isEditingOrCreating, setIsEditingOrCreating] = useState(false);
  const [previewTema, setPreviewTema] = useState<DdsTemaItem | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiPromptTopic, setAiPromptTopic] = useState("");
  const [aiError, setAiError] = useState("");

  const [formTema, setFormTema] = useState<Partial<DdsTemaItem>>({
    codigo: "",
    titulo: "",
    categoria: "Comportamento Seguro e Cultura SST",
    nrReferencia: "NR-01",
    objetivo: "",
    pontosPrincipais: [""],
    conteudo: "",
    perguntasDebate: [""],
  });

  // Combine standard and custom themes
  const allTemas: DdsTemaItem[] = [
    ...customTemas,
    ...CATALOGO_DDS_TEMAS.filter((t) => !customTemas.some((c) => c.id === t.id)),
  ];

  const categories = [
    "Todas",
    ...Array.from(new Set(allTemas.map((t) => t.categoria).filter(Boolean))),
  ];

  const filteredTemas = allTemas.filter((tema) => {
    const matchesSearch =
      tema.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tema.conteudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tema.nrReferencia && tema.nrReferencia.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tema.codigo && tema.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      tema.categoria.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "Todas" || tema.categoria === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleOpenCreate = () => {
    setFormTema({
      id: "custom_dds_" + Date.now(),
      codigo: "DDS-CUSTOM-" + Math.floor(Math.random() * 900 + 100),
      titulo: "",
      categoria: "Comportamento Seguro e Cultura SST",
      nrReferencia: "NR-01",
      objetivo: "",
      pontosPrincipais: ["", "", ""],
      conteudo: "",
      perguntasDebate: [""],
      isCustom: true,
    });
    setIsEditingOrCreating(true);
  };

  const handleOpenEdit = (tema: DdsTemaItem) => {
    setFormTema({
      ...tema,
      pontosPrincipais: tema.pontosPrincipais.length ? tema.pontosPrincipais : [""],
      perguntasDebate: tema.perguntasDebate && tema.perguntasDebate.length ? tema.perguntasDebate : [""],
      isCustom: true,
    });
    setIsEditingOrCreating(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTema.titulo?.trim() || !formTema.conteudo?.trim()) {
      alert("Por favor, preencha o título e o conteúdo do tema.");
      return;
    }

    const newTema: DdsTemaItem = {
      id: formTema.id || "custom_dds_" + Date.now(),
      codigo: formTema.codigo || "DDS-MANUAL",
      titulo: formTema.titulo.trim(),
      categoria: formTema.categoria || "Geral",
      nrReferencia: formTema.nrReferencia || "NR-01",
      objetivo: formTema.objetivo || "",
      pontosPrincipais: (formTema.pontosPrincipais || []).filter((p) => p.trim() !== ""),
      conteudo: formTema.conteudo.trim(),
      perguntasDebate: (formTema.perguntasDebate || []).filter((q) => q.trim() !== ""),
      isCustom: true,
    };

    onSaveCustomTema(newTema);
    setIsEditingOrCreating(false);
  };

  const handleGenerateWithAi = async () => {
    if (!aiPromptTopic.trim()) {
      setAiError("Digite o tema ou assunto desejado para a IA gerar.");
      return;
    }

    setIsGeneratingAi(true);
    setAiError("");

    try {
      const response = await fetch("/api/dds/generate-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptTopic: aiPromptTopic.trim(),
          companyContext: empresaRamo || "Empresa com atividades operacionais e administrativas",
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        const generated = json.data;
        const newTema: DdsTemaItem = {
          id: "custom_ai_" + Date.now(),
          codigo: generated.codigo || "DDS-IA-" + Math.floor(Math.random() * 900 + 100),
          titulo: generated.titulo || aiPromptTopic,
          categoria: generated.categoria || "Comportamento Seguro e Cultura SST",
          nrReferencia: generated.nrReferencia || "NR-01",
          objetivo: generated.objetivo || "",
          pontosPrincipais: generated.pontosPrincipais || [],
          conteudo: generated.conteudo || "",
          perguntasDebate: generated.perguntasDebate || [],
          isCustom: true,
        };

        onSaveCustomTema(newTema);
        setAiPromptTopic("");
        setIsGeneratingAi(false);
      } else {
        setAiError(json.error || "Erro ao gerar tema com IA.");
        setIsGeneratingAi(false);
      }
    } catch (err: any) {
      console.error("AI DDS Generation error:", err);
      setAiError("Falha na conexão com o assistente de IA. Tente novamente.");
      setIsGeneratingAi(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Catálogo e Gestão de Temas de DDS
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecione, personalize, exclua ou gere novos temas com Inteligência Artificial
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* AI Generator Box */}
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-800/50 rounded-2xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Gerador de Temas com IA (Gemini SST)
                </span>
              </div>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                Gere qualquer tema sob demanda
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={aiPromptTopic}
                onChange={(e) => setAiPromptTopic(e.target.value)}
                placeholder="Ex: Trabalho com lixadeiras angulares, fadiga no turno noturno, choque elétrico em painéis..."
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isGeneratingAi) {
                    e.preventDefault();
                    handleGenerateWithAi();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleGenerateWithAi}
                disabled={isGeneratingAi}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer shrink-0"
              >
                {isGeneratingAi ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Gerando DDS com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Criar Tema com IA</span>
                  </>
                )}
              </button>
            </div>
            {aiError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> {aiError}
              </p>
            )}
          </div>

          {/* Search, Filter & Add Custom */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por tema, norma (ex: NR-35), código ou palavra-chave..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px] truncate"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Novo Tema Manual</span>
              </button>
            </div>
          </div>

          {/* Themes List Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
              <span>
                Mostrando <strong>{filteredTemas.length}</strong> temas disponíveis
              </span>
              <span>Clique em "Usar Tema" para carregar no DDS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTemas.map((tema) => (
                <div
                  key={tema.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between group shadow-2xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {tema.codigo && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {tema.codigo}
                          </span>
                        )}
                        {tema.nrReferencia && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                            {tema.nrReferencia}
                          </span>
                        )}
                        {tema.isCustom && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200">
                            Personalizado
                          </span>
                        )}
                      </div>

                      {tema.isCustom && (
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(tema)}
                            title="Editar tema"
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Deseja excluir o tema personalizado "${tema.titulo}"?`)) {
                                onDeleteCustomTema(tema.id);
                              }
                            }}
                            title="Excluir tema"
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 mb-1">
                      {tema.titulo}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 font-medium flex items-center gap-1">
                      <Tag className="h-3 w-3 text-slate-400" /> {tema.categoria}
                    </p>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-3 leading-relaxed">
                      {tema.conteudo}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewTema(tema)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-lg transition-colors cursor-pointer"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Ver Roteiro (5-10 min)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectTema(tema);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-2xs transition-all cursor-pointer"
                    >
                      <span>Usar Tema</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full Screen / Detailed Preview Overlay */}
        {previewTema && (
          <div className="absolute inset-0 z-30 bg-white dark:bg-slate-900 p-4 sm:p-6 overflow-y-auto flex flex-col justify-between animate-fadeIn">
            <div className="space-y-4 max-w-4xl mx-auto w-full">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {previewTema.codigo && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {previewTema.codigo}
                      </span>
                    )}
                    {previewTema.nrReferencia && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                        {previewTema.nrReferencia}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      Tempo estimado: 5 a 10 min
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {previewTema.titulo}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Categoria: {previewTema.categoria}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewTema(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Objetivo */}
              {previewTema.objetivo && (
                <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-3 text-xs text-blue-900 dark:text-blue-200">
                  <strong className="font-bold">Objetivo da Conscientização: </strong>
                  {previewTema.objetivo}
                </div>
              )}

              {/* Pontos Principais */}
              {previewTema.pontosPrincipais && previewTema.pontosPrincipais.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-3.5 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Pontos Críticos para Destaque Oral:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pl-2">
                    {previewTema.pontosPrincipais.map((ponto, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span>{ponto}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Roteiro Completo para Leitura Oral */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Roteiro Completo de Leitura Oral (Para o Facilitador):</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(previewTema.conteudo);
                      alert("Roteiro copiado para a área de transferência!");
                    }}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Copiar Texto
                  </button>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans shadow-2xs">
                  {previewTema.conteudo}
                </div>
              </div>

              {/* Perguntas para Debate */}
              {previewTema.perguntasDebate && previewTema.perguntasDebate.length > 0 && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-amber-600" />
                    <span>Perguntas para Engajar os Trabalhadores na Roda de Conversa:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-950 dark:text-amber-200 pl-2">
                    {previewTema.perguntasDebate.map((perg, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-bold text-amber-600 shrink-0">{idx + 1}.</span>
                        <span>{perg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom Actions of Preview */}
            <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 max-w-4xl mx-auto w-full">
              <button
                type="button"
                onClick={() => setPreviewTema(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Voltar aos Temas
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTema(previewTema);
                  setPreviewTema(null);
                  onClose();
                }}
                className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Usar este Tema no DDS</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Create / Edit Modal Form Overlay */}
        {isEditingOrCreating && (
          <div className="absolute inset-0 z-20 bg-white dark:bg-slate-900 p-4 sm:p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {formTema.id && customTemas.some((c) => c.id === formTema.id)
                    ? "Editar Tema Personalizado"
                    : "Cadastrar Novo Tema de DDS"}
                </h4>
                <button
                  onClick={() => setIsEditingOrCreating(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form id="form-tema-dds" onSubmit={handleSaveForm} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Título do Tema *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTema.titulo || ""}
                      onChange={(e) => setFormTema({ ...formTema, titulo: e.target.value })}
                      placeholder="Ex: Trabalho a Quente e Prevenção de Faíscas"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Código / Ref.
                    </label>
                    <input
                      type="text"
                      value={formTema.codigo || ""}
                      onChange={(e) => setFormTema({ ...formTema, codigo: e.target.value })}
                      placeholder="Ex: DDS-TQ-01"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Categoria Temática
                    </label>
                    <input
                      type="text"
                      value={formTema.categoria || ""}
                      onChange={(e) => setFormTema({ ...formTema, categoria: e.target.value })}
                      placeholder="Ex: Soldagem e Trabalho a Quente"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Norma Regulamentadora (NR)
                    </label>
                    <input
                      type="text"
                      value={formTema.nrReferencia || ""}
                      onChange={(e) => setFormTema({ ...formTema, nrReferencia: e.target.value })}
                      placeholder="Ex: NR-18 / NR-34 / NR-01"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Objetivo do Diálogo
                  </label>
                  <input
                    type="text"
                    value={formTema.objetivo || ""}
                    onChange={(e) => setFormTema({ ...formTema, objetivo: e.target.value })}
                    placeholder="Ex: Orientar sobre a inspeção prévia de extintores e isolamento de área antes de iniciar corte ou solda."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Conteúdo / Texto Explicativo Completo *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formTema.conteudo || ""}
                    onChange={(e) => setFormTema({ ...formTema, conteudo: e.target.value })}
                    placeholder="Descreva o conteúdo a ser abordado pelo facilitador durante o DDS..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pontos Principais para Destaque
                  </label>
                  {(formTema.pontosPrincipais || []).map((ponto, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={ponto}
                        onChange={(e) => {
                          const updated = [...(formTema.pontosPrincipais || [])];
                          updated[idx] = e.target.value;
                          setFormTema({ ...formTema, pontosPrincipais: updated });
                        }}
                        placeholder={`Ponto de atenção #${idx + 1}`}
                        className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (formTema.pontosPrincipais || []).filter((_, i) => i !== idx);
                          setFormTema({ ...formTema, pontosPrincipais: updated });
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormTema({
                        ...formTema,
                        pontosPrincipais: [...(formTema.pontosPrincipais || []), ""],
                      });
                    }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    + Adicionar outro ponto chave
                  </button>
                </div>
              </form>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditingOrCreating(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Voltar
              </button>
              <button
                type="submit"
                form="form-tema-dds"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Salvar Tema</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
