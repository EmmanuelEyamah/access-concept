import { Stack } from "expo-router";
import { colors } from "@/utils/theme";

const BillsLayout = () => <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", contentStyle: { backgroundColor: colors.bg } }} />;

export default BillsLayout;
