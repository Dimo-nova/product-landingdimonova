import { test, expect } from "@playwright/test";
import en from "../messages/en.json";
import es from "../messages/es.json";
import de from "../messages/de.json";
import fr from "../messages/fr.json";
import pt from "../messages/pt.json";
import { COMPANY } from "../lib/config";

/**
 * /whatsapp — the WhatsApp lead-capture service page Meta's Tech Provider verification points at.
 *
 * What the reviewer needs is locked here: the page exists in every locale, is indexable, can be
 * reached from the home page (through the footer, and only the footer: it stays out of the
 * header and the mobile nav), shows the provider's business details, and links to the privacy
 * policy's own WhatsApp section.
 */

const stripTags = (s: string) => s.replace(/<[^>]+>/g, "");

const LOCALES = [
  { prefix: "", m: en },
  { prefix: "/es", m: es },
  { prefix: "/de", m: de },
  { prefix: "/fr", m: fr },
  { prefix: "/pt", m: pt },
];

for (const { prefix, m } of LOCALES) {
  test(`${prefix || "/en"}/whatsapp renders its own headline and metadata`, async ({ page }) => {
    const response = await page.goto(`${prefix}/whatsapp`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(stripTags(m.whatsapp.title));
    await expect(page).toHaveTitle(m.seo.whatsapp.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", m.seo.whatsapp.desc);
  });
}

test("/whatsapp is indexable and listed in the sitemap", async ({ page, request }) => {
  const response = await page.goto("/whatsapp");
  expect(response?.headers()["x-robots-tag"] ?? "").not.toContain("noindex");
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://dimonova.com/whatsapp");

  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("<loc>https://dimonova.com/whatsapp</loc>");
  expect(sitemap).toContain("<loc>https://dimonova.com/es/whatsapp</loc>");
});

test("the home page reaches /whatsapp through the footer and nowhere else", async ({ page }) => {
  await page.goto("/");
  const links = page.locator('a[href="/whatsapp"]');
  await expect(links).toHaveCount(1);
  await expect(page.locator("footer").getByRole("link", { name: en.footer.whatsappService })).toHaveAttribute("href", "/whatsapp");

  await page.locator("footer").getByRole("link", { name: en.footer.whatsappService }).click();
  await expect(page).toHaveURL(/\/whatsapp$/);
  await expect(page.locator("h1")).toHaveText(stripTags(en.whatsapp.title));
});

test("/whatsapp shows the provider's name, tax ID, address and email", async ({ page }) => {
  await page.goto("/es/whatsapp");
  const business = page.locator("[data-business-details]");
  await expect(business).toContainText(COMPANY.legalName);
  await expect(business).toContainText(COMPANY.taxId);
  await expect(business).toContainText(COMPANY.address);
  await expect(page.locator("footer").getByRole("link", { name: COMPANY.email })).toBeVisible();
});

test("/whatsapp explains the service: what it does and the three steps", async ({ page }) => {
  await page.goto("/es/whatsapp");
  const main = page.locator("main");
  for (const k of ["i1", "i2", "i3", "i4"] as const) {
    await expect(main.getByRole("heading", { name: es.whatsapp.does[`${k}_title`] })).toBeVisible();
  }
  for (const n of ["1", "2", "3"] as const) {
    await expect(main.getByRole("heading", { name: es.whatsapp.how[`s${n}_title`] })).toBeVisible();
  }
  // The "no more than one message every 24 hours" promise and "we don't resell messages".
  await expect(main).toContainText("24 horas");
  await expect(main).toContainText("no revende mensajes");
});

test("/whatsapp links its data section to the privacy policy's WhatsApp section", async ({ page }) => {
  await page.goto("/es/whatsapp");
  const link = page.getByRole("link", { name: es.whatsapp.data.link });
  await expect(link).toHaveAttribute("href", "/es/legal/privacy#whatsapp");
  await link.click();
  await expect(page).toHaveURL(/\/es\/legal\/privacy#whatsapp$/);
  await expect(page.locator("section#whatsapp h2")).toHaveText("11. Servicio de WhatsApp para clientes");
  await expect(page.locator("section#whatsapp h2")).toBeInViewport();
});

test("the /whatsapp closing CTA goes to /contact, with the WhatsApp chat beside it", async ({ page }) => {
  await page.goto("/whatsapp");
  const cta = page.getByRole("link", { name: en.whatsapp.cta.button });
  await expect(cta).toHaveAttribute("href", "/contact");
  await expect(page.getByRole("main").getByRole("link", { name: en.common.chat_wa })).toHaveAttribute("href", /wa\.me\//);
  await cta.click();
  await expect(page).toHaveURL(/\/contact$/);
});

for (const { path, heading, providers } of [
  {
    path: "/es/legal/privacy",
    heading: "11. Servicio de WhatsApp para clientes",
    providers: ["Meta (WhatsApp Business Platform)", "Vercel", "Supabase", "Resend"],
  },
  {
    path: "/legal/privacy",
    heading: "11. WhatsApp service for clients",
    providers: ["Meta (WhatsApp Business Platform)", "Vercel", "Supabase", "Resend"],
  },
]) {
  test(`${path} has the WhatsApp section, as processor, with its providers`, async ({ page }) => {
    await page.goto(path);
    const section = page.locator("section#whatsapp");
    await expect(section.locator("h2")).toHaveText(heading);
    await expect(section).toContainText(path.startsWith("/es") ? "encargado del tratamiento" : "as a processor");
    for (const p of providers) await expect(section).toContainText(p);
    // The numbering stays continuous: the changes section moved to 12.
    await expect(page.getByRole("heading", { level: 2, name: /^12\. / })).toHaveCount(1);
  });
}
