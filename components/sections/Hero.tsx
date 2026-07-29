import { getTranslations, getLocale } from "next-intl/server";
import { s } from "@/lib/style";
import { imgSrc } from "@/lib/imgSrc";
import { Link } from "@/lib/routing";
import Hover from "@/components/Hover";
import OpenWAButton from "@/components/OpenWAButton";

export default async function Hero() {
  const t = await getTranslations();
  const locale = await getLocale();
  return (
    <section className="dim-pad-h" style={s("max-width:1240px;margin:0 auto;padding:48px 40px 32px")}>
      <div className="dim-hero-grid" style={s("display:grid;grid-template-columns:1.05fr .95fr;gap:48px;align-items:center")}>
        <div>
          <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#B8523A;margin-bottom:24px")}>{t("home.hero.eyebrow")}</div>
          <h1 className="dim-h1" style={s("font:400 60px/1.02 'Instrument Sans',sans-serif;color:#1F1814;letter-spacing:-.03em;text-wrap:balance;margin:0 0 6px")} dangerouslySetInnerHTML={{ __html: t.raw("home.hero.title1") }} />
          <h1 className="dim-h1" style={s("font:400 60px/1.02 'Instrument Sans',sans-serif;color:#1F1814;letter-spacing:-.03em;text-wrap:balance;margin:0 0 22px")}>{t("home.hero.title2")}</h1>
          <p style={s("font:400 17px/1.55 'Instrument Sans',sans-serif;color:#4A4036;max-width:480px;margin:0 0 32px")}>{t("home.hero.body")}</p>
          <div className="dim-cta-stack dim-cta-left" style={s("display:flex;gap:12px;align-items:center;flex-wrap:wrap")}>
            <Hover
              as="button"
              base="font:600 14px/1 'Instrument Sans',sans-serif;color:#FAF6F0;background:#1F1814;padding:16px 24px;border-radius:999px;display:inline-flex;align-items:center;gap:8px;transition:transform .15s,background .15s"
              hover="background:#2D2520;transform:translateY(-1px)"
            >
              <Link href="/contact" style={s("display:contents;color:inherit;text-decoration:none")}>
                <span>{t("common.demo")}</span>{" "}<span style={s("font-family:'Instrument Serif',serif;font-style:italic")}>→</span>
              </Link>
            </Hover>
            <OpenWAButton label={t("common.chat_wa")} variant="light" />
          </div>
          <div style={s("margin-top:36px;display:flex;align-items:center;gap:14px")}>
            {/* <div style={s("display:flex")}>
              <div style={s("width:32px;height:32px;border-radius:50%;background:#D69B7F;border:2px solid #FAF6F0;margin-left:-8px")}></div>
              <div style={s("width:32px;height:32px;border-radius:50%;background:#5C6B4E;border:2px solid #FAF6F0;margin-left:-8px")}></div>
              <div style={s("width:32px;height:32px;border-radius:50%;background:#B8523A;border:2px solid #FAF6F0;margin-left:-8px")}></div>
              <div style={s("width:32px;height:32px;border-radius:50%;background:#4A4036;border:2px solid #FAF6F0;margin-left:-8px")}></div>
            </div>
            <div style={s("font:400 13px/1.4 'Instrument Sans',sans-serif;color:#4A4036")} dangerouslySetInnerHTML={{ __html: t.raw("home.hero.avatars") }} /> */}
          </div>
        </div>

        {/* Hero visual */}
        <div className="dim-hero-visual" style={s("position:relative;height:600px;display:flex;align-items:center;justify-content:center")}>
          <div style={s("position:relative;width:285px;background:#1F1814;border-radius:42px;padding:9px;box-shadow:0 40px 80px -32px rgba(31,24,20,.4)")}>
            <div style={s("position:relative;width:100%;background:#FAF6F0;border-radius:34px;overflow:hidden")}>
              <img src={imgSrc("hero", locale)} alt="" style={s("width:100%;display:block")} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
