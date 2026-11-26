import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { FLAGS } from "@/lib/flags";
import { C, F, R, shadow } from "@/lib/theme";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "./Icon";

type Variant = "display" | "title" | "h2" | "h3" | "body" | "bodyMedium" | "label" | "small" | "caption";
const V: Record<Variant, TextStyle> = {
  display: { fontFamily: F.displayBold, fontSize: 32, lineHeight: 38, letterSpacing: -0.8, color: C.ink },
  title: { fontFamily: F.display, fontSize: 28, lineHeight: 34, letterSpacing: -0.6, color: C.ink },
  h2: { fontFamily: F.display, fontSize: 21, lineHeight: 27, letterSpacing: -0.3, color: C.ink },
  h3: { fontFamily: F.semibold, fontSize: 17, lineHeight: 22, color: C.ink },
  body: { fontFamily: F.body, fontSize: 16, lineHeight: 23, color: C.ink2 },
  bodyMedium: { fontFamily: F.medium, fontSize: 16, lineHeight: 22, color: C.ink },
  label: { fontFamily: F.semibold, fontSize: 15, lineHeight: 20, color: C.ink },
  small: { fontFamily: F.body, fontSize: 14, lineHeight: 19, color: C.muted },
  caption: { fontFamily: F.medium, fontSize: 12, lineHeight: 16, color: C.muted },
};
/** Text with brand fonts; Arabic falls back to the system Arabic font with matching weight. */
export function Txt({ v = "body", style, ...p }: TextProps & { v?: Variant }) {
  const { rtl } = useI18n();
  const base = V[v];
  const ar: TextStyle | undefined = rtl ? { fontFamily: undefined, fontWeight: v === "display" ? "800" : v === "title" || v === "h2" ? "700" : v === "h3" || v === "label" ? "600" : v === "bodyMedium" || v === "caption" ? "500" : "400", letterSpacing: 0, writingDirection: "rtl" } : undefined;
  return <Text {...p} style={[base, ar, { textAlign: "auto" } as TextStyle, style]} />;
}

export function Flag({ iso, size = 40 }: { iso: string; size?: number }) {
  const src = FLAGS[iso.toUpperCase()];
  if (!src) return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: C.fill }} />;
  return <Image source={src} style={{ width: size, height: size, borderRadius: size / 2, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(13,21,38,0.12)" }} contentFit="cover" />;
}

export function Tap({ onPress, haptic = true, style, ...p }: PressableProps & { haptic?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      {...p}
      onPress={(e) => { if (haptic) Haptics.selectionAsync().catch(() => {}); onPress?.(e); }}
      style={({ pressed }) => [style, pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] }]}
    />
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

/** Row card like a settings cell: leading visual, title/subtitle, trailing chevron or badge. */
export function RowCard({ title, sub, leading, trailing, onPress, disabled, a11y }: { title: string; sub?: string; leading?: React.ReactNode; trailing?: React.ReactNode; onPress?: () => void; disabled?: boolean; a11y?: string }) {
  const { rtl } = useI18n();
  return (
    <Tap onPress={disabled ? undefined : onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={a11y ?? (sub ? `${title}, ${sub}` : title)} accessibilityState={{ disabled: !!disabled }} style={[s.card, s.row]}>
      {leading}
      <View style={{ flex: 1 }}>
        <Txt v="h3">{title}</Txt>
        {!!sub && <Txt v="small" style={{ marginTop: 2 }}>{sub}</Txt>}
      </View>
      {trailing ?? <Icon name={rtl ? "chevronLeft" : "chevronRight"} size={20} color={C.faint} />}
    </Tap>
  );
}

export function IconBubble({ name, tone = "blue", size = 48 }: { name: IconName; tone?: "blue" | "pink" | "green"; size?: number }) {
  const bg = tone === "pink" ? C.pinkSoft : tone === "green" ? C.greenSoft : C.blueSoft;
  const fg = tone === "pink" ? C.pinkInk : tone === "green" ? C.greenInk : C.blue;
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}><Icon name={name} size={size * 0.48} color={fg} /></View>;
}

export function Button({ title, onPress, kind = "primary", icon, loading, disabled, style }: { title: string; onPress?: () => void; kind?: "primary" | "dark" | "ghost"; icon?: React.ReactNode; loading?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  const bg = kind === "primary" ? C.blue : kind === "dark" ? C.ink : "transparent";
  const fg = kind === "ghost" ? C.ink : "#fff";
  return (
    <Tap onPress={disabled || loading ? undefined : onPress} accessibilityRole="button" accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={[s.btn, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 }, kind === "ghost" && { borderWidth: 1, borderColor: C.border }, kind === "primary" && shadow.blue, style]}>
      {loading ? <ActivityIndicator color={fg} /> : <>{icon}<Txt v="label" style={{ color: fg, fontSize: 17 }}>{title}</Txt></>}
    </Tap>
  );
}

export function Badge({ text, tone = "pink" }: { text: string; tone?: "pink" | "green" | "blue" | "amber" }) {
  const m = { pink: [C.pinkSoft, C.pinkInk], green: [C.greenSoft, C.greenInk], blue: [C.blueSoft, C.blueDark], amber: [C.amberSoft, C.amberInk] }[tone];
  return <View style={{ backgroundColor: m[0], borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" }}><Txt v="caption" style={{ color: m[1] }}>{text}</Txt></View>;
}

export function SandboxNote({ text }: { text: string }) {
  return (
    <View style={s.note} accessibilityRole="text">
      <Icon name="info" size={16} color={C.amberInk} />
      <Txt v="caption" style={{ color: C.amberInk, flex: 1 }}>{text}</Txt>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: R.lg, ...shadow.card },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 18, paddingVertical: 16, minHeight: 72 },
  btn: { height: 56, borderRadius: R.pill, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10, paddingHorizontal: 24 },
  note: { flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: C.amberSoft, borderRadius: R.sm, paddingHorizontal: 12, paddingVertical: 10 },
});
