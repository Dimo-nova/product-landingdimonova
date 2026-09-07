import { getTranslations, getLocale } from "next-intl/server";
import { s } from "@/lib/style";
import { imgSrc } from "@/lib/imgSrc";

export default async function FeaturesHero() {
  const t = await getTranslations();
  const locale = await getLocale();
  return (
    <>
      <section className="dim-pad-h" style={s("max-width:1240px;margin:0 auto;padding:64px 40px 40px")}>
        <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#B8523A;margin-bottom:18px")}>{t("features.eyebrow")}</div>
        <h1 className="dim-h1" style={s("font:400 64px/1.04 'Instrument Sans',sans-serif;color:#1F1814;letter-spacing:-.03em;text-wrap:balance;max-width:880px;margin:0 0 22px")} dangerouslySetInnerHTML={{ __html: t.raw("features.title") }} />
        <p style={s("font:400 17px/1.55 'Instrument Sans',sans-serif;color:#4A4036;max-width:640px;margin:0")}>{t("features.intro")}</p>
      </section>

      {/* Feature 1: Digital menu */}
      <section className="dim-pad-h" style={s("max-width:1240px;margin:0 auto;padding:56px 40px")}>
        <div className="dim-hero-grid" style={s("display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center")}>
          <div>
            <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#B8523A;margin-bottom:16px")}>{t("features.f1.eyebrow")}</div>
            <h2 className="dim-h2" style={s("font:400 38px/1.1 'Instrument Sans',sans-serif;color:#1F1814;letter-spacing:-.025em;margin:0 0 18px;text-wrap:balance")}>{t("features.f1.title")}</h2>
            <p style={s("font:400 16px/1.6 'Instrument Sans',sans-serif;color:#4A4036;margin:0 0 24px")}>{t("features.f1.body")}</p>
            <div style={s("display:flex;flex-direction:column;gap:12px")}>
              <div style={s("display:flex;gap:12px;align-items:flex-start")}><div style={s("width:6px;height:6px;border-radius:50%;background:#B8523A;margin-top:9px;flex:none")}></div><div style={s("font:400 14px/1.55 'Instrument Sans',sans-serif;color:#1F1814")} dangerouslySetInnerHTML={{ __html: t.raw("features.f1.p1") }} /></div>
              <div style={s("display:flex;gap:12px;align-items:flex-start")}><div style={s("width:6px;height:6px;border-radius:50%;background:#B8523A;margin-top:9px;flex:none")}></div><div style={s("font:400 14px/1.55 'Instrument Sans',sans-serif;color:#1F1814")} dangerouslySetInnerHTML={{ __html: t.raw("features.f1.p2") }} /></div>
              <div style={s("display:flex;gap:12px;align-items:flex-start")}><div style={s("width:6px;height:6px;border-radius:50%;background:#B8523A;margin-top:9px;flex:none")}></div><div style={s("font:400 14px/1.55 'Instrument Sans',sans-serif;color:#1F1814")} dangerouslySetInnerHTML={{ __html: t.raw("features.f1.p3") }} /></div>
              <div style={s("display:flex;gap:12px;align-items:flex-start")}><div style={s("width:6px;height:6px;border-radius:50%;background:#B8523A;margin-top:9px;flex:none")}></div><div style={s("font:400 14px/1.55 'Instrument Sans',sans-serif;color:#1F1814")} dangerouslySetInnerHTML={{ __html: t.raw("features.f1.p4") }} /></div>
            </div>
          </div>

          {/* Phone visual */}
          <div style={s("display:flex;justify-content:center")}>
            <div style={s("position:relative;width:300px;background:#1F1814;border-radius:42px;padding:9px;box-shadow:0 40px 80px -32px rgba(31,24,20,.4)")}>
              <div style={s("position:relative;width:100%;background:#FAF6F0;border-radius:34px;overflow:hidden")}>
                <div style={s("position:absolute;top:10px;left:50%;transform:translateX(-50%);width:90px;height:22px;background:#1F1814;border-radius:12px;z-index:2")}></div>
                <img src={imgSrc("features", locale)} alt={t("alt.features")} style={s("width:100%;display:block")} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
