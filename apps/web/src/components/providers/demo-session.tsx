"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

import {
  defaultDemoUser,
  getStoredDemoUsers,
  saveStoredDemoUsers,
  type DemoUser
} from "@/lib/data";

const STORAGE_KEY = "aura-demo-user";

const DemoSessionContext = createContext<{
  user: DemoUser;
  isAuthenticated: boolean;
  setUserById: (userId: DemoUser["id"]) => void;
  updateCurrentUser: (patch: Partial<DemoUser>) => void;
  signOut: () => void;
} | null>(null);

export function DemoSessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<DemoUser>(defaultDemoUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  function clearSession(redirect = false) {
    setUser(defaultDemoUser);
    setIsAuthenticated(false);
    window.sessionStorage.removeItem(STORAGE_KEY);
    if (redirect && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  function resolveUser(userId: DemoUser["id"]) {
    return getStoredDemoUsers().find((item) => item.id === userId) ?? defaultDemoUser;
  }

  useEffect(() => {
    const stored = window.sessionStorage.getItem(STORAGE_KEY) as DemoUser["id"] | null;
    if (!stored) return;
    setIsAuthenticated(true);
    setUser(resolveUser(stored));
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!window.sessionStorage.getItem(STORAGE_KEY)) return;

      if (event.key === "aura-demo-users") {
        const stored = window.sessionStorage.getItem(STORAGE_KEY) as DemoUser["id"] | null;
        if (!stored) return;
        setIsAuthenticated(true);
        setUser(resolveUser(stored));
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [user.id]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const stored = window.sessionStorage.getItem(STORAGE_KEY) as DemoUser["id"] | null;
      if (!stored) {
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(true);
      setUser(resolveUser(stored));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      setUserById: (userId: DemoUser["id"]) => {
        const nextUser = resolveUser(userId);
        setUser(nextUser);
        setIsAuthenticated(true);
        window.sessionStorage.setItem(STORAGE_KEY, nextUser.id);
      },
      updateCurrentUser: (patch: Partial<DemoUser>) => {
        const users = getStoredDemoUsers();
        const nextUsers = users.map((entry) =>
          entry.id === user.id
            ? {
                ...entry,
                ...patch
              }
            : entry
        );
        saveStoredDemoUsers(nextUsers);
        const nextUser = nextUsers.find((entry) => entry.id === user.id) ?? user;
        setUser(nextUser);
      },
      signOut: () => {
        clearSession();
      }
    }),
    [isAuthenticated, user]
  );

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}

export function useDemoSession() {
  const context = useContext(DemoSessionContext);
  if (!context) {
    throw new Error("useDemoSession must be used within DemoSessionProvider");
  }
  return context;
}
