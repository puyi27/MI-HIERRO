import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Resend } from "resend";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface EmailResult {
  id: string;
  simulated: boolean;
}

async function recordLocally(payload: EmailPayload): Promise<EmailResult> {
  const id = `dev-${randomUUID()}`;
  const target = path.resolve(process.cwd(), ".data/mail.log");
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.appendFile(
    target,
    `${JSON.stringify({ id, to: payload.to, subject: payload.subject, at: new Date().toISOString() })}\n`,
    "utf8",
  );
  return { id, simulated: true };
}

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return recordLocally(payload);

  try {
    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM_EMAIL || "MI HIERRO <no-reply@mihierro.es>";
    const result = await resend.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    if (result.error) return recordLocally(payload);
    return { id: result.data?.id ?? `resend-${randomUUID()}`, simulated: false };
  } catch {
    return recordLocally(payload);
  }
}

export async function sendAdminEmail(subject: string, html: string): Promise<EmailResult> {
  const admin = process.env.ADMIN_EMAIL || "hola@mihierro.es";
  return sendEmail({ to: admin, subject, html });
}
