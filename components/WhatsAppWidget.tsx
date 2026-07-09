"use client";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { s } from "@/lib/style";
import Hover from "./Hover";
import { CONTACT } from "@/lib/config";

export default function WhatsAppWidget() {
  const t = useTranslations();
  const locale = useLocale();
  const waUrl = locale === "es" ? CONTACT.whatsappES : CONTACT.whatsappIE;
  const [waOpen, setWaOpen] = useState(false);

  useEffect(() => {
    const handler = () => setWaOpen(true);
    window.addEventListener("dimonova:open-wa", handler);
    return () => window.removeEventListener("dimonova:open-wa", handler);
  }, []);

  return (
    <div
      style={s(
        "position:fixed;right:24px;bottom:24px;z-index:60;display:flex;flex-direction:column;align-items:flex-end;gap:14px;pointer-events:none"
      )}
    >
      {/* Panel — visible when waOpen */}
      {waOpen && (
        <div
          className="dim-pop"
          style={s(
            "pointer-events:auto;width:320px;background:#FAF6F0;border-radius:18px;box-shadow:0 24px 48px -16px rgba(31,24,20,.35);overflow:hidden;border:1px solid #E8E0D2"
          )}
        >
          {/* Header */}
          <div
            style={s(
              "background:#075E54;color:#FAF6F0;padding:18px 20px;display:flex;align-items:center;gap:12px"
            )}
          >
            <div
              style={s(
                "width:36px;height:36px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;font:600 14px/1 'Instrument Sans',sans-serif;color:#FAF6F0"
              )}
            >
              D
            </div>
            <div style={s("flex:1")}>
              <div
                style={s(
                  "font:600 14px/1 'Instrument Sans',sans-serif"
                )}
              >
                {t("wa.name")}
              </div>
              <div
                style={s(
                  "font:400 11px/1.3 'Instrument Sans',sans-serif;color:#B0D4CC;margin-top:3px"
                )}
              >
                {t("wa.status")}
              </div>
            </div>
            <button
              onClick={() => setWaOpen(false)}
              style={s(
                "color:#FAF6F0;opacity:.8;font:400 18px/1 'Instrument Sans',sans-serif;padding:4px 8px;cursor:pointer"
              )}
              aria-label="Close WhatsApp"
            >
              ×
            </button>
          </div>

          {/* Chat body */}
          <div style={s("padding:20px;background:#ECE5DD")}>
            <div
              style={s(
                "background:#FAF6F0;border-radius:10px 10px 10px 2px;padding:12px 14px;font:400 13px/1.5 'Instrument Sans',sans-serif;color:#1F1814;max-width:240px;box-shadow:0 1px 1px rgba(0,0,0,.08);margin-bottom:14px"
              )}
            >
              {t("wa.greeting")}
            </div>
            <div
              style={s(
                "display:flex;flex-direction:column;gap:8px;margin-bottom:16px"
              )}
            >
              <Hover
                as="div"
                base="background:#FAF6F0;border:1px solid #E8E0D2;border-radius:999px;padding:9px 14px;font:500 12px/1 'Instrument Sans',sans-serif;color:#1F1814;align-self:flex-end;cursor:pointer"
                hover="background:#F1E8DA"
              >
                {t("wa.chip_restaurant")}
              </Hover>
              <Hover
                as="div"
                base="background:#FAF6F0;border:1px solid #E8E0D2;border-radius:999px;padding:9px 14px;font:500 12px/1 'Instrument Sans',sans-serif;color:#1F1814;align-self:flex-end;cursor:pointer"
                hover="background:#F1E8DA"
              >
                {t("wa.chip_pub")}
              </Hover>
              <Hover
                as="div"
                base="background:#FAF6F0;border:1px solid #E8E0D2;border-radius:999px;padding:9px 14px;font:500 12px/1 'Instrument Sans',sans-serif;color:#1F1814;align-self:flex-end;cursor:pointer"
                hover="background:#F1E8DA"
              >
                {t("wa.chip_cafe")}
              </Hover>
            </div>
          </div>

          {/* CTA footer */}
          <div
            style={s(
              "padding:14px 20px;background:#FAF6F0;border-top:1px solid #E8E0D2"
            )}
          >
            <Hover
              as="a"
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              base="width:100%;background:#25D366;color:#FAF6F0;font:600 13px/1 'Instrument Sans',sans-serif;padding:12px 16px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none"
              hover="background:#1FB755"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.6 6.32A8.78 8.78 0 0 0 12 3.5 8.83 8.83 0 0 0 3.17 12.3a8.78 8.78 0 0 0 1.18 4.4L3 21l4.45-1.17a8.83 8.83 0 0 0 4.55 1.25h.01A8.83 8.83 0 0 0 20.83 12.3a8.78 8.78 0 0 0-3.23-5.98ZM12 19.6a7.3 7.3 0 0 1-3.72-1.02l-.27-.16-2.64.7.7-2.58-.17-.27a7.3 7.3 0 0 1 11.32-9 7.27 7.27 0 0 1 2.15 5.13A7.34 7.34 0 0 1 12 19.6Z" />
              </svg>
              <span>{t("wa.continue")}</span>
            </Hover>
            <div
              style={s(
                "font:400 10px/1.4 'Instrument Sans',sans-serif;color:#8A7E70;margin-top:8px;text-align:center"
              )}
            >
              {t("wa.disclaimer")}
            </div>
          </div>
        </div>
      )}

      {/* Launcher button */}
      <Hover
        as="button"
        base="pointer-events:auto;width:60px;height:60px;border-radius:50%;background:#25D366;color:#FAF6F0;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 24px -8px rgba(37,211,102,.5);transition:transform .15s;cursor:pointer"
        hover="transform:scale(1.05);background:#1FB755"
        onClick={() => setWaOpen((v) => !v)}
        aria-label="WhatsApp"
        className="dim-wa-pulse"
      >
        {!waOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            width="30"
            height="30"
            fill="currentColor"
            style={s("display:block")}
          >
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
          </svg>
        ) : (
          <span
            style={s(
              "font:400 26px/1 'Instrument Sans',sans-serif;color:#FAF6F0"
            )}
          >
            ×
          </span>
        )}
      </Hover>
    </div>
  );
}
