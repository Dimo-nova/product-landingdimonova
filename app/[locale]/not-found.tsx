import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Annotated from "@/components/ui/Annotated";
import NotFoundActions from "./NotFoundActions";
import styles from "./NotFound.module.css";

export const metadata: Metadata = { title: "404 · Dimonova", robots: { index: false, follow: false } };

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <main id="main" tabIndex={-1} className={styles.wrap}>
      <Container>
        <div className={styles.inner}>
          <div>
            <div className={styles.code} aria-hidden="true"><Annotated kind="strike" delay={0.3}>404</Annotated></div>
            <h1 className={styles.title}>{t("title")}</h1>
            <p className={styles.body}>{t("body")}</p>
            <NotFoundActions home={t("home")} products={t("products")} demo={t("demo")} />
            <p className={styles.hint}>{t("menuHint")}</p>
          </div>
        </div>
      </Container>
    </main>
  );
}
