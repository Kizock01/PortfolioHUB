"use client";

import { Check, GraduationCap, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { subjectNames } from "@/data/mock-game";
import { useGame } from "@/store/GameContext";
import type { QuestCategory } from "@/types/game";

type SelectionMode = "weak" | "strong";

export function AcademicSetupModal() {
  const { profile, hydrated, configureProfile } = useGame();
  const pathname = usePathname();
  const [weakSubjects, setWeakSubjects] = useState<QuestCategory[]>([]);
  const [strongSubjects, setStrongSubjects] = useState<QuestCategory[]>([]);

  const canStart = weakSubjects.length > 0 || strongSubjects.length > 0;

  const helperText = useMemo(() => {
    if (!canStart) {
      return "Escolha pelo menos uma materia para calibrar seu XP.";
    }

    return `${weakSubjects.length} pontos fracos e ${strongSubjects.length} pontos fortes selecionados.`;
  }, [canStart, strongSubjects.length, weakSubjects.length]);

  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isArenaRoute = pathname === "/arena";

  if (!hydrated || profile.configured || isAuthRoute || isArenaRoute) {
    return null;
  }

  function toggleSubject(subject: QuestCategory, mode: SelectionMode) {
    if (mode === "weak") {
      setWeakSubjects((current) =>
        current.includes(subject)
          ? current.filter((item) => item !== subject)
          : [...current, subject],
      );
      setStrongSubjects((current) => current.filter((item) => item !== subject));
      return;
    }

    setStrongSubjects((current) =>
      current.includes(subject)
        ? current.filter((item) => item !== subject)
        : [...current, subject],
    );
    setWeakSubjects((current) => current.filter((item) => item !== subject));
  }

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/88 px-4 py-6 backdrop-blur-xl">
      <div className="mx-auto max-w-5xl rounded-3xl border border-cyan-200/20 bg-[#090b18] p-5 shadow-[0_0_80px_rgba(34,211,238,0.18)] sm:p-7">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-100">
              <GraduationCap size={18} />
              Perfil academico inicial
            </div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Calibre sua build de estudos
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Pontos fracos ganham bonus de XP para acelerar evolucao. Pontos fortes rendem um pouco menos para incentivar equilibrio.
            </p>
          </div>
          <div className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 px-4 py-3 text-sm font-black text-fuchsia-100">
            Weak +50% XP | Strong -10% XP
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <SubjectSelector
            title="Quais materias voce tem mais dificuldade?"
            mode="weak"
            selected={weakSubjects}
            blocked={strongSubjects}
            onToggle={toggleSubject}
          />
          <SubjectSelector
            title="Quais materias voce domina melhor?"
            mode="strong"
            selected={strongSubjects}
            blocked={weakSubjects}
            onToggle={toggleSubject}
          />
        </div>

        <div className="mt-7 flex flex-col justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center">
          <p className="text-sm font-semibold text-slate-300">{helperText}</p>
          <button
            type="button"
            disabled={!canStart}
            onClick={() => configureProfile(weakSubjects, strongSubjects)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-6 text-sm font-black text-slate-950 shadow-[0_0_32px_rgba(34,211,238,0.28)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Sparkles size={18} />
            Iniciar jornada
          </button>
        </div>
      </div>
    </div>
  );
}

function SubjectSelector({
  title,
  mode,
  selected,
  blocked,
  onToggle,
}: {
  title: string;
  mode: SelectionMode;
  selected: QuestCategory[];
  blocked: QuestCategory[];
  onToggle: (subject: QuestCategory, mode: SelectionMode) => void;
}) {
  const tone =
    mode === "weak"
      ? "data-[selected=true]:border-fuchsia-300/50 data-[selected=true]:bg-fuchsia-300/15 data-[selected=true]:text-fuchsia-100"
      : "data-[selected=true]:border-cyan-300/50 data-[selected=true]:bg-cyan-300/15 data-[selected=true]:text-cyan-100";

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
      <h3 className="text-lg font-black text-white">{title}</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {subjectNames.map((subject) => {
          const isSelected = selected.includes(subject);
          const isBlocked = blocked.includes(subject);

          return (
            <button
              key={subject}
              type="button"
              disabled={isBlocked}
              data-selected={isSelected}
              onClick={() => onToggle(subject, mode)}
              className={`flex min-h-12 items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-2 text-left text-sm font-black text-slate-300 transition hover:border-cyan-200/40 disabled:cursor-not-allowed disabled:opacity-35 ${tone}`}
            >
              <span>{subject}</span>
              {isSelected ? <Check size={16} /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
