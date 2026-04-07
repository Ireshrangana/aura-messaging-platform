"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  defaultDemoUser,
  getStoredAdminUserControls,
  getStoredDemoUsers,
  saveStoredDemoUsers,
  type DemoUser
} from "@/lib/data";
import { useDemoSession } from "@/components/providers/demo-session";
import { Pill } from "@/components/ui/primitives";
import { cn } from "@/components/ui/primitives";

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange
}: {
  label: string;
  type?: string;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3 text-sm text-slate-950 caret-aura-500 outline-none transition placeholder:text-slate-500 focus:border-aura-400 focus:bg-white dark:border-white/12 dark:bg-white dark:text-slate-950 dark:placeholder:text-slate-500"
        style={{ color: "#020617", backgroundColor: "#ffffff" }}
      />
    </label>
  );
}

export function LoginForm() {
  const router = useRouter();
  const { setUserById } = useDemoSession();
  const [availableUsers, setAvailableUsers] = useState<DemoUser[]>([defaultDemoUser]);
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [selectedUserId, setSelectedUserId] = useState<DemoUser["id"]>(defaultDemoUser.id);
  const selectedUser = availableUsers.find((user) => user.id === selectedUserId) ?? defaultDemoUser;
  const [email, setEmail] = useState(selectedUser.email);
  const [password, setPassword] = useState(selectedUser.password);
  const [phone, setPhone] = useState(selectedUser.phone);
  const [error, setError] = useState("");

  useEffect(() => {
    const users = getStoredDemoUsers();
    setAvailableUsers(users);
    const matched = users.find((entry) => entry.id === selectedUserId) ?? users[0] ?? defaultDemoUser;
    setSelectedUserId(matched.id);
    setEmail(matched.email);
    setPassword(matched.password);
    setPhone(matched.phone);
  }, []);

  const demoCredentials = {
    email: selectedUser.email,
    password: selectedUser.password,
    phone: selectedUser.phone
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userState = getStoredAdminUserControls()[selectedUser.id];

    if (userState?.status === "suspended") {
      setError("This demo user is currently suspended by the super admin.");
      return;
    }

    if (userState?.status === "banned") {
      setError("This demo user has been banned and can no longer access the messenger.");
      return;
    }

    const isValidEmailLogin = email === demoCredentials.email && password === demoCredentials.password;
    const isValidPhoneLogin = phone === demoCredentials.phone;

    if ((method === "email" && isValidEmailLogin) || (method === "phone" && isValidPhoneLogin)) {
      setError("");
      setUserById(selectedUser.id);
      router.push("/");
      return;
    }

    setError("Use the demo credentials shown below to enter the inbox.");
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-2xl font-semibold tracking-tight text-white">Log in</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Access your secure chats, trusted devices, and AI workspace.
          </p>
        </div>
        <Pill active className="border border-white/12 bg-white/10 text-white backdrop-blur-xl">2FA ready</Pill>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {availableUsers.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => {
              setSelectedUserId(user.id);
              setEmail(user.email);
              setPassword(user.password);
              setPhone(user.phone);
              setError("");
            }}
          >
            <Pill active={selectedUserId === user.id}>
              {user.name}
              {(() => {
                const userState = getStoredAdminUserControls()[user.id];
                if (!userState || userState.status === "active") return "";
                return ` • ${userState.status}`;
              })()}
            </Pill>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["email", "phone"] as const).map((value) => (
          <button key={value} type="button" onClick={() => setMethod(value)}>
            <Pill active={method === value}>{value === "email" ? "Email" : "Phone OTP"}</Pill>
          </button>
        ))}
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {method === "email" ? (
          <>
            <Field
              label="Email address"
              type="email"
              placeholder="maya@company.com"
              value={email}
              onChange={setEmail}
            />
            <Field
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
            />
          </>
        ) : (
          <>
            <Field
              label="Phone number"
              type="tel"
              placeholder="+1 555 210 4456"
              value={phone}
              onChange={setPhone}
            />
            <div className="rounded-2xl border border-dashed border-aura-200 bg-aura-50/70 px-4 py-3 text-sm text-aura-900 dark:border-aura-900/40 dark:bg-aura-950/20 dark:text-aura-100">
              We’ll send a one-time code and verify your trusted device before sign-in.
            </div>
          </>
        )}

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 text-slate-300">
            <input type="checkbox" className="rounded border-slate-300" />
            Keep this device trusted
          </label>
          <Link href="/signup" className="font-medium text-aura-500">
            Forgot password?
          </Link>
        </div>

        <button className="w-full rounded-2xl border border-aura-300/20 bg-aura-500/88 px-4 py-3 text-sm font-semibold text-white shadow-soft backdrop-blur-xl transition hover:bg-aura-500">
          {method === "email" ? "Log in securely" : "Send verification code"}
        </button>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur-xl"
          >
            Continue with Google
          </button>
          <button
            type="button"
            className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur-xl"
          >
            Continue with SSO
          </button>
        </div>
      </form>

      <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 px-4 py-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
        Demo user: <span className="font-semibold">{selectedUser.name}</span>
        <div className="mt-2 font-medium">Role: {selectedUser.role}</div>
        <div className="font-medium">Email: {demoCredentials.email}</div>
        <div className="font-medium">Password: {demoCredentials.password}</div>
        <div className="font-medium">Phone: {demoCredentials.phone}</div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/12 bg-white/8 px-4 py-4 text-sm text-slate-300 backdrop-blur-xl">
        Sign in as Jordan Lee or Maya Chen to compare sent and received message states from both sides of the demo conversation.
      </div>
    </div>
  );
}

