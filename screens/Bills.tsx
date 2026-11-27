import { router } from "expo-router";
import {
  Car,
  DeviceMobile,
  DotsThreeOutline,
  Globe,
  Lightning,
  MagnifyingGlass,
  ShoppingBag,
  Television,
  WifiHigh,
  type IconProps,
} from "phosphor-react-native";
import { useState, type ComponentType } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Rise } from "@/components/Rise";
import { Avatar } from "@/components/ui/Avatar";
import { PinSheet } from "@/components/ui/PinSheet";
import { Press } from "@/components/ui/Press";
import { TopBar } from "@/components/ui/TopBar";
import { BILLERS, BILL_CATEGORIES } from "@/constants/data";
import { useBankStore } from "@/stores/useBankStore";
import { colors, fonts, radius } from "@/utils/theme";

const ICONS: ComponentType<IconProps>[] = [
  DeviceMobile,
  WifiHigh,
  Lightning,
  Television,
  Globe,
  Car,
  ShoppingBag,
  DotsThreeOutline,
];

/** Pay bills: eight kinds of bill up top, then the billers people actually pay, with their real logos. */
export const Bills = () => {
  const [pin, setPin] = useState(false);
  const pay = useBankStore((s) => s.pay);
  return (
    <View style={styles.screen}>
      <TopBar title="Pay bills" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Rise show delay={40}>
          <Text style={styles.heading}>What are you paying for?</Text>
          <View style={styles.search}>
            <MagnifyingGlass size={18} color={colors.muted} weight="bold" />
            <Text style={styles.searchText}>Search a biller</Text>
          </View>
        </Rise>

        <Rise show delay={110} style={styles.grid}>
          {BILL_CATEGORIES.map((c, i) => {
            const Icon = ICONS[i];
            return (
              <View key={c} style={styles.slot}>
                <Press
                  depth={0.92}
                  onPress={
                    c === "Airtime" || c === "Data"
                      ? () => router.push("/bills/airtime")
                      : undefined
                  }
                  style={styles.cat}
                >
                  <View style={[styles.catIcon, i === 0 && styles.catIconOn]}>
                    <Icon size={24} color={colors.text} weight="fill" />
                  </View>
                  <Text style={styles.catText}>{c}</Text>
                </Press>
              </View>
            );
          })}
        </Rise>

        <Rise show delay={190}>
          <Text style={styles.label}>Due soon</Text>
          <View style={styles.due}>
            <Avatar brand="dstv" size={46} />
            <View style={styles.dueWords}>
              <Text style={styles.dueTitle}>DStv Compact</Text>
              <Text style={styles.dueNote}>₦19,000 · due in 3 days</Text>
            </View>
            <Press depth={0.94} onPress={() => setPin(true)} style={styles.pay}>
              <Text style={styles.payText}>Pay now</Text>
            </Press>
          </View>
        </Rise>

        <Rise show delay={260}>
          <Text style={styles.label}>Popular</Text>
          <View style={styles.list}>
            {BILLERS.map((b, i) => (
              <Press key={b.name} depth={0.985} style={styles.row}>
                <Avatar brand={b.brand} size={42} />
                <View
                  style={[
                    styles.rowBody,
                    i < BILLERS.length - 1 && styles.rule,
                  ]}
                >
                  <Text style={styles.name}>{b.name}</Text>
                  <Text style={styles.note}>{b.note}</Text>
                </View>
              </Press>
            ))}
          </View>
        </Rise>
      </ScrollView>
      <PinSheet
        open={pin}
        steps={["Enter your PIN"]}
        note="₦19,000 for DStv Compact"
        onClose={() => setPin(false)}
        onDone={() => {
          setPin(false);
          const id = pay({ title: "DStv", note: "Compact plan", amount: 19000, category: "bills", brand: "dstv" });
          router.replace({ pathname: "/done", params: { title: "DStv paid", amount: "19000", line: "Compact · renewed for 30 days", id } });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 50 },
  heading: {
    fontFamily: fonts.bold,
    fontSize: 28,
    letterSpacing: -0.9,
    color: colors.text,
    marginHorizontal: 4,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  searchText: { fontFamily: fonts.regular, fontSize: 16, color: colors.faint },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingVertical: 8,
  },
  slot: { width: "25%" },
  cat: { alignItems: "center", paddingVertical: 12 },
  catIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.raised,
    alignItems: "center",
    justifyContent: "center",
  },
  catIconOn: { backgroundColor: colors.accent },
  catText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.soft,
    marginTop: 8,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 4,
  },
  due: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: 14,
  },
  dueWords: { flex: 1, marginLeft: 12 },
  dueTitle: { fontFamily: fonts.semibold, fontSize: 15.5, color: colors.text },
  dueNote: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  pay: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    backgroundColor: colors.text,
    justifyContent: "center",
  },
  payText: { fontFamily: fonts.semibold, fontSize: 13.5, color: "#0B0B0D" },
  list: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", paddingLeft: 14 },
  rowBody: { flex: 1, marginLeft: 12, paddingVertical: 12, paddingRight: 16 },
  rule: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineStrong,
  },
  name: { fontFamily: fonts.medium, fontSize: 15.5, color: colors.text },
  note: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: colors.muted,
    marginTop: 2,
  },
});
