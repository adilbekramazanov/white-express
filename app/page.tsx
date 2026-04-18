"use client";

import Image from "next/image";
import { LanguageProvider, useLang } from "@/components/LanguageContext";
import ShippingForm from "@/components/ShippingForm";

function AppContent() {
  const { tr, toggle, lang } = useLang();

  return (
    <div className="min-h-screen flex flex-col">

      {/* Navigation */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-soft">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/whiteexpresslogo.png"
              alt="White Express"
              width={280}
              height={80}
              className="h-16 w-auto object-contain"
              priority
            />
          </div>

          {/* Language toggle */}
          <button
            onClick={toggle}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-100 px-3 py-1.5 rounded-full transition-colors"
            title={lang === "ru" ? "Қазақша" : "Русский"}
          >
            <span className="text-[10px] leading-none">🌐</span>
            {tr.nav.langLabel}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {tr.hero.title1}
            <br />
            <span className="text-brand-600">{tr.hero.title2}</span>
          </h1>
          <p className="mt-4 text-slate-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            {tr.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* Form */}
          <div className="lg:col-span-3">
            <ShippingForm />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-white rounded-3xl shadow-card p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                {tr.sidebar.howTitle}
              </h3>
              <ol className="flex flex-col gap-4">
                {tr.sidebar.steps.map(({ title, desc }, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-50 text-brand-600 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Specs */}
            <div className="bg-brand-50 rounded-3xl p-5">
              <p className="text-xs font-semibold text-brand-700 mb-3 uppercase tracking-wide">
                {tr.sidebar.specsTitle}
              </p>
              <ul className="flex flex-col gap-2 text-xs text-brand-700">
                {tr.sidebar.specs.map(([k, v]) => (
                  <li key={k} className="flex justify-between">
                    <span className="opacity-60">{k}</span>
                    <span className="font-medium">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between text-xs text-slate-400">
          <span>{tr.footer.rights}</span>
          <span>{tr.footer.note}</span>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
