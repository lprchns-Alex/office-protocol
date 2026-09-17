import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  Animated,
  AppState,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type View,
  type ViewStyle,
} from "react-native";

type MotionSettings = { reduceMotion: boolean; motionActive: boolean };
const MotionContext = createContext<MotionSettings>({
  reduceMotion: true,
  motionActive: false,
});
const accent = "#C7FF00";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState(true);
  const [foreground, setForeground] = useState(
    () => AppState.currentState == null || AppState.currentState === "active",
  );
  const [visible, setVisible] = useState(
    () =>
      Platform.OS !== "web" ||
      typeof document === "undefined" ||
      !document.hidden,
  );

  useEffect(() => {
    let mounted = true;
    let preferenceChanged = false;
    const preference = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        preferenceChanged = true;
        if (mounted) setReduceMotion(enabled);
      },
    );
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted && !preferenceChanged) setReduceMotion(enabled);
      })
      .catch(() => {
        // Remain still if the device cannot report its accessibility preference.
      });
    const appState = AppState.addEventListener("change", (state) => {
      if (mounted) setForeground(state === "active");
    });
    const updateVisibility = () => setVisible(!document.hidden);
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.addEventListener("visibilitychange", updateVisibility);
    }
    return () => {
      mounted = false;
      preference?.remove();
      appState.remove();
      if (Platform.OS === "web" && typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", updateVisibility);
      }
    };
  }, []);

  const settings = useMemo(
    () => ({
      reduceMotion,
      motionActive: !reduceMotion && foreground && visible,
    }),
    [reduceMotion, foreground, visible],
  );
  return (
    <MotionContext.Provider value={settings}>{children}</MotionContext.Provider>
  );
}

export function useMotionSettings() {
  return useContext(MotionContext);
}

/** Reveal only on mount. Returning from the background never hides content again. */
function useEntrance(delay: number | undefined) {
  const { motionActive } = useMotionSettings();
  const initialDelay = useRef(delay);
  const completed = useRef(!motionActive || delay === undefined);
  const progress = useRef(
    new Animated.Value(completed.current ? 1 : 0),
  ).current;
  const translateY = useMemo(
    () => progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
    [progress],
  );

  useEffect(() => {
    if (!motionActive || completed.current) {
      completed.current = true;
      progress.stopAnimation();
      progress.setValue(1);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 300,
      delay: Math.max(0, initialDelay.current ?? 0),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
      isInteraction: false,
    });
    animation.start(({ finished }) => {
      if (finished) completed.current = true;
    });
    return () => animation.stop();
  }, [motionActive, progress]);

  return { progress, translateY };
}

