import React, { useEffect, useId, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  Path,
  Pattern,
  Polygon,
  Rect,
} from "react-native-svg";
import { ArrowUpRight } from "lucide-react-native";
import type { Manager } from "./game";
import { MotionPressable, useMotionSettings } from "./motion";

const MotionCircle = React.forwardRef<
  Circle,
  React.ComponentProps<typeof Circle> & { collapsable?: boolean }
>((props, ref) => {
  // Animated adds this native-only prop; react-native-svg forwards it to the DOM.
  if (Platform.OS === "web") {
    const { collapsable: _collapsable, ...svgProps } = props;
    return <Circle {...svgProps} ref={ref} />;
  }
  return <Circle {...props} ref={ref} />;
});
const AnimatedCircle = Animated.createAnimatedComponent(MotionCircle);

export const P = {
  lime: "#C7FF00",
  ink: "#050706",
  panel: "#0A100D",
  line: "#2A3930",
  muted: "#91A09A",
  white: "#EEF4EE",
  red: "#FF453A",
};

export const T = ({ style, ...props }: React.ComponentProps<typeof Text>) => (
  <Text {...props} style={[s.text, style]} />
);
export const Mono = ({
  style,
  ...props
}: React.ComponentProps<typeof Text>) => (
  <T {...props} style={[s.mono, style]} />
);

/** Ornamental SVG sits behind content, preserving native layout and hit targets. */
export function CyberFrame({
  children,
  style,
  color = P.lime,
  fill = P.panel,
  cut = 12,
  texture = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  color?: string;
  fill?: string;
  cut?: number;
  texture?: boolean;
}) {
  const patternId = "scan" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const { width: w, height: h } = layout;
  const c = Math.max(0, Math.min(cut, w / 4, h / 4));
  const e = 0.75;
  const outline = [
    c + "," + e,
    w - c + "," + e,
    w - e + "," + c,
    w - e + "," + (h - c),
    w - c + "," + (h - e),
    c + "," + (h - e),
    e + "," + (h - c),
    e + "," + c,
  ].join(" ");
  return (
    <View
      style={[{ position: "relative" }, style]}
      onLayout={({ nativeEvent }) => {
        const next = nativeEvent.layout;
        setLayout((previous) =>
          previous.width === next.width && previous.height === next.height
            ? previous
            : { width: next.width, height: next.height },
        );
      }}
    >
      {w > 0 && h > 0 && (
        <View
          style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Svg width={w} height={h}>
            {texture && (
              <Defs>
                <Pattern
                  id={patternId}
                  width={32}
                  height={16}
                  patternUnits="userSpaceOnUse"
                >
                  <Line
                    x1={0}
                    x2={32}
                    y1={1}
                    y2={1}
                    stroke={color}
                    strokeOpacity={0.045}
                  />
                  <Line
                    x1={0}
                    x2={10}
                    y1={9}
                    y2={9}
                    stroke={color}
                    strokeOpacity={0.025}
                  />
                </Pattern>
              </Defs>
            )}
            <Polygon
              points={outline}
              fill={fill}
              stroke={color}
              strokeOpacity={0.45}
              strokeWidth={1}
            />
            {texture && (
              <Polygon points={outline} fill={`url(#${patternId})`} />
            )}
            <Path
              d={
                "M " +
                e +
                " " +
                (c + 16) +
                " L " +
                e +
                " " +
                c +
                " L " +
                c +
                " " +
                e +
                " L " +
                (c + 22) +
                " " +
                e +
                " M " +
                (w - c - 22) +
                " " +
                (h - e) +
                " L " +
                (w - c) +
                " " +
                (h - e) +
                " L " +
                (w - e) +
                " " +
                (h - c) +
                " L " +
                (w - e) +
                " " +
                (h - c - 16)
              }
              fill="none"
              stroke={color}
              strokeWidth={1.5}
            />
            <Line
              x1={w - c - 26}
              y1={e}
              x2={w - c - 12}
              y2={e}
              stroke={color}
              strokeWidth={3}
            />
            <Line
              x1={c + 12}
              y1={h - e}
              x2={c + 26}
              y2={h - e}
              stroke={color}
              strokeWidth={3}
            />
          </Svg>
        </View>
      )}
      {children}
    </View>
  );
}

export const Tag = ({ children }: { children: React.ReactNode }) => (
  <View style={s.tag}>
    <View style={{ width: 3, height: 3, backgroundColor: P.lime }} />
    <Mono style={s.tagText}>{children}</Mono>
  </View>
);

