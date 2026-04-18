"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image
            src="/whiteexpresslogo.png"
            alt="White Express"
            width={200}
            height={60}
            className="h-14 w-auto object-contain"
          />
        </div>

        <div className="bg-white rounded-3xl shadow-card p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
              <Lock size={15} className="text-brand-600" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-900">Вход в админку</h1>
              <p className="text-xs text-slate-400">White Express</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="field-group">
              <label className="label-text" htmlFor="username">Логин</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="admin"
                autoComplete="username"
                required
              />
            </div>

            <div className="field-group">
              <label className="label-text" htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary justify-center py-3 mt-2">
              {loading ? <Loader2 size={15} className="animate-spin" /> : "Войти"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
