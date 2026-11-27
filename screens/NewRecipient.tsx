import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { CaretDown, CheckCircle, CircleNotch, ClipboardText } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Rise } from "@/components/Rise";
import { BankSheet } from "@/components/Transfer/BankSheet";
import { Avatar } from "@/components/ui/Avatar";
import { Press } from "@/components/ui/Press";
import { Toggle } from "@/components/ui/Toggle";
import { TopBar } from "@/components/ui/TopBar";
import type { BrandKey } from "@/constants/assets";
import { AUTOPILOT } from "@/constants/data";
import { useBankStore } from "@/stores/useBankStore";
import { colors, fonts, radius } from "@/utils/theme";

const FOUND = "Oluwaseun Adeleke";
const DEMO = AUTOPILOT === "shots" || AUTOPILOT === "check";

/** A new recipient: pick the bank, type ten digits, and the name is looked up before any money moves. */
export const NewRecipient = () => {
  const insets = useSafeAreaInsets();
  const setRecipient = useBankStore((s) => s.setRecipient);
  const [bank, setBank] = useState<{ name: string; brand: BrandKey } | null>(DEMO ? { name: "GTBank", brand: "gtbank" } : null);
  const [account, setAccount] = useState(DEMO ? "0234118907" : "");
  const [sheet, setSheet] = useState(false);
  const [state, setState] = useState<"idle" | "checking" | "found">("idle");
  const [save, setSave] = useState(true);

  const spin = useSharedValue(0);
  const card = useSharedValue(0);
  const complete = !!bank && account.length === 10;

  useEffect(() => {
    spin.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1, false);
  }, [spin]);

  // The lookup starts by itself the moment there is a bank and ten digits.
  useEffect(() => {
    if (!complete) {
      setState("idle");
      card.value = withTiming(0, { duration: 150 });
      return;
    }
    setState("checking");
    const timer = setTimeout(() => {
      setState("found");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      card.value = withSpring(1, { damping: 15, stiffness: 160 });
    }, 1100);
    return () => clearTimeout(timer);
  }, [complete, bank, account, card]);

  const spinner = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  const found = useAnimatedStyle(() => ({ opacity: card.value, transform: [{ translateY: (1 - card.value) * 16 }, { scale: 0.96 + card.value * 0.04 }] }));

  const go = () => {
    if (!bank) return;
    setRecipient({ id: `new-${account}`, name: FOUND, bank: bank.name, brand: bank.brand, account: account.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3") });
    router.push("/transfer/amount");
  };

  return (
    <View style={[styles.screen, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
      <TopBar title="New recipient" step={1} />
      <View style={styles.content}>
        <Rise show delay={40}>
          <Text style={styles.heading}>Where is the money going?</Text>
        </Rise>

        <Rise show delay={110}>
          <Text style={styles.label}>Bank</Text>
          <Press onPress={() => setSheet(true)} depth={0.985} style={styles.field}>
            {bank ? <Avatar brand={bank.brand} size={34} /> : <View style={styles.blank} />}
            <Text style={[styles.fieldText, !bank && styles.placeholder]}>{bank ? bank.name : "Choose a bank"}</Text>
            <CaretDown size={18} color={colors.muted} weight="bold" />
          </Press>
        </Rise>

        <Rise show delay={180}>
          <Text style={styles.label}>Account number</Text>
          <View style={styles.field}>
            <TextInput value={account} onChangeText={(t) => setAccount(t.replace(/\D/g, "").slice(0, 10))} placeholder="10 digits" placeholderTextColor={colors.faint} keyboardType="number-pad" style={styles.number} selectionColor={colors.accent} />
            {state === "checking" ? (
              <Animated.View style={spinner}>
                <CircleNotch size={22} color={colors.accent} weight="bold" />
              </Animated.View>
            ) : (
              <Pressable style={styles.paste} onPress={() => setAccount("0234118907")}>
                <ClipboardText size={16} color={colors.text} weight="fill" />
                <Text style={styles.pasteText}>Paste</Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.hint}>{state === "checking" ? "Looking up the name…" : `${account.length} of 10 digits`}</Text>
        </Rise>

        <Animated.View style={[styles.found, found]} pointerEvents={state === "found" ? "auto" : "none"}>
          <Avatar name={FOUND} badge={bank?.brand} size={48} />
          <View style={styles.foundWords}>
            <Text style={styles.foundName}>{FOUND}</Text>
            <Text style={styles.foundNote}>Name confirmed by {bank?.name}</Text>
          </View>
          <CheckCircle size={26} color={colors.good} weight="fill" />
        </Animated.View>

        {state === "found" && (
          <Rise show delay={80} style={styles.save}>
            <Text style={styles.saveText}>Save as a beneficiary</Text>
            <Toggle value={save} onChange={setSave} />
          </Rise>
        )}
      </View>

      <Press onPress={go} disabled={state !== "found"} depth={0.97} style={[styles.cta, state !== "found" && styles.ctaOff]}>
        <Text style={[styles.ctaText, state !== "found" && styles.ctaTextOff]}>Continue</Text>
      </Press>
      <BankSheet open={sheet} value={bank?.name ?? null} onPick={setBank} onClose={() => setSheet(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  heading: { fontFamily: fonts.bold, fontSize: 28, letterSpacing: -0.9, color: colors.text, marginHorizontal: 4 },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted, marginTop: 22, marginBottom: 8, marginLeft: 4 },
  field: { flexDirection: "row", alignItems: "center", gap: 12, height: 60, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: 14 },
  blank: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.raised },
  fieldText: { flex: 1, fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  placeholder: { color: colors.faint, fontFamily: fonts.regular },
  number: { flex: 1, fontFamily: fonts.semibold, fontSize: 20, letterSpacing: 1.5, color: colors.text, fontVariant: ["tabular-nums"] },
  paste: { flexDirection: "row", alignItems: "center", gap: 6, height: 34, paddingHorizontal: 12, borderRadius: 17, backgroundColor: colors.raised },
  pasteText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  hint: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted, marginTop: 8, marginLeft: 4 },
  found: { flexDirection: "row", alignItems: "center", marginTop: 18, borderRadius: radius.lg, backgroundColor: colors.goodSoft, padding: 14 },
  foundWords: { flex: 1, marginLeft: 14 },
  foundName: { fontFamily: fonts.semibold, fontSize: 16.5, color: colors.text },
  foundNote: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.good, marginTop: 2 },
  save: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, height: 58, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: 16 },
  saveText: { fontFamily: fonts.medium, fontSize: 15.5, color: colors.text },
  cta: { marginHorizontal: 20, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  ctaOff: { backgroundColor: colors.surface },
  ctaText: { fontFamily: fonts.semibold, fontSize: 16.5, color: "#FFFFFF" },
  ctaTextOff: { color: colors.faint },
});
