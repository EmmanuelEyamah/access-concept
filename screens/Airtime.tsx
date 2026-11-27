import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { AddressBook } from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Rise } from "@/components/Rise";
import { PinSheet } from "@/components/ui/PinSheet";
import { Press } from "@/components/ui/Press";
import { TopBar } from "@/components/ui/TopBar";
import { BRANDS, type BrandKey } from "@/constants/assets";
import { AIRTIME_AMOUNTS, MY_NUMBER, NETWORKS } from "@/constants/data";
import { naira } from "@/utils/format";
import { useBankStore } from "@/stores/useBankStore";
import { colors, fonts, radius } from "@/utils/theme";

type Network = (typeof NETWORKS)[number];

/** Works out the network from the first four digits. A hint only: numbers can be ported. */
const detect = (phone: string): Network | null => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return null;
  return NETWORKS.find((n) => n.prefixes.includes(digits.slice(0, 4))) ?? null;
};

const pretty = (digits: string) => digits.replace(/^(\d{4})(\d{0,3})(\d{0,4}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));

interface LogoProps {
  brand: BrandKey;
  size: number;
}
// Every network logo sits in the same white disc, so four very different marks read as one set.
const Logo = ({ brand, size }: LogoProps) => (
  <View style={[styles.logo, { width: size, height: size, borderRadius: size / 2 }]}>
    <Image source={BRANDS[brand]} style={styles.logoImage} resizeMode="contain" />
  </View>
);

interface ChoiceProps {
  network: Network;
  active: boolean;
  onPress: () => void;
}
const Choice = ({ network, active, onPress }: ChoiceProps) => {
  const on = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    on.value = withSpring(active ? 1 : 0, { damping: 15, stiffness: 220 });
  }, [active, on]);
  const ring = useAnimatedStyle(() => ({ borderColor: interpolateColor(on.value, [0, 1], ["rgba(255,255,255,0)", colors.accent]), transform: [{ scale: 1 + on.value * 0.06 }] }));
  const text = useAnimatedStyle(() => ({ color: interpolateColor(on.value, [0, 1], [colors.muted, colors.text]) }));
  return (
    <Pressable style={styles.choice} onPress={onPress}>
      <Animated.View style={[styles.ring, ring]}>
        <Logo brand={network.brand} size={46} />
      </Animated.View>
      <Animated.Text style={[styles.choiceText, text]}>{network.name}</Animated.Text>
    </Pressable>
  );
};

