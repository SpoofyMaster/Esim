import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useI18n, LOCALES, LOCALE_NAMES } from "../i18n";
import { C } from "../lib/theme";
import { Row } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";

export default function Language() {
  const { t, locale, setLocale } = useI18n();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader title={t.profile.language} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
        {LOCALES.map((l) => (
          <Row key={l} testID={`lang-${l}`} title={LOCALE_NAMES[l]} sub={l.toUpperCase()} onPress={() => { setLocale(l); router.back(); }}
            trail={l === locale ? <Ionicons name="checkmark-circle" size={24} color={C.blue} /> : <View style={{ width: 24 }} />} />
        ))}
      </ScrollView>
    </View>
  );
}
