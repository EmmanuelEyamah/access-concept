import * as Haptics from "expo-haptics";
import { CaretDoubleRight } from "phosphor-react-native";
import { useEffect, useMemo, useRef } from "react";
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from "react-native-reanimated";
import { colors, fonts } from "@/utils/theme";

const KNOB = 56;
const PAD = 5;

interface SlideToSendProps {
  label: string;
  /** Autopilot: bump this number to have the knob slide across by itself. */
  auto?: number;
  onDone: () => void;
}

/** Money moves on a deliberate drag, not a tap. Letting go early springs the knob back. */
export const SlideToSend = ({ label, auto = 0, onDone }: SlideToSendProps) => {
  const x = useSharedValue(0);
  const travel = useSharedValue(1);
  const shimmer = useSharedValue(0);
  const range = useRef(1);
  const fired = useRef(false);
  const lastTick = useRef(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }), -1, false);
  }, [shimmer]);

  useEffect(() => {
    if (!auto || fired.current) return;
    fired.current = true;
    x.value = withTiming(range.current, { duration: 760, easing: Easing.inOut(Easing.cubic) });
    const timer = setTimeout(onDone, 800);
    return () => clearTimeout(timer);
  }, [auto, onDone, x]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !fired.current,
        onStartShouldSetPanResponderCapture: () => !fired.current,
        onMoveShouldSetPanResponder: () => !fired.current,
        onMoveShouldSetPanResponderCapture: () => !fired.current,
        // Once a drag has started nothing else may take it: not a scroll view, not a navigation gesture.
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        onPanResponderMove: (_, g) => {
          const next = Math.max(0, Math.min(range.current, g.dx));
          x.value = next;
          const step = Math.floor((next / range.current) * 8);
          if (step !== lastTick.current) {
            lastTick.current = step;
            Haptics.selectionAsync();
          }
        },
        onPanResponderRelease: (_, g) => {
          if (g.dx > range.current * 0.78) {
            fired.current = true;
            x.value = withSpring(range.current, { damping: 18, stiffness: 220 });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTimeout(onDone, 260);
          } else {
            x.value = withSpring(0, { damping: 13, stiffness: 170 });
          }
        },
        onPanResponderTerminate: () => {
          x.value = withSpring(0, { damping: 13, stiffness: 170 });
        },
      }),
    [onDone, x],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    range.current = e.nativeEvent.layout.width - KNOB - PAD * 2;
    travel.value = range.current;
  };

  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const fill = useAnimatedStyle(() => ({ width: x.value + KNOB + PAD * 2, opacity: interpolate(x.value, [0, 14], [0, 1], "clamp") }));
  const text = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, travel.value * 0.5], [1, 0], "clamp"), transform: [{ translateX: x.value * 0.3 }] }));
  const sending = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [travel.value * 0.6, travel.value], [0, 1], "clamp") }));
  const sweep = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, 20], [1, 0], "clamp"), transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-90, 340]) }, { skewX: "-18deg" }] }));

  return (
    <View style={styles.track} onLayout={onLayout} {...responder.panHandlers}>
      <Animated.View style={[styles.fill, fill]} />
      <View style={styles.center} pointerEvents="none">
        <Animated.Text style={[styles.label, text]}>{label}</Animated.Text>
        <Animated.Text style={[styles.label, styles.sending, sending]}>Sending…</Animated.Text>
      </View>
      <View style={styles.sweepClip} pointerEvents="none">
        <Animated.View style={[styles.sweep, sweep]} />
      </View>
      <Animated.View style={[styles.knob, knob]} pointerEvents="none">
        <CaretDoubleRight size={22} color="#FFFFFF" weight="bold" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: { height: KNOB + PAD * 2, borderRadius: (KNOB + PAD * 2) / 2, backgroundColor: colors.surface, justifyContent: "center", overflow: "hidden" },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: (KNOB + PAD * 2) / 2, backgroundColor: colors.accentSoft },
  center: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center", paddingLeft: KNOB * 0.5 },
  label: { fontFamily: fonts.medium, fontSize: 15.5, color: colors.text },
  sending: { position: "absolute", color: colors.accent },
  sweepClip: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, overflow: "hidden" },
  sweep: { position: "absolute", top: 0, bottom: 0, width: 40, backgroundColor: "rgba(255,255,255,0.07)" },
  knob: { position: "absolute", left: PAD, width: KNOB, height: KNOB, borderRadius: KNOB / 2, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", },
});
