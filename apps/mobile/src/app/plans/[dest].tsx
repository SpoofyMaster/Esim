import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { COUNTRIES } from "@bleusim/geospatial";
import { Badge, Button, Flag, IconBubble, SandboxNote, Tap, Txt } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { catalog, destImage, destName, formatPrice, useAsync, type Plan } from "@/lib/catalog";
import { C, R, shadow } from "@/lib/theme";
import { fmt, useI18n } from "@/i18n";

export default function Plans() {
  const { dest = "" } = useLocalSearchParams<{ dest: string }>();
  const { t, locale } = useI18n();
  const insets = useSafeAreaInsets();
  const { data: plans, loading, error, reload } = useAsync(() => catalog.plans(dest), [dest]);
  const name = destName(dest, locale, t.common.global);
  const isCountry = !dest.startsWith("region:") && dest !== "global";
  const img = destImage(dest);

  // Best choice: unlimited if offered, else the largest data plan; then the rest by data.
  const ordered = useMemo(() => {
    const list = [...(plans ?? [])];
    const unl = list.find((p) => p.dataGb === null);
    const rest = list.filter((p) => p !== unl).sort((a, b) => (a.dataGb ?? 0) - (b.dataGb ?? 0));
    return { best: unl ?? rest.pop() ?? null, rest };
  }, [plans]);
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => { if (ordered.best) setSel(ordered.best.id); }, [ordered.best]);
  const chosen = plans?.find((p) => p.id === sel) ?? null;
  const sandbox = plans?.some((p) => p.source === "DEV_FIXTURE");
  const price = (p: Plan) => formatPrice(p.price.amount, p.price.currency, locale);
  const dataLabel = (p: Plan) => (p.dataGb === null ? t.plans.unlimited : fmt(t.common.gb, { n: p.dataGb }));
  const techs = [...new Set((plans ?? []).flatMap((p) => p.networks.flatMap((n) => n.tech)))];
  const window = plans?.[0]?.activation.windowDays ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.head}>
        <Tap onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t.common.close} style={s.round}><Icon name="close" size={22} /></Tap>
        <Txt v="h3" style={{ flex: 1, textAlign: "center" }}>{t.plans.title}</Txt>
        <View style={{ minWidth: 48, alignItems: "flex-end" }}>{sandbox ? <Badge text={t.common.sandboxBadge} tone="amber" /> : null}</View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 140, gap: 12 }}>
        {img ? (
          <View style={s.banner}>
            <Image source={img} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} accessibilityIgnoresInvertColors />
            <LinearGradient colors={["transparent", "rgba(6,21,46,0.82)"]} style={s.bannerShade} />
            <View style={s.bannerRow}>
              {isCountry ? <Flag iso={dest} size={36} /> : <IconBubble name={dest === "global" ? "globe" : "layers"} tone={dest === "global" ? "pink" : "blue"} size={36} />}
              <Txt v="h2" accessibilityRole="header" style={{ flex: 1, color: "#fff" }}>{name}</Txt>
            </View>
          </View>
        ) : (
          <View style={s.dest}>
            {isCountry ? <Flag iso={dest} size={40} /> : <IconBubble name={dest === "global" ? "globe" : "layers"} tone={dest === "global" ? "pink" : "blue"} size={40} />}
            <Txt v="h2" accessibilityRole="header" style={{ flex: 1 }}>{name}</Txt>
          </View>
        )}

        {loading && <ActivityIndicator style={{ marginTop: 40 }} color={C.blue} />}
        {!!error && <View style={{ alignItems: "center", gap: 12, marginTop: 30 }}><Txt v="body">{t.common.loadError}</Txt><Button title={t.common.retry} kind="ghost" onPress={reload} /></View>}
        {!loading && !error && plans?.length === 0 && (
          <View style={{ gap: 14, marginTop: 20 }}>
            <Txt v="body">{fmt(t.plans.none, { name })}</Txt>
            <Button title={t.plans.seeGlobal} kind="ghost" onPress={() => router.replace({ pathname: "/plans/[dest]", params: { dest: "global" } })} />
          </View>
        )}

        {ordered.best && (
          <Tap onPress={() => setSel(ordered.best!.id)} accessibilityRole="radio" accessibilityState={{ checked: sel === ordered.best.id }} style={[s.bestWrap, sel === ordered.best.id && s.bestOn]}>
            <View style={s.bestTop}><Icon name="bolt" size={15} color={C.pink} /><Txt v="label" style={{ color: "#fff" }}>{t.plans.best}</Txt></View>
            <View style={s.planRow}>
              <Radio on={sel === ordered.best.id} />
              <View style={{ flex: 1 }}>
                <Txt v="h3" style={{ fontSize: 19 }}>{dataLabel(ordered.best)}</Txt>
                <Txt v="small">{fmt(t.common.days, { n: ordered.best.validityDays })}{ordered.best.hotspot ? ` · ${t.plans.hotspot}` : ""}</Txt>
              </View>
              <Txt v="h3" style={{ fontSize: 19 }}>{price(ordered.best)}</Txt>
            </View>
            <View style={s.includes}>
              <Txt v="small" style={{ color: C.ink2, marginBottom: 6 }}>{t.plans.includes}</Txt>
              {techs.length > 0 && <Inc icon="signal" text={fmt(t.plans.network, { tech: techs.join(" / ") })} />}
              {ordered.best.topUp && <Inc icon="refresh" text={t.plans.topUp} />}
              {ordered.best.dataGb === null && <Inc icon="info" text={t.plans.fairUse} />}
            </View>
          </Tap>
        )}

        {ordered.rest.map((p) => (
          <Tap key={p.id} onPress={() => setSel(p.id)} accessibilityRole="radio" accessibilityState={{ checked: sel === p.id }} style={[s.plan, sel === p.id && s.planOn]}>
            <Radio on={sel === p.id} />
            <View style={{ flex: 1 }}>
              <Txt v="h3" style={{ fontSize: 19 }}>{dataLabel(p)}</Txt>
              <Txt v="small">{fmt(t.common.days, { n: p.validityDays })}{p.hotspot ? ` · ${t.plans.hotspot}` : ""}</Txt>
            </View>
            <Txt v="h3" style={{ fontSize: 19 }}>{price(p)}</Txt>
          </Tap>
        ))}

        {!!plans?.length && (
          <View style={s.info}>
            <Icon name="info" size={20} color={C.ink2} />
            <View style={{ flex: 1, gap: 4 }}>
              <Txt v="label">{t.plans.laterQ}</Txt>
              <Txt v="small" style={{ color: C.ink2 }}>{fmt(t.plans.laterA, { n: window })}</Txt>
            </View>
          </View>
        )}
        {!isCountry && !!plans?.[0] && (
          <View style={{ gap: 8, marginTop: 6 }}>
            <Txt v="label">{t.plans.coverage} · {plans[0].coverage.length}</Txt>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {plans[0].coverage.map((iso) => <View key={iso} style={s.chip}><Flag iso={iso} size={18} /><Txt v="caption" style={{ color: C.ink2 }}>{COUNTRIES.find((c) => c.iso2 === iso)?.names[locale] ?? iso}</Txt></View>)}
            </View>
          </View>
        )}
        {sandbox && <SandboxNote text={t.common.sandbox} />}
      </ScrollView>

      {chosen && (
        <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
          <Button title={fmt(t.plans.continue, { price: price(chosen) })} onPress={() => router.push({ pathname: "/checkout", params: { dest, plan: chosen.id } })} />
          <Txt v="caption" style={{ textAlign: "center", marginTop: 8 }}>{t.plans.checkoutNote}</Txt>
        </View>
      )}
    </View>
  );
}

