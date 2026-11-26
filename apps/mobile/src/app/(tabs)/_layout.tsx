import { Tabs } from "expo-router/js-tabs";
import { TabBar } from "@/components/TabBar";

export default function TabsLayout() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="esims" />
      <Tabs.Screen name="help" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
