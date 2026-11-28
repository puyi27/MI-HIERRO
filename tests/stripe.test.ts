import path from "node:path";
import fs from "node:fs/promises";
import JSZip from "jszip";
import Stripe from "stripe";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const storeFile = path.join(process.cwd(), ".data", `test-stripe-${process.pid}.json`);
process.env.MI_HIERRO_STORE_FILE = storeFile;
delete process.env.DATABASE_URL;
delete process.env.STRIPE_SECRET_KEY;
delete process.env.STRIPE_WEBHOOK_SECRET;
delete process.env.GEMINI_API_KEY;

const { POST: checkoutPost } = await import("@/app/api/checkout/route");
const { POST: webhookPost } = await import("@/app/api/webhooks/stripe/route");
const { GET: downloadGet } = await import("@/app/api/descarga/[token]/route");
const { getStore } = await import("@/lib/store");
const { compileForge } = await import("@/lib/forge-engine/compiler");
const { buildDeterministicBlueprints } = await import("@/lib/forge-engine/presets");
const { initialsCombinationSchema, userProfileSchema } = await import("@/types/forge");
const { createDownloadToken } = await import("@/lib/security/tokens");

const profile = userProfileSchema.parse({
  profile: "ganaderia",
  firstName: "Joaquín",
  lastName1: "García",
  lastName2: "Moreno",
  origin: "Salamanca",
  character: "senorial",
  remate: "cruz-forja",
});

const combination = initialsCombinationSchema.parse({
  id: "dos-JG",
  letters: ["J", "G"],
  label: "JG",
  kind: "dos",
  primary: "J",
  secondary: "G",
});

async function createDesign() {
  const blueprint = buildDeterministicBlueprints(profile, combination, "heraldico")[0];
  const compiled = compileForge(blueprint, combination);
  const store = await getStore();
  return store.createDesign({
    profile: "ganaderia",
    firstName: "Joaquín",
    lastName1: "García",
    lastName2: "Moreno",
    nickname: "",
    origin: "Salamanca",
    character: "senorial",
    remate: "cruz-forja",
    initials: "JG",
    style: "heraldico",
    blueprint,
    svgMaster: compiled.svg,
    scores: compiled.scores,
    lore: blueprint.lore,
  });
}

async function callDownload(token: string) {
  return downloadGet(new Request(`http://localhost:3000/api/descarga/${token}`), {
    params: Promise.resolve({ token }),
  });
}

beforeAll(async () => {
  await fs.rm(storeFile, { force: true });
});

afterAll(async () => {
  await fs.rm(storeFile, { force: true });
});

