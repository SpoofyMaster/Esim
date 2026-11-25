"use client";
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
export async function api<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const r = await fetch(API_URL + path, {
    ...init,
    credentials: "include",
    headers: { accept: "application/json", ...(init?.json !== undefined ? { "content-type": "application/json" } : {}), ...(init?.headers ?? {}) },
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error((data as { message?: string }).message ?? `Request failed (${r.status})`), { status: r.status });
  return data as T;
}
