import { getTranslations } from "next-intl/server";
import { s } from "@/lib/style";

export default async function Differentiator() {
  const t = await getTranslations();
  return (
    <section className="dim-pad-h" style={s("max-width:1240px;margin:0 auto;padding:88px 40px")}>
      <div className="dim-hero-grid" style={s("display:grid;grid-template-columns:.95fr 1.05fr;gap:64px;align-items:center")}>
        <div>
          <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#5C6B4E;margin-bottom:18px")}>{t("home.diff.eyebrow")}</div>
          <h2 className="dim-h2" style={s("font:400 42px/1.1 'Instrument Sans',sans-serif;color:#1F1814;letter-spacing:-.025em;margin:0 0 22px;text-wrap:balance")} dangerouslySetInnerHTML={{ __html: t.raw("home.diff.title") }} />
          <p style={s("font:400 16px/1.6 'Instrument Sans',sans-serif;color:#4A4036;margin:0 0 28px")}>{t("home.diff.body")}</p>
          <div style={s("display:flex;flex-direction:column;gap:14px")}>
            <div style={s("display:flex;gap:14px;align-items:flex-start")}>
              <div style={s("width:22px;height:22px;border-radius:50%;background:#B8523A;color:#FAF6F0;display:flex;align-items:center;justify-content:center;font:600 12px/1 'Instrument Sans',sans-serif;flex:none;margin-top:1px")}>✓</div>
              <div style={s("font:500 15px/1.5 'Instrument Sans',sans-serif;color:#1F1814")}>{t("home.diff.p1")}</div>
            </div>
            <div style={s("display:flex;gap:14px;align-items:flex-start")}>
              <div style={s("width:22px;height:22px;border-radius:50%;background:#B8523A;color:#FAF6F0;display:flex;align-items:center;justify-content:center;font:600 12px/1 'Instrument Sans',sans-serif;flex:none;margin-top:1px")}>✓</div>
              <div style={s("font:500 15px/1.5 'Instrument Sans',sans-serif;color:#1F1814")}>{t("home.diff.p2")}</div>
            </div>
            <div style={s("display:flex;gap:14px;align-items:flex-start")}>
              <div style={s("width:22px;height:22px;border-radius:50%;background:#B8523A;color:#FAF6F0;display:flex;align-items:center;justify-content:center;font:600 12px/1 'Instrument Sans',sans-serif;flex:none;margin-top:1px")}>✓</div>
              <div style={s("font:500 15px/1.5 'Instrument Sans',sans-serif;color:#1F1814")}>{t("home.diff.p3")}</div>
            </div>
            <div style={s("display:flex;gap:14px;align-items:flex-start")}>
              <div style={s("width:22px;height:22px;border-radius:50%;background:#B8523A;color:#FAF6F0;display:flex;align-items:center;justify-content:center;font:600 12px/1 'Instrument Sans',sans-serif;flex:none;margin-top:1px")}>✓</div>
              <div style={s("font:500 15px/1.5 'Instrument Sans',sans-serif;color:#1F1814")}>{t("home.diff.p4")}</div>
            </div>
          </div>
        </div>
        <div style={s("position:relative")}>
          {/* product shot placeholder card */}
          <div style={s("background:#fff;border:1px solid #E8E0D2;border-radius:20px;padding:14px;box-shadow:0 30px 60px -28px rgba(31,24,20,.2)")}>
            <div style={s("aspect-ratio:4/3;border-radius:12px;overflow:hidden")}>
              <img src="/assets/servicio.png" alt={t("alt.servicio")} style={s("width:100%;height:100%;object-fit:cover;display:block")} />
            </div>
            <div style={s("display:flex;justify-content:space-between;align-items:center;padding:14px 6px 4px")}>
              <div>
                <div style={s("font:500 14px/1.2 'Instrument Sans',sans-serif;color:#1F1814")}>{t("home.diff.card_title")}</div>
                <div style={s("font:400 12px/1.4 'Instrument Sans',sans-serif;color:#8A7E70;margin-top:2px")}>{t("home.diff.card_body")}</div>
              </div>
              <div style={s("font-family:var(--font-instrument-serif),serif;font-style:italic;font-size:18px;color:#5C6B4E")}>5–7 days</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
