"use client";

import { useState, useCallback } from "react";
import {
  Hash,
  MapPin,
  Store,
  User,
  Phone,
  Navigation,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { generateLabelPDF, LabelData } from "@/lib/pdfGenerator";
import PreviewModal from "@/components/PreviewModal";
import { useLang } from "@/components/LanguageContext";

const INITIAL: LabelData = {
  orderNumber: "",
  city: "",
  storeName: "",
  clientName: "",
  phone: "",
  address: "",
};


const FIELD_ICONS: Record<keyof LabelData, React.ReactNode> = {
  orderNumber: <Hash size={15} />,
  city: <MapPin size={15} />,
  storeName: <Store size={15} />,
  clientName: <User size={15} />,
  phone: <Phone size={15} />,
  address: <Navigation size={15} />,
};

export default function ShippingForm() {
  const { tr } = useLang();
  const f = tr.form;

  const [form, setForm] = useState<LabelData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof LabelData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  const handleChange = useCallback(
    (key: keyof LabelData, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [errors]
  );

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof LabelData, string>> = {};
    if (!form.orderNumber.trim()) newErrors.orderNumber = f.required;
    if (!form.city.trim()) newErrors.city = f.required;
    if (!form.storeName.trim()) newErrors.storeName = f.required;
    if (!form.clientName.trim()) newErrors.clientName = f.required;
    if (!form.address.trim()) newErrors.address = f.required;
    if (!form.phone.trim()) newErrors.phone = f.required;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const [uri] = await Promise.all([
        generateLabelPDF(form),
        fetch("/api/labels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }),
      ]);
      setPdfUri(uri);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL);
    setErrors({});
    setPdfUri(null);
  };

  const fieldKeys = Object.keys(INITIAL) as (keyof LabelData)[];

  return (
    <>
      <div className="w-full max-w-xl mx-auto">
        <div className="bg-white rounded-3xl shadow-card p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-slate-900">{f.title}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{f.subtitle}</p>
          </div>

          <div className="flex flex-col gap-5">
            {fieldKeys.map((key) => {
              const fieldTr = f.fields[key];
              const hasError = Boolean(errors[key]);
              const isMultiline = key === "address";
              const isPhone = key === "phone";

              const inputCls = [
                "input-field pl-10",
                hasError ? "border-red-300 focus:ring-red-400/30 focus:border-red-400" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div key={key} className="field-group">
                  <label className="label-text" htmlFor={key}>
                    {fieldTr.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
                      {FIELD_ICONS[key]}
                    </span>
                    {isMultiline ? (
                      <textarea
                        id={key}
                        rows={2}
                        value={form[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={fieldTr.placeholder}
                        className={inputCls + " resize-none pt-3 leading-snug"}
                      />
                    ) : (
                      <input
                        id={key}
                        type="text"
                        value={form[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={fieldTr.placeholder}
                        className={inputCls}
                        autoComplete="off"
                      />
                    )}
                  </div>
                  {hasError && (
                    <p className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
                      <AlertCircle size={11} /> {errors[key]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 mt-8">
            <button
              onClick={handlePreview}
              disabled={loading}
              className="btn-primary flex-1 justify-center py-3.5"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {f.generating}
                </>
              ) : (
                <>
                  <Eye size={15} />
                  {f.preview}
                </>
              )}
            </button>
            <button onClick={handleReset} className="btn-secondary px-4 py-3.5">
              {f.reset}
            </button>
          </div>
        </div>
      </div>

      {pdfUri && (
        <PreviewModal
          pdfDataUri={pdfUri}
          orderNumber={form.orderNumber}
          onClose={() => setPdfUri(null)}
        />
      )}
    </>
  );
}
