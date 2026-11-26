// Destination search (countries, regions, cities → their country, "global"). Uses the shared geospatial index.
import { useMemo, useState } from "react";
import { FlatList, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SearchHit } from "@bleusim/geospatial";
import { useI18n, fmt } from "../i18n";
import { APP_REGIONS, POPULAR, destName, search, useDestinations } from "../lib/catalog";
import { C, F, R } from "../lib/theme";
import { Flag, IconBubble, Press, Row, T } from "../components/ui";

export default function Search() {
  const { t, locale, price, rtl } = useI18n();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");
  const dests = useDestinations();
  const byIso = useMemo(() => new Map((dests.data ?? []).map((d) => [d.iso2, d])), [dests.data]);

  const hits: SearchHit[] = useMemo(() => {
    if (q.trim()) return search(q, locale, 20);
    return [
      ...POPULAR.map((iso2): SearchHit => ({ kind: "country", iso2, label: destName({ kind: "country", iso2 }, locale), score: 0 })),
      ...APP_REGIONS.map((id): SearchHit => ({ kind: "region", id, label: destName({ kind: "region", id }, locale), score: 0 })),
      { kind: "global", id: "global", label: destName({ kind: "global" }, locale), score: 0 },
    ];
  }, [q, locale]);

  const open = (h: SearchHit) => {
    const id = h.kind === "country" ? h.iso2.toLowerCase() : h.kind === "region" ? `region-${h.id}` : "global";
    router.replace(`/plans/${id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top + 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 12 }}>
        <View style={{ flex: 1, height: 52, borderRadius: R.pill, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.blue, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 10 }}>
          <Ionicons name="search" size={20} color={C.blue} />
          <TextInput testID="search-input" autoFocus value={q} onChangeText={setQ} placeholder={t.search.placeholder} placeholderTextColor={C.faint}
            accessibilityLabel={t.search.placeholder} returnKeyType="search" autoCorrect={false} onSubmitEditing={() => hits[0] && open(hits[0])}
            style={{ flex: 1, fontFamily: rtl ? F.arabic : F.body, fontSize: 16, color: C.ink, textAlign: rtl ? "right" : "left", outlineStyle: "none" } as object} />
          {q ? <Press accessibilityLabel={t.common.close} onPress={() => setQ("")}><Ionicons name="close-circle" size={20} color={C.faint} /></Press> : null}
        </View>
        <Press accessibilityRole="button" onPress={() => router.back()}><T v="title" style={{ color: C.blue }}>{t.search.cancel}</T></Press>
      </View>
      <FlatList
        data={hits}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 + insets.bottom, gap: 8 }}
        keyExtractor={(h) => (h.kind === "country" ? h.iso2 : h.id) + (h.sub ?? "")}
        ListHeaderComponent={!q.trim() ? <T v="label" style={{ color: C.muted, marginBottom: 4 }}>{t.search.popular}</T> : undefined}
        ListEmptyComponent={<T v="body" style={{ padding: 16, textAlign: "center" }}>{fmt(t.search.empty, { q })}</T>}
        renderItem={({ item: h }) => {
          if (h.kind === "country") {
            const d = byIso.get(h.iso2);
            const sub = [h.sub, d ? fmt(t.common.from, { price: price(d.fromPrice.amount, d.fromPrice.currency) }) : t.search.notSold].filter(Boolean).join(" · ");
            return <Row testID={`hit-${h.iso2}`} lead={<Flag iso2={h.iso2} size={36} />} title={h.label} sub={sub} onPress={() => open(h)} style={{ paddingVertical: 12 }} />;
          }
          return <Row testID={`hit-${h.id}`} lead={<IconBubble name={h.kind === "global" ? "globe-outline" : "map-outline"} size={36} />} title={h.label} sub={h.kind === "global" ? t.search.regions : undefined} onPress={() => open(h)} style={{ paddingVertical: 12 }} />;
        }}
      />
    </View>
  );
}
