import test from "node:test";
import assert from "node:assert/strict";
import { GLITCH_DURATION, startGlitchLoop } from "../src/glitch.ts";

function fakeClock() {
  let id = 0;
  let now = 0;
  const pending = new Map();
  return {
    pending,
    get now() {
      return now;
    },
    schedule(callback, delay) {
      pending.set(++id, { callback, delay });
      return id;
    },
    cancel(timer) {
      pending.delete(timer);
    },
    next() {
      assert.equal(pending.size, 1, "only one timer may be pending");
      const [timer, job] = pending.entries().next().value;
      pending.delete(timer);
      now += job.delay;
      job.callback();
      return job.delay;
    },
  };
}

test("glitches alternate with quiet intervals and last exactly 320 ms", () => {
  const clock = fakeClock();
  const changes = [];
  let randomStep = 0;
  const stop = startGlitchLoop(["a", "b", "c"], (id) => changes.push(id), {
    ...clock,
    random: () => ((randomStep++ * 7) % 10) / 10,
  });
  let previous = null;
  for (let i = 0; i < 30; i++) {
    const delay = clock.next();
    assert(delay >= 3200 && delay <= 6000);
    const current = changes.at(-1);
    assert(["a", "b", "c"].includes(current));
    assert.notEqual(
      current,
      previous,
      "never choose the same card twice in a row",
    );
    previous = current;
    assert.equal(clock.next(), GLITCH_DURATION);
    assert.equal(changes.at(-1), null);
  }
  stop();
  assert.equal(clock.pending.size, 0);
});

test("canceling before a glitch clears the timer and rejects stale callbacks", () => {
  const clock = fakeClock();
  const changes = [];
  const stop = startGlitchLoop(["a", "b"], (id) => changes.push(id), clock);
  const stale = clock.pending.values().next().value.callback;
  stop();
  stale();
  assert.deepEqual(changes, [null]);
  assert.equal(clock.pending.size, 0);
});

test("canceling mid-glitch restores the card without starting another timer", () => {
  const clock = fakeClock();
  const changes = [];
  const stop = startGlitchLoop(["a"], (id) => changes.push(id), clock);
  clock.next();
  const stale = clock.pending.values().next().value.callback;
  stop();
  stale();
  assert.deepEqual(changes, ["a", null]);
  assert.equal(clock.pending.size, 0);
});

test("empty categories do not schedule effects; one eligible card still works", () => {
  const clock = fakeClock();
  const changes = [];
  const emptyStop = startGlitchLoop([], (id) => changes.push(id), clock);
  assert.equal(clock.pending.size, 0);
  emptyStop();
  const stop = startGlitchLoop(
    ["only", "only"],
    (id) => changes.push(id),
    clock,
  );
  clock.next();
  assert.equal(changes.at(-1), "only");
  clock.next();
  clock.next();
  assert.equal(changes.at(-1), "only");
  stop();
});

test("changing category or board never leaks effects from the old candidates", () => {
  const clock = fakeClock();
  const changes = [];
  const stopOld = startGlitchLoop(
    ["old-a", "old-b"],
    (id) => changes.push(id),
    clock,
  );
  stopOld();
  const stopNew = startGlitchLoop(
    ["filtered"],
    (id) => changes.push(id),
    clock,
  );
  clock.next();
  assert.deepEqual(changes, [null, "filtered"]);
  stopNew();
  assert.equal(clock.pending.size, 0);
});
