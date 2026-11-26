// Help content: getting started, device compatibility, Q&A.
import { ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "../../i18n";
import { C, F } from "../../lib/theme";
import { Card, IconBubble, T } from "../../components/ui";
import { ScreenHeader } from "../../components/ScreenHeader";

export default function Guide() {
  const { topic = "start" } = useLocalSearchParams<{ topic: string }>();
  const { t } = useI18n();
  const g = t.guide;
  const insets = useSafeAreaInsets();
  const title = topic === "compat" ? g.compatTitle : topic === "faq" ? g.faqTitle : g.startTitle;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader mode="back" title={title} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 32 }}>
        {topic === "faq" ? ([[g.q1, g.a1], [g.q2, g.a2], [g.q3, g.a3], [g.q4, g.a4]] as const).map(([q, a]) => (
          <Card key={q} style={{ padding: 16, gap: 6 }}>
            <T v="title">{q}</T>
            <T v="body">{a}</T>
          </Card>
        )) : topic === "compat" ? (
          <>
            <Card style={{ padding: 20, alignItems: "center", gap: 10 }}>
              <IconBubble name="keypad-outline" size={56} />
              <T v="h1" style={{ textAlign: "center", fontFamily: F.display, letterSpacing: 2, writingDirection: "ltr" }}>*#06#</T>
              <T v="body" style={{ textAlign: "center" }}>{g.compat1}</T>
            </Card>
            <Card style={{ padding: 16 }}><T v="body">{g.compat2}</T></Card>
            <Card style={{ padding: 16 }}><T v="body">{g.compat3}</T></Card>
          </>
        ) : [g.step1, g.step2, g.step3, g.step4].map((s, i) => (
          <Card key={i} style={{ padding: 16, flexDirection: "row", gap: 14, alignItems: "flex-start" }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.blue, alignItems: "center", justifyContent: "center" }}>
              <T v="title" style={{ color: C.white, textAlign: "center" }}>{i + 1}</T>
            </View>
            <T v="body" style={{ flex: 1, paddingTop: 4 }}>{s}</T>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
