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

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  const d = digits.startsWith("7") ? digits : "7" + digits.slice(0, 10);
  const n = d.slice(0, 11);
  let result = "+7";
  if (n.length > 1) result += ` (${n.slice(1, 4)}`;
  if (n.length >= 4) result += `) ${n.slice(4, 7)}`;
  if (n.length >= 7) result += `-${n.slice(7, 9)}`;
  if (n.length >= 9) result += `-${n.slice(9, 11)}`;
  return result;
}

function extractDigits(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

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
      if (key === "phone") {
        const digits = extractDigits(value);
        setForm((prev) => ({ ...prev, phone: formatPhone(digits) }));
      } else {
        setForm((prev) => ({ ...prev, [key]: value }));
      }
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [errors]
  );

  // Intercept Backspace on the phone field so the cursor never gets
  // stranded on a formatting character like ")" or "-".
  // We always operate on the raw digit string, then reformat.
  const handlePhoneKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Backspace") return;
      e.preventDefault();
      const digits = extractDigits(form.phone);
      const trimmed = digits.length <= 1 ? "" : digits.slice(0, -1);
      setForm((prev) => ({ ...prev, phone: formatPhone(trimmed) }));
      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
    },
    [form.phone, errors.phone]
  );

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof LabelData, string>> = {};
    if (!form.orderNumber.trim()) newErrors.orderNumber = f.required;
    if (!form.city.trim()) newErrors.city = f.required;
    if (!form.storeName.trim()) newErrors.storeName = f.required;
    if (!form.clientName.trim()) newErrors.clientName = f.required;
    if (!form.address.trim()) newErrors.address = f.required;
    if (extractDigits(form.phone).length < 11) newErrors.phone = f.phoneError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const uri = await generateLabelPDF(form);
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
                        type={isPhone ? "tel" : "text"}
                        value={form[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        onKeyDown={isPhone ? handlePhoneKeyDown : undefined}
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
