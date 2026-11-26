import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Button, Tap, Txt } from "@/components/ui";
import { Icon, Logo } from "@/components/Icon";
import { OfflineError, useSession } from "@/lib/session";
import { C, F, R } from "@/lib/theme";
import { useI18n } from "@/i18n";

export default function SignIn() {
  const { t, rtl } = useI18n();
  const { signIn } = useSession();
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const input = [s.input, { textAlign: rtl ? "right" : "left", fontFamily: rtl ? undefined : F.body }] as const;

  async function submit() {
    setBusy(true); setErr(null);
    try { await signIn(email.trim(), password, register); router.back(); }
    catch (e) { setErr(e instanceof OfflineError ? t.auth.offline : (e as Error).message || t.auth.failed); }
    finally { setBusy(false); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Tap onPress={() => router.back()} accessibilityLabel={t.common.close} style={s.round}><Icon name="close" size={22} /></Tap>
        </View>
        <View style={{ alignItems: "center", gap: 14, marginBottom: 10 }}>
          <Logo size={56} />
          <Txt v="title" style={{ textAlign: "center" }}>{register ? t.auth.register : t.auth.title}</Txt>
        </View>
        <Txt v="label">{t.auth.email}</Txt>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" accessibilityLabel={t.auth.email} style={input} />
        <Txt v="label">{t.auth.password}</Txt>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry autoComplete={register ? "new-password" : "current-password"} textContentType={register ? "newPassword" : "password"} accessibilityLabel={t.auth.password} style={input} />
        {register && <Txt v="caption">{t.auth.passwordHint}</Txt>}
        {!!err && <Txt v="small" accessibilityRole="alert" style={{ color: "#C62F35" }}>{err}</Txt>}
        <Button title={register ? t.auth.register : t.auth.signIn} loading={busy} disabled={!email || password.length < (register ? 10 : 1)} onPress={submit} style={{ marginTop: 8 }} />
        <Tap onPress={() => { setRegister(!register); setErr(null); }} style={{ alignItems: "center", padding: 10 }}>
          <Txt v="label" style={{ color: C.blue }}>{register ? t.auth.toSignIn : t.auth.toRegister}</Txt>
        </Tap>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  round: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  input: { height: 54, borderRadius: R.md, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, fontSize: 17, color: C.ink },
});
