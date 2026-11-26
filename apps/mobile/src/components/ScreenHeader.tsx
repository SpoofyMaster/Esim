// Header for modal screens: round close/back button, centred title, optional trailing slot.
import { type ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { C, shadow } from "../lib/theme";
import { Press, T } from "./ui";
import { useI18n } from "../i18n";

export function RoundButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Press accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={8}
      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.white, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.line, ...shadow.card }}>
      <Ionicons name={icon} size={22} color={C.ink} />
    </Press>
  );
}

export function ScreenHeader({ title, mode = "close", trailing, onClose }: { title?: string; mode?: "close" | "back"; trailing?: ReactNode; onClose?: () => void }) {
  const { t, rtl } = useI18n();
  const insets = useSafeAreaInsets();
  const close = onClose ?? (() => (router.canGoBack() ? router.back() : router.replace("/")));
  const icon = mode === "close" ? "close" : rtl ? "chevron-forward" : "chevron-back";
  return (
    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 10, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.bg }}>
      <RoundButton icon={icon} label={mode === "close" ? t.common.close : t.common.back} onPress={close} />
      <View style={{ flex: 1, alignItems: "center" }}>{title ? <T v="title" style={{ textAlign: "center", fontSize: 17 }} numberOfLines={1} accessibilityRole="header">{title}</T> : null}</View>
      <View style={{ minWidth: 44, alignItems: "flex-end" }}>{trailing}</View>
    </View>
  );
}
