// Sign-in panel: Apple / Google / Microsoft (arriving with the store release, needs developer accounts)
// and email + password against the BLEUSIM API.
import { useState } from "react";
import { TextInput, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useI18n, fmt } from "../i18n";
import { useAuth } from "../lib/auth";
import { WEB_URL } from "../lib/config";
import { C, F, R } from "../lib/theme";
import { Button, Note, T } from "./ui";
import { Symbol } from "./Logo";

const Google = () => (
  <Svg width={20} height={20} viewBox="0 0 48 48">
    <Path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <Path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <Path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </Svg>
);
const Microsoft = () => (
  <Svg width={18} height={18} viewBox="0 0 22 22">
    <Rect x="0" y="0" width="10" height="10" fill="#F25022" /><Rect x="12" y="0" width="10" height="10" fill="#7FBA00" />
    <Rect x="0" y="12" width="10" height="10" fill="#00A4EF" /><Rect x="12" y="12" width="10" height="10" fill="#FFB900" />
  </Svg>
);

export function SignInPanel({ title, onDone }: { title: string; onDone?: () => void }) {
  const { t, rtl } = useI18n();
  const { signIn } = useAuth();
  const [soon, setSoon] = useState<string | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const input = { height: 54, borderRadius: R.md, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.line, paddingHorizontal: 16, fontFamily: F.body, fontSize: 16, color: C.ink, textAlign: rtl ? "right" : "left" } as const;

  async function submit() {
    setBusy(true); setMsg(null);
    const r = await signIn(email.trim(), password);
    setBusy(false);
    if (r === "ok") onDone?.();
    else setMsg(r === "invalid" ? t.auth.failed : t.auth.notConnected);
  }

  return (
    <View style={{ gap: 14, width: "100%", maxWidth: 420, alignSelf: "center" }}>
      <View style={{ alignItems: "center", gap: 16, marginBottom: 12 }}>
        <Symbol size={56} />
        <T v="h1" style={{ textAlign: "center" }} accessibilityRole="header">{title}</T>
      </View>
      <Button kind="dark" testID="auth-google" label={t.auth.google} icon={<Google />} onPress={() => setSoon("Google")} />
      <Button kind="dark" testID="auth-apple" label={t.auth.apple} icon={<Ionicons name="logo-apple" size={20} color={C.white} />} onPress={() => setSoon("Apple")} />
      <Button kind="dark" testID="auth-microsoft" label={t.auth.microsoft} icon={<Microsoft />} onPress={() => setSoon("Microsoft")} />
      {soon ? <Note><T v="sub" style={{ color: C.ink2 }}>{fmt(t.auth.soon, { provider: soon })}</T></Note> : null}
      {!showEmail ? (
        <Button kind="light" testID="auth-email" label={t.auth.email} icon={<Ionicons name="mail-outline" size={20} color={C.ink} />} onPress={() => setShowEmail(true)} />
      ) : (
        <View style={{ gap: 10 }}>
          <TextInput testID="auth-email-input" accessibilityLabel={t.auth.emailLabel} placeholder={t.auth.emailLabel} placeholderTextColor={C.faint} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" style={input} />
          <TextInput testID="auth-password-input" accessibilityLabel={t.auth.passwordLabel} placeholder={t.auth.passwordLabel} placeholderTextColor={C.faint} value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" style={input} onSubmitEditing={submit} />
          <Button testID="auth-submit" label={t.auth.submit} loading={busy} disabled={!email || !password} onPress={submit} />
          {msg ? <Note tone="warn"><T v="sub" style={{ color: "#6B4700" }}>{msg}</T></Note> : null}
        </View>
      )}
      <T v="caption" style={{ textAlign: "center", marginTop: 6, lineHeight: 18 }}>
        {t.auth.legal}{" "}
        <T v="caption" style={{ color: C.blue, textDecorationLine: "underline" }} accessibilityRole="link" onPress={() => void WebBrowser.openBrowserAsync(`${WEB_URL}/terms`)}>{t.profile.terms}</T>
        {" · "}
        <T v="caption" style={{ color: C.blue, textDecorationLine: "underline" }} accessibilityRole="link" onPress={() => void WebBrowser.openBrowserAsync(`${WEB_URL}/privacy`)}>{t.profile.privacy}</T>
      </T>
    </View>
  );
}
