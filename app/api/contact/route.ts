import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { Resend } from "resend";
import { esc, safeUrl } from "@/lib/html";
import { MAX_UPLOAD_BYTES } from "@/lib/config";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const resend = new Resend(process.env.RESEND_API_KEY);
const DB_ID = process.env.NOTION_LEADS_DB_ID!;

const vtypeMap: Record<string, string> = {
  restaurant: "Restaurante",
  pub: "Pub",
  cafe: "Cafetería",
  other: "Otro",
};

export async function POST(req: NextRequest) {
  const fd = await req.formData();

  const name = (fd.get("name") as string)?.trim();
  const email = (fd.get("email") as string)?.trim();
  const venue = (fd.get("venue") as string)?.trim();
  const vtype = (fd.get("vtype") as string) ?? "other";
  const phone = (fd.get("phone") as string)?.trim() ?? "";
  const message = (fd.get("message") as string)?.trim() ?? "";
  const menuUrl = (fd.get("menuUrl") as string)?.trim() ?? "";
  const locale = (fd.get("locale") as string) ?? "es";
  const menuFile = fd.get("menuFile") as File | null;
  const consent = (fd.get("consent") as string) ?? "";

  // Checked before any other work — including the required-field check below — so an
  // oversized file is rejected without ever calling `.arrayBuffer()` on it (the client already
  // blocks this, but the server can't rely on that: a request built by hand skips it).
  if (menuFile && menuFile.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 400 });
  }

  if (!name || !email || !venue) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // The client already blocks submission without consent, but the server must not rely on
  // that — GDPR art. 7(1) requires the operator to be able to demonstrate consent was given,
  // so a request that skips (or forges) the checkbox is rejected here too.
  if (consent !== "yes") {
    return NextResponse.json({ error: "consent_required" }, { status: 400 });
  }

  const consentTimestamp = new Date().toISOString();

  // Prepare file attachment for email
  let attachments: { filename: string; content: Buffer }[] = [];
  let fileNote = "";
  if (menuFile && menuFile.size > 0) {
    const bytes = await menuFile.arrayBuffer();
    attachments = [{ filename: menuFile.name, content: Buffer.from(bytes) }];
    fileNote = menuFile.name;
  }

  const locations = (fd.get("locations") as string)?.trim() ?? "";
  const menuToday = (fd.get("menuToday") as string)?.trim() ?? "";
  const source = (fd.get("source") as string)?.trim() ?? "";

  const extraLines = [
    locations ? `Locales: ${locations}` : "",
    menuToday ? `Carta hoy: ${menuToday}` : "",
    source ? `Origen: ${source}` : "",
    fileNote ? `Archivo adjunto: ${fileNote}` : "",
    `Consentimiento: aceptado el ${consentTimestamp}`,
  ].filter(Boolean);
  const notionMessage = [message, ...extraLines].filter(Boolean).join("\n");

  // Notion record
  try {
    await notion.pages.create({
      parent: { database_id: DB_ID },
      properties: {
        Nombre: { title: [{ text: { content: name } }] },
        Email: { email },
        Local: { rich_text: [{ text: { content: venue } }] },
        "Tipo de local": { select: { name: vtypeMap[vtype] ?? "Otro" } },
        ...(phone ? { Teléfono: { phone_number: phone } } : {}),
        ...(menuUrl ? { "URL menú actual": { url: menuUrl } } : {}),
        ...(notionMessage ? { Mensaje: { rich_text: [{ text: { content: notionMessage } }] } } : {}),
        Estado: { select: { name: "Nuevo" } },
        Idioma: { rich_text: [{ text: { content: locale } }] },
      },
    });
  } catch (err) {
    console.error("[contact] Notion error:", err);
    return NextResponse.json({ error: "notion_error", detail: String(err) }, { status: 500 });
  }

  // Email notification
  try {
    const menuUrlHref = safeUrl(menuUrl);
    await resend.emails.send({
      from: "Dimonova Web <noreply@dimonova.com>",
      to: "pablo@dimonova.com",
      subject: `Nuevo lead: ${venue.replace(/[\r\n]+/g, " ")} — ${name.replace(/[\r\n]+/g, " ")}`,
      attachments,
      html: `
        <h2 style="font-family:sans-serif">Nuevo lead desde dimonova.com</h2>
        <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
          <tr><td style="padding:4px 12px 4px 0;color:#666">Nombre</td><td><strong>${esc(name)}</strong></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#666">Local</td><td>${esc(venue)}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#666">Tipo</td><td>${esc(vtypeMap[vtype] ?? vtype)}</td></tr>
          ${phone ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Teléfono</td><td>${esc(phone)}</td></tr>` : ""}
          ${message ? `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">Mensaje</td><td>${esc(message)}</td></tr>` : ""}
          ${menuUrl ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Menú actual</td><td>${menuUrlHref ? `<a href="${menuUrlHref}">${esc(menuUrl)}</a>` : esc(menuUrl)}</td></tr>` : ""}
          ${fileNote ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Archivo</td><td>${esc(fileNote)} (adjunto)</td></tr>` : ""}
          ${locations ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Locales</td><td>${esc(locations)}</td></tr>` : ""}
          ${menuToday ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Carta hoy</td><td>${esc(menuToday)}</td></tr>` : ""}
          ${source ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Origen</td><td>${esc(source)}</td></tr>` : ""}
          <tr><td style="padding:4px 12px 4px 0;color:#666">Idioma</td><td>${esc(locale)}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#666">Consentimiento</td><td>${esc(`aceptado el ${consentTimestamp}`)}</td></tr>
        </table>
      `,
    });
  } catch (err) {
    console.error("[contact] Resend error:", err);
    // Don't fail the request — lead already saved in Notion
  }

  return NextResponse.json({ ok: true });
}
