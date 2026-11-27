import * as Haptics from "expo-haptics";
import type { Tabs } from "expo-router";
import { ClockCounterClockwise, CreditCard, House, User, type IconProps } from "phosphor-react-native";
import { useEffect, type ComponentProps, type ComponentType } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "@/utils/theme";

/** Props expo-router passes to a custom `tabBar`. */
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

const TABS: Record<string, { label: string; Icon: ComponentType<IconProps> }> = {
  home: { label: "Home", Icon: House },
  history: { label: "History", Icon: ClockCounterClockwise },
  cards: { label: "Cards", Icon: CreditCard },
  profile: { label: "Profile", Icon: User },
};

interface TabItemProps {
  label: string;
  Icon: ComponentType<IconProps>;
  active: boolean;
  onPress: () => void;
}

const TabItem = ({ label, Icon, active, onPress }: TabItemProps) => {
  const pop = useSharedValue(1);
  useEffect(() => {
    if (active) {
      pop.value = 0.8;
      pop.value = withSpring(1, { damping: 9, stiffness: 260 });
    }
  }, [active, pop]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <Animated.View style={style}>
        <Icon size={25} color={active ? colors.text : colors.faint} weight={active ? "fill" : "regular"} />
      </Animated.View>
      <Text style={[styles.label, active && styles.labelOn]}>{label}</Text>
    </Pressable>
  );
};

/** A plain bottom bar: four destinations, the current one filled in. */
export const TabBar = ({ state, navigation }: TabBarProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom - 6, 10) }]}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        return (
          <TabItem
            key={route.key}
            label={tab.label}
            Icon={tab.Icon}
            active={state.index === index}
            onPress={() => {
              Haptics.selectionAsync();
              navigation.navigate(route.name);
            }}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: { flexDirection: "row", backgroundColor: colors.bg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.lineStrong, paddingTop: 10 },
  item: { flex: 1, alignItems: "center", gap: 4 },
  label: { fontFamily: fonts.medium, fontSize: 10.5, color: colors.faint },
  labelOn: { color: colors.text },
});
