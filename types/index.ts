import type {
  Company,
  Contact,
  Interaction,
  Deal,
  VerticalResearch,
  Project,
} from "@/lib/generated/prisma/models";

export type {
  Company,
  Contact,
  Interaction,
  Deal,
  VerticalResearch,
  Project,
};

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
