// BLEUSIM mobile UI primitives: text, cards, rows, buttons, flags, badges.
import { type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { C, F, R, shadow } from "../lib/theme";
import { FLAGS } from "../lib/flags.generated";
import { useI18n } from "../i18n";

type Variant = "display" | "h1" | "h2" | "title" | "body" | "sub" | "caption" | "label";
const V: Record<Variant, TextStyle> = {
  display: { fontFamily: F.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: C.ink },
  h1: { fontFamily: F.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.4, color: C.ink },
  h2: { fontFamily: F.displaySemi, fontSize: 19, lineHeight: 25, letterSpacing: -0.2, color: C.ink },
  title: { fontFamily: F.bodySemi, fontSize: 16, lineHeight: 21, color: C.ink },
  body: { fontFamily: F.body, fontSize: 15, lineHeight: 22, color: C.ink2 },
  sub: { fontFamily: F.body, fontSize: 14, lineHeight: 19, color: C.muted },
  caption: { fontFamily: F.body, fontSize: 12, lineHeight: 16, color: C.muted },
  label: { fontFamily: F.bodySemi, fontSize: 13, lineHeight: 17, color: C.ink, letterSpacing: 0.2 },
};

const arabicFor = (family?: string) =>
  !family ? F.arabic : /Bold|Semi|Sora/.test(family) ? F.arabicBold : /Medium/.test(family) ? F.arabicMedium : F.arabic;

export function T({ v = "body", style, ...p }: TextProps & { v?: Variant }) {
  const { rtl } = useI18n();
  const flat: TextStyle = StyleSheet.flatten([V[v], style]) ?? {};
  // Arabic: IBM Plex Sans Arabic (weight mapped from the Latin family), no negative tracking, more line height.
  const ar: TextStyle | undefined = rtl ? { fontFamily: arabicFor(flat.fontFamily), letterSpacing: 0, lineHeight: flat.lineHeight ? flat.lineHeight + 4 : undefined } : undefined;
  return <Text {...p} style={[{ textAlign: rtl ? "right" : "left", writingDirection: rtl ? "rtl" : "ltr" }, flat, ar]} />;
}

export const tap = () => { if (Platform.OS !== "web") void Haptics.selectionAsync(); };

export function Press({ style, onPress, children, ...p }: PressableProps & { style?: StyleProp<ViewStyle>; children?: ReactNode }) {
  return (
    <Pressable {...p} onPress={(e) => { tap(); onPress?.(e); }} style={({ pressed }) => [style, pressed && { opacity: 0.86, transform: [{ scale: 0.985 }] }]}>
      {children}
    </Pressable>
  );
}

export function Card({ children, style, onPress, accessibilityLabel }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string }) {
  if (onPress) return <Press accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={[s.card, style]}>{children}</Press>;
  return <View style={[s.card, style]}>{children}</View>;
}

export function Chevron({ color = C.faint, size = 20 }: { color?: string; size?: number }) {
  const { rtl } = useI18n();
  return <Ionicons name={rtl ? "chevron-back" : "chevron-forward"} size={size} color={color} />;
}

export function Flag({ iso2, size = 36 }: { iso2: string; size?: number }) {
  const src = FLAGS[iso2.toUpperCase()];
  const box = { width: size, height: size, borderRadius: size / 2 };
  if (!src) return <View style={[box, s.flagFallback]}><Text style={{ fontFamily: F.bodySemi, fontSize: size * 0.32, color: C.ink2 }}>{iso2.toUpperCase()}</Text></View>;
  return <Image source={src} style={[box, s.flagRing]} contentFit="cover" accessibilityIgnoresInvertColors />;
}

export function IconBubble({ name, color = C.blue, bg = C.blueSoft, size = 44 }: { name: keyof typeof Ionicons.glyphMap; color?: string; bg?: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}><Ionicons name={name} size={size * 0.48} color={color} /></View>;
}

