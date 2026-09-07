import { getTranslations } from "next-intl/server";
import { s } from "@/lib/style";

export default async function AboutWhy() {
  const t = await getTranslations();
  return (
    <section className="dim-pad-h" style={s("max-width:1240px;margin:0 auto;padding:48px 40px")}>
      <div className="dim-hero-grid" style={s("display:grid;grid-template-columns:1.2fr 1fr;gap:64px;align-items:start")}>
        <div>
          <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#B8523A;margin-bottom:14px")}>{t("about.why.eyebrow")}</div>
          <h2 className="dim-h2" style={s("font:400 32px/1.15 'Instrument Sans',sans-serif;color:#1F1814;letter-spacing:-.02em;margin:0 0 20px;text-wrap:balance")}>{t("about.why.title")}</h2>
          <p style={s("font:400 15px/1.7 'Instrument Sans',sans-serif;color:#4A4036;margin:0 0 16px")}>{t("about.why.p1")}</p>
          <p style={s("font:400 15px/1.7 'Instrument Sans',sans-serif;color:#4A4036;margin:0 0 16px")}>{t("about.why.p2")}</p>
          <p style={s("font:400 15px/1.7 'Instrument Sans',sans-serif;color:#4A4036;margin:0")}>{t("about.why.p3")}</p>
        </div>

        <div style={s("background:#F1E8DA;border-radius:20px;padding:32px;align-self:stretch;display:flex;flex-direction:column;justify-content:space-between;min-height:340px")}>
          <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#1F1814;margin-bottom:18px")}>{t("about.why.aside_label")}</div>
          <div style={s("font:400 30px/1.25 var(--font-instrument-serif),serif;font-style:italic;color:#1F1814")}>{t("about.why.aside_quote")}</div>
          <div style={s("font:500 12px/1 'Instrument Sans',sans-serif;color:#8A7E70;letter-spacing:.16em;text-transform:uppercase;margin-top:32px")}>{t("about.why.aside_sign")}</div>
        </div>
      </div>
    </section>
  );
}