export function SignupForm() {
  const router = useRouter();
  const { setUserById } = useDemoSession();
  const [plan, setPlan] = useState<"personal" | "team">("personal");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!displayName || !email || !phone || !password) {
      setError("Please complete all required fields.");
      return;
    }

    const users = getStoredDemoUsers();
    const emailExists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());
    const phoneExists = users.some((user) => user.phone === phone);

    if (emailExists || phoneExists) {
      setError("This email or phone number is already registered in the demo messenger.");
      return;
    }

    const nextUser: DemoUser = {
      id: `user_${Date.now()}`,
      name: displayName.trim(),
      initials: displayName
        .trim()
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
      role: plan === "team" ? "Team workspace member" : "Personal account",
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim()
    };

    saveStoredDemoUsers([...users, nextUser]);
    setUserById(nextUser.id);
    router.push("/");
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-2xl font-semibold tracking-tight text-white">Create account</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Start with private messaging and scale into groups, devices, moderation, and AI workflows.
          </p>
        </div>
        <Pill active className="border border-white/12 bg-white/10 text-white backdrop-blur-xl">Privacy-first</Pill>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["personal", "team"] as const).map((value) => (
          <button key={value} type="button" onClick={() => setPlan(value)}>
            <Pill active={plan === value}>{value === "personal" ? "Personal" : "Team workspace"}</Pill>
          </button>
        ))}
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Display name" placeholder="Maya Chen" value={displayName} onChange={setDisplayName} />
          <Field label="Work email" type="email" placeholder="maya@company.com" value={email} onChange={setEmail} />
        </div>
        <Field label="Phone number" type="tel" placeholder="+1 555 210 4456" value={phone} onChange={setPhone} />
        <Field label="Password" type="password" placeholder="Create a strong password" value={password} onChange={setPassword} />

        <div className="rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur-xl">
          <p className="text-sm font-medium text-white">Recommended setup</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              "Enable 2FA during onboarding",
              "Trust this first device",
              "Hide sensitive notification previews",
              "Turn on AI summaries"
            ].map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                {item}
              </label>
            ))}
          </div>
        </div>

        <button className={cn("w-full rounded-2xl border border-aura-300/20 bg-aura-500/88 px-4 py-3 text-sm font-semibold text-white shadow-soft backdrop-blur-xl transition hover:bg-aura-500")}>
          Create secure account
        </button>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
            {error}
          </div>
        ) : null}
      </form>

      <div className="mt-6 rounded-2xl border border-dashed border-aura-200 bg-aura-50/70 px-4 py-4 text-sm text-aura-900 dark:border-aura-900/40 dark:bg-aura-950/20 dark:text-aura-100">
        Next step after signup: OTP verification, profile setup, and trusted-device confirmation.
      </div>
    </div>
  );
}
