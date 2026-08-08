import { prisma } from "@/lib/prisma";

let serverCache = null;

export async function getServerSiteTexts() {
  if (serverCache) return serverCache;
  
  try {
    const texts = await prisma.siteText.findMany({
      where: { isActive: true },
      select: { key: true, valueAz: true, valueEn: true, valueRu: true },
    });
    
    const map = {};
    for (const t of texts) {
      map[t.key] = {
        az: t.valueAz,
        en: t.valueEn || t.valueAz,
        ru: t.valueRu || t.valueAz,
      };
    }
    serverCache = map;
    return map;
  } catch {
    return {};
  }
}

export function makeT(texts) {
  return (key, fallback = "") => {
    if (!texts[key]) return fallback;
    return texts[key].az || fallback;
  };
}
