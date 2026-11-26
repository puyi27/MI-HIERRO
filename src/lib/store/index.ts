import type { ForgeStore } from "@/lib/store/types";
import { fileStore } from "@/lib/store/file-store";

let prismaStorePromise: Promise<ForgeStore> | null = null;

async function loadPrismaStore(): Promise<ForgeStore> {
  if (!prismaStorePromise) {
    prismaStorePromise = import("@/lib/store/prisma-store").then((module) => module.prismaStore);
  }
  return prismaStorePromise;
}

export async function getStore(): Promise<ForgeStore> {
  if (process.env.DATABASE_URL) {
    return loadPrismaStore();
  }
  return fileStore;
}

export function usesDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
