import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight } from "phosphor-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, { Easing, Extrapolation, interpolate, runOnUI, scrollTo, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSpring, withTiming, type SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LOGO, PHOTOS } from "@/constants/assets";
import { AUTOPILOT, ONBOARDING } from "@/constants/data";
import { colors, fonts } from "@/utils/theme";

const LAST = ONBOARDING.length - 1;

interface LayerProps {
  index: number;
  scrollX: SharedValue<number>;
  drift: SharedValue<number>;
  width: number;
}

// One photograph per page. They cross-fade and move a little slower than the words, which gives the depth.
const Backdrop = ({ index, scrollX, drift, width }: LayerProps) => {
  const style = useAnimatedStyle(() => {
    const offset = scrollX.value - index * width;
    return { opacity: interpolate(offset, [-width, 0, width], [0, 1, 0], Extrapolation.CLAMP), transform: [{ translateX: -offset * 0.16 }, { scale: 1.1 + drift.value * 0.05 }] };
  });
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <Image source={PHOTOS[ONBOARDING[index].key]} style={styles.fill} resizeMode="cover" />
    </Animated.View>
  );
};

interface PageProps {
  index: number;
  scrollX: SharedValue<number>;
  width: number;
  bottom: number;
}
const Page = ({ index, scrollX, width, bottom }: PageProps) => {
  const page = ONBOARDING[index];
  const title = useAnimatedStyle(() => {
    const offset = scrollX.value - index * width;
    return { opacity: interpolate(Math.abs(offset), [0, width * 0.6], [1, 0], Extrapolation.CLAMP), transform: [{ translateX: offset * 0.25 }] };
  });
  const body = useAnimatedStyle(() => {
    const offset = scrollX.value - index * width;
    return { opacity: interpolate(Math.abs(offset), [0, width * 0.5], [1, 0], Extrapolation.CLAMP), transform: [{ translateX: offset * 0.45 }] };
  });
  return (
    <View style={[styles.page, { width, paddingBottom: bottom }]}>
      <Animated.Text style={[styles.title, title]}>{page.title}</Animated.Text>
      <Animated.Text style={[styles.body, body]}>{page.body}</Animated.Text>
    </View>
  );
};

interface BarProps {
  index: number;
  scrollX: SharedValue<number>;
  width: number;
}
const Bar = ({ index, scrollX, width }: BarProps) => {
  const fill = useAnimatedStyle(() => ({ width: `${interpolate(scrollX.value / width, [index - 1, index], [0, 100], Extrapolation.CLAMP)}%` }));
  return (
    <View style={styles.bar}>
      <Animated.View style={[styles.barFill, fill]} />
    </View>
  );
};

interface OnboardingProps {
  active: boolean;
  onDone: () => void;
}

