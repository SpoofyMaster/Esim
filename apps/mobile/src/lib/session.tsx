import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { API_URL } from "./config";

// Email sign-in against the BLEUSIM API (cookie session, kept by the native HTTP stack).
export interface User { id: string; email: string }
export class OfflineError extends Error {}

async function call<T>(path: string, init?: { method?: string; json?: unknown }): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`${API_URL}/v1${path}`, {
      method: init?.method ?? "GET",
      credentials: "include",
      headers: { accept: "application/json", ...(init?.json !== undefined ? { "content-type": "application/json" } : {}) },
      body: init?.json !== undefined ? JSON.stringify(init.json) : undefined,
    });
  } catch { throw new OfflineError("offline"); }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error((data as { message?: string }).message ?? `HTTP ${r.status}`), { status: r.status });
  return data as T;
}

interface Ctx { user: User | null; ready: boolean; signIn: (email: string, password: string, register?: boolean) => Promise<void>; signOut: () => Promise<void> }
const Session = createContext<Ctx>({ user: null, ready: false, signIn: async () => {}, signOut: async () => {} });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { call<{ user: User }>("/me").then((d) => setUser(d.user)).catch(() => {}).finally(() => setReady(true)); }, []);
  const signIn = useCallback(async (email: string, password: string, register = false) => {
    const d = await call<{ user: User }>(register ? "/auth/register" : "/auth/login", { method: "POST", json: { email, password } });
    setUser(d.user);
  }, []);
  const signOut = useCallback(async () => { await call("/auth/logout", { method: "POST" }).catch(() => {}); setUser(null); }, []);
  return <Session.Provider value={{ user, ready, signIn, signOut }}>{children}</Session.Provider>;
}
export const useSession = () => useContext(Session);
export const api = call;
