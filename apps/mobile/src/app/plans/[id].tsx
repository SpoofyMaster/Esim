// Plans for a destination: banner, "best choice" unlimited card, data plans with radio selection,
// activation rule, coverage, sticky Continue. Everything shown comes from the catalog plan data.
import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Plan } from "@bleusim/catalog";
import { useI18n, fmt, type Dict } from "../../i18n";
import { dataLabel, destId, destName, parseDest, plansFor, useAsync } from "../../lib/catalog";
import { MEDIA } from "../../lib/media.generated";
import { C, F, R, shadow } from "../../lib/theme";
import { Button, Card, ErrorState, Flag, IconBubble, Loading, Note, Press, SandboxBadge, T } from "../../components/ui";
import { ScreenHeader } from "../../components/ScreenHeader";

function Radio({ on }: { on: boolean }) {
  return (
    <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: on ? C.blue : "#C5CFE0", alignItems: "center", justifyContent: "center" }}>
      {on ? <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.blue }} /> : null}
    </View>
  );
}

function Meta({ p, t }: { p: Plan; t: Dict }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
      <T v="sub">{fmt(t.common.days, { n: p.validityDays })}</T>
      {p.hotspot ? <><T v="sub">·</T><Ionicons name="wifi" size={14} color={C.muted} /><T v="sub">{t.plans.hotspot}</T></> : null}
    </View>
  );
}

