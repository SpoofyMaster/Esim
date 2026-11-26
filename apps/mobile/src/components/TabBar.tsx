// Floating pill tab bar. The active tab gets a soft blue capsule.
import { View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { C, F, shadow } from "../lib/theme";
import { Press, T } from "./ui";

type Icon = keyof typeof Ionicons.glyphMap;
export const TAB_ICONS: Record<string, [Icon, Icon]> = {
  index: ["home-outline", "home"],
  esims: ["card-outline", "card"],
  help: ["help-buoy-outline", "help-buoy"],
  profile: ["person-outline", "person"],
};

// Loose prop types: the bottom-tab bar props from expo-router's js-tabs.
export function TabBar({ state, descriptors, navigation }: { state: { index: number; routes: { key: string; name: string }[] }; descriptors: Record<string, { options: { title?: string } }>; navigation: { emit: (e: { type: "tabPress"; target: string; canPreventDefault: true }) => { defaultPrevented: boolean }; navigate: (name: string) => void } }) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingBottom: Math.max(insets.bottom, 12), paddingHorizontal: 16 }}>
      <View accessibilityRole="tablist" style={{ flexDirection: "row", backgroundColor: Platform.OS === "web" ? "rgba(255,255,255,0.94)" : C.white, borderRadius: 999, padding: 6, borderWidth: 1, borderColor: C.line, ...shadow.float }}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const icons = TAB_ICONS[route.name] ?? ["ellipse-outline", "ellipse"];
          const label = descriptors[route.key]?.options.title ?? route.name;
          return (
            <Press key={route.key} testID={`tab-${route.name}`} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={label}
              onPress={() => { const e = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true }); if (!focused && !e.defaultPrevented) navigation.navigate(route.name); }}
              style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8, borderRadius: 999, gap: 2, backgroundColor: focused ? C.blueSoft : "transparent" }}>
              <Ionicons name={focused ? icons[1] : icons[0]} size={22} color={focused ? C.blue : C.ink2} />
              <T v="caption" numberOfLines={1} style={{ fontFamily: focused ? F.bodySemi : F.bodyMedium, color: focused ? C.blue : C.ink2, fontSize: 11, textAlign: "center" }}>{label}</T>
            </Press>
          );
        })}
      </View>
    </View>
  );
}
