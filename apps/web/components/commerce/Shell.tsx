import { Logo } from "@/components/brand/Logo";
// Universe B shell: calm, legible, minimal chrome.
export function CommerceShell({ children, step }: { children: React.ReactNode; step?: string }) {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--fg)]">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <a href="/" aria-label="BLEUSIM home" className="h-7"><Logo className="h-7" adaptive /></a>
          {step && <span className="text-sm text-[var(--fg-muted)]">{step}</span>}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10">{children}</main>
    </div>
  );
}
export function SandboxBanner() {
  return (
    <p role="note" className="mb-6 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
      <strong className="font-semibold">Sandbox mode.</strong> No real payment is taken and no real eSIM is issued. Plans and prices are development fixtures.
    </p>
  );
}
