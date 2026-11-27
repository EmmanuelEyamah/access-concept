import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Backspace, Check, DeviceMobile, Headset, MapPin, QrCode, ScanSmiley, type IconProps } from "phosphor-react-native";
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { Press } from "@/components/ui/Press";
import { LOGO, PEOPLE, PHOTOS } from "@/constants/assets";
import { AUTOPILOT, USER } from "@/constants/data";
import { colors, fonts } from "@/utils/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 92;
const R = 43;
const LENGTH = 2 * Math.PI * R;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "face", "0", "back"] as const;
const QUICK: { label: string; Icon: ComponentType<IconProps> }[] = [
  { label: "Buy airtime", Icon: DeviceMobile },
  { label: "Scan to pay", Icon: QrCode },
  { label: "ATM near me", Icon: MapPin },
];

type Stage = "idle" | "checking" | "done";

interface DotProps {
  filled: boolean;
  ok: boolean;
}
const Dot = ({ filled, ok }: DotProps) => {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = filled ? withSequence(withTiming(1.5, { duration: 80 }), withSpring(1, { damping: 8, stiffness: 260 })) : withTiming(0, { duration: 120 });
  }, [filled, t]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: 0.6 + Math.min(1, t.value) * 0.4 + Math.max(0, t.value - 1) * 0.4 }] }));
  return <Animated.View style={[styles.dot, filled && { backgroundColor: ok ? colors.good : colors.text }, style]} />;
};

interface LoginProps {
  active: boolean;
  onUnlock: () => void;
}

/**
 * Sign-in for someone the app already knows: their face, a four-digit PIN pad with Face ID one key away,
 * and three things they can do without signing in at all.
 */
