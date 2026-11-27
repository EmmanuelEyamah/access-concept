import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { ChatCircle, Check, ShareNetwork, X } from "phosphor-react-native";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { Rise } from "@/components/Rise";
import { Money } from "@/components/ui/Money";
import { Press } from "@/components/ui/Press";
import { TRANSFER_FEE } from "@/constants/data";
import { useBankStore } from "@/stores/useBankStore";
import { naira } from "@/utils/format";
import { colors, fonts, radius } from "@/utils/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const R = 50;
const LENGTH = 2 * Math.PI * R;

interface BadgeProps {
  tone: string;
  soft: string;
  failed: boolean;
}

// The ring draws, the disc lands on a spring, and two ripples leave it.
const Badge = ({ tone, soft, failed }: BadgeProps) => {
  const ring = useSharedValue(0);
  const disc = useSharedValue(0);
  const ripple = useSharedValue(0);

  useEffect(() => {
    ring.value = withTiming(1, { duration: 620, easing: Easing.out(Easing.cubic) });
    disc.value = withDelay(380, withSpring(1, { damping: 9, stiffness: 170 }));
    ripple.value = withDelay(520, withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) }));
  }, [disc, ring, ripple]);

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: LENGTH * (1 - ring.value) }));
  const discStyle = useAnimatedStyle(() => ({ transform: [{ scale: disc.value }] }));
  const one = useAnimatedStyle(() => ({ opacity: 0.5 * (1 - ripple.value), transform: [{ scale: 1 + ripple.value * 0.9 }] }));
  const two = useAnimatedStyle(() => ({ opacity: 0.3 * (1 - ripple.value), transform: [{ scale: 1 + ripple.value * 1.5 }] }));

  return (
    <View style={styles.badge}>
      <Animated.View style={[styles.ripple, { borderColor: tone }, two]} />
      <Animated.View style={[styles.ripple, { borderColor: tone }, one]} />
      <Svg width={112} height={112} viewBox="0 0 112 112" style={styles.ring}>
        <AnimatedCircle cx={56} cy={56} r={R} stroke={tone} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray={LENGTH} animatedProps={ringProps} />
      </Svg>
      <Animated.View style={[styles.disc, { backgroundColor: soft }, discStyle]}>{failed ? <X size={40} color={tone} weight="bold" /> : <Check size={42} color={tone} weight="bold" />}</Animated.View>
    </View>
  );
};

interface StepProps {
  ok: boolean;
  title: string;
  note: string;
  last?: boolean;
}
const Step = ({ ok, title, note, last = false }: StepProps) => (
  <View style={styles.step}>
    <View style={styles.rail}>
      <View style={[styles.node, { backgroundColor: ok ? colors.goodSoft : colors.badSoft }]}>{ok ? <Check size={13} color={colors.good} weight="bold" /> : <X size={13} color={colors.bad} weight="bold" />}</View>
      {!last && <View style={styles.wire} />}
    </View>
    <View style={styles.stepWords}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepNote}>{note}</Text>
    </View>
  </View>
);

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

