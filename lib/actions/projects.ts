"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ProjectStatus } from "@/lib/generated/prisma/enums";

export async function getProjects() {
  return prisma.project.findMany({ orderBy: { updatedAt: "desc" } });
}

export async function createProject(data: {
  companyName: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  value?: number;
  techStack?: string;
  notes?: string;
}) {
  const project = await prisma.project.create({ data });
  revalidatePath("/projects");
  return project;
}
