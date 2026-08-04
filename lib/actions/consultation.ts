"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getConsultationSessions() {
  return prisma.consultationSession.findMany({
    orderBy: { createdAt: "desc" },
    include: { company: { select: { name: true } } },
  });
}

export async function getConsultationSession(id: string) {
  return prisma.consultationSession.findUnique({
    where: { id },
    include: { company: true },
  });
}

export async function createConsultationSession(data: {
  title: string;
  companyId?: string;
  clientName?: string;
}) {
  const session = await prisma.consultationSession.create({ data });
  revalidatePath("/consultation");
  return session;
}

export async function updateConsultationSession(
  id: string,
  data: {
    transcript?: string;
    insights?: string;
    prototypeHtml?: string;
    status?: string;
  }
) {
  return prisma.consultationSession.update({ where: { id }, data });
}
