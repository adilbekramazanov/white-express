"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Lang, t } from "@/lib/translations";

interface LangCtx {
  lang: Lang;
  tr: (typeof t)[Lang];
  toggle: () => void;
}

const LanguageContext = createContext<LangCtx>({
  lang: "ru",
  tr: t.ru,
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ru");
  const toggle = () => setLang((l) => (l === "ru" ? "kk" : "ru"));

  return (
    <LanguageContext.Provider value={{ lang, tr: t[lang], toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
