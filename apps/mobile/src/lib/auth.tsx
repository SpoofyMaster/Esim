// Account session. The API uses an httpOnly session cookie; native fetch keeps cookies per app,
// and web sends them with credentials: "include". Without an API the app stays signed out.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { API_URL, hasApi } from "./config";

export interface User { id: string; email: string; name?: string | null }
interface Auth { user: User | null; ready: boolean; signIn: (email: string, password: string) => Promise<"ok" | "invalid" | "offline">; signOut: () => Promise<void> }
const Ctx = createContext<Auth | null>(null);

export const api = (path: string, init: RequestInit = {}) =>
  fetch(`${API_URL}/v1${path}`, { ...init, credentials: "include", headers: { accept: "application/json", ...(init.body ? { "content-type": "application/json" } : {}), ...init.headers } });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!hasApi);
  useEffect(() => {
    if (!hasApi) return;
    api("/me").then(async (r) => { if (r.ok) setUser(((await r.json()) as { user: User }).user); }).catch(() => {}).finally(() => setReady(true));
  }, []);
  const signIn = useCallback<Auth["signIn"]>(async (email, password) => {
    if (!hasApi) return "offline";
    try {
      const r = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      if (!r.ok) return "invalid";
      const me = await api("/me");
      if (me.ok) setUser(((await me.json()) as { user: User }).user);
      return "ok";
    } catch { return "offline"; }
  }, []);
  const signOut = useCallback(async () => { if (hasApi) await api("/auth/logout", { method: "POST" }).catch(() => {}); setUser(null); }, []);
  const value = useMemo(() => ({ user, ready, signIn, signOut }), [user, ready, signIn, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
