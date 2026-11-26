import path from "node:path";
import fs from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const storeFile = path.join(process.cwd(), ".data", `test-leads-${process.pid}.json`);
process.env.MI_HIERRO_STORE_FILE = storeFile;
delete process.env.DATABASE_URL;
delete process.env.RESEND_API_KEY;

const { POST: leadsPost } = await import("@/app/api/leads/route");
const { resetMemoryRateLimit } = await import("@/lib/security/rate-limit");

const payload = {
  type: "revision",
  name: "Joaquín García",
  email: "joaquin@example.com",
  phone: "+34 600 111 222",
  message: "Quiero revisar la similitud del hierro antes de encargar la forja física.",
  budget: "49-99",
};

function leadRequest(ip: string, body: unknown) {
  return leadsPost(
    new Request("http://localhost:3000/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(body),
    }),
  );
}

beforeAll(async () => {
  await fs.rm(storeFile, { force: true });
  resetMemoryRateLimit();
});

afterAll(async () => {
  await fs.rm(storeFile, { force: true });
});

describe("solicitudes de revisión y forja", () => {
  it("guarda la solicitud y responde con su identificador", async () => {
    const response = await leadRequest("10.2.0.1", payload);
    expect(response.status).toBe(200);
    const data = (await response.json()) as { ok: boolean; leadId: string; message: string };
    expect(data.ok).toBe(true);
    expect(data.leadId.length).toBeGreaterThan(8);
    expect(data.message.length).toBeGreaterThan(10);

    const stored = JSON.parse(await fs.readFile(storeFile, "utf8")) as {
      leads: Array<{ id: string; email: string; status: string }>;
    };
    const lead = stored.leads.find((item) => item.id === data.leadId);
    expect(lead?.email).toBe("joaquin@example.com");
    expect(lead?.status).toBe("pending");
  });

  it("rechaza mensajes demasiado cortos y emails inválidos", async () => {
    const shortMessage = await leadRequest("10.2.0.2", { ...payload, message: "corto" });
    expect(shortMessage.status).toBe(400);
    const badEmail = await leadRequest("10.2.0.3", { ...payload, email: "no-email" });
    expect(badEmail.status).toBe(400);
  });

  it("limita el número de solicitudes por IP", async () => {
    const responses = [];
    for (let index = 0; index < 8; index += 1) {
      responses.push(await leadRequest("10.2.1.1", { ...payload, type: "forja", budget: "forja" }));
    }
    const statuses = responses.map((response) => response.status);
    expect(statuses[0]).toBe(200);
    expect(statuses[statuses.length - 1]).toBe(429);
  });
});
