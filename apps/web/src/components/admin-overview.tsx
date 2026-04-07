"use client";

import { useEffect, useState } from "react";

import {
  ADMIN_BEHAVIOR_ACTIONS_STORAGE_KEY,
  ADMIN_GROUP_CONTROLS_STORAGE_KEY,
  ADMIN_USER_CONTROLS_STORAGE_KEY,
  PASSWORD_CHANGE_REQUESTS_STORAGE_KEY,
  baseChats,
  getStoredAdminAccounts,
  getStoredAdminBehaviorActions,
  getStoredAdminGroupControls,
  getStoredAdminUserControls,
  getStoredDemoUsers,
  getStoredPasswordChangeRequests,
  saveStoredAdminAccounts,
  saveStoredDemoUsers,
  saveStoredAdminBehaviorActions,
  saveStoredAdminGroupControls,
  saveStoredAdminUserControls,
  saveStoredPasswordChangeRequests,
  superAdminUser,
  type AdminAccount,
  type AdminBehaviorActionRecord,
  type AdminGroupControlState,
  type AdminUserControlState,
  type BehaviorActionType,
  type DemoUser
} from "@/lib/data";
import { Avatar, Panel, Pill, SectionTitle, cn } from "@/components/ui/primitives";

const API_BASE = "http://127.0.0.1:4000";

interface OverviewResponse {
  totalUsers: number;
  activeUsers: number;
  onlineUsers: number;
  dailyMessageVolume: number;
  dailyActiveChats: number;
  flaggedMessages: number;
  abuseReports: number;
  blockedUsers: number;
  storageUsageGb: number;
  aiUsageToday: number;
  recentIncidents: string[];
}

interface ReportItem {
  id: string;
  category: string;
  status: string;
  reporter: string;
  target: string;
  reason: string;
}

interface AnalyticsResponse {
  dau: number[];
  mau: number[];
  messageVolume: number[];
  aiUsage: number[];
}

interface AuditLogItem {
  id: string;
  actor: string;
  action: string;
  resource: string;
  createdAt: string;
}

interface PasswordHistoryItem {
  id: string;
  action: string;
  rationale: string;
  createdAt: string;
  actor: string;
}

