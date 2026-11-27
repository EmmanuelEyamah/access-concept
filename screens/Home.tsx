import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Hero } from "@/components/Home/Hero";
import { ServicesSheet } from "@/components/Home/ServicesSheet";
import { Tiles } from "@/components/Home/Tiles";
import { Rise } from "@/components/Rise";
import { TxRow } from "@/components/TxRow";
import { Press } from "@/components/ui/Press";
import { useShown } from "@/hooks/useShown";
import { useBankStore } from "@/stores/useBankStore";
import { colors, fonts, radius } from "@/utils/theme";

export const Home = () => {
  const shown = useShown();
  const transactions = useBankStore((s) => s.transactions);
  const hidden = useBankStore((s) => s.hidden);
  const autoServices = useBankStore((s) => s.autoServices);
  const [services, setServices] = useState(false);
  const recent = transactions.slice(0, 3);

  useEffect(() => {
    if (autoServices) setServices((open) => !open);
  }, [autoServices]);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Hero live={shown} onMore={() => setServices(true)} />

        <Rise show={shown} delay={140} style={styles.card}>
          {recent.map((tx, i) => (
            <TxRow key={tx.id} tx={tx} hidden={hidden} last={i === recent.length - 1} />
          ))}
          <Press onPress={() => router.navigate("/history")} depth={0.98} style={styles.all}>
            <Text style={styles.allText}>See all</Text>
          </Press>
        </Rise>

        <Rise show={shown} delay={230} style={styles.gap}>
          <Tiles show={shown} hidden={hidden} />
        </Rise>
      </ScrollView>
      <ServicesSheet open={services} onClose={() => setServices(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 30 },
  card: { marginHorizontal: 16, borderRadius: radius.lg, backgroundColor: colors.surface, overflow: "hidden" },
  all: { height: 48, alignItems: "center", justifyContent: "center", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.lineStrong },
  allText: { fontFamily: fonts.medium, fontSize: 14.5, color: colors.text },
  gap: { marginTop: 10 },
});
