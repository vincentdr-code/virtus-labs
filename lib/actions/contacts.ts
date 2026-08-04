"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getContacts(companyId?: string) {
  return prisma.contact.findMany({
    where: companyId ? { companyId } : undefined,
    include: { company: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createContact(data: {
  companyId: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  isDecisionMaker?: boolean;
  notes?: string;
}) {
  const contact = await prisma.contact.create({ data });
  revalidatePath(`/companies/${data.companyId}`);
  revalidatePath("/contacts");
  return contact;
}

export async function updateContact(
  id: string,
  companyId: string,
  data: Partial<{
    name: string;
    title: string;
    email: string;
    phone: string;
    linkedinUrl: string;
    isDecisionMaker: boolean;
    notes: string;
  }>,
) {
  const contact = await prisma.contact.update({ where: { id }, data });
  revalidatePath(`/companies/${companyId}`);
  revalidatePath("/contacts");
  return contact;
}

export async function deleteContact(id: string, companyId: string) {
  await prisma.contact.delete({ where: { id } });
  revalidatePath(`/companies/${companyId}`);
  revalidatePath("/contacts");
}
