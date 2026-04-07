import type { PropsWithChildren, ReactNode } from "react";

type ClassProps = PropsWithChildren<{ className?: string }>;

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function AppShell({ children, className }: ClassProps) {
  return <div className={cn("min-h-screen px-4 py-4 md:px-6 md:py-6", className)}>{children}</div>;
}

export function Panel({ children, className }: ClassProps) {
  return (
    <section
      className={cn(
        "glass rounded-4xl border border-white/50 bg-white/70 shadow-panel dark:border-white/10 dark:bg-slate-950/60",
        className
      )}
    >
      {children}
    </section>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Pill({
  children,
  active = false,
  className
}: ClassProps & {
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium",
        active
          ? "bg-aura-500 text-white shadow-soft"
          : "border border-slate-200 bg-white/80 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({ name, tone = "blue" }: { name: string; tone?: "blue" | "green" | "pink" }) {
  const styles = {
    blue: "from-aura-400 to-cyan-400",
    green: "from-emerald-400 to-teal-400",
    pink: "from-fuchsia-400 to-rose-400"
  } as const;

  return (
    <div
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white shadow-soft",
        styles[tone]
      )}
    >
      {name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")}
    </div>
  );
}

