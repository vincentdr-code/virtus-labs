import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import "dotenv/config";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const filename = url.replace(/^file:/, "");
const adapter = new PrismaBetterSqlite3({ url: filename });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.verticalResearch.createMany({
    data: [
      {
        verticalName: "Medical Device Manufacturing",
        slug: "medical-device-manufacturing",
        keyPainPoints: JSON.stringify([
          "Manual paper-based QC records not meeting FDA 21 CFR Part 11",
          "SPD reprocessing tracked in spreadsheets with no audit trail",
          "Lot traceability gaps causing recall risk",
          "Siloed ERP, MES, and QMS systems with no integration",
        ]),
        recentDevelopments:
          "FDA increasing scrutiny on Class II device manufacturers for electronic recordkeeping. EU MDR enforcement creating traceability pressure on OEM suppliers.",
        targetBuyerProfile:
          "VP Quality, Director of Operations, or QA Manager at a 50–500 employee medical device OEM or contract manufacturer",
        marketSize: "~8,500 medical device manufacturers in the US, majority SMB",
      },
      {
        verticalName: "MEP / AEC",
        slug: "mep-aec",
        keyPainPoints: JSON.stringify([
          "Project management spread across email, Bluebeam, and manual RFI logs",
          "No single source of truth for field punch lists",
          "Change order tracking done in spreadsheets",
          "Subcontractor coordination still by phone and paper",
        ]),
        recentDevelopments:
          "Infrastructure bill driving a surge in large MEP projects. BIM adoption mandates on public projects creating integration pressure.",
        targetBuyerProfile:
          "Operations Manager or Project Executive at a regional MEP contractor with 3–15 concurrent projects",
        marketSize: "~30,000 specialty mechanical/electrical contractors in the US",
      },
      {
        verticalName: "Food & Beverage Manufacturing",
        slug: "food-beverage-manufacturing",
        keyPainPoints: JSON.stringify([
          "HACCP and SQF audit prep done manually each year",
          "Batch records on paper — no digital lot traceability",
          "Production scheduling still done in Excel",
          "Supplier COA tracking fragmented across email inboxes",
        ]),
        recentDevelopments:
          "FSMA Rule 204 (food traceability) enforcement began 2026, creating urgent digitization pressure for cold chain and produce handlers.",
        targetBuyerProfile:
          "Plant Manager or Quality Director at a 100–500 employee co-packer or regional food brand",
        marketSize: "~30,000 food manufacturers in the US, heavily SMB",
      },
    ],
  });

  const acme = await prisma.company.create({
    data: {
      name: "Acme Medical Devices",
      vertical: "Medical Device Manufacturing",
      subVertical: "SPD / Reprocessing",
      size: "50-200",
      location: "Philadelphia, PA",
      archaicSignalNotes:
        "Hiring a 'QC Documentation Specialist' — paper-based QC records. Job posting still up on Indeed as of 2026-07-15.",
      source: "job posting",
      website: "https://acmemedical.example.com",
      status: "MEETING_HELD",
    },
  });

  const pinnacle = await prisma.company.create({
    data: {
      name: "Pinnacle MEP Group",
      vertical: "MEP / AEC",
      subVertical: "Mechanical Contracting",
      size: "200-500",
      location: "Chicago, IL",
      archaicSignalNotes:
        "Their LinkedIn posts show project managers printing out PDF drawings on job sites. No mention of any field software in 3 years of posts.",
      source: "cold research",
      status: "CONTACTED",
    },
  });

  await prisma.company.create({
    data: {
      name: "Summit Foods Co-Pack",
      vertical: "Food & Beverage Manufacturing",
      subVertical: "Co-packing / Contract Manufacturing",
      size: "100-200",
      location: "Columbus, OH",
      archaicSignalNotes:
        "FSMA 204 compliance deadline passed; their website still says 'manual traceability processes under review.' They're late.",
      source: "cold research",
      status: "RESEARCHING",
    },
  });

  const acmeContact = await prisma.contact.create({
    data: {
      companyId: acme.id,
      name: "Sarah Chen",
      title: "VP Quality",
      email: "schen@acmemedical.example.com",
      linkedinUrl: "https://linkedin.com/in/sarah-chen-vp-quality",
      isDecisionMaker: true,
      notes: "Met at MedTech conference 2025. Warm — asked for a follow-up.",
    },
  });

  await prisma.contact.create({
    data: {
      companyId: pinnacle.id,
      name: "Marcus Williams",
      title: "Director of Operations",
      email: "mwilliams@pinnaclemep.example.com",
      isDecisionMaker: true,
    },
  });

  await prisma.interaction.createMany({
    data: [
      {
        companyId: acme.id,
        contactId: acmeContact.id,
        type: "MEETING",
        date: new Date("2026-07-20"),
        notes:
          "45-min discovery call. They have 3 QC techs drowning in paper. FDA audit coming Q4.",
        insightDelivered:
          "Showed them FDA 21 CFR Part 11 electronic records gap — they weren't aware their current paper process doesn't meet it for Class II devices.",
        outcome: "Sarah asked for a scoping proposal. Strong interest.",
      },
      {
        companyId: acme.id,
        contactId: acmeContact.id,
        type: "EMAIL",
        date: new Date("2026-07-22"),
        notes: "Sent scoping proposal draft for QC workflow digitization.",
        outcome: "Awaiting response",
      },
    ],
  });

  await prisma.deal.create({
    data: {
      companyId: acme.id,
      serviceType: "QC Workflow Digitization — Custom Build",
      valueEstimate: 45000,
      stage: "PROPOSAL_SENT",
      expectedCloseDate: new Date("2026-09-01"),
    },
  });

  await prisma.project.create({
    data: {
      companyName: "Internal",
      name: "Convenientia Ops Dashboard",
      description: "This internal ops tool — pipeline, research, meeting prep.",
      status: "ACTIVE",
      startDate: new Date("2026-08-01"),
      techStack: "Next.js, TypeScript, Prisma, SQLite, Tailwind",
    },
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
