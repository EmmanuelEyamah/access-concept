import * as Haptics from "expo-haptics";
import { X } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui/Avatar";
import { Press } from "@/components/ui/Press";
import { PERIODS, TX_CATEGORIES } from "@/constants/data";
import type { Transaction, TxCategory } from "@/types/bank";
import { colors, fonts, radius } from "@/utils/theme";

export interface Filters {
  period: number;
  kind: "all" | "in" | "out";
  categories: TxCategory[];
  /** Titles of the people or billers to keep. Empty means everyone. */
  parties: string[];
}

export const NO_FILTERS: Filters = { period: 0, kind: "all", categories: [], parties: [] };

export const countFilters = (f: Filters) => (f.period ? 1 : 0) + (f.kind !== "all" ? 1 : 0) + f.categories.length + f.parties.length;

export const applyFilters = (list: Transaction[], f: Filters) => {
  const period = PERIODS[f.period];
  return list.filter((t) => t.daysAgo >= period.from && t.daysAgo <= period.to && (f.kind === "all" || t.kind === f.kind) && (f.categories.length === 0 || f.categories.includes(t.category)) && (f.parties.length === 0 || f.parties.includes(t.title)));
};

interface PillProps {
  label: string;
  active: boolean;
  onPress: () => void;
}
const Pill = ({ label, active, onPress }: PillProps) => {
  const on = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    on.value = withTiming(active ? 1 : 0, { duration: 180 });
  }, [active, on]);
  const box = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(on.value, [0, 1], [colors.raised, colors.text]) }));
  const text = useAnimatedStyle(() => ({ color: interpolateColor(on.value, [0, 1], [colors.text, "#0B0B0D"]) }));
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
    >
      <Animated.View style={[styles.pill, box]}>
        <Animated.Text style={[styles.pillText, text]}>{label}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

interface FilterSheetProps {
  open: boolean;
  value: Filters;
  transactions: Transaction[];
  onApply: (filters: Filters) => void;
  onClose: () => void;
}

/** Narrow the history by time, direction, kind of payment, and who it was with. */
export const FilterSheet = ({ open, value, transactions, onApply, onClose }: FilterSheetProps) => {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<Filters>(value);
  const t = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setDraft(value);
      t.value = withSpring(1, { damping: 20, stiffness: 180 });
    }
    // only when it opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = (then: () => void) => {
    t.value = withTiming(0, { duration: 220 });
    setTimeout(then, 210);
  };

  // Everyone and every biller that appears in the history, most frequent first.
  const parties = [...new Map(transactions.map((tx) => [tx.title, tx])).values()].sort((a, b) => transactions.filter((x) => x.title === b.title).length - transactions.filter((x) => x.title === a.title).length);
  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  const matches = applyFilters(transactions, draft).length;

  const backdrop = useAnimatedStyle(() => ({ opacity: Math.min(1, t.value) * 0.6 }));
  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - t.value) * 900 }] }));

  return (
    <Modal visible={open} transparent animationType="none" statusBarTranslucent onRequestClose={() => close(onClose)}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdrop]} />
      <Pressable style={StyleSheet.absoluteFill} onPress={() => close(onClose)} />
      <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 4 }, sheet]}>
        <View style={styles.grab} />
        <View style={styles.head}>
          <Text style={styles.title}>Filter</Text>
          <Pressable style={styles.close} onPress={() => close(onClose)} hitSlop={10}>
            <X size={16} color={colors.text} weight="bold" />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
          <Text style={styles.label}>When</Text>
          <View style={styles.wrap}>
            {PERIODS.map((p, i) => (
              <Pill key={p.label} label={p.label} active={draft.period === i} onPress={() => setDraft({ ...draft, period: i })} />
            ))}
          </View>

          <Text style={styles.label}>Direction</Text>
          <View style={styles.wrap}>
            {(["all", "in", "out"] as const).map((k) => (
              <Pill key={k} label={k === "all" ? "Everything" : k === "in" ? "Money in" : "Money out"} active={draft.kind === k} onPress={() => setDraft({ ...draft, kind: k })} />
            ))}
          </View>

          <Text style={styles.label}>Kind of transaction</Text>
          <View style={styles.wrap}>
            {TX_CATEGORIES.map((c) => (
              <Pill key={c.key} label={c.label} active={draft.categories.includes(c.key)} onPress={() => setDraft({ ...draft, categories: toggle(draft.categories, c.key) })} />
            ))}
          </View>

          <Text style={styles.label}>Person or biller</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.parties}>
            {parties.map((p) => {
              const on = draft.parties.includes(p.title);
              return (
                <Pressable
                  key={p.title}
                  style={styles.party}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setDraft({ ...draft, parties: toggle(draft.parties, p.title) });
                  }}
                >
                  <View style={[styles.partyRing, on && styles.partyOn]}>
                    <Avatar person={p.person} brand={p.brand} name={p.title} size={50} />
                  </View>
                  <Text style={[styles.partyText, on && styles.partyTextOn]} numberOfLines={1}>
                    {p.title.split(" ")[0]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </ScrollView>

        <View style={styles.foot}>
          <Press depth={0.96} onPress={() => setDraft(NO_FILTERS)} style={styles.reset}>
            <Text style={styles.resetText}>Reset</Text>
          </Press>
          <Press fill depth={0.97} onPress={() => close(() => onApply(draft))} style={styles.apply}>
            <Text style={styles.applyText}>{matches === 0 ? "No transactions" : `Show ${matches} transaction${matches === 1 ? "" : "s"}`}</Text>
          </Press>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "#000" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "86%", backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingTop: 8 },
  grab: { alignSelf: "center", width: 36, height: 5, borderRadius: 3, backgroundColor: colors.lineStrong },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingHorizontal: 20 },
  title: { fontFamily: fonts.bold, fontSize: 24, letterSpacing: -0.6, color: colors.text },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.raised, alignItems: "center", justifyContent: "center" },
  body: { paddingHorizontal: 20 },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted, marginTop: 22, marginBottom: 10 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { height: 38, paddingHorizontal: 15, borderRadius: 19, justifyContent: "center" },
  pillText: { fontFamily: fonts.medium, fontSize: 13.5 },
  parties: { gap: 6, paddingBottom: 8 },
  party: { width: 68, alignItems: "center" },
  partyRing: { padding: 3, borderRadius: 30, borderWidth: 2, borderColor: "transparent" },
  partyOn: { borderColor: colors.accent },
  partyText: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 6 },
  partyTextOn: { color: colors.text, fontFamily: fonts.medium },
  foot: { flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingTop: 16 },
  reset: { height: 54, paddingHorizontal: 24, borderRadius: 27, backgroundColor: colors.raised, justifyContent: "center" },
  resetText: { fontFamily: fonts.medium, fontSize: 15.5, color: colors.text },
  apply: { height: 54, borderRadius: 27, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  applyText: { fontFamily: fonts.semibold, fontSize: 15.5, color: "#FFFFFF" },
});
