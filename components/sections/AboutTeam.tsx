import { getTranslations } from "next-intl/server";
import { s } from "@/lib/style";

export default async function AboutTeam() {
  const t = await getTranslations();
  return (
    <section className="dim-pad-h" style={s("max-width:1240px;margin:0 auto;padding:64px 40px")}>
      <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#B8523A;margin-bottom:18px")}>{t("about.team.eyebrow")}</div>
      <h2 className="dim-h2" style={s("font:400 32px/1.15 'Instrument Sans',sans-serif;color:#1F1814;letter-spacing:-.025em;margin:0 0 32px")}>{t("about.team.title")}</h2>

      <div style={s("display:grid;grid-template-columns:repeat(2,1fr);gap:20px;max-width:560px")}>
        <div>
          <img src="/assets/pablo_headshot.jpeg" alt="Pablo, co-owner" style={s("aspect-ratio:1;width:100%;object-fit:cover;border-radius:14px;display:block")} />
          <div style={s("font:500 16px/1.2 'Instrument Sans',sans-serif;color:#1F1814;margin-top:14px")}>Pablo</div>
          <div style={s("font:400 13px/1.4 'Instrument Sans',sans-serif;color:#8A7E70;margin-top:4px")}>Co-owner</div>
        </div>
        <div>
          <img src="/assets/sergio_headshot.jpg" alt="Sergio, co-owner" style={s("aspect-ratio:1;width:100%;object-fit:cover;border-radius:14px;display:block")} />
          <div style={s("font:500 16px/1.2 'Instrument Sans',sans-serif;color:#1F1814;margin-top:14px")}>Sergio</div>
          <div style={s("font:400 13px/1.4 'Instrument Sans',sans-serif;color:#8A7E70;margin-top:4px")}>Co-owner</div>
        </div>
      </div>
    </section>
  );
}
