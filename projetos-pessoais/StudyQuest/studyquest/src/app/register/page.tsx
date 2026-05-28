"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/store/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <main className="quest-grid grid min-h-screen place-items-center bg-[#070813] px-4">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.05] p-6">
        <h1 className="text-3xl font-black text-white">Criar conta</h1>
        <p className="mt-2 text-sm text-slate-400">Seu progresso ficara salvo por usuario.</p>
        <div className="mt-5 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 text-sm" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 text-sm" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 text-sm" />
          <button
            type="button"
            onClick={async () => {
              const result = await register(name, email, password);
              setMessage(result.message);
              if (result.ok) router.push("/dashboard");
            }}
            className="h-11 w-full rounded-2xl bg-cyan-300 text-sm font-black text-slate-950"
          >
            Cadastrar
          </button>
        </div>
        {message ? <p className="mt-3 text-sm text-slate-300">{message}</p> : null}
        <p className="mt-4 text-sm text-slate-400">
          Ja tem conta? <Link href="/login" className="text-cyan-200">Entrar</Link>
        </p>
      </section>
    </main>
  );
}
