import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useFonts } from "expo-font";
import { RobotoCondensed_700Bold } from "@expo-google-fonts/roboto-condensed/700Bold";
import { RobotoCondensed_500Medium } from "@expo-google-fonts/roboto-condensed/500Medium";
import { IBMPlexMono_400Regular } from "@expo-google-fonts/ibm-plex-mono/400Regular";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Crosshair,
  FileText,
  Grid3X3,
  LockKeyhole,
  Plus,
  Radio,
  RefreshCw,
  Settings2,
  Shield,
  SlidersHorizontal,
  Users,
  X,
  Zap,
} from "lucide-react-native";
import {
  Card,
  CATEGORIES,
  Category,
  Game,
  Manager,
  confirmCard,
  createGame,
  level,
  newRound,
  rank,
  reroll,
  restoreGame,
} from "./src/game";
import { T, Mono, Tag, Button, Avatar, Meter, P, s } from "./src/ui";

const STORAGE = "office-protocol:v1";
type Tab = "Бинго" | "Манагеры" | "Настройки";
type Sheet =
  | null
  | "select"
  | "card"
  | "report"
  | "rules"
  | "library"
  | "editCard"
  | "editManager"
  | "reset";
export default function App() {
  return (
    <SafeAreaProvider>
      <OfficeApp />
    </SafeAreaProvider>
  );
}
function OfficeApp() {
  const [fonts, fontError] = useFonts({
    Display: RobotoCondensed_700Bold,
    Body: RobotoCondensed_500Medium,
    Mono: IBMPlexMono_400Regular,
  });
  const [game, setGame] = useState<Game>(createGame);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [tab, setTab] = useState<Tab>("Бинго");
  const [profile, setProfile] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [toast, setToast] = useState("");
  const [win, setWin] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const saveQueue = useRef(Promise.resolve());
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const [editId, setEditId] = useState<string | null>(null);
  const [formText, setFormText] = useState("");
  const [formCategory, setFormCategory] = useState<Category>("Коммуникация");
  const [formPoints, setFormPoints] = useState(100);
  const [formAlias, setFormAlias] = useState("");
  const [formRole, setFormRole] = useState("");
  const manager = game.managers.find((m) => m.id === game.selected)!;
  const board = game.boards[game.selected];
  const card = game.cards.find((c) => c.id === activeCard);
  const entries = game.incidents.filter((i) => i.managerId === manager.id);
  const allMarked = board.marked.length === 9;
  const cellWidth = (Math.min(width, 480) - 48 - 16) / 3;
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE)
      .then((raw) => {
        if (!alive) return;
        if (raw) {
          const restored = restoreGame(JSON.parse(raw));
          if (restored) setGame(restored);
          else
            setStorageError("Сохранение повреждено. Загружена новая сессия.");
        }
      })
      .catch(() => {
        if (alive) setStorageError("Не удалось прочитать сохранение.");
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const snapshot = JSON.stringify(game);
    saveQueue.current = saveQueue.current
      .then(() => AsyncStorage.setItem(STORAGE, snapshot))
      .catch(() =>
        setStorageError(
          "Не удалось сохранить прогресс. Проверьте свободное место.",
        ),
      );
  }, [game, ready]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (sheet) {
        setSheet(null);
        return true;
      }
      if (profile) {
        setProfile(null);
        return true;
      }
      if (tab !== "Бинго") {
        setTab("Бинго");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [sheet, profile, tab]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [tab, profile]);
  function vibrate(success = false) {
    if (game.haptics && Platform.OS !== "web")
      (success
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      ).catch(() => {});
  }
  function confirm() {
    if (!activeCard || board.marked.includes(activeCard)) return;
    const next = confirmCard(game, activeCard);
    const event = next.incidents[0];
    setGame(next);
    setSheet(null);
    vibrate(true);
    if (event.bonus) {
      setWin(true);
      pulse.setValue(0);
      Animated.timing(pulse, {
        toValue: 1,
        duration: 450,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    } else setToast(`Инцидент зафиксирован. +${event.points} очков`);
  }
  function selectManager(id: string) {
    setGame((g) => ({ ...g, selected: id }));
    setCategory(null);
    setSheet(null);
    vibrate();
  }
  function openCard(id: string) {
    setActiveCard(id);
    setSheet("card");
    vibrate();
  }
  function editCard(c?: Card) {
    if (!game.admin) return;
    setEditId(c?.id ?? null);
    setFormText(c?.text ?? "");
    setFormCategory(c?.category ?? "Коммуникация");
    setFormPoints(c?.points ?? 100);
    setSheet("editCard");
  }
  function editManager(m?: Manager) {
    if (!game.admin) return;
    setEditId(m?.id ?? null);
    setFormText(m?.name ?? "");
    setFormAlias(m?.alias ?? "");
    setFormRole(m?.role ?? "");
    setSheet("editManager");
  }
  function saveCard() {
    if (!game.admin || !formText.trim()) return;
    const c: Card = {
      id: editId ?? `custom-${Date.now()}`,
      text: formText.trim(),
      category: formCategory,
      points: formPoints,
    };
    setGame((g) => ({
      ...g,
      cards: editId
        ? g.cards.map((item) => (item.id === editId ? c : item))
        : [...g.cards, c],
    }));
    setSheet("library");
    setToast("Карточка сохранена в общей базе");
  }
  function saveManager() {
    if (!game.admin || !formText.trim() || !formAlias.trim()) return;
    const m: Manager = {
      id: editId ?? `manager-${Date.now()}`,
      name: formText.trim(),
      role: formRole.trim() || "Менеджер",
      alias: formAlias.trim(),
      initials: formText.trim().slice(0, 2).toUpperCase(),
      color: game.managers.find((m) => m.id === editId)?.color ?? P.lime,
    };
    setGame((g) => ({
      ...g,
      managers: editId
        ? g.managers.map((item) => (item.id === editId ? m : item))
        : [...g.managers, m],
      boards: editId
        ? g.boards
        : {
            ...g.boards,
            [m.id]: {
              cards: g.cards.slice(0, 9).map((c) => c.id),
              marked: [],
              score: 0,
              awardedLines: [],
            },
          },
    }));
    setSheet(null);
    setToast("Досье сохранено");
  }
  const report = `OFFICE_PROTOCOL // РАПОРТ О КРИНЖЕ\n\nМанагер: ${manager.name}\nПозывной: ${manager.alias}\nУровень: ${level(board.score)} — ${rank(board.score)}\nЗафиксировано: ${entries.length} инцидентов\nВсего очков: ${board.score}\n\n${entries
    .slice(0, 8)
    .map(
      (i) =>
        `• ${i.text} (+${i.points}${i.bonus ? `, бинго +${i.bonus}` : ""})`,
    )
    .join("\n")}\n\nВсе персонажи вымышлены. Все совпадения — повод для бинго.`;
  async function shareReport() {
    try {
      if (
        Platform.OS === "web" &&
        typeof navigator !== "undefined" &&
        !navigator.share
      ) {
        await navigator.clipboard.writeText(report);
        setToast("Рапорт скопирован. Можно отправлять");
      } else
        await Share.share({ message: report, title: "Рапорт OFFICE_PROTOCOL" });
    } catch (e) {
      if ((e as Error).name !== "AbortError")
        setToast("Не удалось отправить рапорт. Попробуйте ещё раз");
    }
  }
  if (!ready || (!fonts && !fontError))
    return (
      <View style={[s.root, s.center]}>
        <Text style={{ color: P.lime, fontSize: 22 }}>OFFICE_PROTOCOL</Text>
        <Text style={{ color: P.white, marginTop: 12 }}>
          Загрузка протокола…
        </Text>
      </View>
    );
  return (
    <View style={s.root}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]} style={s.safeTop} />
      <View style={s.phone}>
        <View style={s.topbar}>
          <View style={s.row}>
            <Crosshair size={19} color={P.ink} strokeWidth={2} />
            <T style={s.brand}>OFFICE_PROTOCOL</T>
          </View>
          <View style={s.row}>
            <View style={s.onlineDot} />
            <Mono style={s.topLabel}>СИСТЕМА АКТИВНА</Mono>
          </View>
        </View>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          {!!storageError && (
            <Pressable
              accessibilityRole="button"
              onPress={() => setStorageError("")}
              style={s.warning}
            >
              <T style={{ color: P.ink }}>{storageError}</T>
            </Pressable>
          )}
          {tab === "Бинго" && (
            <>
              <View style={s.hero}>
                <View style={s.between}>
                  <Mono style={s.eyebrow}>
                    ПРОТОКОЛ № 001 / ОФИСНЫЕ АНОМАЛИИ
                  </Mono>
                  <Crosshair size={17} color={P.ink} />
                </View>
                <View
                  style={[s.between, { alignItems: "flex-end", marginTop: 13 }]}
                >
                  <T
                    style={[
                      s.heroTitle,
                      { fontSize: Math.min(33, (width - 110) / 8.3) },
                    ]}
                  >
                    КРИНЖ{`\n`}ПОД КОНТРОЛЕМ
                  </T>
                  <View style={{ alignItems: "flex-end", paddingBottom: 5 }}>
                    <T style={s.heroNumber}>
                      {String(level(board.score)).padStart(2, "0")}
                    </T>
                    <Mono style={s.eyebrow}>УРОВЕНЬ</Mono>
                  </View>
                </View>
                <View style={s.heroBottom}>
                  <View style={s.row}>
                    <Radio size={14} color={P.ink} />
                    <Mono style={s.eyebrow}>НАБЛЮДАЕМ. ФИКСИРУЕМ.</Mono>
                  </View>
                  <ArrowDownRight color={P.ink} size={20} />
                </View>
              </View>
              <View style={s.section}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Выбрать манагера"
                  onPress={() => setSheet("select")}
                  style={s.managerSelect}
                >
                  <Avatar manager={manager} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <Mono style={s.small}>ОБЪЕКТ НАБЛЮДЕНИЯ</Mono>
                    <T style={s.managerName}>
                      {manager.name}{" "}
                      <T style={{ color: P.muted, fontSize: 16 }}>
                        {" "}
                        / {manager.alias}
                      </T>
                    </T>
                  </View>
                  <ChevronDown size={18} color={P.lime} />
                </Pressable>
                <View style={[s.between, { marginTop: 26, marginBottom: 15 }]}>
                  <T style={s.sectionTitle}>МАТРИЦА БИНГО</T>
                  <Mono style={{ color: P.lime, fontSize: 10 }}>
                    {board.marked.length} ИЗ 9 ЗАФИКСИРОВАНО
                  </Mono>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 7, paddingBottom: 15 }}
                >
                  {[null, ...CATEGORIES].map((c) => (
                    <Pressable
                      key={c ?? "all"}
                      accessibilityRole="button"
                      accessibilityState={{ selected: category === c }}
                      onPress={() => setCategory(c)}
                      style={[s.chip, category === c && s.chipActive]}
                    >
                      <Mono
                        style={[s.chipText, category === c && { color: P.ink }]}
                      >
                        {c ?? "Все события"}
                      </Mono>
                    </Pressable>
                  ))}
                </ScrollView>
                <View style={s.grid}>
                  {board.cards.map((id, index) => {
                    const c = game.cards.find((c) => c.id === id)!;
                    const checked = board.marked.includes(id);
                    const dim = category !== null && c.category !== category;
                    return (
                      <Pressable
                        key={id}
                        accessibilityRole="button"
                        accessibilityLabel={`${c.text}, ${c.points} очков${checked ? ", зафиксировано" : ""}`}
                        accessibilityState={{ selected: checked }}
                        onPress={() => openCard(id)}
                        style={({ pressed }) => [
                          s.cell,
                          {
                            width: cellWidth,
                            height: Math.max(126, cellWidth * 1.17),
                          },
                          checked && s.cellChecked,
                          dim && { opacity: 0.3 },
                          pressed && { transform: [{ scale: 0.97 }] },
                        ]}
                      >
                        <View style={s.between}>
                          <Mono
                            style={[
                              s.cellIndex,
                              checked && { color: "#496000" },
                            ]}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </Mono>
                          {checked ? (
                            <Check size={14} color={P.ink} />
                          ) : (
                            <View style={s.cellCorner} />
                          )}
                        </View>
                        <T
                          numberOfLines={4}
                          style={[s.cellText, checked && { color: P.ink }]}
                        >
                          {c.text}
                        </T>
                        <Mono
                          style={[s.cellPoints, checked && { color: P.ink }]}
                        >
                          {checked ? "ЗАФИКСИРОВАНО" : `+${c.points} КРИНЖА`}
                        </Mono>
                      </Pressable>
                    );
                  })}
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setGame(allMarked ? newRound(game) : reroll(game));
                    setCategory(null);
                    setToast(
                      allMarked
                        ? "Новая смена началась. Очки сохранены"
                        : "Неотмеченные карточки обновлены",
                    );
                    vibrate();
                  }}
                  style={s.reroll}
                >
                  <RefreshCw size={15} color={P.muted} />
                  <Mono style={{ color: P.muted, fontSize: 10 }}>
                    {allMarked
                      ? "НАЧАТЬ НОВУЮ СМЕНУ"
                      : "ОБНОВИТЬ НЕЗАЧЁРКНУТЫЕ"}
                  </Mono>
                </Pressable>
                <View style={s.scorePanel}>
                  <View style={[s.between, { marginBottom: 17 }]}>
                    <View style={s.row}>
                      <Zap size={18} color={P.lime} />
                      <T style={{ fontSize: 17 }}>НАКОПЛЕНО КРИНЖА</T>
                    </View>
                    <T
                      style={{
                        fontSize: 25,
                        color: P.lime,
                        fontFamily: "Display",
                      }}
                    >
                      {board.score}
                      <T style={{ fontSize: 11, color: P.muted }}> ОЧ.</T>
                    </T>
                  </View>
                  <Meter score={board.score} />
                  <View style={[s.between, { marginTop: 10 }]}>
                    <Mono style={{ fontSize: 9, color: P.muted }}>
                      {rank(board.score).toUpperCase()}
                    </Mono>
                    <Mono style={{ fontSize: 9, color: P.muted }}>
                      ДО УР. {level(board.score) + 1}:{" "}
                      {1000 - (board.score % 1000)}
                    </Mono>
                  </View>
                </View>
                <View style={{ marginTop: 16 }}>
                  <Button
                    secondary
                    onPress={() => setSheet("report")}
                    icon={FileText}
                  >
                    СФОРМИРОВАТЬ РАПОРТ
                  </Button>
                </View>
                <View style={[s.between, { marginTop: 28, marginBottom: 14 }]}>
                  <T style={s.sectionTitle}>ЖУРНАЛ СОБЫТИЙ</T>
                  <Mono style={s.small}>
                    {String(entries.length).padStart(2, "0")}
                  </Mono>
                </View>
                {entries.length ? (
                  entries.slice(0, 3).map((i) => (
                    <View key={i.id} style={s.logRow}>
                      <View style={s.logDot} />
                      <View style={{ flex: 1 }}>
                        <T style={{ fontSize: 15 }}>{i.text}</T>
                        <Mono style={[s.small, { marginTop: 5 }]}>
                          {new Date(i.at).toLocaleDateString("ru-RU", {
                            day: "2-digit",
                            month: "2-digit",
                          })}{" "}
                          /{" "}
                          {new Date(i.at).toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Mono>
                      </View>
                      <Mono style={{ color: P.lime, fontSize: 11 }}>
                        +{i.points + i.bonus}
                      </Mono>
                    </View>
                  ))
                ) : (
                  <View style={s.emptyLog}>
                    <Radio size={21} color={P.muted} />
                    <View style={{ flex: 1 }}>
                      <T style={{ fontSize: 16 }}>
                        Пока подозрительно спокойно
                      </T>
                      <T style={{ fontSize: 13, color: P.muted, marginTop: 3 }}>
                        Заметили выходку? Нажмите на карточку.
                      </T>
                    </View>
                  </View>
                )}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSheet("rules")}
                  style={s.rulesLink}
                >
                  <Mono style={{ color: P.muted, fontSize: 10 }}>
                    КАК РАБОТАЕТ ПРОТОКОЛ
                  </Mono>
                  <ArrowUpRight size={14} color={P.muted} />
                </Pressable>
              </View>
            </>
          )}
          {tab === "Манагеры" && !profile && (
            <>
              <View style={s.pageHeader}>
                <Mono style={s.small}>
                  БАЗА ОБЪЕКТОВ /{" "}
                  {String(game.managers.length).padStart(2, "0")}
                </Mono>
                <View style={[s.between, { marginTop: 8 }]}>
                  <T style={s.pageTitle}>МАНАГЕРЫ</T>
                  {game.admin && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Добавить манагера"
                      onPress={() => editManager()}
                      style={s.squareButton}
                    >
                      <Plus size={24} color={P.ink} />
                    </Pressable>
                  )}
                </View>
                <T style={s.subtitle}>
                  Лица, стоящие за фразой «тут на пять минут».
                </T>
              </View>
              <View style={s.section}>
                {game.managers.map((m, i) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Досье: ${m.name}`}
                    key={m.id}
                    onPress={() => setProfile(m.id)}
                    style={s.managerCard}
                  >
                    <View style={[s.between, { marginBottom: 18 }]}>
                      <Mono style={s.small}>
                        ДОСЬЕ / {String(i + 1).padStart(3, "0")}
                      </Mono>
                      <Tag>УР. {level(game.boards[m.id].score)}</Tag>
                    </View>
                    <View style={s.row}>
                      <Avatar manager={m} size={64} />
                      <View style={{ flex: 1, gap: 4 }}>
                        <T style={{ fontFamily: "Display", fontSize: 28 }}>
                          {m.name}
                        </T>
                        <T style={{ color: P.muted, fontSize: 14 }}>
                          {m.alias}
                        </T>
                      </View>
                      <ArrowUpRight size={23} color={P.lime} />
                    </View>
                    <View style={{ marginTop: 20 }}>
                      <Meter score={game.boards[m.id].score} />
                    </View>
                  </Pressable>
                ))}
                {game.managers.length >= 2 && (
                  <View style={s.pairing}>
                    <Mono style={[s.small, { color: P.ink }]}>
                      АНАЛИЗ СОВМЕСТИМОСТИ
                    </Mono>
                    <View style={[s.between, { marginTop: 15 }]}>
                      <T
                        style={{
                          fontFamily: "Display",
                          fontSize: 32,
                          color: P.ink,
                          lineHeight: 32,
                        }}
                      >
                        ОНИ БЫ{`\n`}СРАБОТАЛИСЬ.
                      </T>
                      <View style={{ flexDirection: "row" }}>
                        <Avatar manager={game.managers[0]} size={46} />
                        <View style={{ marginLeft: -10, marginTop: 20 }}>
                          <Avatar manager={game.managers[1]} size={46} />
                        </View>
                      </View>
                    </View>
                    <T style={{ color: P.ink, marginTop: 15, fontSize: 15 }}>
                      {game.managers[0].name} назначает созвоны.{" "}
                      {game.managers[1].name} приносит правки. Вечный двигатель
                      найден.
                    </T>
                    <Mono style={{ fontSize: 9, color: P.ink, marginTop: 18 }}>
                      ВЕРДИКТ: ОПАСНО ДЛЯ ДЕДЛАЙНА
                    </Mono>
                  </View>
                )}
                <Mono style={s.footerNote}>
                  ВСЕ ПЕРСОНАЖИ ВЫМЫШЛЕНЫ.{`\n`}СОВПАДЕНИЯ — ПОВОД ДЛЯ БИНГО.
                </Mono>
              </View>
            </>
          )}
          {tab === "Манагеры" &&
            profile &&
            (() => {
              const m = game.managers.find((m) => m.id === profile)!;
              const b = game.boards[m.id];
              const events = game.incidents.filter((i) => i.managerId === m.id);
              return (
                <View style={s.section}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setProfile(null)}
                    style={s.back}
                  >
                    <ArrowLeft size={19} color={P.lime} />
                    <Mono style={{ color: P.lime, fontSize: 11 }}>
                      К СПИСКУ ОБЪЕКТОВ
                    </Mono>
                  </Pressable>
                  <View style={s.profilePanel}>
                    <View style={s.between}>
                      <Mono style={s.small}>ЛИЧНОЕ ДЕЛО</Mono>
                      <Crosshair size={20} color={P.lime} />
                    </View>
                    <View style={{ alignItems: "center", paddingVertical: 25 }}>
                      <Avatar manager={m} size={104} />
                      <T
                        style={{
                          fontFamily: "Display",
                          fontSize: 49,
                          marginTop: 17,
                        }}
                      >
                        {m.name.toUpperCase()}
                      </T>
                      <T style={{ color: P.lime, fontSize: 18, marginTop: 2 }}>
                        {m.alias}
                      </T>
                      <Mono style={[s.small, { marginTop: 10 }]}>
                        {m.role.toUpperCase()}
                      </Mono>
                    </View>
                    <View style={s.stats}>
                      <View>
                        <T style={s.statNumber}>
                          {String(level(b.score)).padStart(2, "0")}
                        </T>
                        <Mono style={s.small}>УРОВЕНЬ</Mono>
                      </View>
                      <View>
                        <T style={s.statNumber}>
                          {String(events.length).padStart(2, "0")}
                        </T>
                        <Mono style={s.small}>ИНЦИДЕНТЫ</Mono>
                      </View>
                      <View>
                        <T style={s.statNumber}>{b.score}</T>
                        <Mono style={s.small}>КРИНЖ</Mono>
                      </View>
                    </View>
                    <Meter score={b.score} />
                  </View>
                  <T
                    style={[
                      s.sectionTitle,
                      { marginTop: 28, marginBottom: 15 },
                    ]}
                  >
                    ПРОФИЛЬ АНОМАЛИЙ
                  </T>
                  {CATEGORIES.map((c) => (
                    <View key={c} style={s.settingRow}>
                      <T>{c}</T>
                      <Tag>
                        СОБЫТИЯ: {events.filter((i) => i.category === c).length}
                      </Tag>
                    </View>
                  ))}
                  <T style={[s.subtitle, { marginBottom: 22 }]}>
                    {events.length
                      ? "Паттерны обнаружены. Продолжаем наблюдение."
                      : "Данных пока мало. Откройте бинго и зафиксируйте первый инцидент."}
                  </T>
                  <Button
                    onPress={() => {
                      selectManager(m.id);
                      setProfile(null);
                      setTab("Бинго");
                    }}
                    icon={Grid3X3}
                  >
                    ОТКРЫТЬ БИНГО МАНАГЕРА
                  </Button>
                  {game.admin && (
                    <View style={{ marginTop: 12 }}>
                      <Button
                        secondary
                        icon={SlidersHorizontal}
                        onPress={() => editManager(m)}
                      >
                        РЕДАКТИРОВАТЬ ДОСЬЕ
                      </Button>
                    </View>
                  )}
                </View>
              );
            })()}
          {tab === "Настройки" && (
            <>
              <View style={s.pageHeader}>
                <Mono style={s.small}>КОНФИГУРАЦИЯ / ЛОКАЛЬНЫЙ УЗЕЛ</Mono>
                <T style={[s.pageTitle, { marginTop: 8 }]}>НАСТРОЙКИ</T>
                <T style={s.subtitle}>Ваш офис. Ваши правила протокола.</T>
              </View>
              <View style={s.section}>
                <View style={s.adminPanel}>
                  <Shield size={28} color={P.lime} />
                  <View style={{ flex: 1 }}>
                    <T style={{ fontSize: 20 }}>{game.admin ? "ЛОКАЛЬНЫЙ АДМИН" : "НАБЛЮДАТЕЛЬ"}</T>
                    <T style={{ fontSize: 14, color: P.muted, marginTop: 5 }}>
                      Управление досье и общей базой карточек
                    </T>
                  </View>
                  <Tag>01</Tag>
                </View>
                <View style={s.settingRow}>
                  <View style={{ flex: 1 }}>
                    <T style={{ fontSize: 18 }}>Режим администратора</T>
                    <T style={s.settingHelp}>
                      Отключите, чтобы оставить только игру
                    </T>
                  </View>
                  <Switch
                    accessibilityLabel="Режим администратора"
                    value={game.admin}
                    onValueChange={(admin) => setGame((g) => ({ ...g, admin }))}
                    trackColor={{ false: P.line, true: P.lime }}
                    thumbColor={P.ink}
                  />
                </View>
                <View style={s.settingRow}>
                  <View style={{ flex: 1 }}>
                    <T style={{ fontSize: 18 }}>Тактильный отклик</T>
                    <T style={s.settingHelp}>Короткий импульс при фиксации</T>
                  </View>
                  <Switch
                    accessibilityLabel="Тактильный отклик"
                    value={game.haptics}
                    onValueChange={(haptics) =>
                      setGame((g) => ({ ...g, haptics }))
                    }
                    trackColor={{ false: P.line, true: P.lime }}
                    thumbColor={P.ink}
                  />
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSheet("library")}
                  style={s.settingRow}
                >
                  <View style={s.row}>
                    <Grid3X3 size={21} color={P.lime} />
                    <View>
                      <T style={{ fontSize: 18 }}>База карточек</T>
                      <T style={s.settingHelp}>
                        Карточек: {game.cards.length} · общий набор
                      </T>
                    </View>
                  </View>
                  <ChevronRight size={20} color={P.muted} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSheet("rules")}
                  style={s.settingRow}
                >
                  <View style={s.row}>
                    <FileText size={21} color={P.lime} />
                    <T style={{ fontSize: 18 }}>Правила протокола</T>
                  </View>
                  <ChevronRight size={20} color={P.muted} />
                </Pressable>
                <View style={[s.scorePanel, { marginTop: 25 }]}>
                  <View style={s.row}>
                    <LockKeyhole size={18} color={P.lime} />
                    <Mono style={{ color: P.lime, fontSize: 10 }}>
                      ДАННЫЕ НА ЭТОМ УСТРОЙСТВЕ
                    </Mono>
                  </View>
                  <T
                    style={{
                      color: P.muted,
                      fontSize: 15,
                      marginTop: 13,
                      lineHeight: 21,
                    }}
                  >
                    Прогресс сохраняется автоматически. Аккаунт и интернет для
                    игры не нужны. Удаление приложения удалит локальную историю.
                  </T>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSheet("reset")}
                  style={[s.settingRow, { marginTop: 15 }]}
                >
                  <T style={{ color: P.red, fontSize: 17 }}>
                    Сбросить весь прогресс
                  </T>
                  <RefreshCw color={P.red} size={18} />
                </Pressable>
                <View
                  style={{ paddingVertical: 40, alignItems: "center", gap: 8 }}
                >
                  <Crosshair size={30} color={P.lime} />
                  <T style={{ fontFamily: "Display", fontSize: 23 }}>
                    OFFICE_PROTOCOL
                  </T>
                  <Mono style={s.small}>
                    ВЕРСИЯ 1.0 / СДЕЛАНО МЕЖДУ СОЗВОНАМИ
                  </Mono>
                </View>
              </View>
            </>
          )}
        </ScrollView>
        <SafeAreaView edges={["bottom"]} style={s.navSafe}>
          <View style={s.nav}>
            {(["Бинго", "Манагеры", "Настройки"] as Tab[]).map((t, i) => {
              const Icon = [Grid3X3, Users, Settings2][i];
              return (
                <Pressable
                  key={t}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: tab === t }}
                  onPress={() => {
                    setTab(t);
                    setProfile(null);
                    vibrate();
                  }}
                  style={s.navItem}
                >
                  <View
                    style={[
                      s.navIndicator,
                      tab === t && { backgroundColor: P.lime },
                    ]}
                  />
                  <Icon
                    size={22}
                    color={tab === t ? P.lime : P.muted}
                    strokeWidth={1.7}
                  />
                  <T
                    style={{
                      fontSize: 13,
                      color: tab === t ? P.lime : P.muted,
                      marginTop: 5,
                    }}
                  >
                    {t}
                  </T>
                </Pressable>
              );
            })}
          </View>
        </SafeAreaView>
        {!!toast && (
          <View style={[s.toast, { pointerEvents: "none" }]}>
            <Check size={16} color={P.ink} />
            <T style={{ color: P.ink, fontSize: 15, flex: 1 }}>{toast}</T>
          </View>
        )}
        <Modal
          transparent
          visible={sheet !== null}
          animationType="slide"
          onRequestClose={() => setSheet(null)}
        >
          <View style={s.modalBackdrop}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Закрыть окно"
              style={StyleSheet.absoluteFill}
              onPress={() => setSheet(null)}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={s.modalKeyboard}
            >
              <SafeAreaView edges={["bottom"]} style={s.sheet}>
                <View style={s.sheetTop}>
                  <Mono style={{ fontSize: 10, color: P.lime }}>
                    OFFICE_PROTOCOL /{" "}
                    {sheet === "card" ? "ИНЦИДЕНТ" : "СИСТЕМА"}
                  </Mono>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Закрыть"
                    hitSlop={8}
                    onPress={() => setSheet(null)}
                    style={s.closeButton}
                  >
                    <X size={24} color={P.white} />
                  </Pressable>
                </View>
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={s.sheetContent}
                >
                  {sheet === "select" && (
                    <>
                      <T style={s.modalTitle}>КОГО НАБЛЮДАЕМ?</T>
                      <T style={s.subtitle}>
                        У каждого манагера — своё бинго и прогресс.
                      </T>
                      {game.managers.map((m) => (
                        <Pressable
                          key={m.id}
                          accessibilityRole="button"
                          onPress={() => selectManager(m.id)}
                          style={s.selectRow}
                        >
                          <Avatar manager={m} />
                          <View style={{ flex: 1 }}>
                            <T style={{ fontSize: 22 }}>{m.name}</T>
                            <T style={{ fontSize: 14, color: P.muted }}>
                              {m.alias}
                            </T>
                          </View>
                          {m.id === manager.id ? (
                            <Check size={22} color={P.lime} />
                          ) : (
                            <ChevronRight size={22} color={P.muted} />
                          )}
                        </Pressable>
                      ))}
                    </>
                  )}
                  {sheet === "card" && card && (
                    <>
                      <View style={s.between}>
                        <Tag>{card.category.toUpperCase()}</Tag>
                        <Mono style={s.small}>
                          ИНЦИДЕНТ /{" "}
                          {String(game.cards.indexOf(card) + 1).padStart(
                            3,
                            "0",
                          )}
                        </Mono>
                      </View>
                      <View style={s.incidentCard}>
                        <Crosshair size={36} color={P.ink} />
                        <T style={s.incidentText}>{card.text.toUpperCase()}</T>
                        <View style={s.between}>
                          <Mono style={{ color: P.ink, fontSize: 11 }}>
                            СТЕПЕНЬ КРИНЖА
                          </Mono>
                          <T
                            style={{
                              fontFamily: "Display",
                              fontSize: 40,
                              color: P.ink,
                            }}
                          >
                            +{card.points}
                          </T>
                        </View>
                      </View>
                      <T style={{ fontSize: 18, marginBottom: 8 }}>
                        {board.marked.includes(card.id)
                          ? "Этот инцидент уже зафиксирован."
                          : `${manager.name} снова отличился?`}
                      </T>
                      <T style={[s.subtitle, { marginBottom: 24 }]}>
                        {board.marked.includes(card.id)
                          ? "Очки начислены. Наблюдение продолжается."
                          : "Подтвердите, если это действительно произошло. Протокол всё запомнит."}
                      </T>
                      {board.marked.includes(card.id) ? (
                        <Button onPress={() => setSheet(null)} icon={Check}>
                          ПОНЯТНО, НАБЛЮДАЕМ
                        </Button>
                      ) : (
                        <>
                          <Button onPress={confirm} icon={Check}>
                            ЗАФИКСИРОВАТЬ · +{card.points}
                          </Button>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => setSheet(null)}
                            style={s.cancel}
                          >
                            <T style={{ color: P.muted }}>Ложная тревога</T>
                          </Pressable>
                        </>
                      )}
                    </>
                  )}
                  {sheet === "report" && (
                    <>
                      <T style={s.modalTitle}>РАПОРТ О КРИНЖЕ</T>
                      <View style={s.report}>
                        <View style={s.between}>
                          <Crosshair color={P.ink} size={29} />
                          <Mono style={{ color: P.ink, fontSize: 10 }}>
                            ВНУТРЕННИЙ ДОКУМЕНТ{`\n`}ОФИС / СЕКТОР 01
                          </Mono>
                        </View>
                        <T
                          style={{
                            fontFamily: "Display",
                            fontSize: 44,
                            color: P.ink,
                            marginTop: 23,
                          }}
                        >
                          ОБЪЕКТ: {manager.name.toUpperCase()}
                        </T>
                        <T style={{ color: P.ink, fontSize: 20, marginTop: 5 }}>
                          {manager.alias}
                        </T>
                        <View style={[s.reportLine, { marginVertical: 23 }]} />
                        <T
                          style={{
                            fontFamily: "Display",
                            fontSize: 68,
                            color: P.ink,
                          }}
                        >
                          {board.score}
                          <T style={{ fontSize: 20, color: P.ink }}>
                            {" "}
                            ОЧКОВ КРИНЖА
                          </T>
                        </T>
                        <Mono style={{ color: P.ink, fontSize: 11 }}>
                          УРОВЕНЬ {level(board.score)} /{" "}
                          {rank(board.score).toUpperCase()}
                        </Mono>
                        <View style={[s.reportLine, { marginVertical: 23 }]} />
                        {entries.length ? (
                          entries.slice(0, 5).map((i, n) => (
                            <View
                              key={i.id}
                              style={{
                                flexDirection: "row",
                                gap: 10,
                                marginBottom: 12,
                              }}
                            >
                              <Mono style={{ color: P.ink, fontSize: 10 }}>
                                {String(n + 1).padStart(2, "0")}
                              </Mono>
                              <T
                                style={{ color: P.ink, fontSize: 17, flex: 1 }}
                              >
                                {i.text}
                              </T>
                            </View>
                          ))
                        ) : (
                          <T style={{ color: P.ink, fontSize: 18 }}>
                            Инцидентов нет. Репутация пока чиста.
                          </T>
                        )}
                        <View
                          style={[
                            s.reportLine,
                            { marginTop: 15, marginBottom: 18 },
                          ]}
                        />
                        <Mono style={{ color: P.ink, fontSize: 10 }}>
                          ВЕРДИКТ:{" "}
                          {entries.length
                            ? "ПРОДОЛЖИТЬ НАБЛЮДЕНИЕ"
                            : "НЕ ТЕРЯТЬ БДИТЕЛЬНОСТЬ"}
                        </Mono>
                        <View style={s.barcode}>
                          {Array.from({ length: 55 }, (_, i) => (
                            <View
                              key={i}
                              style={{
                                width: i % 3 === 0 ? 3 : 1,
                                height: 25,
                                backgroundColor: P.ink,
                              }}
                            />
                          ))}
                        </View>
                        <Mono
                          style={{ color: P.ink, fontSize: 9, marginTop: 8 }}
                        >
                          OFFICE_PROTOCOL / СОВПАДЕНИЯ НЕ СЛУЧАЙНЫ
                        </Mono>
                      </View>
                      <Button onPress={shareReport}>ПОДЕЛИТЬСЯ РАПОРТОМ</Button>
                      <T
                        style={[
                          s.subtitle,
                          { textAlign: "center", marginTop: 12 },
                        ]}
                      >
                        Отправим текстовый рапорт с инцидентами.
                      </T>
                    </>
                  )}
                  {sheet === "rules" && (
                    <>
                      <T style={s.modalTitle}>ПРАВИЛА ПРОТОКОЛА</T>
                      {[
                        [
                          "01",
                          "Выберите объект",
                          "У каждого манагера отдельная матрица 3×3. Карточки берутся из общей базы.",
                        ],
                        [
                          "02",
                          "Фиксируйте выходки",
                          "Нажмите на карточку и подтвердите событие. За инцидент начисляется от 50 до 200 очков. Отметка в текущей смене окончательная.",
                        ],
                        [
                          "03",
                          "Соберите бинго",
                          "Ряд, столбец или диагональ — это бинго и +300 очков за каждую новую линию. Каждая 1 000 очков повышает уровень.",
                        ],
                        [
                          "04",
                          "Продолжайте смену",
                          "Обновление заменяет только неотмеченные карточки. После заполнения всей матрицы можно начать новую смену, сохранив очки.",
                        ],
                        [
                          "05",
                          "Поделитесь рапортом",
                          "Соберите отчёт с последними инцидентами и отправьте друзьям. Это шуточная игра с вымышленными персонажами.",
                        ],
                      ].map(([n, title, body]) => (
                        <View key={n} style={s.rule}>
                          <Mono style={{ color: P.lime, fontSize: 15 }}>
                            {n}
                          </Mono>
                          <View style={{ flex: 1 }}>
                            <T style={{ fontSize: 23, marginBottom: 6 }}>
                              {title}
                            </T>
                            <T
                              style={{
                                fontSize: 16,
                                lineHeight: 23,
                                color: P.muted,
                              }}
                            >
                              {body}
                            </T>
                          </View>
                        </View>
                      ))}
                    </>
                  )}
                  {sheet === "library" && (
                    <>
                      <View style={s.between}>
                        <T style={s.modalTitle}>БАЗА КАРТОЧЕК</T>
                        <Tag>{game.cards.length}</Tag>
                      </View>
                      {game.admin && (
                        <Button onPress={() => editCard()} icon={Plus}>
                          ДОБАВИТЬ ВЫХОДКУ
                        </Button>
                      )}
                      {game.cards.map((c) => (
                        <Pressable
                          accessibilityRole="button"
                          disabled={!game.admin}
                          key={c.id}
                          onPress={() => editCard(c)}
                          style={s.libraryRow}
                        >
                          <View style={{ flex: 1 }}>
                            <T style={{ fontSize: 18 }}>{c.text}</T>
                            <Mono style={[s.small, { marginTop: 7 }]}>
                              {c.category.toUpperCase()} / +{c.points}
                            </Mono>
                          </View>
                          {game.admin && (
                            <SlidersHorizontal size={18} color={P.lime} />
                          )}
                        </Pressable>
                      ))}
                    </>
                  )}
                  {sheet === "editCard" && (
                    <>
                      <T style={s.modalTitle}>
                        {editId ? "ИЗМЕНИТЬ КАРТОЧКУ" : "НОВАЯ ВЫХОДКА"}
                      </T>
                      <Mono style={s.fieldLabel}>ЧТО ОПЯТЬ СЛУЧИЛОСЬ?</Mono>
                      <TextInput
                        accessibilityLabel="Текст выходки"
                        value={formText}
                        onChangeText={setFormText}
                        maxLength={100}
                        multiline
                        placeholder="Например: назначил созвон, чтобы отменить созвон"
                        placeholderTextColor={P.muted}
                        style={[
                          s.input,
                          { minHeight: 120, textAlignVertical: "top" },
                        ]}
                      />
                      <Mono
                        style={[s.small, { textAlign: "right", marginTop: 6 }]}
                      >
                        {formText.length} / 100
                      </Mono>
                      <Mono style={s.fieldLabel}>КАТЕГОРИЯ</Mono>
                      <View style={s.wrap}>
                        {CATEGORIES.map((c) => (
                          <Pressable
                            key={c}
                            accessibilityRole="button"
                            onPress={() => setFormCategory(c)}
                            style={[s.chip, c === formCategory && s.chipActive]}
                          >
                            <T
                              style={{
                                color: c === formCategory ? P.ink : P.white,
                                fontSize: 16,
                              }}
                            >
                              {c}
                            </T>
                          </Pressable>
                        ))}
                      </View>
                      <Mono style={s.fieldLabel}>ОЧКИ КРИНЖА</Mono>
                      <View style={s.wrap}>
                        {[50, 100, 150, 200].map((n) => (
                          <Pressable
                            key={n}
                            accessibilityRole="button"
                            onPress={() => setFormPoints(n)}
                            style={[s.chip, n === formPoints && s.chipActive]}
                          >
                            <Mono
                              style={{
                                color: n === formPoints ? P.ink : P.white,
                              }}
                            >
                              +{n}
                            </Mono>
                          </Pressable>
                        ))}
                      </View>
                      <View style={{ marginTop: 30 }}>
                        <Button
                          disabled={!game.admin || !formText.trim()}
                          onPress={saveCard}
                          icon={Check}
                        >
                          СОХРАНИТЬ КАРТОЧКУ
                        </Button>
                      </View>
                    </>
                  )}
                  {sheet === "editManager" && (
                    <>
                      <T style={s.modalTitle}>
                        {editId ? "ИЗМЕНИТЬ ДОСЬЕ" : "НОВЫЙ МАНАГЕР"}
                      </T>
                      <Mono style={s.fieldLabel}>ИМЯ</Mono>
                      <TextInput
                        accessibilityLabel="Имя манагера"
                        value={formText}
                        onChangeText={setFormText}
                        maxLength={24}
                        placeholder="Кого будем наблюдать?"
                        placeholderTextColor={P.muted}
                        style={s.input}
                      />
                      <Mono style={s.fieldLabel}>ПОЗЫВНОЙ</Mono>
                      <TextInput
                        accessibilityLabel="Позывной"
                        value={formAlias}
                        onChangeText={setFormAlias}
                        maxLength={50}
                        placeholder="Повелитель таблиц"
                        placeholderTextColor={P.muted}
                        style={s.input}
                      />
                      <Mono style={s.fieldLabel}>ДОЛЖНОСТЬ</Mono>
                      <TextInput
                        accessibilityLabel="Должность"
                        value={formRole}
                        onChangeText={setFormRole}
                        maxLength={40}
                        placeholder="Менеджер"
                        placeholderTextColor={P.muted}
                        style={s.input}
                      />
                      <View style={{ marginTop: 30 }}>
                        <Button
                          disabled={
                            !game.admin || !formText.trim() || !formAlias.trim()
                          }
                          onPress={saveManager}
                          icon={Check}
                        >
                          СОХРАНИТЬ ДОСЬЕ
                        </Button>
                      </View>
                    </>
                  )}
                  {sheet === "reset" && (
                    <>
                      <RefreshCw color={P.red} size={34} />
                      <T style={[s.modalTitle, { marginTop: 20 }]}>
                        ОБНУЛИТЬ ПРОТОКОЛ?
                      </T>
                      <T style={[s.subtitle, { marginBottom: 25 }]}>
                        Очки, отметки и журнал инцидентов всех манагеров будут
                        удалены. Ваши карточки и досье останутся. Отменить сброс
                        нельзя.
                      </T>
                      <Button
                        onPress={() => {
                          setGame((g) => ({
                            ...g,
                            incidents: [],
                            boards: Object.fromEntries(
                              g.managers.map((m) => [
                                m.id,
                                {
                                  cards: g.cards.slice(0, 9).map((c) => c.id),
                                  marked: [],
                                  score: 0,
                                  awardedLines: [],
                                },
                              ]),
                            ),
                          }));
                          setSheet(null);
                          setToast("Прогресс сброшен. Протокол перезапущен");
                        }}
                      >
                        ДА, СБРОСИТЬ ПРОГРЕСС
                      </Button>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setSheet(null)}
                        style={s.cancel}
                      >
                        <T>Оставить всё как есть</T>
                      </Pressable>
                    </>
                  )}
                </ScrollView>
              </SafeAreaView>
            </KeyboardAvoidingView>
          </View>
        </Modal>
        <Modal
          transparent
          visible={win}
          animationType="fade"
          onRequestClose={() => setWin(false)}
        >
          <View
            style={[
              s.modalBackdrop,
              { justifyContent: "center", alignItems: "center", padding: 24 },
            ]}
          >
            <Animated.View
              style={[
                s.win,
                {
                  opacity: pulse,
                  transform: [
                    {
                      scale: pulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={s.between}>
                <Crosshair size={25} color={P.ink} />
                <Mono style={{ color: P.ink, fontSize: 10 }}>
                  СОВПАДЕНИЕ ПОДТВЕРЖДЕНО
                </Mono>
              </View>
              <T style={s.winTitle}>БИНГО.</T>
              <T style={{ color: P.ink, fontSize: 22 }}>Это уже система.</T>
              <T
                style={{
                  fontFamily: "Display",
                  fontSize: 56,
                  color: P.ink,
                  marginTop: 20,
                }}
              >
                +{game.incidents[0]?.bonus ?? 300}
              </T>
              <Mono style={{ color: P.ink, fontSize: 10 }}>
                БОНУС ЗА ЗАКРЫТЫЕ ЛИНИИ
              </Mono>
              <View style={{ marginTop: 30 }}>
                <Button secondary icon={Check} onPress={() => setWin(false)}>
                  ПРОДОЛЖИТЬ НАБЛЮДЕНИЕ
                </Button>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
