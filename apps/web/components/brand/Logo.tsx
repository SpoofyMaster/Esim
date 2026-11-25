// BLEUSIM logo: "Orbit" symbol + wordmark. Symbol = planet with a connection orbit and a live node.
export function Symbol({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id="bs-planet" x1="6" y1="5" x2="26" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#39C6FF" />
          <stop offset="0.55" stopColor="#0057FF" />
          <stop offset="1" stopColor="#0A1E3F" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="11" fill="url(#bs-planet)" />
      <path d="M3.2 21.5C1.6 18.4 7.4 12.2 16.2 8.1 25 4 31.4 4 30.3 7.6" fill="none" stroke="#F4F8FF" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M30.3 7.6c-1 3.3-6.9 8.6-14.6 12.2C8.5 23.2 4.4 23.6 3.2 21.5" fill="none" stroke="#F4F8FF" strokeOpacity="0.35" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="23.9" cy="6.1" r="2.3" fill="#F4F8FF" />
      <circle cx="23.9" cy="6.1" r="4" fill="#39C6FF" fillOpacity="0.25" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Symbol className="h-full w-auto" />
      <span className="font-display text-[1.15em] font-semibold leading-none tracking-[0.08em] text-white">
        BLEU<span className="font-normal text-cyan-300">SIM</span>
      </span>
    </span>
  );
}
