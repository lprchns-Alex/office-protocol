import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  confirmCard,
  reroll,
  newRound,
  restoreGame,
  level,
} from "../src/game.ts";

test("every manager has a unique 3×3 board using the shared library", () => {
  const g = createGame();
  for (const b of Object.values(g.boards)) {
    assert.equal(b.cards.length, 9);
    assert.equal(new Set(b.cards).size, 9);
    assert(b.cards.every((id) => g.cards.some((c) => c.id === id)));
  }
});
test("confirmation scores once and does not change another manager", () => {
  const g = createGame();
  const n = confirmCard(g, "c0");
  assert.equal(n.boards.pasha.score, 100);
  assert.equal(n.incidents.length, 1);
  assert.equal(confirmCard(n, "c0"), n);
  assert.deepEqual(n.boards.alina, g.boards.alina);
  assert.equal(confirmCard(n, "c29"), n);
});
test("a row gives exactly one 300-point bonus", () => {
  let g = createGame();
  for (const id of ["c0", "c1", "c2"]) g = confirmCard(g, id);
  assert.equal(g.boards.pasha.score, 750);
  assert.equal(g.incidents[0].bonus, 300);
  g = confirmCard(g, "c3");
  assert.equal(g.boards.pasha.score, 800);
  assert.equal(g.incidents[0].bonus, 0);
});
test("a full board awards all eight lines and simultaneous lines correctly", () => {
  let g = createGame();
  const points = g.cards.slice(0, 9).reduce((sum, c) => sum + c.points, 0);
  for (const id of ["c0", "c1", "c2", "c3", "c5", "c6", "c7", "c8", "c4"])
    g = confirmCard(g, id);
  assert.equal(g.boards.pasha.score, points + 8 * 300);
  assert.equal(g.incidents[0].bonus, 1200);
  assert.equal(g.boards.pasha.awardedLines.length, 8);
});
test("reroll preserves confirmed cells, scores, and line awards without duplicates", () => {
  let g = createGame();
  for (const id of ["c0", "c1", "c2"]) g = confirmCard(g, id);
  const next = reroll(g, () => 0.4);
  assert.deepEqual(next.boards.pasha.cards.slice(0, 3), ["c0", "c1", "c2"]);
  assert.deepEqual(next.boards.pasha.marked, g.boards.pasha.marked);
  assert.equal(next.boards.pasha.score, g.boards.pasha.score);
  assert.equal(new Set(next.boards.pasha.cards).size, 9);
  assert(
    next.boards.pasha.cards
      .slice(3)
      .every((id) => !g.boards.pasha.cards.includes(id)),
  );
});
test("new round clears matrix, retains history and cumulative score", () => {
  let g = createGame();
  for (const id of g.boards.pasha.cards) g = confirmCard(g, id);
  const n = newRound(g);
  assert.equal(n.boards.pasha.marked.length, 0);
  assert.equal(n.boards.pasha.awardedLines.length, 0);
  assert.equal(n.boards.pasha.score, g.boards.pasha.score);
  assert.deepEqual(n.incidents, g.incidents);
});
test("restoration validates storage and preserves progress", () => {
  const g = confirmCard(createGame(), "c0");
  assert.deepEqual(restoreGame(JSON.parse(JSON.stringify(g))), g);
  assert.equal(restoreGame(null), null);
  assert.equal(restoreGame({ version: 77 }), null);
  const broken = structuredClone(g);
  broken.boards.pasha.cards[0] = "missing";
  assert.equal(restoreGame(broken), null);
});
test("level threshold is exactly every 1000 points", () => {
  assert.equal(level(999), 1);
  assert.equal(level(1000), 2);
  assert.equal(level(3500), 4);
});