export const TransferResult = () => {
  const insets = useSafeAreaInsets();
  const { state } = useLocalSearchParams<{ state?: string }>();
  const failed = state === "failed";
  const draft = useBankStore((s) => s.draft);
  const resetDraft = useBankStore((s) => s.resetDraft);

  useEffect(() => {
    Haptics.notificationAsync(failed ? Haptics.NotificationFeedbackType.Error : Haptics.NotificationFeedbackType.Success);
  }, [failed]);

  const finish = () => {
    resetDraft();
    router.dismissAll();
  };

  const name = draft.recipient?.name ?? "";
  const bank = draft.recipient?.bank ?? "";

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 30, paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
      <View style={styles.top}>
        <Badge tone={failed ? colors.bad : colors.good} soft={failed ? colors.badSoft : colors.goodSoft} failed={failed} />
        <Rise show delay={420} style={styles.center}>
          <Text style={styles.title}>{failed ? "This transfer did not go through" : "Sent"}</Text>
          {failed ? <Text style={styles.safe}>Your money is safe. Nothing left your account.</Text> : <Money value={draft.amount} size={42} style={styles.amount} />}
          {!failed && (
            <Text style={styles.to}>
              to {name} · {bank}
            </Text>
          )}
        </Rise>
      </View>

      {failed ? (
        <Rise show delay={560} style={styles.card}>
          <Text style={styles.cardLabel}>What happened</Text>
          <Step ok title="We sent the request" note={`₦${naira(draft.amount)} to ${name}`} />
          <Step ok={false} title={`${bank} did not answer in time`} note="Their system is slow right now. This is on their side." />
          <Step ok title="No money was taken" note="Your balance is exactly what it was." last />
        </Rise>
      ) : (
        <Rise show delay={560} style={styles.card}>
          <Text style={styles.cardLabel}>Receipt</Text>
          <Row label="Reference" value="ACC-7Q4M-2291" />
          <Row label="Amount" value={`₦${naira(draft.amount)}`} />
          <Row label="Fee" value={`₦${naira(TRANSFER_FEE)}`} />
          <Row label="Status" value="Delivered" />
          <Row label="Time" value="Just now" />
        </Rise>
      )}

      <Rise show delay={700} style={styles.foot}>
        {failed ? (
          <>
            <Press onPress={() => router.replace("/transfer/review")} depth={0.97} style={styles.primary}>
              <Text style={styles.primaryText}>Try again</Text>
            </Press>
            <View style={styles.pair}>
              <Press fill onPress={finish} depth={0.96} style={styles.ghost}>
                <Text style={styles.ghostText}>Back home</Text>
              </Press>
              <Press fill onPress={() => router.push("/support")} depth={0.96} style={styles.ghost}>
                <ChatCircle size={18} color={colors.text} weight="fill" />
                <Text style={styles.ghostText}>Talk to us</Text>
              </Press>
            </View>
          </>
        ) : (
          <View style={styles.pair}>
            <Press fill depth={0.96} style={styles.ghost}>
              <ShareNetwork size={18} color={colors.text} weight="fill" />
              <Text style={styles.ghostText}>Share receipt</Text>
            </Press>
            <Press fill onPress={finish} depth={0.96} style={[styles.ghost, styles.done]}>
              <Text style={[styles.ghostText, styles.doneText]}>Done</Text>
            </Press>
          </View>
        )}
      </Rise>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 18, justifyContent: "space-between" },
  top: { alignItems: "center" },
  badge: { width: 112, height: 112, alignItems: "center", justifyContent: "center" },
  ripple: { position: "absolute", width: 112, height: 112, borderRadius: 56, borderWidth: 1.5 },
  ring: { position: "absolute", transform: [{ rotate: "-90deg" }] },
  disc: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center", marginTop: 22 },
  title: { fontFamily: fonts.bold, fontSize: 21, letterSpacing: -0.5, color: colors.text, textAlign: "center" },
  amount: { marginTop: 8 },
  to: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 8 },
  safe: { fontFamily: fonts.medium, fontSize: 14.5, color: colors.good, marginTop: 10, textAlign: "center" },
  card: { borderRadius: radius.lg, backgroundColor: colors.surface, padding: 18 },
  cardLabel: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text, marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9 },
  rowLabel: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.muted },
  rowValue: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, fontVariant: ["tabular-nums"] },
  step: { flexDirection: "row" },
  rail: { alignItems: "center", width: 26 },
  node: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  wire: { width: 2, flex: 1, minHeight: 20, backgroundColor: colors.line, marginVertical: 3 },
  stepWords: { flex: 1, marginLeft: 12, paddingBottom: 16 },
  stepTitle: { fontFamily: fonts.semibold, fontSize: 14.5, color: colors.text, marginTop: 2 },
  stepNote: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted, marginTop: 3, lineHeight: 18 },
  foot: { gap: 10 },
  primary: { height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  primaryText: { fontFamily: fonts.semibold, fontSize: 16.5, color: "#FFFFFF" },
  pair: { flexDirection: "row", gap: 10 },
  ghost: { height: 56, borderRadius: 28, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  ghostText: { fontFamily: fonts.medium, fontSize: 15.5, color: colors.text },
  done: { backgroundColor: colors.accent },
  doneText: { color: "#FFFFFF", fontFamily: fonts.semibold },
});
