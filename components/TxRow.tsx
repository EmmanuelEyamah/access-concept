import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Money } from "@/components/ui/Money";
import type { Transaction } from "@/types/bank";
import { colors, fonts } from "@/utils/theme";

interface TxRowProps {
  tx: Transaction;
  hidden?: boolean;
  last?: boolean;
}

export const TxRow = ({ tx, hidden = false, last = false }: TxRowProps) => {
  const incoming = tx.kind === "in";
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={() => router.push({ pathname: "/tx/[id]", params: { id: tx.id } })}>
      <Avatar person={tx.person} brand={tx.brand} name={tx.title} size={42} />
      <View style={[styles.body, !last && styles.rule]}>
        <View style={styles.words}>
          <Text style={styles.title} numberOfLines={1}>
            {tx.title}
          </Text>
          <Text style={styles.note} numberOfLines={1}>
            {tx.time} · {tx.note}
          </Text>
        </View>
        <Money value={tx.amount} size={15} weight="semibold" sign={incoming ? "+" : "-"} color={incoming ? colors.good : colors.text} hidden={hidden} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingLeft: 16 },
  pressed: { backgroundColor: colors.raised },
  body: { flex: 1, flexDirection: "row", alignItems: "center", marginLeft: 12, paddingVertical: 14, paddingRight: 16 },
  rule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineStrong },
  words: { flex: 1, marginRight: 10 },
  title: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  note: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted, marginTop: 2 },
});
