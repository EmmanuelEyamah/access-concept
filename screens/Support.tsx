import { CaretRight, ChatCircle, Flag, IdentificationBadge, Phone, Question } from "phosphor-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Rise } from "@/components/Rise";
import { ListRow } from "@/components/ui/ListRow";
import { Press } from "@/components/ui/Press";
import { TopBar } from "@/components/ui/TopBar";
import { colors, fonts, radius } from "@/utils/theme";

/** The real support page is six equal rows. Here the fastest route, chat, is the one that leads. */
export const Support = () => (
  <View style={styles.screen}>
    <TopBar title="Help" />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Rise show delay={40}>
        <Text style={styles.heading}>How can we help?</Text>
      </Rise>

      <Rise show delay={120}>
        <Press depth={0.97} style={styles.chat}>
          <View style={styles.chatIcon}>
            <ChatCircle size={24} color="#FFFFFF" weight="fill" />
          </View>
          <View style={styles.chatWords}>
            <Text style={styles.chatTitle}>Chat with us</Text>
            <Text style={styles.chatNote}>Usually answers in 2 minutes</Text>
          </View>
          <CaretRight size={18} color="#FFFFFF" weight="bold" />
        </Press>
      </Rise>

      <Rise show delay={200} style={styles.list}>
        <ListRow Icon={IdentificationBadge} title="Your account officer" note="Ngozi replies within the hour" />
        <ListRow Icon={Flag} title="Report a problem" note="A failed transfer, a wrong debit, a card issue" />
        <ListRow Icon={Question} title="Common questions" />
        <ListRow Icon={Phone} title="Call us" note="Open all day, every day" last />
      </Rise>
      <Text style={styles.version}>Concept build. Not the Access Bank app.</Text>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 50 },
  heading: { fontFamily: fonts.bold, fontSize: 28, letterSpacing: -0.9, color: colors.text, marginHorizontal: 4 },
  chat: { flexDirection: "row", alignItems: "center", marginTop: 20, borderRadius: radius.lg, backgroundColor: colors.accent, padding: 16 },
  chatIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  chatWords: { flex: 1, marginLeft: 14 },
  chatTitle: { fontFamily: fonts.semibold, fontSize: 17, color: "#FFFFFF" },
  chatNote: { fontFamily: fonts.regular, fontSize: 13.5, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  list: { marginTop: 12, borderRadius: radius.lg, backgroundColor: colors.surface, overflow: "hidden" },
  version: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.faint, textAlign: "center", marginTop: 22 },
});
