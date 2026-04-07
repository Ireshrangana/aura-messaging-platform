"use client";

import { useEffect, useState } from "react";

import {
  getStoredAdminBehaviorActions,
  getStoredAdminUserControls,
  getStoredPasswordChangeRequests,
  saveStoredPasswordChangeRequests
} from "@/lib/data";
import { useDemoSession } from "@/components/providers/demo-session";
import { Panel, Pill, SectionTitle } from "@/components/ui/primitives";

const settingsGroups = [
  {
    title: "Privacy",
    description: "Control last seen, read receipts, avatar visibility, and disappearing messages."
  },
  {
    title: "Security",
    description: "Manage linked devices, trusted sessions, 2FA, and biometric chat lock defaults."
  },
  {
    title: "AI settings",
    description: "Choose which AI features are enabled, what gets translated, and how summaries appear."
  },
  {
    title: "Notifications",
    description: "Mute noisy threads, hide sensitive previews, and route call alerts across devices."
  }
];

const linkedDevices = [
  { name: "iPhone 16 Pro", state: "Trusted", lastSeen: "Active now" },
  { name: "MacBook Pro", state: "Trusted", lastSeen: "11 minutes ago" },
  { name: "Chrome on Windows", state: "Review", lastSeen: "Yesterday at 21:14" }
];

function getActionTone(action?: string | null) {
  switch (action) {
    case "Ban user":
      return {
        pill: "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200",
        panel: "border-rose-200 bg-rose-50/80 dark:border-rose-900/40 dark:bg-rose-950/20"
      };
    case "Suspend user":
      return {
        pill: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200",
        panel: "border-amber-200 bg-amber-50/80 dark:border-amber-900/40 dark:bg-amber-950/20"
      };
    case "Reactivate user":
      return {
        pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200",
        panel: "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/20"
      };
    case "Add internal note":
      return {
        pill: "bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-200",
        panel: "border-sky-200 bg-sky-50/80 dark:border-sky-900/40 dark:bg-sky-950/20"
      };
    default:
      return {
        pill: "bg-slate-100 text-slate-700 dark:bg-slate-900/70 dark:text-slate-200",
        panel: "border-white/50 bg-white/80 dark:border-white/10 dark:bg-slate-900/80"
      };
  }
}