export function Button({
  children,
  onPress,
  secondary = false,
  disabled = false,
  icon: Icon = ArrowUpRight,
}: {
  children: React.ReactNode;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: typeof ArrowUpRight;
}) {
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        disabled && { opacity: 0.35 },
        pressed && { opacity: 0.65 },
      ]}
    >
      {({ hovered, focused }) => {
        const highlighted = !disabled && (hovered || focused);
        const accent = highlighted ? P.white : secondary ? P.muted : P.lime;
        return (
          <CyberFrame
            style={[s.button, secondary && s.buttonSecondary]}
            color={accent}
            fill={highlighted ? "#18260C" : secondary ? P.ink : "#101B09"}
            cut={8}
          >
            <T
              style={[
                s.buttonText,
                (secondary || highlighted) && { color: P.white },
              ]}
            >
              {children}
            </T>
            <Icon size={19} color={accent} strokeWidth={1.7} />
          </CyberFrame>
        );
      }}
    </MotionPressable>
  );
}

export function Avatar({
  manager,
  size = 48,
}: {
  manager: Manager;
  size?: number;
}) {
  return (
    <View style={[s.avatar, { width: size, height: size }]}>
      <View
        style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}
        accessibilityElementsHidden
      >
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Rect
            x={0.75}
            y={0.75}
            width={78.5}
            height={78.5}
            fill={P.ink}
            stroke={manager.color}
            strokeOpacity={0.45}
          />
          {Array.from({ length: 12 }, (_, i) => (
            <Line
              key={i}
              x1={3}
              x2={77}
              y1={5 + i * 6}
              y2={5 + i * 6}
              stroke={manager.color}
              strokeOpacity={0.08}
            />
          ))}
          <Path
            d="M 0 15 L 0 0 L 15 0 M 65 0 L 80 0 L 80 15 M 80 65 L 80 80 L 65 80 M 15 80 L 0 80 L 0 65"
            stroke={manager.color}
            strokeWidth={2.5}
            fill="none"
          />
          <Line
            x1={40}
            y1={5}
            x2={40}
            y2={11}
            stroke={manager.color}
            strokeOpacity={0.55}
          />
          <Line
            x1={5}
            y1={40}
            x2={11}
            y2={40}
            stroke={manager.color}
            strokeOpacity={0.55}
          />
          <Line
            x1={69}
            y1={40}
            x2={75}
            y2={40}
            stroke={manager.color}
            strokeOpacity={0.55}
          />
          <Rect x={64} y={65} width={5} height={5} fill={manager.color} />
          <Line
            x1={10}
            y1={69}
            x2={26}
            y2={69}
            stroke={manager.color}
            strokeWidth={2}
          />
        </Svg>
      </View>
      <T
        style={{
          fontSize: size * 0.33,
          color: manager.color,
          fontFamily: "Display",
          letterSpacing: -0.6,
        }}
      >
        {manager.initials}
      </T>
    </View>
  );
}

