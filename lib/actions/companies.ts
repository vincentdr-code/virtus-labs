"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { CompanyStatus } from "@/lib/generated/prisma/enums";

export async function getCompanies() {
  return prisma.company.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      contacts: true,
      deals: true,
      _count: { select: { interactions: true } },
    },
  });
}

export async function getCompany(id: string) {
  return prisma.company.findUnique({
    where: { id },
    include: {
      contacts: true,
      deals: true,
      interactions: {
        orderBy: { date: "desc" },
        include: { contact: true },
      },
    },
  });
}

export async function createCompany(data: {
  name: string;
  vertical: string;
  subVertical?: string;
  size?: string;
  location?: string;
  website?: string;
  archaicSignalNotes?: string;
  source?: string;
  status?: CompanyStatus;
}) {
  const company = await prisma.company.create({ data });
  revalidatePath("/companies");
  revalidatePath("/pipeline");
  revalidatePath("/");
  return company;
}

export async function updateCompany(
  id: string,
  data: Partial<{
    name: string;
    vertical: string;
    subVertical: string;
    size: string;
    location: string;
    website: string;
    archaicSignalNotes: string;
    source: string;
    status: CompanyStatus;
  }>,
) {
  const company = await prisma.company.update({ where: { id }, data });
  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
  revalidatePath("/pipeline");
  return company;
}

export async function deleteCompany(id: string) {
  await prisma.company.delete({ where: { id } });
  revalidatePath("/companies");
  revalidatePath("/pipeline");
}

export async function getPipelineStats() {
  const [companies, deals] = await Promise.all([
    prisma.company.findMany({ select: { status: true } }),
    prisma.deal.findMany({ select: { valueEstimate: true, stage: true } }),
  ]);

  const activeProspects = companies.filter(
    (c) => !["WON", "LOST", "DORMANT"].includes(c.status),
  ).length;

  const pipelineValue = deals
    .filter((d) => !["WON", "LOST"].includes(d.stage))
    .reduce((sum, d) => sum + (d.valueEstimate ?? 0), 0);

  return {
    activeProspects,
    pipelineValue,
    totalCompanies: companies.length,
  };
}
