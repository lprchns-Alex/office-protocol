import React from "react";
import { StyleSheet, Pressable, Text, View } from "react-native";
import { ArrowUpRight } from "lucide-react-native";
import type { Manager } from "./game";
export const P = {
  lime: "#C7FF00",
  ink: "#10120E",
  panel: "#1B1E17",
  line: "#353A2C",
  muted: "#919785",
  white: "#F1F2E8",
  red: "#FF795A",
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
export const Tag = ({ children }: { children: React.ReactNode }) => (
  <View style={s.tag}>
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
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.buttonSecondary,
        disabled && { opacity: 0.35 },
        pressed && { opacity: 0.75 },
      ]}
    >
      <T style={[s.buttonText, secondary && { color: P.white }]}>{children}</T>
      <Icon size={20} color={secondary ? P.lime : P.ink} strokeWidth={1.8} />
    </Pressable>
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
    <View
      style={[
        s.avatar,
        { width: size, height: size, backgroundColor: manager.color },
      ]}
    >
      <View style={s.avatarStripe} />
      <T
        style={{
          fontSize: size * 0.39,
          color: P.ink,
          fontFamily: "Display",
          letterSpacing: -1,
        }}
      >
        {manager.initials}
      </T>
      <View style={s.avatarCorner} />
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
        <View style={[s.meterFill, { width: `${(score % 1000) / 10}%` }]} />
        {Array.from({ length: 19 }, (_, i) => (
          <View key={i} style={[s.meterDivider, { left: `${(i + 1) * 5}%` }]} />
        ))}
      </View>
    </View>
  );
}
export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#070905" },
  center: { alignItems: "center", justifyContent: "center" },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    backgroundColor: P.ink,
  },
  safeTop: {
    backgroundColor: P.lime,
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
  small: { fontSize: 9, color: P.muted, letterSpacing: 0.35 },
  content: { paddingBottom: 24 },
  topbar: {
    backgroundColor: P.lime,
    paddingHorizontal: 24,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: "#A6CA1A",
    borderBottomWidth: 1,
  },
  brand: {
    fontFamily: "Display",
    fontSize: 18,
    color: P.ink,
    letterSpacing: -0.5,
  },
  topLabel: { fontSize: 7, color: P.ink },
  onlineDot: { width: 5, height: 5, backgroundColor: P.ink },
  hero: {
    backgroundColor: P.lime,
    paddingHorizontal: 24,
    paddingTop: 17,
    paddingBottom: 13,
  },
  eyebrow: { fontSize: 8, color: P.ink, letterSpacing: 0.1 },
  heroTitle: {
    fontFamily: "Display",
    fontSize: 33,
    lineHeight: 35,
    color: P.ink,
    letterSpacing: -1.4,
  },
  heroNumber: {
    fontFamily: "Display",
    fontSize: 64,
    lineHeight: 67,
    color: P.ink,
    letterSpacing: -3,
  },
  heroBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: "#A1C422",
    marginTop: 18,
    paddingTop: 10,
  },
  section: { paddingHorizontal: 24 },
  managerSelect: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: P.line,
  },
  managerName: { fontSize: 21, fontFamily: "Display" },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  avatarStripe: {
    position: "absolute",
    height: "100%",
    width: 9,
    left: 0,
    opacity: 0.15,
    backgroundColor: P.ink,
  },
  avatarCorner: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    backgroundColor: P.ink,
  },
  sectionTitle: { fontFamily: "Display", fontSize: 19, letterSpacing: 0.25 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: P.line,
    backgroundColor: P.ink,
  },
  chipActive: { backgroundColor: P.lime, borderColor: P.lime },
  chipText: { color: P.muted, fontSize: 9 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cell: {
    backgroundColor: P.panel,
    borderWidth: 1,
    borderColor: P.line,
    padding: 10,
    justifyContent: "space-between",
  },
  cellChecked: { backgroundColor: P.lime, borderColor: P.lime },
  cellIndex: { color: P.muted, fontSize: 9 },
  cellCorner: {
    width: 7,
    height: 7,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: P.muted,
  },
  cellText: { fontSize: 15, lineHeight: 17, marginVertical: 8 },
  cellPoints: { fontSize: 8, color: P.lime },
  reroll: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 53,
  },
  scorePanel: {
    borderWidth: 1,
    borderColor: P.line,
    padding: 17,
    backgroundColor: "#151811",
  },
  meterTrack: {
    height: 15,
    backgroundColor: "#303628",
    marginTop: 9,
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
    backgroundColor: P.lime,
    paddingHorizontal: 17,
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  buttonSecondary: {
    backgroundColor: P.panel,
    borderWidth: 1,
    borderColor: P.line,
  },
  buttonText: { color: P.ink, fontFamily: "Display", fontSize: 17 },
  logRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: P.line,
  },
  logDot: { width: 5, height: 5, backgroundColor: P.lime, marginTop: 5 },
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
    marginTop: 28,
    minHeight: 44,
  },
  pageHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderColor: P.line,
    marginBottom: 24,
  },
  pageTitle: { fontFamily: "Display", fontSize: 43, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: P.muted, lineHeight: 22, marginTop: 10 },
  squareButton: {
    width: 44,
    height: 44,
    backgroundColor: P.lime,
    alignItems: "center",
    justifyContent: "center",
  },
  managerCard: {
    backgroundColor: P.panel,
    borderWidth: 1,
    borderColor: P.line,
    padding: 18,
    marginBottom: 13,
  },
  tag: {
    borderWidth: 1,
    borderColor: P.line,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  tagText: { color: P.lime, fontSize: 9 },
  pairing: { backgroundColor: P.lime, padding: 20, marginTop: 15 },
  footerNote: {
    color: P.muted,
    fontSize: 9,
    lineHeight: 17,
    textAlign: "center",
    marginVertical: 25,
  },
  back: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 64 },
  profilePanel: {
    backgroundColor: P.panel,
    borderWidth: 1,
    borderColor: P.line,
    padding: 20,
  },
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
  settingHelp: { fontSize: 13, color: P.muted, marginTop: 5 },
  adminPanel: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    padding: 17,
    borderWidth: 1,
    borderColor: P.line,
    marginBottom: 10,
  },
  navSafe: {
    backgroundColor: "#151811",
    borderTopWidth: 1,
    borderColor: P.line,
  },
  nav: { flexDirection: "row" },
  navItem: { flex: 1, alignItems: "center", paddingTop: 17, paddingBottom: 14 },
  navIndicator: {
    position: "absolute",
    height: 2,
    width: 29,
    top: 0,
    backgroundColor: "transparent",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#000000B8",
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
    borderTopWidth: 2,
    borderColor: P.lime,
    maxHeight: "100%",
  },
  sheetTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 24,
    paddingRight: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: P.line,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetContent: { padding: 24, paddingBottom: 32 },
  modalTitle: { fontFamily: "Display", fontSize: 33, marginBottom: 12 },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderColor: P.line,
  },
  incidentCard: {
    backgroundColor: P.lime,
    padding: 23,
    minHeight: 330,
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 25,
  },
  incidentText: {
    fontFamily: "Display",
    fontSize: 39,
    lineHeight: 43,
    color: P.ink,
    marginVertical: 25,
  },
  cancel: { alignItems: "center", justifyContent: "center", minHeight: 55 },
  report: {
    backgroundColor: P.lime,
    padding: 22,
    marginVertical: 12,
    marginBottom: 24,
  },
  reportLine: { height: 1, backgroundColor: "#7B9808" },
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
  fieldLabel: { color: P.muted, fontSize: 10, marginTop: 23, marginBottom: 10 },
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
  win: { backgroundColor: P.lime, padding: 25, width: "100%", maxWidth: 420 },
  winTitle: {
    fontFamily: "Display",
    fontSize: 100,
    color: P.ink,
    letterSpacing: -4,
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
  warning: { backgroundColor: P.red, padding: 15 },
});
