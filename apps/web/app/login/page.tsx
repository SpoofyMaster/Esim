import { CommerceShell } from "@/components/commerce/Shell";
import { AuthForm } from "@/components/account/AuthForm";
export const metadata = { title: "Sign in", robots: { index: false } };
export default function Page() { return <CommerceShell><AuthForm mode="login" /></CommerceShell>; }
