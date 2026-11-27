import { router } from "expo-router";
import { Bank, CaretRight, MagnifyingGlass, QrCode, Star, UserCirclePlus, type IconProps } from "phosphor-react-native";
import { useState, type ComponentType } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Rise } from "@/components/Rise";
import { Avatar } from "@/components/ui/Avatar";
import { Press } from "@/components/ui/Press";
import { TopBar } from "@/components/ui/TopBar";
import { RECIPIENTS } from "@/constants/data";
import { useBankStore } from "@/stores/useBankStore";
import type { Recipient } from "@/types/bank";
import { colors, fonts, radius } from "@/utils/theme";

interface WayProps {
  Icon: ComponentType<IconProps>;
  title: string;
  note: string;
  onPress?: () => void;
}
const Way = ({ Icon, title, note, onPress }: WayProps) => (
  <Press fill onPress={onPress} depth={0.96} style={styles.way}>
    <View style={styles.wayIcon}>
      <Icon size={22} color={colors.text} weight="fill" />
    </View>
    <Text style={styles.wayTitle}>{title}</Text>
    <Text style={styles.wayNote}>{note}</Text>
  </Press>
);

/** The send page: three ways to pay someone, then the people you pay most. */
export const TransferRecipient = () => {
  const setRecipient = useBankStore((s) => s.setRecipient);
  const [query, setQuery] = useState("");
  const list = RECIPIENTS.filter((r) => `${r.name} ${r.bank}`.toLowerCase().includes(query.trim().toLowerCase()));

  const pick = (recipient: Recipient) => {
    setRecipient(recipient);
    router.push("/transfer/amount");
  };

  return (
    <View style={styles.screen}>
      <TopBar title="Send money" step={1} />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Rise show delay={40}>
          <Text style={styles.heading}>Who are you sending to?</Text>
          <View style={styles.search}>
            <MagnifyingGlass size={18} color={colors.muted} weight="bold" />
            <TextInput value={query} onChangeText={setQuery} placeholder="Name, bank or account number" placeholderTextColor={colors.faint} style={styles.input} selectionColor={colors.accent} />
          </View>
        </Rise>

        {query.length === 0 && (
          <>
            <Rise show delay={110} style={styles.ways}>
              <Way Icon={Bank} title="Bank account" note="Any Nigerian bank" onPress={() => router.push("/transfer/new")} />
              <Way Icon={UserCirclePlus} title="Access tag" note="Free and instant" onPress={() => router.push("/transfer/new")} />
              <Way Icon={QrCode} title="Scan QR" note="Pay a merchant" />
            </Rise>

            <Rise show delay={180}>
              <Text style={styles.label}>Recent</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recents}>
                {RECIPIENTS.slice(0, 5).map((r, i) => (
                  <Rise key={r.id} show delay={220 + i * 55} distance={14}>
                    <Press onPress={() => pick(r)} depth={0.9} style={styles.recent}>
                      <Avatar person={r.person} name={r.name} badge={r.brand} size={60} />
                      <Text style={styles.recentName} numberOfLines={1}>
                        {r.name.split(" ")[0]}
                      </Text>
                    </Press>
                  </Rise>
                ))}
              </ScrollView>
            </Rise>
          </>
        )}

        <Rise show delay={260}>
          <Text style={styles.label}>{query ? "Results" : "Saved beneficiaries"}</Text>
          <View style={styles.list}>
            {list.map((r, i) => (
              <Press key={r.id} onPress={() => pick(r)} depth={0.985} style={styles.row}>
                <Avatar person={r.person} name={r.name} badge={r.brand} size={44} />
                <View style={[styles.rowBody, i < list.length - 1 && styles.rule]}>
                  <View style={styles.words}>
                    <Text style={styles.name}>{r.name}</Text>
                    <Text style={styles.bank}>
                      {r.bank} · {r.account}
                    </Text>
                  </View>
                  {i < 2 ? <Star size={17} color={colors.accent} weight="fill" /> : <CaretRight size={16} color={colors.faint} weight="bold" />}
                </View>
              </Press>
            ))}
            {list.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No one by that name</Text>
                <Text style={styles.emptyNote}>Check the spelling, or send to a new bank account.</Text>
              </View>
            )}
          </View>
        </Rise>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 50 },
  heading: { fontFamily: fonts.bold, fontSize: 28, letterSpacing: -0.9, color: colors.text, marginHorizontal: 4 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 48, borderRadius: 14, backgroundColor: colors.surface, paddingHorizontal: 14, marginTop: 16 },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 16, color: colors.text },
  ways: { flexDirection: "row", gap: 10, marginTop: 12 },
  way: { borderRadius: radius.lg, backgroundColor: colors.surface, padding: 14, height: 118 },
  wayIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.raised, alignItems: "center", justifyContent: "center" },
  wayTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text, marginTop: "auto" },
  wayNote: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.muted, marginTop: 2 },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted, marginTop: 24, marginBottom: 12, marginLeft: 4 },
  recents: { gap: 8 },
  recent: { width: 74, alignItems: "center" },
  recentName: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.soft, marginTop: 8 },
  list: { borderRadius: radius.lg, backgroundColor: colors.surface, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingLeft: 14 },
  rowBody: { flex: 1, flexDirection: "row", alignItems: "center", marginLeft: 14, paddingVertical: 13, paddingRight: 16 },
  rule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineStrong },
  words: { flex: 1 },
  name: { fontFamily: fonts.medium, fontSize: 15.5, color: colors.text },
  bank: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted, marginTop: 2 },
  empty: { paddingVertical: 28, alignItems: "center" },
  emptyTitle: { fontFamily: fonts.semibold, fontSize: 15.5, color: colors.text },
  emptyNote: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 5, textAlign: "center" },
});
