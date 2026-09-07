// Server-safe HTML escaping helpers (no React) for building the plain-HTML lead-notification
// email in app/api/contact/route.ts. Every user-supplied value interpolated into that template
// must go through `esc`; URLs must additionally go through `safeUrl` before being used as an
// `href` so a value like `javascript:...` can't execute.
export const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export const safeUrl = (u: string) => (/^https?:\/\/[^\s"'<>]+$/i.test(u) ? u : "");
