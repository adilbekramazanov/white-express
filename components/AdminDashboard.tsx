"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { FileText, TrendingUp, LogOut, Calendar } from "lucide-react";

interface Label {
  id: string;
  order_number: string;
  city: string;
  store_name: string;
  client_name: string;
  phone: string;
  address: string;
  created_at: string;
}

interface Props {
  labels: Label[];
  totalCount: number;
  todayCount: number;
}

export default function AdminDashboard({ labels, totalCount, todayCount }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 shadow-soft sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Image
            src="/whiteexpresslogo.png"
            alt="White Express"
            width={160}
            height={48}
            className="h-10 w-auto object-contain"
          />
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:block">Панель администратора</span>
            <button
              onClick={handleLogout}
              className="btn-secondary text-xs gap-1.5"
            >
              <LogOut size={13} />
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <FileText size={18} />, label: "Всего этикеток", value: totalCount },
            { icon: <Calendar size={18} />, label: "Сегодня", value: todayCount },
            { icon: <TrendingUp size={18} />, label: "За последние 7 дней",
              value: labels.filter(l => {
                const d = new Date(l.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return d >= weekAgo;
              }).length
            },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-white rounded-2xl shadow-soft p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">История этикеток</h2>
            <span className="text-xs text-slate-400">{totalCount} записей</span>
          </div>

          {labels.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              Этикеток пока нет
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Дата", "Номер заказа", "Город", "Магазин", "Клиент", "Телефон", "Адрес"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {labels.map((label, idx) => (
                    <tr
                      key={label.id}
                      className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? "" : "bg-slate-50/50"}`}
                    >
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDate(label.created_at)}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{label.order_number}</td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{label.city}</td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{label.store_name}</td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{label.client_name}</td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{label.phone}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{label.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
