import { prisma } from "@/lib/prisma";

export async function getSiteData() {
  const [settings, milestones, gallery, memoryDolls, letter] =
    await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: "default" } }),
      prisma.milestone.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.galleryItem.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.memoryDoll.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.letter.findUnique({ where: { id: "default" } }),
    ]);

  return { settings, milestones, gallery, memoryDolls, letter };
}

export async function getSecretContent() {
  return prisma.secretContent.findUnique({ where: { id: "default" } });
}
