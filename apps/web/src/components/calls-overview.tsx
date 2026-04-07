import { Panel, Pill, SectionTitle } from "@/components/ui/primitives";

const recentCalls = [
  { name: "Maya Chen", type: "Video call", duration: "18 min", status: "Completed" },
  { name: "Launch Team", type: "Voice huddle", duration: "42 min", status: "Completed" },
  { name: "Avery Stone", type: "Incoming call", duration: "Missed", status: "Missed" }
];

const callFeatures = [
  "Incoming call screen and minimized floating call state",
  "Voice and video controls with mute, camera, screen share, and AI notes",
  "Call history with quick redial and trust indicators",
  "WebRTC-ready architecture with device permissions and network quality states"
];

export function CallsOverview({
  contact,
  mode
}: {
  contact?: string;
  mode?: string;
}) {
  const hasActiveCall = Boolean(contact && mode);

  return (
    <div className="space-y-4">
      {hasActiveCall ? (
        <Panel className="p-6">
          <SectionTitle
            title="Active call"
            subtitle="Live call state launched directly from the messaging dashboard."
            action={<Pill active>{mode === "video" ? "Video live" : "Voice live"}</Pill>}
          />
          <div className="mt-6 rounded-[2rem] border border-white/50 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{contact}</p>
                <p className="mt-2 text-sm text-emerald-500">
                  {mode === "video" ? "Video call connected" : "Voice call connected"} • secure line active
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-2xl border border-white/50 bg-white/85 px-4 py-3 text-sm font-medium text-slate-700 shadow-soft dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-200"
                >
                  Mute
                </button>
                <button
                  type="button"
                  className="rounded-2xl border border-white/50 bg-white/85 px-4 py-3 text-sm font-medium text-slate-700 shadow-soft dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-200"
                >
                  {mode === "video" ? "Camera" : "Speaker"}
                </button>
                <button
                  type="button"
                  className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-soft"
                >
                  End call
                </button>
              </div>
            </div>
          </div>
        </Panel>
      ) : null}

      <Panel className="p-6">
        <SectionTitle
          title="Calls"
          subtitle="A clean voice and video surface designed for quick transitions from chat to live conversation."
          action={<Pill active>WebRTC ready</Pill>}
        />
        <div className="mt-6 space-y-3">
          {recentCalls.map((call) => (
            <div
              key={`${call.name}-${call.type}`}
              className="flex items-center justify-between gap-4 rounded-3xl border border-white/50 bg-white/80 p-4 shadow-soft dark:border-white/10 dark:bg-slate-900/80"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{call.name}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {call.type} • {call.duration}
                </p>
              </div>
              <Pill active={call.status === "Completed"} className={call.status === "Missed" ? "bg-rose-100 text-rose-700" : ""}>
                {call.status}
              </Pill>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="p-6">
        <SectionTitle title="Calling system" subtitle="Prepared for startup scale and enterprise-quality reliability." />
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {callFeatures.map((feature) => (
            <div
              key={feature}
              className="rounded-3xl border border-white/50 bg-white/80 p-4 text-sm text-slate-600 shadow-soft dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300"
            >
              {feature}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
