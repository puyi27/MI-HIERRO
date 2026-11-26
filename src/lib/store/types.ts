import type { BrandBlueprint, DesignScores, ProfileType } from "@/types/forge";

export type ProductKey = "premium" | "similarity";
export type OrderStatusKey = "pending" | "paid" | "failed" | "refunded";
export type LeadTypeKey = "revision" | "forja";

export interface DesignRecord {
  id: string;
  profile: ProfileType;
  firstName: string;
  lastName1: string;
  lastName2: string;
  origin: string;
  character: string;
  remate: string;
  initials: string;
  style: string;
  blueprint: BrandBlueprint;
  svgMaster: string;
  previewKey: string | null;
  scores: DesignScores;
  lore: string;
  createdAt: string;
}

export interface CreateDesignInput {
  profile: ProfileType;
  firstName: string;
  lastName1: string;
  lastName2: string;
  origin: string;
  character: string;
  remate: string;
  initials: string;
  style: string;
  blueprint: BrandBlueprint;
  svgMaster: string;
  scores: DesignScores;
  lore: string;
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
}
