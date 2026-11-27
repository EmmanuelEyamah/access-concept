import * as Haptics from "expo-haptics";
import { Check, ScanSmiley } from "phosphor-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { Press } from "@/components/ui/Press";
import { LOGO, PEOPLE } from "@/constants/assets";
import { AUTOPILOT, USER } from "@/constants/data";
import { colors, fonts } from "@/utils/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 132;
const R = 62;
const LENGTH = 2 * Math.PI * R;

type Stage = "idle" | "scanning" | "done";

interface LoginProps {
  active: boolean;
  onUnlock: () => void;
}

/** One button. A ring closes around your photo while Face ID checks, then the sheet lifts off the app. */
export const Login = ({ active, onUnlock }: LoginProps) => {
  const insets = useSafeAreaInsets();
  const [stage, setStage] = useState<Stage>("idle");
  const [gone, setGone] = useState(false);
  const busy = useRef(false);

  const enter = useSharedValue(0);
  const ring = useSharedValue(0);
  const ok = useSharedValue(0);
  const exit = useSharedValue(0);

  useEffect(() => {
    if (active) enter.value = withTiming(1, { duration: 560, easing: Easing.out(Easing.cubic) });
  }, [active, enter]);

  const unlock = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    setStage("scanning");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    ring.value = withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) });
    setTimeout(() => {
      setStage("done");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      ok.value = withSpring(1, { damping: 11, stiffness: 200 });
    }, 950);
    setTimeout(() => {
      exit.value = withTiming(1, { duration: 520, easing: Easing.inOut(Easing.cubic) });
      onUnlock();
    }, 1500);
    setTimeout(() => setGone(true), 2080);
  }, [exit, ok, onUnlock, ring]);

  useEffect(() => {
    if (!AUTOPILOT || !active) return;
    // "shots" holds the sign-in long enough to photograph it, and says when.
    const hold = AUTOPILOT === "shots" ? 3400 : 1500;
    const mark = setTimeout(() => AUTOPILOT === "shots" && console.log("SHOT:login"), 1500);
    const timer = setTimeout(unlock, hold);
    return () => {
      clearTimeout(mark);
      clearTimeout(timer);
    };
  }, [active, unlock]);

  const sheet = useAnimatedStyle(() => ({ opacity: 1 - exit.value, transform: [{ translateY: -exit.value * 50 }] }));
  const rise = useAnimatedStyle(() => ({ opacity: enter.value, transform: [{ translateY: (1 - enter.value) * 18 }] }));
  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: LENGTH * (1 - ring.value), stroke: ok.value > 0.5 ? colors.good : colors.accent }));
  const badge = useAnimatedStyle(() => ({ opacity: ok.value, transform: [{ scale: ok.value }] }));

  if (gone) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.sheet, { paddingTop: insets.top + 22, paddingBottom: Math.max(insets.bottom, 16) + 6 }, sheet]}>
      <Animated.View style={rise}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      <Animated.View style={[styles.center, rise]}>
        <View style={styles.photoWrap}>
          <Image source={PEOPLE.user} style={styles.photo} />
          <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={styles.ring}>
            <AnimatedCircle cx={SIZE / 2} cy={SIZE / 2} r={R} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray={LENGTH} animatedProps={ringProps} />
          </Svg>
          <Animated.View style={[styles.badge, badge]}>
            <Check size={16} color="#FFFFFF" weight="bold" />
          </Animated.View>
        </View>
        <Text style={styles.hello}>Welcome back, {USER.first}</Text>
        <Text style={styles.last}>{stage === "scanning" ? "Checking it is you…" : stage === "done" ? "All good" : "Last signed in today at 09:14"}</Text>
      </Animated.View>

      <Animated.View style={rise}>
        <Press onPress={unlock} depth={0.97} haptic={false} style={styles.cta}>
          <ScanSmiley size={22} color="#FFFFFF" weight="bold" />
          <Text style={styles.ctaText}>Sign in with Face ID</Text>
        </Press>
        <Text style={styles.other}>Use password instead</Text>
        <Text style={styles.legal}>Concept redesign. Not affiliated with Access Bank.</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheet: { backgroundColor: colors.bg, zIndex: 50, paddingHorizontal: 22, justifyContent: "space-between" },
  logo: { width: 118, height: 29 },
  center: { alignItems: "center" },
  photoWrap: { width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" },
  photo: { width: 108, height: 108, borderRadius: 54 },
  ring: { position: "absolute", transform: [{ rotate: "-90deg" }] },
  badge: { position: "absolute", right: 10, bottom: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.good, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: colors.bg },
  hello: { fontFamily: fonts.bold, fontSize: 26, letterSpacing: -0.8, color: colors.text, marginTop: 22, textAlign: "center" },
  last: { fontFamily: fonts.regular, fontSize: 14.5, color: colors.muted, marginTop: 8, textAlign: "center" },
  cta: { height: 58, borderRadius: 29, backgroundColor: colors.accent, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  ctaText: { fontFamily: fonts.semibold, fontSize: 16.5, color: "#FFFFFF" },
  other: { fontFamily: fonts.medium, fontSize: 15, color: colors.text, textAlign: "center", marginTop: 20 },
  legal: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.faint, textAlign: "center", marginTop: 22 },
});