/** Three pages over real photographs, then the sheet lifts away to the sign-in. */
export const Onboarding = ({ active, onDone }: OnboardingProps) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const ref = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const drift = useSharedValue(0);
  const intro = useSharedValue(0);
  const exit = useSharedValue(0);
  const press = useSharedValue(1);
  const page = useRef(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!active) return;
    drift.value = withRepeat(withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.sin) }), -1, true);
    intro.value = withDelay(150, withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) }));
  }, [active, drift, intro]);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const finish = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    exit.value = withTiming(1, { duration: 520, easing: Easing.inOut(Easing.cubic) });
    setTimeout(onDone, 200);
    setTimeout(() => setGone(true), 560);
  }, [exit, onDone]);

  const next = useCallback(() => {
    if (page.current >= LAST) return finish();
    page.current += 1;
    Haptics.selectionAsync();
    const x = page.current * width;
    runOnUI(() => {
      "worklet";
      scrollTo(ref, x, 0, true);
    })();
  }, [finish, ref, width]);

  useEffect(() => {
    if (!AUTOPILOT || !active) return;
    const hold = AUTOPILOT === "shots" ? 2600 : 0;
    const mark = setTimeout(() => AUTOPILOT === "shots" && console.log("SHOT:onboarding"), 1800);
    const timers = [mark, setTimeout(next, 1700 + hold), setTimeout(next, 3200 + hold), setTimeout(next, 4800 + hold)];
    return () => timers.forEach(clearTimeout);
  }, [active, next]);

  const sheet = useAnimatedStyle(() => ({ opacity: 1 - exit.value, transform: [{ scale: 1 + exit.value * 0.08 }] }));
  const chrome = useAnimatedStyle(() => ({ opacity: intro.value, transform: [{ translateY: (1 - intro.value) * 20 }] }));
  const head = useAnimatedStyle(() => ({ opacity: intro.value }));
  const button = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const labelNext = useAnimatedStyle(() => ({ opacity: interpolate(scrollX.value, [(LAST - 0.6) * width, (LAST - 0.2) * width], [1, 0], Extrapolation.CLAMP) }));
  const labelStart = useAnimatedStyle(() => ({ opacity: interpolate(scrollX.value, [(LAST - 0.6) * width, (LAST - 0.2) * width], [0, 1], Extrapolation.CLAMP) }));

  if (gone) return null;
  const foot = Math.max(insets.bottom, 16);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.sheet, sheet]}>
      {ONBOARDING.map((p, i) => (
        <Backdrop key={p.key} index={i} scrollX={scrollX} drift={drift} width={width} />
      ))}
      <LinearGradient colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0)"]} style={[styles.shade, { top: 0, height: 200 }]} pointerEvents="none" />
      <LinearGradient colors={["rgba(11,11,13,0)", "rgba(11,11,13,0.88)", colors.bg]} locations={[0, 0.5, 0.92]} style={[styles.shade, { bottom: 0, height: 620 }]} pointerEvents="none" />

      <Animated.ScrollView ref={ref} horizontal pagingEnabled bounces={false} showsHorizontalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16} onMomentumScrollEnd={(e) => (page.current = Math.round(e.nativeEvent.contentOffset.x / width))} style={StyleSheet.absoluteFill}>
        {ONBOARDING.map((p, i) => (
          <Page key={p.key} index={i} scrollX={scrollX} width={width} bottom={foot + 176} />
        ))}
      </Animated.ScrollView>

      <Animated.View style={[styles.head, { top: insets.top + 20 }, head]} pointerEvents="box-none">
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <Pressable onPress={finish} hitSlop={14}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.foot, { bottom: foot }, chrome]} pointerEvents="box-none">
        <View style={styles.bars}>
          {ONBOARDING.map((p, i) => (
            <Bar key={p.key} index={i} scrollX={scrollX} width={width} />
          ))}
        </View>
        <Pressable onPress={next} onPressIn={() => (press.value = withSpring(0.97, { damping: 16, stiffness: 320 }))} onPressOut={() => (press.value = withSpring(1, { damping: 10, stiffness: 240 }))}>
          <Animated.View style={[styles.cta, button]}>
            <View style={styles.ctaLabel}>
              <Animated.Text style={[styles.ctaText, labelNext]}>Continue</Animated.Text>
              <Animated.Text style={[styles.ctaText, styles.ctaStack, labelStart]}>Get started</Animated.Text>
            </View>
            <ArrowRight size={20} color="#0B0B0D" weight="bold" />
          </Animated.View>
        </Pressable>
        <Pressable onPress={finish} hitSlop={8}>
          <Text style={styles.have}>
            Already banking with us? <Text style={styles.signin}>Sign in</Text>
          </Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheet: { backgroundColor: colors.bg, zIndex: 60, overflow: "hidden" },
  fill: { width: "100%", height: "100%" },
  shade: { position: "absolute", left: 0, right: 0 },
  page: { flex: 1, justifyContent: "flex-end", paddingHorizontal: 24 },
  title: { fontFamily: fonts.bold, fontSize: 40, lineHeight: 44, letterSpacing: -1.6, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.soft, marginTop: 14, maxWidth: 330 },
  head: { position: "absolute", left: 22, right: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logo: { width: 118, height: 29 },
  skip: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  foot: { position: "absolute", left: 20, right: 20 },
  bars: { flexDirection: "row", gap: 6, marginBottom: 22, paddingHorizontal: 4 },
  bar: { flex: 1, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.22)", overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: colors.text, borderRadius: 2 },
  cta: { height: 58, borderRadius: 29, backgroundColor: colors.text, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  ctaLabel: { justifyContent: "center", alignItems: "center", width: 104 },
  ctaText: { fontFamily: fonts.semibold, fontSize: 16.5, color: "#0B0B0D" },
  ctaStack: { position: "absolute" },
  have: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textAlign: "center", marginTop: 18, marginBottom: 6 },
  signin: { fontFamily: fonts.semibold, color: colors.text },
});
