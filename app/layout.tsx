import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = { themeColor: "#FE5243" };

export const metadata: Metadata = {
  metadataBase: new URL("https://dimonova.com"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  // Fallback social-share card for routes that don't build their own metadata (e.g. not-found,
  // the catch-all). Pages that call `pageMetadata` (via `lib/meta.ts`'s `buildMetadata`) set
  // their own complete `openGraph`/`twitter` objects, which replace this default outright.
  openGraph: {
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
