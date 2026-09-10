const SLUGS = ["menu", "ordering", "reviews"] as const;

export type ServiceSlug = (typeof SLUGS)[number];

export type Service = { slug: ServiceSlug; href: string };

/**
 * Single source of truth for the three things Dimonova sells (mega-menu, mobile nav, footer,
 * home cards, and the `/features/[slug]` routes). Copy lives in messages under
 * `services.<slug>`.
 *
 * This list used to hold eight entries. The owner collapsed it to three, folding the old
 * `ai`, `multi`, `daily`, `training` and `translate` items into the digital menu, which is what
 * they were always part of: they are sub-features, not separate products. Anything that needs
 * to name one of those now does it inside the digital menu's own page.
 */
export const SERVICES: Service[] = SLUGS.map((slug) => ({ slug, href: `/features/${slug}` }));

export function isServiceSlug(value: string): value is ServiceSlug {
  return (SLUGS as readonly string[]).includes(value);
}
