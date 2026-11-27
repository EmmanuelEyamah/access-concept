import * as Haptics from "expo-haptics";
import { Backspace, ScanSmiley, X } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTOPILOT } from "@/constants/data";
import { colors, fonts, radius } from "@/utils/theme";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "face", "0", "back"] as const;

interface DotProps {
  filled: boolean;
}
const Dot = ({ filled }: DotProps) => {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = filled ? withSequence(withTiming(1.5, { duration: 80 }), withSpring(1, { damping: 8, stiffness: 260 })) : withTiming(0, { duration: 120 });
  }, [filled, t]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: 0.55 + Math.min(1, t.value) * 0.45 + Math.max(0, t.value - 1) * 0.4 }], backgroundColor: t.value > 0.2 ? colors.accent : colors.raised }));
  return <Animated.View style={[styles.dot, style]} />;
};

interface PinSheetProps {
  open: boolean;
  /** One title per PIN to collect: a single entry confirms, three entries change a PIN. */
  steps: string[];
  note?: string;
  onClose: () => void;
  onDone: () => void;
}

/** A four-digit PIN pad that slides up from the bottom. Used to confirm payments and to guard card details. */
export const PinSheet = ({ open, steps, note, onClose, onDone }: PinSheetProps) => {
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState("");
  const [step, setStep] = useState(0);
  const t = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setPin("");
      setStep(0);
      t.value = withSpring(1, { damping: 20, stiffness: 180 });
    }
  }, [open, t]);

  // Autopilot only: the four digits type themselves so a hands-free demo can pass the PIN.
  useEffect(() => {
    if (!AUTOPILOT || !open) return;
    const timers = [1, 2, 3, 4].map((n) => setTimeout(() => setPin("1234".slice(0, n)), 500 + n * 190));
    const done = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      t.value = withTiming(0, { duration: 220 });
      setTimeout(onDone, 210);
    }, 1600);
    return () => [...timers, done].forEach(clearTimeout);
    // runs once per opening
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = (then: () => void) => {
    t.value = withTiming(0, { duration: 220 });
    setTimeout(then, 210);
  };

  const advance = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (step < steps.length - 1) {
      setTimeout(() => {
        setPin("");
        setStep((s) => s + 1);
      }, 220);
    } else {
      setTimeout(() => close(onDone), 260);
    }
  };

  const press = (key: (typeof KEYS)[number]) => {
    Haptics.selectionAsync();
    if (key === "face") return advance();
    if (key === "back") return setPin((p) => p.slice(0, -1));
    if (pin.length >= 4) return;
    const next = pin + key;
    setPin(next);
    if (next.length === 4) advance();
  };

  const backdrop = useAnimatedStyle(() => ({ opacity: Math.min(1, t.value) * 0.6 }));
  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - t.value) * 700 }] }));

  return (
    <Modal visible={open} transparent animationType="none" statusBarTranslucent onRequestClose={() => close(onClose)}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdrop]} />
      <Pressable style={StyleSheet.absoluteFill} onPress={() => close(onClose)} />
      <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 6 }, sheet]}>
        <View style={styles.grab} />
        <Pressable style={styles.close} onPress={() => close(onClose)} hitSlop={10}>
          <X size={16} color={colors.text} weight="bold" />
        </Pressable>
        <Text style={styles.title}>{steps[step]}</Text>
        {note && <Text style={styles.note}>{note}</Text>}
        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <Dot key={`${step}-${i}`} filled={i < pin.length} />
          ))}
        </View>
        <View style={styles.pad}>
          {KEYS.map((k) => (
            <Pressable key={k} style={({ pressed }) => [styles.key, pressed && styles.keyDown]} onPress={() => press(k)}>
              {k === "face" ? <ScanSmiley size={28} color={colors.accent} weight="bold" /> : k === "back" ? <Backspace size={26} color={colors.text} /> : <Text style={styles.keyText}>{k}</Text>}
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "#000" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingTop: 8, alignItems: "center" },
  grab: { width: 36, height: 5, borderRadius: 3, backgroundColor: colors.lineStrong },
  close: { position: "absolute", right: 16, top: 18, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.raised, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.bold, fontSize: 21, letterSpacing: -0.5, color: colors.text, marginTop: 26 },
  note: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 6, textAlign: "center", paddingHorizontal: 40 },
  dots: { flexDirection: "row", gap: 16, marginTop: 24, marginBottom: 18 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  pad: { flexDirection: "row", flexWrap: "wrap", width: "100%", paddingHorizontal: 30 },
  key: { width: "33.333%", height: 68, alignItems: "center", justifyContent: "center", borderRadius: 34 },
  keyDown: { backgroundColor: colors.raised },
  keyText: { fontFamily: fonts.medium, fontSize: 28, color: colors.text },
});
