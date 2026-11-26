// Checkout: plan summary, delivery email, sandbox payment through the BLEUSIM API.
// With no API configured (DEV FIXTURE catalog) the pay button is disabled and says why: no fake orders.
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n, fmt } from "../i18n";
import { useAuth, api } from "../lib/auth";
import { hasApi } from "../lib/config";
import { dataLabel, destName, parseDest, plansFor, useAsync } from "../lib/catalog";
import { C, F, R } from "../lib/theme";
import { Button, Card, ErrorState, Flag, IconBubble, Loading, Note, SandboxBadge, T } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const key = () => `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

export default function Checkout() {
  const { dest: destParam = "", plan: planId = "" } = useLocalSearchParams<{ dest: string; plan: string }>();
  const dest = useMemo(() => parseDest(String(destParam)), [destParam]);
  const { t, locale, price, rtl } = useI18n();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { data, loading, error, reload } = useAsync(() => plansFor(dest), [destParam]);
  const plan = data?.find((p) => p.id === planId);
  const [email, setEmail] = useState(user?.email ?? "");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [idem] = useState(key);
  const valid = EMAIL.test(email.trim());
  const canPay = hasApi && !!plan;

  async function pay() {
    setTouched(true);
    if (!valid || !plan || !canPay) return;
    setBusy(true); setFailed(false);
    try {
      const r = await api("/checkout", { method: "POST", body: JSON.stringify({ retailPlanId: plan.id, email: email.trim(), idempotencyKey: idem }) });
      if (!r.ok) throw new Error(String(r.status));
      const o = (await r.json()) as { orderId: string; accessToken: string; paymentRef: string };
      const c = await api(`/sandbox/payments/${o.paymentRef}/complete`, { method: "POST", body: JSON.stringify({ outcome: "succeeded" }) });
      if (!c.ok) throw new Error(String(c.status));
      router.replace({ pathname: "/order/[id]", params: { id: o.orderId, token: o.accessToken } });
    } catch {
      setFailed(true);
    } finally { setBusy(false); }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScreenHeader title={t.checkout.title} mode="back" />
      {loading && !data ? <Loading /> : error ? <ErrorState onRetry={reload} /> : !plan ? <ErrorState onRetry={() => router.back()} /> : (
        <>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 160 + insets.bottom }} keyboardShouldPersistTaps="handled">
            <T v="label" style={{ color: C.muted }}>{t.checkout.yourPlan}</T>
            <Card style={{ padding: 16, gap: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                {dest.kind === "country" ? <Flag iso2={dest.iso2} size={44} /> : <IconBubble name={dest.kind === "global" ? "globe-outline" : "map-outline"} />}
                <View style={{ flex: 1 }}>
                  <T v="h2">{destName(dest, locale)}</T>
                  <T v="sub">{`${dataLabel(plan, t)} · ${fmt(t.common.days, { n: plan.validityDays })}`}</T>
                </View>
                {plan.source === "DEV_FIXTURE" ? <SandboxBadge /> : null}
              </View>
              <View style={{ height: 1, backgroundColor: C.line }} />
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <T v="title">{t.checkout.total}</T>
                <T v="h2" style={{ fontFamily: F.display }} testID="checkout-total">{price(plan.price.amount, plan.price.currency)}</T>
              </View>
            </Card>

            <View style={{ gap: 6 }}>
              <T v="label" nativeID="email-label">{t.checkout.email}</T>
              <TextInput testID="checkout-email" accessibilityLabelledBy="email-label" accessibilityLabel={t.checkout.email} value={email} onChangeText={setEmail} onBlur={() => setTouched(true)}
                keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" placeholder="you@example.com" placeholderTextColor={C.faint}
                style={{ height: 54, borderRadius: R.md, backgroundColor: C.white, borderWidth: 1.5, borderColor: touched && !valid ? C.danger : C.line, paddingHorizontal: 16, fontFamily: F.body, fontSize: 16, color: C.ink, textAlign: rtl ? "right" : "left" }} />
              {touched && !valid ? <T v="caption" style={{ color: C.danger }}>{t.checkout.emailInvalid}</T> : <T v="caption">{t.checkout.emailHint}</T>}
            </View>

            {!canPay ? <Note tone="warn" icon="flask-outline"><T v="sub" style={{ color: "#6B4700" }}>{t.checkout.notConnected}</T></Note>
              : <Note icon="shield-checkmark-outline"><T v="sub" style={{ color: C.ink2 }}>{t.checkout.sandboxPayment}</T></Note>}
            {failed ? <Note tone="error" icon="alert-circle-outline"><T v="sub" style={{ color: C.danger }}>{t.checkout.failed}</T></Note> : null}
            <T v="caption">{t.checkout.legal}</T>
          </ScrollView>
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), backgroundColor: "rgba(243,246,252,0.96)", borderTopWidth: 1, borderTopColor: C.line }}>
            <Button testID="checkout-pay" disabled={!canPay} loading={busy} label={busy ? t.checkout.processing : fmt(t.checkout.paySandbox, { price: price(plan.price.amount, plan.price.currency) })} onPress={pay} />
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