export function SettingsOverview({ profileOnly = false }: { profileOnly?: boolean }) {
  const { user, updateCurrentUser } = useDemoSession();
  const [userControlState, setUserControlState] = useState(() => getStoredAdminUserControls()[user.id]);
  const [latestUserAction, setLatestUserAction] = useState(() =>
    getStoredAdminBehaviorActions().find((item) => item.targetType === "user" && item.targetId === user.id) ?? null
  );
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    role: user.role,
    email: user.email,
    phone: user.phone
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: user.password,
    nextPassword: user.password,
    confirmPassword: user.password
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordRequestState, setPasswordRequestState] = useState(() =>
    getStoredPasswordChangeRequests().find((item) => item.userId === user.id && item.status === "pending") ?? null
  );
  const actionTone = getActionTone(latestUserAction?.action);

  useEffect(() => {
    setProfileForm({
      name: user.name,
      role: user.role,
      email: user.email,
      phone: user.phone
    });
    setPasswordForm({
      currentPassword: user.password,
      nextPassword: user.password,
      confirmPassword: user.password
    });
    setPasswordRequestState(
      getStoredPasswordChangeRequests().find((item) => item.userId === user.id && item.status === "pending") ?? null
    );
  }, [user.email, user.name, user.password, user.phone, user.role]);

  useEffect(() => {
    setUserControlState(getStoredAdminUserControls()[user.id]);
    setLatestUserAction(getStoredAdminBehaviorActions().find((item) => item.targetType === "user" && item.targetId === user.id) ?? null);

    const onStorage = (event: StorageEvent) => {
      if (event.key === "aura-admin-user-controls") {
        setUserControlState(getStoredAdminUserControls()[user.id]);
      }

      if (event.key === "aura-admin-behavior-actions") {
        setLatestUserAction(getStoredAdminBehaviorActions().find((item) => item.targetType === "user" && item.targetId === user.id) ?? null);
      }

      if (event.key === "aura-password-change-requests") {
        setPasswordRequestState(
          getStoredPasswordChangeRequests().find((item) => item.userId === user.id && item.status === "pending") ?? null
        );
      }
    };

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [user.id]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setUserControlState(getStoredAdminUserControls()[user.id]);
      setLatestUserAction(
        getStoredAdminBehaviorActions().find((item) => item.targetType === "user" && item.targetId === user.id) ?? null
      );
      setPasswordRequestState(
        getStoredPasswordChangeRequests().find((item) => item.userId === user.id && item.status === "pending") ?? null
      );
    }, 800);

    return () => {
      window.clearInterval(interval);
    };
  }, [user.id]);

  useEffect(() => {
    if (!profileMessage && !profileError) return;

    const timeout = window.setTimeout(() => {
      setProfileMessage("");
      setProfileError("");
    }, 2600);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [profileError, profileMessage]);

  const saveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profileForm.name.trim() || !profileForm.email.trim() || !profileForm.phone.trim()) {
      setProfileError("Name, email, and phone are required.");
      return;
    }

    if (passwordForm.nextPassword !== passwordForm.confirmPassword) {
      setProfileError("New password and confirm password need to match.");
      return;
    }

    if (passwordForm.currentPassword !== user.password) {
      setProfileError("Current password is incorrect.");
      return;
    }

    updateCurrentUser({
      name: profileForm.name.trim(),
      initials: profileForm.name
        .trim()
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
      role: profileForm.role.trim() || "Messenger user",
      email: profileForm.email.trim().toLowerCase(),
      phone: profileForm.phone.trim()
    });

    if (passwordForm.nextPassword !== user.password) {
      const requests = getStoredPasswordChangeRequests().filter(
        (item) => !(item.userId === user.id && item.status === "pending")
      );
      const nextRequest = {
        id: `password_request_${Date.now()}`,
        userId: user.id,
        userName: profileForm.name.trim(),
        email: profileForm.email.trim().toLowerCase(),
        currentPassword: passwordForm.currentPassword,
        requestedPassword: passwordForm.nextPassword,
        status: "pending" as const,
        requestedAt: Date.now()
      };
      const nextRequests = [nextRequest, ...requests];
      saveStoredPasswordChangeRequests(nextRequests);
      setPasswordRequestState(nextRequest);
      setProfileMessage("Profile updated. New password is pending super admin approval.");
      return;
    }

    setProfileMessage("Profile changes saved.");
  };

  return (
    <div className="space-y-4">
      {latestUserAction ? (
        <Panel className="p-6">
          <SectionTitle
            title="Profile status notice"
            subtitle="This account has a recent super admin action attached to it."
            action={<Pill active className={actionTone.pill}>Admin notice</Pill>}
          />
          <div className="mt-5 grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
            <div className={`rounded-3xl border p-5 shadow-soft ${actionTone.panel}`}>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Current account state</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {userControlState?.status ?? "active"}
              </p>
            </div>
            <div className={`rounded-3xl border p-5 shadow-soft ${actionTone.panel}`}>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{latestUserAction.action}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{latestUserAction.rationale}</p>
            </div>
          </div>
        </Panel>
      ) : null}

      <Panel className="p-6">
        <SectionTitle
          title={profileOnly ? "Professional profile" : "Profile and account"}
          subtitle={
            profileOnly
              ? "Manage your public identity, contact details, and password request workflow from one polished profile page."
              : "Update how your profile appears and rotate credentials without leaving the dashboard."
          }
          action={<Pill active>Editable</Pill>}
        />

        <form className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]" onSubmit={saveProfile}>
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
              <p className="text-base font-semibold text-slate-900 dark:text-slate-50">Public profile</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Display name</span>
                  <input
                    value={profileForm.name}
                    onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-aura-400 dark:border-slate-700 dark:bg-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Profile status</span>
                  <input
                    value={profileForm.role}
                    onChange={(event) => setProfileForm((current) => ({ ...current, role: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-aura-400 dark:border-slate-700 dark:bg-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</span>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-aura-400 dark:border-slate-700 dark:bg-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</span>
                  <input
                    value={profileForm.phone}
                    onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-aura-400 dark:border-slate-700 dark:bg-white"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
              <p className="text-base font-semibold text-slate-900 dark:text-slate-50">Security and password</p>
              {passwordRequestState ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                  Password change request pending super admin approval.
                </div>
              ) : null}
              <div className="mt-4 grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Current password</span>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-aura-400 dark:border-slate-700 dark:bg-white"
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">New password</span>
                    <input
                      type="password"
                      value={passwordForm.nextPassword}
                      onChange={(event) => setPasswordForm((current) => ({ ...current, nextPassword: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-aura-400 dark:border-slate-700 dark:bg-white"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm password</span>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-aura-400 dark:border-slate-700 dark:bg-white"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
              <p className="text-base font-semibold text-slate-900 dark:text-slate-50">Profile preview</p>
              <div className="mt-4 rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{profileForm.name || "Your name"}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{profileForm.role || "Messenger user"}</p>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{profileForm.email}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{profileForm.phone}</p>
              </div>
              <button className="mt-4 w-full rounded-2xl bg-aura-500 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-aura-600">
                Save changes
              </button>
              {profileMessage ? (
                <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
                  {profileMessage}
                </div>
              ) : null}
              {profileError ? (
                <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
                  {profileError}
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
              <p className="text-base font-semibold text-slate-900 dark:text-slate-50">Quick profile controls</p>
              <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950">Change display name and header identity</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950">Update email and phone used for new chats</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950">Request password rotation for super admin approval</div>
              </div>
            </div>
          </div>
        </form>
      </Panel>

      {profileOnly ? null : (
        <>
          <Panel className="p-6">
            <SectionTitle
              title="Settings and trust center"
              subtitle="Privacy-first controls surfaced in a way that feels human, calm, and explicit."
              action={<Pill active>2FA enabled</Pill>}
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {settingsGroups.map((group) => (
                <div
                  key={group.title}
                  className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80"
                >
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{group.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{group.description}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-6">
            <SectionTitle title="Linked devices" subtitle="Every session is visible, revocable, and scored for trust." />
            <div className="mt-5 space-y-3">
              {linkedDevices.map((device) => (
                <div
                  key={device.name}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-white/50 bg-white/80 p-4 shadow-soft dark:border-white/10 dark:bg-slate-900/80"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{device.name}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{device.lastSeen}</p>
                  </div>
                  <Pill active={device.state === "Trusted"}>{device.state}</Pill>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