export function Reveal({
  children,
  style,
  delay = 0,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}) {
  const { progress, translateY } = useEntrance(delay);
  const flat = StyleSheet.flatten(style);
  const baseOpacity = typeof flat?.opacity === "number" ? flat.opacity : 1;
  const opacity = useMemo(
    () => Animated.multiply(progress, baseOpacity),
    [progress, baseOpacity],
  );
  const baseTransform = Array.isArray(flat?.transform) ? flat.transform : [];
  return (
    <Animated.View
      style={[
        style,
        { opacity, transform: [...baseTransform, { translateY }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export type MotionPressableState = PressableStateCallbackType & {
  hovered: boolean;
  focused: boolean;
};

export type MotionPressableProps = Omit<
  PressableProps,
  "style" | "children"
> & {
  style?:
    | StyleProp<ViewStyle>
    | ((state: MotionPressableState) => StyleProp<ViewStyle>);
  children?:
    | React.ReactNode
    | ((state: MotionPressableState) => React.ReactNode);
  enterDelay?: number;
  lift?: number;
  glow?: boolean;
  confirmed?: boolean;
};

/** Animate the pressable itself, keeping flex/grid sizing and touch bounds intact. */
export const MotionPressable = forwardRef<View, MotionPressableProps>(
  function MotionPressable(
    {
      children,
      style,
      enterDelay,
      lift = 2,
      glow = true,
      confirmed = false,
      disabled,
      onHoverIn,
      onHoverOut,
      onPressIn,
      onPressOut,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) {
    const { motionActive } = useMotionSettings();
    const [pressed, setPressed] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const scale = useRef(new Animated.Value(1)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const halo = useRef(new Animated.Value(0)).current;
    const confirmationScale = useRef(new Animated.Value(1)).current;
    const wasConfirmed = useRef(confirmed);
    const entrance = useEntrance(enterDelay);
    const state: MotionPressableState = {
      pressed: !disabled && pressed,
      hovered: !disabled && hovered,
      focused: !disabled && focused,
    };
    const highlighted = state.hovered || state.focused;

    useEffect(() => {
      if (disabled) {
        setPressed(false);
        setHovered(false);
        setFocused(false);
      }
    }, [disabled]);

    useEffect(() => {
      const targetGlow = glow && highlighted ? 0.26 : 0;
      if (!motionActive || disabled) {
        scale.stopAnimation();
        translateY.stopAnimation();
        halo.stopAnimation();
        scale.setValue(1);
        translateY.setValue(0);
        halo.setValue(disabled ? 0 : targetGlow);
        return;
      }
      const spring = {
        stiffness: 330,
        damping: 27,
        mass: 0.7,
        overshootClamping: true,
        useNativeDriver: false,
        isInteraction: false,
      };
      const animation = Animated.parallel([
        Animated.spring(scale, {
          ...spring,
          toValue: pressed ? 0.975 : highlighted ? 1.01 : 1,
        }),
        Animated.spring(translateY, {
          ...spring,
          toValue: !pressed && highlighted ? -lift : 0,
        }),
        Animated.timing(halo, {
          toValue: targetGlow,
          duration: 160,
          useNativeDriver: false,
          isInteraction: false,
        }),
      ]);
      animation.start();
      return () => animation.stop();
    }, [
      disabled,
      glow,
      halo,
      highlighted,
      lift,
      motionActive,
      pressed,
      scale,
      translateY,
    ]);

    useEffect(() => {
      const newlyConfirmed = confirmed && !wasConfirmed.current;
      wasConfirmed.current = confirmed;
      confirmationScale.stopAnimation();
      confirmationScale.setValue(1);
      if (!newlyConfirmed || !motionActive || disabled) return;
      const animation = Animated.sequence([
        Animated.timing(confirmationScale, {
          toValue: 1.035,
          duration: 110,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
          isInteraction: false,
        }),
        Animated.timing(confirmationScale, {
          toValue: 1,
          duration: 190,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
          isInteraction: false,
        }),
      ]);
      animation.start();
      return () => animation.stop();
    }, [confirmed, confirmationScale, disabled, motionActive]);

    const resolvedStyle = typeof style === "function" ? style(state) : style;
    const flat = StyleSheet.flatten(resolvedStyle);
    const baseOpacity = typeof flat?.opacity === "number" ? flat.opacity : 1;
    const opacity = useMemo(
      () => Animated.multiply(entrance.progress, baseOpacity),
      [entrance.progress, baseOpacity],
    );
    const combinedScale = useMemo(
      () => Animated.multiply(scale, confirmationScale),
      [scale, confirmationScale],
    );
    const combinedY = useMemo(
      () => Animated.add(translateY, entrance.translateY),
      [translateY, entrance.translateY],
    );
    const baseTransform = Array.isArray(flat?.transform) ? flat.transform : [];

    return (
      <AnimatedPressable
        {...props}
        ref={ref}
        disabled={disabled}
        onHoverIn={(event) => {
          if (!disabled) setHovered(true);
          onHoverIn?.(event);
        }}
        onHoverOut={(event) => {
          setHovered(false);
          onHoverOut?.(event);
        }}
        onPressIn={(event) => {
          if (!disabled) setPressed(true);
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          setPressed(false);
          onPressOut?.(event);
        }}
        onFocus={(event) => {
          if (!disabled) setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          resolvedStyle,
          {
            opacity,
            transform: [
              ...baseTransform,
              { translateY: combinedY },
              { scale: combinedScale },
            ],
          },
          glow && {
            shadowColor: accent,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 12,
            shadowOpacity: halo,
          },
          state.focused && {
            outlineColor: accent,
            outlineStyle: "solid",
            outlineWidth: 2,
            outlineOffset: 3,
          },
        ]}
      >
        {typeof children === "function" ? children(state) : children}
      </AnimatedPressable>
    );
  },
);
