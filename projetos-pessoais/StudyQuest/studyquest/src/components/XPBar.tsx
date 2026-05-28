type XPBarProps = {
  current: number;
  required: number;
  label?: string;
};

export function XPBar({ current, required, label = "XP" }: XPBarProps) {
  const percentage = Math.min(Math.round((current / required) * 100), 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.2em] text-slate-300">
        <span>{label}</span>
        <span>
          {current} / {required}
        </span>
      </div>
      <div className="relative h-5 overflow-hidden rounded-full border border-cyan-200/30 bg-slate-950/90 shadow-[inset_0_0_18px_rgba(15,23,42,0.95),0_0_28px_rgba(34,211,238,0.16)]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)]" />
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 shadow-[0_0_26px_rgba(34,211,238,0.68)] transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        >
          <div className="h-full w-full bg-[linear-gradient(135deg,rgba(255,255,255,0.34)_0_12%,transparent_12%_50%,rgba(255,255,255,0.2)_50%_62%,transparent_62%)] bg-[length:28px_28px]" />
        </div>
      </div>
      <p className="text-xs font-bold text-cyan-100">{percentage}% ate o proximo nivel</p>
    </div>
  );
}
