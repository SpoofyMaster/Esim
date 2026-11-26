// Order confirmation: waits for provisioning, then shows the eSIM QR code and activation code.
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SvgXml } from "react-native-svg";
import QRCode from "qrcode";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, IconBubble, Txt } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { API_URL } from "@/lib/config";
import { C, R, shadow } from "@/lib/theme";
import { fmt, useI18n } from "@/i18n";

interface Order { number: string; items: { esim: { lpa: string; isSandbox: boolean } | null }[] }

export default function OrderScreen() {
  const { id = "", token = "" } = useLocalSearchParams<{ id: string; token: string }>();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState<Order | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  useEffect(() => {
    let live = true, tries = 0;
    const tick = async () => {
      try {
        const r = await fetch(`${API_URL}/v1/orders/${encodeURIComponent(id)}`, { headers: { accept: "application/json", "x-order-token": String(token) } });
        if (r.ok) {
          const o = (await r.json()) as Order;
          if (!live) return;
          setOrder(o);
          const lpa = o.items[0]?.esim?.lpa;
          if (lpa) { setQr(await QRCode.toString(lpa, { type: "svg", margin: 1, color: { dark: "#0D1526", light: "#FFFFFF" } })); return; }
        }
      } catch { /* retry */ }
      if (live && ++tries < 20) setTimeout(tick, 1500);
    };
    void tick();
    return () => { live = false; };
  }, [id, token]);
  const esim = order?.items[0]?.esim;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: Platform.OS === "ios" ? 32 : insets.top + 32, paddingBottom: insets.bottom + 32, gap: 18 }}>
      <View style={{ alignItems: "center", gap: 12 }}>
        <IconBubble name={esim ? "check" : "sim"} tone={esim ? "green" : "blue"} size={68} />
        <Txt v="title" accessibilityRole="header" style={{ textAlign: "center" }}>{esim ? t.order.title : t.order.pending}</Txt>
        {order && <Txt v="small" style={{ textAlign: "center" }}>{fmt(t.order.number, { n: order.number })}</Txt>}
      </View>
      {!esim ? <ActivityIndicator color={C.blue} /> : (
        <>
          <View style={s.card}>
            {qr ? <View accessibilityLabel="QR code" style={{ padding: 8, backgroundColor: "#fff", borderRadius: R.md }}><SvgXml xml={qr} width={220} height={220} /></View> : <ActivityIndicator color={C.blue} />}
            <Txt v="small" style={{ textAlign: "center" }}>{t.order.scan}</Txt>
            <View style={s.code}>
              <Txt v="caption">{t.order.lpa}</Txt>
              <Txt v="body" selectable style={{ fontSize: 13, color: C.ink, writingDirection: "ltr", textAlign: "left" }}>{esim.lpa}</Txt>
            </View>
          </View>
          {esim.isSandbox && <View style={s.note}><Icon name="info" size={18} color={C.amberInk} /><Txt v="small" style={{ flex: 1, color: C.amberInk }}>{t.order.sandbox}</Txt></View>}
          <Button title={t.order.steps} kind="ghost" onPress={() => router.push({ pathname: "/guide", params: { focus: "steps" } })} />
        </>
      )}
      <Button title={t.order.home} onPress={() => router.replace("/")} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: R.lg, padding: 20, alignItems: "center", gap: 14, ...shadow.card },
  code: { alignSelf: "stretch", backgroundColor: C.bg, borderRadius: R.md, padding: 12, gap: 4 },
  note: { flexDirection: "row", gap: 10, alignItems: "flex-start", backgroundColor: C.amberSoft, borderRadius: R.md, padding: 14 },
});
