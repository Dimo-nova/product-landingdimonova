"use client";
import { useSearchParams } from "next/navigation";
import HeroBgPhoto from "./HeroBgPhoto";
import HeroBgMock from "./HeroBgMock";

/**
 * Temporary switch so both hero treatments can be compared on the same build.
 * `?hero=c` renders the mock; anything else renders the photograph.
 * Once the owner picks one, delete this file and the losing component.
 */
export default function HeroBackground({ photoAlt, mockAlt }: { photoAlt: string; mockAlt: string }) {
  return useSearchParams().get("hero") === "c"
    ? <HeroBgMock alt={mockAlt} />
    : <HeroBgPhoto alt={photoAlt} />;
}
