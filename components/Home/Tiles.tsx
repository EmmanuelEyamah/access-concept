import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { Money } from "@/components/ui/Money";
import { MONTH_IN, MONTH_OUT, WEEK_SPEND } from "@/constants/data";
import { colors, fonts, radius } from "@/utils/theme";

const PEAK = Math.max(...WEEK_SPEND);

interface BarProps {
  amount: number;
  index: number;
  show: boolean;
}
const Bar = ({ amount, index, show }: BarProps) => {
  const grow = useSharedValue(0);
  useEffect(() => {
    grow.value = show ? withDelay(380 + index * 55, withSpring(1, { damping: 14, stiffness: 130 })) : withTiming(0, { duration: 140 });
  }, [show, index, grow]);
  const style = useAnimatedStyle(() => ({ height: Math.max(4, (amount / PEAK) * 44 * grow.value) }));
  return <Animated.View style={[styles.bar, amount === PEAK && styles.barPeak, style]} />;
};

interface TilesProps {
  show: boolean;
  hidden: boolean;
}

/** Two figures side by side, the way the best banking apps summarise a month. */
export const Tiles = ({ show, hidden }: TilesProps) => (
  <View style={styles.row}>
    <View style={styles.tile}>
      <Text style={styles.label}>Spent this month</Text>
      <Money value={MONTH_OUT} size={20} hidden={hidden} style={styles.value} />
      <View style={styles.chart}>
        {WEEK_SPEND.map((amount, i) => (
          <Bar key={i} amount={amount} index={i} show={show} />
        ))}
      </View>
    </View>
    <View style={styles.tile}>
      <Text style={styles.label}>Money in</Text>
      <Money value={MONTH_IN} size={20} hidden={hidden} color={colors.good} style={styles.value} />
      <Text style={styles.note}>₦75,000 more than October</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, marginHorizontal: 16 },
  tile: { flex: 1, height: 142, borderRadius: radius.lg, backgroundColor: colors.surface, padding: 16 },
  label: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  value: { marginTop: 6 },
  chart: { flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 5, marginTop: 8 },
  bar: { flex: 1, borderRadius: 4, backgroundColor: colors.raised },
  barPeak: { backgroundColor: colors.accent },
  note: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted, marginTop: "auto", lineHeight: 17 },
});
