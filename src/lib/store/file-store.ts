import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  CreateDesignInput,
  CreateLeadInput,
  CreateOrderInput,
  DesignRecord,
  ForgeStore,
  LeadRecord,
  OrderRecord,
  SimilarityRequestRecord,
} from "@/lib/store/types";

interface DatabaseShape {
  designs: DesignRecord[];
  orders: OrderRecord[];
  reports: SimilarityRequestRecord[];
  leads: LeadRecord[];
}

const EMPTY_DATABASE: DatabaseShape = { designs: [], orders: [], reports: [], leads: [] };

let writeChain: Promise<unknown> = Promise.resolve();

function databasePath(): string {
  return path.resolve(process.cwd(), process.env.MI_HIERRO_STORE_FILE || ".data/dev-db.json");
}

async function readDatabase(): Promise<DatabaseShape> {
  try {
    const raw = await fs.readFile(databasePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<DatabaseShape>;
    return {
      designs: parsed.designs ?? [],
      orders: parsed.orders ?? [],
      reports: parsed.reports ?? [],
      leads: parsed.leads ?? [],
    };
  } catch {
    return { ...EMPTY_DATABASE, designs: [], orders: [], reports: [], leads: [] };
  }
}

async function writeDatabase(database: DatabaseShape): Promise<void> {
  const target = databasePath();
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(database, null, 2), "utf8");
}

async function mutate<T>(operation: (database: DatabaseShape) => T | Promise<T>): Promise<T> {
  const run = writeChain.then(async () => {
    const database = await readDatabase();
    const result = await operation(database);
    await writeDatabase(database);
    return result;
  });
  writeChain = run.catch(() => undefined);
  return run;
}

export const fileStore: ForgeStore = {
  async createDesign(input: CreateDesignInput) {
    return mutate((database) => {
      const record: DesignRecord = {
        id: randomUUID(),
        profile: input.profile,
        firstName: input.firstName,
        lastName1: input.lastName1,
        lastName2: input.lastName2,
        nickname: input.nickname,
        origin: input.origin,
        character: input.character,
        remate: input.remate,
        initials: input.initials,
        style: input.style,
        blueprint: input.blueprint,
        svgMaster: input.svgMaster,
        previewKey: null,
        scores: input.scores,
        lore: input.lore,
        createdAt: new Date().toISOString(),
      };
      database.designs.push(record);
      return record;
    });
  },

  async getDesign(id: string) {
    const database = await readDatabase();
    return database.designs.find((design) => design.id === id) ?? null;
  },

  async createOrder(input: CreateOrderInput) {
    return mutate((database) => {
      const record: OrderRecord = {
        id: randomUUID(),
        designId: input.designId,
        product: input.product,
        amountCents: input.amountCents,
        currency: "eur",
        status: "pending",
        email: input.email,
        stripeSessionId: input.stripeSessionId ?? null,
        stripePaymentIntentId: null,
        downloadTokenId: input.downloadTokenId ?? null,
        paidAt: null,
        metadata: input.metadata ?? null,
        createdAt: new Date().toISOString(),
      };
      database.orders.push(record);
      return record;
    });
  },

  async getOrder(id: string) {
    const database = await readDatabase();
    return database.orders.find((order) => order.id === id) ?? null;
  },

  async getOrderBySession(sessionId: string) {
    const database = await readDatabase();
    return database.orders.find((order) => order.stripeSessionId === sessionId) ?? null;
  },

  async markOrderPaid(id: string, stripePaymentIntentId: string | null) {
    return mutate((database) => {
      const order = database.orders.find((item) => item.id === id);
      if (!order) return null;
      if (order.status === "paid") return order;
      order.status = "paid";
      order.stripePaymentIntentId = stripePaymentIntentId;
      order.paidAt = new Date().toISOString();
      return order;
    });
  },

  async attachStripeSession(id: string, stripeSessionId: string) {
    return mutate((database) => {
      const order = database.orders.find((item) => item.id === id);
      if (!order) return null;
      order.stripeSessionId = stripeSessionId;
      return order;
    });
  },

  async markOrderFailed(id: string) {
    return mutate((database) => {
      const order = database.orders.find((item) => item.id === id);
      if (!order || order.status === "paid") return order ?? null;
      order.status = "failed";
      return order;
    });
  },

  async createSimilarityRequest(input) {
    return mutate((database) => {
      const existing = input.orderId ? database.reports.find((report) => report.orderId === input.orderId) : undefined;
      if (existing) return existing;
      const record: SimilarityRequestRecord = {
        id: randomUUID(),
        designId: input.designId,
        orderId: input.orderId,
        email: input.email,
        name: input.name,
        status: "pending",
        stripeSessionId: input.stripeSessionId,
        notes: input.notes,
        createdAt: new Date().toISOString(),
      };
      database.reports.push(record);
      return record;
    });
  },

  async getSimilarityByOrder(orderId: string) {
    const database = await readDatabase();
    return database.reports.find((report) => report.orderId === orderId) ?? null;
  },

  async createLead(input: CreateLeadInput) {
    return mutate((database) => {
      const record: LeadRecord = {
        id: randomUUID(),
        type: input.type,
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message,
        budget: input.budget,
        designId: input.designId,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      database.leads.push(record);
      return record;
    });
  },

  async listOrders(limit = 60) {
    const database = await readDatabase();
    return [...database.orders]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, limit);
  },

  async listLeads(limit = 60) {
    const database = await readDatabase();
    return [...database.leads]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, limit);
  },

  async listSimilarityRequests(limit = 60) {
    const database = await readDatabase();
    return [...database.reports]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, limit);
  },

  async updateSimilarityStatus(id, status) {
    return mutate((database) => {
      const report = database.reports.find((item) => item.id === id);
      if (!report) return null;
      report.status = status;
      return report;
    });
  },
};