export default function Plans() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const dest = useMemo(() => parseDest(String(id)), [id]);
  const { t, locale, price } = useI18n();
  const insets = useSafeAreaInsets();
  const { data, error, loading, reload } = useAsync(() => plansFor(dest), [id]);
  const plans = useMemo(() => [...(data ?? [])].sort((a, b) => (a.dataGb === null ? -1 : b.dataGb === null ? 1 : a.dataGb - b.dataGb)), [data]);
  const best = plans.find((p) => p.dataGb === null);
  const rest = plans.filter((p) => p !== best);
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => { if (plans.length && !plans.some((p) => p.id === sel)) setSel((best ?? plans[0])!.id); }, [plans, best, sel]);
  const chosen = plans.find((p) => p.id === sel);
  const name = destName(dest, locale);
  const img = dest.kind === "country" ? MEDIA[`dest-${dest.iso2.toLowerCase()}`] : dest.kind === "region" ? MEDIA[`region-${dest.id}`] : MEDIA["global"];
  const sandbox = plans.some((p) => p.source === "DEV_FIXTURE");

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader title={t.plans.title} trailing={sandbox ? <SandboxBadge /> : null} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 + insets.bottom, gap: 12 }}>
        {/* Banner */}
        {img ? (
          <View style={{ height: 150, borderRadius: R.lg, overflow: "hidden", backgroundColor: C.navy2 }}>
            <Image source={img} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" transition={200} accessibilityIgnoresInvertColors />
            <LinearGradient colors={["transparent", "rgba(2,11,31,0.8)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 100 }} />
            <View style={{ position: "absolute", left: 14, right: 14, bottom: 14, flexDirection: "row", alignItems: "center", gap: 10 }}>
              {dest.kind === "country" ? <Flag iso2={dest.iso2} size={34} /> : <IconBubble name={dest.kind === "global" ? "globe-outline" : "map-outline"} size={34} bg="rgba(255,255,255,0.9)" />}
              <T v="h1" style={{ color: C.white, flex: 1 }} accessibilityRole="header" testID="plans-dest-name">{name}</T>
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#E6EBF4", borderRadius: R.lg, padding: 14 }}>
            {dest.kind === "country" ? <Flag iso2={dest.iso2} size={34} /> : <IconBubble name="globe-outline" size={34} />}
            <T v="h2" accessibilityRole="header" testID="plans-dest-name">{name}</T>
          </View>
        )}

        {loading && !data ? <Loading /> : error ? <ErrorState onRetry={reload} /> : plans.length === 0 ? (
          <View style={{ gap: 12, paddingTop: 8 }}>
            <Note>{<T v="body">{fmt(t.plans.notSold, { name })}</T>}</Note>
            {dest.kind !== "global" ? <Button kind="light" label={t.plans.seeGlobal} onPress={() => router.replace("/plans/global")} /> : null}
          </View>
        ) : (
          <>
            {best ? (
              <Press testID={`plan-${best.id}`} accessibilityRole="radio" accessibilityState={{ checked: sel === best.id }} accessibilityLabel={`${t.plans.bestChoice}: ${t.plans.unlimitedData}, ${fmt(t.common.days, { n: best.validityDays })}, ${price(best.price.amount, best.price.currency)}`}
                onPress={() => setSel(best.id)} style={{ borderRadius: R.lg, borderWidth: 2, borderColor: sel === best.id ? C.blue : "transparent", backgroundColor: C.white, overflow: "hidden", ...shadow.card }}>
                <LinearGradient colors={[C.blue, "#2F7BFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 8, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 }}>
                  <Ionicons name="sparkles" size={14} color={C.white} />
                  <T v="label" style={{ color: C.white, textAlign: "center" }}>{t.plans.bestChoice}</T>
                </LinearGradient>
                <View style={{ padding: 16, gap: 14 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                    <Radio on={sel === best.id} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <T v="h2">{t.plans.unlimitedData}</T>
                      <Meta p={best} t={t} />
                    </View>
                    <T v="h2" style={{ fontFamily: F.display }}>{price(best.price.amount, best.price.currency)}</T>
                  </View>
                  <View style={{ backgroundColor: C.bg, borderRadius: R.md, padding: 12, gap: 8 }}>
                    <T v="caption" style={{ fontFamily: F.bodySemi, color: C.ink2 }}>{t.plans.includes}</T>
                    {best.fairUsage ? <View style={{ flexDirection: "row", gap: 8 }}><Ionicons name="speedometer-outline" size={16} color={C.blue} /><T v="caption" style={{ flex: 1, color: C.ink2 }}>{fmt(t.plans.fairUse, { rule: best.fairUsage })}</T></View> : null}
                    {best.hotspot ? <View style={{ flexDirection: "row", gap: 8 }}><Ionicons name="wifi" size={16} color={C.blue} /><T v="caption" style={{ flex: 1, color: C.ink2 }}>{t.plans.hotspot}</T></View> : null}
                    {best.topUp ? <View style={{ flexDirection: "row", gap: 8 }}><Ionicons name="add-circle-outline" size={16} color={C.blue} /><T v="caption" style={{ flex: 1, color: C.ink2 }}>{t.plans.topUp}</T></View> : null}
                    {best.coverage.length > 1 ? <View style={{ flexDirection: "row", gap: 8 }}><Ionicons name="globe-outline" size={16} color={C.blue} /><T v="caption" style={{ flex: 1, color: C.ink2 }}>{fmt(t.plans.coverage, { n: best.coverage.length })}</T></View> : null}
                  </View>
                </View>
              </Press>
            ) : null}

            {rest.map((p) => (
              <Press key={p.id} testID={`plan-${p.id}`} accessibilityRole="radio" accessibilityState={{ checked: sel === p.id }} accessibilityLabel={`${dataLabel(p, t)}, ${fmt(t.common.days, { n: p.validityDays })}, ${price(p.price.amount, p.price.currency)}`}
                onPress={() => setSel(p.id)} style={{ borderRadius: R.lg, borderWidth: 2, borderColor: sel === p.id ? C.blue : "transparent", backgroundColor: C.white, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, ...shadow.card }}>
                <Radio on={sel === p.id} />
                <View style={{ flex: 1, gap: 2 }}>
                  <T v="h2">{dataLabel(p, t)}</T>
                  <Meta p={p} t={t} />
                </View>
                <T v="title" style={{ fontSize: 18 }}>{price(p.price.amount, p.price.currency)}</T>
              </Press>
            ))}

            {chosen && dest.kind !== "country" ? (
              <Card style={{ padding: 16, gap: 10 }}>
                <T v="title">{fmt(t.plans.coverage, { n: chosen.coverage.length })}</T>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {chosen.coverage.slice(0, 40).map((iso) => <Flag key={iso} iso2={iso} size={26} />)}
                </View>
              </Card>
            ) : null}

            {chosen ? (
              <Note>
                <T v="title" style={{ fontSize: 15 }}>{t.plans.activationTitle}</T>
                <T v="sub" style={{ color: C.ink2, marginTop: 2 }}>{fmt(t.plans.activationBody, { n: chosen.activation.windowDays })}</T>
              </Note>
            ) : null}
            {sandbox ? <T v="caption" style={{ paddingHorizontal: 4 }}>{t.common.sandboxNote}</T> : null}
          </>
        )}
      </ScrollView>

      {chosen ? (
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), backgroundColor: "rgba(243,246,252,0.96)", borderTopWidth: 1, borderTopColor: C.line }}>
          <Button testID="plans-continue" label={`${t.plans.continue} · ${price(chosen.price.amount, chosen.price.currency)}`}
            onPress={() => router.push({ pathname: "/checkout", params: { dest: destId(dest), plan: chosen.id } })} />
        </View>
      ) : null}
    </View>
  );
}
