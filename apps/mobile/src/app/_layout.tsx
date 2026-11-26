import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, Sora_600SemiBold, Sora_700Bold } from "@expo-google-fonts/sora";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { IBMPlexSansArabic_400Regular, IBMPlexSansArabic_500Medium, IBMPlexSansArabic_700Bold } from "@expo-google-fonts/ibm-plex-sans-arabic";
import { Ionicons } from "@expo/vector-icons";
import { I18nProvider, useI18n } from "../i18n";
import { AuthProvider } from "../lib/auth";
import { C } from "../lib/theme";

void SplashScreen.preventAutoHideAsync().catch(() => {});

function Root() {
  const { rtl } = useI18n();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, direction: rtl ? "rtl" : "ltr" }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="search" options={{ presentation: "modal", animation: "fade_from_bottom" }} />
        <Stack.Screen name="plans/[id]" options={{ presentation: "modal" }} />
        <Stack.Screen name="destinations" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="order/[id]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="sign-in" options={{ presentation: "modal" }} />
        <Stack.Screen name="guide/[topic]" />
        <Stack.Screen name="language" options={{ presentation: "modal" }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Sora_600SemiBold, Sora_700Bold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
    IBMPlexSansArabic_400Regular, IBMPlexSansArabic_500Medium, IBMPlexSansArabic_700Bold, ...Ionicons.font,
  });
  useEffect(() => { if (loaded || error) void SplashScreen.hideAsync().catch(() => {}); }, [loaded, error]);
  if (!loaded && !error) return null;
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
