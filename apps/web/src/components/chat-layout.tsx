"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  getStoredAdminBehaviorActions,
  adminAlerts,
  aiChips,
  baseThreads,
  getStoredUnreadCounts,
  getStoredAdminUserControls,
  getStoredDemoUsers,
  getChatsForUser,
  getStoredDirectChats,
  saveStoredUnreadCounts,
  saveStoredDirectChats,
  stories,
  trustCards,
  type DemoUser,
  type ChatFilter,
  type ChatMessage,
  type StoredUnreadCounts,
  type StoredDirectChat,
  type ChatSummary
} from "@/lib/data";
import { useDemoSession } from "@/components/providers/demo-session";
import { Avatar, Panel, Pill, SectionTitle, cn } from "@/components/ui/primitives";

const THREADS_STORAGE_KEY = "aura-demo-threads";
const TYPING_STORAGE_KEY = "aura-demo-typing";
const CHATS_STORAGE_KEY = "aura-demo-chats";
const TYPING_TIMEOUT_MS = 1800;
const UNREAD_COUNTS_STORAGE_KEY = "aura-demo-unread-counts";
const CALL_STORAGE_KEY = "aura-demo-active-call";
const CALL_SIGNAL_CHANNEL = "aura-demo-call-signal";

type CallMode = "voice" | "video";
type CallRecordStatus = "ringing" | "active" | "declined" | "ended";

interface StoredCallRecord {
  id: string;
  callerId: string;
  callerName: string;
  calleeId: string;
  calleeName: string;
  mode: CallMode;
  status: CallRecordStatus;
  createdAt: number;
  updatedAt: number;
}

interface DashboardCallState {
  id: string;
  chatId: string;
  contactId: string;
  contactName: string;
  mode: CallMode;
  status: CallRecordStatus | "unsupported";
  direction: "incoming" | "outgoing";
  error?: string;
}

type CallSignalMessage =
  | {
      type: "accept" | "decline" | "end";
      sessionId: string;
      fromUserId: string;
      targetUserId: string;
    }
  | {
      type: "offer" | "answer";
      sessionId: string;
      fromUserId: string;
      targetUserId: string;
      description: RTCSessionDescriptionInit;
    }
  | {
      type: "ice-candidate";
      sessionId: string;
      fromUserId: string;
      targetUserId: string;
      candidate: RTCIceCandidateInit;
    };

function readStoredCallRecord() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(CALL_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredCallRecord;
  } catch {
    window.localStorage.removeItem(CALL_STORAGE_KEY);
    return null;
  }
}

