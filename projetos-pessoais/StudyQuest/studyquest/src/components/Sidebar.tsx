"use client";

import { BarChart3, BookOpenCheck, BrainCircuit, Home, Sparkles, Swords, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isOnlineSyncPending } from "@/services/userPersistenceService";
import { useAuth } from "@/store/AuthContext";

const links = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/quests", label: "Quests", icon: BookOpenCheck },
  { href: "/quiz", label: "Quiz", icon: BrainCircuit },
  { href: "/arena", label: "Arena", icon: Swords },
  { href: "/profile", label: "Perfil", icon: UserRound },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, hydrated } = useAuth();
  const syncPending = hydrated && isOnlineSyncPending();

  return (
    <aside className="w-full border-b border-white/10 bg-slate-950/88 px-4 py-4 lg:sticky lg:top-0 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-5">
      <div className="flex items-center justify-between gap-4 lg:block">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <Sparkles size={20} />
          </span>
          <span>
            <span className="block text-base font-black uppercase tracking-[0.2em] text-white">
              StudyQuest
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/80">
              Guilda de estudos
            </span>
          </span>
        </Link>

        <nav className="flex gap-2 overflow-x-auto lg:mt-10 lg:flex-col lg:overflow-visible">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex h-11 min-w-fit items-center gap-3 rounded-2xl px-4 text-sm font-black transition ${
                  active
                    ? "bg-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-3 lg:mt-6">
          {hydrated && user ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-cyan-200">Logado</p>
              <p className="mt-1 text-sm font-bold text-white">{user.name}</p>
              <button
                type="button"
                onClick={logout}
                className="mt-2 h-9 w-full rounded-xl border border-white/10 text-xs font-black uppercase tracking-[0.12em] text-slate-200 transition hover:border-cyan-200/40"
              >
                Sair
              </button>
              {syncPending ? (
                <p className="mt-2 text-[11px] font-semibold text-amber-200/90">
                  Sincronizacao online pendente.
                </p>
              ) : null}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-xs font-black uppercase tracking-[0.12em] text-cyan-100"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
