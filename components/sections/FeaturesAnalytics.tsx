import { getTranslations, getLocale } from "next-intl/server";
import { s } from "@/lib/style";
import { imgSrc } from "@/lib/imgSrc";

export default async function FeaturesAnalytics() {
  const t = await getTranslations();
  const locale = await getLocale();
  return (
    <section className="dim-pad-h" style={s("max-width:1240px;margin:0 auto;padding:88px 40px")}>
      <div className="dim-hero-grid" style={s("display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center")}>
        <div>
          <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#B8523A;margin-bottom:16px")}>{t("features.f3.eyebrow")}</div>
          <h2 className="dim-h2" style={s("font:400 38px/1.1 'Instrument Sans',sans-serif;color:#1F1814;letter-spacing:-.025em;margin:0 0 18px;text-wrap:balance")}>{t("features.f3.title")}</h2>
          <p style={s("font:400 16px/1.6 'Instrument Sans',sans-serif;color:#4A4036;margin:0 0 24px")}>{t("features.f3.body")}</p>
          <div style={s("display:flex;flex-direction:column;gap:12px")}>
            <div style={s("display:flex;gap:12px;align-items:flex-start")}><div style={s("width:6px;height:6px;border-radius:50%;background:#B8523A;margin-top:9px;flex:none")}></div><div style={s("font:400 14px/1.55 'Instrument Sans',sans-serif;color:#1F1814")} dangerouslySetInnerHTML={{ __html: t.raw("features.f3.p1") }} /></div>
            <div style={s("display:flex;gap:12px;align-items:flex-start")}><div style={s("width:6px;height:6px;border-radius:50%;background:#B8523A;margin-top:9px;flex:none")}></div><div style={s("font:400 14px/1.55 'Instrument Sans',sans-serif;color:#1F1814")} dangerouslySetInnerHTML={{ __html: t.raw("features.f3.p2") }} /></div>
            <div style={s("display:flex;gap:12px;align-items:flex-start")}><div style={s("width:6px;height:6px;border-radius:50%;background:#B8523A;margin-top:9px;flex:none")}></div><div style={s("font:400 14px/1.55 'Instrument Sans',sans-serif;color:#1F1814")} dangerouslySetInnerHTML={{ __html: t.raw("features.f3.p3") }} /></div>
          </div>
        </div>

        {/* Analytics visual */}
        <img src={imgSrc("manager_data", locale)} alt={t("alt.managerData")} style={s("width:100%;border-radius:18px;display:block;box-shadow:0 30px 60px -28px rgba(31,24,20,.18)")} />
      </div>
    </section>
  );
}
