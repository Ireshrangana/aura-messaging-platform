"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { superAdminUser } from "@/lib/data";
import { useAdminSession } from "@/components/providers/admin-session";
import { Panel } from "@/components/ui/primitives";

export function AdminLogin() {
  const router = useRouter();
  const { signIn } = useAdminSession();
  const [username, setUsername] = useState<string>(superAdminUser.username);
  const [password, setPassword] = useState<string>(superAdminUser.password);
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-4xl">
        <Panel className="grid overflow-hidden lg:grid-cols-[1fr_0.9fr]">
          <div className="border-b border-white/10 p-8 lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-aura-500">Aura Admin</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Super admin control center
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-500 dark:text-slate-400">
              Separate from normal user messaging. Dedicated admin accounts use this login for monitoring users, moderation, approvals, and platform control.
            </p>
            <div className="mt-8 rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/70 px-4 py-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
              Root admin credentials:
              <div className="mt-2 font-medium">Username: {superAdminUser.username}</div>
              <div className="font-medium">Password: {superAdminUser.password}</div>
            </div>
          </div>

          <div className="p-8">
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Admin login</p>
            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                const ok = signIn(username, password);
                if (!ok) {
                  setError("Use a dedicated admin username and password to access the admin console.");
                  return;
                }
                setError("");
                router.push("/admin");
              }}
            >
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none dark:border-slate-700"
                placeholder="Admin username"
                style={{ color: "#020617", backgroundColor: "#ffffff" }}
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none dark:border-slate-700"
                placeholder="Password"
                style={{ color: "#020617", backgroundColor: "#ffffff" }}
              />
              <button className="w-full rounded-2xl bg-aura-500 px-4 py-3 text-sm font-semibold text-white shadow-soft">
                Enter admin dashboard
              </button>
              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}
            </form>

            <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
              Normal users should use <Link href="/login" className="font-medium text-aura-500">messenger login</Link>.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
