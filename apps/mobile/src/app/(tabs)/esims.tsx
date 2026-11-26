// My eSIMs: sign-in prompt when signed out, otherwise the user's eSIMs with usage.
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Locale } from "@bleusim/geospatial";
import { useI18n, fmt } from "../../i18n";
import { useAuth, api } from "../../lib/auth";
import { useAsync } from "../../lib/catalog";
import { C, R } from "../../lib/theme";
import { Button, Card, ErrorState, IconBubble, Loading, SandboxBadge, T } from "../../components/ui";
import { SignInPanel } from "../../components/SignInPanel";

interface Esim { id: string; status: string; isSandbox: boolean; destination: { names: Record<Locale, string> }; dataTotalMb: number | null; dataUsedMb: number; validityDays: number; orderNumber: string }
const gb = (mb: number) => `${(mb / 1024).toFixed(mb < 1024 ? 2 : 1)} GB`;

export default function Esims() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const list = useAsync(async () => {
    if (!user) return [];
    const r = await api("/me/esims");
    if (!r.ok) throw new Error(String(r.status));
    return ((await r.json()) as { esims: Esim[] }).esims;
  }, [user?.id]);

  if (!user) {
    return (
      <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 24, paddingBottom: 140, flexGrow: 1, justifyContent: "center" }} keyboardShouldPersistTaps="handled">
        <SignInPanel title={t.auth.esimsTitle} />
      </ScrollView>
    );
  }
  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 24, paddingBottom: 140, gap: 12 }}>
      <T v="display" accessibilityRole="header" style={{ marginBottom: 8 }}>{t.esims.title}</T>
      {list.loading ? <Loading /> : list.error ? <ErrorState onRetry={list.reload} /> : !list.data?.length ? (
        <Card style={{ padding: 24, alignItems: "center", gap: 12 }}>
          <IconBubble name="card-outline" size={56} />
          <T v="h2" style={{ textAlign: "center" }}>{t.esims.empty}</T>
          <T v="sub" style={{ textAlign: "center" }}>{t.esims.emptyBody}</T>
          <Button label={t.esims.browse} onPress={() => router.push("/search")} style={{ alignSelf: "stretch" }} />
        </Card>
      ) : list.data.map((e) => {
        const pct = e.dataTotalMb ? Math.min(1, e.dataUsedMb / e.dataTotalMb) : 0;
        return (
          <Card key={e.id} style={{ padding: 16, gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <T v="h2" style={{ flex: 1 }}>{e.destination.names[locale] ?? e.destination.names.en}</T>
              {e.isSandbox ? <SandboxBadge /> : null}
            </View>
            <T v="sub">{t.esims.status[e.status] ?? e.status} · {e.orderNumber}</T>
            {e.dataTotalMb ? <View style={{ height: 8, borderRadius: R.pill, backgroundColor: C.soft, overflow: "hidden" }}><View style={{ width: `${pct * 100}%`, height: "100%", backgroundColor: C.blue }} /></View> : null}
            <T v="caption">{e.dataTotalMb ? fmt(t.esims.used, { used: gb(e.dataUsedMb), total: gb(e.dataTotalMb) }) : fmt(t.esims.usedUnlimited, { used: gb(e.dataUsedMb) })}</T>
          </Card>
        );
      })}
    </ScrollView>
  );
}
