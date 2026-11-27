import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

interface PressProps {
  onPress?: () => void;
  depth?: number;
  haptic?: boolean;
  disabled?: boolean;
  /** Take an equal share of a row, like `flex: 1`. */
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/** A touch target that sinks under the finger and springs back. */
export const Press = ({ onPress, depth = 0.95, haptic = true, disabled = false, fill = false, style, children }: PressProps) => {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      style={fill ? { flex: 1 } : undefined}
      disabled={disabled}
      onPress={() => {
        if (haptic) Haptics.selectionAsync();
        onPress?.();
      }}
      onPressIn={() => (scale.value = withSpring(depth, { damping: 16, stiffness: 340 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 9, stiffness: 240 }))}
    >
      <Animated.View style={[style, animated]}>{children}</Animated.View>
    </Pressable>
  );
};
