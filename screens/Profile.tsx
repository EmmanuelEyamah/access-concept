import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { BellRinging, Copy, Devices, EyeSlash, FileText, Gauge, Gift, Headset, Key, Moon, PencilSimple, ScanSmiley, Scales, ShieldCheck, SignOut, Star, Translate, User } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Rise } from "@/components/Rise";
import { ListRow } from "@/components/ui/ListRow";
import { Press } from "@/components/ui/Press";
import { Toggle } from "@/components/ui/Toggle";
import { PEOPLE } from "@/constants/assets";
import { DAILY_LIMIT, USER } from "@/constants/data";
import { useShown } from "@/hooks/useShown";
import { useBankStore } from "@/stores/useBankStore";
import { naira } from "@/utils/format";
import { colors, fonts, radius } from "@/utils/theme";

const Value = ({ text }: { text: string }) => <Text style={styles.value}>{text}</Text>;

export const Profile = () => {
  const insets = useSafeAreaInsets();
  const shown = useShown();
  const hidden = useBankStore((s) => s.hidden);
  const toggleHidden = useBankStore((s) => s.toggleHidden);
  const [faceId, setFaceId] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const used = useSharedValue(0);
  const copied = useSharedValue(0);

  useEffect(() => {
    used.value = shown ? withDelay(350, withTiming(0.34, { duration: 900, easing: Easing.out(Easing.cubic) })) : 0;
  }, [shown, used]);

  const bar = useAnimatedStyle(() => ({ width: `${used.value * 100}%` }));
  const toast = useAnimatedStyle(() => ({ opacity: copied.value }));
  const number = useAnimatedStyle(() => ({ opacity: 1 - copied.value }));
  const copy = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    copied.value = withSequence(withTiming(1, { duration: 150 }), withTiming(1, { duration: 1100 }), withTiming(0, { duration: 220 }));
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 40 }}>
        <Rise show={shown} delay={0} style={styles.who}>
          <View>
            <Image source={PEOPLE.user} style={styles.photo} />
            <View style={styles.edit}>
              <PencilSimple size={13} color="#0B0B0D" weight="bold" />
            </View>
          </View>
          <View style={styles.whoWords}>
            <Text style={styles.name}>{USER.name}</Text>
            <Text style={styles.handle}>@emmanuel · Banking since 2021</Text>
            <View style={styles.tier}>
              <ShieldCheck size={14} color={colors.good} weight="fill" />
              <Text style={styles.tierText}>{USER.tier} · Verified</Text>
            </View>
          </View>
        </Rise>

        <Rise show={shown} delay={80} style={styles.account}>
          <View style={styles.accountRow}>
            <View>
              <Text style={styles.small}>{USER.product}</Text>
              <Animated.Text style={[styles.accountNumber, number]}>{USER.account}</Animated.Text>
              <Animated.Text style={[styles.accountNumber, styles.accountToast, toast]}>Copied</Animated.Text>
            </View>
            <Pressable style={styles.copy} onPress={copy} hitSlop={8}>
              <Copy size={16} color={colors.text} weight="bold" />
              <Text style={styles.copyText}>Copy</Text>
            </Pressable>
          </View>
          <View style={styles.hair} />
          <View style={styles.limitHead}>
            <Text style={styles.small}>Daily transfer limit</Text>
            <Text style={styles.limitValue}>
              ₦340,000 <Text style={styles.limitOf}>of ₦{naira(DAILY_LIMIT, 0)}</Text>
            </Text>
          </View>
          <View style={styles.rail}>
            <Animated.View style={[styles.railFill, bar]} />
          </View>
          <Text style={styles.upgrade}>Upgrade to Tier 4 to send up to ₦5,000,000 a day</Text>
        </Rise>

        <Rise show={shown} delay={160}>
          <Press depth={0.98} style={styles.invite}>
            <View style={styles.inviteIcon}>
              <Gift size={24} color="#FFFFFF" weight="fill" />
            </View>
            <View style={styles.inviteWords}>
              <Text style={styles.inviteTitle}>Invite a friend, you both get ₦1,000</Text>
              <Text style={styles.inviteNote}>Your code: EMMA-4821</Text>
            </View>
          </Press>
        </Rise>

        <Rise show={shown} delay={240}>
          <Text style={styles.label}>Account</Text>
          <View style={styles.list}>
            <ListRow Icon={User} title="Personal details" />
            <ListRow Icon={FileText} title="Statements and documents" />
            <ListRow Icon={Gauge} title="Transaction limits" right={<Value text={USER.tier} />} />
            <ListRow Icon={Devices} title="Linked devices" right={<Value text="2" />} last />
          </View>
        </Rise>

        <Rise show={shown} delay={300}>
          <Text style={styles.label}>Security</Text>
          <View style={styles.list}>
            <ListRow Icon={ScanSmiley} title="Sign in with Face ID" right={<Toggle value={faceId} onChange={setFaceId} />} />
            <ListRow Icon={EyeSlash} title="Hide balance" right={<Toggle value={hidden} onChange={toggleHidden} />} />
            <ListRow Icon={Key} title="Change PIN or password" />
            <ListRow Icon={ShieldCheck} title="Two-step verification" right={<Value text="On" />} last />
          </View>
        </Rise>

        <Rise show={shown} delay={360}>
          <Text style={styles.label}>Preferences</Text>
          <View style={styles.list}>
            <ListRow Icon={BellRinging} title="Transaction alerts" right={<Toggle value={alerts} onChange={setAlerts} />} />
            <ListRow Icon={Moon} title="Appearance" right={<Value text="Dark" />} />
            <ListRow Icon={Translate} title="Language" right={<Value text="English" />} last />
          </View>
        </Rise>

        <Rise show={shown} delay={420}>
          <Text style={styles.label}>More</Text>
          <View style={styles.list}>
            <ListRow Icon={Headset} title="Help and support" onPress={() => router.push("/support")} />
            <ListRow Icon={Star} title="Rate the app" />
            <ListRow Icon={Scales} title="Terms and privacy" last />
          </View>
        </Rise>

        <Rise show={shown} delay={480}>
          <Press depth={0.98} style={styles.out}>
            <SignOut size={18} color={colors.bad} weight="bold" />
            <Text style={styles.outText}>Sign out</Text>
          </Press>
        </Rise>
        <Text style={styles.legal}>Version 1.0 · Concept redesign, not affiliated with Access Bank</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  who: { flexDirection: "row", alignItems: "center", marginHorizontal: 20 },
  photo: { width: 78, height: 78, borderRadius: 39 },
  edit: { position: "absolute", right: -2, bottom: -2, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.text, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: colors.bg },
  whoWords: { flex: 1, marginLeft: 16 },
  name: { fontFamily: fonts.bold, fontSize: 22, letterSpacing: -0.6, color: colors.text },
  handle: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 3 },
  tier: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 },
  tierText: { fontFamily: fonts.medium, fontSize: 13, color: colors.good },
  account: { marginHorizontal: 16, marginTop: 22, borderRadius: radius.lg, backgroundColor: colors.surface, padding: 16 },
  accountRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  small: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  accountNumber: { fontFamily: fonts.bold, fontSize: 22, letterSpacing: -0.3, color: colors.text, marginTop: 3, fontVariant: ["tabular-nums"] },
  accountToast: { position: "absolute", bottom: 0, color: colors.good },
  copy: { flexDirection: "row", alignItems: "center", gap: 6, height: 36, paddingHorizontal: 14, borderRadius: 18, backgroundColor: colors.raised },
  copyText: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.text },
  hair: { height: StyleSheet.hairlineWidth, backgroundColor: colors.lineStrong, marginVertical: 16 },
  limitHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  limitValue: { fontFamily: fonts.semibold, fontSize: 14.5, color: colors.text, fontVariant: ["tabular-nums"] },
  limitOf: { fontFamily: fonts.regular, color: colors.muted },
  rail: { height: 6, borderRadius: 3, backgroundColor: colors.raised, marginTop: 10, overflow: "hidden" },
  railFill: { height: 6, borderRadius: 3, backgroundColor: colors.accent },
  upgrade: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.accent, marginTop: 12 },
  invite: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 10, borderRadius: radius.lg, backgroundColor: colors.accent, padding: 16 },
  inviteIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  inviteWords: { flex: 1, marginLeft: 14 },
  inviteTitle: { fontFamily: fonts.semibold, fontSize: 15.5, color: "#FFFFFF" },
  inviteNote: { fontFamily: fonts.regular, fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted, marginTop: 24, marginBottom: 10, marginHorizontal: 20 },
  list: { marginHorizontal: 16, borderRadius: radius.lg, backgroundColor: colors.surface, overflow: "hidden" },
  value: { fontFamily: fonts.regular, fontSize: 14.5, color: colors.muted },
  out: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 22, marginHorizontal: 16, height: 54, borderRadius: radius.lg, backgroundColor: colors.surface },
  outText: { fontFamily: fonts.medium, fontSize: 15.5, color: colors.bad },
  legal: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.faint, textAlign: "center", marginTop: 18 },
});
