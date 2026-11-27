import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowsCounterClockwise, ContactlessPayment, Eye, Globe, LockKey, Money as Cash, Password, ShoppingBag, Sliders, Snowflake, WarningOctagon, WifiHigh, type IconProps } from "phosphor-react-native";
import { useEffect, useState, type ComponentType } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Rise } from "@/components/Rise";
import { Avatar } from "@/components/ui/Avatar";
import { ListRow } from "@/components/ui/ListRow";
import { PinSheet } from "@/components/ui/PinSheet";
import { Press } from "@/components/ui/Press";
import { Toggle } from "@/components/ui/Toggle";
import { LOGO } from "@/constants/assets";
import { CARD_LIMIT, CARD_PIN, USER } from "@/constants/data";
import { useShown } from "@/hooks/useShown";
import { useBankStore } from "@/stores/useBankStore";
import { naira } from "@/utils/format";
import { colors, fonts, radius } from "@/utils/theme";

interface QuickProps {
  Icon: ComponentType<IconProps>;
  label: string;
  active?: boolean;
  onPress: () => void;
}
const Quick = ({ Icon, label, active = false, onPress }: QuickProps) => (
  <Press onPress={onPress} depth={0.9} style={styles.quick}>
    <View style={[styles.quickCircle, active && styles.quickOn]}>
      <Icon size={22} color={active ? "#0B0B0D" : colors.text} weight="fill" />
    </View>
    <Text style={styles.quickText}>{label}</Text>
  </Press>
);

type Sheet = null | "showPin" | "changePin";

