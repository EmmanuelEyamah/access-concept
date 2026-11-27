import { router } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Press } from "@/components/ui/Press";
import { colors, fonts } from "@/utils/theme";

interface TopBarProps {
  title: string;
  /** 1-based step in a flow of `steps`: draws the progress bar. */
  step?: number;
  steps?: number;
  right?: ReactNode;
  onBack?: () => void;
}

export const TopBar = ({ title, step, steps = 3, right, onBack }: TopBarProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 12 }}>
      <View style={styles.bar}>
        <Press onPress={onBack ?? (() => router.back())} style={styles.back}>
          <CaretLeft size={20} color={colors.text} weight="bold" />
        </Press>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.right}>{right}</View>
      </View>
      {step && (
        <View style={styles.steps}>
          {Array.from({ length: steps }, (_, i) => (
            <View key={i} style={[styles.step, i < step && styles.stepOn]} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, height: 48 },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center", fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  right: { width: 40, alignItems: "flex-end" },
  steps: { flexDirection: "row", gap: 5, paddingHorizontal: 20, marginTop: 4 },
  step: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.raised },
  stepOn: { backgroundColor: colors.accent },
});
