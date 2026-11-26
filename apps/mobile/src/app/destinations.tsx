// All destinations with Countries / Regions / Global segments. Only sold countries are listed.
import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n, fmt } from "../i18n";
import { APP_REGIONS, destName, useDestinations } from "../lib/catalog";
import { C, R } from "../lib/theme";
import { ErrorState, Flag, IconBubble, Loading, Press, Row, T } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";

type Seg = "countries" | "regions" | "global";

export default function Destinations() {
  const { t, locale, price } = useI18n();
  const insets = useSafeAreaInsets();
  const [seg, setSeg] = useState<Seg>("countries");
  const dests = useDestinations();
  const countries = useMemo(() => (dests.data ?? []).map((d) => ({ ...d, name: destName({ kind: "country", iso2: d.iso2 }, locale) })).sort((a, b) => a.name.localeCompare(b.name, locale)), [dests.data, locale]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader mode="back" title={t.destinations.title} />
      <View accessibilityRole="tablist" style={{ flexDirection: "row", marginHorizontal: 16, marginBottom: 12, backgroundColor: "#E6EBF4", borderRadius: R.pill, padding: 4 }}>
        {(["countries", "regions", "global"] as const).map((k) => (
          <Press key={k} testID={`seg-${k}`} accessibilityRole="tab" accessibilityState={{ selected: seg === k }} onPress={() => setSeg(k)}
            style={{ flex: 1, paddingVertical: 10, borderRadius: R.pill, backgroundColor: seg === k ? C.white : "transparent", alignItems: "center" }}>
            <T v="label" style={{ color: seg === k ? C.blue : C.ink2, textAlign: "center" }}>{t.destinations[k]}</T>
          </Press>
        ))}
      </View>
      {seg === "countries" ? (
        dests.loading ? <Loading /> : dests.error ? <ErrorState onRetry={dests.reload} /> : (
          <FlatList data={countries} keyExtractor={(d) => d.iso2} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 32, gap: 8 }}
            renderItem={({ item: d }) => <Row lead={<Flag iso2={d.iso2} size={36} />} title={d.name} sub={fmt(t.common.from, { price: price(d.fromPrice.amount, d.fromPrice.currency) })} onPress={() => router.push(`/plans/${d.iso2.toLowerCase()}`)} style={{ paddingVertical: 12 }} />} />
        )
      ) : seg === "regions" ? (
        <FlatList data={APP_REGIONS} keyExtractor={(id) => id} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 32, gap: 8 }}
          renderItem={({ item: id }) => <Row lead={<IconBubble name="map-outline" size={36} />} title={destName({ kind: "region", id }, locale)} onPress={() => router.push(`/plans/region-${id}`)} style={{ paddingVertical: 12 }} />} />
      ) : (
        <View style={{ paddingHorizontal: 16 }}>
          <Row lead={<IconBubble name="globe-outline" size={36} color={C.pink} bg={C.pinkSoft} />} title={t.home.globalTitle} onPress={() => router.push("/plans/global")} />
        </View>
      )}
    </View>
  );
}
