// Order confirmation: polls the order until the eSIM is provisioned, then shows the QR code and LPA string.
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SvgXml } from "react-native-svg";
import QRCode from "qrcode";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n, fmt } from "../../i18n";
import { api } from "../../lib/auth";
import { C, R } from "../../lib/theme";
import { Button, Card, IconBubble, Loading, Note, T } from "../../components/ui";

interface Order { number: string; status: string; items: { esim: { lpa: string; isSandbox: boolean; status: string } | null }[] }

export default function OrderScreen() {
  const { id = "", token = "" } = useLocalSearchParams<{ id: string; token: string }>();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState<Order | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  useEffect(() => {
    let alive = true, tries = 0;
    const tick = async () => {
      try {
        const r = await api(`/orders/${id}`, { headers: { "x-order-token": String(token) } });
        if (r.ok) {
          const o = (await r.json()) as Order;
          if (!alive) return;
          setOrder(o);
          const lpa = o.items[0]?.esim?.lpa;
          if (lpa) { setQr(await QRCode.toString(lpa, { type: "svg", margin: 1, color: { dark: "#0B1530", light: "#FFFFFF" } })); return; }
        }
      } catch { /* retry */ }
      if (alive && ++tries < 20) setTimeout(tick, 1500);
    };
    void tick();
    return () => { alive = false; };
  }, [id, token]);
  const esim = order?.items[0]?.esim;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32, gap: 18, alignItems: "stretch" }}>
      <View style={{ alignItems: "center", gap: 12 }}>
        <IconBubble name={esim ? "checkmark" : "hourglass-outline"} size={64} bg={esim ? "#DDF7EA" : C.blueSoft} color={esim ? C.success : C.blue} />
        <T v="h1" style={{ textAlign: "center" }} accessibilityRole="header">{esim ? t.order.title : t.order.pending}</T>
        {order ? <T v="sub" style={{ textAlign: "center" }}>{fmt(t.order.number, { n: order.number })}</T> : null}
      </View>
      {!esim ? <Loading /> : (
        <>
          <Card style={{ padding: 20, alignItems: "center", gap: 14 }}>
            {qr ? <View style={{ padding: 8, backgroundColor: C.white, borderRadius: R.md }} accessibilityLabel="QR code"><SvgXml xml={qr} width={220} height={220} /></View> : <Loading />}
            <T v="sub" style={{ textAlign: "center" }}>{t.order.scan}</T>
            <View style={{ alignSelf: "stretch", backgroundColor: C.bg, borderRadius: R.md, padding: 12, gap: 4 }}>
              <T v="caption">{t.order.lpa}</T>
              <T v="body" selectable style={{ fontSize: 13, color: C.ink, writingDirection: "ltr", textAlign: "left" }}>{esim.lpa}</T>
            </View>
          </Card>
          {esim.isSandbox ? <Note tone="warn" icon="flask-outline"><T v="sub" style={{ color: "#6B4700" }}>{t.order.sandbox}</T></Note> : null}
          <Button kind="light" label={t.order.steps} onPress={() => router.push("/guide/start")} />
        </>
      )}
      <Button label={t.order.home} onPress={() => router.replace("/")} />
    </ScrollView>
  );
}
