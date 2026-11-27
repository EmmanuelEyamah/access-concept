import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { MARK } from "@/constants/assets";
import { colors } from "@/utils/theme";

interface SplashProps {
  onDone: () => void;
}

/** Loading screen: the mark settles in, a thin line fills beneath it, then the sheet clears. */
export const Splash = ({ onDone }: SplashProps) => {
  const [gone, setGone] = useState(false);
  const mark = useSharedValue(0);
  const load = useSharedValue(0);
  const exit = useSharedValue(0);

  useEffect(() => {
    mark.value = withSpring(1, { damping: 14, stiffness: 110 });
    load.value = withDelay(250, withTiming(1, { duration: 1150, easing: Easing.bezier(0.6, 0, 0.2, 1) }));
    exit.value = withDelay(1550, withTiming(1, { duration: 380, easing: Easing.inOut(Easing.cubic) }));
    const reveal = setTimeout(onDone, 1520);
    const done = setTimeout(() => setGone(true), 1960);
    return () => {
      clearTimeout(reveal);
      clearTimeout(done);
    };
  }, [exit, load, mark, onDone]);

  const markStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, mark.value * 1.6), transform: [{ scale: 0.72 + mark.value * 0.28 }] }));
  const fill = useAnimatedStyle(() => ({ width: `${load.value * 100}%` }));
  const rail = useAnimatedStyle(() => ({ opacity: Math.min(1, mark.value) * (1 - exit.value) }));
  const sheet = useAnimatedStyle(() => ({ opacity: 1 - exit.value }));

  if (gone) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.sheet, sheet]} pointerEvents="none">
      <Animated.View style={markStyle}>
        <Image source={MARK} style={styles.mark} resizeMode="contain" />
      </Animated.View>
      <Animated.View style={[styles.rail, rail]}>
        <Animated.View style={[styles.fill, fill]} />
      </Animated.View>
      <View style={styles.spacer} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheet: { backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", zIndex: 70 },
  mark: { width: 92, height: 97 },
  rail: { width: 92, height: 3, borderRadius: 2, backgroundColor: colors.raised, marginTop: 34, overflow: "hidden" },
  fill: { height: 3, borderRadius: 2, backgroundColor: colors.accent },
  spacer: { height: 40 },
});
