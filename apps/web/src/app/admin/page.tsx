"use client";

import Link from "next/link";

import { AdminOverview } from "@/components/admin-overview";
import { useAdminSession } from "@/components/providers/admin-session";
import { Panel } from "@/components/ui/primitives";

export default function AdminPage() {
  const { isAdmin } = useAdminSession();

  if (!isAdmin) {
    return (
      <Panel className="p-8">
        <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Admin access required</p>
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          The admin console is restricted to the super admin account. Regular messenger users cannot access user control or behavior management.
        </p>
        <Link
          href="/admin/login"
          className="mt-6 inline-flex rounded-2xl bg-aura-500 px-4 py-3 text-sm font-semibold text-white shadow-soft"
        >
          Open admin login
        </Link>
      </Panel>
    );
  }

  return <AdminOverview />;
}
