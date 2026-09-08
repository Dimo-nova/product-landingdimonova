import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Marquee from "@/components/ui/Marquee";
import styles from "./LogoStrip.module.css";

const LOGOS = [
  { src: "/assets/Logos/balamo.svg", alt: "Bálamo" },
  { src: "/assets/Logos/lapulperia.svg", alt: "La Pulpería" },
  { src: "/assets/Logos/logo-calsot-neg.png", alt: "Calçots" },
];

/**
 * Client logo strip: label on the left, the three real client logos scrolling in a Marquee.
 * `repeat` is high because there are only three logos: without it the same three would come
 * back around every few seconds and the strip would read as a very short list on a loop.
 */
export default async function LogoStrip() {
  const t = await getTranslations();

  return (
    <section data-logo-strip className={styles.section}>
      <Container className={styles.inner}>
        <span className={styles.label}>{t("home.logos.title")}</span>
        <Marquee speed={60} repeat={6} className={styles.marquee}>
          {LOGOS.map((logo) => (
            <img key={logo.alt} src={logo.src} alt={logo.alt} className={styles.logo} />
          ))}
        </Marquee>
      </Container>
    </section>
  );
}
