import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Autopilot } from "@/components/Autopilot";
import { Stage } from "@/components/Stage";
import { colors } from "@/utils/theme";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <Stage>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="transfer" options={{ animation: "slide_from_bottom", gestureEnabled: false, fullScreenGestureEnabled: false }} />
            <Stack.Screen name="support" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="add-money" options={{ animation: "slide_from_bottom" }} />
            <Stack.Screen name="bills" options={{ animation: "slide_from_bottom" }} />
            <Stack.Screen name="notifications" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="tx/[id]" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="done" options={{ animation: "fade" }} />
          </Stack>
          <Autopilot />
        </Stage>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
