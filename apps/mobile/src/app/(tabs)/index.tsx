// Home: hero with search, popular destinations, regional and global plans, why BLEUSIM.
import { ScrollView, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n, fmt } from "../../i18n";
import { useAuth } from "../../lib/auth";
import { APP_REGIONS, POPULAR, catalog, cheapest, destName, useAsync, useDestinations } from "../../lib/catalog";
import { MEDIA } from "../../lib/media.generated";
import { C, F, R, shadow } from "../../lib/theme";
import { Button, Card, Flag, IconBubble, Press, Row, SandboxBadge, SectionTitle, T } from "../../components/ui";
import { Logo } from "../../components/Logo";

export default function Home() {
  const { t, locale, price, rtl } = useI18n();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const dests = useDestinations();
  const byIso = new Map((dests.data ?? []).map((d) => [d.iso2, d]));
  const sandbox = (dests.data ?? []).some((d) => d.source === "DEV_FIXTURE");

  const regional = useAsync(async () => {
    const [regions, global] = await Promise.all([
      Promise.all(APP_REGIONS.map(async (id) => ({ id, plans: await catalog.plansForRegion(id) }))),
      catalog.globalPlans(),
    ]);
    return { regions: regions.filter((r) => r.plans.length > 0), global };
  }, []);
  const globalFrom = regional.data ? cheapest(regional.data.global) : undefined;
  const globalCount = regional.data?.global[0]?.coverage.length ?? 0;

  const heroH = 300 + insets.top;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 130 + insets.bottom }} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={{ height: heroH, backgroundColor: C.navy }}>
        <Image source={MEDIA["hero-earth"]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" contentPosition={{ top: "30%", left: "50%" }} accessibilityIgnoresInvertColors />
        <LinearGradient colors={["rgba(2,11,31,0.55)", "rgba(2,11,31,0.15)", "rgba(2,11,31,0.55)"]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Logo light size={30} />
          {user ? (
            <Press accessibilityRole="button" accessibilityLabel={t.tabs.profile} onPress={() => router.navigate("/profile")} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.white, alignItems: "center", justifyContent: "center" }}>
              <T v="title" style={{ color: C.blue, textAlign: "center" }}>{user.email.slice(0, 1).toUpperCase()}</T>
            </Press>
          ) : (
            <Press testID="home-sign-in" accessibilityRole="button" accessibilityLabel={t.common.signIn} onPress={() => router.push("/sign-in")}
              style={{ paddingHorizontal: 16, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)", justifyContent: "center" }}>
              <T v="label" style={{ color: C.white }}>{t.common.signIn}</T>
            </Press>
          )}
        </View>
        <View style={{ position: "absolute", left: 20, right: 20, bottom: 52, gap: 8 }}>
          <T v="label" style={{ color: C.cyan, letterSpacing: rtl ? 0 : 0.6 }}>{t.home.kicker}</T>
          <T v="display" style={{ color: C.white, fontSize: width < 360 ? 26 : 32, lineHeight: width < 360 ? 32 : 38 }} accessibilityRole="header">{t.home.title}</T>
        </View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, marginTop: -28 }}>
        <Press testID="home-search" accessibilityRole="search" accessibilityLabel={t.home.search} onPress={() => router.push("/search")}
          style={{ height: 58, borderRadius: R.pill, backgroundColor: C.white, flexDirection: "row", alignItems: "center", paddingHorizontal: 18, gap: 12, ...shadow.float }}>
          <Ionicons name="search" size={22} color={C.blue} />
          <T v="body" style={{ flex: 1, color: C.muted, fontSize: 16 }} numberOfLines={1}>{t.home.search}</T>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.blue, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={rtl ? "arrow-back" : "arrow-forward"} size={18} color={C.white} />
          </View>
        </Press>
      </View>

      {/* Popular */}
      <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <SectionTitle title={t.home.popular} />
          {sandbox ? <SandboxBadge style={{ marginBottom: 12 }} /> : null}
        </View>
        <View style={{ gap: 10 }}>
          {POPULAR.slice(0, 6).map((iso) => {
            const d = byIso.get(iso);
            return (
              <Row key={iso} testID={`popular-${iso}`} lead={<Flag iso2={iso} size={40} />} title={destName({ kind: "country", iso2: iso }, locale)}
                sub={d ? fmt(t.common.from, { price: price(d.fromPrice.amount, d.fromPrice.currency) }) : " "} onPress={() => router.push(`/plans/${iso.toLowerCase()}`)} />
            );
          })}
        </View>
        <Button testID="all-destinations" label={t.home.allDestinations} onPress={() => router.push("/destinations")} style={{ marginTop: 16 }} />
      </View>

      {/* Regions */}
      <View style={{ marginTop: 36 }}>
        <SectionTitle title={t.home.regionsTitle} sub={t.home.regionsSub} style={{ paddingHorizontal: 16 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
          {(regional.data?.regions ?? APP_REGIONS.map((id) => ({ id, plans: [] }))).map(({ id, plans }) => {
            const from = cheapest(plans);
            const name = destName({ kind: "region", id }, locale);
            return (
              <Press key={id} testID={`region-${id}`} accessibilityRole="button" accessibilityLabel={name} onPress={() => router.push(`/plans/region-${id}`)}
                style={{ width: 236, height: 168, borderRadius: R.lg, overflow: "hidden", backgroundColor: C.navy2 }}>
                <Image source={MEDIA[`region-${id}`]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" transition={200} />
                <LinearGradient colors={["transparent", "rgba(2,11,31,0.85)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 110 }} />
                <View style={{ position: "absolute", left: 14, right: 14, bottom: 12, gap: 2 }}>
                  <T v="h2" style={{ color: C.white }}>{name}</T>
                  <T v="caption" style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>
                    {from ? `${fmt(t.common.from, { price: price(from.price.amount, from.price.currency) })} · ${fmt(t.common.countries, { n: from.coverage.length })}` : " "}
                  </T>
                </View>
              </Press>
            );
          })}
        </ScrollView>
      </View>

      {/* Global */}
      <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
        <Press testID="global-card" accessibilityRole="button" accessibilityLabel={t.home.globalTitle} onPress={() => router.push("/plans/global")}
          style={{ height: 150, borderRadius: R.lg, overflow: "hidden", backgroundColor: C.navy }}>
          <Image source={MEDIA["global"]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" />
          <LinearGradient colors={rtl ? ["transparent", "rgba(2,11,31,0.9)"] : ["rgba(2,11,31,0.9)", "transparent"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
          <View style={{ flex: 1, padding: 18, justifyContent: "center", gap: 4, maxWidth: 260 }}>
            <View style={{ alignSelf: "flex-start", backgroundColor: C.pink, borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 3 }}>
              <T v="caption" style={{ color: C.white, fontFamily: F.bodyBold, fontSize: 11 }}>{t.common.global.toUpperCase()}</T>
            </View>
            <T v="h1" style={{ color: C.white }}>{t.home.globalTitle}</T>
            <T v="sub" style={{ color: "rgba(255,255,255,0.85)" }}>
              {globalFrom ? `${fmt(t.home.globalSub, { n: globalCount })} · ${fmt(t.common.from, { price: price(globalFrom.price.amount, globalFrom.price.currency) })}` : " "}
            </T>
          </View>
        </Press>
      </View>

      {/* Why BLEUSIM */}
      <View style={{ paddingHorizontal: 16, marginTop: 36 }}>
        <SectionTitle title={t.home.whyTitle} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {([
            ["flash", t.home.why1Title, t.home.why1Body, C.blue, C.blueSoft],
            ["call", t.home.why2Title, t.home.why2Body, C.pink, C.pinkSoft],
            ["eye", t.home.why3Title, t.home.why3Body, "#0A8BC2", "#DDF5FF"],
            ["airplane", t.home.why4Title, t.home.why4Body, C.blue, C.blueSoft],
          ] as const).map(([icon, title, body, fg, bg]) => (
            <Card key={title} style={{ width: (Math.min(width, 520) - 42) / 2, padding: 16, gap: 10 }}>
              <IconBubble name={icon} color={fg} bg={bg} size={40} />
              <T v="title" style={{ fontSize: 15 }}>{title}</T>
              <T v="caption" style={{ fontSize: 13, lineHeight: 18 }}>{body}</T>
            </Card>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 24, gap: 4 }}>
        {sandbox ? <T v="caption">{t.common.sandboxNote}</T> : null}
        <T v="caption">{t.common.illustrative}</T>
      </View>
    </ScrollView>
  );
}
