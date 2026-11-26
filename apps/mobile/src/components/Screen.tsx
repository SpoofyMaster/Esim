import { ScrollView, StyleSheet, View, type ScrollViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C } from "@/lib/theme";
import { Txt } from "./ui";

/** Scrolling tab screen with room for the floating tab bar. */
export function Screen({ title, children, header, ...p }: ScrollViewProps & { title?: string; header?: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView {...p} style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={[s.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 120 }]} keyboardShouldPersistTaps="handled">
      {header}
      {!!title && <Txt v="display" accessibilityRole="header" style={{ fontSize: 36, lineHeight: 42, marginTop: 24, marginBottom: 20 }}>{title}</Txt>}
      <View style={{ gap: 12 }}>{children}</View>
    </ScrollView>
  );
}
const s = StyleSheet.create({ content: { paddingHorizontal: 20 } });
