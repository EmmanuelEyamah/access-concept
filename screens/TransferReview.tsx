import { router } from "expo-router";
import { Lightning, ShieldCheck } from "phosphor-react-native";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Rise } from "@/components/Rise";
import { SlideToSend } from "@/components/Transfer/SlideToSend";
import { Avatar } from "@/components/ui/Avatar";
import { Money } from "@/components/ui/Money";
import { PinSheet } from "@/components/ui/PinSheet";
import { Press } from "@/components/ui/Press";
import { TopBar } from "@/components/ui/TopBar";
import { TRANSFER_FEE } from "@/constants/data";
import { useBankStore } from "@/stores/useBankStore";
import { naira } from "@/utils/format";
import { colors, fonts, radius } from "@/utils/theme";

interface LineProps {
  label: string;
  value: string;
  strong?: boolean;
}
const Line = ({ label, value, strong = false }: LineProps) => (
  <View style={styles.line}>
    <Text style={styles.lineLabel}>{label}</Text>
    <Text style={[styles.lineValue, strong && styles.lineStrong]}>{value}</Text>
  </View>
);

export const TransferReview = () => {
  const insets = useSafeAreaInsets();
  const draft = useBankStore((s) => s.draft);
  const autoSend = useBankStore((s) => s.autoSend);
  const commit = useBankStore((s) => s.commit);

  const [pin, setPin] = useState(false);
  // Backing out of the PIN pad puts the slider back at the start.
  const [attempt, setAttempt] = useState(0);

  const ask = useCallback(() => setPin(true), []);
  const send = () => {
    setPin(false);
    commit();
    router.replace({ pathname: "/transfer/result", params: { state: "success" } });
  };

  if (!draft.recipient) return null;
  const { recipient, amount } = draft;

  return (
    <View style={[styles.screen, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
      <TopBar title="Review" step={3} />
      <View style={styles.content}>
        <Rise show delay={40} style={styles.hero}>
          <Text style={styles.label}>You are sending</Text>
          <Money value={amount} size={46} style={styles.amount} />
        </Rise>

        <Rise show delay={130} style={styles.card}>
          <View style={styles.to}>
            <Avatar person={recipient.person} name={recipient.name} badge={recipient.brand} size={50} />
            <View style={styles.toWords}>
              <Text style={styles.toLabel}>To</Text>
              <Text style={styles.toName}>{recipient.name}</Text>
              <Text style={styles.toBank}>
                {recipient.bank} · {recipient.account}
              </Text>
            </View>
            <View style={styles.verified}>
              <ShieldCheck size={14} color={colors.good} weight="fill" />
              <Text style={styles.verifiedText}>Name matched</Text>
            </View>
          </View>
          <View style={styles.rule} />
          <Line label="Amount" value={`₦${naira(amount)}`} />
          <Line label="Transfer fee" value={`₦${naira(TRANSFER_FEE)}`} />
          <View style={styles.rule} />
          <Line label="Total leaving your account" value={`₦${naira(amount + TRANSFER_FEE)}`} strong />
        </Rise>

        <Rise show delay={220} style={styles.arrives}>
          <Lightning size={17} color={colors.accent} weight="fill" />
          <Text style={styles.arrivesText}>Arrives in seconds. You confirm with your PIN.</Text>
        </Rise>
      </View>

      <Rise show delay={300} style={styles.foot}>
        <SlideToSend key={attempt} label="Slide to send" auto={attempt === 0 ? autoSend : 0} onDone={ask} />
        <Press onPress={() => router.replace({ pathname: "/transfer/result", params: { state: "failed" } })} style={styles.demo}>
          <Text style={styles.demoText}>Demo: show a failed transfer</Text>
        </Press>
      </Rise>
      <PinSheet
        open={pin}
        steps={["Enter your PIN"]}
        note={`₦${naira(amount + TRANSFER_FEE)} to ${recipient.name}`}
        onClose={() => {
          setPin(false);
          setAttempt((a) => a + 1);
        }}
        onDone={send}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, paddingHorizontal: 16 },
  hero: { alignItems: "center", marginTop: 22, marginBottom: 26 },
  label: { fontFamily: fonts.regular, fontSize: 14.5, color: colors.muted },
  amount: { marginTop: 10 },
  card: { borderRadius: radius.lg, backgroundColor: colors.surface, padding: 18 },
  to: { flexDirection: "row", alignItems: "center" },
  toWords: { flex: 1, marginLeft: 13 },
  toLabel: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.muted },
  toName: { fontFamily: fonts.semibold, fontSize: 16.5, letterSpacing: -0.2, color: colors.text, marginTop: 1 },
  toBank: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted, marginTop: 2 },
  verified: { flexDirection: "row", alignItems: "center", gap: 5, height: 26, paddingHorizontal: 9, borderRadius: 13, backgroundColor: colors.goodSoft, alignSelf: "flex-start" },
  verifiedText: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.good },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.lineStrong, marginVertical: 14 },
  line: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 5 },
  lineLabel: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.muted },
  lineValue: { fontFamily: fonts.medium, fontSize: 14.5, color: colors.text, fontVariant: ["tabular-nums"] },
  lineStrong: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  arrives: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 16, marginHorizontal: 6 },
  arrivesText: { fontFamily: fonts.regular, fontSize: 13, color: colors.soft, flex: 1 },
  foot: { paddingHorizontal: 24 },
  demo: { alignSelf: "center", paddingVertical: 14 },
  demoText: { fontFamily: fonts.medium, fontSize: 12, color: colors.faint },
});
