const WRAP_START = `<div style="background:#0C0B0A;padding:32px;font-family:Georgia,serif;color:#F2E9DA"><div style="max-width:560px;margin:0 auto;border:1px solid #2B2622;padding:32px">`;
const WRAP_END = `<p style="color:#8E8375;font-size:12px;line-height:1.6;margin-top:32px">MI HIERRO propone y orienta; no certifica disponibilidad ante RUCTL, OEPM, EUIPO ni OMPI. Referencia RD 787/2023.</p></div></div>`;

export function premiumEmail(downloadUrl: string, name: string): { subject: string; html: string } {
  const greeting = name ? `Hola, ${name}:` : "Hola:";
  return {
    subject: "Tu Pack Digital Premium MI HIERRO",
    html: `${WRAP_START}
      <h1 style="font-size:26px;font-weight:400;color:#C89B63;margin:0 0 20px">Tu hierro, listo para forjar</h1>
      <p style="line-height:1.7">${greeting}</p>
      <p style="line-height:1.7">El pago se ha confirmado. Desde este enlace puedes descargar el ZIP con el SVG forjable, el PNG transparente en alta resolución y el kit de redes:</p>
      <p style="margin:28px 0"><a href="${downloadUrl}" style="background:#C89B63;color:#0C0B0A;padding:14px 22px;text-decoration:none;font-weight:bold;display:inline-block">Descargar mi pack</a></p>
      <p style="line-height:1.7;color:#B9AD9C;font-size:14px">El enlace caduca en 72 horas. Antes de fabricar o usar el hierro, recomendamos una revisión profesional de similitud.</p>
      ${WRAP_END}`,
  };
}

export function similarityEmail(email: string, name: string | null): { subject: string; html: string } {
  return {
    subject: "Hemos recibido tu solicitud de Informe de Similitud",
    html: `${WRAP_START}
      <h1 style="font-size:26px;font-weight:400;color:#C89B63;margin:0 0 20px">Solicitud registrada</h1>
      <p style="line-height:1.7">${name ? `Hola, ${name}:` : "Hola:"}</p>
      <p style="line-height:1.7">Tu Informe de Similitud (${email}) entra en cola de revisión. La entrega orientativa es de 24 a 48 horas laborables y recibirás el documento por correo.</p>
      <p style="line-height:1.7;color:#B9AD9C;font-size:14px">El informe documenta fuentes, coincidencias y limitaciones. No constituye certificación de disponibilidad ni autorización administrativa.</p>
      ${WRAP_END}`,
  };
}

export function adminReportEmail(report: {
  id: string;
  email: string;
  name?: string | null;
  designId?: string | null;
  notes?: string | null;
}): { subject: string; html: string } {
  return {
    subject: `Nuevo Informe de Similitud · ${report.email}`,
    html: `${WRAP_START}
      <h1 style="font-size:24px;color:#C89B63;margin:0 0 16px">Nuevo ticket de similitud</h1>
      <p>Cliente: ${report.name ?? "sin nombre"} · ${report.email}</p>
      <p>Ticket: ${report.id}</p>
      <p>Diseño: ${report.designId ?? "no vinculado"}</p>
      <p>Notas: ${report.notes ?? "sin notas"}</p>
      <p>Plazo comprometido: 24-48 h laborables.</p>
      ${WRAP_END}`,
  };
}

export function leadEmail(lead: {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  budget?: string | null;
  designId?: string | null;
}): { subject: string; html: string } {
  const kind = lead.type === "forja" ? "Forja física" : "Revisión profesional";
  return {
    subject: `${kind} · ${lead.name}`,
    html: `${WRAP_START}
      <h1 style="font-size:24px;color:#C89B63;margin:0 0 16px">${kind}</h1>
      <p>Lead: ${lead.id}</p>
      <p>Nombre: ${lead.name}</p>
      <p>Email: ${lead.email}</p>
      <p>Teléfono: ${lead.phone || "no indicado"}</p>
      <p>Presupuesto: ${lead.budget ?? "no indicado"}</p>
      <p>Diseño: ${lead.designId ?? "no vinculado"}</p>
      <p style="white-space:pre-wrap">${lead.message}</p>
      ${WRAP_END}`,
  };
}
