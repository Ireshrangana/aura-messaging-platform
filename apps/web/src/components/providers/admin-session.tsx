"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

import { getStoredAdminAccounts, type AdminAccount } from "@/lib/data";

const STORAGE_KEY = "aura-admin-session";

const AdminSessionContext = createContext<{
  isAdmin: boolean;
  adminAccount: AdminAccount | null;
  signIn: (username: string, password: string) => boolean;
  signOut: () => void;
} | null>(null);

export function AdminSessionProvider({ children }: PropsWithChildren) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAccount, setAdminAccount] = useState<AdminAccount | null>(null);

  function resolveAdminAccount(adminId: string) {
    return getStoredAdminAccounts().find((item) => item.id === adminId && item.status === "active") ?? null;
  }

  useEffect(() => {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const nextAccount = resolveAdminAccount(stored);
    if (!nextAccount) return;
    setIsAdmin(true);
    setAdminAccount(nextAccount);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "aura-admin-accounts") return;
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const nextAccount = resolveAdminAccount(stored);
      if (!nextAccount) {
        setIsAdmin(false);
        setAdminAccount(null);
        window.sessionStorage.removeItem(STORAGE_KEY);
        return;
      }
      setAdminAccount(nextAccount);
    };

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const value = useMemo(
    () => ({
      isAdmin,
      adminAccount,
      signIn: (username: string, password: string) => {
        const matched = getStoredAdminAccounts().find(
          (account) =>
            account.status === "active" &&
            account.username.toLowerCase() === username.trim().toLowerCase() &&
            account.password === password
        );

        if (matched) {
          setIsAdmin(true);
          setAdminAccount(matched);
          window.sessionStorage.setItem(STORAGE_KEY, matched.id);
          return true;
        }

        return false;
      },
      signOut: () => {
        setIsAdmin(false);
        setAdminAccount(null);
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    }),
    [adminAccount, isAdmin]
  );

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession() {
  const context = useContext(AdminSessionContext);
  if (!context) {
    throw new Error("useAdminSession must be used within AdminSessionProvider");
  }
  return context;
}
