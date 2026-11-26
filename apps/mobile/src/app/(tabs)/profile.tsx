import { ActionSheetIOS, Alert, Platform, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import Svg, { Path } from "react-native-svg";
import { Screen } from "@/components/Screen";
import { Badge, Button, Card, IconBubble, RowCard, SandboxNote, Tap, Txt } from "@/components/ui";
import { Icon, Logo } from "@/components/Icon";
import { useSession } from "@/lib/session";
import { WEB_URL } from "@/lib/config";
import { C, R } from "@/lib/theme";
import { LOCALES, LOCALE_NAMES, fmt, useI18n, type Locale } from "@/i18n";

const Apple = () => <Svg width={20} height={20} viewBox="0 0 24 24" fill="#fff"><Path d="M16.4 12.6c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.6ZM14.1 5.6c.6-.8 1.1-1.8 1-2.9-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2.1-.5 2.7-1.3Z" /></Svg>;
const Google = () => <Svg width={20} height={20} viewBox="0 0 24 24"><Path d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" fill="#4285F4" /><Path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" fill="#34A853" /><Path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.2 1.1 4.6L6.4 14Z" fill="#FBBC05" /><Path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.8 9.4 6 12 6Z" fill="#EA4335" /></Svg>;

export default function Profile() {
  const { t, locale, setLocale } = useI18n();
  const { user, signOut } = useSession();
  const web = (path: string) => WebBrowser.openBrowserAsync(`${WEB_URL}${locale === "en" ? "" : `/${locale}`}${path}`);

  function chooseLanguage() {
    const names = LOCALES.map((l) => LOCALE_NAMES[l]);
    const pick = (i: number) => { const l = LOCALES[i] as Locale | undefined; if (l && l !== locale) setLocale(l); };
    if (Platform.OS === "ios") ActionSheetIOS.showActionSheetWithOptions({ options: [...names, t.search.cancel], cancelButtonIndex: names.length, title: t.profile.language }, pick);
    else Alert.alert(t.profile.language, undefined, [...LOCALES.map((l, i) => ({ text: names[i]!, onPress: () => pick(i) })), { text: t.search.cancel, style: "cancel" as const }]);
  }

  return (
    <Screen title={user ? t.profile.title : undefined}>
      {!user ? (
        <View style={{ alignItems: "center", paddingTop: 48, gap: 14 }}>
          <Logo size={64} />
          <Txt v="title" style={{ textAlign: "center", marginVertical: 18 }}>{t.profile.signInTitle}</Txt>
          <SocialButton icon={<Apple />} title={t.profile.apple} soon={t.common.soon} />
          <SocialButton icon={<Google />} title={t.profile.google} soon={t.common.soon} />
          <Button title={t.profile.email} kind="primary" icon={<Icon name="mail" size={20} color="#fff" />} onPress={() => router.push("/signin")} style={{ alignSelf: "stretch" }} />
          <Txt v="small" style={{ textAlign: "center", marginTop: 6 }}>{t.profile.legal}</Txt>
        </View>
      ) : (
        <Card style={{ padding: 18, flexDirection: "row", alignItems: "center", gap: 14 }}>
          <IconBubble name="user" />
          <Txt v="label" style={{ flex: 1 }}>{fmt(t.profile.signedInAs, { email: user.email })}</Txt>
          <Tap onPress={signOut} accessibilityRole="button"><Txt v="label" style={{ color: C.blue }}>{t.profile.signOut}</Txt></Tap>
        </Card>
      )}

      <Txt v="h2" style={{ marginTop: 28 }}>{t.profile.settings}</Txt>
      <RowCard title={t.profile.language} sub={LOCALE_NAMES[locale]} leading={<IconBubble name="language" />} onPress={chooseLanguage} />
      <Txt v="h2" style={{ marginTop: 18 }}>{t.profile.legalTitle}</Txt>
      <RowCard title={t.profile.privacy} leading={<IconBubble name="doc" />} trailing={<Icon name="external" size={20} color={C.faint} />} onPress={() => web("/privacy")} />
      <RowCard title={t.profile.terms} leading={<IconBubble name="doc" />} trailing={<Icon name="external" size={20} color={C.faint} />} onPress={() => web("/terms")} />
      <RowCard title={t.profile.cookies} leading={<IconBubble name="doc" />} trailing={<Icon name="external" size={20} color={C.faint} />} onPress={() => web("/cookies")} />
      <Txt v="caption" style={{ textAlign: "center", marginTop: 16 }}>BLEUSIM · {fmt(t.profile.version, { v: Constants.expoConfig?.version ?? "0.1.0" })}</Txt>
      <SandboxNote text={t.profile.sandboxBuild} />
    </Screen>
  );
}

/** Apple / Google sign-in need provider setup first, so these are shown but disabled. */
function SocialButton({ icon, title, soon }: { icon: React.ReactNode; title: string; soon: string }) {
  return (
    <View accessibilityRole="button" accessibilityState={{ disabled: true }} accessibilityLabel={`${title}, ${soon}`} style={s.social}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, opacity: 0.6 }}>
        {icon}
        <Txt v="label" style={{ color: "#fff", fontSize: 17 }}>{title}</Txt>
      </View>
      <View style={{ position: "absolute", top: -9, end: 18 }}><Badge text={soon} /></View>
    </View>
  );
}
const s = StyleSheet.create({
  social: { alignSelf: "stretch", height: 56, borderRadius: R.pill, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#2C3A57" },
});
