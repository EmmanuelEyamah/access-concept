import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowsClockwise, CheckCircle, Copy, NotePencil, ShareNetwork, Warning, type IconProps } from "phosphor-react-native";
import type { ComponentType } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { Rise } from "@/components/Rise";
import { Avatar } from "@/components/ui/Avatar";
import { Money } from "@/components/ui/Money";
import { Press } from "@/components/ui/Press";
import { TopBar } from "@/components/ui/TopBar";
import { RECIPIENTS, USER } from "@/constants/data";
import { useBankStore } from "@/stores/useBankStore";
import { dayLabel } from "@/utils/format";
import { colors, fonts, radius } from "@/utils/theme";

interface ActionProps {
  Icon: ComponentType<IconProps>;
  label: string;
  onPress?: () => void;
}
const Action = ({ Icon, label, onPress }: ActionProps) => (
  <Press fill onPress={onPress} depth={0.93} style={styles.action}>
    <View style={styles.actionIcon}>
      <Icon size={21} color={colors.text} weight="fill" />
    </View>
    <Text style={styles.actionText}>{label}</Text>
  </Press>
);

interface LineProps {
  label: string;
  value: string;
  last?: boolean;
}
const Line = ({ label, value, last = false }: LineProps) => (
  <View style={[styles.line, !last && styles.rule]}>
    <Text style={styles.lineLabel}>{label}</Text>
    <Text style={styles.lineValue}>{value}</Text>
  </View>
);

/** One transaction, in full: who, how much, when, and what you can do about it. */
export const TransactionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tx = useBankStore((s) => s.transactions.find((t) => t.id === id));
  const setRecipient = useBankStore((s) => s.setRecipient);
  const setAmount = useBankStore((s) => s.setAmount);
  const copied = useSharedValue(0);
  const toast = useAnimatedStyle(() => ({ opacity: copied.value }));
  const number = useAnimatedStyle(() => ({ opacity: 1 - copied.value }));

  if (!tx) return null;
  const incoming = tx.kind === "in";
  const person = RECIPIENTS.find((r) => r.person && r.person === tx.person);
  const reference = `ACC-${tx.id.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-6).padStart(6, "7")}-NG`;

  const again = () => {
    if (!person) return;
    setRecipient(person);
    setAmount(tx.amount);
    router.push("/transfer/review");
  };

  return (
    <View style={styles.screen}>
      <TopBar title="Transaction" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Rise show delay={40} style={styles.hero}>
          <Avatar person={tx.person} brand={tx.brand} name={tx.title} badge={person?.brand} size={76} />
          <Text style={styles.title}>{tx.title}</Text>
          <Money value={tx.amount} size={44} sign={incoming ? "+" : "-"} color={incoming ? colors.good : colors.text} style={styles.amount} />
          <View style={styles.status}>
            <CheckCircle size={15} color={colors.good} weight="fill" />
            <Text style={styles.statusText}>Completed</Text>
          </View>
        </Rise>

        <Rise show delay={130} style={styles.actions}>
          <Action Icon={ShareNetwork} label="Share receipt" />
          {person && !incoming ? <Action Icon={ArrowsClockwise} label="Send again" onPress={again} /> : <Action Icon={NotePencil} label="Add a note" />}
          <Action Icon={Warning} label="Report" onPress={() => router.push("/support")} />
        </Rise>

        <Rise show delay={210} style={styles.card}>
          <Line label="When" value={`${dayLabel(tx.daysAgo)}, ${tx.time}`} />
          <Line label="What" value={tx.note} />
          <Line label={incoming ? "Paid into" : "Paid from"} value={`${USER.product} ··${USER.account.replace(/\s/g, "").slice(-4)}`} />
          {person && <Line label="Their bank" value={`${person.bank} · ${person.account}`} />}
          <Line label="Fee" value={!incoming && person ? "₦10.75" : "No fee"} last />
        </Rise>

        <Rise show delay={280} style={styles.card}>
          <Pressable
            style={styles.ref}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              copied.value = withSequence(withTiming(1, { duration: 150 }), withTiming(1, { duration: 1100 }), withTiming(0, { duration: 220 }));
            }}
          >
            <View>
              <Text style={styles.lineLabel}>Reference</Text>
              <Animated.Text style={[styles.refValue, number]}>{reference}</Animated.Text>
              <Animated.Text style={[styles.refValue, styles.refToast, toast]}>Copied</Animated.Text>
            </View>
            <Copy size={19} color={colors.text} weight="bold" />
          </Pressable>
        </Rise>
        <Text style={styles.help}>Something wrong with this transaction? Report it and we will look within the hour.</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 50 },
  hero: { alignItems: "center" },
  title: { fontFamily: fonts.medium, fontSize: 17, color: colors.soft, marginTop: 14 },
  amount: { marginTop: 6 },
  status: { flexDirection: "row", alignItems: "center", gap: 6, height: 30, paddingHorizontal: 12, borderRadius: 15, backgroundColor: colors.goodSoft, marginTop: 14 },
  statusText: { fontFamily: fonts.medium, fontSize: 13, color: colors.good },
  actions: { flexDirection: "row", gap: 10, marginTop: 26 },
  action: { alignItems: "center", borderRadius: radius.lg, backgroundColor: colors.surface, paddingVertical: 14 },
  actionIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.raised, alignItems: "center", justifyContent: "center" },
  actionText: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.text, marginTop: 8 },
  card: { borderRadius: radius.lg, backgroundColor: colors.surface, marginTop: 12, paddingHorizontal: 16 },
  line: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15 },
  rule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineStrong },
  lineLabel: { fontFamily: fonts.regular, fontSize: 14.5, color: colors.muted },
  lineValue: { fontFamily: fonts.medium, fontSize: 14.5, color: colors.text, fontVariant: ["tabular-nums"] },
  ref: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  refValue: { fontFamily: fonts.medium, fontSize: 15.5, color: colors.text, marginTop: 3, fontVariant: ["tabular-nums"] },
  refToast: { position: "absolute", bottom: 0, color: colors.good },
  help: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.faint, textAlign: "center", marginTop: 20, paddingHorizontal: 30, lineHeight: 18 },
});
