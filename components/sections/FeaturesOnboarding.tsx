import { getTranslations } from "next-intl/server";
import { s } from "@/lib/style";

export default async function FeaturesOnboarding() {
  const t = await getTranslations();
  return (
    <section style={s("background:#1F1814;color:#FAF6F0")}>
      <div className="dim-pad-h" style={s("max-width:1240px;margin:0 auto;padding:104px 40px")}>
        <div style={s("display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:24px;margin-bottom:56px")}>
          <div style={s("max-width:720px")}>
            <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#D69B7F;margin-bottom:18px")}>{t("features.f4.eyebrow")}</div>
            <h2 className="dim-h2" style={s("font:400 52px/1.05 'Instrument Sans',sans-serif;color:#FAF6F0;letter-spacing:-.03em;margin:0;text-wrap:balance")} dangerouslySetInnerHTML={{ __html: t.raw("features.f4.title") }} />
          </div>
        </div>

        <div className="dim-stack4-md" style={s("display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-bottom:64px")}>
          <div style={s("background:#2A2118;border:1px solid #3A2F26;border-radius:14px;padding:24px;min-height:200px")}>
            <div style={s("font:400 32px/1 var(--font-instrument-serif),serif;font-style:italic;color:#D69B7F;margin-bottom:14px")}>i.</div>
            <div style={s("font:600 16px/1.25 'Instrument Sans',sans-serif;color:#FAF6F0;margin-bottom:8px")}>{t("features.f4.c1_title")}</div>
            <div style={s("font:400 13px/1.6 'Instrument Sans',sans-serif;color:#B8A89A")}>{t("features.f4.c1_body")}</div>
          </div>
          <div style={s("background:#2A2118;border:1px solid #3A2F26;border-radius:14px;padding:24px;min-height:200px")}>
            <div style={s("font:400 32px/1 var(--font-instrument-serif),serif;font-style:italic;color:#D69B7F;margin-bottom:14px")}>ii.</div>
            <div style={s("font:600 16px/1.25 'Instrument Sans',sans-serif;color:#FAF6F0;margin-bottom:8px")}>{t("features.f4.c2_title")}</div>
            <div style={s("font:400 13px/1.6 'Instrument Sans',sans-serif;color:#B8A89A")}>{t("features.f4.c2_body")}</div>
          </div>
          <div style={s("background:#2A2118;border:1px solid #3A2F26;border-radius:14px;padding:24px;min-height:200px")}>
            <div style={s("font:400 32px/1 var(--font-instrument-serif),serif;font-style:italic;color:#D69B7F;margin-bottom:14px")}>iii.</div>
            <div style={s("font:600 16px/1.25 'Instrument Sans',sans-serif;color:#FAF6F0;margin-bottom:8px")}>{t("features.f4.c3_title")}</div>
            <div style={s("font:400 13px/1.6 'Instrument Sans',sans-serif;color:#B8A89A")}>{t("features.f4.c3_body")}</div>
          </div>
          <div style={s("background:#2A2118;border:1px solid #3A2F26;border-radius:14px;padding:24px;min-height:200px")}>
            <div style={s("font:400 32px/1 var(--font-instrument-serif),serif;font-style:italic;color:#D69B7F;margin-bottom:14px")}>iv.</div>
            <div style={s("font:600 16px/1.25 'Instrument Sans',sans-serif;color:#FAF6F0;margin-bottom:8px")}>{t("features.f4.c4_title")}</div>
            <div style={s("font:400 13px/1.6 'Instrument Sans',sans-serif;color:#B8A89A")}>{t("features.f4.c4_body")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
