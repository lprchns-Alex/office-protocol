/** Fictional character flavour, deliberately separate from earned game stats. */
export type ManagerProfile = {
  quote: string;
  bio: string;
  traits: { label: string; value: number }[];
};

const profiles: Record<string, ManagerProfile> = {
  pasha: {
    quote: "Давайте это быстро обсудим голосом.",
    bio: "Превращает любой вопрос в созвон, а созвон — в серию регулярных встреч. Уверен: если все синхронизировались, задача почти готова.",
    traits: [
      { label: "СОЗВОНЫ", value: 10 },
      { label: "СРОЧНОСТЬ", value: 7 },
      { label: "КОНТРОЛЬ", value: 8 },
    ],
  },
  alina: {
    quote: "Всё супер. Есть пара микроуточнений.",
    bio: "Переводит «клиенту не зашло» в тридцать семь конкретных правок. Помнит все версии макета. Особенно первую — к ней мы ещё вернёмся.",
    traits: [
      { label: "ПРАВКИ", value: 10 },
      { label: "ДИПЛОМАТИЯ", value: 9 },
      { label: "СОЗВОНЫ", value: 6 },
    ],
  },
  denis: {
    quote: "Это в бэклоге. Но нужно уже вчера.",
    bio: "Видит гипотезы там, где остальные видят выходные. Меняет приоритеты быстрее, чем обновляется доска. Каждый релиз — маленькая революция.",
    traits: [
      { label: "СРОЧНОСТЬ", value: 10 },
      { label: "ГИПОТЕЗЫ", value: 9 },
      { label: "ТЕРПЕНИЕ", value: 2 },
    ],
  },
  marina: {
    quote: "А где задача на создание этой задачи?",
    bio: "Знает, кто сломал процесс, ещё до того, как он сломан. На каждый случай есть регламент. На случай отсутствия регламента — отдельный регламент.",
    traits: [
      { label: "ПРОЦЕССЫ", value: 10 },
      { label: "КОНТРОЛЬ", value: 9 },
      { label: "ХАОС", value: 1 },
    ],
  },
};

export function getManagerProfile(id: string): ManagerProfile | undefined {
  return Object.prototype.hasOwnProperty.call(profiles, id)
    ? profiles[id]
    : undefined;
}
