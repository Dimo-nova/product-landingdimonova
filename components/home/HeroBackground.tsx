"use client";
import { useEffect, useState } from "react";
import HeroBgPhoto from "./HeroBgPhoto";
import HeroBgMock from "./HeroBgMock";

/**
 * Temporary switch so both hero treatments can be compared on the same build.
 * `?hero=c` renders the mock; anything else renders the photograph.
 * Once the owner picks one, delete this file and the losing component.
 *
 * The photograph renders unconditionally on the server (and on first client render) so it
 * ships in the static HTML and its `priority` `next/image` actually gets a preload link —
 * see `Hero.tsx` for why this can no longer sit behind a `useSearchParams` + `<Suspense>`
 * boundary. The mock is swapped in after mount, once we can read the query string.
 */
export default function HeroBackground({ photoAlt, mockAlt }: { photoAlt: string; mockAlt: string }) {
  const [mock, setMock] = useState(false);

  useEffect(() => {
    setMock(new URLSearchParams(window.location.search).get("hero") === "c");
  }, []);

  return mock ? <HeroBgMock alt={mockAlt} /> : <HeroBgPhoto alt={photoAlt} />;
}
