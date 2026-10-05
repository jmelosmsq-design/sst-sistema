import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, Share2, QrCode, Building2, ShieldCheck, Download } from "lucide-react";
import { Company } from "../types";

interface Srq20ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

export const Srq20ShareModal: React.FC<Srq20ShareModalProps> = ({
  isOpen,
  onClose,
  company,
  onAlert,
}) => {
  const [selectedSetor, setSelectedSetor] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const params = new URLSearchParams();
  params.set("srq20", "1");
  params.set("cid", company.id);
  if (selectedSetor) {
    params.set("setor", selectedSetor);
  }
  const shareUrl = `${baseUrl}/?${params.toString()}`;

  const empresaNome = company.empresa?.emp_fantasia || company.empresa?.emp_razao || "Empresa";

  const messageText = `Olá! A ${empresaNome} está realizando a Pesquisa de Bem-Estar e Saúde Mental (SRQ-20), em atendimento à NR-01 e NR-17.
Sua participação é rápida (cerca de 2 minutos) e totalmente sigilosa (com opção de resposta anônima).
Acesse pelo link:
${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onAlert("success", "Link copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onAlert("error", "Não foi possível copiar automaticamente. Selecione e copie o link.");
    }
  };

  const handleShareWhatsapp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, "_blank");
  };

  const handleDownloadQrCode = () => {
    const svgEl = document.getElementById("srq20-qr-svg");
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(img, 50, 50, 500, 500);
        const a = document.createElement("a");
        a.download = `QRCode_SRQ20_${empresaNome.replace(/\s+/g, "_")}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
        onAlert("success", "QR Code baixado com sucesso!");
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <QrCode className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                Link e QR Code para os Trabalhadores
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Coleta digital de saúde mental • SRQ-20 (NR-1 & NR-17)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Information Notice */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <p className="leading-relaxed">
              O trabalhador <strong>não precisa de login nem aplicativo instalado</strong>. Ele acessa pelo próprio celular e responde em 2 a 3 minutos com opção de <strong>sigilo anônimo</strong>.
            </p>
          </div>

          {/* Sector selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Setor específico (Opcional):
            </label>
            <select
              value={selectedSetor}
              onChange={(e) => setSelectedSetor(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Todos os Setores (Geral da Empresa)</option>
              {company.setores.map((s) => (
                <option key={s.id} value={s.setor_nome}>
                  {s.setor_nome}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {selectedSetor
                ? `O questionário já abrirá pré-configurado para o setor "${selectedSetor}".`
                : "O trabalhador poderá selecionar seu setor diretamente na tela inicial."}
            </p>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200">
              <QRCodeSVG
                id="srq20-qr-svg"
                value={shareUrl}
                size={168}
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2.5">
              Aponte a câmera do celular para responder
            </p>
            <span className="text-[10px] text-slate-400">
              {empresaNome} {selectedSetor ? `• ${selectedSetor}` : ""}
            </span>
          </div>

          {/* Direct Link Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Link de Acesso Direto:
            </label>
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 text-xs font-mono text-slate-600 dark:text-slate-300 break-all select-all">
              {shareUrl}
            </div>
          </div>

          {/* Action Buttons - ALL FULL WIDTH AS PER USER REQUEST */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Link Copiado!" : "Copiar Link para WhatsApp / E-mail"}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsapp}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              <span>Enviar Diretamente no WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadQrCode}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-98 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Baixar Imagem do QR Code para Mural / Cartaz</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
