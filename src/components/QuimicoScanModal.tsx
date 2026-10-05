import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Search,
  Sparkles,
  Loader2,
  X,
  Check,
  FlaskConical,
  ShieldAlert,
  AlertCircle,
  FileText,
  ChevronRight,
  Image as ImageIcon,
  Video,
  RefreshCw,
} from "lucide-react";
import { ProdutoQuimicoItem } from "../types";
import { CATALOGO_PRODUTOS_QUIMICOS } from "../data/chemicalsCatalog";

interface QuimicoScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProduto: (produto: Omit<ProdutoQuimicoItem, "id">) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

export const QuimicoScanModal: React.FC<QuimicoScanModalProps> = ({
  isOpen,
  onClose,
  onApplyProduto,
  onAlert,
}) => {
  const [activeMode, setActiveMode] = useState<"foto" | "busca" | "catalogo">("busca");
  const [searchQuery, setSearchQuery] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  const startLiveCamera = async (mode: "environment" | "user" = facingMode) => {
    try {
      stopLiveCamera();
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Câmera ao vivo não suportada neste navegador.");
      }

      let mediaStream: MediaStream | null = null;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (e1) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode },
            audio: false,
          });
        } catch (e2) {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (!mediaStream) {
        throw new Error("Não foi possível acessar a câmera de vídeo.");
      }

      streamRef.current = mediaStream;
      setIsLiveCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err: any) {
      onAlert("info", "Use o botão 'Abrir Câmera do Celular' ou abra o app em nova aba para vídeo ao vivo.");
      setIsLiveCameraActive(false);
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startLiveCamera(nextMode);
  };

  const captureLivePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      stopLiveCamera();
      setPhotoPreview(dataUrl);
      setScannedResult(null);
      handleScanAI(dataUrl);
    }
  };

  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, []);

  const handleClose = () => {
    stopLiveCamera();
    onClose();
  };

  if (!isOpen) return null;

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopLiveCamera();
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotoPreview(dataUrl);
      setScannedResult(null);
      handleScanAI(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleScanAI = async (base64Image: string) => {
    try {
      setLoading(true);
      onAlert("info", "IA analisando o rótulo do produto químico / FDS...");

      const res = await fetch("/api/quimico/scan-rotulo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Image }),
      });

      if (!res.ok) throw new Error("Erro ao consultar serviço de IA para o produto químico.");
      const json = await res.json();

      if (json.success && json.data) {
        setScannedResult(json.data);
        onAlert("success", "Dados do produto químico, CAS e GHS extraídos com sucesso!");
      } else {
        throw new Error(json.error || "Não foi possível identificar o produto químico na imagem.");
      }
    } catch (err: any) {
      onAlert("error", err?.message || "Erro ao escanear imagem do produto. Tente digitar o nome ou CAS.");
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async (term: string) => {
    if (!term.trim()) {
      onAlert("error", "Digite o nome, CAS ou ONU do produto químico para pesquisar.");
      return;
    }

    try {
      setLoading(true);
      onAlert("info", `Pesquisando base técnica e FDS para "${term}"...`);

      const res = await fetch("/api/quimico/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: term }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setScannedResult(json.data);
          onAlert("success", `Informações técnicas de "${json.data.nome}" carregadas!`);
          return;
        }
      }

      // Fallback local: verificar se existe correspondência no catálogo padrão
      const termLower = term.toLowerCase().trim();
      const localMatch = CATALOGO_PRODUTOS_QUIMICOS.find(
        (c) =>
          c.nome.toLowerCase().includes(termLower) ||
          (c.nomeQuimico && c.nomeQuimico.toLowerCase().includes(termLower)) ||
          (c.cas && c.cas.toLowerCase().includes(termLower)) ||
          (c.onu && c.onu.toLowerCase().includes(termLower))
      );

      if (localMatch) {
        setScannedResult(localMatch);
        onAlert("success", `Produto "${localMatch.nome}" localizado na base de dados SST!`);
      } else {
        throw new Error("Produto não localizado no banco. Selecione uma opção na lista de sugestões ou catálogo.");
      }
    } catch (err: any) {
      // Tentar match local antes de falhar
      const termLower = term.toLowerCase().trim();
      const localMatch = CATALOGO_PRODUTOS_QUIMICOS.find(
        (c) =>
          c.nome.toLowerCase().includes(termLower) ||
          (c.nomeQuimico && c.nomeQuimico.toLowerCase().includes(termLower))
      );
      if (localMatch) {
        setScannedResult(localMatch);
        onAlert("success", `Produto "${localMatch.nome}" localizado na base de dados SST!`);
      } else {
        onAlert("error", err?.message || "Não foi possível consultar a substância. Tente pelo catálogo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!scannedResult) return;
    onApplyProduto({
      nome: scannedResult.nome || "Produto Químico",
      nomeQuimico: scannedResult.nomeQuimico || "",
      cas: scannedResult.cas || "",
      onu: scannedResult.onu || "",
      fabricante: scannedResult.fabricante || "",
      estadoFisico: scannedResult.estadoFisico || "Líquido",
      classificacaoGhs: scannedResult.classificacaoGhs || "",
      frasesPerigo: scannedResult.frasesPerigo || "",
      composicao: scannedResult.composicao || "",
      finalidadeUso: scannedResult.finalidadeUso || "",
      episRecomendados: scannedResult.episRecomendados || "",
      fdsDisponivel: scannedResult.fdsDisponivel || "Sim",
      medidasControle: scannedResult.medidasControle || "",
    });
    handleClose();
  };

  // Filter catalog items
  const filteredCatalog = CATALOGO_PRODUTOS_QUIMICOS.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.nome.toLowerCase().includes(q) ||
      (c.nomeQuimico && c.nomeQuimico.toLowerCase().includes(q)) ||
      (c.cas && c.cas.toLowerCase().includes(q)) ||
      (c.onu && c.onu.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg my-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
              <FlaskConical className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Identificador de Produtos Químicos com IA
              </h3>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Busca automática por Foto do Rótulo, CAS, ONU ou Catálogo
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-1.5 gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              stopLiveCamera();
              setActiveMode("busca");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === "busca"
                ? "bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Digitar CAS / Nome / ONU</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("foto")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === "foto"
                ? "bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Foto do Rótulo / FDS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopLiveCamera();
              setActiveMode("catalogo");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === "catalogo"
                ? "bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Catálogo Rápido</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto overscroll-contain">
          {/* Modo 1: Busca por Texto / CAS / ONU */}
          {activeMode === "busca" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nome do Produto, Número CAS ou ONU:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleLookup(searchQuery);
                      }}
                      placeholder="Ex: Thinner, 108-88-3, Hipoclorito, ONU 1263, Soda..."
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3.5 pr-9 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLookup(searchQuery)}
                    disabled={loading || !searchQuery.trim()}
                    className="h-11 inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 shadow-xs active:scale-95 transition-all flex-shrink-0"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    <span>Consultar com IA</span>
                  </button>
                </div>
              </div>

              {/* Exemplos Rápidos de Pesquisa */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Sugestões rápidas de pesquisa:</span>
                <div className="flex flex-wrap gap-1.5">
                  {["Thinner", "Ácido Clorídrico", "Hipoclorito", "Óleo Diesel", "Graxa de Lítio", "Acetona"].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setSearchQuery(sug);
                        handleLookup(sug);
                      }}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-red-300 dark:hover:border-red-800 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Modo 2: Foto do Rótulo / Frasco / FDS */}
          {activeMode === "foto" && (
            <div className="space-y-3">
              {/* Câmera ao Vivo */}
              {isLiveCameraActive ? (
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Guia de Enquadramento */}
                    <div className="absolute inset-4 border-2 border-dashed border-red-400/80 rounded-xl pointer-events-none flex flex-col items-center justify-between p-2">
                      <span className="bg-slate-900/80 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        Enquadre o Rótulo, Pictogramas ou FDS
                      </span>
                      <div className="w-12 h-1 bg-red-400/80 rounded-full animate-pulse"></div>
                    </div>

                    {/* Alternar Câmera */}
                    <button
                      type="button"
                      onClick={toggleFacingMode}
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-800 transition-all shadow-md"
                      title="Alternar Câmera"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={stopLiveCamera}
                      className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                    >
                      Cancelar Câmera
                    </button>
                    <button
                      type="button"
                      onClick={captureLivePhoto}
                      className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white shadow-md hover:bg-red-700 active:scale-95 transition-all"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Capturar Foto Agora</span>
                    </button>
                  </div>
                </div>
              ) : !photoPreview ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-6 text-center">
                  <Camera className="h-10 w-10 text-red-600 dark:text-red-400 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Tire foto do rótulo, embalagem ou primeira página da FDS
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    A IA identificará automaticamente nome comercial, substâncias, número CAS/ONU, perigos GHS e EPIs recomendados.
                  </p>

                  <div className="mt-4 flex flex-col gap-2">
                    {/* 1. Botão Direto Câmera do Celular (Abre a Câmera Traseira Nativa) */}
                    <label
                      htmlFor="quimico-scan-camera-input"
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-red-700 active:scale-95 transition-all cursor-pointer select-none"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Abrir Câmera do Celular</span>
                      <input
                        id="quimico-scan-camera-input"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoCapture}
                        className="sr-only"
                      />
                    </label>

                    {/* 2. Botão Câmera ao Vivo na Tela (Viewfinder WebRTC) */}
                    <button
                      type="button"
                      onClick={() => startLiveCamera("environment")}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50/60 dark:bg-red-950/40 px-4 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 active:scale-95 transition-all cursor-pointer"
                    >
                      <Video className="h-4 w-4" />
                      <span>Ver Câmera ao Vivo na Tela</span>
                    </button>

                    {/* 3. Botão Galeria / Arquivo */}
                    <label
                      htmlFor="quimico-scan-gallery-input"
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer select-none"
                    >
                      <ImageIcon className="h-4 w-4 text-slate-500" />
                      <span>Escolher Foto da Galeria / Arquivo</span>
                      <input
                        id="quimico-scan-gallery-input"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoCapture}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <img src={photoPreview} alt="Preview Produto" className="h-full w-full object-cover" />
                    {loading && (
                      <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white p-4 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-red-400 mb-2" />
                        <p className="text-xs font-bold">Analisando composição química e GHS com IA...</p>
                        <p className="text-[10px] text-slate-300">Identificando CAS, frases H e EPIs</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shadow-2xs transition-all">
                      <Camera className="h-3.5 w-3.5" />
                      <span>Tirar Outra Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoCapture}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleScanAI(photoPreview)}
                      disabled={loading}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 shadow-xs active:scale-95 transition-all"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Reanalisar com IA</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modo 3: Catálogo Rápido */}
          {activeMode === "catalogo" && (
            <div className="space-y-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar catálogo (ex: solda, óleo, thinner, ácido)..."
                className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-red-500 focus:outline-none transition-all"
              />

              <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                {filteredCatalog.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setScannedResult(item);
                      onAlert("info", `Produto "${item.nome}" selecionado do catálogo.`);
                    }}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:border-red-300 dark:hover:border-red-800 hover:bg-red-50/40 dark:hover:bg-red-950/20 cursor-pointer transition-all flex items-center justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        <span>{item.nome}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        <strong>CAS:</strong> {item.cas || "Mistura"} • <strong>Estado:</strong> {item.estadoFisico}
                      </p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-300 line-clamp-1">
                        {item.finalidadeUso}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resultado Identificado */}
          {scannedResult && (
            <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 p-3.5 space-y-2 text-xs text-slate-800 dark:text-slate-200 animate-fadeIn shadow-2xs">
              <div className="flex items-center justify-between border-b border-red-200 dark:border-red-900/80 pb-2">
                <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 font-bold">
                  <ShieldAlert className="h-4 w-4 text-red-600" />
                  <span>{scannedResult.nome || "Produto Químico Identificado"}</span>
                </div>
                <span className="rounded-full bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold">
                  {scannedResult.estadoFisico || "Líquido"}
                </span>
              </div>

              {scannedResult.nomeQuimico && (
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">Substâncias / Nome Químico:</strong>{" "}
                  {scannedResult.nomeQuimico}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">CAS:</strong> {scannedResult.cas || "Não especificado"}
                </p>
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">ONU:</strong> {scannedResult.onu || "Não aplicável"}
                </p>
              </div>

              {scannedResult.classificacaoGhs && (
                <p className="text-red-800 dark:text-red-300">
                  <strong className="text-slate-900 dark:text-slate-100">Perigos GHS:</strong>{" "}
                  {scannedResult.classificacaoGhs}
                </p>
              )}

              {scannedResult.episRecomendados && (
                <p className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-xl border border-red-100 dark:border-red-900/40">
                  <strong className="text-slate-900 dark:text-slate-100">EPIs Recomendados (NR-06 / FDS):</strong>{" "}
                  {scannedResult.episRecomendados}
                </p>
              )}

              {scannedResult.finalidadeUso && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  <strong>Finalidade Típica:</strong> {scannedResult.finalidadeUso}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-end gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs"
          >
            Cancelar
          </button>

          {scannedResult && (
            <button
              type="button"
              onClick={handleApply}
              className="h-11 rounded-xl bg-red-600 px-5 text-xs sm:text-sm font-bold text-white hover:bg-red-700 active:scale-95 transition-all shadow-xs inline-flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              <span>Adicionar ao Inventário</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
