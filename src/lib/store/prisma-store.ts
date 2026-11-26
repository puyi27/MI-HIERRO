import { Prisma, PrismaClient } from "@prisma/client";
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
import type { BrandBlueprint, DesignScores, ForgeStyle, ProfileType } from "@/types/forge";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function designRecord(design: {
  id: string;
  profile: string;
  firstName: string;
  lastName1: string;
  lastName2: string | null;
  nickname: string | null;
  origin: string | null;
  character: string;
  remate: string;
  initials: string;
  style: string;
  blueprint: Prisma.JsonValue;
  svgMaster: string;
  previewKey: string | null;
  scores: Prisma.JsonValue;
  lore: string;
  createdAt: Date;
}): DesignRecord {
  return {
    id: design.id,
    profile: design.profile as ProfileType,
    firstName: design.firstName,
    lastName1: design.lastName1,
    lastName2: design.lastName2 ?? "",
    nickname: design.nickname ?? "",
    origin: design.origin ?? "",
    character: design.character,
    remate: design.remate,
    initials: design.initials,
    style: design.style,
    blueprint: design.blueprint as unknown as BrandBlueprint,
    svgMaster: design.svgMaster,
    previewKey: design.previewKey,
    scores: design.scores as unknown as DesignScores,
    lore: design.lore,
    createdAt: design.createdAt.toISOString(),
  };
}

function orderRecord(order: {
  id: string;
  designId: string | null;
  product: string;
  amountCents: number;
  currency: string;
  status: string;
  email: string | null;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  downloadTokenId: string | null;
  paidAt: Date | null;
  metadata: Prisma.JsonValue;
  createdAt: Date;
}): OrderRecord {
  return {
    id: order.id,
    designId: order.designId,
    product: order.product as "premium" | "similarity",
    amountCents: order.amountCents,
    currency: order.currency,
    status: order.status as OrderRecord["status"],
    email: order.email,
    stripeSessionId: order.stripeSessionId,
    stripePaymentIntentId: order.stripePaymentIntentId,
    downloadTokenId: order.downloadTokenId,
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
    metadata: (order.metadata as Record<string, unknown> | null) ?? null,
    createdAt: order.createdAt.toISOString(),
  };
}

