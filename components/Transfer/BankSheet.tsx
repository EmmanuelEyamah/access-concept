import { Check, MagnifyingGlass } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui/Avatar";
import type { BrandKey } from "@/constants/assets";
import { BANKS } from "@/constants/data";
import { colors, fonts, radius } from "@/utils/theme";

interface BankSheetProps {
  open: boolean;
  value: string | null;
  onPick: (bank: { name: string; brand: BrandKey }) => void;
  onClose: () => void;
}

/** Searchable list of banks, each with its real logo. */
export const BankSheet = ({ open, value, onPick, onClose }: BankSheetProps) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const t = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setQuery("");
      t.value = withSpring(1, { damping: 20, stiffness: 180 });
    }
  }, [open, t]);

  const close = (then: () => void) => {
    t.value = withTiming(0, { duration: 220 });
    setTimeout(then, 210);
  };

  const list = BANKS.filter((b) => b.name.toLowerCase().includes(query.trim().toLowerCase()));
  const backdrop = useAnimatedStyle(() => ({ opacity: Math.min(1, t.value) * 0.6 }));
  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - t.value) * 800 }] }));

  return (
    <Modal visible={open} transparent animationType="none" statusBarTranslucent onRequestClose={() => close(onClose)}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdrop]} />
      <Pressable style={StyleSheet.absoluteFill} onPress={() => close(onClose)} />
      <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }, sheet]}>
        <View style={styles.grab} />
        <Text style={styles.title}>Choose a bank</Text>
        <View style={styles.search}>
          <MagnifyingGlass size={18} color={colors.muted} weight="bold" />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search banks" placeholderTextColor={colors.faint} style={styles.input} selectionColor={colors.accent} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={styles.list}>
          {list.map((b) => (
            <Pressable key={b.name} style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={() => close(() => onPick(b))}>
              <Avatar brand={b.brand} size={40} />
              <Text style={styles.name}>{b.name}</Text>
              {value === b.name && <Check size={18} color={colors.accent} weight="bold" />}
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "#000" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, height: "72%", backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingTop: 8 },
  grab: { alignSelf: "center", width: 36, height: 5, borderRadius: 3, backgroundColor: colors.lineStrong },
  title: { fontFamily: fonts.bold, fontSize: 22, letterSpacing: -0.5, color: colors.text, marginTop: 18, marginHorizontal: 20 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 46, borderRadius: 14, backgroundColor: colors.raised, paddingHorizontal: 14, marginHorizontal: 16, marginTop: 14 },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 16, color: colors.text },
  list: { marginTop: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 11, paddingHorizontal: 20 },
  pressed: { backgroundColor: colors.raised },
  name: { flex: 1, fontFamily: fonts.medium, fontSize: 16, color: colors.text },
});