/** List row: leading visual, title + subtitle, trailing chevron (or custom). */
export function Row({ lead, title, sub, trail, onPress, style, testID }: { lead?: ReactNode; title: string; sub?: string; trail?: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>; testID?: string }) {
  return (
    <Card onPress={onPress} style={[s.row, style]} accessibilityLabel={sub ? `${title}, ${sub}` : title}>
      <View testID={testID} style={s.rowInner}>
        {lead}
        <View style={{ flex: 1, gap: 2 }}>
          <T v="title" numberOfLines={2}>{title}</T>
          {sub ? <T v="sub" numberOfLines={2}>{sub}</T> : null}
        </View>
        {trail ?? (onPress ? <Chevron /> : null)}
      </View>
    </Card>
  );
}

export function Button({ label, onPress, kind = "primary", icon, disabled, loading, style, testID }: {
  label: string; onPress?: () => void; kind?: "primary" | "dark" | "light" | "ghost"; icon?: ReactNode; disabled?: boolean; loading?: boolean; style?: StyleProp<ViewStyle>; testID?: string;
}) {
  const fg = kind === "light" || kind === "ghost" ? C.ink : C.white;
  const inner = (
    <View style={s.btnInner}>
      {loading ? <ActivityIndicator color={fg} /> : icon}
      <T v="title" style={{ color: fg, fontSize: 16, textAlign: "center" }} numberOfLines={1}>{label}</T>
    </View>
  );
  return (
    <Press testID={testID} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled, busy: !!loading }} disabled={disabled || loading} onPress={onPress}
      style={[s.btn, kind === "dark" && { backgroundColor: C.navy }, kind === "light" && { backgroundColor: C.white, borderWidth: 1, borderColor: C.line }, kind === "ghost" && { backgroundColor: "transparent" }, disabled && { opacity: 0.45 }, style]}>
      {kind === "primary" ? <LinearGradient colors={[C.blue, "#2F7BFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: R.pill }]} /> : null}
      {inner}
    </Press>
  );
}

export function SandboxBadge({ style }: { style?: StyleProp<ViewStyle> }) {
  const { t } = useI18n();
  return (
    <View style={[s.badge, style]} accessibilityLabel={t.common.sandboxNote}>
      <Ionicons name="flask-outline" size={12} color="#9A6400" />
      <Text style={s.badgeText}>{t.common.sandbox.toUpperCase()}</Text>
    </View>
  );
}

export function Note({ icon = "information-circle-outline", children, tone = "info" }: { icon?: keyof typeof Ionicons.glyphMap; children: ReactNode; tone?: "info" | "warn" | "error" }) {
  const bg = tone === "warn" ? C.amberSoft : tone === "error" ? "#FDECEC" : C.soft;
  const fg = tone === "warn" ? "#8A5A00" : tone === "error" ? C.danger : C.blueDeep;
  return (
    <View style={[s.note, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={18} color={fg} style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

export function SectionTitle({ title, sub, style }: { title: string; sub?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ gap: 2, marginBottom: 12 }, style]}>
      <T v="h2" accessibilityRole="header">{title}</T>
      {sub ? <T v="sub">{sub}</T> : null}
    </View>
  );
}

export function Loading() {
  const { t } = useI18n();
  return <View style={{ padding: 32, alignItems: "center" }} accessibilityLabel={t.common.loading}><ActivityIndicator color={C.blue} /></View>;
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <View style={{ padding: 24, alignItems: "center", gap: 12 }}>
      <T v="body">{t.common.error}</T>
      <Button kind="light" label={t.common.retry} onPress={onRetry} />
    </View>
  );
}

export const s = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: R.lg, ...shadow.card },
  row: { paddingVertical: 16, paddingHorizontal: 16 },
  rowInner: { flexDirection: "row", alignItems: "center", gap: 14 },
  flagRing: { borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(11,21,48,0.12)" },
  flagFallback: { backgroundColor: C.soft, alignItems: "center", justifyContent: "center" },
  btn: { minHeight: 56, borderRadius: R.pill, backgroundColor: C.blue, justifyContent: "center", paddingHorizontal: 22, overflow: "hidden" },
  btnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", backgroundColor: C.amberSoft, borderRadius: R.pill, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontFamily: F.bodyBold, fontSize: 10, letterSpacing: 0.8, color: "#9A6400" },
  note: { flexDirection: "row", gap: 10, padding: 14, borderRadius: R.md },
});
