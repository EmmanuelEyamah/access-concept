import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowUpRight, Bell, Copy, DotsThree, Eye, EyeSlash, MagnifyingGlass, Plus, Receipt, type IconProps } from "phosphor-react-native";
import { useEffect, type ComponentType } from "react";
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Money } from "@/components/ui/Money";
import { Press } from "@/components/ui/Press";
import { PEOPLE, PHOTOS } from "@/constants/assets";
import { USER } from "@/constants/data";
import { useCountUp } from "@/hooks/useCountUp";
import { useBankStore } from "@/stores/useBankStore";
import { colors, fonts } from "@/utils/theme";

interface ActionProps {
  label: string;
  Icon: ComponentType<IconProps>;
  onPress?: () => void;
}
const Action = ({ label, Icon, onPress }: ActionProps) => (
  <Press onPress={onPress} depth={0.9} style={styles.action}>
    <View style={styles.circle}>
      <Icon size={22} color={colors.text} weight="bold" />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </Press>
);

interface HeroProps {
  live: boolean;
  onMore: () => void;
}

/**
 * The top of the home screen: a photograph, and on it the one number people open a bank app for.
 * The real app opens on a grid of tiles and keeps this number behind the Menu tab.
 */
export const Hero = ({ live, onMore }: HeroProps) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const balance = useBankStore((s) => s.balance);
  const hidden = useBankStore((s) => s.hidden);
  const toggleHidden = useBankStore((s) => s.toggleHidden);
  const shown = useCountUp(live ? balance : 0, 1200, 150);
  const drift = useSharedValue(0);
  const copied = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [drift]);

  const photo = useAnimatedStyle(() => ({ transform: [{ scale: 1.08 + drift.value * 0.06 }, { translateY: -drift.value * 10 }] }));
  const toast = useAnimatedStyle(() => ({ opacity: copied.value }));
  const number = useAnimatedStyle(() => ({ opacity: 1 - copied.value }));

  return (
    <View style={{ height: Math.round(height * 0.5) }}>
      <View style={styles.clip}>
        <Animated.View style={[styles.fill, photo]}>
          <Image source={PHOTOS.skyline} style={styles.fill} resizeMode="cover" />
        </Animated.View>
        <LinearGradient colors={["rgba(11,11,13,0.55)", "rgba(11,11,13,0.1)", "rgba(11,11,13,0.72)", colors.bg]} locations={[0, 0.3, 0.78, 1]} style={styles.fillAbs} />
      </View>

      <View style={[styles.top, { top: insets.top + 14 }]}>
        <Press onPress={() => router.navigate("/profile")}>
          <Image source={PEOPLE.user} style={styles.avatar} />
        </Press>
        <View style={styles.search}>
          <MagnifyingGlass size={17} color={colors.soft} weight="bold" />
          <Text style={styles.searchText}>Search</Text>
        </View>
        <Press style={styles.icon} onPress={() => router.push("/notifications")}>
          <Bell size={21} color={colors.text} weight="fill" />
          <View style={styles.dot} />
        </Press>
      </View>

      <View style={styles.middle}>
        <Pressable
          style={styles.label}
          hitSlop={10}
          onPress={() => {
            Haptics.selectionAsync();
            toggleHidden();
          }}
        >
          <Text style={styles.labelText}>{USER.product} · NGN</Text>
          {hidden ? <EyeSlash size={15} color={colors.soft} weight="fill" /> : <Eye size={15} color={colors.soft} weight="fill" />}
        </Pressable>
        <Money value={shown} size={46} hidden={hidden} style={styles.balance} />
        <Pressable
          style={styles.pill}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            copied.value = withSequence(withTiming(1, { duration: 150 }), withTiming(1, { duration: 1100 }), withTiming(0, { duration: 220 }));
          }}
        >
          <Animated.View style={[styles.pillRow, number]}>
            <Text style={styles.pillText}>{USER.account}</Text>
            <Copy size={14} color={colors.text} weight="bold" />
          </Animated.View>
          <Animated.Text style={[styles.pillText, styles.pillToast, toast]}>Copied</Animated.Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Action label="Add money" Icon={Plus} onPress={() => router.push("/add-money")} />
        <Action label="Send" Icon={ArrowUpRight} onPress={() => router.push("/transfer")} />
        <Action label="Pay bills" Icon={Receipt} onPress={() => router.push("/bills")} />
        <Action label="More" Icon={DotsThree} onPress={onMore} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  clip: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, overflow: "hidden" },
  fill: { width: "100%", height: "100%" },
  fillAbs: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  top: { position: "absolute", left: 16, right: 16, flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  search: { flex: 1, height: 38, borderRadius: 19, backgroundColor: colors.glass, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 14 },
  searchText: { fontFamily: fonts.regular, fontSize: 15, color: colors.soft },
  icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.glass, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", right: 9, top: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  middle: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  label: { flexDirection: "row", alignItems: "center", gap: 6 },
  labelText: { fontFamily: fonts.medium, fontSize: 14, color: colors.soft },
  balance: { marginTop: 6 },
  pill: { height: 32, minWidth: 138, paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.glass, alignItems: "center", justifyContent: "center", marginTop: 14 },
  pillRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  pillText: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.text, fontVariant: ["tabular-nums"] },
  pillToast: { position: "absolute" },
  actions: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 26, paddingBottom: 18 },
  action: { alignItems: "center", width: 70 },
  circle: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.glass, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.text, marginTop: 8 },
});
