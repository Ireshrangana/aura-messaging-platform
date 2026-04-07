import { primaryNav, securityCards, smartReplies } from "@aura/shared";

export const navItems = primaryNav;

export interface DemoUser {
  id: string;
  name: string;
  initials: string;
  role: string;
  email: string;
  password: string;
  phone: string;
}

export const seededDemoUsers: DemoUser[] = [
  {
    id: "jordan",
    name: "Jordan Lee",
    initials: "JL",
    role: "Growth lead",
    email: "jordan.lee@aura.app",
    password: "JordanAura2026!",
    phone: "+1 555 014 7788"
  },
  {
    id: "maya",
    name: "Maya Chen",
    initials: "MC",
    role: "Product lead",
    email: "maya.chen@aura.app",
    password: "MayaAura2026!",
    phone: "+1 555 018 4412"
  }
];

export const defaultDemoUser = seededDemoUsers[0];
export const DEMO_USERS_STORAGE_KEY = "aura-demo-users";
export const DEMO_SHARED_CHATS_STORAGE_KEY = "aura-demo-shared-chats";
export const ADMIN_USER_CONTROLS_STORAGE_KEY = "aura-admin-user-controls";
export const ADMIN_GROUP_CONTROLS_STORAGE_KEY = "aura-admin-group-controls";
export const ADMIN_BEHAVIOR_ACTIONS_STORAGE_KEY = "aura-admin-behavior-actions";
export const PASSWORD_CHANGE_REQUESTS_STORAGE_KEY = "aura-password-change-requests";
export const ADMIN_ACCOUNTS_STORAGE_KEY = "aura-admin-accounts";
export const UNREAD_COUNTS_STORAGE_KEY = "aura-demo-unread-counts";

export const superAdminUser = {
  id: "admin_root",
  username: "aura_root_admin",
  email: "ops-root@aura-admin.app",
  password: "AuraRootOps2026!",
  name: "Aura Root Admin",
  role: "super_admin"
} as const;

export interface AdminAccount {
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  role: "super_admin" | "sub_admin" | "moderator";
  status: "active" | "disabled";
  createdAt: number;
}

export const seededAdminAccounts: AdminAccount[] = [
  {
    ...superAdminUser,
    status: "active",
    createdAt: Date.now()
  }
];

export interface StoredDirectChat {
  id: string;
  participantIds: string[];
  createdAt: number;
}

export type BehaviorActionType =
  | "Suspend user"
  | "Ban user"
  | "Reactivate user"
  | "Force logout"
  | "Reset linked sessions"
  | "Mute or freeze group"
  | "Add internal note";

export interface AdminUserControlState {
  userId: string;
  status: "active" | "suspended" | "banned";
  noteCount: number;
  lastActionAt?: number;
  forceLogoutAt?: number;
  sessionsResetAt?: number;
}

export interface AdminGroupControlState {
  groupId: string;
  mode: "active" | "muted" | "frozen";
  noteCount: number;
  lastActionAt?: number;
}

export interface AdminBehaviorActionRecord {
  id: string;
  action: BehaviorActionType;
  targetType: "user" | "group";
  targetId: string;
  targetName: string;
  rationale: string;
  createdAt: number;
  actor: string;
  outcome: string;
}

export interface PasswordChangeRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  currentPassword: string;
  requestedPassword: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: number;
  reviewedAt?: number;
  reviewer?: string;
}

export type StoredUnreadCounts = Record<string, Record<string, number>>;

function buildSeedUnreadCounts(users: DemoUser[]) {
  return users.reduce<StoredUnreadCounts>((accumulator, user) => {
    accumulator[user.id] = getChatsForUser(user).reduce<Record<string, number>>((chatAccumulator, chat) => {
      chatAccumulator[chat.id] = chat.unread;
      return chatAccumulator;
    }, {});

    return accumulator;
  }, {});
}

export function getStoredAdminAccounts() {
  if (typeof window === "undefined") return seededAdminAccounts;

  const raw = window.localStorage.getItem(ADMIN_ACCOUNTS_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(ADMIN_ACCOUNTS_STORAGE_KEY, JSON.stringify(seededAdminAccounts));
    return seededAdminAccounts;
  }

  try {
    const parsed = JSON.parse(raw) as AdminAccount[];
    return parsed.length > 0 ? parsed : seededAdminAccounts;
  } catch {
    window.localStorage.setItem(ADMIN_ACCOUNTS_STORAGE_KEY, JSON.stringify(seededAdminAccounts));
    return seededAdminAccounts;
  }
}

