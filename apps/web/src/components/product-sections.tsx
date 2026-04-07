import { Panel, Pill, SectionTitle } from "@/components/ui/primitives";

const authFlow = [
  "Welcome screen with device trust language and elegant hero UI",
  "Phone OTP and email/password login",
  "Password reset, 2FA setup, display name, avatar, and profile status onboarding",
  "Linked device review during onboarding for suspicious sign-in transparency"
];

const platformHighlights = [
  "One-to-one and group messaging with rich attachments, reactions, and edit/delete states",
  "Stories, voice/video calls, pinned chats, archived chats, and admin announcements",
  "Semantic AI search across messages, files, people, and time",
  "Trust-first privacy controls for last seen, read receipts, stories, and profile visibility"
];

const backendModules = [
  "Auth and identity",
  "Chat membership and permissions",
  "Messaging and attachments",
  "Realtime events and presence",
  "AI orchestration",
  "Security and audit",
  "Admin and moderation"
];

export function ProductSections() {
  return (
    <div className="mx-auto grid max-w-[1600px] gap-4 px-4 pb-10 md:px-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Panel className="p-6">
        <SectionTitle
          title="Product blueprint"
          subtitle="This scaffold covers the key screens, flows, and architecture you asked for."
        />
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Authentication</p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {authFlow.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Core messaging</p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {platformHighlights.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>

      <Panel className="p-6">
        <SectionTitle
          title="Backend domains"
          subtitle="Clean service boundaries keep the system scalable and easier to secure."
          action={<Pill active>Production-ready</Pill>}
        />
        <div className="mt-5 flex flex-wrap gap-2">
          {backendModules.map((module) => (
            <Pill key={module}>{module}</Pill>
          ))}
        </div>
      </Panel>
    </div>
  );
}

