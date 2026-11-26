// BLEUSIM "Orbit" symbol + wordmark, ported from the web logo. On light surfaces the orbit is drawn in brand blue.
import { View, Text } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { C, F } from "../lib/theme";

export function Symbol({ size = 28, orbit = C.blue }: { size?: number; orbit?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Defs>
        <LinearGradient id="bs-planet" x1="6" y1="5" x2="26" y2="27" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#39C6FF" />
          <Stop offset="0.55" stopColor="#0057FF" />
          <Stop offset="1" stopColor="#0A1E3F" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="16" r="11" fill="url(#bs-planet)" />
      <Path d="M3.2 21.5C1.6 18.4 7.4 12.2 16.2 8.1 25 4 31.4 4 30.3 7.6" fill="none" stroke={orbit} strokeWidth={1.7} strokeLinecap="round" />
      <Path d="M30.3 7.6c-1 3.3-6.9 8.6-14.6 12.2C8.5 23.2 4.4 23.6 3.2 21.5" fill="none" stroke={orbit} strokeOpacity={0.35} strokeWidth={1.7} strokeLinecap="round" />
      <Circle cx="23.9" cy="6.1" r="2.3" fill={orbit} />
      <Circle cx="23.9" cy="6.1" r="4" fill="#39C6FF" fillOpacity={0.25} />
    </Svg>
  );
}

export function Logo({ size = 28, light = false }: { size?: number; light?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, direction: "ltr" }} accessible accessibilityLabel="BLEUSIM" accessibilityRole="image">
      <Symbol size={size} orbit={light ? "#F4F8FF" : C.blue} />
      <Text style={{ fontFamily: F.displaySemi, fontSize: size * 0.68, letterSpacing: 1.6, color: light ? C.white : C.ink }}>
        BLEU<Text style={{ fontFamily: F.display, color: light ? C.cyan : C.blue, fontWeight: "400" }}>SIM</Text>
      </Text>
    </View>
  );
}
