import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, IconBubble, Tap, Txt } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { C } from "@/lib/theme";
import { useI18n } from "@/i18n";

export default function Guide() {
  const { t, rtl } = useI18n();
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const insets = useSafeAreaInsets();
  const g = t.guide;
  const steps = [[g.s1, g.s1Body], [g.s2, g.s2Body], [g.s3, g.s3Body]] as const;
  const blocks = [
    { key: "compat", icon: "phone" as const, title: g.compatTitle, body: g.compatBody },
    { key: "network", icon: "signal" as const, title: g.networkTitle, body: g.networkBody },
  ].sort((a) => (a.key === focus ? -1 : 0));
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40, gap: 12 }}>
      <Tap onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t.common.back} style={s.round}><Icon name={rtl ? "chevronRight" : "chevronLeft"} size={22} /></Tap>
      <Txt v="display" accessibilityRole="header" style={{ marginVertical: 14 }}>{g.title}</Txt>
      {steps.map(([title, body], i) => (
        <Card key={title} style={s.step}>
          <View style={s.num}><Txt v="label" style={{ color: "#fff" }}>{i + 1}</Txt></View>
          <View style={{ flex: 1, gap: 4 }}><Txt v="h3">{title}</Txt><Txt v="small" style={{ color: C.ink2 }}>{body}</Txt></View>
        </Card>
      ))}
      {blocks.map((b) => (
        <Card key={b.key} style={[s.step, b.key === focus && { borderWidth: 2, borderColor: C.blue }]}>
          <IconBubble name={b.icon} tone={b.key === "compat" ? "green" : "blue"} size={44} />
          <View style={{ flex: 1, gap: 4 }}><Txt v="h3">{b.title}</Txt><Txt v="small" style={{ color: C.ink2 }}>{b.body}</Txt></View>
        </Card>
      ))}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  round: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  step: { flexDirection: "row", gap: 14, padding: 18, alignItems: "flex-start" },
  num: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.blue, alignItems: "center", justifyContent: "center" },
});
