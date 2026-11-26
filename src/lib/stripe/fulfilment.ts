import { getStore } from "@/lib/store";
import { createDownloadToken } from "@/lib/security/tokens";
import { sendAdminEmail, sendEmail } from "@/lib/email/send";
import { adminReportEmail, premiumEmail, similarityEmail } from "@/lib/email/templates";
import type { OrderRecord } from "@/lib/store/types";

export interface FulfilmentResult {
  order: OrderRecord;
  token: string | null;
  duplicate: boolean;
}

export async function fulfilPaidOrder(
  orderId: string,
  stripePaymentIntentId: string | null,
  origin: string,
): Promise<FulfilmentResult | null> {
  const store = await getStore();
  const order = await store.getOrder(orderId);
  if (!order) return null;

  if (order.status === "paid") {
    const existingToken =
      order.product === "premium"
        ? createDownloadToken({ d: order.designId ?? "sin-diseno", o: order.id, p: order.product })
        : null;
    return { order, token: existingToken, duplicate: true };
  }

  const paid = await store.markOrderPaid(orderId, stripePaymentIntentId);
  if (!paid) return null;

  const design = paid.designId ? await store.getDesign(paid.designId) : null;

  if (paid.product === "premium") {
    const token = createDownloadToken({ d: paid.designId ?? "sin-diseno", o: paid.id, p: paid.product });
    if (paid.email) {
      const template = premiumEmail(`${origin}/descarga/${token}`, design?.firstName ?? "");
      await sendEmail({ to: paid.email, subject: template.subject, html: template.html });
    }
    return { order: paid, token, duplicate: false };
  }

  const report = await store.createSimilarityRequest({
    designId: paid.designId,
    orderId: paid.id,
    email: paid.email ?? "sin-email@mihierro.es",
    name: design ? `${design.firstName} ${design.lastName1}` : null,
    stripeSessionId: paid.stripeSessionId,
    notes: design ? `Estilo ${design.style} · iniciales ${design.initials}` : null,
  });

  const adminTemplate = adminReportEmail({
    id: report.id,
    email: report.email,
    name: report.name,
    designId: report.designId,
    notes: report.notes,
  });
  await sendAdminEmail(adminTemplate.subject, adminTemplate.html);

  if (paid.email) {
    const customer = similarityEmail(paid.email, report.name);
    await sendEmail({ to: paid.email, subject: customer.subject, html: customer.html });
  }

  return { order: paid, token: null, duplicate: false };
}
