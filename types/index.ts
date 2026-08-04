import type { CompanyModel } from "@/lib/generated/prisma/models/Company";
import type { ContactModel } from "@/lib/generated/prisma/models/Contact";
import type { InteractionModel } from "@/lib/generated/prisma/models/Interaction";
import type { DealModel } from "@/lib/generated/prisma/models/Deal";
import type { VerticalResearchModel } from "@/lib/generated/prisma/models/VerticalResearch";
import type { ProjectModel } from "@/lib/generated/prisma/models/Project";

export type Company = CompanyModel;
export type Contact = ContactModel;
export type Interaction = InteractionModel;
export type Deal = DealModel;
export type VerticalResearch = VerticalResearchModel;
export type Project = ProjectModel;

export type CompanyWithRelations = Company & {
  contacts: Contact[];
  interactions: Interaction[];
  deals: Deal[];
};

export type ContactWithCompany = Contact & {
  company: Company;
};

export type InteractionWithContact = Interaction & {
  contact: Contact | null;
};
