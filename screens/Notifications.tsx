import { ArrowDownLeft, CreditCard, ShieldCheck, Tag, type IconProps } from "phosphor-react-native";
import type { ComponentType } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Rise } from "@/components/Rise";
import { Avatar } from "@/components/ui/Avatar";
import { TopBar } from "@/components/ui/TopBar";
import { NOTICES } from "@/constants/data";
import { colors, fonts, radius } from "@/utils/theme";

const ICONS: Record<(typeof NOTICES)[number]["kind"], ComponentType<IconProps>> = { money: ArrowDownLeft, security: ShieldCheck, card: CreditCard, offer: Tag };

export const Notifications = () => (
  <View style={styles.screen}>
    <TopBar title="Notifications" />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {(["Today", "Earlier"] as const).map((group, g) => {
        const items = NOTICES.filter((n) => n.group === group);
        return (
          <Rise key={group} show delay={40 + g * 110}>
            <Text style={styles.label}>{group}</Text>
            <View style={styles.list}>
              {items.map((n, i) => {
                const Icon = ICONS[n.kind];
                return (
                  <View key={n.id} style={styles.row}>
                    {n.brand ? (
                      <Avatar brand={n.brand} size={42} />
                    ) : (
                      <View style={styles.icon}>
                        <Icon size={20} color={n.kind === "money" ? colors.good : colors.text} weight="fill" />
                      </View>
                    )}
                    <View style={[styles.body, i < items.length - 1 && styles.rule]}>
                      <View style={styles.words}>
                        <Text style={styles.title}>{n.title}</Text>
                        <Text style={styles.text}>{n.body}</Text>
                      </View>
                      <View style={styles.meta}>
                        <Text style={styles.time}>{n.time}</Text>
                        {n.unread && <View style={styles.dot} />}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </Rise>
        );
      })}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, paddingBottom: 50 },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted, marginTop: 22, marginBottom: 10, marginLeft: 4 },
  list: { borderRadius: radius.lg, backgroundColor: colors.surface, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingLeft: 14 },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.raised, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, flexDirection: "row", marginLeft: 12, paddingVertical: 14, paddingRight: 14 },
  rule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineStrong },
  words: { flex: 1, marginRight: 10 },
  title: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  text: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 3, lineHeight: 18 },
  meta: { alignItems: "flex-end", gap: 8 },
  time: { fontFamily: fonts.regular, fontSize: 12, color: colors.faint },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
});
