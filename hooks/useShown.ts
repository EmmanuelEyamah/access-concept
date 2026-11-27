import { useIsFocused } from "expo-router";
import { useBankStore } from "@/stores/useBankStore";

/** True once the user is past the login and this screen is the one in front: screens replay their entrance on it. */
export const useShown = () => {
  const focused = useIsFocused();
  const phase = useBankStore((s) => s.phase);
  return focused && phase === "app";
};
