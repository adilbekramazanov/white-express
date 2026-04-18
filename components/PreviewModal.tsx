"use client";

import { useEffect } from "react";
import { X, Download } from "lucide-react";
import { downloadPDF } from "@/lib/pdfGenerator";
import { useLang } from "@/components/LanguageContext";

interface PreviewModalProps {
  pdfDataUri: string;
  orderNumber: string;
  onClose: () => void;
}

export default function PreviewModal({ pdfDataUri, orderNumber, onClose }: PreviewModalProps) {
  const { tr } = useLang();
  const m = tr.modal;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative z-10 flex flex-col w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-modal overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{m.title}</p>
              <p className="text-xs text-slate-400">{m.order} #{orderNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadPDF(pdfDataUri, `label-${orderNumber}.pdf`)}
              className="btn-primary text-xs"
            >
              <Download size={14} />
              {m.download}
            </button>
            <button
              onClick={onClose}
              className="ml-1 p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PDF preview */}
        <div className="flex-1 overflow-auto bg-slate-100 p-6 flex items-start justify-center min-h-0">
          <div className="w-full max-w-md shadow-card rounded-2xl overflow-hidden bg-white">
            <iframe
              src={pdfDataUri}
              title="Shipping Label Preview"
              className="w-full"
              style={{ height: "620px", border: "none", display: "block" }}
            />
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400 text-center">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-sm">Esc</kbd>
            {" "}{m.escHint}
          </p>
        </div>
      </div>
    </div>
  );
}
