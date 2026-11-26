import type { ForgeStore } from "@/lib/store/types";
import { fileStore } from "@/lib/store/file-store";
import { isServerlessRuntime } from "@/lib/runtime";

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
  if (isServerlessRuntime()) {
    throw new Error(
      "DATABASE_URL es obligatorio en Vercel: el almacén de fichero local no persiste en serverless. Configura Neon o Postgres.",
    );
  }
  return fileStore;
}

export function usesDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
