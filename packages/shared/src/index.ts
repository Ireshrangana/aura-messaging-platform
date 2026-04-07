export type ThemeMode = "light" | "dark" | "system";

export type Presence = "online" | "offline" | "away" | "dnd";

export type ChatKind = "direct" | "group" | "announcement";

export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export type AIAction =
  | "smart_reply"
  | "summarize_chat"
  | "summarize_unread"
  | "rewrite_message"
  | "translate_message"
  | "voice_transcription"
  | "semantic_search"
  | "safety_review";

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export const primaryNav: NavItem[] = [
  { label: "Inbox", href: "/" },
  { label: "Stories", href: "/stories" },
  { label: "Calls", href: "/calls" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
  { label: "Admin", href: "/admin", badge: "Ops" }
];

export interface SmartReply {
  id: string;
  label: string;
}

export interface SecurityCard {
  title: string;
  description: string;
  tone: "safe" | "warning" | "critical";
}

export const smartReplies: SmartReply[] = [
  { id: "sr_1", label: "Sounds good, I'll handle it." },
  { id: "sr_2", label: "Can you send the latest file too?" },
  { id: "sr_3", label: "I summarized the thread above." },
  { id: "sr_4", label: "Let's review it together at 3 PM." }
];

export const securityCards: SecurityCard[] = [
  {
    title: "Trusted devices",
    description: "3 active devices with biometric unlock and suspicious-login alerts enabled.",
    tone: "safe"
  },
  {
    title: "Sensitive preview protection",
    description: "Locked chats hide message previews on the lock screen.",
    tone: "safe"
  },
  {
    title: "Moderation review queue",
    description: "2 phishing reports are waiting for admin validation.",
    tone: "warning"
  }
];
