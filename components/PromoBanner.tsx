import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Press } from "@/components/ui/Press";
import { LOGO, PHOTOS } from "@/constants/assets";
import { colors, fonts, radius } from "@/utils/theme";

const ADS = [
  // `lift` slides each tall photograph up so the face, not the waist, lands inside the banner.
  { photo: "woman", lift: 62, eyebrow: "Virtual dollar card", title: "Pay for anything online,\nin dollars.", cta: "Get your card" },
  { photo: "shop", lift: 40, eyebrow: "For business", title: "Take payments with\na free QR code.", cta: "Set it up" },
  { photo: "friends", lift: 138, eyebrow: "Split a bill", title: "One pays. Everyone\nsettles in a tap.", cta: "Try it" },
] as const;

const HOLD = 4200;

interface SlideProps {
  index: number;
  active: boolean;
}
const Slide = ({ index, active }: SlideProps) => {
  const ad = ADS[index];
  const t = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    t.value = withTiming(active ? 1 : 0, { duration: 600, easing: Easing.inOut(Easing.cubic) });
  }, [active, t]);
  const layer = useAnimatedStyle(() => ({ opacity: t.value }));
  const photo = useAnimatedStyle(() => ({ transform: [{ scale: 1.14 - t.value * 0.08 }] }));
  const words = useAnimatedStyle(() => ({ transform: [{ translateX: (1 - t.value) * -14 }] }));
  return (
    <Animated.View style={[styles.layer, layer]} pointerEvents={active ? "auto" : "none"}>
      <Animated.View style={[styles.photo, { top: -ad.lift }, photo]}>
        <Image source={PHOTOS[ad.photo]} style={styles.fill} resizeMode="cover" />
      </Animated.View>
      <LinearGradient colors={["#101012", "rgba(16,16,18,0.94)", "rgba(16,16,18,0.2)"]} locations={[0, 0.46, 1]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.layer} />
      <Animated.View style={[styles.words, words]}>
        <Text style={styles.eyebrow}>{ad.eyebrow}</Text>
        <Text style={styles.title}>{ad.title}</Text>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>{ad.cta}</Text>
          <ArrowRight size={14} color="#0B0B0D" weight="bold" />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

/** A rotating in-app advert: real photography on the right, one promise and one button on the left. */
export const PromoBanner = () => {
  const [index, setIndex] = useState(0);
  const run = useSharedValue(0);

  useEffect(() => {
    run.value = 0;
    run.value = withTiming(1, { duration: HOLD, easing: Easing.linear });
    const timer = setTimeout(() => setIndex((i) => (i + 1) % ADS.length), HOLD);
    return () => clearTimeout(timer);
  }, [index, run]);

  const fill = useAnimatedStyle(() => ({ width: `${run.value * 100}%` }));

  return (
    <Press depth={0.985} style={styles.banner}>
      {ADS.map((ad, i) => (
        <Slide key={ad.photo} index={i} active={i === index} />
      ))}
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      <View style={styles.bars}>
        {ADS.map((ad, i) => (
          <View key={ad.photo} style={styles.bar}>
            {i < index && <View style={[styles.barFill, styles.full]} />}
            {i === index && <Animated.View style={[styles.barFill, fill]} />}
          </View>
        ))}
      </View>
    </Press>
  );
};

const styles = StyleSheet.create({
  banner: { height: 148, borderRadius: radius.lg, overflow: "hidden", backgroundColor: "#101012" },
  layer: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  photo: { position: "absolute", right: 0, width: 240, height: 430 },
  fill: { width: "100%", height: "100%" },
  words: { position: "absolute", left: 18, top: 16, bottom: 16, justifyContent: "center", width: "64%" },
  eyebrow: { fontFamily: fonts.medium, fontSize: 12, color: colors.accent },
  title: { fontFamily: fonts.bold, fontSize: 18.5, lineHeight: 23, letterSpacing: -0.5, color: colors.text, marginTop: 5 },
  cta: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", height: 32, paddingHorizontal: 13, borderRadius: 16, backgroundColor: colors.text, marginTop: 12 },
  ctaText: { fontFamily: fonts.semibold, fontSize: 12.5, color: "#0B0B0D" },
  logo: { position: "absolute", right: 12, top: 12, width: 58, height: 14, opacity: 0.95 },
  bars: { position: "absolute", right: 12, bottom: 12, flexDirection: "row", gap: 4 },
  bar: { width: 18, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)", overflow: "hidden" },
  barFill: { height: 3, borderRadius: 2, backgroundColor: colors.text },
  full: { width: "100%" },
});
