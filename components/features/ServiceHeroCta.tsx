"use client";
import Button from "@/components/ui/Button";
import { openDemo } from "@/lib/events";

type Props = { source: string; children: React.ReactNode };

/**
 * The one client island inside ServiceHero: opens the shared demo modal (mounted once in
 * app/[locale]/layout.tsx), tagging which service page the visitor came from. Same shape as
 * components/page/PageCtaButton, but sized and weighted for a dark hero — `xl` is the one
 * solid size whose bold 700 weight clears AA's large-text threshold on --brand.
 */
export default function ServiceHeroCta({ source, children }: Props) {
  return (
    <Button size="xl" onClick={() => openDemo({ source })}>
      {children}
    </Button>
  );
}
