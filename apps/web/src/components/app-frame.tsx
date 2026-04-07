"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";

import { navItems } from "@/lib/data";
import { useAdminSession } from "@/components/providers/admin-session";
import { useDemoSession } from "@/components/providers/demo-session";
import { AppShell, Avatar, Panel, Pill, cn } from "@/components/ui/primitives";

function NavIcon({ label, active = false }: { label: string; active?: boolean }) {
  const stroke = active ? "currentColor" : "currentColor";
  const className = "h-5 w-5";

  if (label === "Inbox") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className={className}>
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
        <path d="M7 9.5h10" />
        <path d="M7 13h7" />
      </svg>
    );
  }

  if (label === "Stories") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className={className}>
        <circle cx="12" cy="12" r="7.5" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  if (label === "Calls") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className={className}>
        <path d="M8.5 5.5c.8-.7 2-.6 2.7.2l1.2 1.4c.6.7.7 1.8.2 2.6l-.7 1.1a1.6 1.6 0 0 0 .2 2c1 1.2 2.1 2.3 3.3 3.3.6.5 1.5.6 2 .2l1.1-.7c.8-.5 1.9-.4 2.6.2l1.4 1.2c.8.7.9 1.9.2 2.7l-.8.9c-.8.9-2 1.3-3.1 1-2.8-.7-5.5-2.2-7.8-4.5S6.2 11 5.5 8.2c-.3-1.1.1-2.3 1-3.1z" />
      </svg>
    );
  }

  if (label === "Profile") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className={className}>
        <circle cx="12" cy="8.5" r="3.5" />
        <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
      </svg>
    );
  }

  if (label === "Settings") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className={className}>
        <path d="M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z" />
        <path d="M19.4 15.1a1 1 0 0 0 .2 1.1l.1.1a1.2 1.2 0 0 1 0 1.7l-1 1a1.2 1.2 0 0 1-1.7 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9v.3a1.2 1.2 0 0 1-1.2 1.2h-1.4a1.2 1.2 0 0 1-1.2-1.2v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a1.2 1.2 0 0 1-1.7 0l-1-1a1.2 1.2 0 0 1 0-1.7l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6h-.2A1.2 1.2 0 0 1 3 13.4V12a1.2 1.2 0 0 1 1.2-1.2h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a1.2 1.2 0 0 1 0-1.7l1-1a1.2 1.2 0 0 1 1.7 0l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9v-.2A1.2 1.2 0 0 1 11.2 3h1.4a1.2 1.2 0 0 1 1.2 1.2v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1.2 1.2 0 0 1 1.7 0l1 1a1.2 1.2 0 0 1 0 1.7l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.3A1.2 1.2 0 0 1 21 12v1.4a1.2 1.2 0 0 1-1.2 1.2h-.3a1 1 0 0 0-.9.5Z" />
      </svg>
    );
  }

  if (label === "Admin") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className={className}>
        <path d="M12 3l7 3.5v5.2c0 4.2-2.9 7.9-7 9.3-4.1-1.4-7-5.1-7-9.3V6.5z" />
        <path d="M9.5 12.2 11 13.7l3.8-3.9" />
      </svg>
    );
  }

  return null;
}

function getPageLabel(pathname: string) {
  const active = navItems.find((item) => item.href === pathname);
  return active?.label ?? "Inbox";
}

