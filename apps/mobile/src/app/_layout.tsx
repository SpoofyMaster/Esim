import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Sora_600SemiBold, Sora_700Bold } from "@expo-google-fonts/sora";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import { I18nProvider, useI18n } from "@/i18n";
import { SessionProvider } from "@/lib/session";
import { C } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded] = useFonts({ Sora_600SemiBold, Sora_700Bold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  useEffect(() => { if (loaded) SplashScreen.hideAsync().catch(() => {}); }, [loaded]);
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <SessionProvider>
          <StatusBar style="dark" />
          <Root />
        </SessionProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

/** Arabic mirrors the whole layout through Yoga's `direction`, so switching language needs no restart. */
function Root() {
  const { rtl, locale } = useI18n();
  // Keyed by language: a clean re-render applies fonts and direction everywhere at once.
  return (
    <View key={locale} style={{ flex: 1, direction: rtl ? "rtl" : "ltr" }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="search" options={{ presentation: "modal" }} />
        <Stack.Screen name="plans/[dest]" options={{ presentation: "modal" }} />
        <Stack.Screen name="signin" options={{ presentation: "modal" }} />
        <Stack.Screen name="guide" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="order/[id]" options={{ gestureEnabled: false }} />
      </Stack>
    </View>
  );
}
