import React, { useRef, useState, useEffect } from "react";
import { PenTool, Check, RotateCcw, X, User, ChevronRight, CheckCircle2 } from "lucide-react";
import { DdsParticipante } from "../types";

export interface SignerItem {
  id: string;
  nome: string;
  funcao?: string;
  setor?: string;
  cpfOuMatricula?: string;
}

interface SignatureCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  workerName?: string;
  workerRole?: string;
  onSaveSignature: (signatureBase64: string) => void;
  // Sequential signing queue mode (multiple workers in row)
  queueMode?: boolean;
  queueList?: (DdsParticipante | SignerItem)[];
  currentQueueIndex?: number;
  onSaveAndNext?: (signatureBase64: string, nextIndex: number) => void;
}

export const SignatureCanvasModal: React.FC<SignatureCanvasModalProps> = ({
  isOpen,
  onClose,
  title = "Assinatura Digital na Tela",
  subtitle = "Desenhe a sua assinatura abaixo usando o dedo ou mouse",
  workerName,
  workerRole,
  onSaveSignature,
  queueMode = false,
  queueList = [],
  currentQueueIndex = 0,
  onSaveAndNext,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(currentQueueIndex);

  useEffect(() => {
    setCurrentIndex(currentQueueIndex);
  }, [currentQueueIndex]);

  const activeWorker = queueMode && queueList[currentIndex] ? queueList[currentIndex] : null;
  const displayName = activeWorker ? activeWorker.nome : workerName;
  const displayRole = activeWorker ? activeWorker.funcao || activeWorker.setor : workerRole;

  // Initialize Canvas
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a"; // dark slate ink
    ctx.lineWidth = 2.5;

    // Draw a subtle baseline guide
    drawBaseline(ctx, rect.width, rect.height);
  };

  const drawBaseline = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, height - 30);
    ctx.lineTo(width - 20, height - 30);
    ctx.stroke();
    ctx.restore();
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setupCanvas();
        setHasDrawn(false);
      }, 80);
    }
  }, [isOpen, currentIndex]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
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
    e.preventDefault();
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
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    drawBaseline(ctx, rect.width, rect.height);
    setHasDrawn(false);
  };

  const exportCanvasImage = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return "";

    // Create a temporary canvas without the dashed baseline for ultra clean PDF embedding
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return canvas.toDataURL("image/png");

    // Copy drawing
    tempCtx.drawImage(canvas, 0, 0);
    return tempCanvas.toDataURL("image/png");
  };

  const handleSave = () => {
    if (!hasDrawn) return;
    const base64 = exportCanvasImage();

    if (queueMode && onSaveAndNext) {
      const nextIdx = currentIndex + 1;
      onSaveAndNext(base64, nextIdx);
      if (nextIdx < queueList.length) {
        setCurrentIndex(nextIdx);
        handleClear();
      } else {
        onClose();
      }
    } else {
      onSaveSignature(base64);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <PenTool className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
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

        {/* Worker Badge or Queue Stepper */}
        {displayName && (
          <div className="bg-blue-50 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/40 px-5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="truncate">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {displayName}
                </span>
                {displayRole && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    ({displayRole})
                  </span>
                )}
              </div>
            </div>

            {queueMode && queueList.length > 0 && (
              <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-200/70 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {currentIndex + 1} de {queueList.length}
              </span>
            )}
          </div>
        )}

        {/* Canvas Area */}
        <div className="p-4 sm:p-5 flex flex-col items-center">
          <div className="relative w-full h-52 sm:h-60 bg-white rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-inner overflow-hidden touch-none cursor-crosshair flex items-center justify-center">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full block"
            />
            {!hasDrawn && (
              <div className="absolute pointer-events-none flex flex-col items-center justify-center text-slate-400 text-xs">
                <PenTool className="h-6 w-6 mb-1 text-slate-300 dark:text-slate-600 animate-pulse" />
                <span>Assine aqui com o dedo ou caneta</span>
              </div>
            )}
          </div>

          <div className="w-full flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Válida para ata e lista de presença
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Limpar
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasDrawn}
            className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer ${
              hasDrawn
                ? "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-500/20"
                : "bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60"
            }`}
          >
            {queueMode && currentIndex + 1 < queueList.length ? (
              <>
                <span>Confirmar e Próximo</span>
                <ChevronRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Salvar Assinatura</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