export function AppFrame({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useDemoSession();
  const { isAdmin, adminAccount, signOut: signOutAdmin } = useAdminSession();
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/admin/login";
  const isAdminConsolePage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const pageLabel = getPageLabel(pathname);
  const visibleNavItems = navItems.filter((item) => item.href !== "/admin" || isAdmin);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isAdminConsolePage) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1600px] space-y-4">
          <Panel className="p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-aura-500">Aura Admin</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  Super admin operations console
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Separate from user messaging. This space is only for monitoring users, reviewing approvals, moderation, and platform control.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Pill active>{adminAccount?.role?.replace("_", " ") ?? "admin"}</Pill>
                <button
                  type="button"
                  onClick={() => {
                    signOutAdmin();
                    router.push("/admin/login");
                  }}
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200"
                >
                  Admin out
                </button>
              </div>
            </div>
          </Panel>

          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <Panel className="p-4">
              <nav className="space-y-2">
                <Link
                  href={"/admin" as Route}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition",
                    pathname === "/admin"
                      ? "bg-aura-500 text-white shadow-soft"
                      : "text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/80 dark:hover:text-slate-50"
                  )}
                >
                  <span>Dashboard</span>
                  <span>Ops</span>
                </Link>
              </nav>
              <div className="mt-6 rounded-3xl border border-dashed border-white/10 px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="font-medium text-slate-700 dark:text-slate-200">{adminAccount?.name ?? "Admin account"}</div>
                <div className="mt-1">{adminAccount?.username ?? "ops-account"}</div>
                <div className="mt-3">
                Admin scope:
                <div className="mt-2">User behavior control</div>
                <div>Password approvals</div>
                <div>Reports and moderation</div>
                <div>Analytics and audit</div>
                </div>
              </div>
            </Panel>

            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 pb-24 lg:pb-0">
        <Panel className="hidden lg:block lg:p-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.6rem] bg-gradient-to-br from-aura-400 via-aura-500 to-cyan-400 text-xl font-semibold text-white shadow-soft">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-6 w-6">
                  <path d="M12 4 5 7.5v4.2c0 3.4 2.3 6.4 7 8.3 4.7-1.9 7-4.9 7-8.3V7.5z" />
                  <path d="M9.5 12.5 11.2 14l3.5-3.8" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-aura-500">Aura</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Premium messaging workspace</p>
              </div>
            </div>

            <nav className="flex flex-1 items-center justify-center">
              <div className="flex items-center gap-2 rounded-[1.8rem] border border-white/50 bg-white/55 px-3 py-2 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/55">
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href as Route}
                    className={cn(
                      "group flex items-center gap-2 rounded-[1.25rem] px-4 py-2.5 text-sm font-medium transition",
                      pathname === item.href
                        ? "border border-white/40 bg-white/18 text-white shadow-soft backdrop-blur-xl dark:border-white/15 dark:bg-white/10"
                        : "text-slate-500 hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl transition",
                        pathname === item.href
                          ? "bg-white/16 text-white ring-1 ring-white/10"
                          : "bg-slate-100 text-slate-600 group-hover:bg-white dark:bg-slate-950 dark:text-slate-300 dark:group-hover:bg-slate-700"
                      )}
                    >
                      <NavIcon label={item.label} active={pathname === item.href} />
                    </span>
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          pathname === item.href
                            ? "bg-white/14 text-white"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-300"
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/50 bg-white/55 px-3 py-2 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/55">
                <Avatar name={user.name} />
                <div className="hidden xl:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{pageLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  router.push("/login");
                }}
                className="rounded-[1.2rem] border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-soft transition hover:bg-white dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
              >
                Sign out
              </button>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => {
                    signOutAdmin();
                    router.push("/admin/login");
                  }}
                  className="rounded-[1.2rem] border border-rose-200 bg-rose-50/90 px-4 py-2.5 text-sm font-medium text-rose-700 shadow-soft transition hover:bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200"
                >
                  Admin out
                </button>
              ) : null}
            </div>
          </div>
        </Panel>

        <Panel className="glass p-4 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-aura-500">Aura</p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{pageLabel}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Avatar name={user.name} />
              <button
                type="button"
                onClick={() => {
                  signOut();
                  router.push("/login");
                }}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                Sign out
              </button>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => {
                    signOutAdmin();
                    router.push("/admin/login");
                  }}
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200"
                >
                  Admin out
                </button>
              ) : null}
            </div>
          </div>
        </Panel>

        <div className="flex flex-col gap-4">
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>

      <div className="fixed inset-x-4 bottom-4 z-50 lg:hidden">
        <Panel className="glass p-2">
          <nav
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${visibleNavItems.length}, minmax(0, 1fr))` }}
          >
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href as Route}
                className={cn(
                  "flex flex-col items-center justify-center rounded-[1.25rem] px-2 py-2 text-[11px] font-medium transition",
                  pathname === item.href
                    ? "border border-white/35 bg-white/15 text-white shadow-soft backdrop-blur-xl dark:border-white/15 dark:bg-white/10"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-900 dark:hover:bg-slate-900/70 dark:hover:text-slate-50"
                )}
              >
                <span
                  className={cn(
                    "mb-1 flex h-8 w-8 items-center justify-center rounded-xl",
                    pathname === item.href ? "bg-white/16 ring-1 ring-white/10" : "bg-slate-100 dark:bg-slate-900"
                  )}
                >
                  <NavIcon label={item.label} active={pathname === item.href} />
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </Panel>
      </div>
    </AppShell>
  );
}
