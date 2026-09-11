import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { esc } from "@/lib/html";
import { CONTACT } from "@/lib/config";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The first of the two lead notifications. The hero's email field posts here the moment someone
 * types an address and presses "book a demo" — before the demo modal opens, and whether or not
 * they go on to fill it in — so the owner hears about every address that was ever typed in. The
 * second notification, with the whole form, is `/api/contact`.
 *
 * Nothing is stored: the address goes into one email to the owner and nowhere else, which is
 * what the line under the field promises ("we only use your email to get in touch").
 */
export async function POST(req: NextRequest) {
  let body: { email?: unknown; source?: unknown; locale?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const source = typeof body.source === "string" ? body.source.trim().slice(0, 60) : "";
  const locale = typeof body.locale === "string" ? body.locale.trim().slice(0, 5) : "";

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: "Dimonova Web <noreply@dimonova.com>",
      to: CONTACT.email,
      subject: `Aviso: ${email} ha pedido una demo`,
      html: `
        <h2 style="font-family:sans-serif">Alguien ha pedido una demo</h2>
        <p style="font-family:sans-serif;font-size:14px">
          Ha escrito su correo en la web y ha pulsado «pedir demo». Si termina el formulario
          llegará un segundo correo con el resto de datos.
        </p>
        <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
          <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
          ${source ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Origen</td><td>${esc(source)}</td></tr>` : ""}
          ${locale ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Idioma</td><td>${esc(locale)}</td></tr>` : ""}
          <tr><td style="padding:4px 12px 4px 0;color:#666">Cuándo</td><td>${esc(new Date().toISOString())}</td></tr>
        </table>
      `,
    });
  } catch (err) {
    console.error("[demo-interest] Resend error:", err);
    return NextResponse.json({ error: "email_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
