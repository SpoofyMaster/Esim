import { ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "../i18n";
import { C } from "../lib/theme";
import { ScreenHeader } from "../components/ScreenHeader";
import { SignInPanel } from "../components/SignInPanel";

export default function SignIn() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  return (
    <>
      <ScreenHeader />
      <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 32, flexGrow: 1, justifyContent: "center" }} keyboardShouldPersistTaps="handled">
        <SignInPanel title={t.auth.profileTitle} onDone={() => router.back()} />
      </ScrollView>
    </>
  );
}
