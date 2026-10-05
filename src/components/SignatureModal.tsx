import React, { useRef, useState, useEffect } from "react";
import { PenTool, RotateCcw, Check, X, User, ShieldCheck } from "lucide-react";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (dataUrl: string, nome: string, docOrCargo: string) => void;
  title: string;
  subtitle?: string;
  defaultNome?: string;
  defaultDocOrCargo?: string;
  docOrCargoLabel?: string;
  docOrCargoPlaceholder?: string;
  isTecnico?: boolean;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSaveSignature,
  title,
  subtitle,
  defaultNome = "",
  defaultDocOrCargo = "",
  docOrCargoLabel = "Cargo / CPF do Representante",
  docOrCargoPlaceholder = "Ex: Gerente Operacional / CPF 000.000.000-00",
  isTecnico = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [nome, setNome] = useState(defaultNome);
  const [docOrCargo, setDocOrCargo] = useState(defaultDocOrCargo);

  useEffect(() => {
    if (isOpen) {
      setNome(defaultNome);
      setDocOrCargo(defaultDocOrCargo);
      setHasDrawn(false);
      // Wait for canvas element to render
      setTimeout(() => {
        initCanvas();
      }, 80);
    }
  }, [isOpen, defaultNome, defaultDocOrCargo]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = 180 * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = "180px";

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0] || (e as any).changedTouches?.[0];
      if (!touch) return { x: 0, y: 0 };
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ("touches" in e) {
      // Prevent scrolling on touch
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if ("touches" in e) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.closePath();
      }
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const trimCanvas = (canvas: HTMLCanvasElement): string => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas.toDataURL("image/png");

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let hasPixels = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alphaIndex = (y * width + x) * 4 + 3;
        if (data[alphaIndex] > 10) {
          hasPixels = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!hasPixels) return canvas.toDataURL("image/png");

    // Add clean padding
    const padding = 16;
    const trimX = Math.max(0, minX - padding);
    const trimY = Math.max(0, minY - padding);
    const trimWidth = Math.min(width - trimX, maxX - minX + padding * 2);
    const trimHeight = Math.min(height - trimY, maxY - minY + padding * 2);

    const trimmedCanvas = document.createElement("canvas");
    trimmedCanvas.width = trimWidth;
    trimmedCanvas.height = trimHeight;

    const trimmedCtx = trimmedCanvas.getContext("2d");
    if (trimmedCtx) {
      trimmedCtx.drawImage(
        canvas,
        trimX,
        trimY,
        trimWidth,
        trimHeight,
        0,
        0,
        trimWidth,
        trimHeight
      );
      return trimmedCanvas.toDataURL("image/png");
    }

    return canvas.toDataURL("image/png");
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!hasDrawn) {
      alert("Por favor, faça a assinatura no quadro antes de confirmar.");
      return;
    }

    if (!nome.trim()) {
      alert("Por favor, preencha o nome do signatário.");
      return;
    }

    const dataUrl = trimCanvas(canvas);
    onSaveSignature(dataUrl, nome.trim(), docOrCargo.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg my-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-xs ${
                isTecnico ? "bg-blue-600" : "bg-emerald-600"
              }`}
            >
              {isTecnico ? <ShieldCheck className="h-4 w-4" /> : <PenTool className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h3>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {subtitle || "Assinatura na tela para laudo técnico de vistoria"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain">
          {/* Identificação do Signatário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {docOrCargoLabel}
              </label>
              <input
                type="text"
                value={docOrCargo}
                onChange={(e) => setDocOrCargo(e.target.value)}
                placeholder={docOrCargoPlaceholder}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Área de Assinatura (Canvas) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <PenTool className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Assine no Quadro Abaixo (Touch ou Mouse):</span>
              </label>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Limpar Traço</span>
              </button>
            </div>

            <div className="relative w-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 overflow-hidden shadow-inner touch-none">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="block w-full cursor-crosshair"
              />

              {/* Linha Guia Inferior */}
              <div className="absolute bottom-6 left-8 right-8 border-b border-slate-200 dark:border-slate-800 pointer-events-none flex justify-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-700 bg-white dark:bg-slate-950 px-2 -mb-2">
                  Linha de Assinatura
                </span>
              </div>

              {!hasDrawn && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-600 flex items-center gap-1.5">
                    <PenTool className="h-4 w-4" />
                    <span>Desenhe sua assinatura com o dedo ou caneta</span>
                  </p>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              * A assinatura será estampada digitalmente no Termo de Encerramento e Laudo Técnico (PDF).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-900/95 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="h-11 rounded-xl bg-blue-600 px-5 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-xs inline-flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            <span>Confirmar Assinatura</span>
          </button>
        </div>
      </div>
    </div>
  );
};
