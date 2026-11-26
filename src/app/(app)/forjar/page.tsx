import type { Metadata } from "next";
import { PROFILE_TYPES, type ProfileType } from "@/types/forge";
import { ForgeWizard } from "@/components/forge/ForgeWizard";

export const metadata: Metadata = {
  title: "Forjar mi hierro",
  description:
    "Diseña tu hierro ganadero en cinco pasos: perfil, iniciales, estilo, visor realista y entrega. Tres propuestas gratuitas con marca de agua.",
  alternates: { canonical: "/forjar" },
};

function resolveProfile(value: string | undefined): ProfileType {
  if (value && (PROFILE_TYPES as readonly string[]).includes(value)) {
    return value as ProfileType;
  }
  return "ganaderia";
}

export default async function ForjarPage({
  searchParams,
}: {
  searchParams: Promise<{ perfil?: string; cancelado?: string }>;
}) {
  const params = await searchParams;
  return <ForgeWizard initialProfile={resolveProfile(params.perfil)} canceled={params.cancelado === "1"} />;
}
