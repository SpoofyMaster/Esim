// In-app checkout: plan summary, delivery email, sandbox payment through the BLEUSIM API, then the order QR.
// If the API can't be reached the Pay button explains it: no fake orders.
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge, Button, Flag, IconBubble, Tap, Txt } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { catalog, destName, formatPrice, useAsync } from "@/lib/catalog";
import { api, OfflineError, useSession } from "@/lib/session";
import { C, R, shadow } from "@/lib/theme";
import { fmt, useI18n } from "@/i18n";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const newKey = () => `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

export default function Checkout() {
  const { dest = "", plan: planId = "" } = useLocalSearchParams<{ dest: string; plan: string }>();
  const { t, locale, rtl } = useI18n();
  const { user } = useSession();
  const insets = useSafeAreaInsets();
  const { data, loading } = useAsync(() => catalog.plans(dest), [dest]);
  const plan = data?.find((p) => p.id === planId);
  const [email, setEmail] = useState(user?.email ?? "");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idem] = useState(newKey);
  const valid = EMAIL.test(email.trim());
  const isCountry = !dest.startsWith("region:") && dest !== "global";

  async function pay() {
    setTouched(true);
    if (!valid || !plan) return;
    setBusy(true); setError(null);
    try {
      const o = await api<{ orderId: string; accessToken: string; paymentRef: string }>("/checkout", { method: "POST", json: { retailPlanId: plan.id, email: email.trim(), idempotencyKey: idem } });
      await api(`/sandbox/payments/${o.paymentRef}/complete`, { method: "POST", json: { outcome: "succeeded" } });
      router.replace({ pathname: "/order/[id]", params: { id: o.orderId, token: o.accessToken } });
    } catch (e) {
      setError(e instanceof OfflineError ? t.checkout.offline : t.checkout.failed);
    } finally { setBusy(false); }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[s.head, { paddingTop: insets.top + 8 }]}>
        <Tap onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t.common.back} style={s.round}><Icon name={rtl ? "chevronRight" : "chevronLeft"} size={22} /></Tap>
        <Txt v="h3" style={{ flex: 1, textAlign: "center" }}>{t.checkout.title}</Txt>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: insets.bottom + 150 }} keyboardShouldPersistTaps="handled">
        {loading ? null : !plan ? <Txt v="body">{t.common.loadError}</Txt> : (
          <>
            <Txt v="caption">{t.checkout.yourPlan}</Txt>
            <View style={s.card}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                {isCountry ? <Flag iso={dest} size={44} /> : <IconBubble name={dest === "global" ? "globe" : "layers"} tone={dest === "global" ? "pink" : "blue"} size={44} />}
                <View style={{ flex: 1 }}>
                  <Txt v="h3">{destName(dest, locale, t.common.global)}</Txt>
                  <Txt v="small">{`${plan.dataGb === null ? t.plans.unlimited : fmt(t.common.gb, { n: plan.dataGb })} · ${fmt(t.common.days, { n: plan.validityDays })}`}</Txt>
                </View>
                {plan.source === "DEV_FIXTURE" && <Badge text={t.common.sandboxBadge} tone="amber" />}
              </View>
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.border }} />
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Txt v="label">{t.checkout.total}</Txt>
                <Txt v="h2">{formatPrice(plan.price.amount, plan.price.currency, locale)}</Txt>
              </View>
            </View>

            <View style={{ gap: 6 }}>
              <Txt v="label" nativeID="checkout-email-label">{t.checkout.email}</Txt>
              <TextInput testID="checkout-email" accessibilityLabel={t.checkout.email} value={email} onChangeText={setEmail} onBlur={() => setTouched(true)}
                keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" placeholder="you@example.com" placeholderTextColor={C.faint}
                style={[s.input, { textAlign: rtl ? "right" : "left" }, touched && !valid && { borderColor: "#E5484D" }]} />
              <Txt v="caption" style={touched && !valid ? { color: "#E5484D" } : undefined}>{touched && !valid ? t.checkout.emailInvalid : t.checkout.emailHint}</Txt>
            </View>

            <View style={s.note}><Icon name="info" size={18} color={C.amberInk} /><Txt v="small" style={{ flex: 1, color: C.amberInk }}>{t.checkout.sandboxPayment}</Txt></View>
            {error && <View style={[s.note, { backgroundColor: "#FDECEC" }]}><Icon name="info" size={18} color="#B4232A" /><Txt v="small" style={{ flex: 1, color: "#B4232A" }}>{error}</Txt></View>}
            <Txt v="caption">{t.checkout.legal}</Txt>
          </>
        )}
      </ScrollView>
      {plan && (
        <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
          <Button title={busy ? t.checkout.processing : fmt(t.checkout.pay, { price: formatPrice(plan.price.amount, plan.price.currency, locale) })} loading={busy} onPress={pay} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  round: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  card: { backgroundColor: C.card, borderRadius: R.lg, padding: 18, gap: 14, ...shadow.card },
  input: { height: 54, borderRadius: R.md, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 16, fontSize: 16, color: C.ink },
  note: { flexDirection: "row", gap: 10, alignItems: "flex-start", backgroundColor: C.amberSoft, borderRadius: R.md, padding: 14 },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, backgroundColor: "rgba(244,247,252,0.97)", borderTopWidth: StyleSheet.hairlineWidth, borderColor: C.border },
});
