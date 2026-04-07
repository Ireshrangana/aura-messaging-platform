import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";

import { Panel, Pill } from "@/components/ui/primitives";

export function AuthShell({
  mode,
  title,
  subtitle,
  children,
  alternateAction
}: PropsWithChildren<{
  mode: "login" | "signup";
  title: string;
  subtitle: string;
  alternateAction: ReactNode;
}>) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 md:px-6 md:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.20),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.16),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(15,23,42,1))]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1380px] gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Panel className="relative overflow-hidden border-white/12 bg-white/8 p-6 backdrop-blur-2xl md:p-8 lg:p-10 dark:bg-white/6">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-aura-500/20 to-transparent" />
          <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-aura-500/12 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl border border-white/12 bg-white/10 text-lg font-semibold text-white shadow-soft backdrop-blur-xl">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-6 w-6">
                  <path d="M12 4 5 7.5v4.2c0 3.4 2.3 6.4 7 8.3 4.7-1.9 7-4.9 7-8.3V7.5z" />
                  <path d="M9.5 12.5 11.2 14l3.5-3.8" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-aura-500">Aura</p>
                <p className="text-sm text-slate-300">Private messaging, upgraded</p>
              </div>
            </Link>

            <div className="mt-10 max-w-xl">
              <Pill active className="border border-white/12 bg-white/10 text-white shadow-soft backdrop-blur-xl">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </Pill>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">{subtitle}</p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/12 bg-white/8 p-4 shadow-soft backdrop-blur-xl">
                <p className="text-sm font-semibold text-white">AI assistance</p>
                <p className="mt-2 text-sm text-slate-300">Summaries, smart replies, rewrite, and translation.</p>
              </div>
              <div className="rounded-3xl border border-white/12 bg-white/8 p-4 shadow-soft backdrop-blur-xl">
                <p className="text-sm font-semibold text-white">Security first</p>
                <p className="mt-2 text-sm text-slate-300">Trusted devices, audit logs, and 2FA-ready onboarding.</p>
              </div>
              <div className="rounded-3xl border border-white/12 bg-white/8 p-4 shadow-soft backdrop-blur-xl">
                <p className="text-sm font-semibold text-white">Cross-device</p>
                <p className="mt-2 text-sm text-slate-300">Phone-first flow with clean desktop continuation.</p>
              </div>
            </div>

            <div className="mt-10 rounded-[2rem] border border-white/12 bg-white/6 p-5 shadow-panel backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/10 font-semibold text-white">MC</div>
                <div>
                  <p className="text-sm font-semibold text-white">Maya Chen</p>
                  <p className="text-xs text-emerald-400">online • encrypted</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="max-w-sm rounded-[1.75rem] border border-white/10 bg-white/8 px-4 py-3 text-sm text-slate-100 backdrop-blur-xl">
                  Can you summarize the unread updates before I join the call?
                </div>
                <div className="ml-auto max-w-sm rounded-[1.75rem] border border-aura-300/20 bg-aura-500/86 px-4 py-3 text-sm text-white shadow-soft backdrop-blur-xl">
                  Three updates: legal review at 3 PM, Arabic CTA still pending, and launch assets are approved.
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="flex items-center border-white/12 bg-white/8 p-4 backdrop-blur-2xl sm:p-6 lg:p-10 dark:bg-white/6">
          <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/12 bg-white/10 p-6 shadow-panel backdrop-blur-2xl sm:p-8">
            {children}
            <div className="mt-8 border-t border-white/10 pt-6 text-sm text-slate-300">
              {alternateAction}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
