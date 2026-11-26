import { StyleSheet, View } from "react-native";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, R, shadow } from "@/lib/theme";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "./Icon";
import { Tap, Txt } from "./ui";

// Floating pill tab bar.
const ITEMS: Record<string, { icon: IconName; key: "home" | "esims" | "help" | "profile" }> = {
  index: { icon: "home", key: "home" },
  esims: { icon: "sim", key: "esims" },
  help: { icon: "help", key: "help" },
  profile: { icon: "user", key: "profile" },
};

export function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  return (
    <View pointerEvents="box-none" style={[s.wrap, { paddingBottom: Math.max(insets.bottom - 6, 10) }]}>
      <View style={s.bar} accessibilityRole="tablist">
        {state.routes.map((route, i) => {
          const item = ITEMS[route.name];
          if (!item) return null;
          const active = state.index === i;
          return (
            <Tap key={route.key} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={t.tabs[item.key]}
              onPress={() => { if (!active) navigateToTab(route.key); }}
              style={[s.item, active && s.active]}>
              <Icon name={item.icon} size={23} color={active ? C.blue : C.ink2} stroke={active ? 2.2 : 1.9} />
              <Txt v="caption" numberOfLines={1} style={{ color: active ? C.blue : C.ink2, fontSize: 11.5, marginTop: 2 }}>{t.tabs[item.key]}</Txt>
            </Tap>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 18 },
  bar: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.97)", borderRadius: R.pill, padding: 6, borderWidth: 1, borderColor: C.border, ...shadow.float },
  item: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8, borderRadius: R.pill },
  active: { backgroundColor: C.blueSoft },
});
