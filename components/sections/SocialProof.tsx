import { getTranslations } from "next-intl/server";
import { s } from "@/lib/style";

export default async function SocialProof() {
  const t = await getTranslations();
  return (
    <section className="dim-pad-h" style={s("max-width:1240px;margin:0 auto;padding:32px 40px 88px")}>
      <div className="dim-stack-md" style={s("display:grid;grid-template-columns:1.4fr 1fr;gap:24px")}>
        <div style={s("background:#F1E8DA;border-radius:20px;padding:48px 44px;display:flex;flex-direction:column;justify-content:space-between;min-height:340px")}>
          <div>
            <div style={s("font:400 36px/1 var(--font-instrument-serif),serif;font-style:italic;color:#B8523A;margin-bottom:18px")}>&ldquo;</div>
            <div style={s("font:400 26px/1.35 'Instrument Sans',sans-serif;color:#1F1814;letter-spacing:-.01em;text-wrap:balance")}>{t("home.proof.quote")}</div>
          </div>
          <div style={s("display:flex;align-items:center;gap:14px;margin-top:32px")}>
            <div style={s("width:44px;height:44px;border-radius:50%;background:#D69B7F;border:2px solid #FAF6F0")}></div>
            <div>
              <div style={s("font:500 14px/1 'Instrument Sans',sans-serif;color:#1F1814")}>{t("home.proof.client")}</div>
              <div style={s("font:400 12px/1.4 'Instrument Sans',sans-serif;color:#8A7E70;margin-top:2px")}>{t("home.proof.role")}</div>
            </div>
          </div>
        </div>

        <div style={s("display:grid;grid-template-columns:1fr;gap:20px")}>
          <div style={s("background:#fff;border:1px solid #E8E0D2;border-radius:20px;padding:28px")}>
            <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#8A7E70;margin-bottom:12px")}>{t("home.proof.stat1_label")}</div>
            <div style={s("font:400 44px/1 'Instrument Sans',sans-serif;color:#1F1814;letter-spacing:-.03em")}>5–7 <span style={s("font-family:var(--font-instrument-serif),serif;font-style:italic;font-size:20px;color:#5C6B4E")}>{t("home.proof.stat1_unit")}</span></div>
          </div>
          <div style={s("background:#fff;border:1px solid #E8E0D2;border-radius:20px;padding:28px")}>
            <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#8A7E70;margin-bottom:12px")}>{t("home.proof.stat2_label")}</div>
            <div style={s("font:400 44px/1 'Instrument Sans',sans-serif;color:#1F1814;letter-spacing:-.03em")}>100%</div>
          </div>
        </div>
      </div>
    </section>
  );
}
