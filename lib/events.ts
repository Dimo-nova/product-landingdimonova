"use client";
import { useEffect } from "react";

export const DEMO_OPEN = "demo:open" as const;
export const VIDEO_OPEN = "video:open" as const;
export const SERVICE_OPEN = "service:open" as const;

export type DemoOpenPayload = { email?: string; source?: string };
export type VideoOpenPayload = {
  src: string;
  poster?: string;
  title: string;
  orientation?: "landscape" | "portrait";
};

/** Which service's walkthrough to open (components/home/ServiceModal.tsx). */
export type ServiceOpenPayload = { slug: string };

export function openService(payload: ServiceOpenPayload) {
  window.dispatchEvent(new CustomEvent<ServiceOpenPayload>(SERVICE_OPEN, { detail: payload }));
}

export function openDemo(payload: DemoOpenPayload = {}) {
  window.dispatchEvent(new CustomEvent<DemoOpenPayload>(DEMO_OPEN, { detail: payload }));
}

export function openVideo(payload: VideoOpenPayload) {
  window.dispatchEvent(new CustomEvent<VideoOpenPayload>(VIDEO_OPEN, { detail: payload }));
}

/** Subscribe to a window CustomEvent for the lifetime of the component. */
export function useWindowEvent<T>(name: string, handler: (detail: T) => void) {
  useEffect(() => {
    const fn = (e: Event) => handler((e as CustomEvent<T>).detail);
    window.addEventListener(name, fn);
    return () => window.removeEventListener(name, fn);
  }, [name, handler]);
}