function writeStoredCallRecord(record: StoredCallRecord | null) {
  if (typeof window === "undefined") return;

  if (!record) {
    window.localStorage.removeItem(CALL_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(CALL_STORAGE_KEY, JSON.stringify(record));
}

function deriveDashboardCallState(userId: string, record: StoredCallRecord | null) {
  if (!record) return null;
  if (record.callerId !== userId && record.calleeId !== userId) return null;

  const isCaller = record.callerId === userId;

  return {
    id: record.id,
    chatId: record.callerId === "jordan" || record.callerId === "maya"
      ? "chat_1"
      : `direct_${[record.callerId, record.calleeId].sort().join("_")}`,
    contactId: isCaller ? record.calleeId : record.callerId,
    contactName: isCaller ? record.calleeName : record.callerName,
    mode: record.mode,
    status: record.status,
    direction: isCaller ? "outgoing" : "incoming"
  } satisfies DashboardCallState;
}

function createRtcConfig(): RTCConfiguration {
  return {
    iceServers: [
      {
        urls: ["stun:stun.l.google.com:19302"]
      }
    ]
  };
}

function resolveCallPeer(
  currentUser: DemoUser,
  activeChat: ChatSummary,
  users: DemoUser[],
  sharedChats: StoredDirectChat[]
) {
  if (activeChat.kind === "group") return null;

  if (activeChat.id === "chat_1") {
    return users.find((entry) => entry.id !== currentUser.id && (entry.id === "jordan" || entry.id === "maya")) ?? null;
  }

  const sharedChat = sharedChats.find((chat) => chat.id === activeChat.id);
  if (sharedChat) {
    const otherUserId = sharedChat.participantIds.find((participantId) => participantId !== currentUser.id);
    return users.find((entry) => entry.id === otherUserId) ?? null;
  }

  return users.find((entry) => entry.id !== currentUser.id && entry.name === activeChat.name) ?? null;
}

function getUnreadRecipients(chatId: string, senderId: string, sharedChats: StoredDirectChat[], users: DemoUser[]) {
  const sharedChat = sharedChats.find((chat) => chat.id === chatId);
  if (sharedChat) {
    return sharedChat.participantIds.filter((participantId) => participantId !== senderId);
  }

  if (chatId === "chat_1") {
    return ["jordan", "maya"].filter((participantId) => participantId !== senderId);
  }

  if (chatId === "chat_2") {
    return users.map((entry) => entry.id).filter((participantId) => participantId !== senderId);
  }

  return [];
}

function getActionTone(action?: string | null) {
  switch (action) {
    case "Ban user":
      return {
        pill: "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200",
        panel: "border-rose-200 bg-rose-50/80 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-100",
        soft: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200"
      };
    case "Suspend user":
      return {
        pill: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200",
        panel: "border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100",
        soft: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200"
      };
    case "Reactivate user":
      return {
        pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200",
        panel: "border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-100",
        soft: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200"
      };
    case "Add internal note":
      return {
        pill: "bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-200",
        panel: "border-sky-200 bg-sky-50/80 text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-100",
        soft: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-200"
      };
    default:
      return {
        pill: "bg-slate-100 text-slate-700 dark:bg-slate-900/70 dark:text-slate-200",
        panel: "border-slate-200 bg-slate-50/80 text-slate-900 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100",
        soft: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
      };
  }
}

function buildSharedChatsForUser(
  user: DemoUser,
  users: DemoUser[],
  sharedChats: StoredDirectChat[],
  threads: Record<string, ChatMessage[]>
) {
  return sharedChats
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

function ChatList({
  activeChatId,
  chatFilter,
  chats,
  query,
  selectedOnMobile,
  onChatSelect,
  onFilterChange,
  onQueryChange
}: {
  activeChatId: string;
  chatFilter: ChatFilter;
  chats: ChatSummary[];
  query: string;
  selectedOnMobile: boolean;
  onChatSelect: (chatId: string) => void;
  onFilterChange: (filter: ChatFilter) => void;
  onQueryChange: (value: string) => void;
}) {
  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const matchesQuery =
        query.length === 0 ||
        chat.name.toLowerCase().includes(query.toLowerCase()) ||
        chat.preview.toLowerCase().includes(query.toLowerCase());

      const matchesFilter =
        chatFilter === "All" ||
        (chatFilter === "Unread" && chat.unread > 0) ||
        (chatFilter === "Groups" && chat.kind === "group") ||
        (chatFilter === "Archived" && chat.archived);

      return matchesQuery && matchesFilter;
    });
  }, [chatFilter, chats, query]);

  return (
    <Panel className={cn("flex w-full flex-col p-5 xl:max-w-sm", selectedOnMobile && "hidden md:flex")}>
      <SectionTitle title="Messages" subtitle="Encrypted by default with AI that stays in the background until you need it." />
      <div className="mt-5 flex items-center gap-3 overflow-auto pb-1">
        {stories.map((story) => (
          <div key={story.id} className="space-y-2 text-center">
            <div className={cn("rounded-full bg-gradient-to-br p-[2px]", story.tone)}>
              <div className="rounded-full bg-white p-1 dark:bg-slate-950">
                <Avatar name={story.name} />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{story.name}</p>
          </div>
        ))}
      </div>
      <label className="mt-5 rounded-3xl border border-white/50 bg-white/80 p-3 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
          placeholder="Search chats, files, people, or intent"
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["All", "Unread", "Groups", "Archived"] as ChatFilter[]).map((filter) => (
          <button key={filter} type="button" onClick={() => onFilterChange(filter)}>
            <Pill active={chatFilter === filter}>{filter}</Pill>
          </button>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {filteredChats.map((chat) => (
          <button
            key={chat.id}
            type="button"
            onClick={() => onChatSelect(chat.id)}
            className={cn(
              "flex w-full min-w-0 items-start gap-3 overflow-hidden rounded-3xl border border-white/50 bg-white/80 p-4 text-left shadow-soft transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-900/80",
              activeChatId === chat.id && "ring-2 ring-aura-400/60"
            )}
          >
            <Avatar name={chat.name} tone={chat.id === "chat_2" ? "green" : "blue"} />
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{chat.name}</p>
                <span className="text-xs text-slate-400">{chat.time}</span>
              </div>
              <p className="mt-1 text-xs text-emerald-500">{chat.presence}</p>
              <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{chat.preview}</p>
            </div>
            {chat.unread ? (
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-aura-500 px-2 text-xs font-semibold text-white">
                {chat.unread}
              </span>
            ) : null}
            {activeChatId === chat.id ? (
              <span className="sr-only">{chat.name} selected</span>
            ) : null}
          </button>
        ))}
        {filteredChats.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-sm text-slate-400 dark:border-slate-700">
            No chats match this search yet.
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

function MessageBubble({
  body,
  meta,
  author,
  currentUserName
}: {
  body: string;
  meta: string;
  author: string;
  currentUserName: string;
}) {
  const isRight = author === currentUserName;
  return (
    <div className={cn("flex", isRight ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-xl rounded-[28px] px-4 py-3 shadow-soft",
          isRight
            ? "bg-aura-500 text-white"
            : "border border-white/60 bg-white/85 text-slate-800 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100"
        )}
      >
        <p className={cn("text-xs font-medium", isRight ? "text-aura-100" : "text-slate-400")}>{author}</p>
        <p className="mt-1 text-sm leading-6">{body}</p>
        <p className={cn("mt-2 text-xs", isRight ? "text-aura-100" : "text-slate-400")}>{meta}</p>
      </div>
    </div>
  );
}

function Conversation({
  activeChat,
  thread,
  composer,
  isMobileView,
  currentUserName,
  typingUserName,
  onComposerChange,
  onBack,
  onCall,
  onVideoCall,
  onDetails,
  onSend,
  onInsertSuggestion
}: {
  activeChat: ChatSummary;
  thread: ChatMessage[];
  composer: string;
  isMobileView: boolean;
  currentUserName: string;
  typingUserName: string | null;
  onComposerChange: (value: string) => void;
  onBack: () => void;
  onCall: () => void;
  onVideoCall: () => void;
  onDetails: () => void;
  onSend: () => void;
  onInsertSuggestion: (value: string) => void;
}) {
  const showTypingIndicator = Boolean(typingUserName);
  const typingLabel = typingUserName ? `${typingUserName} is typing...` : "";

  return (
    <Panel className={cn("flex min-h-[760px] min-w-0 flex-1 flex-col overflow-hidden p-4 md:p-5", !isMobileView && "hidden md:flex")}>
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/50 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-slate-900/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 md:hidden dark:bg-slate-800 dark:text-slate-300"
          >
            ←
          </button>
          <Avatar name={activeChat.name} tone={activeChat.kind === "group" ? "green" : "blue"} />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{activeChat.name}</p>
            <p className="text-xs text-emerald-500">{activeChat.presence} • end-to-end encrypted</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCall}>
            <Pill>Call</Pill>
          </button>
          <button type="button" onClick={onVideoCall}>
            <Pill className="hidden sm:inline-flex">Video</Pill>
          </button>
          <button type="button" onClick={onDetails}>
            <Pill className="hidden lg:inline-flex">Details</Pill>
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-dashed border-aura-200 bg-aura-50/80 px-4 py-3 text-sm text-aura-900 dark:border-aura-900/50 dark:bg-aura-950/30 dark:text-aura-100">
        Unread summary: headline tone needs polish, Arabic CTA is pending, and legal review lands before 3 PM.
      </div>

      <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto rounded-[2rem] bg-gradient-to-b from-white/55 to-transparent p-2 dark:from-slate-950/40">
        <div className="mx-auto w-fit rounded-full border border-white/50 bg-white/80 px-3 py-1 text-xs text-slate-400 dark:border-white/10 dark:bg-slate-900/80">
          Today
        </div>
        {thread.map((message) => (
          <MessageBubble key={message.id} {...message} currentUserName={currentUserName} />
        ))}
        {showTypingIndicator ? (
          <div className="flex justify-start">
            <div className="rounded-full bg-white/80 px-3 py-2 text-xs text-slate-500 shadow-soft dark:bg-slate-900/80 dark:text-slate-300">
              {typingLabel}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {aiChips.map((chip) => (
          <button key={chip.id} type="button" onClick={() => onInsertSuggestion(chip.label)}>
            <Pill>{chip.label}</Pill>
          </button>
        ))}
      </div>

      <form
        className="mt-3 rounded-[2rem] border border-white/50 bg-white/80 p-3 shadow-soft dark:border-white/10 dark:bg-slate-900/80"
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
      >
        <div className="mb-3 rounded-2xl border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-400 dark:border-slate-700">
          Drag files here, record voice, or ask Aura AI to draft a reply.
        </div>
        <div className="flex items-end gap-3">
          <textarea
            value={composer}
            onChange={(event) => onComposerChange(event.target.value)}
            rows={3}
            placeholder="Rewrite professionally, translate before send, or type a message..."
            className="min-h-14 flex-1 resize-none rounded-[1.5rem] border-0 bg-slate-100 px-4 py-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-200"
          />
          <button
            type="submit"
            disabled={composer.trim().length === 0}
            className="rounded-full bg-aura-500 px-5 py-4 text-sm font-semibold text-white shadow-soft disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
          >
            Send
          </button>
        </div>
      </form>
    </Panel>
  );
}

function DetailsPanel({
  chatLocked,
  disappearingMode,
  onSummarizeUnread,
  onRewriteDraft,
  onToggleChatLock,
  onCycleDisappearingMode
}: {
  chatLocked: boolean;
  disappearingMode: "Off" | "24h" | "7d";
  onSummarizeUnread: () => void;
  onRewriteDraft: () => void;
  onToggleChatLock: () => void;
  onCycleDisappearingMode: () => void;
}) {
  const securityActions = [
    {
      id: "lock",
      title: chatLocked ? "Chat lock is active" : "Chat lock is available",
      description: chatLocked
        ? "This conversation is currently protected behind a lock state for demo privacy."
        : "Add a privacy gate so this conversation needs a secure unlock before viewing.",
      actionLabel: chatLocked ? "Unlock chat" : "Lock chat",
      onClick: onToggleChatLock
    },
    {
      id: "disappearing",
      title: `Disappearing messages: ${disappearingMode}`,
      description: "Cycle between off, 24 hours, and 7 days to simulate message retention controls.",
      actionLabel: "Change timer",
      onClick: onCycleDisappearingMode
    }
  ];

  const aiActions = [
    {
      id: "summary",
      title: "Summarize unread",
      description: "Generate a quick catch-up note from the unread or recent conversation flow.",
      actionLabel: "Run summary",
      onClick: onSummarizeUnread
    },
    {
      id: "rewrite",
      title: "Rewrite current draft",
      description: "Turn the composer text into a clearer professional draft before sending.",
      actionLabel: "Rewrite draft",
      onClick: onRewriteDraft
    }
  ];

  return (
    <Panel className="w-full p-5">
      <SectionTitle title="AI + Security" subtitle="Clear trust signals and useful assistance, never noisy." />
      <div className="mt-5 space-y-3">
        {aiActions.map((card) => (
          <div
            key={card.id}
            className="rounded-3xl border border-white/50 bg-white/80 p-4 shadow-soft dark:border-white/10 dark:bg-slate-900/80"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{card.title}</p>
              <button type="button" onClick={card.onClick}>
                <Pill active>{card.actionLabel}</Pill>
              </button>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <SectionTitle title="Security actions" subtitle="Privacy controls you can actually use inside the chat." />
        <div className="mt-3 space-y-3">
          {securityActions.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between rounded-3xl border border-white/50 bg-white/80 p-4 text-sm shadow-soft dark:border-white/10 dark:bg-slate-900/80"
            >
              <div className="pr-4">
                <div className="font-medium text-slate-700 dark:text-slate-200">{alert.title}</div>
                <div className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{alert.description}</div>
              </div>
              <button type="button" onClick={alert.onClick}>
                <Pill>{alert.actionLabel}</Pill>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <SectionTitle title="Moderation queue" subtitle="Enterprise-ready admin visibility" />
        <div className="mt-3 space-y-3">
          {adminAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between rounded-3xl border border-white/50 bg-white/80 p-4 text-sm shadow-soft dark:border-white/10 dark:bg-slate-900/80"
            >
              <span className="font-medium text-slate-700 dark:text-slate-200">{alert.title}</span>
              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
                {alert.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function ChatDetailsDrawer({
  open,
  activeChat,
  knownUsers,
  onClose
}: {
  open: boolean;
  activeChat: ChatSummary;
  knownUsers: DemoUser[];
  onClose: () => void;
}) {
  if (!open) return null;

  const profile =
    knownUsers.find((entry) => entry.name === activeChat.name) ?? {
      name: activeChat.name,
      role: activeChat.kind === "group" ? "Group workspace" : "Conversation contact",
      email: activeChat.kind === "group" ? "group@aura.app" : "contact@aura.app",
      phone: activeChat.kind === "group" ? "Invite only" : "+1 555 000 0000"
    };

  const quickMedia = [
    "Launch-deck-v4.pdf",
    "Campaign-wireframe.png",
    "Voice-note-brief.m4a",
    "Arabic-cta-copy.docx"
  ];

  const aiActions = [
    "Summarize this conversation",
    "Catch me up on unread items",
    "Find action items",
    "Translate recent messages"
  ];

  return (
    <div className="fixed inset-0 z-[65] bg-slate-950/68 backdrop-blur-md">
      <div className="flex min-h-full justify-end">
        <div className="flex h-screen w-full max-w-xl flex-col overflow-hidden border-l border-white/10 bg-slate-950/96 shadow-panel">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-aura-400">Details</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{activeChat.name}</h2>
              <p className="mt-2 text-sm text-slate-400">Profile, shared content, privacy signals, and AI shortcuts.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-slate-300 transition hover:bg-white/10"
            >
              ×
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div className="rounded-[1.8rem] border border-white/10 bg-white/4 p-5">
              <div className="flex items-center gap-4">
                <Avatar name={activeChat.name} tone={activeChat.kind === "group" ? "green" : "blue"} />
                <div>
                  <p className="text-lg font-semibold text-white">{activeChat.name}</p>
                  <p className="mt-1 text-sm text-emerald-400">{activeChat.presence}</p>
                  <p className="mt-2 text-sm text-slate-400">{profile.role}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-300">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</div>
                  <div className="mt-2">{profile.email}</div>
                </div>
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-300">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Phone</div>
                  <div className="mt-2">{profile.phone}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-white/4 p-5">
              <p className="text-sm font-semibold text-white">Quick actions</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {["Search in chat", "Mute chat", "Archive", "Block", "Report"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="rounded-[1.2rem] border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-200 transition hover:border-aura-400/40"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-white/4 p-5">
              <p className="text-sm font-semibold text-white">Shared media and files</p>
              <div className="mt-4 grid gap-3">
                {quickMedia.map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-white/4 p-5">
              <p className="text-sm font-semibold text-white">Privacy and trust</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-300">End-to-end encryption active</div>
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-300">Disappearing messages ready</div>
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-300">Read receipts visible</div>
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-300">Chat lock available</div>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-white/4 p-5">
              <p className="text-sm font-semibold text-white">AI tools</p>
              <div className="mt-4 grid gap-3">
                {aiActions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-aura-400/40"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewChatModal({
  open,
  chats,
  currentUserName,
  availableUsers,
  onClose,
  onCreateChat,
  onSelectChat
}: {
  open: boolean;
  chats: ChatSummary[];
  currentUserName: string;
  availableUsers: Array<{ id: string; name: string; email: string; phone: string }>;
  onClose: () => void;
  onCreateChat: (payload: { name: string; contact: string }) => string | null;
  onSelectChat: (chatId: string) => void;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const startableChats = chats.filter((chat) => !chat.archived);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/72 backdrop-blur-md">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/12 bg-slate-950/96 shadow-panel">
          <div className="border-b border-white/10 px-5 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-aura-400">Compose</p>
                <p className="mt-2 text-2xl font-semibold text-white">Start a new chat</p>
                <p className="mt-2 text-sm text-slate-400">Pick a person or group to jump into the conversation.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-slate-300 transition hover:bg-white/10"
              >
                ×
              </button>
            </div>
          </div>

          <div className="max-h-[78vh] overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-6">
            <div className="grid min-w-0 gap-5 xl:grid-cols-[1.02fr_0.98fr]">
              <div className="rounded-3xl border border-white/10 bg-white/4 p-4">
                <p className="text-sm font-semibold text-white">Add new friend</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Create a direct chat using their name and either phone number or email.
                </p>
                <div className="mt-4 grid gap-3">
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Friend name"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-aura-400"
                  />
                  <input
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    placeholder="Phone number or email"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-aura-400"
                  />
                  <button
                    type="button"
                    disabled={!name.trim() || !contact.trim()}
                    onClick={() => {
                      const createdChatId = onCreateChat({ name: name.trim(), contact: contact.trim() });
                      if (!createdChatId) {
                        setError("This friend needs to sign up first using the same phone number or email.");
                        return;
                      }
                      setError("");
                      setName("");
                      setContact("");
                    }}
                    className="rounded-2xl bg-aura-500 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-700"
                  >
                    Add friend and open chat
                  </button>
                </div>
                {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
                <p className="mt-4 text-xs text-slate-500">You are creating this chat as {currentUserName}.</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/4 p-4">
                <p className="text-sm font-semibold text-white">Signed-up users</p>
                <p className="mt-1 text-sm text-slate-400">Use one of these contacts to start a verified demo conversation.</p>
                <div className="mt-4 space-y-2">
                  {availableUsers.map((entry) => (
                    <div key={entry.id} className="rounded-2xl bg-slate-950 px-4 py-3 text-xs text-slate-300">
                      <div className="font-medium text-white">{entry.name}</div>
                      <div className="mt-1">{entry.email}</div>
                      <div>{entry.phone}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Existing chats</p>
              <div className="mt-3 grid min-w-0 gap-3">
                {startableChats.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => onSelectChat(chat.id)}
                    className="flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-3xl border border-white/10 bg-white/4 px-4 py-4 text-left transition hover:border-aura-400/40 hover:bg-white/8"
                  >
                    <Avatar name={chat.name} tone={chat.kind === "group" ? "green" : "blue"} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{chat.name}</p>
                      <p className="mt-1 truncate text-sm text-slate-400">{chat.preview}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatWorkspace() {
  const { user, isAuthenticated } = useDemoSession();
  const signalChannelRef = useRef<BroadcastChannel | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeCallRef = useRef<DashboardCallState | null>(null);
  const [knownUsers, setKnownUsers] = useState(() => getStoredDemoUsers());
  const [sharedChats, setSharedChats] = useState<StoredDirectChat[]>([]);
  const [userControlState, setUserControlState] = useState(() => getStoredAdminUserControls()[user.id]);
  const [latestUserAction, setLatestUserAction] = useState(() =>
    getStoredAdminBehaviorActions().find((item) => item.targetType === "user" && item.targetId === user.id) ?? null
  );
  const [activeChatId, setActiveChatId] = useState("chat_1");
  const [chatFilter, setChatFilter] = useState<ChatFilter>("All");
  const [query, setQuery] = useState("");
  const [composer, setComposer] = useState("");
  const [customChats, setCustomChats] = useState<ChatSummary[]>([]);
  const [threadMap, setThreadMap] = useState(baseThreads);
  const [unreadCounts, setUnreadCounts] = useState<StoredUnreadCounts>({});
  const [showConversationOnMobile, setShowConversationOnMobile] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [chatLocked, setChatLocked] = useState(false);
  const [disappearingMode, setDisappearingMode] = useState<"Off" | "24h" | "7d">("Off");
  const [callNotice, setCallNotice] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<DashboardCallState | null>(null);
  const [callMediaError, setCallMediaError] = useState<string | null>(null);
  const [mediaVersion, setMediaVersion] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeakerMode, setIsSpeakerMode] = useState(true);
  const [typingMap, setTypingMap] = useState<Record<string, { userName: string; updatedAt: number }>>({});

  useEffect(() => {
    setKnownUsers(getStoredDemoUsers());
    setSharedChats(getStoredDirectChats());
    setUserControlState(getStoredAdminUserControls()[user.id]);
    setLatestUserAction(getStoredAdminBehaviorActions().find((item) => item.targetType === "user" && item.targetId === user.id) ?? null);
    setUnreadCounts(getStoredUnreadCounts(getStoredDemoUsers()));

    const storedChats = window.localStorage.getItem(CHATS_STORAGE_KEY);
    if (storedChats) {
      try {
        setCustomChats(JSON.parse(storedChats) as ChatSummary[]);
      } catch {
        window.localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify([]));
      }
    } else {
      window.localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify([]));
    }

    const stored = window.localStorage.getItem(THREADS_STORAGE_KEY);
    if (!stored) {
      window.localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(baseThreads));
      return;
    }

    try {
      setThreadMap(JSON.parse(stored) as Record<string, ChatMessage[]>);
    } catch {
      window.localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(baseThreads));
      setThreadMap(baseThreads);
    }
  }, [user.id]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === "aura-admin-user-controls") {
        setUserControlState(getStoredAdminUserControls()[user.id]);
        return;
      }

      if (event.key === "aura-admin-behavior-actions") {
        setLatestUserAction(getStoredAdminBehaviorActions().find((item) => item.targetType === "user" && item.targetId === user.id) ?? null);
        return;
      }

      if (event.key === "aura-demo-users") {
        setKnownUsers(getStoredDemoUsers());
        return;
      }

      if (event.key === "aura-demo-shared-chats") {
        setSharedChats(getStoredDirectChats());
        return;
      }

      if (event.key === UNREAD_COUNTS_STORAGE_KEY) {
        setUnreadCounts(getStoredUnreadCounts(getStoredDemoUsers()));
        return;
      }

      if (event.key === CHATS_STORAGE_KEY && event.newValue) {
        try {
          setCustomChats(JSON.parse(event.newValue) as ChatSummary[]);
        } catch {
          // Ignore malformed demo storage values.
        }
        return;
      }

      if (event.key !== THREADS_STORAGE_KEY || !event.newValue) return;

      try {
        setThreadMap(JSON.parse(event.newValue) as Record<string, ChatMessage[]>);
      } catch {
        // Ignore malformed demo storage values.
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [user.id]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setUserControlState(getStoredAdminUserControls()[user.id]);
      setLatestUserAction(
        getStoredAdminBehaviorActions().find((item) => item.targetType === "user" && item.targetId === user.id) ?? null
      );
    }, 800);

    return () => {
      window.clearInterval(interval);
    };
  }, [user.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      setActiveCall(null);
      return;
    }

    const syncCallState = () => {
      setActiveCall(deriveDashboardCallState(user.id, readStoredCallRecord()));
    };

    syncCallState();

    const onStorage = (event: StorageEvent) => {
      if (event.key !== CALL_STORAGE_KEY) return;
      syncCallState();
    };

    window.addEventListener("storage", onStorage);
    const interval = window.setInterval(syncCallState, 500);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(interval);
    };
  }, [isAuthenticated, user.id]);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      return;
    }

    const channel = new BroadcastChannel(CALL_SIGNAL_CHANNEL);
    signalChannelRef.current = channel;

    const stopMedia = () => {
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      pendingIceCandidatesRef.current = [];
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      remoteStreamRef.current = null;
      setMediaVersion((value) => value + 1);
    };

    const bindRemoteTrack = (event: RTCTrackEvent) => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }

      const incomingTracks =
        event.streams[0]?.getTracks().length
          ? event.streams[0].getTracks()
          : [event.track];

      for (const track of incomingTracks) {
        if (!remoteStreamRef.current.getTracks().some((entry) => entry.id === track.id)) {
          remoteStreamRef.current.addTrack(track);
        }
      }

      setMediaVersion((value) => value + 1);
    };

    const createPeerConnection = (sessionId: string, targetUserId: string) => {
      peerConnectionRef.current?.close();

      const connection = new RTCPeerConnection(createRtcConfig());
      remoteStreamRef.current = new MediaStream();

      for (const track of localStreamRef.current?.getTracks() ?? []) {
        connection.addTrack(track, localStreamRef.current as MediaStream);
      }

      connection.ontrack = bindRemoteTrack;
      connection.onicecandidate = (event) => {
        if (!event.candidate) return;
        channel.postMessage({
          type: "ice-candidate",
          sessionId,
          fromUserId: user.id,
          targetUserId,
          candidate: event.candidate.toJSON()
        } satisfies CallSignalMessage);
      };

      connection.onconnectionstatechange = () => {
        if (connection.connectionState === "connected") {
          setCallNotice("Live media connected.");
        }

        if (connection.connectionState === "failed" || connection.connectionState === "disconnected" || connection.connectionState === "closed") {
          if (activeCallRef.current?.status === "active") {
            setCallNotice("Call connection ended.");
          }
        }
      };

      peerConnectionRef.current = connection;
      setMediaVersion((value) => value + 1);
      return connection;
    };

    const ensureLocalMedia = async (mode: CallMode) => {
      if (localStreamRef.current) return localStreamRef.current;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mode === "video"
      });

      localStreamRef.current = stream;
      setCallMediaError(null);
      setMediaVersion((value) => value + 1);
      return stream;
    };

    const flushPendingCandidates = async () => {
      if (!peerConnectionRef.current?.remoteDescription) return;

      while (pendingIceCandidatesRef.current.length > 0) {
        const candidate = pendingIceCandidatesRef.current.shift();
        if (!candidate) continue;
        await peerConnectionRef.current.addIceCandidate(candidate);
      }
    };

    channel.onmessage = async (event: MessageEvent<CallSignalMessage>) => {
      const signal = event.data;
      if (!signal || signal.targetUserId !== user.id) return;

      const currentCall = activeCallRef.current;
      if (!currentCall || currentCall.id !== signal.sessionId) return;

      try {
        if (signal.type === "accept") {
          const record = readStoredCallRecord();
          if (!record || record.id !== signal.sessionId) return;

          await ensureLocalMedia(record.mode);
          const connection = createPeerConnection(record.id, signal.fromUserId);
          const offer = await connection.createOffer();
          await connection.setLocalDescription(offer);
          channel.postMessage({
            type: "offer",
            sessionId: record.id,
            fromUserId: user.id,
            targetUserId: signal.fromUserId,
            description: offer
          } satisfies CallSignalMessage);
          return;
        }

        if (signal.type === "offer") {
          const record = readStoredCallRecord();
          if (!record || record.id !== signal.sessionId) return;

          await ensureLocalMedia(record.mode);
          const connection = createPeerConnection(record.id, signal.fromUserId);
          await connection.setRemoteDescription(new RTCSessionDescription(signal.description));
          await flushPendingCandidates();
          const answer = await connection.createAnswer();
          await connection.setLocalDescription(answer);
          channel.postMessage({
            type: "answer",
            sessionId: record.id,
            fromUserId: user.id,
            targetUserId: signal.fromUserId,
            description: answer
          } satisfies CallSignalMessage);
          return;
        }

        if (signal.type === "answer") {
          if (!peerConnectionRef.current) return;
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal.description));
          await flushPendingCandidates();
          setCallNotice("Live media connected.");
          return;
        }

        if (signal.type === "ice-candidate") {
          if (!peerConnectionRef.current || !peerConnectionRef.current.remoteDescription) {
            pendingIceCandidatesRef.current.push(signal.candidate);
            return;
          }

          await peerConnectionRef.current.addIceCandidate(signal.candidate);
          return;
        }

        if (signal.type === "decline" || signal.type === "end") {
          stopMedia();
          return;
        }
      } catch (error) {
        stopMedia();
        setCallMediaError(error instanceof Error ? error.message : "Unable to connect the live media session.");
      }
    };

    return () => {
      channel.close();
      signalChannelRef.current = null;
      stopMedia();
    };
  }, [isAuthenticated, user.id]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.muted = true;
      void localVideoRef.current.play().catch(() => {});
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
      remoteVideoRef.current.volume = isSpeakerMode ? 1 : 0.35;
      void remoteVideoRef.current.play().catch(() => {});
    }
  }, [activeCall?.id, activeCall?.mode, activeCall?.status, isSpeakerMode, mediaVersion]);

  useEffect(() => {
    if (activeCall?.status === "declined" || activeCall?.status === "ended" || activeCall?.status === "unsupported" || !activeCall) {
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      pendingIceCandidatesRef.current = [];
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      remoteStreamRef.current = null;
      resetCallControls();
      setMediaVersion((value) => value + 1);
    }
  }, [activeCall]);

  useEffect(() => {
    if (!callNotice) return;

    const timeout = window.setTimeout(() => {
      setCallNotice(null);
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [callNotice]);

  useEffect(() => {
    const readTypingState = (raw: string | null) => {
      if (!raw) return;
      try {
        setTypingMap(JSON.parse(raw) as Record<string, { userName: string; updatedAt: number }>);
      } catch {
        // Ignore malformed demo storage values.
      }
    };

    readTypingState(window.localStorage.getItem(TYPING_STORAGE_KEY));

    const onStorage = (event: StorageEvent) => {
      if (event.key !== TYPING_STORAGE_KEY) return;
      readTypingState(event.newValue);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTypingMap((current) => {
        const nextEntries = Object.fromEntries(
          Object.entries(current).filter(([, value]) => Date.now() - value.updatedAt < TYPING_TIMEOUT_MS)
        );

        if (Object.keys(nextEntries).length !== Object.keys(current).length) {
          window.localStorage.setItem(TYPING_STORAGE_KEY, JSON.stringify(nextEntries));
          return nextEntries;
        }

        return current;
      });
    }, 500);

    return () => window.clearInterval(interval);
  }, []);

  const chats = useMemo(() => {
    const baseChatList = [
      ...getChatsForUser(user),
      ...buildSharedChatsForUser(user, knownUsers, sharedChats, threadMap),
      ...customChats
    ];

    return baseChatList.map((chat) => {
      const thread = threadMap[chat.id] ?? [];
      const latest = thread[thread.length - 1];

      if (!latest) return chat;

      return {
        ...chat,
        preview: latest.body,
        time: latest.meta.split(" • ")[0],
        unread: unreadCounts[user.id]?.[chat.id] ?? chat.unread ?? 0
      };
    });
  }, [customChats, knownUsers, sharedChats, threadMap, unreadCounts, user]);

  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? chats[0];
  const activeThread = activeChat ? threadMap[activeChat.id] ?? [] : [];
  const typingState = activeChat ? typingMap[activeChat.id] : undefined;
  const typingUserName =
    typingState && typingState.userName !== user.name && Date.now() - typingState.updatedAt < TYPING_TIMEOUT_MS
      ? typingState.userName
      : null;

  const appendSystemThreadMessage = (chatId: string, body: string) => {
    const nextMessage: ChatMessage = {
      id: `call_${Date.now()}`,
      author: "System",
      body,
      meta: "Now"
    };

    setThreadMap((current) => {
      const nextThreadMap = {
        ...current,
        [chatId]: [...(current[chatId] ?? []), nextMessage]
      };

      window.localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(nextThreadMap));
      return nextThreadMap;
    });
  };

  const resetCallControls = () => {
    setIsMicMuted(false);
    setIsCameraOff(false);
    setIsSpeakerMode(true);
  };

  const summarizeUnread = () => {
    appendSystemThreadMessage(
      activeChat.id,
      "Aura AI summary: Maya approved the landing page, the Arabic CTA is still open, and legal review is due before 3 PM."
    );
    setCallNotice("Unread summary added to the conversation.");
  };

  const rewriteDraft = () => {
    const source = composer.trim();
    if (!source) {
      setComposer("Could you please share the latest approved version when you have a moment? I want to review it before the call.");
      setCallNotice("Aura AI drafted a professional reply in the composer.");
      return;
    }

    setComposer(`Polished draft: ${source.charAt(0).toUpperCase()}${source.slice(1)} Please share any final updates before we proceed.`);
    setCallNotice("Your draft was rewritten with a more professional tone.");
  };

  const toggleChatLock = () => {
    setChatLocked((current) => {
      const next = !current;
      setCallNotice(next ? "Chat lock is now active for this conversation." : "Chat lock has been removed for this conversation.");
      return next;
    });
  };

  const cycleDisappearingMode = () => {
    setDisappearingMode((current) => {
      const next = current === "Off" ? "24h" : current === "24h" ? "7d" : "Off";
      appendSystemThreadMessage(activeChat.id, `Disappearing messages set to ${next}.`);
      setCallNotice(`Disappearing messages updated to ${next}.`);
      return next;
    });
  };

  const markChatSeen = (chatId: string) => {
    setUnreadCounts((current) => {
      const currentUserCounts = current[user.id] ?? {};
      if ((currentUserCounts[chatId] ?? 0) === 0) return current;

      const nextUnreadCounts = {
        ...current,
        [user.id]: {
          ...currentUserCounts,
          [chatId]: 0
        }
      };

      saveStoredUnreadCounts(nextUnreadCounts);
      return nextUnreadCounts;
    });
  };

  useEffect(() => {
    if (!activeChat?.id) return;
    markChatSeen(activeChat.id);
  }, [activeChat?.id]);

  if (!activeChat) {
    return (
      <Panel className="p-6 md:p-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-dashed border-white/15 bg-white/70 px-6 py-10 text-center shadow-soft dark:bg-slate-900/70">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">No chats available yet</p>
          <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            Start a new conversation from the floating button and the inbox will appear here right away.
          </p>
        </div>
      </Panel>
    );
  }

  const handleStartCall = async (mode: "voice" | "video") => {
    if (!isAuthenticated) {
      setCallNotice("Please log in on both demo tabs before starting a call.");
      return;
    }

    if (activeChat.kind === "group") {
      setCallNotice("Real internet call demo is currently enabled for direct one-to-one chats only.");
      return;
    }

    const otherUser = resolveCallPeer(user, activeChat, knownUsers, sharedChats);
    if (!otherUser) {
      setActiveCall({
        id: `call_${Date.now()}`,
        chatId: activeChat.id,
        contactId: "unsupported",
        contactName: activeChat.name,
        mode,
        status: "unsupported",
        direction: "outgoing",
        error: "Call demo is currently available for signed-in direct users like Jordan and Maya."
      });
      setCallNotice("This contact is not available for the two-tab live call demo yet.");
      return;
    }

    const nextRecord: StoredCallRecord = {
      id: `call_${Date.now()}`,
      callerId: user.id,
      callerName: user.name,
      calleeId: otherUser.id,
      calleeName: otherUser.name,
      mode,
      status: "ringing",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    writeStoredCallRecord(nextRecord);
    setCallMediaError(null);
    setActiveCall(deriveDashboardCallState(user.id, nextRecord));
    setCallNotice(mode === "video" ? `Starting video call with ${activeChat.name}...` : `Starting voice call with ${activeChat.name}...`);
    appendSystemThreadMessage(
      activeChat.id,
      `${user.name} started a ${mode === "video" ? "video" : "voice"} call with ${activeChat.name}.`
    );
  };

  const acceptCall = async () => {
    if (!activeCall) return;
    const record = readStoredCallRecord();
    if (!record || record.id !== activeCall.id) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: record.mode === "video"
      });
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = stream;
      setCallMediaError(null);
      setMediaVersion((value) => value + 1);
    } catch (error) {
      setCallMediaError(error instanceof Error ? error.message : "Microphone or camera permission is required.");
      setCallNotice("Please allow microphone and camera access to join the live call.");
      return;
    }

    const nextRecord: StoredCallRecord = {
      ...record,
      status: "active",
      updatedAt: Date.now()
    };

    writeStoredCallRecord(nextRecord);
    signalChannelRef.current?.postMessage({
      type: "accept",
      sessionId: nextRecord.id,
      fromUserId: user.id,
      targetUserId: nextRecord.callerId
    } satisfies CallSignalMessage);
    setActiveCall(deriveDashboardCallState(user.id, nextRecord));
    setCallNotice(`${activeCall.contactName} call connected.`);
    appendSystemThreadMessage(nextRecord.callerId === "jordan" || nextRecord.callerId === "maya" ? "chat_1" : `direct_${[nextRecord.callerId, nextRecord.calleeId].sort().join("_")}`, `${user.name} accepted the ${record.mode === "video" ? "video" : "voice"} call.`);
  };

  const declineCall = () => {
    if (!activeCall) return;
    const record = readStoredCallRecord();
    if (!record || record.id !== activeCall.id) return;

    const nextRecord: StoredCallRecord = {
      ...record,
      status: "declined",
      updatedAt: Date.now()
    };

    writeStoredCallRecord(nextRecord);
    signalChannelRef.current?.postMessage({
      type: "decline",
      sessionId: nextRecord.id,
      fromUserId: user.id,
      targetUserId: activeCall.direction === "incoming" ? record.callerId : record.calleeId
    } satisfies CallSignalMessage);
    setActiveCall(deriveDashboardCallState(user.id, nextRecord));
    setCallNotice(`Call with ${activeCall.contactName} declined.`);
    appendSystemThreadMessage(activeCall.chatId, `${user.name} declined the ${record.mode === "video" ? "video" : "voice"} call.`);
  };

  const cancelOutgoingCall = () => {
    if (!activeCall) return;
    const record = readStoredCallRecord();
    if (!record || record.id !== activeCall.id) {
      setActiveCall(null);
      return;
    }

    const nextRecord: StoredCallRecord = {
      ...record,
      status: "ended",
      updatedAt: Date.now()
    };

    writeStoredCallRecord(nextRecord);
    signalChannelRef.current?.postMessage({
      type: "end",
      sessionId: nextRecord.id,
      fromUserId: user.id,
      targetUserId: activeCall.direction === "incoming" ? record.callerId : record.calleeId
    } satisfies CallSignalMessage);
    setActiveCall(deriveDashboardCallState(user.id, nextRecord));
    setCallNotice(`Call with ${activeCall.contactName} cancelled.`);
    appendSystemThreadMessage(activeCall.chatId, `${user.name} cancelled the outgoing ${record.mode === "video" ? "video" : "voice"} call.`);

    window.setTimeout(() => {
      const latest = readStoredCallRecord();
      if (latest?.id === nextRecord.id && latest.status === "ended") {
        writeStoredCallRecord(null);
      }
    }, 1200);
  };

  const endCall = () => {
    if (!activeCall) return;
    const record = readStoredCallRecord();

    if (!record || record.id !== activeCall.id) {
      setActiveCall(null);
      return;
    }

    const nextRecord: StoredCallRecord = {
      ...record,
      status: "ended",
      updatedAt: Date.now()
    };

    writeStoredCallRecord(nextRecord);
    signalChannelRef.current?.postMessage({
      type: "end",
      sessionId: nextRecord.id,
      fromUserId: user.id,
      targetUserId: activeCall.direction === "incoming" ? record.callerId : record.calleeId
    } satisfies CallSignalMessage);
    setActiveCall(deriveDashboardCallState(user.id, nextRecord));
    setCallNotice(`Call with ${activeCall.contactName} ended.`);
    appendSystemThreadMessage(activeCall.chatId, `${user.name} ended the ${record.mode === "video" ? "video" : "voice"} call.`);

    window.setTimeout(() => {
      const latest = readStoredCallRecord();
      if (latest?.id === nextRecord.id && latest.status === "ended") {
        writeStoredCallRecord(null);
      }
    }, 1200);
  };

  const updateTypingState = (value: string, chatId: string) => {
    setComposer(value);

    setTypingMap((current) => {
      const nextMap = { ...current };

      if (value.trim().length > 0) {
        nextMap[chatId] = {
          userName: user.name,
          updatedAt: Date.now()
        };
      } else if (nextMap[chatId]?.userName === user.name) {
        delete nextMap[chatId];
      }

      window.localStorage.setItem(TYPING_STORAGE_KEY, JSON.stringify(nextMap));
      return nextMap;
    });
  };

  const sendMessage = () => {
    if (userControlState?.status === "suspended" || userControlState?.status === "banned") {
      return;
    }

    const value = composer.trim();
    if (!value) return;

    const nextMessage: ChatMessage = {
      id: `local_${Date.now()}`,
      author: user.name,
      body: value,
      meta: "Now • Sent"
    };

    setThreadMap((current) => {
      const nextThreadMap = {
        ...current,
        [activeChat.id]: [...(current[activeChat.id] ?? []), nextMessage]
      };

      window.localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(nextThreadMap));
      return nextThreadMap;
    });

    setUnreadCounts((current) => {
      const recipients = getUnreadRecipients(activeChat.id, user.id, sharedChats, knownUsers);
      const nextUnreadCounts = { ...current };

      nextUnreadCounts[user.id] = {
        ...(nextUnreadCounts[user.id] ?? {}),
        [activeChat.id]: 0
      };

      for (const recipientId of recipients) {
        nextUnreadCounts[recipientId] = {
          ...(nextUnreadCounts[recipientId] ?? {}),
          [activeChat.id]: (nextUnreadCounts[recipientId]?.[activeChat.id] ?? 0) + 1
        };
      }

      saveStoredUnreadCounts(nextUnreadCounts);
      return nextUnreadCounts;
    });

    setComposer("");

    setTypingMap((current) => {
      const nextMap = { ...current };
      if (nextMap[activeChat.id]?.userName === user.name) {
        delete nextMap[activeChat.id];
        window.localStorage.setItem(TYPING_STORAGE_KEY, JSON.stringify(nextMap));
      }
      return nextMap;
    });
  };

  const toggleMicMute = () => {
    const nextMuted = !isMicMuted;
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMicMuted(nextMuted);
  };

  const toggleCamera = () => {
    const nextCameraOff = !isCameraOff;
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !nextCameraOff;
    });
    setIsCameraOff(nextCameraOff);
  };

  const toggleSpeakerMode = () => {
    setIsSpeakerMode((current) => !current);
  };

  const createChat = ({ name, contact }: { name: string; contact: string }) => {
    if (userControlState?.status === "suspended" || userControlState?.status === "banned") {
      return null;
    }

    const normalizedContact = contact.trim().toLowerCase();
    const matchedUser = knownUsers.find(
      (entry) =>
        entry.id !== user.id &&
        (entry.email.toLowerCase() === normalizedContact || entry.phone.toLowerCase() === normalizedContact)
    );

    if (!matchedUser) {
      return null;
    }

    const participantIds = [user.id, matchedUser.id].sort();
    const chatId = `direct_${participantIds.join("_")}`;
    const existingSharedChats = JSON.parse(
      window.localStorage.getItem("aura-demo-shared-chats") ?? "[]"
    ) as Array<{ id: string; participantIds: string[]; createdAt: number }>;

    if (!existingSharedChats.some((chat) => chat.id === chatId)) {
      const nextSharedChats = [
        ...existingSharedChats,
        {
          id: chatId,
          participantIds,
          createdAt: Date.now()
        }
      ];
      saveStoredDirectChats(nextSharedChats);
      setSharedChats(nextSharedChats);
    }

    setThreadMap((current) => {
      if (current[chatId]) return current;

      const nextThreadMap = {
        ...current,
        [chatId]: [
          {
            id: `system_${Date.now()}`,
            author: "System",
            body: `${user.name} started a new chat with ${matchedUser.name}.`,
            meta: "Now"
          }
        ]
      };
      window.localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(nextThreadMap));
      return nextThreadMap;
    });

    setActiveChatId(chatId);
    setShowConversationOnMobile(true);
    setShowNewChatModal(false);
    return chatId;
  };

  if (userControlState?.status === "suspended" || userControlState?.status === "banned") {
    const isBanned = userControlState.status === "banned";
    const actionTone = getActionTone(latestUserAction?.action);

    return (
      <Panel className="p-6 md:p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-[2rem] border border-white/50 bg-white/80 p-6 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
            <Pill active className={isBanned ? "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200" : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200"}>
              {isBanned ? "Account banned" : "Account suspended"}
            </Pill>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Messaging access has been restricted
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
              Super admin controls are active on this account, so the inbox, composer, and message history are hidden
              until the restriction is removed.
            </p>
            {latestUserAction ? (
              <div className={cn("mt-4 rounded-3xl border px-4 py-4 text-sm", actionTone.panel)}>
                Latest admin action: <span className="font-semibold">{latestUserAction.action}</span>
                <div className="mt-2">{latestUserAction.rationale}</div>
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 px-4 py-4 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Current state</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {isBanned
                    ? "This user is blocked from platform access and messaging behavior is locked."
                    : "This user is temporarily prevented from viewing or sending messages."}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Next step</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Ask the super admin to review the behavior control panel and reactivate the account when appropriate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch">
        <ChatList
          activeChatId={activeChat.id}
          chatFilter={chatFilter}
          query={query}
          selectedOnMobile={showConversationOnMobile}
          chats={chats}
          onChatSelect={(chatId) => {
            setActiveChatId(chatId);
            setShowConversationOnMobile(true);
            markChatSeen(chatId);
          }}
          onFilterChange={setChatFilter}
          onQueryChange={setQuery}
        />
        <Conversation
          activeChat={activeChat}
          thread={activeThread}
          composer={composer}
          isMobileView={showConversationOnMobile}
          currentUserName={user.name}
          typingUserName={typingUserName}
          onComposerChange={(value) => updateTypingState(value, activeChat.id)}
          onBack={() => setShowConversationOnMobile(false)}
          onCall={() => void handleStartCall("voice")}
          onVideoCall={() => void handleStartCall("video")}
          onDetails={() => setShowDetailsDrawer(true)}
          onSend={sendMessage}
          onInsertSuggestion={setComposer}
        />
      </div>

      {callNotice ? (
        <Panel className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Call status</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{callNotice}</p>
            </div>
            <Pill active>Call</Pill>
          </div>
        </Panel>
      ) : null}

      <div className="grid gap-4 2xl:grid-cols-[1.1fr_0.9fr]">
        {latestUserAction ? (
          <Panel className={cn("p-4", getActionTone(latestUserAction.action).panel)}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Super admin note</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Latest admin action: {latestUserAction.action}
                </p>
              </div>
              <Pill active className={getActionTone(latestUserAction.action).pill}>
                Admin notice
              </Pill>
            </div>
            <p className="mt-3 text-sm leading-6">{latestUserAction.rationale}</p>
          </Panel>
        ) : (
          <Panel className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Super admin note</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  No active behavior control is attached to this account right now.
                </p>
              </div>
              <Pill>Clear</Pill>
            </div>
          </Panel>
        )}

        <DetailsPanel
          chatLocked={chatLocked}
          disappearingMode={disappearingMode}
          onSummarizeUnread={summarizeUnread}
          onRewriteDraft={rewriteDraft}
          onToggleChatLock={toggleChatLock}
          onCycleDisappearingMode={cycleDisappearingMode}
        />
      </div>
      <NewChatModal
        open={showNewChatModal}
        chats={chats}
        currentUserName={user.name}
        availableUsers={knownUsers.filter((entry) => entry.id !== user.id)}
        onClose={() => setShowNewChatModal(false)}
        onCreateChat={createChat}
        onSelectChat={(chatId) => {
          setActiveChatId(chatId);
          setShowConversationOnMobile(true);
          markChatSeen(chatId);
          setShowNewChatModal(false);
        }}
      />
      <ChatDetailsDrawer
        open={showDetailsDrawer}
        activeChat={activeChat}
        knownUsers={knownUsers}
        onClose={() => setShowDetailsDrawer(false)}
      />
      {activeCall ? (
        <div className="fixed inset-0 z-[70] bg-slate-950/76 backdrop-blur-md">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <Panel className="w-full max-w-3xl overflow-hidden p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar name={activeCall.contactName} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-aura-500">
                      {activeCall.direction === "incoming" && activeCall.status === "ringing" ? "Incoming call" : "Live call"}
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      {activeCall.contactName}
                    </h2>
                    <p className="mt-2 text-sm text-emerald-500">
                      {activeCall.status === "ringing" && activeCall.direction === "incoming"
                        ? `${activeCall.mode === "video" ? "Video" : "Voice"} call waiting for your answer`
                        : activeCall.status === "ringing"
                          ? `${activeCall.mode === "video" ? "Video" : "Voice"} call is ringing on the other tab`
                          : activeCall.status === "active"
                            ? `${activeCall.mode === "video" ? "Video" : "Voice"} call connected`
                            : activeCall.status === "declined"
                              ? "Call declined"
                              : activeCall.status === "ended"
                                ? "Call ended"
                                : activeCall.error ?? "Call status updated"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (activeCall.status === "active") {
                      endCall();
                      return;
                    }

                    if (activeCall.status === "ringing" && activeCall.direction === "incoming") {
                      declineCall();
                      return;
                    }

                    if (activeCall.status === "ringing" && activeCall.direction === "outgoing") {
                      cancelOutgoingCall();
                      return;
                    }

                    setActiveCall(null);
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-slate-500 transition hover:bg-white/20 dark:text-slate-300"
                >
                  ×
                </button>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-4">
                  {activeCall.mode === "video" ? (
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="h-[320px] w-full rounded-[1.6rem] bg-slate-950 object-cover"
                    />
                  ) : (
                    <div className="flex h-[320px] items-center justify-center rounded-[1.6rem] bg-slate-950">
                      <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
                      <div className="space-y-4 text-center">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/10">
                          <Avatar name={activeCall.contactName} />
                        </div>
                        <p className="text-sm text-slate-400">Remote voice stream is routed through this live call.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-4">
                    {activeCall.mode === "video" ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="h-40 w-full rounded-[1.4rem] bg-slate-950 object-cover"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center rounded-[1.4rem] bg-slate-950">
                        <video ref={localVideoRef} autoPlay muted playsInline className="hidden" />
                        <div className="space-y-3 text-center">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                            <Avatar name={user.name} />
                          </div>
                          <p className="text-xs text-slate-400">Your microphone is live for this call.</p>
                        </div>
                      </div>
                    )}
                    <p className="mt-3 text-sm text-slate-400">
                      {activeCall.mode === "video"
                        ? "Live camera preview from your device."
                        : "Live microphone session from your device."}
                    </p>
                  </div>

                  <div className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-4 text-sm text-slate-400">
                    <p className="font-medium text-white">Live call details</p>
                    <p className="mt-2">
                      {activeCall.mode === "video"
                        ? "This demo uses real browser camera and microphone streaming between two signed-in tabs."
                        : "This demo uses real browser microphone streaming between two signed-in tabs."}
                    </p>
                    {callMediaError ? <p className="mt-3 text-rose-400">{callMediaError}</p> : null}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={toggleMicMute}
                  className={cn(
                    "rounded-[1.4rem] border px-4 py-3 text-sm font-medium shadow-soft transition",
                    isMicMuted
                      ? "border-amber-400/40 bg-amber-500/15 text-amber-200"
                      : "border-white/15 bg-white/8 text-slate-200 hover:bg-white/12"
                  )}
                >
                  {isMicMuted ? "Mic muted" : "Mute mic"}
                </button>
                <button
                  type="button"
                  onClick={toggleSpeakerMode}
                  className={cn(
                    "rounded-[1.4rem] border px-4 py-3 text-sm font-medium shadow-soft transition",
                    isSpeakerMode
                      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                      : "border-white/15 bg-white/8 text-slate-200 hover:bg-white/12"
                  )}
                >
                  {isSpeakerMode ? "Speaker on" : "Speaker low"}
                </button>
                {activeCall.mode === "video" ? (
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={cn(
                      "rounded-[1.4rem] border px-4 py-3 text-sm font-medium shadow-soft transition",
                      isCameraOff
                        ? "border-rose-400/40 bg-rose-500/15 text-rose-200"
                        : "border-white/15 bg-white/8 text-slate-200 hover:bg-white/12"
                    )}
                  >
                    {isCameraOff ? "Camera off" : "Turn camera off"}
                  </button>
                ) : null}
              </div>

              <div className="mt-8 flex flex-wrap justify-end gap-3">
                {activeCall.direction === "incoming" && activeCall.status === "ringing" ? (
                  <>
                    <button
                      type="button"
                      onClick={declineCall}
                      className="rounded-[1.6rem] border border-white/50 bg-white/85 px-5 py-3 text-sm font-medium text-slate-700 shadow-soft dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-200"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={acceptCall}
                      className="rounded-[1.6rem] bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-soft"
                    >
                      Accept call
                    </button>
                  </>
                ) : null}

                {activeCall.direction === "outgoing" && activeCall.status === "ringing" ? (
                  <>
                    <Pill active>{activeCall.mode === "video" ? "Video ringing" : "Voice ringing"}</Pill>
                    <button
                      type="button"
                      onClick={cancelOutgoingCall}
                      className="rounded-[1.6rem] border border-white/50 bg-white/85 px-5 py-3 text-sm font-medium text-slate-700 shadow-soft dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-200"
                    >
                      Cancel call
                    </button>
                  </>
                ) : null}

                {activeCall.status === "active" ? (
                  <>
                    <Pill active>{activeCall.mode === "video" ? "Video live" : "Voice live"}</Pill>
                    <button
                      type="button"
                      onClick={endCall}
                      className="rounded-[1.6rem] bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-soft"
                    >
                      End call
                    </button>
                  </>
                ) : null}

                {activeCall.status === "declined" || activeCall.status === "ended" || activeCall.status === "unsupported" ? (
                  <button
                    type="button"
                    onClick={() => setActiveCall(null)}
                    className="rounded-[1.6rem] border border-white/50 bg-white/85 px-5 py-3 text-sm font-medium text-slate-700 shadow-soft dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-200"
                  >
                    Close
                  </button>
                ) : null}
              </div>
            </Panel>
          </div>
        </div>
      ) : null}
      {!showNewChatModal ? (
        <button
          type="button"
          onClick={() => setShowNewChatModal(true)}
          className="fixed bottom-24 right-5 z-40 flex items-center gap-3 rounded-full border border-white/35 bg-white/16 px-5 py-4 text-sm font-semibold text-white shadow-panel backdrop-blur-xl transition hover:bg-white/22 lg:bottom-8 lg:right-8 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/16"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/14 ring-1 ring-white/10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </span>
          <span className="hidden sm:inline">New chat</span>
        </button>
      ) : null}
    </div>
  );
}
