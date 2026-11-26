import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n, fmt, LOCALE_NAMES } from "../../i18n";
import { useAuth } from "../../lib/auth";
import { WEB_URL } from "../../lib/config";
import { C } from "../../lib/theme";
import { Button, Card, IconBubble, Row, T } from "../../components/ui";
import { SignInPanel } from "../../components/SignInPanel";

export default function Profile() {
  const { t, locale } = useI18n();
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 24, paddingBottom: 140, gap: 10 }} keyboardShouldPersistTaps="handled">
      {user ? (
        <>
          <T v="display" accessibilityRole="header" style={{ marginBottom: 8, paddingHorizontal: 4 }}>{t.profile.title}</T>
          <Card style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: C.blue, alignItems: "center", justifyContent: "center" }}>
              <T v="h2" style={{ color: C.white, textAlign: "center" }}>{user.email.slice(0, 1).toUpperCase()}</T>
            </View>
            <View style={{ flex: 1 }}>
              <T v="caption">{t.profile.signedInAs}</T>
              <T v="title" numberOfLines={1}>{user.email}</T>
            </View>
          </Card>
        </>
      ) : (
        <View style={{ paddingVertical: 24, paddingHorizontal: 8 }}><SignInPanel title={t.auth.profileTitle} /></View>
      )}

      <T v="label" style={{ color: C.muted, marginTop: 16, paddingHorizontal: 4 }}>{t.profile.settings}</T>
      <Row testID="profile-language" lead={<IconBubble name="language-outline" size={40} />} title={t.profile.language} sub={LOCALE_NAMES[locale]} onPress={() => router.push("/language")} />
      <T v="label" style={{ color: C.muted, marginTop: 16, paddingHorizontal: 4 }}>{t.profile.about}</T>
      <Row lead={<IconBubble name="document-text-outline" size={40} />} title={t.profile.terms} onPress={() => void WebBrowser.openBrowserAsync(`${WEB_URL}/terms`)} />
      <Row lead={<IconBubble name="lock-closed-outline" size={40} />} title={t.profile.privacy} onPress={() => void WebBrowser.openBrowserAsync(`${WEB_URL}/privacy`)} />
      {user ? <Button kind="light" label={t.profile.signOut} onPress={() => void signOut()} style={{ marginTop: 16 }} /> : null}
      <T v="caption" style={{ textAlign: "center", marginTop: 16 }}>{`BLEUSIM · ${fmt(t.profile.version, { v: Constants.expoConfig?.version ?? "0.1.0" })}`}</T>
    </ScrollView>
  );
}
