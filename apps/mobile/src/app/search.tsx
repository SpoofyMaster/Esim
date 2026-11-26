import { useMemo, useState } from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COUNTRIES, REGIONS, createSearch, type SearchHit } from "@bleusim/geospatial";
import { Flag, IconBubble, Tap, Txt } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { catalog, formatPrice, useAsync } from "@/lib/catalog";
import { POPULAR } from "@/lib/config";
import { C, F, R } from "@/lib/theme";
import { fmt, useI18n } from "@/i18n";

const search = createSearch(COUNTRIES, REGIONS);
type Item = { type: "header"; label: string } | { type: "hit"; hit: SearchHit };

export default function Search() {
  const { t, locale, rtl } = useI18n();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");
  const dests = useAsync(() => catalog.destinations(), []);
  const from = new Map((dests.data ?? []).map((d) => [d.iso2, d.fromPrice]));

  const items: Item[] = useMemo(() => {
    if (q.trim()) return search(q, locale, 20).map((hit) => ({ type: "hit" as const, hit }));
    const pop = POPULAR.map((iso) => COUNTRIES.find((c) => c.iso2 === iso)).filter((c) => !!c).map((c) => ({ type: "hit" as const, hit: { kind: "country" as const, iso2: c.iso2!, label: c.names[locale], score: 0 } }));
    const reg = [...REGIONS.map((r) => ({ type: "hit" as const, hit: { kind: "region" as const, id: r.id, label: r.names[locale], score: 0 } })), { type: "hit" as const, hit: { kind: "global" as const, id: "global" as const, label: t.common.global, score: 0 } }];
    return [{ type: "header", label: t.search.popular }, ...pop, { type: "header", label: t.search.regions }, ...reg] as Item[];
  }, [q, locale, t]);

  function open(h: SearchHit) {
    const dest = h.kind === "country" ? h.iso2 : h.kind === "region" ? `region:${h.id}` : "global";
    router.replace({ pathname: "/plans/[dest]", params: { dest } });
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: 16 }}>
      <View style={s.handle} />
      <View style={s.bar}>
        <View style={s.field}>
          <Icon name="search" size={20} color={C.muted} />
          <TextInput value={q} onChangeText={setQ} autoFocus placeholder={t.search.placeholder} placeholderTextColor={C.faint} autoCorrect={false} returnKeyType="search"
            accessibilityLabel={t.search.title} style={[s.input, { textAlign: rtl ? "right" : "left", fontFamily: rtl ? undefined : F.body }]}
            onSubmitEditing={() => { const first = items.find((i) => i.type === "hit"); if (first && first.type === "hit") open(first.hit); }} />
          {!!q && <Tap onPress={() => setQ("")} accessibilityLabel={t.common.close} hitSlop={10}><Icon name="close" size={18} color={C.muted} /></Tap>}
        </View>
        <Tap onPress={() => router.back()} accessibilityRole="button"><Txt v="label" style={{ color: C.blue }}>{t.search.cancel}</Txt></Tap>
      </View>
      <FlatList
        data={items}
        keyExtractor={(it, i) => (it.type === "header" ? `h${i}` : `${it.hit.kind}-${"iso2" in it.hit ? it.hit.iso2 : it.hit.id}`)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}
        ListEmptyComponent={<Txt v="body" style={{ marginTop: 24, textAlign: "center", color: C.muted }}>{fmt(t.search.none, { q })}</Txt>}
        renderItem={({ item }) => {
          if (item.type === "header") return <Txt v="caption" style={s.header}>{item.label.toUpperCase()}</Txt>;
          const h = item.hit;
          const p = h.kind === "country" ? from.get(h.iso2) : undefined;
          const sub = h.kind === "country" ? (p ? fmt(t.common.from, { price: formatPrice(p.amount, p.currency, locale) }) : h.sub) : h.kind === "region" ? t.search.regional : t.search.worldwide;
          return (
            <Tap onPress={() => open(h)} accessibilityRole="button" accessibilityLabel={sub ? `${h.label}, ${sub}` : h.label} style={s.row}>
              {h.kind === "country" ? <Flag iso={h.iso2} size={38} /> : <IconBubble name={h.kind === "region" ? "layers" : "globe"} tone={h.kind === "global" ? "pink" : "blue"} size={38} />}
              <View style={{ flex: 1 }}>
                <Txt v="bodyMedium">{h.label}</Txt>
                {!!sub && <Txt v="small">{sub}</Txt>}
              </View>
              <Icon name={rtl ? "chevronLeft" : "chevronRight"} size={18} color={C.faint} />
            </Tap>
          );
        }}
      />
    </View>
  );
}
const s = StyleSheet.create({
  handle: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: C.border, marginBottom: 12 },
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, marginBottom: 8 },
  field: { flex: 1, height: 50, borderRadius: R.pill, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16 },
  input: { flex: 1, fontSize: 17, color: C.ink, height: "100%" },
  header: { marginTop: 18, marginBottom: 6, letterSpacing: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: C.border },
});
