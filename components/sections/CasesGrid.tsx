import { getTranslations } from "next-intl/server";
import { s } from "@/lib/style";
import Hover from "@/components/Hover";

const CARD_TYPES = [
  "type_restaurant",
  "type_pub",
  "type_cafe",
  "type_restaurant",
  "type_pub",
  "type_cafe",
] as const;

export default async function CasesGrid() {
  const t = await getTranslations();
  return (
    <section className="dim-pad-h" style={s("max-width:1240px;margin:0 auto;padding:32px 40px")}>
      <div className="dim-stack-md" style={s("display:grid;grid-template-columns:repeat(3,1fr);gap:20px")}>
        {CARD_TYPES.map((type, i) => (
          <Hover
            key={i}
            as="div"
            base="background:#fff;border:1px solid #E8E0D2;border-radius:18px;overflow:hidden;transition:transform .2s,box-shadow .2s"
            hover="transform:translateY(-3px);box-shadow:0 20px 40px -24px rgba(31,24,20,.18)"
          >
            <div style={s("aspect-ratio:4/3;background:repeating-linear-gradient(45deg,#F4ECDE,#F4ECDE 8px,#EAE0CC 8px,#EAE0CC 16px);position:relative")}>
              <div style={s("position:absolute;top:14px;left:14px;font:500 9px/1 'Instrument Sans',sans-serif;letter-spacing:.2em;color:#8A7E70;text-transform:uppercase")}>{t("cases.grid.photo")}</div>
            </div>
            <div style={s("padding:24px")}>
              <div style={s("font:500 10px/1 'Instrument Sans',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#B8523A;margin-bottom:10px")}>{t(`cases.grid.${type}`)}</div>
              <div style={s("font:500 18px/1.2 'Instrument Sans',sans-serif;color:#1F1814;letter-spacing:-.01em;margin-bottom:8px")}>{t("cases.grid.venue")}</div>
              <div style={s("font:400 13px/1.55 'Instrument Sans',sans-serif;color:#4A4036")}>{t("cases.grid.summary")}</div>
              <div style={s("display:flex;justify-content:space-between;margin-top:18px;padding-top:18px;border-top:1px solid #F1E8DA")}>
                <div>
                  <div style={s("font:500 9px/1 'Instrument Sans',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#8A7E70")}>{t("cases.grid.live_since")}</div>
                  <div style={s("font:500 13px/1 'Instrument Sans',sans-serif;color:#1F1814;margin-top:4px")}>{t("cases.grid.live_value")}</div>
                </div>
                <div>
                  <div style={s("font:500 9px/1 'Instrument Sans',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#8A7E70")}>{t("cases.grid.result")}</div>
                  <div style={s("font-family:var(--font-instrument-serif),serif;font-style:italic;font-size:14px;color:#5C6B4E;margin-top:4px")}>{t("cases.grid.result_value")}</div>
                </div>
              </div>
            </div>
          </Hover>
        ))}
      </div>
    </section>
  );
}
