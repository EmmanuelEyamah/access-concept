import * as Haptics from "expo-haptics";
import { CaretRight, Copy, CreditCard, LinkSimple, Phone, QrCode, ShareNetwork, type IconProps } from "phosphor-react-native";
import type { ComponentType } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { Rise } from "@/components/Rise";
import { ListRow } from "@/components/ui/ListRow";
import { Press } from "@/components/ui/Press";
import { TopBar } from "@/components/ui/TopBar";
import { LOGO } from "@/constants/assets";
import { USER } from "@/constants/data";
import { colors, fonts, radius } from "@/utils/theme";

const WAYS: { Icon: ComponentType<IconProps>; title: string; note: string }[] = [
  { Icon: CreditCard, title: "Top up with a card", note: "From any Nigerian debit card" },
  { Icon: Phone, title: "Dial *901#", note: "From any phone, no data needed" },
  { Icon: LinkSimple, title: "Request money", note: "Send a link someone can pay" },
  { Icon: QrCode, title: "Show my QR code", note: "Let someone scan to pay you" },
];

/** Add money: your account details first, because a bank transfer is how most money arrives. */
export const AddMoney = () => {
  const copied = useSharedValue(0);
  const toast = useAnimatedStyle(() => ({ opacity: copied.value, transform: [{ translateY: (1 - copied.value) * 6 }] }));

  return (
    <View style={styles.screen}>
      <TopBar title="Add money" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Rise show delay={40}>
          <Text style={styles.heading}>Send money to this account</Text>
        </Rise>

        <Rise show delay={110} style={styles.card}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          <Text style={styles.label}>Account number</Text>
          <Text style={styles.number}>{USER.account}</Text>
          <Text style={styles.label}>Account name</Text>
          <Text style={styles.name}>{USER.name}</Text>
          <Animated.View style={[styles.toast, toast]} pointerEvents="none">
            <Text style={styles.toastText}>Copied</Text>
          </Animated.View>
          <View style={styles.buttons}>
            <Pressable
              style={styles.primary}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                copied.value = withSequence(withTiming(1, { duration: 150 }), withTiming(1, { duration: 1100 }), withTiming(0, { duration: 220 }));
              }}
            >
              <Copy size={18} color="#0B0B0D" weight="bold" />
              <Text style={styles.primaryText}>Copy number</Text>
            </Pressable>
            <Press depth={0.95} style={styles.ghost}>
              <ShareNetwork size={18} color={colors.text} weight="fill" />
              <Text style={styles.ghostText}>Share</Text>
            </Press>
          </View>
        </Rise>

        <Rise show delay={200}>
          <Text style={styles.section}>Other ways</Text>
          <View style={styles.list}>
            {WAYS.map((w, i) => (
              <ListRow key={w.title} Icon={w.Icon} title={w.title} note={w.note} right={<CaretRight size={16} color={colors.faint} weight="bold" />} last={i === WAYS.length - 1} />
            ))}
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
  card: { borderRadius: radius.lg, backgroundColor: colors.surface, padding: 20, marginTop: 18 },
  logo: { width: 104, height: 26 },
  label: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.muted, marginTop: 20 },
  number: { fontFamily: fonts.bold, fontSize: 34, letterSpacing: -0.6, color: colors.text, marginTop: 4, fontVariant: ["tabular-nums"] },
  name: { fontFamily: fonts.semibold, fontSize: 18, color: colors.text, marginTop: 4 },
  toast: { position: "absolute", right: 20, top: 22, height: 28, paddingHorizontal: 12, borderRadius: 14, backgroundColor: colors.goodSoft, justifyContent: "center" },
  toastText: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.good },
  buttons: { flexDirection: "row", gap: 10, marginTop: 22 },
  primary: { flex: 1, height: 52, borderRadius: 26, backgroundColor: colors.text, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryText: { fontFamily: fonts.semibold, fontSize: 15.5, color: "#0B0B0D" },
  ghost: { height: 52, paddingHorizontal: 22, borderRadius: 26, backgroundColor: colors.raised, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  ghostText: { fontFamily: fonts.medium, fontSize: 15.5, color: colors.text },
  section: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted, marginTop: 26, marginBottom: 10, marginLeft: 4 },
  list: { borderRadius: radius.lg, backgroundColor: colors.surface, overflow: "hidden" },
});
