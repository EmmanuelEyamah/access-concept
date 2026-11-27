import {
  ArrowDownLeft,
  ArrowUpRight,
  Faders,
  MagnifyingGlass,
  X,
} from "phosphor-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FilterSheet,
  NO_FILTERS,
  applyFilters,
  countFilters,
  type Filters,
} from "@/components/FilterSheet";
import { Rise } from "@/components/Rise";
import { TxRow } from "@/components/TxRow";
import { Money } from "@/components/ui/Money";
import { Press } from "@/components/ui/Press";
import {
  MONTH_IN,
  MONTH_OUT,
  PERIODS,
  TX_CATEGORIES,
} from "@/constants/data";
import { useShown } from "@/hooks/useShown";
import { useBankStore } from "@/stores/useBankStore";
import { dayLabel } from "@/utils/format";
import { colors, fonts, radius } from "@/utils/theme";

const when = (daysAgo: number) =>
  daysAgo < 7
    ? dayLabel(daysAgo)
    : daysAgo < 27
      ? "Earlier this month"
      : daysAgo < 58
        ? "October"
        : daysAgo < 120
          ? "August"
          : "Earlier this year";

export const History = () => {
  const insets = useSafeAreaInsets();
  const shown = useShown();
  const transactions = useBankStore((s) => s.transactions);
  const hidden = useBankStore((s) => s.hidden);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [sheet, setSheet] = useState(false);
  const autoFilter = useBankStore((s) => s.autoFilter);
  useEffect(() => {
    if (autoFilter) setSheet((open) => !open);
  }, [autoFilter]);
  const active = countFilters(filters);

  const list = useMemo(
    () =>
      applyFilters(transactions, filters).filter((t) =>
        `${t.title} ${t.note}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [transactions, filters, query],
  );

  const groups = useMemo(() => {
    const labels = [...new Set(list.map((t) => when(t.daysAgo)))];
    return labels.map((label) => ({
      label,
      items: list.filter((t) => when(t.daysAgo) === label),
    }));
  }, [list]);

  // With a filter on, the two totals describe what is listed. Without one, they are the month so far.
  const sentNow = transactions
    .filter((t) => t.id.startsWith("sent-"))
    .reduce((sum, t) => sum + t.amount, 0);
  const moneyIn =
    active || query
      ? list
          .filter((t) => t.kind === "in")
          .reduce((sum, t) => sum + t.amount, 0)
      : MONTH_IN;
  const moneyOut =
    active || query
      ? list
          .filter((t) => t.kind === "out")
          .reduce((sum, t) => sum + t.amount, 0)
      : MONTH_OUT + sentNow;

  // One removable chip per filter that is switched on.
  const chips: { label: string; clear: () => void }[] = [
    ...(filters.period
      ? [
          {
            label: PERIODS[filters.period].label,
            clear: () => setFilters({ ...filters, period: 0 }),
          },
        ]
      : []),
    ...(filters.kind !== "all"
      ? [
          {
            label: filters.kind === "in" ? "Money in" : "Money out",
            clear: () => setFilters({ ...filters, kind: "all" as const }),
          },
        ]
      : []),
    ...filters.categories.map((c) => ({
      label: TX_CATEGORIES.find((x) => x.key === c)?.label ?? c,
      clear: () =>
        setFilters({
          ...filters,
          categories: filters.categories.filter((x) => x !== c),
        }),
    })),
    ...filters.parties.map((p) => ({
      label: p,
      clear: () =>
        setFilters({
          ...filters,
          parties: filters.parties.filter((x) => x !== p),
        }),
    })),
  ];

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: 30,
        }}
      >
        <Rise show={shown} delay={0}>
          <Text style={styles.heading}>History</Text>
        </Rise>

        <Rise show={shown} delay={80} style={styles.totals}>
          <View style={styles.total}>
            <View
              style={[styles.totalIcon, { backgroundColor: colors.goodSoft }]}
            >
              <ArrowDownLeft size={17} color={colors.good} weight="bold" />
            </View>
            <Text style={styles.totalLabel}>
              {active || query ? "In, filtered" : "In this month"}
            </Text>
            <Money
              value={moneyIn}
              size={19}
              hidden={hidden}
              style={styles.totalValue}
            />
          </View>
          <View style={styles.total}>
            <View
              style={[styles.totalIcon, { backgroundColor: colors.accentSoft }]}
            >
              <ArrowUpRight size={17} color={colors.accent} weight="bold" />
            </View>
            <Text style={styles.totalLabel}>
              {active || query ? "Out, filtered" : "Out this month"}
            </Text>
            <Money
              value={moneyOut}
              size={19}
              hidden={hidden}
              style={styles.totalValue}
            />
          </View>
        </Rise>

        <Rise show={shown} delay={160} style={styles.tools}>
          <View style={styles.search}>
            <MagnifyingGlass size={18} color={colors.muted} weight="bold" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search a name or a bill"
              placeholderTextColor={colors.faint}
              style={styles.input}
              selectionColor={colors.accent}
            />
          </View>
          <Press
            onPress={() => setSheet(true)}
            depth={0.92}
            style={[styles.filter, active > 0 && styles.filterOn]}
          >
            <Faders
              size={20}
              color={active > 0 ? "#0B0B0D" : colors.text}
              weight="bold"
            />
            {active > 0 && (
              <View style={styles.count}>
                <Text style={styles.countText}>{active}</Text>
              </View>
            )}
          </Press>
        </Rise>

        {chips.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {chips.map((c) => (
              <Pressable key={c.label} style={styles.chip} onPress={c.clear}>
                <Text style={styles.chipText}>{c.label}</Text>
                <X size={12} color={colors.text} weight="bold" />
              </Pressable>
            ))}
            <Pressable
              style={styles.clear}
              onPress={() => setFilters(NO_FILTERS)}
            >
              <Text style={styles.clearText}>Clear all</Text>
            </Pressable>
          </ScrollView>
        )}

        {groups.length === 0 ? (
          <Rise show={shown} delay={220} style={styles.empty}>
            <Text style={styles.emptyTitle}>Nothing matches</Text>
            <Text style={styles.emptyNote}>
              Try a wider time range, or remove a filter.
            </Text>
            <Press
              onPress={() => setFilters(NO_FILTERS)}
              style={styles.emptyButton}
            >
              <Text style={styles.emptyButtonText}>Clear filters</Text>
            </Press>
          </Rise>
        ) : (
          groups.map((g, i) => (
            <Rise
              key={`${active}-${g.label}`}
              show={shown}
              delay={220 + i * 60}
            >
              <Text style={styles.day}>{g.label}</Text>
              <View style={styles.list}>
                {g.items.map((tx, j) => (
                  <TxRow
                    key={tx.id}
                    tx={tx}
                    hidden={hidden}
                    last={j === g.items.length - 1}
                  />
                ))}
              </View>
            </Rise>
          ))
        )}
      </ScrollView>
      <FilterSheet
        open={sheet}
        value={filters}
        transactions={transactions}
        onApply={(f) => {
          setFilters(f);
          setSheet(false);
        }}
        onClose={() => setSheet(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  heading: {
    fontFamily: fonts.bold,
    fontSize: 32,
    letterSpacing: -1.1,
    color: colors.text,
    marginHorizontal: 20,
  },
  totals: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 18,
  },
  total: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: 16,
  },
  totalIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  totalLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginTop: 14,
  },
  totalValue: { marginTop: 4 },
  tools: { flexDirection: "row", gap: 8, marginHorizontal: 16, marginTop: 12 },
  search: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  filter: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  filterOn: { backgroundColor: colors.text },
  count: {
    position: "absolute",
    right: -5,
    top: -5,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  countText: { fontFamily: fonts.semibold, fontSize: 10.5, color: "#FFFFFF" },
  chips: { gap: 8, paddingHorizontal: 16, paddingTop: 12 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 17,
    backgroundColor: colors.raised,
  },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  clear: { height: 34, paddingHorizontal: 8, justifyContent: "center" },
  clearText: { fontFamily: fonts.medium, fontSize: 13, color: colors.accent },
  day: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
    marginTop: 22,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  list: {
    marginHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  empty: { alignItems: "center", marginTop: 56, paddingHorizontal: 40 },
  emptyTitle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text },
  emptyNote: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    color: colors.muted,
    textAlign: "center",
    marginTop: 6,
  },
  emptyButton: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 21,
    backgroundColor: colors.surface,
    justifyContent: "center",
    marginTop: 16,
  },
  emptyButtonText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
});
