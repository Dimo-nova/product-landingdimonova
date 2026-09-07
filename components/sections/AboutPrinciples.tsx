import { getTranslations } from "next-intl/server";
import { s } from "@/lib/style";

export default async function AboutPrinciples() {
  const t = await getTranslations();
  return (
    <section className="dim-pad-h" style={s("max-width:1240px;margin:0 auto;padding:64px 40px")}>
      <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#B8523A;margin-bottom:18px")}>{t("about.principles.eyebrow")}</div>
      <h2 className="dim-h2" style={s("font:400 36px/1.1 'Instrument Sans',sans-serif;color:#1F1814;letter-spacing:-.025em;margin:0 0 40px;text-wrap:balance;max-width:680px")}>{t("about.principles.title")}</h2>

      <div className="dim-stack-md" style={s("display:grid;grid-template-columns:repeat(3,1fr);gap:24px")}>
        <div style={s("background:#fff;border:1px solid #E8E0D2;border-radius:18px;padding:32px")}>
          <div style={s("font:400 40px/1 var(--font-instrument-serif),serif;font-style:italic;color:#B8523A;margin-bottom:18px")}>i.</div>
          <h3 style={s("font:500 20px/1.2 'Instrument Sans',sans-serif;color:#1F1814;letter-spacing:-.01em;margin:0 0 10px")}>{t("about.principles.p1_title")}</h3>
          <p style={s("font:400 14px/1.6 'Instrument Sans',sans-serif;color:#4A4036;margin:0")}>{t("about.principles.p1_body")}</p>
        </div>
        <div style={s("background:#fff;border:1px solid #E8E0D2;border-radius:18px;padding:32px")}>
          <div style={s("font:400 40px/1 var(--font-instrument-serif),serif;font-style:italic;color:#B8523A;margin-bottom:18px")}>ii.</div>
          <h3 style={s("font:500 20px/1.2 'Instrument Sans',sans-serif;color:#1F1814;letter-spacing:-.01em;margin:0 0 10px")}>{t("about.principles.p2_title")}</h3>
          <p style={s("font:400 14px/1.6 'Instrument Sans',sans-serif;color:#4A4036;margin:0")}>{t("about.principles.p2_body")}</p>
        </div>
        <div style={s("background:#fff;border:1px solid #E8E0D2;border-radius:18px;padding:32px")}>
          <div style={s("font:400 40px/1 var(--font-instrument-serif),serif;font-style:italic;color:#B8523A;margin-bottom:18px")}>iii.</div>
          <h3 style={s("font:500 20px/1.2 'Instrument Sans',sans-serif;color:#1F1814;letter-spacing:-.01em;margin:0 0 10px")}>{t("about.principles.p3_title")}</h3>
          <p style={s("font:400 14px/1.6 'Instrument Sans',sans-serif;color:#4A4036;margin:0")}>{t("about.principles.p3_body")}</p>
        </div>
      </div>
    </section>
  );
}
