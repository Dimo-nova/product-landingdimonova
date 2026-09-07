import type { ServiceSlug } from "@/lib/services";

const PATHS: Record<ServiceSlug, React.ReactNode> = {
  menu: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
  ai: <><path d="M12 3l1.8 4.6L18 9.4l-4.2 1.8L12 16l-1.8-4.8L6 9.4l4.2-1.8z" /><path d="M5 18l.9 2.1L8 21l-2.1.9L5 24" transform="translate(0 -3)" /></>,
  ordering: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  training: <><path d="M4 7l8-4 8 4-8 4z" /><path d="M6 10v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /></>,
  multi: <><rect x="3" y="4" width="8" height="8" rx="1.5" /><rect x="13" y="4" width="8" height="8" rx="1.5" /><rect x="3" y="14" width="8" height="8" rx="1.5" /><rect x="13" y="14" width="8" height="8" rx="1.5" /></>,
  reviews: <><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></>,
  daily: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  translate: <><path d="M4 5h9M8.5 5v2c0 3.5-2 6.5-4.5 8" /><path d="M6 9c1 2.5 3 4.5 6 6" /><path d="M13 20l4-9 4 9M14.5 17h5" /></>,
};

export function ServiceIcon({ slug, size = 24 }: { slug: ServiceSlug; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[slug]}
    </svg>
  );
}