interface AmountProps {
  value: number;
  active: boolean;
  onPress: () => void;
}
const Amount = ({ value, active, onPress }: AmountProps) => {
  const on = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    on.value = withTiming(active ? 1 : 0, { duration: 200 });
  }, [active, on]);
  const box = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(on.value, [0, 1], [colors.surface, colors.text]) }));
  const text = useAnimatedStyle(() => ({ color: interpolateColor(on.value, [0, 1], [colors.text, "#0B0B0D"]) }));
  return (
    <Pressable style={styles.amountSlot} onPress={onPress}>
      <Animated.View style={[styles.amount, box]}>
        <Animated.Text style={[styles.amountText, text]}>₦{naira(value, 0)}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

/** Buy airtime. Type the number and the network picks itself; you can still change it by hand. */
export const Airtime = () => {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState(MY_NUMBER);
  const [network, setNetwork] = useState<Network>(detect(MY_NUMBER) ?? NETWORKS[0]);
  const [amount, setAmount] = useState<number>(1000);
  const [pin, setPin] = useState(false);
  const pay = useBankStore((s) => s.pay);
  const manual = useRef(false);
  const pop = useSharedValue(1);

  const digits = phone.replace(/\D/g, "");
  const found = detect(phone);
  const ready = digits.length === 11 && amount > 0;

  // Typing a new prefix moves the selection, unless the user has just chosen a network by hand for this number.
  useEffect(() => {
    if (!found || manual.current) return;
    if (found.name !== network.name) {
      setNetwork(found);
      Haptics.selectionAsync();
      pop.value = withSequence(withTiming(1.18, { duration: 110 }), withSpring(1, { damping: 8, stiffness: 240 }));
    }
  }, [found, network.name, pop]);

  const type = (text: string) => {
    manual.current = false;
    setPhone(pretty(text.replace(/\D/g, "").slice(0, 11)));
  };

  const badge = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <View style={[styles.screen, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
      <TopBar title="Airtime" />
      <View style={styles.content}>
        <Rise show delay={40}>
          <Text style={styles.label}>Phone number</Text>
          <View style={styles.field}>
            <Animated.View style={badge}>
              <Logo brand={network.brand} size={38} />
            </Animated.View>
            <TextInput value={phone} onChangeText={type} keyboardType="number-pad" placeholder="0803 000 0000" placeholderTextColor={colors.faint} style={styles.phone} selectionColor={colors.accent} />
            <Pressable hitSlop={10} onPress={() => type(MY_NUMBER)}>
              <AddressBook size={24} color={colors.text} weight="fill" />
            </Pressable>
          </View>
          <Text style={styles.hint}>{digits.length < 4 ? "Type a number and we will find the network" : found ? `${found.name} number${phone === MY_NUMBER ? " · yours" : ""}` : "We do not recognise that prefix. Choose the network below."}</Text>
        </Rise>

        <Rise show delay={120}>
          <Text style={styles.label}>Network</Text>
          <View style={styles.choices}>
            {NETWORKS.map((n) => (
              <Choice
                key={n.name}
                network={n}
                active={n.name === network.name}
                onPress={() => {
                  Haptics.selectionAsync();
                  manual.current = true;
                  setNetwork(n);
                }}
              />
            ))}
          </View>
        </Rise>

        <Rise show delay={200}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amounts}>
            {AIRTIME_AMOUNTS.map((a) => (
              <Amount
                key={a}
                value={a}
                active={a === amount}
                onPress={() => {
                  Haptics.selectionAsync();
                  setAmount(a);
                }}
              />
            ))}
          </View>
        </Rise>
      </View>

      <Press onPress={() => setPin(true)} disabled={!ready} depth={0.97} style={[styles.cta, !ready && styles.ctaOff]}>
        <Text style={styles.ctaText}>Pay ₦{naira(amount, 0)}</Text>
      </Press>

      <PinSheet
        open={pin}
        steps={["Enter your PIN"]}
        note={`₦${naira(amount, 0)} ${network.name} airtime for ${phone}`}
        onClose={() => setPin(false)}
        onDone={() => {
          setPin(false);
          const id = pay({ title: network.name, note: `Airtime for ${phone}`, amount, category: "airtime", brand: network.brand });
          router.replace({ pathname: "/done", params: { title: "Airtime sent", amount: String(amount), line: `${network.name} · ${phone}`, id } });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted, marginTop: 22, marginBottom: 10, marginLeft: 4 },
  logo: { backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  logoImage: { width: "68%", height: "68%" },
  field: { flexDirection: "row", alignItems: "center", gap: 12, height: 64, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: 14 },
  phone: { flex: 1, fontFamily: fonts.semibold, fontSize: 20, letterSpacing: 0.6, color: colors.text, fontVariant: ["tabular-nums"] },
  hint: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted, marginTop: 8, marginLeft: 4 },
  choices: { flexDirection: "row", justifyContent: "space-between", borderRadius: radius.lg, backgroundColor: colors.surface, paddingVertical: 16, paddingHorizontal: 12 },
  choice: { flex: 1, alignItems: "center" },
  ring: { padding: 3, borderRadius: 30, borderWidth: 2 },
  choiceText: { fontFamily: fonts.medium, fontSize: 12.5, marginTop: 8 },
  amounts: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5 },
  amountSlot: { width: "33.333%", padding: 5 },
  amount: { height: 58, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  amountText: { fontFamily: fonts.semibold, fontSize: 16, fontVariant: ["tabular-nums"] },
  cta: { marginHorizontal: 20, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  ctaOff: { opacity: 0.4 },
  ctaText: { fontFamily: fonts.semibold, fontSize: 16.5, color: "#FFFFFF" },
});
