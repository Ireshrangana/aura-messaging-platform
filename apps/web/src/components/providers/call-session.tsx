"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";

import { getStoredDemoUsers } from "@/lib/data";
import { useDemoSession } from "@/components/providers/demo-session";
import { Avatar, Panel, Pill } from "@/components/ui/primitives";

const CALL_STORAGE_KEY = "aura-demo-active-call";

type CallMode = "voice" | "video";
type CallRecordStatus = "ringing" | "active" | "declined" | "ended";
type CallDirection = "incoming" | "outgoing";
type CallStatus = "ringing" | "active" | "declined" | "ended" | "unsupported";

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

interface CallState {
  id: string;
  contactId: string;
  contactName: string;
  mode: CallMode;
  status: CallStatus;
  direction: CallDirection;
  error?: string;
}

const CallSessionContext = createContext<{
  currentCall: CallState | null;
  startCall: (contactName: string, mode: CallMode) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => void;
  endCall: () => void;
} | null>(null);

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

function getOtherUserByName(name: string, currentUserId: string) {
  return getStoredDemoUsers().find((entry) => entry.name === name && entry.id !== currentUserId) ?? null;
}

function deriveCallState(userId: string, record: StoredCallRecord | null) {
  if (!record) return null;
  if (record.callerId !== userId && record.calleeId !== userId) return null;

  const isCaller = record.callerId === userId;
  const contactId = isCaller ? record.calleeId : record.callerId;
  const contactName = isCaller ? record.calleeName : record.callerName;

  return {
    id: record.id,
    contactId,
    contactName,
    mode: record.mode,
    status: record.status,
    direction: isCaller ? "outgoing" : "incoming"
  } satisfies CallState;
}

