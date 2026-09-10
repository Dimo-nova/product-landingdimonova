import { test, expect } from "@playwright/test";
import reviews from "../data/reviews.json";
import en from "../messages/en.json";
import es from "../messages/es.json";
import { CASES_PUBLISHED } from "../lib/config";

/**
 * /clients — the page that collects every client review, video and written.
 *
 * The assertions read `data/reviews.json` rather than hard-coding venue names: the owner adds
 * reviews by editing that file alone, and a spec that listed the two current venues by hand
 * would have to be edited every time he does. What is locked here is the page's contract —
 * every video is named, no quote is attributed to a client who did not write one, and nothing
 * is fetched from the media bucket until someone presses play.
 */

const VIDEO_NAMES = reviews.videos.map((v) => v.name);

test("/clients has exactly one h1 and it is the page's own headline", async ({ page }) => {
  const response = await page.goto("/clients");
  expect(response?.status(), "/clients did not respond 200").toBe(200);

  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText(en.clients.title.replace(/<[^>]+>/g, ""));
});

test("/clients names every venue that has a video review", async ({ page }) => {
  await page.goto("/clients");
  expect(VIDEO_NAMES.length, "data/reviews.json has no videos to check").toBeGreaterThan(0);

  for (const name of VIDEO_NAMES) {
    await expect(
      page.getByRole("heading", { name, exact: true }),
      `${name} is missing from /clients`,
    ).toBeVisible();
  }
});

test("/clients mounts no <video> until a play button is pressed", async ({ page }) => {
  // Any request off localhost means the .mp4s on the Supabase media bucket were touched on
  // load — the exact thing InlineVideo exists to prevent, and what the cookie policy promises.
  const external: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).host !== "localhost:3100") external.push(r.url());
  });

  await page.goto("/clients");
  await page.waitForLoadState("networkidle");

  expect(external, "third-party requests during load").toEqual([]);
  await expect(page.locator("video")).toHaveCount(0);

  const play = page.getByRole("button", { name: en.clients.playVideo.replace("{name}", VIDEO_NAMES[0]) });
  await expect(play).toBeVisible();
  await play.click();
  await expect(page.locator("video")).toHaveCount(1);
});

test("/clients pairs quotes only where data/reviews.json declares the link", async ({ page }) => {
  await page.goto("/clients");

  // A card only ever appears for a review that exists in the data file...
  const ids = await page.locator("[data-review-card='text']").evaluateAll((els) =>
    els.map((el) => el.getAttribute("data-review-id")),
  );
  const known = new Set(reviews.google.map((r) => r.id));
  for (const id of ids) {
    expect(known.has(id ?? ""), `a quote card rendered for unknown review id "${id}"`).toBe(true);
  }

  // ...and every review in the file is on the page exactly once, whether it is paired to a
  // video or standing on its own.
  expect([...ids].sort()).toEqual([...known].sort());

  // A video with no `reviewId` still gets its row, with the venue line and no quote inside it.
  // Cast rather than `"reviewId" in v`: that narrows against the JSON literal, so the day every
  // entry happens to carry one the whole branch becomes `never` and stops compiling, which says
  // nothing about whether the page still handles an unpaired video.
  const unpaired = (reviews.videos as { id: string; venue: string; reviewId?: string }[]).filter(
    (v) => !v.reviewId,
  );
  for (const video of unpaired) {
    const row = page.locator(`[data-film="${video.id}"]`);
    await expect(row).toBeVisible();
    await expect(row.locator("[data-review-card='text']")).toHaveCount(0);
    await expect(row.getByText(video.venue, { exact: true })).toBeVisible();
  }
});

test("/clients links out to the Google profile", async ({ page }) => {
  await page.goto("/clients");

  await expect(
    page.getByRole("link", { name: en.clients.badge.replace("{rating}", String(reviews.rating)) }),
  ).toHaveAttribute("href", reviews.profileUrl);
});

test("/clients shows the case-studies band only while that page is published", async ({ page }) => {
  await page.goto("/clients");
  const link = page.getByRole("link", { name: en.clients.cases.link });
  if (CASES_PUBLISHED) {
    await expect(link).toHaveAttribute("href", "/cases");
  } else {
    // Unpublished, /cases redirects home, so a band inviting a visitor into it would bounce them
    // straight back out.
    await expect(link).toHaveCount(0);
  }
});

test("/clients works in Spanish", async ({ page }) => {
  const response = await page.goto("/es/clients");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText(es.clients.title.replace(/<[^>]+>/g, ""));
  await expect(page.getByRole("heading", { name: es.clients.films.title })).toBeVisible();
});
