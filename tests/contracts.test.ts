import { describe, expect, it } from "vitest";
import {
  brandBlueprintSchema,
  generateResponseSchema,
  leadRequestSchema,
  userProfileSchema,
} from "@/types/forge";

const validProfile = {
  profile: "ganaderia",
  firstName: "Joaquín",
  lastName1: "García",
  lastName2: "",
  origin: "",
  character: "sobrio",
  remate: "cruz",
};

describe("contratos de perfil", () => {
  it("acepta un perfil válido y normaliza opcionales vacíos", () => {
    const parsed = userProfileSchema.parse(validProfile);
    expect(parsed.lastName2).toBe("");
    expect(parsed.origin).toBe("");
  });

  it("recorta espacios y acepta apóstrofes y guiones", () => {
    const parsed = userProfileSchema.parse({
      ...validProfile,
      firstName: "  José-María ",
      lastName1: "O'Connor",
    });
    expect(parsed.firstName).toBe("José-María");
    expect(parsed.lastName1).toBe("O'Connor");
  });

  it("rechaza dígitos y símbolos en el nombre", () => {
    expect(userProfileSchema.safeParse({ ...validProfile, firstName: "Juan2" }).success).toBe(false);
    expect(userProfileSchema.safeParse({ ...validProfile, lastName1: "García#" }).success).toBe(false);
  });

  it("rechaza nombres demasiado cortos o largos", () => {
    expect(userProfileSchema.safeParse({ ...validProfile, firstName: "J" }).success).toBe(false);
    expect(userProfileSchema.safeParse({ ...validProfile, firstName: "a".repeat(41) }).success).toBe(false);
  });

  it("rechaza perfiles desconocidos y caracteres no previstos", () => {
    expect(userProfileSchema.safeParse({ ...validProfile, profile: "empresa" }).success).toBe(false);
    expect(userProfileSchema.safeParse({ ...validProfile, character: "elegante" }).success).toBe(false);
    expect(userProfileSchema.safeParse({ ...validProfile, remate: "pluma" }).success).toBe(false);
  });
});

describe("contrato de BrandBlueprint", () => {
  const blueprint = {
    combo: "JG",
    style: "tradicional",
    fontFamily: "cinzel",
    layout: "stacked",
    frame: "none",
    ornament: "cross",
    strokeWidth: 9,
    rotationDeg: 0,
    lore: "Hierro serif de inspiración histórica para la ganadería familiar.",
  };

  it("acepta un blueprint dentro de rango", () => {
    expect(brandBlueprintSchema.safeParse(blueprint).success).toBe(true);
  });

  it("rechaza grosores y rotaciones fuera de rango", () => {
    expect(brandBlueprintSchema.safeParse({ ...blueprint, strokeWidth: 4 }).success).toBe(false);
    expect(brandBlueprintSchema.safeParse({ ...blueprint, rotationDeg: 22 }).success).toBe(false);
  });

  it("rechaza explicaciones de trazo demasiado cortas", () => {
    expect(brandBlueprintSchema.safeParse({ ...blueprint, lore: "corto" }).success).toBe(false);
  });
});

describe("contrato de respuesta de generación", () => {
  const response = {
    designId: "design_1",
    tier: "free",
    remainingToday: 3,
    proposals: [
      {
        id: "design_1",
        blueprint: {
          combo: "JG",
          style: "tradicional",
          fontFamily: "cinzel",
          layout: "stacked",
          frame: "none",
          ornament: "cross",
          strokeWidth: 9,
          rotationDeg: 0,
          lore: "Hierro serif de inspiración histórica para la ganadería familiar.",
        },
        previewUrl: "/api/preview?d=design_1&v=0&t=hierro",
        scores: { legibility: 90, balance: 90, forgeability: 80 },
        explanation: "Propuesta serif con cruz forjada y lectura inmediata.",
      },
    ],
  };

  it("acepta una respuesta válida sin SVG", () => {
    expect(generateResponseSchema.safeParse(response).success).toBe(true);
  });

  it("rechaza cualquier respuesta que incluya SVG crudo", () => {
    const leaked = { ...response, proposals: [{ ...response.proposals[0], svg: "<svg><path d=\"M0 0\"/></svg>" }] };
    expect(generateResponseSchema.safeParse(leaked).success).toBe(false);
    expect(generateResponseSchema.safeParse({ ...response, svgMaster: "<svg/>" }).success).toBe(false);
  });
});

describe("contrato de leads", () => {
  const lead = {
    type: "revision",
    name: "Joaquín García",
    email: "joaquin@example.com",
    phone: "+34 600 000 000",
    message: "Quiero revisar la viabilidad del hierro antes de forjar.",
    budget: "49-99",
  };

  it("acepta una solicitud completa", () => {
    expect(leadRequestSchema.safeParse(lead).success).toBe(true);
  });

  it("rechaza emails inválidos y mensajes demasiado cortos", () => {
    expect(leadRequestSchema.safeParse({ ...lead, email: "sin-arroba" }).success).toBe(false);
    expect(leadRequestSchema.safeParse({ ...lead, message: "hola" }).success).toBe(false);
  });
});
