import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { Screen } from "@/components/Screen";
import { Badge, Button, Card, Flag, IconBubble, Txt } from "@/components/ui";
import { useAsync } from "@/lib/catalog";
import { api, useSession } from "@/lib/session";
import { WEB_URL } from "@/lib/config";
import { C, R } from "@/lib/theme";
import { fmt, intlLocale, useI18n } from "@/i18n";
import type { Locale } from "@bleusim/geospatial";

interface Esim { id: string; status: string; isSandbox: boolean; destination: { id: string; kind: string; names: Partial<Record<Locale, string>> }; dataTotalMb: number | null; dataUsedMb: number; expiresAt: string | null; activatedAt: string | null }

export default function Esims() {
  const { t, locale } = useI18n();
  const { user, ready } = useSession();
  const esims = useAsync(() => (user ? api<{ esims: Esim[] }>("/me/esims").then((d) => d.esims) : Promise.resolve([])), [user?.id]);
  const gb = (mb: number) => `${(mb / 1024).toFixed(mb >= 10240 ? 0 : 1)} GB`;

  if (!ready) return <Screen title={t.esims.title}><ActivityIndicator color={C.blue} /></Screen>;
  if (!user) {
    return (
      <Screen title={t.esims.title}>
        <Empty icon="sim" title={t.esims.signedOutTitle} body={t.esims.signedOutBody} />
        <Button title={t.home.signIn} kind="dark" onPress={() => router.push("/signin")} />
        <Button title={t.esims.browse} kind="ghost" onPress={() => router.push("/search")} />
      </Screen>
    );
  }
  return (
    <Screen title={t.esims.title}>
      {esims.loading && <ActivityIndicator color={C.blue} />}
      {!!esims.error && <><Txt v="body">{t.common.loadError}</Txt><Button title={t.common.retry} kind="ghost" onPress={esims.reload} /></>}
      {!esims.loading && esims.data?.length === 0 && (<><Empty icon="sim" title={t.esims.emptyTitle} body={t.esims.emptyBody} /><Button title={t.esims.browse} onPress={() => router.push("/search")} /></>)}
      {esims.data?.map((e) => {
        const total = e.dataTotalMb;
        const left = total === null ? null : Math.max(total - e.dataUsedMb, 0);
        const pct = total ? left! / total : 1;
        const name = e.destination.names[locale] ?? e.destination.names.en ?? e.destination.id;
        return (
          <LinearGradient key={e.id} colors={["#0047D6", "#0057FF", "#39C6FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.esim}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              {e.destination.kind === "COUNTRY" ? <Flag iso={e.destination.id.toUpperCase()} size={34} /> : <IconBubble name="globe" size={34} />}
              <Txt v="h3" style={{ color: "#fff", flex: 1 }}>{name}</Txt>
              <Badge text={e.status} tone="green" />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 18 }}>
              <Txt v="small" style={{ color: "rgba(255,255,255,0.85)" }}>{t.esims.remaining}</Txt>
              <Txt v="label" style={{ color: "#fff" }}>{total === null ? t.common.unlimited : fmt(t.esims.of, { used: gb(left!), total: gb(total) })}</Txt>
            </View>
            <View style={s.track}><View style={[s.fill, { width: `${Math.round(pct * 100)}%` }]} /></View>
            <Txt v="caption" style={{ color: "rgba(255,255,255,0.85)", marginTop: 8 }}>
              {e.expiresAt ? fmt(t.esims.expires, { date: new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium" }).format(new Date(e.expiresAt)) }) : t.esims.notActivated}
            </Txt>
            {e.isSandbox && <Txt v="caption" style={{ color: "#FFE3F1", marginTop: 6 }}>{t.esims.sandbox}</Txt>}
            <Button title={t.esims.install} kind="ghost" style={{ marginTop: 14, backgroundColor: "#fff", height: 46 }} onPress={() => WebBrowser.openBrowserAsync(`${WEB_URL}/account`)} />
          </LinearGradient>
        );
      })}
    </Screen>
  );
}

function Empty({ icon, title, body }: { icon: "sim"; title: string; body: string }) {
  return (
    <Card style={{ padding: 24, alignItems: "center", gap: 10 }}>
      <IconBubble name={icon} size={64} />
      <Txt v="h2" style={{ textAlign: "center", marginTop: 6 }}>{title}</Txt>
      <Txt v="body" style={{ textAlign: "center", color: C.muted }}>{body}</Txt>
    </Card>
  );
}
const s = StyleSheet.create({
  esim: { borderRadius: R.xl, padding: 20 },
  track: { height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.25)", marginTop: 8, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4, backgroundColor: "#fff" },
});