function Radio({ on }: { on: boolean }) {
  return <View style={[s.radio, on && { borderColor: C.blue }]}>{on && <View style={s.radioDot} />}</View>;
}
function Inc({ icon, text }: { icon: "signal" | "refresh" | "info"; text: string }) {
  return <View style={{ flexDirection: "row", gap: 10, alignItems: "center", paddingVertical: 4 }}><Icon name={icon} size={18} color={C.blue} /><Txt v="small" style={{ color: C.ink, flex: 1 }}>{text}</Txt></View>;
}

const s = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 8 },
  round: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  banner: { height: 156, borderRadius: R.lg, overflow: "hidden", backgroundColor: C.navy },
  bannerShade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 100 },
  bannerRow: { position: "absolute", left: 16, right: 16, bottom: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  dest: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.fill, borderRadius: R.lg, padding: 16 },
  bestWrap: { borderRadius: R.lg, backgroundColor: C.card, borderWidth: 2, borderColor: C.border, overflow: "hidden" },
  bestOn: { borderColor: C.ink },
  bestTop: { backgroundColor: C.ink, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10 },
  planRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18 },
  includes: { marginHorizontal: 14, marginBottom: 14, backgroundColor: C.bg, borderRadius: R.md, padding: 14 },
  plan: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.card, borderRadius: R.lg, padding: 18, borderWidth: 2, borderColor: "transparent", ...shadow.card },
  planOn: { borderColor: C.blue },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: C.faint, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 13, height: 13, borderRadius: 7, backgroundColor: C.blue },
  info: { flexDirection: "row", gap: 12, backgroundColor: C.fill, borderRadius: R.lg, padding: 16, marginTop: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.card, borderRadius: R.pill, paddingVertical: 5, paddingStart: 5, paddingEnd: 10, borderWidth: 1, borderColor: C.border },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, backgroundColor: "rgba(244,247,252,0.97)", borderTopWidth: StyleSheet.hairlineWidth, borderColor: C.border },
});
