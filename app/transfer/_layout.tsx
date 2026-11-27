import { Stack } from "expo-router";
import { colors } from "@/utils/theme";

// The review screen has a slider that starts at the left edge, exactly where iOS listens for the back-swipe.
// The gesture is switched off there so a drag on the slider cannot pop the screen. The back arrow still works.
const TransferLayout = () => (
  <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", contentStyle: { backgroundColor: colors.bg } }}>
    <Stack.Screen name="index" />
    <Stack.Screen name="new" />
    <Stack.Screen name="amount" />
    <Stack.Screen name="review" options={{ gestureEnabled: false, fullScreenGestureEnabled: false }} />
    <Stack.Screen name="result" options={{ gestureEnabled: false }} />
  </Stack>
);

export default TransferLayout;
