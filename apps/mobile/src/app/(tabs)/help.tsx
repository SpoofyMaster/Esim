import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "../../i18n";
import { WEB_URL } from "../../lib/config";
import { C } from "../../lib/theme";
import { IconBubble, Row, T } from "../../components/ui";

export default function Help() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 24, paddingBottom: 140, gap: 10 }}>
      <T v="display" accessibilityRole="header" style={{ marginBottom: 14, paddingHorizontal: 4 }}>{t.help.title}</T>
      <Row testID="help-start" lead={<IconBubble name="rocket-outline" />} title={t.help.start} sub={t.help.startSub} onPress={() => router.push("/guide/start")} />
      <Row testID="help-compat" lead={<IconBubble name="phone-portrait-outline" color="#0A8BC2" bg="#DDF5FF" />} title={t.help.compat} sub={t.help.compatSub} onPress={() => router.push("/guide/compat")} />
      <Row testID="help-faq" lead={<IconBubble name="chatbubbles-outline" color={C.pink} bg={C.pinkSoft} />} title={t.help.faq} sub={t.help.faqSub} onPress={() => router.push("/guide/faq")} />
      <Row lead={<IconBubble name="document-text-outline" />} title={t.help.legal} onPress={() => void WebBrowser.openBrowserAsync(`${WEB_URL}/terms`)}
        trail={<View><Ionicons name="open-outline" size={20} color={C.faint} /></View>} />
    </ScrollView>
  );
}
