import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Screen } from "@/components/Screen";
import { Badge, IconBubble, RowCard } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { WEB_URL } from "@/lib/config";
import { C } from "@/lib/theme";
import { useI18n } from "@/i18n";

export default function Help() {
  const { t, locale } = useI18n();
  const web = (path: string) => WebBrowser.openBrowserAsync(`${WEB_URL}${locale === "en" ? "" : `/${locale}`}${path}`);
  return (
    <Screen title={t.help.title}>
      <RowCard title={t.help.start} sub={t.help.startSub} leading={<IconBubble name="rocket" />} onPress={() => router.push({ pathname: "/guide", params: { focus: "steps" } })} />
      <RowCard title={t.help.center} leading={<IconBubble name="question" />} trailing={<Icon name="external" size={20} color={C.faint} />} onPress={() => web("/#faq")} />
      <RowCard title={t.help.chat} leading={<IconBubble name="chat" />} badge={<Badge text={t.common.soon} />} trailing={<></>} disabled />
      <RowCard title={t.help.refund} sub={t.help.refundSub} leading={<IconBubble name="refund" />} trailing={<Icon name="external" size={20} color={C.faint} />} onPress={() => web("/terms#refunds")} />
      <RowCard title={t.help.network} sub={t.help.networkSub} leading={<IconBubble name="signal" />} onPress={() => router.push({ pathname: "/guide", params: { focus: "network" } })} />
      <RowCard title={t.help.feedback} sub={t.help.feedbackSub} leading={<IconBubble name="flag" tone="pink" />} badge={<Badge text={t.common.soon} />} trailing={<></>} disabled />
    </Screen>
  );
}
