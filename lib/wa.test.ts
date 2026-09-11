import { test, expect } from "@playwright/test";
import { CONTACT } from "./config";
import { waContextForPath, waContextForService, waLink } from "./wa";

// The pathname comes from next-intl's usePathname, i.e. without the locale prefix.
test("maps each page to its own context and everything else to generic", () => {
  expect(waContextForPath("/")).toBe("home");
  expect(waContextForPath("/pricing")).toBe("pricing");
  expect(waContextForPath("/clients")).toBe("clients");
  expect(waContextForPath("/about")).toBe("about");
  expect(waContextForPath("/contact")).toBe("contact");
  expect(waContextForPath("/legal/privacy")).toBe("generic");
  expect(waContextForPath("/features/menu")).toBe("generic");
  // A trailing slash must not turn a known page into "generic".
  expect(waContextForPath("/pricing/")).toBe("pricing");
});

test("maps the three service slugs and nothing else", () => {
  expect(waContextForService("menu")).toBe("serviceMenu");
  expect(waContextForService("ordering")).toBe("serviceOrdering");
  expect(waContextForService("reviews")).toBe("serviceReviews");
  expect(waContextForService("ai")).toBeNull();
});

test("waLink picks the number by locale and URL-encodes the message", () => {
  const es = waLink("es", "Hola, llevo un pub. ¿Qué tal?");
  expect(es.startsWith(`${CONTACT.whatsappES}?text=`)).toBe(true);
  expect(es).toBe(`${CONTACT.whatsappES}?text=${encodeURIComponent("Hola, llevo un pub. ¿Qué tal?")}`);
  // Every non-Spanish locale goes to the Irish number, as the widget always did.
  for (const l of ["en", "de", "fr", "pt"]) {
    expect(waLink(l, "Hi.").startsWith(`${CONTACT.whatsappIE}?text=`)).toBe(true);
  }
});
