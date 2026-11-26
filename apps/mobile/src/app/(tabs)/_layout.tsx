import { Tabs } from "expo-router/js-tabs";
import { TabBar } from "../../components/TabBar";
import { useI18n } from "../../i18n";
import { C } from "../../lib/theme";

export default function TabsLayout() {
  const { t } = useI18n();
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tabs tabBar={(p) => <TabBar {...(p as any)} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.bg } }}>
      <Tabs.Screen name="index" options={{ title: t.tabs.home }} />
      <Tabs.Screen name="esims" options={{ title: t.tabs.esims }} />
      <Tabs.Screen name="help" options={{ title: t.tabs.help }} />
      <Tabs.Screen name="profile" options={{ title: t.tabs.profile }} />
    </Tabs>
  );
}
