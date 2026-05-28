"use client";

import { Coins, Medal, RefreshCcw, Sparkles, Target, TrendingUp } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { StatsCard } from "@/components/StatsCard";
import { SubjectProgressCard } from "@/components/SubjectProgressCard";
import { useGame } from "@/store/GameContext";

export default function ProfilePage() {
  const {
    player,
    subjects,
    profile,
    currentTitle,
    nextTitle,
    resetProfile,
    unlockedTitles,
    selectedTitle,
    chooseTitle,
  } = useGame();
  const weakSubjects = subjects.filter((subject) => subject.status === "weak");
  const strongSubjects = subjects.filter((subject) => subject.status === "strong");
  const neutralSubjects = subjects.filter((subject) => subject.status === "neutral");

  return (
    <main className="quest-grid min-h-screen bg-[#070813] lg:flex">
      <Sidebar />
      <section className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-200">
                Perfil academico
              </p>
              <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">
                Build do jogador
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Suas materias fortes e fracas definem bonus de XP e ajudam a guiar a evolucao.
              </p>
            </div>
            <button
              type="button"
              onClick={resetProfile}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-sm font-black text-slate-100 transition hover:border-fuchsia-200/40 hover:bg-fuchsia-300/10"
            >
              <RefreshCcw size={18} />
              Editar perfil academico
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard label="Titulo atual" value={currentTitle.name} icon={<Medal size={18} />} tone="violet" />
            <StatsCard label="Proximo titulo" value={nextTitle?.name ?? "Maximo"} icon={<TrendingUp size={18} />} tone="cyan" />
            <StatsCard label="Bonus ativo" value="+50% fracas" icon={<Sparkles size={18} />} tone="emerald" />
            <StatsCard label="Gold" value={player.gold} icon={<Coins size={18} />} tone="amber" />
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <SubjectList title="Pontos fracos" subtitle="Quests dessas materias dao +50% XP." subjects={weakSubjects} empty="Nenhum ponto fraco selecionado." />
            <SubjectList title="Pontos fortes" subtitle="Quests dessas materias dao -10% XP." subjects={strongSubjects} empty="Nenhum ponto forte selecionado." />
            <SubjectList title="Neutras" subtitle="Quests dessas materias dao XP padrao." subjects={neutralSubjects} empty="Todas as materias foram classificadas." />
          </div>

          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">Progresso por materia</h2>
              <span className="inline-flex items-center gap-2 text-sm font-black text-cyan-200">
                <Target size={16} />
                {profile.configured ? "Perfil configurado" : "Aguardando perfil"}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {subjects.map((subject) => (
                <SubjectProgressCard key={subject.name} subject={subject} />
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-black text-white">Titulos desbloqueados</h2>
                <p className="mt-1 text-sm font-semibold text-slate-400">
                  Escolha qual titulo academico aparece no PlayerCard.
                </p>
              </div>
              <span className="text-sm font-black text-cyan-200">
                Atual: {player.title}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {unlockedTitles.map((title) => (
                <button
                  key={title.name}
                  type="button"
                  onClick={() => chooseTitle(title.name)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                    selectedTitle === title.name
                      ? "border-cyan-200/50 bg-cyan-300/15 text-cyan-100"
                      : "border-white/10 bg-slate-950/45 text-slate-300 hover:border-cyan-200/40"
                  }`}
                >
                  {title.name}
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function SubjectList({
  title,
  subtitle,
  subjects,
  empty,
}: {
  title: string;
  subtitle: string;
  subjects: Array<{ name: string }>;
  empty: string;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur">
      <h2 className="text-xl font-black text-white">{title}</h2>
      <p className="mt-1 text-sm font-semibold text-slate-400">{subtitle}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <span
              key={subject.name}
              className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-sm font-black text-cyan-100"
            >
              {subject.name}
            </span>
          ))
        ) : (
          <p className="text-sm font-semibold text-slate-500">{empty}</p>
        )}
      </div>
    </section>
  );
}
