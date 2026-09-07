const SLUGS = [
  "menu", "ai", "ordering", "training", "multi", "reviews", "daily", "translate",
] as const;

export type ServiceSlug = (typeof SLUGS)[number];

export type Service = { slug: ServiceSlug; href: string };

/** Single source of truth for the 8 services (mega-menu, footer, home cards). Copy lives in messages under `services.<slug>`. */
export const SERVICES: Service[] = SLUGS.map((slug) => ({ slug, href: `/features#${slug}` }));
