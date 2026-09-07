import { test, expect } from "@playwright/test";
import { esc, safeUrl } from "./html";

test("esc neutralises markup", () => { expect(esc(`<a href="x">&'`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&#39;"); });
test("safeUrl only accepts http(s) URLs", () => {
  expect(safeUrl("https://a.b/c")).toBe("https://a.b/c");
  expect(safeUrl("javascript:alert(1)")).toBe("");
  expect(safeUrl('https://a.b/"onmouseover="x')).toBe("");
});
