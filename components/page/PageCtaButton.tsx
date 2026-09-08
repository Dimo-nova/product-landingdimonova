"use client";
import Button from "@/components/ui/Button";
import { openDemo } from "@/lib/events";

type Props = { source: string; children: React.ReactNode };

/** The one client island inside PageCta: opens the shared demo modal, tagging `source` as the CTA's origin. */
export default function PageCtaButton({ source, children }: Props) {
  return (
    <Button size="lg" onClick={() => openDemo({ source })}>
      {children}
    </Button>
  );
}
