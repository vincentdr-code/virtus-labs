"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { InteractionType } from "@/lib/generated/prisma/enums";

export async function createInteraction(data: {
  companyId: string;
  contactId?: string;
  type: InteractionType;
  date: Date;
  notes?: string;
  insightDelivered?: string;
  outcome?: string;
}) {
  const interaction = await prisma.interaction.create({ data });
  revalidatePath(`/companies/${data.companyId}`);
  revalidatePath("/");
  return interaction;
}

export async function getRecentInteractions(limit = 10) {
  return prisma.interaction.findMany({
    take: limit,
    orderBy: { date: "desc" },
    include: { company: true, contact: true },
  });
}

export async function getInsightsDeliveredThisMonth() {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return prisma.interaction.count({
    where: {
      insightDelivered: { not: null },
      date: { gte: start },
    },
  });
}