export function CallSessionProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useDemoSession();
  const [currentCall, setCurrentCall] = useState<CallState | null>(null);
  const isCallEligibleRoute = pathname !== "/login" && pathname !== "/signup" && !pathname.startsWith("/admin");
  const currentCallRef = useRef<CallState | null>(null);

  useEffect(() => {
    currentCallRef.current = currentCall;
  }, [currentCall]);

  useEffect(() => {
    if (!isAuthenticated || !isCallEligibleRoute) {
      setCurrentCall(null);
      return;
    }

    const syncCallState = () => {
      setCurrentCall(deriveCallState(user.id, readStoredCallRecord()));
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
  }, [isAuthenticated, isCallEligibleRoute, user.id]);

  const startCall = async (contactName: string, mode: CallMode) => {
    if (!isAuthenticated || !isCallEligibleRoute) return;

    const otherUser = getOtherUserByName(contactName, user.id);
    if (!otherUser) {
      setCurrentCall({
        id: `call_${Date.now()}`,
        contactId: "unsupported",
        contactName,
        mode,
        status: "unsupported",
        direction: "outgoing",
        error: "Call demo is currently available for signed-in direct users like Jordan and Maya."
      });
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
    setCurrentCall(deriveCallState(user.id, nextRecord));
  };

  const acceptCall = async () => {
    const activeCall = currentCallRef.current;
    const record = readStoredCallRecord();
    if (!activeCall || !record || record.id !== activeCall.id) return;

    const nextRecord: StoredCallRecord = {
      ...record,
      status: "active",
      updatedAt: Date.now()
    };

    writeStoredCallRecord(nextRecord);
    setCurrentCall(deriveCallState(user.id, nextRecord));
  };

  const declineCall = () => {
    const activeCall = currentCallRef.current;
    const record = readStoredCallRecord();
    if (!activeCall || !record || record.id !== activeCall.id) return;

    const nextRecord: StoredCallRecord = {
      ...record,
      status: "declined",
      updatedAt: Date.now()
    };

    writeStoredCallRecord(nextRecord);
    setCurrentCall(deriveCallState(user.id, nextRecord));
  };

  const endCall = () => {
    const activeCall = currentCallRef.current;
    const record = readStoredCallRecord();
    if (!activeCall || !record || record.id !== activeCall.id) {
      setCurrentCall(null);
      return;
    }

    const nextRecord: StoredCallRecord = {
      ...record,
      status: "ended",
      updatedAt: Date.now()
    };

    writeStoredCallRecord(nextRecord);
    setCurrentCall(deriveCallState(user.id, nextRecord));

    window.setTimeout(() => {
      const latest = readStoredCallRecord();
      if (latest?.id === nextRecord.id && latest.status === "ended") {
        writeStoredCallRecord(null);
      }
    }, 1200);
  };

  const value = useMemo(
    () => ({
      currentCall,
      startCall,
      acceptCall,
      declineCall,
      endCall
    }),
    [currentCall]
  );

  return (
    <CallSessionContext.Provider value={value}>
      {children}
      <CallOverlay
        currentCall={isAuthenticated && isCallEligibleRoute ? currentCall : null}
        onAccept={acceptCall}
        onDecline={declineCall}
        onEnd={endCall}
        onClose={() => setCurrentCall(null)}
      />
    </CallSessionContext.Provider>
  );
}

function CallOverlay({
  currentCall,
  onAccept,
  onDecline,
  onEnd,
  onClose
}: {
  currentCall: CallState | null;
  onAccept: () => Promise<void>;
  onDecline: () => void;
  onEnd: () => void;
  onClose: () => void;
}) {
  if (!currentCall) return null;

  const isIncoming = currentCall.direction === "incoming" && currentCall.status === "ringing";
  const isActive = currentCall.status === "active";
  const isVideo = currentCall.mode === "video";

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/76 backdrop-blur-md">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <Panel className="w-full max-w-3xl overflow-hidden p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={currentCall.contactName} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-aura-500">
                  {isIncoming ? "Incoming call" : "Live call"}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  {currentCall.contactName}
                </h2>
                <p className="mt-2 text-sm text-emerald-500">
                  {currentCall.status === "ringing" && isIncoming
                    ? `${isVideo ? "Video" : "Voice"} call waiting for your answer`
                    : currentCall.status === "ringing"
                      ? `${isVideo ? "Video" : "Voice"} call is ringing on the other tab`
                      : currentCall.status === "active"
                        ? `${isVideo ? "Video" : "Voice"} call connected`
                        : currentCall.status === "declined"
                          ? "Call declined"
                          : currentCall.status === "ended"
                            ? "Call ended"
                            : currentCall.error ?? "Call status updated"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-slate-500 transition hover:bg-white/20 dark:text-slate-300"
            >
              ×
            </button>
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-slate-950/75 px-6 py-10 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/10">
              <Avatar name={currentCall.contactName} />
            </div>
            <p className="mt-5 text-sm text-slate-400">
              {isVideo
                ? "Video call demo is active across both tabs. Next step is reconnecting the live media transport after the UI flow is fully stable."
                : "Voice call demo is active across both tabs. Next step is reconnecting the live media transport after the UI flow is fully stable."}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            {isIncoming ? (
              <>
                <button
                  type="button"
                  onClick={onDecline}
                  className="rounded-[1.6rem] border border-white/50 bg-white/85 px-5 py-3 text-sm font-medium text-slate-700 shadow-soft dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-200"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => void onAccept()}
                  className="rounded-[1.6rem] bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-soft"
                >
                  Accept call
                </button>
              </>
            ) : null}

            {isActive ? (
              <>
                <Pill active>{isVideo ? "Video live" : "Voice live"}</Pill>
                <button
                  type="button"
                  onClick={onEnd}
                  className="rounded-[1.6rem] bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-soft"
                >
                  End call
                </button>
              </>
            ) : null}

            {currentCall.status === "declined" || currentCall.status === "ended" || currentCall.status === "unsupported" ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-[1.6rem] border border-white/50 bg-white/85 px-5 py-3 text-sm font-medium text-slate-700 shadow-soft dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-200"
              >
                Close
              </button>
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function useCallSession() {
  const context = useContext(CallSessionContext);
  if (!context) {
    throw new Error("useCallSession must be used within CallSessionProvider");
  }
  return context;
}
