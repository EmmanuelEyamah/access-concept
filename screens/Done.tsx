import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { Check } from "phosphor-react-native";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { Rise } from "@/components/Rise";
import { Money } from "@/components/ui/Money";
import { Press } from "@/components/ui/Press";
import { colors, fonts } from "@/utils/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const R = 50;
const LENGTH = 2 * Math.PI * R;

/** A plain success page any payment can end on: what it was, how much, and where it went. */
export const Done = () => {
  const insets = useSafeAreaInsets();
  const { title, amount, line } = useLocalSearchParams<{ title?: string; amount?: string; line?: string }>();
  const ring = useSharedValue(0);
  const disc = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    ring.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    disc.value = withDelay(360, withSpring(1, { damping: 9, stiffness: 170 }));
  }, [disc, ring]);

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: LENGTH * (1 - ring.value) }));
  const discStyle = useAnimatedStyle(() => ({ transform: [{ scale: disc.value }] }));

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 80, paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
      <View style={styles.top}>
        <View style={styles.badge}>
          <Svg width={112} height={112} viewBox="0 0 112 112" style={styles.ring}>
            <AnimatedCircle cx={56} cy={56} r={R} stroke={colors.good} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray={LENGTH} animatedProps={ringProps} />
          </Svg>
          <Animated.View style={[styles.disc, discStyle]}>
            <Check size={42} color={colors.good} weight="bold" />
          </Animated.View>
        </View>
        <Rise show delay={400} style={styles.words}>
          <Text style={styles.title}>{title ?? "Done"}</Text>
          {amount && <Money value={Number(amount)} size={42} style={styles.amount} />}
          {line && <Text style={styles.line}>{line}</Text>}
        </Rise>
      </View>
      <Rise show delay={600}>
        <Press onPress={() => router.dismissAll()} depth={0.97} style={styles.cta}>
          <Text style={styles.ctaText}>Done</Text>
        </Press>
      </Rise>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, justifyContent: "space-between" },
  top: { alignItems: "center" },
  badge: { width: 112, height: 112, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", transform: [{ rotate: "-90deg" }] },
  disc: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.goodSoft, alignItems: "center", justifyContent: "center" },
  words: { alignItems: "center", marginTop: 22 },
  title: { fontFamily: fonts.semibold, fontSize: 20, color: colors.text },
  amount: { marginTop: 8 },
  line: { fontFamily: fonts.regular, fontSize: 14.5, color: colors.muted, marginTop: 8 },
  cta: { height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  ctaText: { fontFamily: fonts.semibold, fontSize: 16.5, color: "#FFFFFF" },
});
