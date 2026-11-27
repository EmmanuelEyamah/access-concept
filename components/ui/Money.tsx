import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";
import { naira } from "@/utils/format";
import { fonts } from "@/utils/theme";

interface MoneyProps {
  value: number;
  size?: number;
  color?: string;
  hidden?: boolean;
  sign?: "+" | "-" | "";
  weight?: "bold" | "semibold" | "medium";
  style?: StyleProp<TextStyle>;
}

/** An amount in naira: the kobo are set smaller so the figure that matters reads first. */
export const Money = ({ value, size = 16, color = "#FFFFFF", hidden = false, sign = "", weight = "bold", style }: MoneyProps) => {
  const [whole, kobo] = naira(value).split(".");
  return (
    <Text style={[styles.text, { fontFamily: fonts[weight], fontSize: size, color, letterSpacing: -size * 0.035 }, style]} numberOfLines={1}>
      {sign}₦{hidden ? "••••••" : whole}
      {!hidden && <Text style={{ fontSize: size * 0.55, color, opacity: 0.55, letterSpacing: 0 }}>.{kobo}</Text>}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: { fontVariant: ["tabular-nums"] },
});