export function saveStoredAdminAccounts(accounts: AdminAccount[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

export function getStoredDemoUsers() {
  if (typeof window === "undefined") return seededDemoUsers;

  const raw = window.localStorage.getItem(DEMO_USERS_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(DEMO_USERS_STORAGE_KEY, JSON.stringify(seededDemoUsers));
    return seededDemoUsers;
  }

  try {
    const parsed = JSON.parse(raw) as DemoUser[];
    return parsed.length > 0 ? parsed : seededDemoUsers;
  } catch {
    window.localStorage.setItem(DEMO_USERS_STORAGE_KEY, JSON.stringify(seededDemoUsers));
    return seededDemoUsers;
  }
}

export function saveStoredDemoUsers(users: DemoUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_USERS_STORAGE_KEY, JSON.stringify(users));
}

export function getStoredAdminUserControls() {
  if (typeof window === "undefined") return {} as Record<string, AdminUserControlState>;

  const raw = window.localStorage.getItem(ADMIN_USER_CONTROLS_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(ADMIN_USER_CONTROLS_STORAGE_KEY, JSON.stringify({}));
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, AdminUserControlState>;
  } catch {
    window.localStorage.setItem(ADMIN_USER_CONTROLS_STORAGE_KEY, JSON.stringify({}));
    return {};
  }
}

export function saveStoredAdminUserControls(controls: Record<string, AdminUserControlState>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_USER_CONTROLS_STORAGE_KEY, JSON.stringify(controls));
}

export function getStoredAdminGroupControls() {
  if (typeof window === "undefined") return {} as Record<string, AdminGroupControlState>;

  const raw = window.localStorage.getItem(ADMIN_GROUP_CONTROLS_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(ADMIN_GROUP_CONTROLS_STORAGE_KEY, JSON.stringify({}));
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, AdminGroupControlState>;
  } catch {
    window.localStorage.setItem(ADMIN_GROUP_CONTROLS_STORAGE_KEY, JSON.stringify({}));
    return {};
  }
}

export function saveStoredAdminGroupControls(controls: Record<string, AdminGroupControlState>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_GROUP_CONTROLS_STORAGE_KEY, JSON.stringify(controls));
}

