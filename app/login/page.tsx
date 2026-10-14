"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Zap } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const from = search.get("from") || "/";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "密码错误");
        return;
      }
      router.replace(from.startsWith("/") ? from : "/");
      router.refresh();
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center gap-2 text-slate-300 text-sm">
        <Lock className="w-4 h-4 text-sky-400" />
        请输入访问密码
      </div>
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="密码"
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
      {error && (
        <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-sm"
      >
        {loading ? "验证中…" : "进入"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Options Scanner Pro</h1>
            <p className="text-xs text-slate-500">私有访问</p>
          </div>
        </div>
        <Suspense fallback={<div className="text-center text-slate-500 text-sm">加载中…</div>}>
          <LoginForm />
        </Suspense>
        <p className="text-center text-[11px] text-slate-600 mt-6">
          持仓与账户数据仅本人可见
        </p>
      </div>
    </div>
  );
}