export function Radar({
  size = 112,
  value = 0.65,
}: {
  size?: number;
  value?: number;
}) {
  const progress = Math.max(0, Math.min(1, value));
  const circumference = 2 * Math.PI * 38;
  const { reduceMotion, motionActive } = useMotionSettings();
  const rotation = useRef(new Animated.Value(0)).current;
  const progressOffset = useRef(
    new Animated.Value(circumference * (1 - progress)),
  ).current;

  useEffect(() => {
    if (reduceMotion || !motionActive) {
      rotation.setValue(0);
      return;
    }
    const scan = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 5600,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== "web",
        isInteraction: false,
      }),
    );
    scan.start();
    return () => scan.stop();
  }, [motionActive, reduceMotion, rotation]);

  useEffect(() => {
    const nextOffset = circumference * (1 - progress);
    if (reduceMotion || !motionActive) {
      progressOffset.setValue(nextOffset);
      return;
    }
    const fill = Animated.timing(progressOffset, {
      toValue: nextOffset,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
      isInteraction: false,
    });
    fill.start();
    return () => fill.stop();
  }, [circumference, motionActive, progress, progressOffset, reduceMotion]);

  return (
    <View
      style={{ width: size, height: size, pointerEvents: "none" }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle
          cx={60}
          cy={60}
          r={54}
          stroke={P.lime}
          strokeOpacity={0.16}
          fill="none"
        />
        {Array.from({ length: 60 }, (_, i) => {
          const angle = (i * Math.PI) / 30 - Math.PI / 2;
          const inner = i % 5 === 0 ? 45 : 48;
          return (
            <Line
              key={i}
              x1={60 + Math.cos(angle) * inner}
              y1={60 + Math.sin(angle) * inner}
              x2={60 + Math.cos(angle) * 51}
              y2={60 + Math.sin(angle) * 51}
              stroke={i / 60 < progress ? P.lime : P.muted}
              strokeOpacity={i / 60 < progress ? 1 : 0.55}
              strokeWidth={i % 5 === 0 ? 1.4 : 0.7}
            />
          );
        })}
        <Circle
          cx={60}
          cy={60}
          r={38}
          stroke={P.line}
          strokeWidth={3}
          fill="none"
        />
        <AnimatedCircle
          cx={60}
          cy={60}
          r={38}
          stroke={P.lime}
          strokeWidth={3}
          fill="none"
          strokeDasharray={[circumference, circumference]}
          strokeDashoffset={progressOffset}
          transform="rotate(-90 60 60)"
        />
        <Circle
          cx={60}
          cy={60}
          r={31}
          stroke={P.lime}
          strokeOpacity={0.25}
          strokeDasharray="1 5"
          fill="none"
        />
        <Path
          d="M 1 60 H 24 M 96 60 H 119 M 60 1 V 22 M 60 98 V 119"
          stroke={P.muted}
          strokeOpacity={0.45}
          strokeWidth={0.7}
        />
        <Path
          d="M 41 51 H 37 V 70 H 41 M 79 51 H 83 V 70 H 79"
          stroke={P.lime}
          fill="none"
        />
        <Rect x={21} y={27} width={3} height={3} fill={P.lime} />
        <Rect x={94} y={86} width={3} height={3} fill={P.lime} />
        <Rect x={105} y={19} width={2} height={2} fill={P.muted} />
      </Svg>
      <Animated.View
        testID="radar-sweep"
        style={[
          StyleSheet.absoluteFill,
          {
            pointerEvents: "none",
            transform: [
              {
                rotate: rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 120 120">
          <Path
            d="M 9.3 78.5 A 54 54 0 0 1 22 22"
            stroke={P.lime}
            strokeWidth={1.2}
            strokeOpacity={0.13}
            fill="none"
          />
          <Path
            d="M 22 22 A 54 54 0 0 1 46 7.8"
            stroke={P.lime}
            strokeWidth={1.2}
            strokeOpacity={0.35}
            fill="none"
          />
          <Path
            d="M 46 7.8 A 54 54 0 0 1 60 6"
            stroke={P.lime}
            strokeWidth={1.5}
            strokeOpacity={0.8}
            fill="none"
          />
          <Rect x={58.5} y={4.5} width={3} height={3} fill={P.lime} />
        </Svg>
      </Animated.View>
      <View style={[StyleSheet.absoluteFill, s.center]}>
        <Mono
          style={{ fontSize: size * 0.135, color: P.lime, letterSpacing: -0.8 }}
        >
          {Math.round(progress * 100)}%
        </Mono>
      </View>
    </View>
  );
}

export function Segments({
  value,
  total = 12,
  color = P.lime,
}: {
  value: number;
  total?: number;
  color?: string;
}) {
  const count = Math.max(1, Math.floor(total));
  const active = Math.round(Math.max(0, Math.min(1, value)) * count);
  return (
    <View style={{ flexDirection: "row", gap: 3, height: 13, flexShrink: 0 }}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: i < active ? color : P.line,
            backgroundColor: i < active ? color : "transparent",
          }}
        />
      ))}
    </View>
  );
}

export function TechnicalStrip({ color = P.lime }: { color?: string }) {
  return (
    <View
      style={{
        height: 14,
        overflow: "hidden",
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        pointerEvents: "none",
      }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: 22 }, (_, i) => (
        <View
          key={i}
          style={{
            width: i % 4 === 0 ? 3 : 1,
            height: i % 5 === 0 ? 12 : 8,
            backgroundColor: color,
            opacity: i < 14 ? 0.8 : 0.3,
          }}
        />
      ))}
      <View
        style={{
          height: 1,
          backgroundColor: color,
          opacity: 0.25,
          flex: 1,
          marginLeft: 6,
        }}
      />
      {Array.from({ length: 5 }, (_, i) => (
        <View
          key={"slash-" + i}
          style={{
            height: 10,
            width: 2,
            backgroundColor: color,
            opacity: 0.6,
            transform: [{ rotate: "30deg" }],
            marginLeft: 2,
          }}
        />
      ))}
      <View
        style={{
          height: 5,
          width: 5,
          borderWidth: 1,
          borderColor: color,
          marginLeft: 8,
        }}
      />
    </View>
  );
}

