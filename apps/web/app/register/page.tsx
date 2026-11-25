import { CommerceShell } from "@/components/commerce/Shell";
import { AuthForm } from "@/components/account/AuthForm";
export const metadata = { title: "Create account", robots: { index: false } };
export default function Page() { return <CommerceShell><AuthForm mode="register" /></CommerceShell>; }
