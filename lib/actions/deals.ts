"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { DealStage } from "@/lib/generated/prisma/enums";

export async function getDeals() {
  return prisma.deal.findMany({
    include: { company: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createDeal(data: {
  companyId: string;
  serviceType: string;
  valueEstimate?: number;
  stage?: DealStage;
  expectedCloseDate?: Date;
  notes?: string;
}) {
  const deal = await prisma.deal.create({ data });
  revalidatePath("/deals");
  revalidatePath(`/companies/${data.companyId}`);
  return deal;
}

export async function updateDeal(
  id: string,
  data: Partial<{
    serviceType: string;
    valueEstimate: number;
    stage: DealStage;
    expectedCloseDate: Date;
    notes: string;
  }>,
) {
  const deal = await prisma.deal.update({ where: { id }, data });
  revalidatePath("/deals");
  return deal;
}

export async function getDealsByStage() {
  const deals = await prisma.deal.findMany({
    where: { stage: { notIn: ["WON", "LOST"] } },
    select: { stage: true, valueEstimate: true },
  });

  const map = new Map<string, number>();
  for (const d of deals) {
    map.set(d.stage, (map.get(d.stage) ?? 0) + (d.valueEstimate ?? 0));
  }
  return Array.from(map.entries()).map(([stage, value]) => ({ stage, value }));
}
