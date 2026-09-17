import React from "react";
import { StyleSheet, View } from "react-native";
import { type Manager, level } from "./game";
import { getManagerProfile } from "./managerProfiles";
import { Avatar, CyberFrame, Mono, P, Segments, T, TechnicalStrip } from "./ui";
import { ArrowUpRight, Crosshair } from "./icons";

/** Shared dossier layout: character flavour is not presented as recorded incidents. */
export function ManagerDossier({
  manager,
  index,
  score,
  incidents,
  active = false,
  highlighted = false,
  expanded = false,
}: {
  manager: Manager;
  index: number;
  score: number;
  incidents: number;
  active?: boolean;
  highlighted?: boolean;
  expanded?: boolean;
}) {
  const character = getManagerProfile(manager.id);
  const serial = String(index + 1).padStart(3, "0");
  const accent = active || highlighted || expanded ? P.lime : P.muted;
  return (
    <CyberFrame color={accent} fill={P.ink} style={d.frame}>
      <View style={d.header}>
        <Mono style={[d.micro, { color: accent }]}>ДОСЬЕ / {serial}</Mono>
        <View style={d.signal}>
          <Mono style={d.micro}>ЛОКАЛЬНО</Mono>
          <View
            style={{ width: 34 }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Segments value={1} total={4} color={accent} />
          </View>
        </View>
      </View>
      <View style={d.identity}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Mono style={[d.micro, { marginBottom: 5 }]}>
            {manager.role.toUpperCase()}
          </Mono>
          <T style={d.name}>
            {manager.name.toUpperCase()}
            <T style={{ color: P.lime }}>_</T>
          </T>
        </View>
        <View style={d.access}>
          <Crosshair size={21} color={accent} />
          <Mono style={[d.micro, { marginTop: 7 }]}>ОБЪЕКТ {serial}</Mono>
        </View>
      </View>
      <View style={d.scanRow}>
        <View style={d.photoColumn}>
          <View style={{ aspectRatio: 1 }}>
            <Avatar
              manager={manager}
              size={200}
              style={{ width: "100%", height: "100%" }}
            />
          </View>
          <View style={d.photoCaption}>
            <View style={{ width: 5, height: 5, backgroundColor: accent }} />
            <Mono style={[d.micro, { fontSize: 10 }]}>
              {character ? "СНИМОК В АРХИВЕ" : "НЕТ СНИМКА"}
            </Mono>
          </View>
        </View>
        <View style={d.attributes}>
          <Mono style={[d.micro, { color: P.white, marginBottom: 12 }]}>
            АРХЕТИП
          </Mono>
          {character ? (
            character.traits.map((trait) => (
              <View
                key={trait.label}
                style={{ marginBottom: 13 }}
                accessible
                accessibilityLabel={`${trait.label}: ${trait.value} из 10. Характеристика персонажа`}
              >
                <View style={d.traitLabel}>
                  <Mono style={[d.micro, { fontSize: 10 }]}>{trait.label}</Mono>
                  <Mono style={[d.micro, { color: P.white, fontSize: 10 }]}>
                    {String(trait.value).padStart(2, "0")}
                  </Mono>
                </View>
                <Segments value={trait.value / 10} total={10} color={accent} />
              </View>
            ))
          ) : (
            <T style={d.pending}>Профиль ещё не изучен.</T>
          )}
          <Mono style={[d.micro, { fontSize: 9, lineHeight: 13 }]}>
            ИГРОВОЙ ПЕРСОНАЖ
          </Mono>
        </View>
      </View>
      <View style={d.bio}>
        <Mono style={[d.micro, { color: P.lime, marginBottom: 7 }]}>
          &gt; {manager.alias.toUpperCase()}
        </Mono>
        {character && <T style={d.quote}>«{character.quote}»</T>}
        {expanded && (
          <T style={d.bioText}>
            {character?.bio ??
              "Новый объект в базе протокола. Характер проявится после первых зафиксированных событий."}
          </T>
        )}
      </View>
      <View style={d.metrics}>
        {[
          [String(level(score)).padStart(2, "0"), "УРОВЕНЬ"],
          [String(incidents).padStart(2, "0"), "ИНЦИДЕНТЫ"],
          [String(score), "КРИНЖ-ОЧКИ"],
        ].map(([value, label], i) => (
          <View key={label} style={[d.metric, i > 0 && d.metricBorder]}>
            <T style={d.metricValue}>{value}</T>
            <Mono style={[d.micro, { fontSize: 10 }]}>{label}</Mono>
          </View>
        ))}
      </View>
      <View style={d.footer}>
        <View style={{ width: 61, overflow: "hidden" }}>
          <TechnicalStrip color={accent} />
        </View>
        <Mono style={[d.micro, { color: accent, flex: 1, textAlign: "right" }]}>
          {expanded
            ? "ДОСТУП К ДЕЛУ ОТКРЫТ"
            : active
              ? "ПОД НАБЛЮДЕНИЕМ"
              : "ОТКРЫТЬ ДОСЬЕ"}
        </Mono>
        {!expanded && <ArrowUpRight size={18} color={accent} />}
      </View>
    </CyberFrame>
  );
}

const d = StyleSheet.create({
  frame: { padding: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderColor: P.line,
  },
  micro: { fontSize: 11, lineHeight: 15, color: P.muted, letterSpacing: 0.15 },
  signal: { flexDirection: "row", alignItems: "center", gap: 8 },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 13,
    borderBottomWidth: 1,
    borderColor: P.line,
  },
  name: { fontFamily: "Display", fontSize: 34, lineHeight: 39, color: P.white },
  access: { alignItems: "flex-end" },
  scanRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: P.line },
  photoColumn: {
    width: "53%",
    padding: 7,
    borderRightWidth: 1,
    borderColor: P.line,
    justifyContent: "center",
  },
  photoCaption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 7,
    paddingBottom: 2,
  },
  attributes: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 13,
    justifyContent: "center",
  },
  traitLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 2,
    marginBottom: 5,
  },
  pending: { color: P.muted, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  bio: { padding: 13, borderBottomWidth: 1, borderColor: P.line },
  quote: { color: P.white, fontSize: 15, lineHeight: 20 },
  bioText: { color: P.muted, fontSize: 15, lineHeight: 23, marginTop: 13 },
  metrics: { flexDirection: "row", borderBottomWidth: 1, borderColor: P.line },
  metric: { flex: 1, paddingHorizontal: 11, paddingVertical: 12 },
  metricBorder: { borderLeftWidth: 1, borderColor: P.line },
  metricValue: {
    fontFamily: "Display",
    fontSize: 23,
    color: P.white,
    marginBottom: 3,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
});
