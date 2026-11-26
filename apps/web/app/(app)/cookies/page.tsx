import type { Metadata } from "next";
import { Fill, LegalPage } from "@/components/legal/LegalPage";
import { CookieChoices } from "@/components/legal/CookieChoices";

export const metadata: Metadata = { title: "Cookie Preferences", description: "The cookies and browser storage BLEUSIM uses, and how to control them.", alternates: { canonical: "/cookies" } };

export default function Page() {
  return (
    <LegalPage
      title="Cookie Preferences"
      updated="26 November 2026"
      intro={<p>This page lists every cookie and similar browser storage BLEUSIM uses, why we use it, and how you can control it. It supplements our <a href="/privacy">Privacy Policy</a>.</p>}
      sections={[
        { id: "choices", title: "Your choices", body: <><p>Essential storage is always on. You can switch optional storage on or off here at any time.</p><CookieChoices /></> },
        { id: "what", title: "What cookies are", body: <p>Cookies are small text files a website saves in your browser. Similar technologies, such as local storage, keep small pieces of information on your device. Some are needed for a site to work; others are optional. “First-party” items are set by bleusim.com itself; “third-party” items are set by other services embedded in a site. BLEUSIM uses first-party storage only.</p> },
        { id: "list", title: "What we use", body: (
          <div className="mt-2 overflow-x-auto rounded-2xl border border-ice-200">
            <table className="w-full min-w-[560px] text-start text-sm">
              <thead className="bg-ice-50 text-ice-600"><tr><th scope="col" className="px-4 py-3 text-start font-medium">Name</th><th scope="col" className="px-4 py-3 text-start font-medium">Type</th><th scope="col" className="px-4 py-3 text-start font-medium">Purpose</th><th scope="col" className="px-4 py-3 text-start font-medium">Duration</th></tr></thead>
              <tbody className="divide-y divide-ice-200">
                <tr><td className="px-4 py-3 font-mono text-xs">bs_session</td><td className="px-4 py-3">Essential cookie</td><td className="px-4 py-3">Keeps you signed in. HTTP-only and not readable by scripts.</td><td className="px-4 py-3">30 days, or until you sign out</td></tr>
                <tr><td className="px-4 py-3 font-mono text-xs">bleusim.prefs</td><td className="px-4 py-3">Essential local storage</td><td className="px-4 py-3">Remembers the choices you make on this page.</td><td className="px-4 py-3">Until you clear it</td></tr>
                <tr><td className="px-4 py-3 font-mono text-xs">bleusim.recent</td><td className="px-4 py-3">Functional local storage</td><td className="px-4 py-3">Your last four destination searches, shown when you open search.</td><td className="px-4 py-3">Until you clear it or switch it off</td></tr>
              </tbody>
            </table>
          </div>
        ) },
        { id: "third", title: "Third parties", body: <p>We do not use analytics, advertising or social media cookies. When payments go live, our payment provider may set its own essential cookies on its payment pages to prevent fraud: <Fill>payment provider and link to its cookie notice</Fill>. If we ever add optional third-party cookies, we will list them here and ask for your consent first.</p> },
        { id: "browser", title: "Browser controls", body: <p>You can also delete or block cookies and site data in your browser settings. Blocking essential cookies will stop sign-in and checkout from working.</p> },
        { id: "changes", title: "Changes", body: <p>We will update this page, and its date, whenever the cookies we use change.</p> },
        { id: "contact", title: "Contact", body: <p>Questions: <Fill>privacy contact email</Fill>.</p> },
      ]}
    />
  );
}
