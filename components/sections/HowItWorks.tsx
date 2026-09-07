import { getTranslations } from "next-intl/server";
import { s } from "@/lib/style";
import { Link } from "@/lib/routing";
import Hover from "@/components/Hover";

export default async function HowItWorks() {
  const t = await getTranslations();
  return (
    <section style={s("background:#1F1814;color:#FAF6F0;margin-top:24px")}>
      <div className="dim-pad-h" style={s("max-width:1240px;margin:0 auto;padding:88px 40px")}>
        <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#D69B7F;margin-bottom:18px")}>{t("home.how.eyebrow")}</div>
        <h2 className="dim-h2" style={s("font:400 44px/1.1 'Instrument Sans',sans-serif;color:#FAF6F0;letter-spacing:-.03em;margin:0 0 56px;max-width:680px;text-wrap:balance")} dangerouslySetInnerHTML={{ __html: t.raw("home.how.title") }} />

        <div className="dim-stack4-md" style={s("display:grid;grid-template-columns:repeat(4,1fr);gap:32px")}>
          <div>
            <div style={s("font:400 38px/1 var(--font-instrument-serif),serif;font-style:italic;color:#D69B7F;margin-bottom:14px")}>01.</div>
            <div style={s("font:600 17px/1.2 'Instrument Sans',sans-serif;color:#FAF6F0;margin-bottom:10px")}>{t("home.how.s1_title")}</div>
            <div style={s("font:400 13px/1.6 'Instrument Sans',sans-serif;color:#B8A89A")}>{t("home.how.s1_body")}</div>
          </div>
          <div>
            <div style={s("font:400 38px/1 var(--font-instrument-serif),serif;font-style:italic;color:#D69B7F;margin-bottom:14px")}>02.</div>
            <div style={s("font:600 17px/1.2 'Instrument Sans',sans-serif;color:#FAF6F0;margin-bottom:10px")}>{t("home.how.s2_title")}</div>
            <div style={s("font:400 13px/1.6 'Instrument Sans',sans-serif;color:#B8A89A")}>{t("home.how.s2_body")}</div>
          </div>
          <div>
            <div style={s("font:400 38px/1 var(--font-instrument-serif),serif;font-style:italic;color:#D69B7F;margin-bottom:14px")}>03.</div>
            <div style={s("font:600 17px/1.2 'Instrument Sans',sans-serif;color:#FAF6F0;margin-bottom:10px")}>{t("home.how.s3_title")}</div>
            <div style={s("font:400 13px/1.6 'Instrument Sans',sans-serif;color:#B8A89A")}>{t("home.how.s3_body")}</div>
          </div>
          <div>
            <div style={s("font:400 38px/1 var(--font-instrument-serif),serif;font-style:italic;color:#D69B7F;margin-bottom:14px")}>04.</div>
            <div style={s("font:600 17px/1.2 'Instrument Sans',sans-serif;color:#FAF6F0;margin-bottom:10px")}>{t("home.how.s4_title")}</div>
            <div style={s("font:400 13px/1.6 'Instrument Sans',sans-serif;color:#B8A89A")}>{t("home.how.s4_body")}</div>
          </div>
        </div>

        <div className="dim-how-quote" style={s("margin-top:64px;display:flex;align-items:center;gap:16px;padding-top:32px;border-top:1px solid #3A2F26")}>
          <div style={s("font-family:var(--font-instrument-serif),serif;font-style:italic;font-size:22px;color:#FAF6F0;flex:1;max-width:680px;line-height:1.4")}>{t("home.how.quote")}</div>
          <Hover
            as="button"
            base="font:500 14px/1 'Instrument Sans',sans-serif;color:#FAF6F0;padding:14px 22px;border:1px solid #FAF6F0;border-radius:999px;background:transparent;flex:none"
            hover="background:#FAF6F0;color:#1F1814"
          >
            <Link href="/features" style={s("color:inherit;text-decoration:none")}>{t("home.how.more")}</Link>
          </Hover>
        </div>
      </div>
    </section>
  );
}
