/**
 * Google Apps Script — Contact Form Handler for Amanda López Soler
 *
 * Saves every contact form submission to the bound Google Sheet
 * and sends an email notification to Amanda's Gmail with replyTo set
 * to the visitor's email address.
 */

const NOTIFY_EMAIL = "lopezsoleramanda@gmail.com";
const SHEET_NAME = "Consultas";

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    const raw = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    const data = JSON.parse(raw);

    // 1. Honeypot spam check: silently accept without saving/emailing
    if (data.website && String(data.website).trim() !== "") {
      return jsonResponse({ ok: true });
    }

    const name = sanitize(data.name, 120);
    const phone = sanitize(data.phone, 30);
    const email = sanitize(data.email, 160);
    const message = sanitize(data.message, 2000);
    const lang = (data.lang === "ca") ? "CA" : "ES";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, error: "Invalid email" });
    }
    if (!message) {
      return jsonResponse({ ok: false, error: "Message is required" });
    }

    // 2. Append row to Google Sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Fecha",
        "Nombre",
        "Teléfono",
        "Correo electrónico",
        "Mensaje",
        "Idioma",
        "Estado",
        "Notas"
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    const timestamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() || "Europe/Madrid",
      "yyyy-MM-dd HH:mm"
    );

    sheet.appendRow([
      timestamp,
      name || "-",
      phone || "-",
      email,
      message,
      lang,
      "Pendiente",
      ""
    ]);

    // 3. Send email notification to Gmail
    const subject = `Nueva consulta web (${lang})${name ? " — " + name : ""}`;
    const body = [
      "Has recibido una nueva consulta desde tu página web:",
      "",
      `Fecha: ${timestamp}`,
      `Nombre: ${name || "(No indicado)"}`,
      `Teléfono: ${phone || "(No indicado)"}`,
      `Correo electrónico: ${email}`,
      `Idioma: ${lang}`,
      "",
      "Mensaje:",
      message,
      "",
      "—",
      "Puedes responder directamente a este correo para contestar a la persona.",
      `Hoja de seguimiento: ${ss.getUrl()}`
    ].join("\n");

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: subject,
      body: body
    });

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function sanitize(value, maxLen) {
  if (value === null || value === undefined) return "";
  let s = String(value).trim().slice(0, maxLen);
  // Prevent Google Sheets formula injection (=, +, -, @ at start)
  if (/^[=+\-@]/.test(s)) {
    s = "'" + s;
  }
  return s;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
