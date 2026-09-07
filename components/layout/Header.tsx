"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/routing";
import { openDemo } from "@/lib/events";
import { ADMIN_URL } from "@/lib/config";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import MegaMenu from "./MegaMenu";
import MobileNav from "./MobileNav";
import LangSwitcher from "./LangSwitcher";
import styles from "./Header.module.css";

export default function Header() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled((prev) => (prev ? window.scrollY >= 24 : window.scrollY > 80));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={styles.header} data-scrolled={scrolled}>
      <Container>
        <div className={styles.bar}>
          <Link href="/" className={styles.logo} aria-label="Dimonova">
            <img src="/assets/logo_horizontal.svg" alt="Dimonova" width={100} height={40} />
          </Link>
          <div className={styles.center}>
            <MegaMenu />
          </div>
          <div className={styles.right}>
            <LangSwitcher />
            <Button variant="outline" href={ADMIN_URL} external>{t("clientAccess")}</Button>
            <Button onClick={() => openDemo({ source: "header" })}>{t("demo")}</Button>
          </div>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
