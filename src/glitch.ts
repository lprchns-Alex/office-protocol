export const GLITCH_DURATION = 320;

type Timer = ReturnType<typeof setTimeout>;
type GlitchOptions = {
  random?: () => number;
  schedule?: (callback: () => void, delay: number) => Timer;
  cancel?: (timer: Timer) => void;
};

/** One shared timer: a short glitch, then 3.2–6 seconds of quiet. */
export function startGlitchLoop(
  candidates: string[],
  onChange: (id: string | null) => void,
  {
    random = Math.random,
    schedule = setTimeout,
    cancel = clearTimeout,
  }: GlitchOptions = {},
) {
  const ids = [...new Set(candidates)];
  let stopped = false;
  let timer: Timer | undefined;
  let previous: string | null = null;

  function queue() {
    if (stopped || ids.length === 0) return;
    timer = schedule(
      () => {
        if (stopped) return;
        const pool = ids.length > 1 ? ids.filter((id) => id !== previous) : ids;
        previous = pool[Math.floor(random() * pool.length)];
        onChange(previous);
        timer = schedule(() => {
          if (stopped) return;
          onChange(null);
          queue();
        }, GLITCH_DURATION);
      },
      3200 + Math.round(random() * 2800),
    );
  }

  queue();
  return () => {
    stopped = true;
    if (timer !== undefined) cancel(timer);
    onChange(null);
  };
}
