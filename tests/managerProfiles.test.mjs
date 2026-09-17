import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/game.ts";
import { getManagerProfile } from "../src/managerProfiles.ts";

test("every built-in manager has an original dossier with bounded character traits", () => {
  for (const manager of createGame().managers) {
    const profile = getManagerProfile(manager.id);
    assert.ok(profile?.quote && profile.bio);
    assert.equal(profile.traits.length, 3);
    for (const trait of profile.traits) {
      assert.ok(trait.label.length > 0);
      assert.ok(
        Number.isInteger(trait.value) && trait.value >= 0 && trait.value <= 10,
      );
    }
  }
});

test("custom managers never inherit somebody else's dossier", () => {
  for (const id of ["custom-123", "", "constructor", "__proto__", "toString"]) {
    assert.equal(getManagerProfile(id), undefined);
  }
});

test("reading a dossier does not change saved game stats", () => {
  const game = createGame();
  const snapshot = JSON.stringify(game);
  game.managers.forEach((manager) => getManagerProfile(manager.id));
  assert.equal(JSON.stringify(game), snapshot);
});
