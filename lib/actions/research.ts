"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

export async function getVerticals() {
  return prisma.verticalResearch.findMany({
    orderBy: { verticalName: "asc" },
  });
}

export async function getVertical(slug: string) {
  return prisma.verticalResearch.findUnique({ where: { slug } });
}

export async function upsertVertical(data: {
  verticalName: string;
  keyPainPoints?: string[];
  recentDevelopments?: string;
  targetBuyerProfile?: string;
  marketSize?: string;
  notes?: string;
}) {
  const slug = slugify(data.verticalName);
  const vertical = await prisma.verticalResearch.upsert({
    where: { slug },
    create: {
      verticalName: data.verticalName,
      slug,
      keyPainPoints: data.keyPainPoints
        ? JSON.stringify(data.keyPainPoints)
        : null,
      recentDevelopments: data.recentDevelopments,
      targetBuyerProfile: data.targetBuyerProfile,
      marketSize: data.marketSize,
      notes: data.notes,
      lastUpdated: new Date(),
    },
    update: {
      verticalName: data.verticalName,
      keyPainPoints: data.keyPainPoints
        ? JSON.stringify(data.keyPainPoints)
        : null,
      recentDevelopments: data.recentDevelopments,
      targetBuyerProfile: data.targetBuyerProfile,
      marketSize: data.marketSize,
      notes: data.notes,
      lastUpdated: new Date(),
    },
  });
  revalidatePath("/research");
  revalidatePath(`/research/${slug}`);
  return vertical;
}
