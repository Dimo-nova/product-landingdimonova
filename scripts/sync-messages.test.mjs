import { test } from "node:test";
import assert from "node:assert/strict";
import { fillMissing } from "./sync-messages.mjs";

test("copies only missing keys, deeply, without touching existing ones", () => {
  const en = { a: "A", nested: { x: "X", y: "Y" }, arr: ["1"] };
  const de = { a: "Ä", nested: { x: "Ẍ" } };
  const { result, added } = fillMissing(en, de);
  assert.deepEqual(result, { a: "Ä", nested: { x: "Ẍ", y: "Y" }, arr: ["1"] });
  assert.deepEqual(added, ["nested.y", "arr"]);
});
