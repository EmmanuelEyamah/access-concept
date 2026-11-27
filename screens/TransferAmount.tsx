import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Backspace } from "phosphor-react-native";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Rise } from "@/components/Rise";
import { Avatar } from "@/components/ui/Avatar";
import { Press } from "@/components/ui/Press";
import { TopBar } from "@/components/ui/TopBar";
import { QUICK_AMOUNTS, TRANSFER_FEE } from "@/constants/data";
import { useBankStore } from "@/stores/useBankStore";
import { naira } from "@/utils/format";
import { colors, fonts } from "@/utils/theme";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "back"] as const;
const MAX = 9999999;

interface KeyProps {
  value: (typeof KEYS)[number];
  onPress: (value: (typeof KEYS)[number]) => void;
}
const Key = ({ value, onPress }: KeyProps) => {
  const t = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(t.value, [0, 1], ["rgba(255,255,255,0)", "rgba(255,255,255,0.09)"]), transform: [{ scale: 1 - t.value * 0.1 }] }));
  return (
    <Pressable
      style={styles.keySlot}
      onPressIn={() => (t.value = withTiming(1, { duration: 60 }))}
      onPressOut={() => (t.value = withSpring(0, { damping: 12, stiffness: 240 }))}
      onPress={() => {
        Haptics.selectionAsync();
        onPress(value);
      }}
    >
      <Animated.View style={[styles.key, style]}>{value === "back" ? <Backspace size={26} color={colors.text} weight="regular" /> : <Text style={styles.keyText}>{value}</Text>}</Animated.View>
    </Pressable>
  );
};

export const TransferAmount = () => {
  const insets = useSafeAreaInsets();
  const recipient = useBankStore((s) => s.draft.recipient);
  const amount = useBankStore((s) => s.draft.amount);
  const balance = useBankStore((s) => s.balance);
  const setAmount = useBankStore((s) => s.setAmount);
  const pop = useSharedValue(1);
  const shake = useSharedValue(0);

  const after = balance - amount - (amount > 0 ? TRANSFER_FEE : 0);
  const over = after < 0;
  const ready = amount > 0 && !over;

  // Every digit lands with a small bounce, so the figure feels typed rather than swapped.
  useEffect(() => {
    pop.value = withSequence(withTiming(1.07, { duration: 70 }), withSpring(1, { damping: 9, stiffness: 260 }));
  }, [amount, pop]);

  useEffect(() => {
    if (over) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      shake.value = withSequence(withTiming(-8, { duration: 50 }), withTiming(8, { duration: 50 }), withTiming(-5, { duration: 50 }), withTiming(0, { duration: 50 }));
    }
  }, [over, shake]);

  const press = (key: (typeof KEYS)[number]) => {
    if (key === "back") return setAmount(Math.floor(amount / 10));
    const next = Number(`${amount}${key}`);
    if (next <= MAX) setAmount(next);
  };

  const figure = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }, { translateX: shake.value }] }));

  return (
    <View style={[styles.screen, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
      <TopBar title="Send money" step={2} />

      {recipient && (
        <Rise show delay={40} style={styles.to}>
          <Avatar person={recipient.person} name={recipient.name} size={34} />
          <View>
            <Text style={styles.toName}>{recipient.name}</Text>
            <Text style={styles.toBank}>
              {recipient.bank} · {recipient.account}
            </Text>
          </View>
        </Rise>
      )}

      <View style={styles.middle}>
        <Animated.View style={[styles.figure, figure]}>
          <Text style={[styles.currency, amount === 0 && styles.dim]}>₦</Text>
          <Text style={[styles.amount, amount === 0 && styles.dim, over && styles.over]} numberOfLines={1} adjustsFontSizeToFit>
            {naira(amount, 0)}
          </Text>
        </Animated.View>
        <Text style={[styles.after, over && styles.over]}>{over ? "That is more than you have" : amount > 0 ? `You will have ₦${naira(after)} left` : `Balance ₦${naira(balance)}`}</Text>
      </View>

      <View style={styles.chips}>
        {QUICK_AMOUNTS.map((q) => (
          <Press key={q} fill onPress={() => setAmount(q)} depth={0.92} style={[styles.chip, amount === q && styles.chipOn]}>
            <Text style={[styles.chipText, amount === q && styles.chipTextOn]}>₦{naira(q, 0)}</Text>
          </Press>
        ))}
      </View>

      <View style={styles.pad}>
        {KEYS.map((k) => (
          <Key key={k} value={k} onPress={press} />
        ))}
      </View>

      <Press onPress={() => router.push("/transfer/review")} disabled={!ready} depth={0.97} style={[styles.cta, !ready && styles.ctaOff]}>
        <Text style={[styles.ctaText, !ready && styles.ctaTextOff]}>Continue</Text>
      </Press>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  to: { flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "center", paddingLeft: 6, paddingRight: 16, height: 48, borderRadius: 24, backgroundColor: colors.surface, marginTop: 14 },
  toName: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  toBank: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 1 },
  middle: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  figure: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  currency: { fontFamily: fonts.semibold, fontSize: 34, color: colors.muted, marginRight: 4 },
  amount: { fontFamily: fonts.bold, fontSize: 68, letterSpacing: -3, color: colors.text, fontVariant: ["tabular-nums"] },
  dim: { color: colors.faint },
  over: { color: colors.bad },
  after: { fontFamily: fonts.regular, fontSize: 14.5, color: colors.muted, marginTop: 2, textAlign: "center" },
  chips: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 14 },
  chip: { height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  chipOn: { backgroundColor: colors.text },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text, fontVariant: ["tabular-nums"] },
  chipTextOn: { color: "#0B0B0D" },
  pad: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 22 },
  keySlot: { width: "33.333%", height: 62, alignItems: "center", justifyContent: "center" },
  key: { width: 88, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  keyText: { fontFamily: fonts.medium, fontSize: 27, color: colors.text },
  cta: { marginHorizontal: 20, marginTop: 8, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  ctaOff: { backgroundColor: colors.surface },
  ctaText: { fontFamily: fonts.semibold, fontSize: 16.5, color: "#FFFFFF" },
  ctaTextOff: { color: colors.faint },
});