export const Login = ({ active, onUnlock }: LoginProps) => {
  const insets = useSafeAreaInsets();
  const [stage, setStage] = useState<Stage>("idle");
  const [pin, setPin] = useState("");
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
    setStage("checking");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    ring.value = withTiming(1, { duration: 700, easing: Easing.inOut(Easing.cubic) });
    setTimeout(() => {
      setStage("done");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      ok.value = withSpring(1, { damping: 11, stiffness: 200 });
    }, 740);
    setTimeout(() => {
      exit.value = withTiming(1, { duration: 520, easing: Easing.inOut(Easing.cubic) });
      onUnlock();
    }, 1240);
    setTimeout(() => setGone(true), 1820);
  }, [exit, ok, onUnlock, ring]);

  const press = (key: (typeof KEYS)[number]) => {
    if (busy.current) return;
    Haptics.selectionAsync();
    if (key === "face") return unlock();
    if (key === "back") return setPin((p) => p.slice(0, -1));
    const next = (pin + key).slice(0, 4);
    setPin(next);
    if (next.length === 4) setTimeout(unlock, 160);
  };

  // Hands-free runs type the PIN themselves. "shots" waits longer so the screen can be photographed first.
  useEffect(() => {
    if (!AUTOPILOT || !active) return;
    const hold = AUTOPILOT === "shots" ? 2600 : 900;
    const mark = setTimeout(() => console.log(AUTOPILOT === "film" ? "MARK:login" : "SHOT:login"), 700);
    const digits = [1, 2, 3, 4].map((n) => setTimeout(() => setPin("4821".slice(0, n)), hold + n * 230));
    const go = setTimeout(unlock, hold + 4 * 230 + 220);
    return () => [mark, go, ...digits].forEach(clearTimeout);
  }, [active, unlock]);

  const sheet = useAnimatedStyle(() => ({ opacity: 1 - exit.value, transform: [{ translateY: -exit.value * 50 }] }));
  const rise = useAnimatedStyle(() => ({ opacity: enter.value, transform: [{ translateY: (1 - enter.value) * 18 }] }));
  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: LENGTH * (1 - ring.value), stroke: ok.value > 0.5 ? colors.good : colors.accent }));
  const badge = useAnimatedStyle(() => ({ opacity: ok.value, transform: [{ scale: ok.value }] }));

  if (gone) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.sheet, { paddingTop: insets.top + 18, paddingBottom: Math.max(insets.bottom, 14) + 2 }, sheet]}>
      <View style={styles.backdrop} pointerEvents="none">
        <Image source={PHOTOS.skyline} style={styles.fill} resizeMode="cover" />
        <LinearGradient colors={["rgba(11,11,13,0.72)", "rgba(11,11,13,0.9)", colors.bg]} locations={[0, 0.55, 1]} style={styles.fillAbs} />
      </View>

      <Animated.View style={[styles.bar, rise]}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <Press style={styles.help}>
          <Headset size={18} color={colors.text} weight="fill" />
          <Text style={styles.helpText}>Help</Text>
        </Press>
      </Animated.View>

      <Animated.View style={[styles.who, rise]}>
        <View style={styles.photoWrap}>
          <Image source={PEOPLE.user} style={styles.photo} />
          <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={styles.ring}>
            <AnimatedCircle cx={SIZE / 2} cy={SIZE / 2} r={R} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray={LENGTH} animatedProps={ringProps} />
          </Svg>
          <Animated.View style={[styles.badge, badge]}>
            <Check size={13} color="#FFFFFF" weight="bold" />
          </Animated.View>
        </View>
        <Text style={styles.hello}>Welcome back, {USER.first}</Text>
        <Text style={styles.sub}>{stage === "checking" ? "Checking it is you…" : stage === "done" ? "All good" : "Enter your PIN to continue"}</Text>
        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <Dot key={i} filled={i < pin.length} ok={stage === "done"} />
          ))}
        </View>
      </Animated.View>

      <Animated.View style={rise}>
        <View style={styles.pad}>
          {KEYS.map((k) => (
            <Pressable key={k} style={({ pressed }) => [styles.key, pressed && styles.keyDown]} onPress={() => press(k)}>
              {k === "face" ? <ScanSmiley size={30} color={colors.accent} weight="bold" /> : k === "back" ? <Backspace size={28} color={colors.text} /> : <Text style={styles.keyText}>{k}</Text>}
            </Pressable>
          ))}
        </View>
        <View style={styles.links}>
          <Text style={styles.link}>Forgot PIN?</Text>
          <View style={styles.sep} />
          <Text style={styles.link}>Not {USER.first}? Switch</Text>
        </View>

        <View style={styles.quick}>
          {QUICK.map(({ label, Icon }) => (
            <Press key={label} fill depth={0.95} style={styles.quickItem}>
              <Icon size={18} color={colors.text} weight="fill" />
              <Text style={styles.quickText}>{label}</Text>
            </Press>
          ))}
        </View>
        <Text style={styles.legal}>Last signed in today at 09:14 · Concept, not affiliated with Access Bank</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheet: { backgroundColor: colors.bg, zIndex: 50, paddingHorizontal: 20, justifyContent: "space-between" },
  backdrop: { position: "absolute", left: 0, right: 0, top: 0, height: 420 },
  fill: { width: "100%", height: "100%" },
  fillAbs: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logo: { width: 112, height: 27 },
  help: { flexDirection: "row", alignItems: "center", gap: 7, height: 36, paddingHorizontal: 14, borderRadius: 18, backgroundColor: colors.glass },
  helpText: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.text },
  who: { alignItems: "center" },
  photoWrap: { width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" },
  photo: { width: 76, height: 76, borderRadius: 38 },
  ring: { position: "absolute", transform: [{ rotate: "-90deg" }] },
  badge: { position: "absolute", right: 4, bottom: 4, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.good, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: colors.bg },
  hello: { fontFamily: fonts.bold, fontSize: 24, letterSpacing: -0.7, color: colors.text, marginTop: 14 },
  sub: { fontFamily: fonts.regular, fontSize: 14.5, color: colors.muted, marginTop: 6 },
  dots: { flexDirection: "row", gap: 18, marginTop: 22 },
  dot: { width: 15, height: 15, borderRadius: 8, backgroundColor: colors.raised },
  pad: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 10 },
  key: { width: "33.333%", height: 76, alignItems: "center", justifyContent: "center", borderRadius: 38 },
  keyDown: { backgroundColor: colors.surface },
  keyText: { fontFamily: fonts.medium, fontSize: 30, color: colors.text },
  links: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 6 },
  link: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  sep: { width: 1, height: 14, backgroundColor: colors.lineStrong },
  quick: { flexDirection: "row", gap: 8, marginTop: 20 },
  quickItem: { height: 48, borderRadius: 14, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  quickText: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.text },
  legal: { fontFamily: fonts.regular, fontSize: 11, color: colors.faint, textAlign: "center", marginTop: 14 },
});
