import { Image, StyleSheet, Text, View } from "react-native";
import { BRANDS, PEOPLE, type BrandKey, type PersonKey } from "@/constants/assets";
import { initials } from "@/utils/format";
import { colors, fonts } from "@/utils/theme";

interface AvatarProps {
  person?: PersonKey;
  brand?: BrandKey;
  /** Shown as initials when there is neither a photo nor a logo. */
  name?: string;
  /** A small bank logo pinned to the corner of a person's photo. */
  badge?: BrandKey;
  size?: number;
}

/** A person's photo (round) or a company's logo (rounded square). */
export const Avatar = ({ person, brand, name, badge, size = 44 }: AvatarProps) => {
  const round = !brand;
  const mark = brand === "access";
  return (
    <View style={{ width: size, height: size }}>
      <View style={[styles.clip, { width: size, height: size, borderRadius: round ? size / 2 : size * 0.28 }, !round && (mark ? styles.dark : styles.light)]}>
        {person && <Image source={PEOPLE[person]} style={styles.fill} />}
        {!person && !brand && name && <Text style={[styles.initials, { fontSize: size * 0.36, lineHeight: size }]}>{initials(name)}</Text>}
        {brand && <Image source={BRANDS[brand]} style={mark ? styles.inset : styles.fill} resizeMode="contain" />}
      </View>
      {badge && (
        <View style={[styles.badge, { width: size * 0.42, height: size * 0.42, borderRadius: size * 0.13 }, badge === "access" ? styles.dark : styles.light]}>
          <Image source={BRANDS[badge]} style={badge === "access" ? styles.inset : styles.fill} resizeMode="contain" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  clip: { overflow: "hidden", backgroundColor: colors.raised },
  light: { backgroundColor: "#FFFFFF" },
  dark: { backgroundColor: "#1F1F23" },
  fill: { width: "100%", height: "100%" },
  initials: { fontFamily: fonts.semibold, color: colors.soft, textAlign: "center" },
  inset: { width: "64%", height: "64%", alignSelf: "center", marginTop: "18%" },
  badge: { position: "absolute", right: -3, bottom: -3, overflow: "hidden", borderWidth: 2, borderColor: colors.bg },
});
