import { CommerceShell } from "@/components/commerce/Shell";
import { OrderView } from "@/components/commerce/OrderView";
export const metadata = { title: "Your order", robots: { index: false } };
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommerceShell step="Order"><OrderView id={id} /></CommerceShell>;
}
