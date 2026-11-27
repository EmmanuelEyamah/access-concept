import { Bank, ChartLineUp, Clock, Coins, DeviceMobile, Diamond, Gift, GlobeHemisphereWest, Money as Cash, PaperPlaneTilt, Receipt, Trophy, X, type IconProps } from "phosphor-react-native";
import { useEffect, type ComponentType } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Press } from "@/components/ui/Press";
import { SERVICES } from "@/constants/data";
import { colors, fonts, radius } from "@/utils/theme";

const ICONS: ComponentType<IconProps>[] = [Diamond, Coins, Bank, PaperPlaneTilt, DeviceMobile, Trophy, Receipt, GlobeHemisphereWest, Cash, ChartLineUp, Gift, Clock];

interface TileProps {
  label: string;
  Icon: ComponentType<IconProps>;
  index: number;
  open: boolean;
}
const Tile = ({ label, Icon, index, open }: TileProps) => {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = open ? withDelay(100 + index * 24, withSpring(1, { damping: 15, stiffness: 200 })) : 0;
  }, [open, index, t]);
  const style = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ translateY: (1 - t.value) * 12 }] }));
  return (
    <Animated.View style={[styles.slot, style]}>
      <Press depth={0.93} style={styles.tile}>
        <View style={styles.icon}>
          <Icon size={22} color={colors.text} weight="fill" />
        </View>
        <Text style={styles.tileText} numberOfLines={1}>
          {label}
        </Text>
      </Press>
    </Animated.View>
  );
};

interface ServicesSheetProps {
  open: boolean;
  onClose: () => void;
}

/** Every service from the old home grid, in a sheet that springs up from the bottom. */
export const ServicesSheet = ({ open, onClose }: ServicesSheetProps) => {
  const insets = useSafeAreaInsets();
  const t = useSharedValue(0);

  useEffect(() => {
    if (open) t.value = withSpring(1, { damping: 20, stiffness: 180 });
  }, [open, t]);

  const close = () => {
    t.value = withTiming(0, { duration: 220 });
    setTimeout(onClose, 210);
  };

  const backdrop = useAnimatedStyle(() => ({ opacity: Math.min(1, t.value) * 0.6 }));
  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - t.value) * 640 }] }));

  return (
    <Modal visible={open} transparent animationType="none" statusBarTranslucent onRequestClose={close}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdrop]} />
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 10 }, sheet]}>
        <View style={styles.grab} />
        <View style={styles.head}>
          <Text style={styles.title}>More</Text>
          <Press onPress={close} style={styles.close}>
            <X size={16} color={colors.text} weight="bold" />
          </Press>
        </View>
        <View style={styles.grid}>
          {SERVICES.map((s, i) => (
            <Tile key={s} label={s} Icon={ICONS[i]} index={i} open={open} />
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "#000" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: 14, paddingTop: 8 },
  grab: { alignSelf: "center", width: 36, height: 5, borderRadius: 3, backgroundColor: colors.lineStrong },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14, marginBottom: 12, paddingHorizontal: 6 },
  title: { fontFamily: fonts.bold, fontSize: 24, letterSpacing: -0.6, color: colors.text },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.raised, alignItems: "center", justifyContent: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  slot: { width: "25%" },
  tile: { alignItems: "center", paddingVertical: 12 },
  icon: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.raised, alignItems: "center", justifyContent: "center" },
  tileText: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.soft, marginTop: 8, maxWidth: 84, textAlign: "center" },
});
