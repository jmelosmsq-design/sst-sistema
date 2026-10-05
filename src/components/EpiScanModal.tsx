import React, { useState, useRef, useEffect } from "react";
import { Camera, Sparkles, Loader2, X, Check, ShieldCheck, AlertCircle, Image as ImageIcon, Video, RefreshCw } from "lucide-react";
import { EpiItem } from "../types";

interface EpiScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyEpi: (epiData: {
    ca: string;
    nome: string;
    fabricante?: string;
    descricao?: string;
    validade?: string;
    protecao?: string;
    categoria?: string;
    eficacia?: string;
  }) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

export const EpiScanModal: React.FC<EpiScanModalProps> = ({
  isOpen,
  onClose,
  onApplyEpi,
  onAlert,
}) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
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
        throw new Error("Câmera ao vivo não suportada neste navegador. Use a Câmera Nativa do Celular.");
      }

      let mediaStream: MediaStream | null = null;
      try {
        // Tentativa 1: facingMode ideal com resolução HD
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
          // Tentativa 2: facingMode simples
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode },
            audio: false,
          });
        } catch (e2) {
          // Tentativa 3: qualquer câmera de vídeo disponível
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (!mediaStream) {
        throw new Error("Não foi possível acessar a câmera.");
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
      setScanning(true);
      onAlert("info", "IA analisando a imagem do EPI / CA...");

      const res = await fetch("/api/epi/scan-ca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Image }),
      });

      if (!res.ok) throw new Error("Erro ao consultar serviço de IA do CA");
      const json = await res.json();

      if (json.success && json.data) {
        setScannedResult(json.data);
        onAlert("success", "Dados do CA e EPI identificados com sucesso pela IA!");
      } else {
        throw new Error(json.error || "Não foi possível extrair os dados do CA");
      }
    } catch (err: any) {
      onAlert("error", err?.message || "Erro ao escanear o CA. Preencha manualmente ou tente com foto mais nítida.");
    } finally {
      setScanning(false);
    }
  };

  const handleApply = () => {
    if (!scannedResult) return;
    onApplyEpi({
      ca: scannedResult.ca || "",
      nome: scannedResult.nome || "Equipamento Identificado",
      fabricante: scannedResult.fabricante || "",
      descricao: scannedResult.descricao || "",
      validade: scannedResult.validade || "Válido",
      protecao: scannedResult.protecao || "",
      categoria: scannedResult.categoria || "",
      eficacia: scannedResult.eficacia || "Adequada",
    });
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-md my-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[88vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">Escanear CA do EPI com IA</h3>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Tire foto do rótulo, carimbo ou CA</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 flex-1 overflow-y-auto overscroll-contain">
          {/* CÂMERA AO VIVO */}
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
                <div className="absolute inset-4 border-2 border-dashed border-blue-400/80 rounded-xl pointer-events-none flex flex-col items-center justify-between p-2">
                  <span className="bg-slate-900/80 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Enquadre o número do CA / Rótulo
                  </span>
                  <div className="w-12 h-1 bg-blue-400/80 rounded-full animate-pulse"></div>
                </div>

                {/* Botão de Alternar Câmera Frontal / Traseira */}
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
                  className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <Camera className="h-4 w-4" />
                  <span>Capturar Foto Agora</span>
                </button>
              </div>
            </div>
          ) : !photoPreview ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-6 text-center">
              <Camera className="h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Tire uma foto nítida do CA ou etiqueta do EPI</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                A IA do sistema reconhecerá automaticamente o número do CA, fabricante, proteção aprovada e validade oficial.
              </p>

              <div className="mt-4 flex flex-col gap-2">
                {/* 1. Botão Direto Câmera do Celular (Abre a Câmera Traseira Nativa) */}
                <label
                  htmlFor="epi-scan-camera-input"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer select-none"
                >
                  <Camera className="h-4 w-4" />
                  <span>Abrir Câmera do Celular</span>
                  <input
                    id="epi-scan-camera-input"
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
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 px-4 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 active:scale-95 transition-all cursor-pointer"
                >
                  <Video className="h-4 w-4" />
                  <span>Ver Câmera ao Vivo na Tela</span>
                </button>

                {/* 3. Botão Galeria / Arquivo */}
                <label
                  htmlFor="epi-scan-gallery-input"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer select-none"
                >
                  <ImageIcon className="h-4 w-4 text-slate-500" />
                  <span>Escolher Foto da Galeria / Arquivo</span>
                  <input
                    id="epi-scan-gallery-input"
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
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                <img src={photoPreview} alt="Preview CA" className="h-full w-full object-contain" />
                {scanning && (
                  <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white p-4 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-400 mb-2" />
                    <p className="text-xs font-bold">Consultando base oficial do MTE com IA...</p>
                    <p className="text-[10px] text-slate-300">Extraindo CA, laudos e normas</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shadow-2xs transition-all active:scale-95">
                  <Camera className="h-4 w-4" />
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
                  disabled={scanning}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow-xs active:scale-95 transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Reanalisar com IA</span>
                </button>
              </div>

              {scannedResult && (
                <div className="rounded-2xl border border-blue-100 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 p-4 space-y-2 text-xs text-slate-800 dark:text-slate-200 animate-fadeIn shadow-2xs">
                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-bold">
                    <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>CA Identificado: {scannedResult.ca || "Detectado"}</span>
                  </div>
                  <p>
                    <strong className="text-slate-900 dark:text-slate-100">EPI:</strong> {scannedResult.nome}
                  </p>
                  {scannedResult.fabricante && (
                    <p>
                      <strong className="text-slate-900 dark:text-slate-100">Fabricante:</strong> {scannedResult.fabricante}
                    </p>
                  )}
                  {scannedResult.protecao && (
                    <p>
                      <strong className="text-slate-900 dark:text-slate-100">Proteção Oficial:</strong> {scannedResult.protecao}
                    </p>
                  )}
                  {scannedResult.validade && (
                    <p>
                      <strong className="text-slate-900 dark:text-slate-100">Validade / Situação:</strong> {scannedResult.validade}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

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
              className="h-11 rounded-xl bg-blue-600 px-5 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-xs inline-flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              <span>Aplicar Dados ao Formulário</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
