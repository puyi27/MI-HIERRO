import type { BrandBlueprint, DesignScores, ProfileType } from "@/types/forge";

export type ProductKey = "premium" | "similarity";
export const ACTIVE_PACKS = ["FREE", "PACK_999", "PACK_1990", "FORJA"] as const;
export type ActivePack = (typeof ACTIVE_PACKS)[number];
export type OrderStatusKey = "pending" | "paid" | "failed" | "refunded";
export type LeadTypeKey = "revision" | "forja";
export type ReportStatusKey = "pending" | "in_progress" | "delivered";

export interface DesignRecord {
  id: string;
  profile: ProfileType;
  firstName: string;
  lastName1: string;
  lastName2: string;
  nickname: string;
  origin: string;
  character: string;
  remate: string;
  initials: string;
  style: string;
  blueprint: BrandBlueprint;
  svgMaster: string;
  rasterPng: string | null;
  generationKey: string | null;
  previewKey: string | null;
  scores: DesignScores;
  lore: string;
  userId?: string | null;
  createdAt: string;
}

export interface CreateDesignInput {
  profile: ProfileType;
  firstName: string;
  lastName1: string;
  lastName2: string;
  nickname: string;
  origin: string;
  character: string;
  remate: string;
  initials: string;
  style: string;
  blueprint: BrandBlueprint;
  svgMaster: string;
  scores: DesignScores;
  lore: string;
  rasterPng?: string | null;
  generationKey?: string | null;
  userId?: string | null;
}

export interface ForgeUserRecord {
  id: string;
  sessionToken: string;
  email: string | null;
  name: string | null;
  activePack: ActivePack;
  creditsLimit: number;
  creditsUsed: number;
  unlimited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateForgeUserInput {
  sessionToken: string;
  email?: string | null;
  name?: string | null;
  activePack?: ActivePack;
  creditsLimit?: number;
  creditsUsed?: number;
  unlimited?: boolean;
}

export interface UpdateForgeUserInput {
  email?: string | null;
  name?: string | null;
  activePack?: ActivePack;
  creditsLimit?: number;
  creditsUsed?: number;
  unlimited?: boolean;
}

export interface OrderRecord {
  id: string;
  designId: string | null;
  product: ProductKey;
  amountCents: number;
  currency: string;
  status: OrderStatusKey;
  email: string | null;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  downloadTokenId: string | null;
  paidAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface CreateOrderInput {
  designId: string | null;
  product: ProductKey;
  amountCents: number;
  email: string | null;
  stripeSessionId?: string | null;
  downloadTokenId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface SimilarityRequestRecord {
  id: string;
  designId: string | null;
  orderId: string | null;
  email: string;
  name: string | null;
  status: string;
  stripeSessionId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface LeadRecord {
  id: string;
  type: LeadTypeKey;
  name: string;
  email: string;
  phone: string;
  message: string;
  budget: string | null;
  designId: string | null;
  status: string;
  createdAt: string;
}

export interface CreateLeadInput {
  type: LeadTypeKey;
  name: string;
  email: string;
  phone: string;
  message: string;
  budget: string | null;
  designId: string | null;
}

export interface ForgeStore {
  createDesign(input: CreateDesignInput): Promise<DesignRecord>;
  getDesign(id: string): Promise<DesignRecord | null>;
  findGeneration(key: string): Promise<DesignRecord[]>;
  createOrder(input: CreateOrderInput): Promise<OrderRecord>;
  getOrder(id: string): Promise<OrderRecord | null>;
  getOrderBySession(sessionId: string): Promise<OrderRecord | null>;
  markOrderPaid(id: string, stripePaymentIntentId: string | null): Promise<OrderRecord | null>;
  markOrderFailed(id: string): Promise<OrderRecord | null>;
  attachStripeSession(id: string, stripeSessionId: string): Promise<OrderRecord | null>;
  createSimilarityRequest(input: {
    designId: string | null;
    orderId: string | null;
    email: string;
    name: string | null;
    stripeSessionId: string | null;
    notes: string | null;
  }): Promise<SimilarityRequestRecord>;
  getSimilarityByOrder(orderId: string): Promise<SimilarityRequestRecord | null>;
  createLead(input: CreateLeadInput): Promise<LeadRecord>;
  listOrders(limit?: number): Promise<OrderRecord[]>;
  listLeads(limit?: number): Promise<LeadRecord[]>;
  listSimilarityRequests(limit?: number): Promise<SimilarityRequestRecord[]>;
  updateSimilarityStatus(id: string, status: ReportStatusKey): Promise<SimilarityRequestRecord | null>;
  createForgeUser(input: CreateForgeUserInput): Promise<ForgeUserRecord>;
  getForgeUser(id: string): Promise<ForgeUserRecord | null>;
  getForgeUserByToken(sessionToken: string): Promise<ForgeUserRecord | null>;
  updateForgeUser(id: string, patch: UpdateForgeUserInput): Promise<ForgeUserRecord | null>;
  consumeForgeCredit(id: string): Promise<ForgeUserRecord | null>;
  listForgeUsers(limit?: number): Promise<ForgeUserRecord[]>;
  listDesignsForUser(userId: string, limit?: number): Promise<DesignRecord[]>;
}
