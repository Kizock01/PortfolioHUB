"use client";

import type { ArenaSettings } from "@/types/arena";
import { ActionButton } from "@/components/ui/ActionButton";

export function ArenaSetup({
  settings,
  subjects,
  onChange,
  onStart,
  loading,
  preMatch,
  rankLabel,
}: {
  settings: ArenaSettings;
  subjects: string[];
  topics: string[];
  onChange: (next: ArenaSettings) => void;
  onStart: () => void;
  loading: boolean;
  preMatch: { years: number[]; estimatedXp: number; estimatedGold: number };
  rankLabel: string;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
      <h2 className="text-xl font-black text-white">Arena X1 Alpha</h2>
      <p className="mt-1 text-sm text-slate-400">Duelo rapido contra bot academico, com perguntas curtas e fluxo estavel.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Select label="Modo" value="bot" onChange={() => undefined}>
          <option value="bot">Contra Bot Academico</option>
        </Select>

        <Select label="Materia" value={settings.subject} onChange={(value) => onChange({ ...settings, subject: value, topic: "all" })}>
          <option value="all">Geral</option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </Select>

        <Select label="Questoes" value={String(settings.questionCount)} onChange={(value) => onChange({ ...settings, questionCount: Number(value) as ArenaSettings["questionCount"] })}>
          <option value="5">5</option>
          <option value="10">10</option>
        </Select>

        <Select label="Tempo" value={String(settings.timePerQuestion)} onChange={(value) => onChange({ ...settings, timePerQuestion: Number(value) as ArenaSettings["timePerQuestion"] })}>
          <option value="10">10s</option>
          <option value="15">15s</option>
          <option value="30">30s</option>
        </Select>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-xs text-slate-300">
        <p>Materia: {settings.subject === "all" ? "Geral" : settings.subject}</p>
        <p>Adversario: Bot academico</p>
        <p>Rank atual: {rankLabel}</p>
        <p>Estimativa: {preMatch.estimatedXp} XP / {preMatch.estimatedGold} gold</p>
      </div>

      <ActionButton onClick={onStart} loading={loading} className="mt-5 h-12 px-5">
        Iniciar duelo
      </ActionButton>
    </section>
  );
}

function Select({
  label,
  children,
  value,
  onChange,
}: {
  label: string;
  children: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none transition focus:border-cyan-200/50"
      >
        {children}
      </select>
    </label>
  );
}
