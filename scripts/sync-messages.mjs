// Copies keys that exist in messages/en.json but are missing in the other locales.
// Usage: node scripts/sync-messages.mjs   (run after adding EN/ES copy)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

export function fillMissing(source, target, prefix = "", added = []) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (!(key in result)) {
      result[key] = source[key];
      added.push(full);
    } else if (isObj(source[key]) && isObj(result[key])) {
      result[key] = fillMissing(source[key], result[key], full, added).result;
    }
  }
  return { result, added };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../messages");
  const en = JSON.parse(fs.readFileSync(path.join(dir, "en.json"), "utf8"));
  for (const locale of ["es", "de", "fr", "pt"]) {
    const file = path.join(dir, `${locale}.json`);
    const current = JSON.parse(fs.readFileSync(file, "utf8"));
    const { result, added } = fillMissing(en, current);
    fs.writeFileSync(file, JSON.stringify(result, null, 2) + "\n");
    console.log(`${locale}: +${added.length}${added.length ? " → " + added.join(", ") : ""}`);
  }
}