export const Cards = () => {
  const insets = useSafeAreaInsets();
  const shown = useShown();
  const [frozen, setFrozen] = useState(false);
  const [online, setOnline] = useState(true);
  const [contactless, setContactless] = useState(true);
  const [atm, setAtm] = useState(true);
  const [abroad, setAbroad] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [pinShown, setPinShown] = useState(false);
  const [notice, setNotice] = useState("");

  const flip = useSharedValue(0);
  const sheen = useSharedValue(0);
  const ice = useSharedValue(0);
  const pin = useSharedValue(0);
  const timer = useSharedValue(1);
  const toast = useSharedValue(0);
  const limit = useSharedValue(0);

  useEffect(() => {
    sheen.value = withRepeat(withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.quad) }), -1, false);
  }, [sheen]);
  useEffect(() => {
    ice.value = withTiming(frozen ? 1 : 0, { duration: 420 });
  }, [frozen, ice]);
  useEffect(() => {
    limit.value = shown ? withDelay(450, withTiming(CARD_LIMIT.spent / CARD_LIMIT.limit, { duration: 900, easing: Easing.out(Easing.cubic) })) : 0;
  }, [shown, limit]);

  const autoFlip = useBankStore((s) => s.autoFlip);
  useEffect(() => {
    if (autoFlip) turn();
    // the cue is the only trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFlip]);

  const turn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRevealed((r) => !r);
    flip.value = withSpring(flip.value > 0.5 ? 0 : 1, { damping: 15, stiffness: 90 });
  };

  const say = (text: string) => {
    setNotice(text);
    toast.value = withSequence(withTiming(1, { duration: 180 }), withTiming(1, { duration: 1600 }), withTiming(0, { duration: 260 }));
  };

  // The PIN shows for ten seconds, with a bar that runs down, then hides itself.
  const showPin = () => {
    setPinShown(true);
    pin.value = withSpring(1, { damping: 14, stiffness: 160 });
    timer.value = 1;
    timer.value = withTiming(0, { duration: 10000, easing: Easing.linear });
    setTimeout(() => {
      pin.value = withTiming(0, { duration: 260 });
      setTimeout(() => setPinShown(false), 270);
    }, 10000);
  };

  const front = useAnimatedStyle(() => ({ opacity: flip.value < 0.5 ? 1 : 0, transform: [{ perspective: 1000 }, { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }] }));
  const back = useAnimatedStyle(() => ({ opacity: flip.value >= 0.5 ? 1 : 0, transform: [{ perspective: 1000 }, { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` }] }));
  const glare = useAnimatedStyle(() => ({ transform: [{ translateX: interpolate(sheen.value, [0, 1], [-200, 520]) }, { skewX: "-20deg" }] }));
  const frost = useAnimatedStyle(() => ({ opacity: ice.value }));
  const pinCard = useAnimatedStyle(() => ({ opacity: pin.value, transform: [{ scale: 0.94 + pin.value * 0.06 }] }));
  const pinBar = useAnimatedStyle(() => ({ width: `${timer.value * 100}%` }));
  const toastStyle = useAnimatedStyle(() => ({ opacity: toast.value, transform: [{ translateY: (1 - toast.value) * 12 }] }));
  const limitBar = useAnimatedStyle(() => ({ width: `${limit.value * 100}%` }));

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 40 }}>
        <Rise show={shown} delay={0} style={styles.head}>
          <Text style={styles.heading}>Cards</Text>
          <Press depth={0.94} style={styles.add}>
            <Text style={styles.addText}>Get a card</Text>
          </Press>
        </Rise>

        <Rise show={shown} delay={90} style={styles.stage}>
          <Pressable onPress={turn}>
            <Animated.View style={[styles.card, front]}>
              <LinearGradient colors={["#2B2B30", "#17171A", "#0E0E10"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fillAbs} />
              <View style={styles.band} />
              <View style={styles.glareClip}>
                <Animated.View style={[styles.glare, glare]} />
              </View>
              <View style={styles.cardTop}>
                <Image source={LOGO} style={styles.logo} resizeMode="contain" />
                <WifiHigh size={24} color={colors.text} weight="bold" style={styles.wave} />
              </View>
              <View style={styles.chip}>
                <View style={styles.chipLine} />
                <View style={[styles.chipLine, styles.chipLineV]} />
              </View>
              <Text style={styles.number}>••••  ••••  ••••  4821</Text>
              <View style={styles.cardFoot}>
                <Text style={styles.holder}>{USER.name}</Text>
                <Text style={styles.visa}>VISA</Text>
              </View>
              <Animated.View style={[styles.fillAbs, styles.frost, frost]} pointerEvents="none">
                <Snowflake size={34} color="#FFFFFF" weight="bold" />
                <Text style={styles.frostText}>Card frozen</Text>
              </Animated.View>
            </Animated.View>
            <Animated.View style={[styles.card, styles.cardBack, back]}>
              <LinearGradient colors={["#232327", "#151518"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fillAbs} />
              <LinearGradient colors={["#050505", "#1A1A1A", "#050505"]} style={styles.stripe} />
              <Text style={styles.tiny}>Authorised signature. Not valid unless signed.</Text>
              <View style={styles.signRow}>
                <View style={styles.sign}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <View key={i} style={styles.signLine} />
                  ))}
                  <Text style={styles.signature}>E. Eyamah</Text>
                </View>
                <View style={styles.cvv}>
                  <Text style={styles.cvvText}>318</Text>
                </View>
                <LinearGradient colors={["#9BE7FF", "#C6A8FF", "#FFD6A5", "#A8FFCE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hologram} />
              </View>
              <Text style={styles.backNumber}>4000 1287 6610 4821</Text>
              <View style={styles.backFoot}>
                <View>
                  <Text style={styles.backLabel}>VALID THRU</Text>
                  <Text style={styles.backValue}>09/29</Text>
                </View>
                <Text style={styles.legal}>This card is the property of the issuer and must be returned on request. If found, hand it in at any branch.</Text>
                <Image source={LOGO} style={styles.backLogo} resizeMode="contain" />
              </View>
            </Animated.View>
          </Pressable>
          <View style={styles.pager}>
            <View style={[styles.page, styles.pageOn]} />
            <View style={styles.page} />
          </View>
        </Rise>

        <Rise show={shown} delay={170} style={styles.quicks}>
          <Quick Icon={Eye} label={revealed ? "Hide details" : "Details"} active={revealed} onPress={turn} />
          <Quick Icon={Password} label="Show PIN" onPress={() => setSheet("showPin")} />
          <Quick
            Icon={Snowflake}
            label={frozen ? "Unfreeze" : "Freeze"}
            active={frozen}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setFrozen((f) => !f);
            }}
          />
          <Quick Icon={Sliders} label="Limits" onPress={() => say("Monthly limit is ₦500,000")} />
        </Rise>

        {pinShown && (
          <Animated.View style={[styles.pin, pinCard]}>
            <Text style={styles.pinLabel}>Your card PIN</Text>
            <View style={styles.pinDigits}>
              {CARD_PIN.split("").map((d, i) => (
                <View key={i} style={styles.pinBox}>
                  <Text style={styles.pinDigit}>{d}</Text>
                </View>
              ))}
            </View>
            <View style={styles.pinRail}>
              <Animated.View style={[styles.pinFill, pinBar]} />
            </View>
            <Text style={styles.pinNote}>Hides itself in 10 seconds. Never share it.</Text>
          </Animated.View>
        )}

        <Rise show={shown} delay={240} style={styles.limit}>
          <View style={styles.limitHead}>
            <Text style={styles.limitLabel}>Spent this month</Text>
            <Text style={styles.limitValue}>
              ₦{naira(CARD_LIMIT.spent, 0)} <Text style={styles.limitOf}>of ₦{naira(CARD_LIMIT.limit, 0)}</Text>
            </Text>
          </View>
          <View style={styles.rail}>
            <Animated.View style={[styles.railFill, limitBar]} />
          </View>
        </Rise>

        <Rise show={shown} delay={310}>
          <Text style={styles.label}>Security</Text>
          <View style={styles.list}>
            <ListRow Icon={LockKey} title="Change card PIN" onPress={() => setSheet("changePin")} />
            <ListRow Icon={ShoppingBag} title="Online payments" right={<Toggle value={online} onChange={setOnline} />} />
            <ListRow Icon={ContactlessPayment} title="Contactless" right={<Toggle value={contactless} onChange={setContactless} />} />
            <ListRow Icon={Cash} title="ATM withdrawals" right={<Toggle value={atm} onChange={setAtm} />} />
            <ListRow Icon={Globe} title="Use abroad" right={<Toggle value={abroad} onChange={setAbroad} />} last />
          </View>
        </Rise>

        <Rise show={shown} delay={380}>
          <Text style={styles.label}>Manage</Text>
          <View style={styles.list}>
            <Press depth={0.985} style={styles.wallet}>
              <Avatar brand="apple" size={40} />
              <Text style={styles.walletText}>Add to Apple Wallet</Text>
            </Press>
            <View style={styles.hair} />
            <ListRow Icon={ArrowsCounterClockwise} title="Replace this card" note="New card, same account" />
            <ListRow Icon={WarningOctagon} title="Report lost or stolen" note="Blocks the card at once" last />
          </View>
        </Rise>
      </ScrollView>

      <Animated.View style={[styles.toast, { bottom: 18 }, toastStyle]} pointerEvents="none">
        <Text style={styles.toastText}>{notice}</Text>
      </Animated.View>

      <PinSheet
        open={sheet === "showPin"}
        steps={["Confirm it is you"]}
        note="Enter your app PIN or use Face ID to see your card PIN."
        onClose={() => setSheet(null)}
        onDone={() => {
          setSheet(null);
          showPin();
        }}
      />
      <PinSheet
        open={sheet === "changePin"}
        steps={["Enter your current PIN", "Choose a new PIN", "Enter the new PIN again"]}
        onClose={() => setSheet(null)}
        onDone={() => {
          setSheet(null);
          say("Card PIN changed");
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 20 },
  heading: { fontFamily: fonts.bold, fontSize: 32, letterSpacing: -1.1, color: colors.text },
  add: { height: 36, paddingHorizontal: 15, borderRadius: 18, backgroundColor: colors.surface, justifyContent: "center" },
  addText: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.text },
  stage: { marginHorizontal: 20, marginTop: 20 },
  fillAbs: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  card: { height: 228, borderRadius: 22, overflow: "hidden", padding: 22, backfaceVisibility: "hidden" },
  cardBack: { position: "absolute", left: 0, right: 0, top: 0, padding: 0 },
  band: { position: "absolute", left: 0, right: 0, bottom: 0, height: 6, backgroundColor: colors.accent },
  glareClip: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, overflow: "hidden" },
  glare: { position: "absolute", top: -20, bottom: -20, width: 110, backgroundColor: "rgba(255,255,255,0.06)" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logo: { width: 106, height: 26 },
  wave: { transform: [{ rotate: "90deg" }] },
  chip: { width: 44, height: 33, borderRadius: 7, backgroundColor: "#C9A46A", marginTop: 26, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  chipLine: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "rgba(0,0,0,0.25)" },
  chipLineV: { left: undefined, right: undefined, top: 0, bottom: 0, width: 1, height: undefined },
  number: { fontFamily: fonts.medium, fontSize: 19, letterSpacing: 1, color: colors.text, marginTop: 18, fontVariant: ["tabular-nums"] },
  cardFoot: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 20 },
  holder: { fontFamily: fonts.medium, fontSize: 14.5, color: colors.soft },
  visa: { fontFamily: fonts.bold, fontSize: 24, fontStyle: "italic", color: colors.text, letterSpacing: -0.5 },
  frost: { backgroundColor: "rgba(70,110,150,0.86)", alignItems: "center", justifyContent: "center", gap: 8 },
  frostText: { fontFamily: fonts.semibold, fontSize: 15, color: "#FFFFFF" },
  stripe: { marginTop: 22, height: 40 },
  tiny: { fontFamily: fonts.regular, fontSize: 7.5, color: colors.muted, marginTop: 12, marginLeft: 20 },
  signRow: { flexDirection: "row", alignItems: "center", marginTop: 4, paddingHorizontal: 20 },
  sign: { flex: 1, height: 34, backgroundColor: "#ECE9E2", justifyContent: "space-evenly", overflow: "hidden" },
  signLine: { height: 1, backgroundColor: "rgba(40,60,140,0.18)" },
  signature: { position: "absolute", left: 12, top: 4, fontFamily: fonts.medium, fontStyle: "italic", fontSize: 17, color: "#1B2A6B", transform: [{ rotate: "-4deg" }] },
  cvv: { width: 52, height: 34, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  cvvText: { fontFamily: fonts.semibold, fontStyle: "italic", fontSize: 15, color: "#111", fontVariant: ["tabular-nums"] },
  hologram: { width: 44, height: 34, borderRadius: 6, marginLeft: 14, opacity: 0.9 },
  backFoot: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 20, marginTop: 10, gap: 12 },
  legal: { flex: 1, fontFamily: fonts.regular, fontSize: 7, lineHeight: 9.5, color: colors.faint },
  backLogo: { width: 62, height: 15, opacity: 0.9 },
  backLabel: { fontFamily: fonts.medium, fontSize: 7.5, letterSpacing: 0.6, color: colors.muted },
  backNumber: { fontFamily: fonts.medium, fontSize: 18, letterSpacing: 1.6, color: colors.text, marginTop: 16, marginLeft: 20, fontVariant: ["tabular-nums"] },
  backValue: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, marginTop: 2, fontVariant: ["tabular-nums"] },
  pager: { flexDirection: "row", gap: 6, alignSelf: "center", marginTop: 14 },
  page: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.raised },
  pageOn: { width: 18, backgroundColor: colors.text },
  quicks: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 26, marginTop: 20 },
  quick: { alignItems: "center", width: 72 },
  quickCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  quickOn: { backgroundColor: colors.text },
  quickText: { fontFamily: fonts.medium, fontSize: 12, color: colors.text, marginTop: 8 },
  pin: { marginHorizontal: 16, marginTop: 18, borderRadius: radius.lg, backgroundColor: colors.surface, padding: 18, alignItems: "center" },
  pinLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },
  pinDigits: { flexDirection: "row", gap: 10, marginTop: 12 },
  pinBox: { width: 54, height: 64, borderRadius: 14, backgroundColor: colors.raised, alignItems: "center", justifyContent: "center" },
  pinDigit: { fontFamily: fonts.bold, fontSize: 30, color: colors.text, fontVariant: ["tabular-nums"] },
  pinRail: { alignSelf: "stretch", height: 3, borderRadius: 2, backgroundColor: colors.raised, marginTop: 16, overflow: "hidden" },
  pinFill: { height: 3, borderRadius: 2, backgroundColor: colors.accent },
  pinNote: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted, marginTop: 10 },
  limit: { marginHorizontal: 16, marginTop: 18, borderRadius: radius.lg, backgroundColor: colors.surface, padding: 16 },
  limitHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  limitLabel: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.muted },
  limitValue: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text, fontVariant: ["tabular-nums"] },
  limitOf: { fontFamily: fonts.regular, color: colors.muted },
  rail: { height: 6, borderRadius: 3, backgroundColor: colors.raised, marginTop: 12, overflow: "hidden" },
  railFill: { height: 6, borderRadius: 3, backgroundColor: colors.accent },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted, marginTop: 24, marginBottom: 10, marginHorizontal: 20 },
  list: { marginHorizontal: 16, borderRadius: radius.lg, backgroundColor: colors.surface, overflow: "hidden" },
  wallet: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, height: 64 },
  walletText: { fontFamily: fonts.medium, fontSize: 15.5, color: colors.text },
  hair: { height: StyleSheet.hairlineWidth, backgroundColor: colors.lineStrong, marginLeft: 68 },
  toast: { position: "absolute", alignSelf: "center", height: 42, paddingHorizontal: 18, borderRadius: 21, backgroundColor: colors.text, justifyContent: "center" },
  toastText: { fontFamily: fonts.medium, fontSize: 14, color: "#0B0B0D" },
});