export function getStoredAdminBehaviorActions() {
  if (typeof window === "undefined") return [] as AdminBehaviorActionRecord[];

  const raw = window.localStorage.getItem(ADMIN_BEHAVIOR_ACTIONS_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(ADMIN_BEHAVIOR_ACTIONS_STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  try {
    return JSON.parse(raw) as AdminBehaviorActionRecord[];
  } catch {
    window.localStorage.setItem(ADMIN_BEHAVIOR_ACTIONS_STORAGE_KEY, JSON.stringify([]));
    return [];
  }
}

export function saveStoredAdminBehaviorActions(actions: AdminBehaviorActionRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_BEHAVIOR_ACTIONS_STORAGE_KEY, JSON.stringify(actions));
}

export function getStoredPasswordChangeRequests() {
  if (typeof window === "undefined") return [] as PasswordChangeRequest[];

  const raw = window.localStorage.getItem(PASSWORD_CHANGE_REQUESTS_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(PASSWORD_CHANGE_REQUESTS_STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  try {
    return JSON.parse(raw) as PasswordChangeRequest[];
  } catch {
    window.localStorage.setItem(PASSWORD_CHANGE_REQUESTS_STORAGE_KEY, JSON.stringify([]));
    return [];
  }
}

export function saveStoredPasswordChangeRequests(requests: PasswordChangeRequest[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PASSWORD_CHANGE_REQUESTS_STORAGE_KEY, JSON.stringify(requests));
}

export function getStoredUnreadCounts(users?: DemoUser[]) {
  const seedUsers = users ?? seededDemoUsers;
  const fallback = buildSeedUnreadCounts(seedUsers);

  if (typeof window === "undefined") return fallback;

  const raw = window.localStorage.getItem(UNREAD_COUNTS_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(UNREAD_COUNTS_STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as StoredUnreadCounts;
    const merged = { ...fallback, ...parsed };

    for (const user of seedUsers) {
      merged[user.id] = {
        ...(fallback[user.id] ?? {}),
        ...(parsed[user.id] ?? {})
      };
    }

    return merged;
  } catch {
    window.localStorage.setItem(UNREAD_COUNTS_STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

export function saveStoredUnreadCounts(unreadCounts: StoredUnreadCounts) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(UNREAD_COUNTS_STORAGE_KEY, JSON.stringify(unreadCounts));
}

export function getStoredDirectChats() {
  if (typeof window === "undefined") return [] as StoredDirectChat[];

  const raw = window.localStorage.getItem(DEMO_SHARED_CHATS_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(DEMO_SHARED_CHATS_STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  try {
    return JSON.parse(raw) as StoredDirectChat[];
  } catch {
    window.localStorage.setItem(DEMO_SHARED_CHATS_STORAGE_KEY, JSON.stringify([]));
    return [];
  }
}

export function saveStoredDirectChats(chats: StoredDirectChat[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_SHARED_CHATS_STORAGE_KEY, JSON.stringify(chats));
}

export const stories = [
  { id: "story_1", name: "Maya", tone: "from-cyan-400 to-aura-500" },
  { id: "story_2", name: "Avery", tone: "from-emerald-400 to-cyan-500" },
  { id: "story_3", name: "Lina", tone: "from-fuchsia-400 to-aura-500" }
];

export type ChatFilter = "All" | "Unread" | "Groups" | "Archived";

export interface ChatSummary {
  id: string;
  name: string;
  presence: string;
  preview: string;
  time: string;
  unread: number;
  pinned?: boolean;
  archived?: boolean;
  kind?: "direct" | "group";
}

export interface ChatMessage {
  id: string;
  author: string;
  body: string;
  meta: string;
}

export const baseChats: ChatSummary[] = [
  {
    id: "chat_1",
    name: "Maya Chen",
    presence: "online",
    preview: "Unread summary is ready. Want the short or detailed version?",
    time: "09:42",
    unread: 2,
    pinned: true,
    kind: "direct"
  },
  {
    id: "chat_2",
    name: "Launch Team",
    presence: "12 members",
    preview: "Arabic CTA rewrite still pending legal review.",
    time: "08:15",
    unread: 7,
    pinned: true,
    kind: "group"
  },
  {
    id: "chat_3",
    name: "Avery Stone",
    presence: "last active 4m ago",
    preview: "Suspicious login alert resolved for the finance workspace.",
    time: "Yesterday",
    unread: 0,
    kind: "direct"
  },
  {
    id: "chat_4",
    name: "Archived Design",
    presence: "archived",
    preview: "Old design review thread kept for reference.",
    time: "Mon",
    unread: 0,
    archived: true,
    kind: "group"
  }
];

export const baseThreads: Record<string, ChatMessage[]> = {
  chat_1: [
    {
      id: "m_1",
      author: "Maya Chen",
      body: "Morning. I dropped the launch feedback and a voice note in the thread.",
      meta: "09:41"
    },
    {
      id: "m_2",
      author: "Jordan Lee",
      body: "Can you give me a quick unread summary before I join the call?",
      meta: "09:42 • Read"
    },
    {
      id: "m_3",
      author: "Aura AI",
      body: "Three updates: headline needs warmer tone, Arabic CTA is still open, and legal sign-off is expected before 3 PM.",
      meta: "09:42 • Summary"
    },
    {
      id: "m_4",
      author: "Maya Chen",
      body: "Also, the voice note transcript says the landing page is approved.",
      meta: "09:43"
    }
  ],
  chat_2: [
    {
      id: "g_1",
      author: "Lina Park",
      body: "I uploaded the revised Arabic CTA options and the legal note.",
      meta: "08:10"
    },
    {
      id: "g_2",
      author: "Jordan Lee",
      body: "Perfect. Can Aura summarize the blockers before standup?",
      meta: "08:12 • Delivered"
    },
    {
      id: "g_3",
      author: "Aura AI",
      body: "Current blockers: Arabic CTA tone, legal approval timing, and final QA on the launch assets.",
      meta: "08:12 • Summary"
    }
  ],
  chat_3: [
    {
      id: "a_1",
      author: "Avery Stone",
      body: "We resolved the suspicious login alert and revoked the stale browser session.",
      meta: "Yesterday"
    },
    {
      id: "a_2",
      author: "Jordan Lee",
      body: "Nice. Please log that in the audit trail and notify the user.",
      meta: "Yesterday • Read"
    }
  ],
  chat_4: [
    {
      id: "r_1",
      author: "System",
      body: "This archived conversation is read-only in the demo.",
      meta: "Mon"
    }
  ]
};

export function getChatsForUser(user: DemoUser) {
  return baseChats.map((chat) => {
    if (chat.id !== "chat_1") return chat;
    return {
      ...chat,
      name: user.id === "maya" ? "Jordan Lee" : "Maya Chen",
      presence: user.id === "maya" ? "last active 1m ago" : "online",
      preview:
        user.id === "maya"
          ? "Can you give me a quick unread summary before I join the call?"
          : "Unread summary is ready. Want the short or detailed version?"
    };
  });
}

export function getSharedChatsForUser(user: DemoUser, users: DemoUser[], threads: Record<string, ChatMessage[]>) {
  return getStoredDirectChats()
    .filter((chat) => chat.participantIds.includes(user.id))
    .map((chat) => {
      const otherUserId = chat.participantIds.find((participantId) => participantId !== user.id) ?? user.id;
      const otherUser = users.find((entry) => entry.id === otherUserId);
      const latestMessage = threads[chat.id]?.[threads[chat.id].length - 1];

      return {
        id: chat.id,
        name: otherUser?.name ?? "Unknown contact",
        presence: otherUser ? `${otherUser.email} • ${otherUser.phone}` : "Contact unavailable",
        preview: latestMessage?.body ?? `Start a conversation with ${otherUser?.name ?? "this contact"}`,
        time: latestMessage?.meta.split(" • ")[0] ?? "Now",
        unread: 0,
        kind: "direct" as const
      };
    });
}

export const aiChips = smartReplies;

export const trustCards = securityCards;

export const adminAlerts = [
  { id: "a_1", title: "Phishing link review", count: 2 },
  { id: "a_2", title: "Suspicious logins", count: 5 },
  { id: "a_3", title: "Abuse reports", count: 12 }
];
