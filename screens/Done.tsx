import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { Check, ShareNetwork } from "phosphor-react-native";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { PromoBanner } from "@/components/PromoBanner";
import { Rise } from "@/components/Rise";
import { Avatar } from "@/components/ui/Avatar";
import { Money } from "@/components/ui/Money";
import { Press } from "@/components/ui/Press";
import { USER } from "@/constants/data";
import { useBankStore } from "@/stores/useBankStore";
import { naira } from "@/utils/format";
import { colors, fonts, radius } from "@/utils/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const R = 50;
const LENGTH = 2 * Math.PI * R;

interface RowProps {
  label: string;
  value: string;
}
const Row = ({ label, value }: RowProps) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

/** The page any bill or airtime payment ends on: what it was, a receipt you can share, and where it went. */
export const Done = () => {
  const insets = useSafeAreaInsets();
  const { title, amount, line, id } = useLocalSearchParams<{ title?: string; amount?: string; line?: string; id?: string }>();
  const tx = useBankStore((s) => s.transactions.find((t) => t.id === id));
  const ring = useSharedValue(0);
  const disc = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    ring.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    disc.value = withDelay(360, withSpring(1, { damping: 9, stiffness: 170 }));
  }, [disc, ring]);

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: LENGTH * (1 - ring.value) }));
  const discStyle = useAnimatedStyle(() => ({ transform: [{ scale: disc.value }] }));
  const reference = `ACC-${(id ?? "0000000").replace(/\D/g, "").slice(-6).padStart(6, "4")}-NG`;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 26, paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
      <View style={styles.body}>
        <View style={styles.top}>
          <View style={styles.badge}>
            <Svg width={96} height={96} viewBox="0 0 112 112" style={styles.ring}>
              <AnimatedCircle cx={56} cy={56} r={R} stroke={colors.good} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray={LENGTH} animatedProps={ringProps} />
            </Svg>
            <Animated.View style={[styles.disc, discStyle]}>
              <Check size={38} color={colors.good} weight="bold" />
            </Animated.View>
          </View>
          <Rise show delay={400} style={styles.words}>
            <Text style={styles.title}>{title ?? "Done"}</Text>
            {amount && <Money value={Number(amount)} size={42} style={styles.amount} />}
            {line && (
              <View style={styles.chip}>
                {tx?.brand && <Avatar brand={tx.brand} size={30} />}
                <Text style={styles.line}>{line}</Text>
              </View>
            )}
          </Rise>
        </View>

        <Rise show delay={540} style={styles.card}>
          <Text style={styles.cardLabel}>Receipt</Text>
          <Row label="Reference" value={reference} />
          <Row label="Amount" value={`₦${naira(Number(amount ?? 0))}`} />
          <Row label="Fee" value="No fee" />
          <Row label="Paid from" value={`${USER.product} ··${USER.account.replace(/\s/g, "").slice(-4)}`} />
          <Row label="Status" value="Successful" />
        </Rise>

        <Rise show delay={660} style={styles.promo}>
          <PromoBanner />
        </Rise>
      </View>

      <Rise show delay={760} style={styles.pair}>
        <Press fill depth={0.96} style={styles.ghost}>
          <ShareNetwork size={18} color={colors.text} weight="fill" />
          <Text style={styles.ghostText}>Share receipt</Text>
        </Press>
        <Press fill onPress={() => router.dismissAll()} depth={0.96} style={[styles.ghost, styles.done]}>
          <Text style={[styles.ghostText, styles.doneText]}>Done</Text>
        </Press>
      </Rise>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 18 },
  body: { flex: 1 },
  top: { alignItems: "center" },
  badge: { width: 96, height: 96, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", transform: [{ rotate: "-90deg" }] },
  disc: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.goodSoft, alignItems: "center", justifyContent: "center" },
  words: { alignItems: "center", marginTop: 16 },
  title: { fontFamily: fonts.bold, fontSize: 21, letterSpacing: -0.5, color: colors.text },
  amount: { marginTop: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 12, height: 42, paddingLeft: 6, paddingRight: 16, borderRadius: 21, backgroundColor: colors.surface },
  line: { fontFamily: fonts.medium, fontSize: 14, color: colors.soft, marginLeft: 4 },
  card: { borderRadius: radius.lg, backgroundColor: colors.surface, padding: 18, marginTop: 24 },
  cardLabel: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text, marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9 },
  rowLabel: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.muted },
  rowValue: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, fontVariant: ["tabular-nums"] },
  promo: { marginTop: 12 },
  pair: { flexDirection: "row", gap: 10 },
  ghost: { height: 56, borderRadius: 28, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  ghostText: { fontFamily: fonts.medium, fontSize: 15.5, color: colors.text },
  done: { backgroundColor: colors.accent },
  doneText: { color: "#FFFFFF", fontFamily: fonts.semibold },
});