export const prismaStore: ForgeStore = {
  async createDesign(input: CreateDesignInput) {
    const created = await prisma.design.create({
      data: {
        profile: input.profile as ProfileType,
        firstName: input.firstName,
        lastName1: input.lastName1,
        lastName2: input.lastName2 || null,
        nickname: input.nickname || null,
        origin: input.origin || null,
        character: input.character,
        remate: input.remate,
        initials: input.initials,
        style: input.style as ForgeStyle,
        blueprint: toJson(input.blueprint),
        svgMaster: input.svgMaster,
        scores: toJson(input.scores),
        lore: input.lore,
      },
    });
    return designRecord(created);
  },

  async getDesign(id: string) {
    const design = await prisma.design.findUnique({ where: { id } });
    return design ? designRecord(design) : null;
  },

  async createOrder(input: CreateOrderInput) {
    const created = await prisma.order.create({
      data: {
        designId: input.designId,
        product: input.product === "premium" ? "premium" : "similarity",
        amountCents: input.amountCents,
        email: input.email,
        stripeSessionId: input.stripeSessionId ?? null,
        downloadTokenId: input.downloadTokenId ?? null,
        metadata: input.metadata ? toJson(input.metadata) : undefined,
      },
    });
    return orderRecord(created);
  },

  async getOrder(id: string) {
    const order = await prisma.order.findUnique({ where: { id } });
    return order ? orderRecord(order) : null;
  },

  async getOrderBySession(sessionId: string) {
    const order = await prisma.order.findUnique({ where: { stripeSessionId: sessionId } });
    return order ? orderRecord(order) : null;
  },

  async markOrderPaid(id: string, stripePaymentIntentId: string | null) {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return null;
    if (existing.status === "paid") return orderRecord(existing);
    const updated = await prisma.order.update({
      where: { id },
      data: { status: "paid", paidAt: new Date(), stripePaymentIntentId },
    });
    return orderRecord(updated);
  },

  async attachStripeSession(id: string, stripeSessionId: string) {
    const updated = await prisma.order.update({ where: { id }, data: { stripeSessionId } });
    return orderRecord(updated);
  },

  async markOrderFailed(id: string) {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return null;
    if (existing.status === "paid") return orderRecord(existing);
    const updated = await prisma.order.update({ where: { id }, data: { status: "failed" } });
    return orderRecord(updated);
  },

  async createSimilarityRequest(input): Promise<SimilarityReportInputResult> {
    const created = await prisma.similarityReportRequest.create({
      data: {
        designId: input.designId,
        orderId: input.orderId,
        email: input.email,
        name: input.name,
        stripeSessionId: input.stripeSessionId,
        notes: input.notes,
      },
    });
    return {
      id: created.id,
      designId: created.designId,
      orderId: created.orderId,
      email: created.email,
      name: created.name,
      status: created.status,
      stripeSessionId: created.stripeSessionId,
      notes: created.notes,
      createdAt: created.createdAt.toISOString(),
    };
  },

  async getSimilarityByOrder(orderId: string): Promise<SimilarityRequestRecord | null> {
    const report = await prisma.similarityReportRequest.findUnique({ where: { orderId } });
    if (!report) return null;
    return {
      id: report.id,
      designId: report.designId,
      orderId: report.orderId,
      email: report.email,
      name: report.name,
      status: report.status,
      stripeSessionId: report.stripeSessionId,
      notes: report.notes,
      createdAt: report.createdAt.toISOString(),
    };
  },

  async createLead(input: CreateLeadInput): Promise<LeadRecord> {
    const created = await prisma.forgeLead.create({
      data: {
        type: input.type,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        message: input.message,
        budget: input.budget,
        designId: input.designId,
      },
    });
    return {
      id: created.id,
      type: created.type,
      name: created.name,
      email: created.email,
      phone: created.phone ?? "",
      message: created.message,
      budget: created.budget,
      designId: created.designId,
      status: created.status,
      createdAt: created.createdAt.toISOString(),
    };
  },

  async listOrders(limit = 60) {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: limit });
    return orders.map(orderRecord);
  },

  async listLeads(limit = 60): Promise<LeadRecord[]> {
    const leads = await prisma.forgeLead.findMany({ orderBy: { createdAt: "desc" }, take: limit });
    return leads.map((lead) => ({
      id: lead.id,
      type: lead.type,
      name: lead.name,
      email: lead.email,
      phone: lead.phone ?? "",
      message: lead.message,
      budget: lead.budget,
      designId: lead.designId,
      status: lead.status,
      createdAt: lead.createdAt.toISOString(),
    }));
  },

  async listSimilarityRequests(limit = 60): Promise<SimilarityRequestRecord[]> {
    const reports = await prisma.similarityReportRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return reports.map((report) => ({
      id: report.id,
      designId: report.designId,
      orderId: report.orderId,
      email: report.email,
      name: report.name,
      status: report.status,
      stripeSessionId: report.stripeSessionId,
      notes: report.notes,
      createdAt: report.createdAt.toISOString(),
    }));
  },

  async updateSimilarityStatus(id, status) {
    const existing = await prisma.similarityReportRequest.findUnique({ where: { id } });
    if (!existing) return null;
    const updated = await prisma.similarityReportRequest.update({ where: { id }, data: { status } });
    return {
      id: updated.id,
      designId: updated.designId,
      orderId: updated.orderId,
      email: updated.email,
      name: updated.name,
      status: updated.status,
      stripeSessionId: updated.stripeSessionId,
      notes: updated.notes,
      createdAt: updated.createdAt.toISOString(),
    };
  },
};

type SimilarityReportInputResult = SimilarityRequestRecord;
