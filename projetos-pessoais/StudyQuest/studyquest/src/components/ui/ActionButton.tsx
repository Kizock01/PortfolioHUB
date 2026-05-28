"use client";

export function ActionButton({
  children,
  onClick,
  disabled,
  loading,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-2xl text-sm font-black transition-transform transition-colors duration-100 active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const tone =
    variant === "ghost"
      ? "border border-white/20 text-white hover:border-cyan-200/40"
      : variant === "danger"
        ? "bg-rose-500 text-white hover:bg-rose-400"
        : "bg-cyan-300 text-slate-950 hover:bg-white";

  return (
    <button type="button" onClick={onClick} disabled={disabled || loading} className={`${base} ${tone} ${className}`}>
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Processando...
        </span>
      ) : children}
    </button>
  );
}

