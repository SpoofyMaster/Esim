import { ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { REGIONS } from "@bleusim/geospatial";
import { Screen } from "@/components/Screen";
import { Badge, Button, Flag, IconBubble, RowCard, SandboxNote, Tap, Txt } from "@/components/ui";
import { Icon, Logo } from "@/components/Icon";
import { catalog, cheapest, destImage, destName, formatPrice, useAsync } from "@/lib/catalog";
import { BEST, WEB_URL } from "@/lib/config";
import { useSession } from "@/lib/session";
import { C, R, shadow } from "@/lib/theme";
import { fmt, useI18n } from "@/i18n";

const SHOWN_REGIONS = ["europe", "asia", "middle-east", "africa", "north-america", "latin-america", "oceania"];

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
            <View style={[s.orbit, rtl && { right: undefined, left: -70, top: -78 }]} />
            <View style={[s.dot, rtl ? { top: 14, left: 120 } : { top: 22, right: 70 }, { backgroundColor: C.pink }]} />
            {!rtl && <View style={[s.dot, { top: 64, right: 26, width: 6, height: 6, backgroundColor: "#fff" }]} />}
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
      <View style={[s.section, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
        <Txt v="h2" accessibilityRole="header">{t.home.best}</Txt>
        {sandbox && <Badge text={t.common.sandboxBadge} tone="amber" />}
      </View>
      {BEST.map((iso) => (
        <RowCard key={iso} title={destName(iso, locale, t.common.global)} sub={price(from.get(iso))} leading={<Flag iso={iso} size={44} />} onPress={() => router.push({ pathname: "/plans/[dest]", params: { dest: iso } })} />
      ))}
      <Button title={t.home.more} onPress={() => router.push("/search")} style={{ marginTop: 6 }} />

      <Txt v="h2" accessibilityRole="header" style={s.section}>{t.home.regions}</Txt>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
        {SHOWN_REGIONS.map((id, i) => {
          const plans = regionalPlans.data?.[i] ?? [];
          const c = cheapest(plans);
          const name = REGIONS.find((r) => r.id === id)?.names[locale] ?? id;
          return (
            <Tap key={id} accessibilityRole="button" accessibilityLabel={name} onPress={() => router.push({ pathname: "/plans/[dest]", params: { dest: `region:${id}` } })} style={s.regionCard}>
              <Image source={destImage(`region:${id}`)} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
              <LinearGradient colors={["transparent", "rgba(6,21,46,0.85)"]} style={s.regionShade} />
              <View style={s.regionText}>
                <Txt v="h3" style={{ color: "#fff" }}>{name}</Txt>
                <Txt v="caption" style={{ color: "rgba(255,255,255,0.88)" }}>{c ? `${price(c.price)} · ${fmt(t.common.countries, { n: plans[0]?.coverage.length ?? 0 })}` : " "}</Txt>
              </View>
            </Tap>
          );
        })}
      </ScrollView>
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
  regionCard: { width: 228, height: 160, borderRadius: R.lg, overflow: "hidden", backgroundColor: C.navy },
  regionShade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 100 },
  regionText: { position: "absolute", left: 14, right: 14, bottom: 12, gap: 2 },
  section: { marginTop: 22, marginBottom: 2 },
});
