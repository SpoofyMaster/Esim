import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n";

// English is served unprefixed (/esim/japan → internally /en/esim/japan); /en/... redirects to the clean URL.
// Other languages keep their prefix (/fr/esim/japan). Checkout, account and admin are English-only routes.
const ENGLISH_ONLY = ["/checkout", "/account", "/login", "/register", "/order", "/admin", "/privacy", "/terms", "/cookies"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (ENGLISH_ONLY.some((p) => pathname === p || pathname.startsWith(p + "/"))) return NextResponse.next();
  const seg = pathname.split("/")[1];
  if (seg === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (isLocale(seg)) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = { matcher: ["/((?!_next/|api/|media/|earth/|geo/|brand/|.*\\..*).*)"] };