export function Meter({ score }: { score: number }) {
  return (
    <View>
      <View style={s.between}>
        <Mono style={s.small}>КРИНЖОМЕТР</Mono>
        <Mono style={[s.small, { color: P.lime }]}>{score % 1000} / 1 000</Mono>
      </View>
      <View style={s.meterTrack}>
        <Segments value={(score % 1000) / 1000} total={24} />
      </View>
    </View>
  );
}

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020403" },
  center: { alignItems: "center", justifyContent: "center" },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    backgroundColor: P.ink,
  },
  safeTop: {
    backgroundColor: P.ink,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  text: { fontFamily: "Body", color: P.white },
  mono: { fontFamily: "Mono", fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  small: { fontSize: 9, color: P.muted, letterSpacing: 0.45 },
  content: { paddingBottom: 24 },
  topbar: {
    backgroundColor: P.ink,
    paddingHorizontal: 18,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: P.line,
    borderBottomWidth: 1,
  },
  brand: {
    fontFamily: "Display",
    fontSize: 15,
    color: P.lime,
    letterSpacing: 0.2,
  },
  topLabel: { fontSize: 7, color: P.muted, letterSpacing: 0.35 },
  onlineDot: { width: 4, height: 4, backgroundColor: P.lime },
  hero: {
    backgroundColor: P.ink,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
  },
  eyebrow: { fontSize: 8, color: P.lime, letterSpacing: 0.8 },
  heroTitle: {
    fontFamily: "Display",
    fontSize: 38,
    lineHeight: 39,
    color: P.white,
    letterSpacing: -0.65,
  },
  heroNumber: {
    fontFamily: "Display",
    fontSize: 60,
    lineHeight: 65,
    color: P.lime,
    letterSpacing: -2,
  },
  heroBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: P.line,
    marginTop: 18,
    paddingTop: 10,
  },
  section: { paddingHorizontal: 18 },
  managerSelect: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: P.line,
  },
  managerName: { fontSize: 20, fontFamily: "Display", letterSpacing: 0.1 },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  avatarStripe: {
    position: "absolute",
    height: "100%",
    width: 1,
    left: 8,
    opacity: 0.15,
    backgroundColor: P.lime,
  },
  avatarCorner: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 4,
    height: 4,
    backgroundColor: P.lime,
  },
  sectionTitle: {
    fontFamily: "Display",
    fontSize: 17,
    letterSpacing: 0.1,
    flexShrink: 1,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: P.line,
    backgroundColor: P.ink,
  },
  chipActive: { backgroundColor: P.lime, borderColor: P.lime },
  chipText: { color: P.muted, fontSize: 9 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  cell: {
    backgroundColor: P.panel,
    borderWidth: 1,
    borderColor: P.line,
    padding: 9,
    justifyContent: "space-between",
  },
  cellChecked: { backgroundColor: P.lime, borderColor: P.lime },
  cellIndex: { color: P.muted, fontSize: 8, letterSpacing: 0.5 },
  cellCorner: {
    width: 7,
    height: 7,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: P.lime,
  },
  cellText: { fontSize: 14, lineHeight: 18, marginVertical: 8 },
  cellPoints: { fontSize: 8, color: P.lime },
  reroll: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 53,
  },
  scorePanel: { padding: 17 },
  meterTrack: {
    height: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: P.line,
    marginTop: 10,
    overflow: "hidden",
  },
  meterFill: { height: "100%", backgroundColor: P.lime },
  meterDivider: {
    position: "absolute",
    width: 2,
    height: "100%",
    backgroundColor: P.ink,
  },
  button: {
    paddingHorizontal: 17,
    paddingVertical: 12,
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  buttonSecondary: {},
  buttonText: {
    color: P.lime,
    fontFamily: "Display",
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: P.line,
  },
  logDot: {
    width: 5,
    height: 5,
    borderWidth: 1,
    borderColor: P.lime,
    backgroundColor: "#283606",
    marginTop: 5,
  },
  emptyLog: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 17,
    borderTopWidth: 1,
    borderColor: P.line,
  },
  rulesLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    minHeight: 44,
  },
  pageHeader: {
    padding: 18,
    paddingTop: 25,
    borderBottomWidth: 1,
    borderColor: P.line,
    marginBottom: 22,
    backgroundColor: P.ink,
  },
  pageTitle: {
    fontFamily: "Display",
    fontSize: 32,
    letterSpacing: 0,
    flexShrink: 1,
    color: P.white,
  },
  subtitle: { fontSize: 16, color: P.muted, lineHeight: 22, marginTop: 10 },
  squareButton: {
    width: 44,
    height: 44,
    backgroundColor: P.lime,
    borderWidth: 1,
    borderColor: P.lime,
    alignItems: "center",
    justifyContent: "center",
  },
  managerCard: { padding: 16, marginBottom: 13 },
  tag: {
    borderWidth: 1,
    borderColor: "#3B511B",
    backgroundColor: "#111908",
    paddingHorizontal: 7,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tagText: { color: P.lime, fontSize: 8, letterSpacing: 0.2 },
  pairing: { padding: 20, marginTop: 15 },
  footerNote: {
    color: P.muted,
    fontSize: 9,
    lineHeight: 17,
    textAlign: "center",
    marginVertical: 25,
  },
  back: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 64 },
  profilePanel: { padding: 18 },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: P.line,
    paddingVertical: 17,
    marginBottom: 20,
  },
  statNumber: {
    fontSize: 36,
    fontFamily: "Display",
    color: P.lime,
    marginBottom: 4,
  },
  settingRow: {
    minHeight: 80,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: P.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
  },
  settingHelp: { fontSize: 13, color: P.muted, marginTop: 5, lineHeight: 18 },
  adminPanel: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    padding: 17,
    marginBottom: 10,
  },
  navSafe: { backgroundColor: P.ink, borderTopWidth: 1, borderColor: P.line },
  nav: { flexDirection: "row" },
  navItem: { flex: 1, alignItems: "center", paddingTop: 15, paddingBottom: 13 },
  navIndicator: {
    position: "absolute",
    height: 2,
    width: 38,
    top: -1,
    backgroundColor: "transparent",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#000000DE",
    justifyContent: "flex-end",
  },
  modalKeyboard: {
    maxHeight: "93%",
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  sheet: {
    backgroundColor: P.ink,
    borderTopWidth: 1,
    borderColor: P.lime,
    maxHeight: "100%",
  },
  sheetTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 18,
    paddingRight: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: P.line,
    backgroundColor: P.panel,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetContent: { padding: 18, paddingBottom: 32 },
  modalTitle: {
    fontFamily: "Display",
    fontSize: 26,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderColor: P.line,
  },
  incidentCard: {
    padding: 21,
    minHeight: 310,
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 25,
  },
  incidentText: {
    fontFamily: "Display",
    fontSize: 29,
    lineHeight: 36,
    color: P.white,
    marginVertical: 25,
  },
  cancel: { alignItems: "center", justifyContent: "center", minHeight: 55 },
  report: { padding: 20, marginVertical: 12, marginBottom: 24 },
  reportLine: { height: 1, backgroundColor: P.line },
  barcode: { flexDirection: "row", gap: 3, overflow: "hidden", marginTop: 28 },
  rule: {
    flexDirection: "row",
    gap: 17,
    paddingVertical: 19,
    borderBottomWidth: 1,
    borderColor: P.line,
  },
  libraryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: P.line,
  },
  fieldLabel: {
    color: P.muted,
    fontSize: 10,
    marginTop: 23,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: P.line,
    backgroundColor: P.panel,
    color: P.white,
    padding: 15,
    fontSize: 18,
    fontFamily: "Body",
    minHeight: 54,
  },
  win: {
    backgroundColor: P.ink,
    borderWidth: 1,
    borderColor: P.lime,
    padding: 25,
    width: "100%",
    maxWidth: 420,
  },
  winTitle: {
    fontFamily: "Display",
    fontSize: 88,
    color: P.lime,
    letterSpacing: -2,
    marginTop: 18,
  },
  toast: {
    position: "absolute",
    bottom: 90,
    left: 18,
    right: 18,
    backgroundColor: P.lime,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: P.ink,
  },
  warning: {
    backgroundColor: "#2A0D0B",
    borderWidth: 1,
    borderColor: P.red,
    padding: 15,
  },
});
