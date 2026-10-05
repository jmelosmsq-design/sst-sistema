import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  Flame,
  Zap,
  Bomb,
  Bike,
  Radio,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Download,
  Sparkles,
  Info,
  X,
  Building,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import {
  Company,
  FuncaoData,
  FotoEvidencia,
  Nr16AvaliacaoItem,
  Nr16AnexoItem,
  Nr16StatusEnquadramento,
} from "../types";
import {
  NR16_ANEXOS,
  NR16_CARGOS_PRESETS,
  Nr16CargoPreset,
  criarNr16AvaliacaoPadrao,
} from "../data/nr16Catalog";
import { gerarPDFLaudoPericulosidade } from "../services/pdfGenerator";
import { CameraCaptureModal } from "./CameraCaptureModal";

interface PericulosidadeNR16ModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  selectedFuncao: FuncaoData | null;
  onSaveAvaliacao: (avaliacao: Nr16AvaliacaoItem) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

export const PericulosidadeNR16Modal: React.FC<PericulosidadeNR16ModalProps> = ({
  isOpen,
  onClose,
  company,
  selectedFuncao,
  onSaveAvaliacao,
  onAlert,
}) => {
  if (!isOpen || !selectedFuncao) return null;

  // Busca avaliação existente da função na empresa ou inicializa com preset
  const existingAvaliacao = company.nr16Avaliacoes?.find(
    (a) => a.funcaoId === selectedFuncao.id
  );

  const [formData, setFormData] = useState<Nr16AvaliacaoItem>(() => {
    if (existingAvaliacao) return existingAvaliacao;
    return criarNr16AvaliacaoPadrao(
      selectedFuncao.id,
      selectedFuncao.func_nome,
      selectedFuncao.func_setor,
      selectedFuncao.func_descricao
    );
  });

  const [activeAnexoTab, setActiveAnexoTab] = useState<string>("anexo2"); // Inflamáveis por padrão
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const [newRecomendacao, setNewRecomendacao] = useState("");

  // Atualiza estado se mudar a função selecionada
  useEffect(() => {
    const existing = company.nr16Avaliacoes?.find(
      (a) => a.funcaoId === selectedFuncao.id
    );
    if (existing) {
      setFormData(existing);
    } else {
      setFormData(
        criarNr16AvaliacaoPadrao(
          selectedFuncao.id,
          selectedFuncao.func_nome,
          selectedFuncao.func_setor,
          selectedFuncao.func_descricao
        )
      );
    }
  }, [selectedFuncao, company.nr16Avaliacoes]);

  // Aplicar Preset de 1-clique
  const handleApplyPreset = (preset: Nr16CargoPreset) => {
    const base = criarNr16AvaliacaoPadrao(
      selectedFuncao.id,
      selectedFuncao.func_nome,
      selectedFuncao.func_setor,
      preset.atividadesExecutadas
    );

    const isEnquadrado = preset.resultadoGlobal === "Periculosidade Caracterizada (Adicional 30%)";
    const status: Nr16StatusEnquadramento = isEnquadrado
      ? "Caracterizada"
      : preset.resultadoGlobal === "Isenção Normativa"
      ? "Isenção Normativa"
      : "Descaracterizada";

    if (preset.anexoPrincipal !== "nenhum" && base.anexos[preset.anexoPrincipal]) {
      base.anexos[preset.anexoPrincipal] = {
        ...base.anexos[preset.anexoPrincipal],
        enquadrado: isEnquadrado,
        status,
        itemEspecifico: preset.itemNormativo,
        descricaoAtividade: preset.atividadesExecutadas,
        areaRisco: preset.areaRisco,
        tempoExposicao: preset.tempoExposicao,
        frequenciaTempo: preset.frequencia,
        fundamentacaoTecnica: preset.fundamentacaoTecnica,
        medidasPrevenconais: preset.recomendacoes.join(" "),
      };
      setActiveAnexoTab(preset.anexoPrincipal);
    }

    base.resultadoGlobal = preset.resultadoGlobal;
    base.parecerTecnicoConclusivo = preset.parecerConclusivo;
    base.baseLegal = preset.baseLegal;
    base.recomendacoesSST = preset.recomendacoes;

    setFormData(base);
    setShowPresetDropdown(false);
    onAlert("success", `Preenchimento padrão aplicado para "${preset.cargoNome}"!`);
  };

  // Atualizar campo geral
  const handleFieldChange = (field: keyof Nr16AvaliacaoItem, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Atualizar campo de um anexo específico
  const handleAnexoFieldChange = (anexoId: string, field: keyof Nr16AnexoItem, value: any) => {
    setFormData((prev) => {
      const currentAnx = prev.anexos[anexoId] || {
        anexoId: anexoId as any,
        anexoNome: anexoId,
        enquadrado: false,
        status: "Descaracterizada",
      };

      const updatedAnx = { ...currentAnx, [field]: value };

      // Se mudou enquadrado
      if (field === "enquadrado") {
        updatedAnx.status = value ? "Caracterizada" : "Descaracterizada";
      }

      const updatedAnexos = { ...prev.anexos, [anexoId]: updatedAnx };

      // Recalcula caracterizados
      const caracterizados = Object.values(updatedAnexos)
        .filter((a) => a.enquadrado)
        .map((a) => a.anexoNome);

      const hasIsencao = Object.values(updatedAnexos).some((a) => a.status === "Isenção Normativa");

      let novoResultadoGlobal = prev.resultadoGlobal;
      let novoParecer = prev.parecerTecnicoConclusivo;

      if (caracterizados.length > 0) {
        novoResultadoGlobal = "Periculosidade Caracterizada (Adicional 30%)";
        novoParecer = `FAZ JUS AO ADICIONAL DE PERICULOSIDADE DE 30% sobre o salário-base em virtude do enquadramento nos termos do(s) anexo(s): ${caracterizados.join(
          ", "
        )}.`;
      } else if (hasIsencao) {
        novoResultadoGlobal = "Isenção Normativa";
        novoParecer =
          "NÃO CARACTERIZADA A PERICULOSIDADE. As condições observadas enquadram-se expressamente nos limites legais de isenção normativa previstos na NR-16.";
      } else {
        novoResultadoGlobal = "Periculosidade Descaracterizada (Não Enseja Adicional)";
        novoParecer =
          "NÃO CARACTERIZADA A PERICULOSIDADE. As atividades e locais de trabalho inspecionados não se enquadram em nenhum dos Anexos da NR-16 da Portaria MTP nº 3.214/78, não ensejando o adicional de 30%.";
      }

      return {
        ...prev,
        anexos: updatedAnexos,
        anexosCaracterizados: caracterizados,
        resultadoGlobal: novoResultadoGlobal,
        parecerTecnicoConclusivo: novoParecer,
      };
    });
  };

  // Estado da Câmera ao vivo e Upload
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const comprimirFoto = (file: File, maxSize: number = 1000, quality: number = 0.75): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCameraCapture = (dataUrl: string, fileName: string) => {
    const newPhoto: FotoEvidencia = {
      id: `foto-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      nome: fileName,
      dataUrl,
      data: new Date().toLocaleDateString("pt-BR"),
      legenda: "Evidência fotográfica capturada via câmera",
    };
    setFormData((prev) => ({
      ...prev,
      fotos: [...(prev.fotos || []), newPhoto],
    }));
    onAlert("success", "Foto capturada com sucesso!");
  };

  // Upload de Foto de Evidência
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const dataUrl = await comprimirFoto(file, 1000, 0.75);
        const newPhoto: FotoEvidencia = {
          id: `foto-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          nome: file.name,
          dataUrl,
          data: new Date().toLocaleDateString("pt-BR"),
          legenda: "Evidência fotográfica do posto de trabalho e área de risco",
        };
        setFormData((prev) => ({
          ...prev,
          fotos: [...(prev.fotos || []), newPhoto],
        }));
      } catch (err) {
        onAlert("error", "Não foi possível processar a imagem selecionada.");
      }
    }
    e.target.value = "";
    onAlert("success", "Foto(s) anexada(s) com sucesso!");
  };

  const handleRemovePhoto = (id?: string) => {
    if (!id) return;
    setFormData((prev) => ({
      ...prev,
      fotos: (prev.fotos || []).filter((f) => f.id !== id),
    }));
  };

  const handleUpdateLegenda = (id: string, legenda: string) => {
    setFormData((prev) => ({
      ...prev,
      fotos: (prev.fotos || []).map((f) => (f.id === id ? { ...f, legenda } : f)),
    }));
  };

  // Adicionar recomendação
  const handleAddRecomendacao = () => {
    if (!newRecomendacao.trim()) return;
    setFormData((prev) => ({
      ...prev,
      recomendacoesSST: [...prev.recomendacoesSST, newRecomendacao.trim()],
    }));
    setNewRecomendacao("");
  };

  const handleRemoveRecomendacao = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      recomendacoesSST: prev.recomendacoesSST.filter((_, i) => i !== index),
    }));
  };

  // Salvar
  const handleSave = () => {
    onSaveAvaliacao(formData);
    onAlert("success", `Laudo de Periculosidade (NR-16) da função "${selectedFuncao.func_nome}" salvo com sucesso!`);
    onClose();
  };

  // Gerar PDF direto
  const handleGerarPDF = () => {
    gerarPDFLaudoPericulosidade(company, formData);
    onAlert("success", "Laudo Técnico de Periculosidade gerado em PDF!");
  };

  const currentAnexoDef = NR16_ANEXOS.find((a) => a.id === activeAnexoTab) || NR16_ANEXOS[1];
  const currentAnexoData: Nr16AnexoItem = formData.anexos[activeAnexoTab] || {
    anexoId: activeAnexoTab as any,
    anexoNome: currentAnexoDef.titulo,
    enquadrado: false,
    status: "Descaracterizada",
    itemEspecifico: "",
    descricaoAtividade: "",
    areaRisco: "",
    tempoExposicao: "Não Exposto",
    frequenciaTempo: "",
    fundamentacaoTecnica: "",
    medidasPrevenconais: "",
  };

  const getIconForAnexo = (id: string) => {
    switch (id) {
      case "anexo1":
        return <Bomb className="h-4 w-4" />;
      case "anexo2":
        return <Flame className="h-4 w-4" />;
      case "anexo3":
        return <ShieldAlert className="h-4 w-4" />;
      case "anexo4":
        return <Zap className="h-4 w-4" />;
      case "anexo5":
        return <Bike className="h-4 w-4" />;
      case "anexoRad":
        return <Radio className="h-4 w-4" />;
      default:
        return <ShieldAlert className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-red-700 via-red-800 to-rose-900 text-white shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-xs ring-1 ring-white/20 shadow-xs">
              <Flame className="h-5 w-5 text-amber-300 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
                  Laudo e Checklist NR-16 (Periculosidade)
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  CLT Art. 193
                </span>
              </div>
              <p className="text-xs text-red-100/90 truncate">
                Função: <strong className="text-white">{selectedFuncao.func_nome}</strong>
                {selectedFuncao.func_setor ? ` • Setor: ${selectedFuncao.func_setor}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGerarPDF}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-xs font-bold transition-all border border-white/20"
              title="Gerar Laudo de Periculosidade desta função em PDF"
            >
              <Download className="h-3.5 w-3.5 text-amber-300" />
              <span>Gerar Laudo PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Action Bar: Presets & Resultado Geral */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          {/* Quick Preset Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresetDropdown(!showPresetDropdown)}
              className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-red-400 dark:hover:border-red-500 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Modelos Pré-Preenchidos (1-Clique)</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showPresetDropdown && (
              <div className="absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 max-h-80 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Selecione o perfil da atividade:
                </div>
                {NR16_CARGOS_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-950/40 flex flex-col gap-0.5 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                      <span>{p.cargoNome}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                          p.resultadoGlobal.includes("30%")
                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                      >
                        {p.resultadoGlobal.includes("30%") ? "Periculoso (30%)" : "Não Periculoso"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">{p.itemNormativo}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Resultado Global Status Pill */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Resultado Técnico:</span>
            <div
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs ${
                formData.resultadoGlobal.includes("30%")
                  ? "bg-red-600 text-white ring-2 ring-red-300 dark:ring-red-900"
                  : formData.resultadoGlobal.includes("Isenção")
                  ? "bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-900"
                  : "bg-emerald-600 text-white ring-2 ring-emerald-300 dark:ring-emerald-900"
              }`}
            >
              {formData.resultadoGlobal.includes("30%") ? (
                <AlertTriangle className="h-4 w-4 text-amber-200" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-white" />
              )}
              <span>{formData.resultadoGlobal}</span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Seção 1: Navegação pelos Anexos da NR-16 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Anexos da NR-16 para Inspeção:
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Clique nos anexos para avaliar cada agente periculoso
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {NR16_ANEXOS.map((anx) => {
                const isSelected = activeAnexoTab === anx.id;
                const anxData = formData.anexos[anx.id];
                const isEnquadrado = anxData?.enquadrado;
                const isIsento = anxData?.status === "Isenção Normativa";

                return (
                  <button
                    key={anx.id}
                    type="button"
                    onClick={() => setActiveAnexoTab(anx.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                      isSelected
                        ? "border-red-600 bg-red-50/70 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold shadow-xs ring-1 ring-red-500"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {getIconForAnexo(anx.id)}
                    </div>
                    <span className="text-xs font-bold leading-tight">{anx.codigo}</span>
                    <span className="text-[10px] leading-tight truncate w-full text-slate-500 dark:text-slate-400 mt-0.5">
                      {anx.titulo}
                    </span>

                    {/* Status Badge */}
                    {isEnquadrado ? (
                      <span className="absolute -top-1.5 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[8px] font-bold text-white">
                        30%
                      </span>
                    ) : isIsento ? (
                      <span className="absolute -top-1.5 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 text-[8px] font-bold text-white">
                        Isento
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seção 2: Card de Detalhamento do Anexo Selecionado */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
                  {getIconForAnexo(currentAnexoDef.id)}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    {currentAnexoDef.codigo} — {currentAnexoDef.titulo}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {currentAnexoDef.legislacao}
                  </p>
                </div>
              </div>

              {/* Botões de Decisão Rápida de Enquadramento */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAnexoFieldChange(currentAnexoDef.id, "enquadrado", false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    !currentAnexoData.enquadrado && currentAnexoData.status !== "Isenção Normativa"
                      ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Não Enquadrado
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleAnexoFieldChange(currentAnexoDef.id, "enquadrado", false);
                    handleAnexoFieldChange(currentAnexoDef.id, "status", "Isenção Normativa");
                    handleAnexoFieldChange(
                      currentAnexoDef.id,
                      "fundamentacaoTecnica",
                      "Atividade amparada pelos limites expressos de isenção normativa da Portaria MTE nº 1.357/2019 e NR-16."
                    );
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    currentAnexoData.status === "Isenção Normativa"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-50"
                  }`}
                >
                  Isenção Legal
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleAnexoFieldChange(currentAnexoDef.id, "enquadrado", true);
                    handleAnexoFieldChange(currentAnexoDef.id, "status", "Caracterizada");
                    if (
                      !currentAnexoData.itemEspecifico ||
                      currentAnexoData.itemEspecifico.includes("Não há")
                    ) {
                      const firstQ = currentAnexoDef.perguntasNormativas[0];
                      if (firstQ) {
                        handleAnexoFieldChange(currentAnexoDef.id, "itemEspecifico", firstQ.itemNorma);
                        handleAnexoFieldChange(currentAnexoDef.id, "areaRisco", firstQ.areaRiscoSugerida);
                        handleAnexoFieldChange(currentAnexoDef.id, "fundamentacaoTecnica", firstQ.justificativaPadrao);
                      }
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    currentAnexoData.enquadrado
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 hover:bg-red-50"
                  }`}
                >
                  Enquadrado (30%)
                </button>
              </div>
            </div>

            {/* Perguntas Guiadas com 1-clique para preenchimento rápido */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Perguntas Normativas de Checklist (Clique para aplicar):
              </label>
              <div className="space-y-1.5">
                {currentAnexoDef.perguntasNormativas.map((q) => (
                  <div
                    key={q.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{q.pergunta}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Norma: {q.itemNorma}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleAnexoFieldChange(currentAnexoDef.id, "enquadrado", true);
                        handleAnexoFieldChange(currentAnexoDef.id, "itemEspecifico", q.itemNorma);
                        handleAnexoFieldChange(currentAnexoDef.id, "areaRisco", q.areaRiscoSugerida);
                        handleAnexoFieldChange(currentAnexoDef.id, "fundamentacaoTecnica", q.justificativaPadrao);
                        handleAnexoFieldChange(
                          currentAnexoDef.id,
                          "medidasPrevenconais",
                          q.medidasRecomendadas.join(" ")
                        );
                        onAlert("info", "Dados da norma aplicados ao anexo!");
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 shrink-0 cursor-pointer"
                    >
                      Enquadrar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Campos de Detalhamento do Anexo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Item Específico da Norma */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Item Específico do Anexo:
                </label>
                <input
                  type="text"
                  value={currentAnexoData.itemEspecifico || ""}
                  onChange={(e) =>
                    handleAnexoFieldChange(currentAnexoDef.id, "itemEspecifico", e.target.value)
                  }
                  placeholder="Ex: Item 1, alínea 'm' (Postos de combustível)"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Tempo de Exposição */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Regime / Tempo de Exposição:
                </label>
                <select
                  value={currentAnexoData.tempoExposicao || "Não Exposto"}
                  onChange={(e) =>
                    handleAnexoFieldChange(currentAnexoDef.id, "tempoExposicao", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                >
                  <option value="Habitual e Permanente">Habitual e Permanente (Jornada Integral)</option>
                  <option value="Intermitente">Intermitente (Rotina periódica / Súmula 364 TST)</option>
                  <option value="Eventual / Fortuito">Eventual / Fortuito (Tempo extremamente reduzido)</option>
                  <option value="Não Exposto">Não Exposto (Sem contato com o agente)</option>
                </select>
              </div>

              {/* Delimitação da Área de Risco */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Delimitação da Área de Risco:
                  </label>
                  <span className="text-[10px] text-slate-400">Sugestões rápidas abaixo</span>
                </div>
                <input
                  type="text"
                  value={currentAnexoData.areaRisco || ""}
                  onChange={(e) =>
                    handleAnexoFieldChange(currentAnexoDef.id, "areaRisco", e.target.value)
                  }
                  placeholder="Ex: Círculo de 7,5m com centro na bomba / Zona controlada do painel elétrico"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500 mb-1.5"
                />
                {/* Chips de áreas de risco padrão */}
                <div className="flex flex-wrap gap-1">
                  {currentAnexoDef.areasRiscoPadrao.map((ar, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAnexoFieldChange(currentAnexoDef.id, "areaRisco", ar)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      + {ar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fundamentação Técnica do Anexo */}
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Fundamentação Técnica e Normativa do Anexo:
                </label>
                <textarea
                  rows={2}
                  value={currentAnexoData.fundamentacaoTecnica || ""}
                  onChange={(e) =>
                    handleAnexoFieldChange(currentAnexoDef.id, "fundamentacaoTecnica", e.target.value)
                  }
                  placeholder="Descreva a fundamentação técnica da caracterização ou descaracterização..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Conclusão Geral do Laudo */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span>Conclusão Pericial & Parecer Técnico Final do Laudo</span>
            </h3>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Parecer Técnico Conclusivo:
              </label>
              <textarea
                rows={2}
                value={formData.parecerTecnicoConclusivo || ""}
                onChange={(e) => handleFieldChange("parecerTecnicoConclusivo", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Base Legal de Sustentação:
              </label>
              <input
                type="text"
                value={formData.baseLegal || ""}
                onChange={(e) => handleFieldChange("baseLegal", e.target.value)}
                placeholder="Ex: Artigo 193 da CLT, NR-16 da Portaria MTP nº 3.214/78, Súmula 364 do TST"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Seção 4: Recomendações e Medidas de Prevenção SST */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Recomendações Técnicas e Medidas Preventivas</span>
            </h3>

            <div className="space-y-1.5">
              {formData.recomendacoesSST?.map((rec, rIdx) => (
                <div
                  key={rIdx}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 text-xs"
                >
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {rIdx + 1}. {rec}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRecomendacao(rIdx)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newRecomendacao}
                onChange={(e) => setNewRecomendacao(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRecomendacao();
                  }
                }}
                placeholder="Adicionar recomendação técnica (ex: Treinamento NR-20, Vestimenta ATPV...)"
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={handleAddRecomendacao}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-white text-white dark:text-slate-900 shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* Seção 5: Evidências Fotográficas do Posto */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Evidências Fotográficas da Vistoria (NR-16)</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer select-none"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Câmera (Ao Vivo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer select-none"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Galeria / Anexar Fotos</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {formData.fotos && formData.fotos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.fotos.map((foto, fIdx) => (
                  <div
                    key={foto.id || fIdx}
                    className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900/50"
                  >
                    <div className="relative h-36 bg-slate-800 flex items-center justify-center overflow-hidden">
                      <img
                        src={foto.dataUrl}
                        alt={foto.legenda || "Evidência"}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(foto.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-700 shadow-md cursor-pointer"
                        title="Remover foto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="p-2">
                      <input
                        type="text"
                        value={foto.legenda || ""}
                        onChange={(e) => handleUpdateLegenda(foto.id || "", e.target.value)}
                        placeholder="Legenda da foto..."
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-hidden"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                Nenhuma evidência fotográfica anexada a este laudo de periculosidade.
              </p>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGerarPDF}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
              <span className="hidden sm:inline">Baixar Laudo</span> PDF
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Salvar Laudo NR-16</span>
            </button>
          </div>
        </div>
      </div>

      {/* Câmera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        onAlert={onAlert}
      />
    </div>
  );
};
