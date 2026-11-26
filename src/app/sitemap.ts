import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const now = new Date();

  const routes: Array<{ path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }> = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/forjar", priority: 0.9, changeFrequency: "weekly" },
    { path: "/disenar-hierro-ganadero", priority: 0.8, changeFrequency: "monthly" },
    { path: "/marca-personal-novilleros", priority: 0.8, changeFrequency: "monthly" },
    { path: "/hierro-yeguada-pre", priority: 0.8, changeFrequency: "monthly" },
    { path: "/encargar-hierro-forjado", priority: 0.8, changeFrequency: "monthly" },
    { path: "/aviso-legal", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacidad", priority: 0.3, changeFrequency: "yearly" },
    { path: "/alcance-registral", priority: 0.4, changeFrequency: "yearly" },
  ];

  return routes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
