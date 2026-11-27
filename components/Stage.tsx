import { StatusBar } from "expo-status-bar";
import { useCallback, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Login } from "@/components/Login";
import { Onboarding } from "@/components/Onboarding";
import { Splash } from "@/components/Splash";
import { useBankStore } from "@/stores/useBankStore";
import { colors } from "@/utils/theme";

interface StageProps {
  children: ReactNode;
}

/** The app sits underneath. The sign-in, the onboarding and the loading screen are layered over it and lift away in turn. */
export const Stage = ({ children }: StageProps) => {
  const phase = useBankStore((s) => s.phase);
  const setPhase = useBankStore((s) => s.setPhase);
  const toOnboarding = useCallback(() => setPhase("onboarding"), [setPhase]);
  const toLogin = useCallback(() => setPhase("login"), [setPhase]);
  const toApp = useCallback(() => setPhase("app"), [setPhase]);

  return (
    <View style={styles.stage}>
      <StatusBar style="light" />
      {children}
      <Login active={phase === "login" || phase === "app"} onUnlock={toApp} />
      <Onboarding active={phase !== "splash"} onDone={toLogin} />
      <Splash onDone={toOnboarding} />
    </View>
  );
};

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: colors.bg },
});
