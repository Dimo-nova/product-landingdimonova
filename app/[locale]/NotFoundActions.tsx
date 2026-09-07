"use client";
import Button from "@/components/ui/Button";
import { openDemo } from "@/lib/events";
import styles from "./NotFound.module.css";

export default function NotFoundActions({ home, products, demo }: { home: string; products: string; demo: string }) {
  return (
    <div className={styles.actions}>
      <Button href="/">{home}</Button>
      <Button href="/features" variant="outline">{products}</Button>
      <Button variant="ghost" onClick={() => openDemo({ source: "404" })}>{demo}</Button>
    </div>
  );
}
