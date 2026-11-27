import { CaretRight, type IconProps } from "phosphor-react-native";
import type { ComponentType, ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Press } from "@/components/ui/Press";
import { colors, fonts } from "@/utils/theme";

interface ListRowProps {
  Icon: ComponentType<IconProps>;
  title: string;
  note?: string;
  right?: ReactNode;
  onPress?: () => void;
  last?: boolean;
}

/** A settings-style row: round icon, title, optional note, and a chevron or a control on the right. */
export const ListRow = ({ Icon, title, note, right, onPress, last = false }: ListRowProps) => (
  <Press onPress={onPress} depth={0.985} haptic={!!onPress} style={styles.row}>
    <View style={styles.icon}>
      <Icon size={20} color={colors.text} weight="fill" />
    </View>
    <View style={[styles.body, !last && styles.rule]}>
      <View style={styles.words}>
        <Text style={styles.title}>{title}</Text>
        {note && <Text style={styles.note}>{note}</Text>}
      </View>
      {right ?? <CaretRight size={16} color={colors.faint} weight="bold" />}
    </View>
  </Press>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingLeft: 16 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.raised, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, flexDirection: "row", alignItems: "center", marginLeft: 12, paddingVertical: 14, paddingRight: 16, minHeight: 62 },
  rule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineStrong },
  words: { flex: 1 },
  title: { fontFamily: fonts.medium, fontSize: 15.5, color: colors.text },
  note: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted, marginTop: 2 },
});