describe("pagos y entrega", () => {
  let designId = "";
  let downloadUrl = "";

  it("crea un checkout simulado y desbloquea la descarga", async () => {
    const design = await createDesign();
    designId = design.id;

    const response = await checkoutPost(
      new Request("http://localhost:3000/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.1.0.1" },
        body: JSON.stringify({ product: "premium", designId, email: "cliente@example.com" }),
      }),
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as { mode: string; downloadUrl?: string; message: string };
    expect(data.mode).toBe("simulation");
    expect(data.downloadUrl?.startsWith("/descarga/")).toBe(true);
    downloadUrl = data.downloadUrl ?? "";
  });

  it("entrega un ZIP con SVG limpio, PNG y kit de redes", async () => {
    const token = downloadUrl.replace("/descarga/", "");
    const response = await callDownload(token);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/zip");

    const buffer = Buffer.from(await response.arrayBuffer());
    const zip = await JSZip.loadAsync(buffer);
    const names = Object.keys(zip.files);
    expect(names.some((name) => name.endsWith(".svg"))).toBe(true);
    expect(names.some((name) => name.endsWith("-2400.png"))).toBe(true);
    expect(names.some((name) => name.includes("avatar"))).toBe(true);
    expect(names.some((name) => name.includes("story"))).toBe(true);
    expect(names).toContain("LEEME.txt");

    const svgName = names.find((name) => name.endsWith(".svg"));
    const svg = await zip.files[svgName ?? ""].async("string");
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("<path");
    expect(svg).not.toContain("<text");
  });

  it("registra el informe de similitud sin duplicar el pedido", async () => {
    const design = await createDesign();
    const response = await checkoutPost(
      new Request("http://localhost:3000/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.1.0.2" },
        body: JSON.stringify({ product: "similarity", designId: design.id, email: "informe@example.com" }),
      }),
    );
    expect(response.status).toBe(200);
    const data = (await response.json()) as { mode: string; orderId: string };
    expect(data.mode).toBe("simulation");

    const store = await getStore();
    const order = await store.getOrder(data.orderId);
    expect(order?.status).toBe("paid");
    const report = await store.getSimilarityByOrder(data.orderId);
    expect(report).not.toBeNull();
    const again = await store.createSimilarityRequest({
      designId: design.id,
      orderId: data.orderId,
      email: "informe@example.com",
      name: "Joaquín García",
      stripeSessionId: null,
      notes: null,
    });
    expect(again.id).toBe(report?.id);
  });

  it("rechaza tokens caducados y manipulados con 403", async () => {
    const store = await getStore();
    const order = await store.createOrder({
      designId,
      product: "premium",
      amountCents: 999,
      email: "cliente@example.com",
    });
    await store.markOrderPaid(order.id, "pi_manual");

    const expired = createDownloadToken({ d: designId, o: order.id, p: "premium" }, -30);
    expect((await callDownload(expired)).status).toBe(403);

    const valid = createDownloadToken({ d: designId, o: order.id, p: "premium" }, 600);
    expect((await callDownload(`${valid.slice(0, -2)}xx`)).status).toBe(403);

    const unknownOrder = createDownloadToken({ d: designId, o: "pedido-inexistente", p: "premium" }, 600);
    expect((await callDownload(unknownOrder)).status).toBe(403);
  });

  it("rechaza el webhook sin firma válida y sin secreto configurado", async () => {
    const body = JSON.stringify({ id: "evt_1", type: "checkout.session.completed", data: { object: {} } });

    const noSecret = await webhookPost(
      new Request("http://localhost:3000/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=abc" },
        body,
      }),
    );
    expect(noSecret.status).toBe(503);

    process.env.STRIPE_SECRET_KEY = "sk_test_mi_hierro_local";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_mi_hierro_local";

    const invalid = await webhookPost(
      new Request("http://localhost:3000/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=deadbeef" },
        body,
      }),
    );
    expect(invalid.status).toBe(400);
  });

  it("procesa el webhook una sola vez con idempotencia", async () => {
    const store = await getStore();
    const order = await store.createOrder({
      designId,
      product: "premium",
      amountCents: 999,
      email: "webhook@example.com",
      stripeSessionId: "cs_test_mi_hierro_1",
    });

    const payload = JSON.stringify({
      id: "evt_mi_hierro_1",
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_mi_hierro_1",
          object: "checkout.session",
          metadata: { orderId: order.id, designId, product: "premium" },
          payment_intent: "pi_test_123",
        },
      },
    });

    const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_mi_hierro_local";
    const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret });

    const first = await webhookPost(
      new Request("http://localhost:3000/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": signature },
        body: payload,
      }),
    );
    expect(first.status).toBe(200);
    const firstData = (await first.json()) as { duplicate: boolean };
    expect(firstData.duplicate).toBe(false);

    const paid = await store.getOrder(order.id);
    expect(paid?.status).toBe("paid");

    const second = await webhookPost(
      new Request("http://localhost:3000/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": signature },
        body: payload,
      }),
    );
    expect(second.status).toBe(200);
    const secondData = (await second.json()) as { duplicate: boolean };
    expect(secondData.duplicate).toBe(true);

    const stillPaid = await store.getOrder(order.id);
    expect(stillPaid?.paidAt).toBe(paid?.paidAt);
  });
});
