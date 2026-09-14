export type Category = "Коммуникация" | "Процессы" | "ТЗ";
export type Card = {
  id: string;
  text: string;
  category: Category;
  points: number;
};
export type Manager = {
  id: string;
  name: string;
  role: string;
  alias: string;
  initials: string;
  color: string;
};
export type Incident = {
  id: string;
  managerId: string;
  text: string;
  category: Category;
  points: number;
  at: string;
  bonus: number;
};
export type Board = {
  cards: string[];
  marked: string[];
  awardedLines: number[];
  score: number;
};
export type Game = {
  version: 1;
  managers: Manager[];
  cards: Card[];
  boards: Record<string, Board>;
  selected: string;
  incidents: Incident[];
  haptics: boolean;
  admin: boolean;
};
export const CATEGORIES: Category[] = ["Коммуникация", "Процессы", "ТЗ"];
const texts: [string, Category, number][] = [
  ["Давай созвонимся на пять минут", "Коммуникация", 100],
  ["Сделай красиво. Ты же дизайнер", "ТЗ", 150],
  ["Поставил встречу на пятницу, 18:00", "Процессы", 200],
  ["Написал «привет» и пропал", "Коммуникация", 50],
  ["Нужно было ещё вчера", "Процессы", 150],
  ["Давайте вернём первый вариант", "ТЗ", 200],
  ["Это не правки, это уточнения", "ТЗ", 100],
  ["Потерял ссылку. В пятый раз", "Коммуникация", 100],
  ["Срочно! Но можно после отпуска", "Процессы", 150],
  ["Прислал голосовое на семь минут", "Коммуникация", 150],
  ["Давайте синхронизируем синхронизацию", "Процессы", 100],
  ["Попросил логотип побольше", "ТЗ", 50],
  ["Обсудил задачу со всеми, кроме тебя", "Коммуникация", 200],
  ["Назвал дедлайн гибким. Для себя", "Процессы", 150],
  ["Утвердил макет. Передумал утром", "ТЗ", 200],
  ["«Мы одна семья» перед переработкой", "Коммуникация", 200],
  ["Создал чат для обсуждения чата", "Процессы", 100],
  ["Прислал ТЗ скриншотом таблицы", "ТЗ", 100],
  ["Спросил статус через три минуты", "Коммуникация", 100],
  ["Добавил срочную задачу в отпуске", "Процессы", 200],
  ["Хочет как у Apple, бюджет — на кофе", "ТЗ", 150],
  ["Ответил «ок» на три вопроса", "Коммуникация", 50],
  ["Переименовал баг в фичу", "Процессы", 150],
  ["Попросил поиграть со шрифтами", "ТЗ", 100],
  ["Всё время уточняет", "Коммуникация", 200],
  ["Назначил встречу без повестки", "Процессы", 100],
  ["Скинул референс после сдачи", "ТЗ", 150],
  ["Пишет «не отвлекаю?» каждые полчаса", "Коммуникация", 100],
  ["Обещал клиенту, не спросив команду", "Процессы", 200],
  ["«Тут буквально на две минуты»", "ТЗ", 150],
];
export const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
export function createGame(): Game {
  const cards = texts.map(([text, category, points], i) => ({
    id: `c${i}`,
    text,
    category,
    points,
  }));
  const managers: Manager[] = [
    {
      id: "pasha",
      name: "Паша",
      role: "Проджект-менеджер",
      alias: "Повелитель созвонов",
      initials: "ПШ",
      color: "#C7FF00",
    },
    {
      id: "alina",
      name: "Алина",
      role: "Аккаунт-менеджер",
      alias: "Ещё одна маленькая правка",
      initials: "АЛ",
      color: "#C8B3F3",
    },
    {
      id: "denis",
      name: "Денис",
      role: "Продакт-менеджер",
      alias: "Евангелист срочности",
      initials: "ДН",
      color: "#FF956B",
    },
    {
      id: "marina",
      name: "Марина",
      role: "Тимлид",
      alias: "Хранительница процессов",
      initials: "МР",
      color: "#8AD4C8",
    },
  ];
  return {
    version: 1,
    cards,
    managers,
    boards: Object.fromEntries(
      managers.map((m, i) => [
        m.id,
        {
          cards: cards.slice(i * 3, i * 3 + 9).map((c) => c.id),
          marked: [],
          awardedLines: [],
          score: 0,
        },
      ]),
    ),
    selected: "pasha",
    incidents: [],
    haptics: true,
    admin: true,
  };
}
export function confirmCard(
  game: Game,
  cardId: string,
  at = new Date().toISOString(),
): Game {
  const board = game.boards[game.selected];
  const card = game.cards.find((c) => c.id === cardId);
  if (!card || !board.cards.includes(cardId) || board.marked.includes(cardId))
    return game;
  const marked = [...board.marked, cardId];
  const completed = LINES.map((line, i) =>
    line.every((index) => marked.includes(board.cards[index])) ? i : -1,
  ).filter((i) => i >= 0);
  const newLines = completed.filter((i) => !board.awardedLines.includes(i));
  const bonus = newLines.length * 300;
  return {
    ...game,
    boards: {
      ...game.boards,
      [game.selected]: {
        ...board,
        marked,
        awardedLines: [...board.awardedLines, ...newLines],
        score: board.score + card.points + bonus,
      },
    },
    incidents: [
      {
        id: `${at}-${cardId}`,
        managerId: game.selected,
        text: card.text,
        category: card.category,
        points: card.points,
        bonus,
        at,
      },
      ...game.incidents,
    ],
  };
}
export function reroll(game: Game, random = Math.random): Game {
  const board = game.boards[game.selected];
  const pool = game.cards
    .filter((c) => !board.cards.includes(c.id))
    .map((c) => c.id);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const cards = board.cards.map((id) =>
    board.marked.includes(id) ? id : (pool.pop() ?? id),
  );
  return {
    ...game,
    boards: { ...game.boards, [game.selected]: { ...board, cards } },
  };
}
export function newRound(game: Game): Game {
  const board = game.boards[game.selected];
  return reroll({
    ...game,
    boards: {
      ...game.boards,
      [game.selected]: { ...board, marked: [], awardedLines: [] },
    },
  });
}
export function level(score: number) {
  return Math.floor(score / 1000) + 1;
}
export function rank(score: number) {
  return [
    "Тихий офис",
    "Лёгкий дискомфорт",
    "Системный кринж",
    "Критический манагер",
    "Легенда опенспейса",
  ][Math.min(4, Math.floor(score / 1000))];
}
export function restoreGame(value: unknown): Game | null {
  try {
    const g = value as Game;
    if (
      g.version !== 1 ||
      !Array.isArray(g.cards) ||
      g.cards.length < 9 ||
      !Array.isArray(g.managers) ||
      !g.managers.length ||
      !Array.isArray(g.incidents) ||
      !g.boards
    )
      return null;
    if (
      !g.cards.every(
        (c) =>
          typeof c.id === "string" &&
          typeof c.text === "string" &&
          CATEGORIES.includes(c.category) &&
          Number.isFinite(c.points) &&
          c.points > 0,
      )
    )
      return null;
    if (
      new Set(g.cards.map((c) => c.id)).size !== g.cards.length ||
      new Set(g.managers.map((m) => m.id)).size !== g.managers.length
    )
      return null;
    const ids = new Set(g.cards.map((c) => c.id));
    if (
      !g.managers.every(
        (m) =>
          typeof m.id === "string" &&
          typeof m.name === "string" &&
          typeof m.alias === "string" &&
          typeof m.role === "string" &&
          typeof m.initials === "string" &&
          /^#[0-9a-f]{6}$/i.test(m.color) &&
          g.boards[m.id]?.cards.length === 9 &&
          new Set(g.boards[m.id].cards).size === 9 &&
          g.boards[m.id].cards.every((id) => ids.has(id)) &&
          Array.isArray(g.boards[m.id].marked) &&
          g.boards[m.id].marked.every((id) =>
            g.boards[m.id].cards.includes(id),
          ) &&
          Array.isArray(g.boards[m.id].awardedLines) &&
          Number.isFinite(g.boards[m.id].score),
      )
    )
      return null;
    if (
      !g.managers.some((m) => m.id === g.selected) ||
      !g.incidents.every(
        (i) =>
          typeof i.text === "string" &&
          typeof i.at === "string" &&
          Number.isFinite(i.points) &&
          Number.isFinite(i.bonus),
      )
    )
      return null;
    return {
      ...g,
      incidents: g.incidents.map((i) => ({
        ...i,
        category:
          i.category ??
          g.cards.find((c) => c.text === i.text)?.category ??
          "Коммуникация",
      })),
      haptics: !!g.haptics,
      admin: !!g.admin,
    };
  } catch {
    return null;
  }
}