const behaviorControls: Array<{
  title: BehaviorActionType;
  description: string;
  targetType: "user" | "group";
  tone: string;
}> = [
  {
    title: "Suspend user",
    description: "Temporarily disable messaging, stories, calls, and device access without deleting account data.",
    targetType: "user",
    tone: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200"
  },
  {
    title: "Ban user",
    description: "Block all platform access and mark the account for abuse escalation or legal review.",
    targetType: "user",
    tone: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200"
  },
  {
    title: "Reactivate user",
    description: "Restore access after review, return the account to active state, and remove messaging restrictions.",
    targetType: "user",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200"
  },
  {
    title: "Force logout",
    description: "Immediately revoke all refresh sessions and signed-in devices for a targeted account.",
    targetType: "user",
    tone: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/40 dark:bg-cyan-950/20 dark:text-cyan-200"
  },
  {
    title: "Reset linked sessions",
    description: "Remove trusted devices and require new login verification on next access.",
    targetType: "user",
    tone: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-200"
  },
  {
    title: "Mute or freeze group",
    description: "Stop group activity during harassment, spam, phishing, or raid-like behavior.",
    targetType: "group",
    tone: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-900/40 dark:bg-fuchsia-950/20 dark:text-fuchsia-200"
  },
  {
    title: "Add internal note",
    description: "Attach moderation context for support agents, analysts, and future reviewers.",
    targetType: "user",
    tone: "border-lime-200 bg-lime-50 text-lime-700 dark:border-lime-900/40 dark:bg-lime-950/20 dark:text-lime-200"
  }
];

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function formatActionTime(timestamp: number | string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

export function AdminOverview() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(getStoredAdminAccounts());
  const [selectedControl, setSelectedControl] = useState(behaviorControls[0]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("chat_2");
  const [rationale, setRationale] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<"all" | "active" | "suspended" | "banned">("all");
  const [userControls, setUserControls] = useState<Record<string, AdminUserControlState>>({});
  const [groupControls, setGroupControls] = useState<Record<string, AdminGroupControlState>>({});
  const [behaviorActions, setBehaviorActions] = useState<AdminBehaviorActionRecord[]>([]);
  const [passwordRequests, setPasswordRequests] = useState(getStoredPasswordChangeRequests());
  const [passwordHistory, setPasswordHistory] = useState<PasswordHistoryItem[]>([]);
  const [adminAccountForm, setAdminAccountForm] = useState({
    name: "",
    username: "",
    role: "moderator" as AdminAccount["role"],
    password: ""
  });
  const [actionFeedback, setActionFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [overviewRes, reportsRes, analyticsRes, auditRes, adminAccountsRes, passwordRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/dashboard/overview`),
          fetch(`${API_BASE}/api/admin/reports`),
          fetch(`${API_BASE}/api/admin/analytics/usage`),
          fetch(`${API_BASE}/api/admin/audit-logs`),
          fetch(`${API_BASE}/api/admin/admin-accounts`),
          fetch(`${API_BASE}/api/admin/password-requests`)
        ]);

        if (!overviewRes.ok || !reportsRes.ok || !analyticsRes.ok || !auditRes.ok || !adminAccountsRes.ok || !passwordRes.ok) {
          throw new Error("Failed to load admin backend preview data.");
        }

        const [overviewJson, reportsJson, analyticsJson, auditJson, adminAccountsJson, passwordJson] = await Promise.all([
          overviewRes.json(),
          reportsRes.json(),
          analyticsRes.json(),
          auditRes.json(),
          adminAccountsRes.json(),
          passwordRes.json()
        ]);

        if (!mounted) return;

        setOverview(overviewJson as OverviewResponse);
        setReports((reportsJson.items ?? []) as ReportItem[]);
        setAnalytics(analyticsJson as AnalyticsResponse);
        setAuditLogs((auditJson.items ?? []) as AuditLogItem[]);
        setAdminAccounts((adminAccountsJson.items ?? []) as AdminAccount[]);
        if (getStoredPasswordChangeRequests().length === 0) {
          setPasswordRequests((passwordJson.items ?? []) as typeof passwordRequests);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Unable to load admin data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const users = getStoredDemoUsers();
    setDemoUsers(users);
    setSelectedUserId(users[0]?.id ?? "");
    setUserControls(getStoredAdminUserControls());
    setGroupControls(getStoredAdminGroupControls());
    setBehaviorActions(getStoredAdminBehaviorActions());
    setPasswordRequests(getStoredPasswordChangeRequests());
    setAdminAccounts(getStoredAdminAccounts());

    const syncAdminState = (event: StorageEvent) => {
      if (event.key === ADMIN_USER_CONTROLS_STORAGE_KEY) {
        setUserControls(getStoredAdminUserControls());
      }

      if (event.key === ADMIN_GROUP_CONTROLS_STORAGE_KEY) {
        setGroupControls(getStoredAdminGroupControls());
      }

      if (event.key === ADMIN_BEHAVIOR_ACTIONS_STORAGE_KEY) {
        setBehaviorActions(getStoredAdminBehaviorActions());
      }

      if (event.key === PASSWORD_CHANGE_REQUESTS_STORAGE_KEY) {
        setPasswordRequests(getStoredPasswordChangeRequests());
      }

      if (event.key === "aura-admin-accounts") {
        setAdminAccounts(getStoredAdminAccounts());
      }
    };

    window.addEventListener("storage", syncAdminState);
    return () => {
      window.removeEventListener("storage", syncAdminState);
    };
  }, []);

  useEffect(() => {
    if (!actionFeedback) return;

    const timeout = window.setTimeout(() => {
      setActionFeedback("");
    }, 3200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [actionFeedback]);

  const metrics = overview
    ? [
        { label: "Total users", value: formatCompactNumber(overview.totalUsers) },
        { label: "Active users", value: formatCompactNumber(overview.activeUsers) },
        { label: "Online now", value: formatCompactNumber(overview.onlineUsers) },
        { label: "Messages today", value: formatCompactNumber(overview.dailyMessageVolume) }
      ]
    : [];
  const groups = baseChats.filter((chat) => chat.kind === "group");
  const filteredUsers = demoUsers.filter((user) => {
    const status = userControls[user.id]?.status ?? "active";
    const matchesQuery =
      userQuery.length === 0 ||
      user.name.toLowerCase().includes(userQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(userQuery.toLowerCase()) ||
      user.phone.toLowerCase().includes(userQuery.toLowerCase());
    const matchesStatus = userStatusFilter === "all" || status === userStatusFilter;
    return matchesQuery && matchesStatus;
  });
  const selectedTargetName =
    selectedControl.targetType === "user"
      ? demoUsers.find((user) => user.id === selectedUserId)?.name ?? "Selected user"
      : groups.find((group) => group.id === selectedGroupId)?.name ?? "Selected group";
  const canSubmit =
    selectedControl.targetType === "user"
      ? Boolean(selectedUserId && rationale.trim())
      : Boolean(selectedGroupId && rationale.trim());

  useEffect(() => {
    if (!selectedUserId && filteredUsers[0]) {
      setSelectedUserId(filteredUsers[0].id);
    }
  }, [filteredUsers, selectedUserId]);

  useEffect(() => {
    if (!selectedUserId) return;

    fetch(`${API_BASE}/api/admin/users/${selectedUserId}/password-history`)
      .then((response) => (response.ok ? response.json() : Promise.resolve({ items: [] })))
      .then((data) => {
        setPasswordHistory((data.items ?? []) as PasswordHistoryItem[]);
      })
      .catch(() => {
        setPasswordHistory([]);
      });
  }, [selectedUserId, actionFeedback]);

  const handleExecuteControl = () => {
    if (!canSubmit) return;

    const nextTimestamp = Date.now();
    const nextRationale = rationale.trim();

    if (selectedControl.targetType === "user") {
      const nextControls = { ...userControls };
      const currentControl =
        nextControls[selectedUserId] ??
        ({
          userId: selectedUserId,
          status: "active",
          noteCount: 0
        } satisfies AdminUserControlState);

      const nextUserState: AdminUserControlState = { ...currentControl, lastActionAt: nextTimestamp };

      if (selectedControl.title === "Suspend user") nextUserState.status = "suspended";
      if (selectedControl.title === "Ban user") nextUserState.status = "banned";
      if (selectedControl.title === "Reactivate user") {
        nextUserState.status = "active";
        nextUserState.forceLogoutAt = undefined;
        nextUserState.sessionsResetAt = undefined;
      }
      if (selectedControl.title === "Force logout") nextUserState.forceLogoutAt = nextTimestamp;
      if (selectedControl.title === "Reset linked sessions") nextUserState.sessionsResetAt = nextTimestamp;
      if (selectedControl.title === "Add internal note") nextUserState.noteCount += 1;

      nextControls[selectedUserId] = nextUserState;
      setUserControls(nextControls);
      saveStoredAdminUserControls(nextControls);
    } else {
      const nextControls = { ...groupControls };
      const currentControl =
        nextControls[selectedGroupId] ??
        ({
          groupId: selectedGroupId,
          mode: "active",
          noteCount: 0
        } satisfies AdminGroupControlState);

      const nextGroupState: AdminGroupControlState = {
        ...currentControl,
        lastActionAt: nextTimestamp,
        mode: currentControl.mode === "frozen" ? "muted" : "frozen"
      };

      nextControls[selectedGroupId] = nextGroupState;
      setGroupControls(nextControls);
      saveStoredAdminGroupControls(nextControls);
    }

    const nextAction: AdminBehaviorActionRecord = {
      id: `behavior_${nextTimestamp}`,
      action: selectedControl.title,
      targetType: selectedControl.targetType,
      targetId: selectedControl.targetType === "user" ? selectedUserId : selectedGroupId,
      targetName: selectedTargetName,
      rationale: nextRationale,
      createdAt: nextTimestamp,
      actor: superAdminUser.name,
      outcome:
        selectedControl.title === "Suspend user"
          ? "User access suspended"
          : selectedControl.title === "Ban user"
            ? "User permanently blocked"
            : selectedControl.title === "Reactivate user"
              ? "User access restored"
              : selectedControl.title === "Force logout"
                ? "All active sessions revoked"
                : selectedControl.title === "Reset linked sessions"
                ? "Trusted devices cleared"
                : selectedControl.title === "Mute or freeze group"
                  ? "Group restrictions updated"
                  : "Internal moderation note saved"
    };

    const nextActions = [nextAction, ...behaviorActions].slice(0, 10);
    setBehaviorActions(nextActions);
    saveStoredAdminBehaviorActions(nextActions);

    if (selectedControl.targetType === "user") {
      fetch(`${API_BASE}/api/admin/users/${selectedUserId}/actions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: selectedControl.title,
          rationale: nextRationale,
          actor: superAdminUser.name
        })
      }).catch(() => {
        // Preview endpoint is best-effort for the demo.
      });
    }

    setActionFeedback(`${selectedControl.title} applied to ${selectedTargetName}.`);
    setRationale("");
  };

  const reviewPasswordRequest = (requestId: string, decision: "approved" | "rejected") => {
    const nextReviewedAt = Date.now();
    const nextRequests = passwordRequests.map((request) =>
      request.id === requestId
        ? {
            ...request,
            status: decision,
            reviewedAt: nextReviewedAt,
            reviewer: superAdminUser.name
          }
        : request
    );

    const reviewedRequest = nextRequests.find((item) => item.id === requestId);
    if (!reviewedRequest) return;

    if (decision === "approved") {
      const users = getStoredDemoUsers();
      const nextUsers = users.map((user) =>
        user.id === reviewedRequest.userId ? { ...user, password: reviewedRequest.requestedPassword } : user
      );
      saveStoredDemoUsers(nextUsers);
      setDemoUsers(nextUsers);
    }

    setPasswordRequests(nextRequests);
    saveStoredPasswordChangeRequests(nextRequests);
    fetch(`${API_BASE}/api/admin/password-requests/${requestId}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        decision,
        actor: superAdminUser.name,
        rationale:
          decision === "approved"
            ? "Password request approved after admin verification."
            : "Password request rejected by admin review."
      })
    }).catch(() => {
      // Preview endpoint is best-effort for the demo.
    });
    setActionFeedback(
      `${decision === "approved" ? "Approved" : "Rejected"} password change for ${reviewedRequest.userName}.`
    );
  };

  const createAdminAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!adminAccountForm.name.trim() || !adminAccountForm.username.trim() || !adminAccountForm.password.trim()) {
      setActionFeedback("Admin name, username, and password are required.");
      return;
    }

    const nextAccount: AdminAccount = {
      id: `admin_${Date.now()}`,
      name: adminAccountForm.name.trim(),
      username: adminAccountForm.username.trim().toLowerCase(),
      email: `${adminAccountForm.username.trim().toLowerCase()}@aura-admin.app`,
      password: adminAccountForm.password,
      role: adminAccountForm.role,
      status: "active",
      createdAt: Date.now()
    };

    const nextAccounts = [nextAccount, ...getStoredAdminAccounts()];
    saveStoredAdminAccounts(nextAccounts);
    setAdminAccounts(nextAccounts);

    fetch(`${API_BASE}/api/admin/admin-accounts`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: nextAccount.name,
        username: nextAccount.username,
        role: nextAccount.role
      })
    }).catch(() => {
      // Preview endpoint is best-effort for the demo.
    });

    setAdminAccountForm({
      name: "",
      username: "",
      role: "moderator",
      password: ""
    });
    setActionFeedback(`Created ${nextAccount.role.replace("_", " ")} account ${nextAccount.username}.`);
  };

  return (
    <div className="space-y-4">
      <Panel className="p-6">
        <SectionTitle
          title="Admin and moderation console"
          subtitle="Live overview from the backend preview running on the local admin API."
          action={<Pill active>{loading ? "Loading" : "Live backend"}</Pill>}
        />

        {error ? (
          <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {(loading ? new Array(4).fill(null) : metrics).map((metric, index) => (
            <div
              key={metric?.label ?? `metric-skeleton-${index}`}
              className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80"
            >
              <p className="text-sm text-slate-500 dark:text-slate-400">{metric?.label ?? "Loading..."}</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-50">{metric?.value ?? "..."}</p>
            </div>
          ))}
        </div>

        {overview ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Recent incidents</p>
              <div className="mt-4 space-y-3">
                {overview.recentIncidents.map((incident) => (
                  <div key={incident} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                    {incident}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Platform snapshot</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  Flagged messages: {overview.flaggedMessages}
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  Abuse reports: {overview.abuseReports}
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  Blocked users: {overview.blockedUsers}
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  Storage used: {overview.storageUsageGb} GB
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300 sm:col-span-2">
                  AI usage today: {formatCompactNumber(overview.aiUsageToday)}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Panel>

      <Panel className="p-6">
        <SectionTitle
          title="Super admin user behavior control"
          subtitle="High-impact control surface for user safety, session integrity, and platform abuse response."
          action={<Pill active>Super admin only</Pill>}
        />
        {actionFeedback ? (
          <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
            {actionFeedback}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {behaviorControls.map((control) => (
            <div
              key={control.title}
              className={cn(
                "rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft transition dark:border-white/10 dark:bg-slate-900/80",
                selectedControl.title === control.title && "ring-2 ring-aura-400/70"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{control.title}</p>
                <span className={cn("rounded-full border px-3 py-1 text-[11px] font-medium", control.tone)}>
                  {control.targetType}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{control.description}</p>
              <button
                type="button"
                onClick={() => setSelectedControl(control)}
                className={cn(
                  "mt-4 rounded-2xl border px-4 py-2 text-sm font-medium transition",
                  selectedControl.title === control.title
                    ? "border-aura-400 bg-aura-500 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                )}
              >
                {selectedControl.title === control.title ? "Selected" : "Open control"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{selectedControl.title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Choose a target, add context, then apply the action immediately.
                </p>
              </div>
              <Pill active>{selectedControl.targetType === "user" ? "User action" : "Group action"}</Pill>
            </div>

            <div className="mt-5 space-y-4">
              {selectedControl.targetType === "user" ? (
                <>
                  <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Search user</span>
                      <input
                        value={userQuery}
                        onChange={(event) => setUserQuery(event.target.value)}
                        placeholder="Search by name, email, or phone"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-aura-400 dark:border-slate-700 dark:bg-white"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Filter status</span>
                      <select
                        value={userStatusFilter}
                        onChange={(event) => setUserStatusFilter(event.target.value as typeof userStatusFilter)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-aura-400 dark:border-slate-700 dark:bg-white"
                      >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Target user</span>
                    <select
                      value={selectedUserId}
                      onChange={(event) => setSelectedUserId(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-aura-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
                    >
                      {filteredUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              ) : (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Target group</span>
                  <select
                    value={selectedGroupId}
                    onChange={(event) => setSelectedGroupId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-aura-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
                  >
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Reason and internal context</span>
                <textarea
                  value={rationale}
                  onChange={(event) => setRationale(event.target.value)}
                  placeholder="Document what happened, why this action is needed, and what the next reviewer should know."
                  className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-aura-400 dark:border-slate-700 dark:bg-white dark:text-slate-950 dark:placeholder:text-slate-500"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleExecuteControl}
                  disabled={!canSubmit}
                  className="rounded-2xl bg-aura-500 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-aura-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Apply action
                </button>
                <button
                  type="button"
                  onClick={() => setRationale("")}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                >
                  Clear note
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Controlled entities</p>
            <div className="mt-4 space-y-3">
              {filteredUsers.map((user) => {
                const state = userControls[user.id];
                return (
                  <div key={user.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={user.name} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">{user.name}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {state?.status === "banned"
                            ? "Banned"
                            : state?.status === "suspended"
                              ? "Suspended"
                              : "Active"}{" "}
                          • notes {state?.noteCount ?? 0}
                        </p>
                      </div>
                    </div>
                    <Pill
                      active={state?.status === "active" || !state}
                      className={
                        state?.status === "banned"
                          ? "bg-rose-100 text-rose-700"
                          : state?.status === "suspended"
                            ? "bg-amber-100 text-amber-700"
                            : ""
                      }
                    >
                      {state?.status ?? "active"}
                    </Pill>
                  </div>
                );
              })}

              {selectedControl.targetType === "user" && filteredUsers.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                  No users match this search/filter yet.
                </div>
              ) : null}

              {groups.map((group) => {
                const state = groupControls[group.id];
                return (
                  <div key={group.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">{group.name}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">Group mode and safety posture</p>
                    </div>
                    <Pill active={state?.mode === "active" || !state} className={state?.mode === "frozen" ? "bg-rose-100 text-rose-700" : state?.mode === "muted" ? "bg-amber-100 text-amber-700" : ""}>
                      {state?.mode ?? "active"}
                    </Pill>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Recent control actions</p>
          <div className="mt-4 space-y-3">
            {behaviorActions.length > 0 ? (
              behaviorActions.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-slate-800 dark:text-slate-100">
                      {item.action} • {item.targetName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{formatActionTime(item.createdAt)}</div>
                  </div>
                  <div className="mt-1 text-slate-500 dark:text-slate-400">{item.outcome}</div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {item.actor} logged: {item.rationale}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                No super admin actions yet. Pick a control and apply it to a user or group.
              </div>
            )}
          </div>
        </div>
      </Panel>

      <Panel className="p-6">
        <SectionTitle
          title="Password approval queue"
          subtitle="Users can request a new password from profile, but only the super admin can approve or reject it."
          action={<Pill active>{passwordRequests.filter((item) => item.status === "pending").length} pending</Pill>}
        />
        <div className="mt-5 space-y-3">
          {passwordRequests.length > 0 ? (
            passwordRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{request.userName}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{request.email}</p>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                      Requested password update from profile settings.
                    </p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Requested: {formatActionTime(request.requestedAt)}
                      {request.reviewedAt ? ` • Reviewed: ${formatActionTime(request.reviewedAt)}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill
                      active={request.status === "approved"}
                      className={
                        request.status === "pending"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200"
                          : request.status === "rejected"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200"
                            : ""
                      }
                    >
                      {request.status}
                    </Pill>
                    {request.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => reviewPasswordRequest(request.id, "approved")}
                          className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => reviewPasswordRequest(request.id, "rejected")}
                          className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white"
                        >
                          Reject
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-sm text-slate-400 dark:border-slate-700">
              No password approval requests yet.
            </div>
          )}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel className="p-6">
          <SectionTitle
            title="Password audit history"
            subtitle="Per-user approval history for password changes and review decisions."
            action={<Pill active>{selectedTargetName}</Pill>}
          />
          <div className="mt-5 space-y-3">
            {passwordHistory.length > 0 ? (
              passwordHistory.map((item) => (
                <div key={item.id} className="rounded-3xl border border-white/50 bg-white/80 p-4 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{item.action}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatActionTime(item.createdAt)}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.rationale}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Reviewer: {item.actor}</p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-sm text-slate-400 dark:border-slate-700">
                No password audit history for this user yet.
              </div>
            )}
          </div>
        </Panel>

        <Panel className="p-6">
          <SectionTitle
            title="Admin account management"
            subtitle="Create sub-admin and moderator accounts for ops workflows without mixing them into messenger users."
            action={<Pill active>{adminAccounts.length} admin accounts</Pill>}
          />
          <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={createAdminAccount}>
            <input
              value={adminAccountForm.name}
              onChange={(event) => setAdminAccountForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Admin name"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-aura-400 dark:border-slate-700 dark:bg-white"
            />
            <input
              value={adminAccountForm.username}
              onChange={(event) => setAdminAccountForm((current) => ({ ...current, username: event.target.value }))}
              placeholder="Admin username"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-aura-400 dark:border-slate-700 dark:bg-white"
            />
            <select
              value={adminAccountForm.role}
              onChange={(event) => setAdminAccountForm((current) => ({ ...current, role: event.target.value as AdminAccount["role"] }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-aura-400 dark:border-slate-700 dark:bg-white"
            >
              <option value="sub_admin">Sub-admin</option>
              <option value="moderator">Moderator</option>
            </select>
            <input
              value={adminAccountForm.password}
              onChange={(event) => setAdminAccountForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Temporary password"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-aura-400 dark:border-slate-700 dark:bg-white"
            />
            <button className="rounded-2xl bg-aura-500 px-4 py-3 text-sm font-semibold text-white shadow-soft md:col-span-2">
              Create admin account
            </button>
          </form>
          <div className="mt-5 space-y-3">
            {adminAccounts.map((account) => (
              <div key={account.id} className="rounded-3xl border border-white/50 bg-white/80 p-4 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{account.name}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {account.username} • {account.role.replace("_", " ")}
                    </p>
                  </div>
                  <Pill active={account.role === "super_admin"}>{account.status}</Pill>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel className="p-6">
          <SectionTitle title="Moderation queue" subtitle="Reported content pulled from the backend preview report feed." />
          <div className="mt-5 space-y-3">
            {(loading ? new Array(2).fill(null) : reports).map((item, index) => (
              <div
                key={item?.id ?? `report-skeleton-${index}`}
                className="rounded-3xl border border-white/50 bg-white/80 p-4 shadow-soft dark:border-white/10 dark:bg-slate-900/80"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {item ? `${item.category} • ${item.target}` : "Loading report..."}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {item ? `${item.reason} — reported by ${item.reporter}` : "..."}
                    </p>
                  </div>
                  <Pill active={item?.status === "open"} className={item?.status === "reviewing" ? "bg-amber-100 text-amber-700" : ""}>
                    {item?.status ?? "pending"}
                  </Pill>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-6">
          <SectionTitle title="Analytics and audit" subtitle="Usage trends and recent admin actions from the backend preview." />
          <div className="mt-5 space-y-4">
            <div className="rounded-3xl border border-white/50 bg-white/80 p-4 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Usage trends</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  DAU: {analytics ? analytics.dau.join(" • ") : "..."}
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  MAU: {analytics ? analytics.mau.join(" • ") : "..."}
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  Message volume: {analytics ? analytics.messageVolume.join(" • ") : "..."}
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  AI usage: {analytics ? analytics.aiUsage.join(" • ") : "..."}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/50 bg-white/80 p-4 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Recent audit logs</p>
              <div className="mt-4 space-y-3">
                {(loading ? new Array(2).fill(null) : auditLogs).map((item, index) => (
                  <div key={item?.id ?? `audit-skeleton-${index}`} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-950">
                    <div className="font-medium text-slate-800 dark:text-slate-100">
                      {item ? `${item.actor} • ${item.action}` : "Loading audit log..."}
                    </div>
                    <div className="mt-1 text-slate-500 dark:text-slate-400">
                      {item ? `${item.resource} • ${item.createdAt}` : "..."}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
