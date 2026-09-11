"use client";
import type { ReactNode } from "react";
import type { ServiceSlug } from "@/lib/services";
import { openService } from "@/lib/events";

type Props = { slug: ServiceSlug; className?: string; onOpen?: () => void; children: ReactNode };

/**
 * A nav entry for a service while the service pages are unpublished: a button that opens the
 * service walkthrough (ServiceModal) in place of the link to `/features/<slug>`. Used by the
 * header's Features menu, the mobile nav and the footer, each passing its own link styling.
 */
export default function ServiceButton({ slug, className, onOpen, children }: Props) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onOpen?.();
        openService({ slug });
      }}
    >
      {children}
    </button>
  );
}
