import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { REGIONS } from "@bleusim/geospatial";
import { Screen } from "@/components/Screen";
import { Badge, Button, Flag, IconBubble, RowCard, SandboxNote, Tap, Txt } from "@/components/ui";
import { Icon, Logo } from "@/components/Icon";
import { catalog, cheapest, destName, formatPrice, useAsync } from "@/lib/catalog";
import { BEST, WEB_URL } from "@/lib/config";
import { useSession } from "@/lib/session";
import { C, R, shadow } from "@/lib/theme";
import { fmt, useI18n } from "@/i18n";

const SHOWN_REGIONS = ["europe", "asia", "middle-east"];

export default function Home() {
  const { t, locale, rtl } = useI18n();
  const { user } = useSession();
  const dests = useAsync(() => catalog.destinations(), []);
  const regionalPlans = useAsync(() => Promise.all([...SHOWN_REGIONS.map((id) => catalog.plans(`region:${id}`)), catalog.plans("global")]), []);
  const from = new Map((dests.data ?? []).map((d) => [d.iso2, d.fromPrice]));
  const sandbox = (dests.data ?? []).some((d) => d.source === "DEV_FIXTURE");
  const price = (p?: { amount: number; currency: string }) => (p ? fmt(t.common.from, { price: formatPrice(p.amount, p.currency, locale) }) : " ");

  return (
    <Screen
      header={
        <>
          {/* top bar: search pill + sign in */}
          <View style={s.topRow}>
            <Tap onPress={() => router.push("/search")} accessibilityRole="search" accessibilityLabel={t.home.search} style={s.search}>
              <Icon name="search" size={20} color={C.muted} />
              <Txt v="body" numberOfLines={1} style={{ color: C.muted, flex: 1 }}>{t.home.search}</Txt>
            </Tap>
            {!user && (
              <Tap onPress={() => router.push("/signin")} accessibilityRole="button" style={s.signIn}>
                <Txt v="label">{t.home.signIn}</Txt>
              </Tap>
            )}
          </View>

          {/* hero card */}
          <LinearGradient colors={["#0047D6", "#0057FF", "#39C6FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
            <View style={[s.orbit, rtl && { right: undefined, left: -60 }]} />
            <View style={[s.dot, { top: 22, right: 70, backgroundColor: C.pink }]} />
            <View style={[s.dot, { top: 64, right: 26, width: 6, height: 6, backgroundColor: "#fff" }]} />
            <View style={s.heroHead}><Logo size={30} /><Txt v="caption" style={{ color: "rgba(255,255,255,0.85)" }}>{t.home.kicker}</Txt></View>
            <Txt v="title" style={{ color: "#fff", marginTop: 16 }}>{t.home.title}</Txt>
            <Txt v="body" style={{ color: "rgba(255,255,255,0.88)", marginTop: 8 }}>{t.home.subtitle}</Txt>
            <Tap onPress={() => router.push("/search")} style={s.heroBtn} accessibilityRole="button" accessibilityLabel={t.search.title}>
              <Icon name="search" size={18} color={C.blue} />
              <Txt v="label" style={{ color: C.blue }}>{t.search.title}</Txt>
            </Tap>
          </LinearGradient>
        </>
      }
    >
      <Txt v="h2" accessibilityRole="header" style={s.section}>{t.home.best}</Txt>
      {BEST.map((iso) => (
        <RowCard key={iso} title={destName(iso, locale, t.common.global)} sub={price(from.get(iso))} leading={<Flag iso={iso} size={44} />} onPress={() => router.push({ pathname: "/plans/[dest]", params: { dest: iso } })} />
      ))}
      <Button title={t.home.more} onPress={() => router.push("/search")} style={{ marginTop: 6 }} />

      <Txt v="h2" accessibilityRole="header" style={s.section}>{t.home.regions}</Txt>
      {SHOWN_REGIONS.map((id, i) => {
        const plans = regionalPlans.data?.[i] ?? [];
        const c = cheapest(plans);
        return (
          <RowCard key={id} title={REGIONS.find((r) => r.id === id)?.names[locale] ?? id}
            sub={c ? `${price(c.price)} · ${fmt(t.common.countries, { n: plans[0]?.coverage.length ?? 0 })}` : " "}
            leading={<IconBubble name="layers" />} onPress={() => router.push({ pathname: "/plans/[dest]", params: { dest: `region:${id}` } })} />
        );
      })}
      {(() => {
        const plans = regionalPlans.data?.[SHOWN_REGIONS.length] ?? [];
        const c = cheapest(plans);
        return <RowCard title={t.common.global} sub={c ? `${price(c.price)} · ${fmt(t.common.countries, { n: plans[0]?.coverage.length ?? 0 })}` : " "} leading={<IconBubble name="globe" tone="pink" />} onPress={() => router.push({ pathname: "/plans/[dest]", params: { dest: "global" } })} />;
      })()}
      {sandbox && <SandboxNote text={t.common.sandbox} />}

      <Txt v="h2" accessibilityRole="header" style={s.section}>{t.home.extras}</Txt>
      <RowCard title={t.home.guide} sub={t.home.guideSub} leading={<IconBubble name="rocket" />} onPress={() => router.push({ pathname: "/guide", params: { focus: "steps" } })} />
      <RowCard title={t.home.compat} sub={t.home.compatSub} leading={<IconBubble name="phone" tone="green" />} onPress={() => router.push({ pathname: "/guide", params: { focus: "compat" } })} />
      <RowCard title={t.home.explorer} sub={t.home.explorerSub} leading={<IconBubble name="globe" tone="pink" />} trailing={<Icon name="external" size={20} color={C.faint} />}
        onPress={() => WebBrowser.openBrowserAsync(`${WEB_URL}${locale === "en" ? "" : `/${locale}`}/explore`)} />
    </Screen>
  );
}

const s = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  search: { flex: 1, height: 52, borderRadius: R.pill, backgroundColor: C.fill, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 18 },
  signIn: { height: 52, borderRadius: R.pill, backgroundColor: C.card, paddingHorizontal: 18, justifyContent: "center", borderWidth: 1, borderColor: C.border, ...shadow.card },
  hero: { marginTop: 18, borderRadius: R.xl, padding: 22, overflow: "hidden", ...shadow.blue },
  heroHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  orbit: { position: "absolute", right: -60, top: -40, width: 220, height: 120, borderRadius: 120, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.35)", transform: [{ rotate: "-18deg" }] },
  dot: { position: "absolute", width: 9, height: 9, borderRadius: 5 },
  heroBtn: { marginTop: 18, height: 48, borderRadius: R.pill, backgroundColor: "#fff", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, alignSelf: "flex-start", paddingHorizontal: 20 },
  section: { marginTop: 22, marginBottom: 2 },
});
