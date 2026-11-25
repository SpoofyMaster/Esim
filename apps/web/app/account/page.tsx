import { CommerceShell } from "@/components/commerce/Shell";
import { AccountDashboard } from "@/components/account/AccountDashboard";
export const metadata = { title: "My eSIMs", robots: { index: false } };
export default function Page() { return <CommerceShell step="My account"><AccountDashboard /></CommerceShell>; }
