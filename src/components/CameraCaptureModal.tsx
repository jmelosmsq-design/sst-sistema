import React, { useState, useEffect, useRef } from "react";
import { Camera, X, RefreshCw, AlertCircle, Check, SwitchCamera } from "lucide-react";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string, fileName: string) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onAlert,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parar stream
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Iniciar stream da câmera
  const startCamera = async (mode: "environment" | "user") => {
    setIsStarting(true);
    setCameraError(null);
    stopStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Seu navegador ou ambiente não suporta acesso direto à câmera. Use o botão de captura abaixo.");
      }

      // Check available devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoDevices.length > 1);
      } catch {
        // ignore
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Erro ao iniciar câmera:", err);
      let msg = "Não foi possível abrir a câmera. Verifique as permissões do navegador ou utilize o botão alternativo.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Permissão de acesso à câmera negada. Permita o acesso nas configurações do seu navegador.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg = "Nenhuma câmera encontrada no seu dispositivo.";
      }
      setCameraError(msg);
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    if (isOpen && !capturedPreview) {
      startCamera(facingMode);
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, capturedPreview]);

  // Capturar foto do vídeo
  const handleTakePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Se estiver usando câmera frontal, espelhar horizontalmente para parecer natural
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedPreview(dataUrl);
    stopStream();
  };

  // Alternar entre frontal e traseira
  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Confirmar foto tirada
  const handleConfirmPhoto = () => {
    if (!capturedPreview) return;
    const fileName = `foto_camera_${Date.now()}.jpg`;
    onCapture(capturedPreview, fileName);
    setCapturedPreview(null);
    onAlert("success", "Foto capturada com sucesso!");
    onClose();
  };

  // Descartar e tirar outra
  const handleRetake = () => {
    setCapturedPreview(null);
    startCamera(facingMode);
  };

  // Fallback nativo via input file capture
  const handleNativeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 1200;
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.8);
        onCapture(compressed, file.name || `foto_${Date.now()}.jpg`);
        onAlert("success", "Foto anexada com sucesso!");
        onClose();
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopStream();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-4 sm:p-5 shadow-2xl text-white flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Câmera de Vistoria SST</h3>
              <p className="text-[11px] text-slate-400">
                {capturedPreview ? "Confirme a foto tirada" : "Enquadre o ambiente ou evidência"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Área da Câmera / Preview */}
        <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 shadow-inner">
          {capturedPreview ? (
            <img
              src={capturedPreview}
              alt="Foto tirada"
              className="w-full h-full object-contain"
            />
          ) : cameraError ? (
            <div className="p-5 text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-amber-400 mx-auto" />
              <p className="text-xs text-slate-300 max-w-xs mx-auto">{cameraError}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-md cursor-pointer active:scale-95 transition-all"
              >
                <Camera className="h-4 w-4" />
                <span>Usar Câmera Nativa do Celular</span>
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === "user" ? "scale-x-[-1]" : ""
                }`}
              />
              {isStarting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
                  <span className="text-xs font-medium">Iniciando câmera...</span>
                </div>
              )}
            </>
          )}

          {/* Botão de Alternar Câmera */}
          {!capturedPreview && !cameraError && (
            <button
              type="button"
              onClick={handleToggleCamera}
              className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/75 text-white backdrop-blur-xs border border-white/20 hover:bg-slate-800 transition-all cursor-pointer"
              title="Alternar Câmera (Frontal / Traseira)"
            >
              <SwitchCamera className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Input Oculto de Captura Nativa */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleNativeFileChange}
          className="hidden"
        />

        {/* Botões de Ação Inferiores */}
        <div className="mt-3 pt-2 flex items-center justify-between gap-2">
          {capturedPreview ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Tirar Outra</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="flex-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Usar Esta Foto</span>
              </button>
            </>
          ) : !cameraError ? (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 text-xs font-bold text-slate-300 hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                title="Abrir Câmera Nativa / Galeria"
              >
                <span>Celular</span>
              </button>
              <button
                type="button"
                onClick={handleTakePhoto}
                disabled={isStarting}
                className="flex-1 flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg hover:bg-blue-500 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Camera className="h-5 w-5" />
                <span>Capturar Foto</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                stopStream();
                onClose();
              }}
              className="w-full flex h-10 items-center justify-center rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
