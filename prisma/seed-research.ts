import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import "dotenv/config";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const filename = url.replace(/^file:/, "");
const adapter = new PrismaBetterSqlite3({ url: filename });
const prisma = new PrismaClient({ adapter });

/**
 * Baseline research content for the seven trades, each carrying a per-metro
 * breakdown for Austin, Northern Virginia, and Miami.
 *
 * This is a starting position, not a source of truth — figures and code cycles
 * move, and the weekly scan is what keeps the library current. Anything with a
 * hard number is stated as of the date below so it is obvious when it is stale.
 */

const AS_OF = "August 2026";

interface MetroIntel {
  demandDrivers: string[];
  regulatory: string[];
  whoToCall: string;
}

interface TradeSeed {
  slug: string;
  name: string;
  painPoints: string[];
  recentDevelopments: string;
  buyerProfile: string;
  marketSize: string;
  metros: Record<"austin" | "nova" | "miami", MetroIntel>;
}

const TRADE_RESEARCH: TradeSeed[] = [
  {
    slug: "mechanical",
    name: "Mechanical",
    painPoints: [
      "Service tickets still on paper or in a shared spreadsheet, with no searchable equipment history per site",
      "No CMMS — preventive maintenance schedules live in a tech's head or a wall calendar",
      "Load calculations and equipment selection done by hand or in an inherited Excel workbook nobody wants to touch",
      "Fabrication shop and field crews work off different revisions of the same drawing set",
      "Warranty and commissioning documentation scattered across email, so closeout takes weeks",
    ],
    recentDevelopments:
      "Private-equity roll-ups are actively consolidating mid-size mechanical contractors, which is pulling formerly family-run shops into platforms that expect real reporting and integrated systems. Prefabrication and modular assembly continue to spread, raising the value of accurate BIM coordination upstream of the shop floor.",
    buyerProfile:
      "Owner, VP of Operations, or Service Manager at a 30-300 person mechanical contractor doing commercial and institutional work. The tell is a firm that has grown past what its office manager can track manually but has not yet bought a full ERP.",
    marketSize:
      "Mechanical contracting is a large, highly fragmented segment nationally, dominated by privately held firms under 200 employees — which is exactly the band that buys custom software rather than enterprise platforms.",
    metros: {
      austin: {
        demandDrivers: [
          "Semiconductor fab and data center construction demands process piping and industrial-grade mechanical work well beyond typical commercial scope",
          "Sustained commercial build-out from corporate relocations keeps the chiller-plant and central-plant pipeline full",
          "Extreme summer heat compresses equipment replacement cycles and pushes service volume into a tight season",
        ],
        regulatory: [
          "Texas has no statewide mechanical licensing in the way many states do — local jurisdiction rules govern, which makes multi-jurisdiction compliance tracking a genuine operational burden",
          "City of Austin Development Services handles permitting; energy code compliance is enforced at the local level",
        ],
        whoToCall:
          "Mechanical contractors serving the Taylor/Georgetown industrial corridor who scaled headcount fast for fab work and are now managing far more service contracts than their systems were built for.",
      },
      nova: {
        demandDrivers: [
          "Data center cooling is the dominant mechanical workload — chilled water plants, CRAC/CRAH systems, and increasingly liquid cooling for high-density AI racks",
          "Federal and institutional facilities require documented maintenance regimes, which raises the cost of paper-based tracking",
          "Retrofit work on aging commercial stock inside the Beltway",
        ],
        regulatory: [
          "Virginia enforces a statewide Uniform Statewide Building Code (USBC), so the code baseline is more consistent than in Texas",
          "Some federal-adjacent work requires personnel with security clearance, which constrains subcontractor selection",
        ],
        whoToCall:
          "Mechanical contractors with data center service contracts in Loudoun and Prince William — the maintenance documentation burden per facility is high and usually under-systematized.",
      },
      miami: {
        demandDrivers: [
          "Condo recertification work is driving mechanical system assessment and replacement across a large aging high-rise stock",
          "Hospitality and mixed-use development sustains central plant work",
          "Salt-air corrosion shortens coastal equipment life, raising replacement frequency relative to inland markets",
        ],
        regulatory: [
          "Florida Building Code is a statewide code with strong local amendment in Miami-Dade and Broward",
          "High-Velocity Hurricane Zone requirements affect rooftop equipment anchoring and louver design in ways that catch out-of-market contractors",
        ],
        whoToCall:
          "Mechanical contractors doing condo and hospitality work who are absorbing recertification-driven assessment volume on top of existing service obligations.",
      },
    },
  },
  {
    slug: "electrical",
    name: "Electrical",
    painPoints: [
      "Panel schedules and as-builts maintained by hand, so the drawing never matches the installation",
      "No dispatch software — the service coordinator runs the day off a whiteboard and a phone",
      "Material takeoffs redone from scratch per bid instead of drawn from a historical cost library",
      "Change orders tracked in email, so disputed scope becomes unbillable",
      "Apprentice hours and certification expiry tracked manually, creating real compliance exposure",
    ],
    recentDevelopments:
      "Grid capacity has become the binding constraint on large projects in several markets, which pushes electrical contractors into longer-horizon planning than they are usually staffed for. NEC 2023 adoption continues to roll out unevenly by state. EV charging and battery storage work keeps expanding the scope of a typical commercial electrical bid.",
    buyerProfile:
      "Owner or Operations Manager at a 25-250 person electrical contractor doing commercial, industrial, or data center work. Strongest fit where service and project work run side by side and no single system covers both.",
    marketSize:
      "Electrical contracting is among the largest specialty trades by revenue and is similarly fragmented, with strong union presence in some metros and almost none in others.",
    metros: {
      austin: {
        demandDrivers: [
          "Fab and data center power infrastructure — medium-voltage distribution, substation-adjacent work, and redundancy design",
          "Rapid commercial and multifamily construction sustains baseline demand",
          "Grid resilience investment following past winter storm failures continues to fund upgrade work",
        ],
        regulatory: [
          "Texas licenses electricians at the state level through TDLR, which makes license tracking more centralized than the mechanical trades",
          "ERCOT's isolated grid means interconnection and resilience questions play out differently than in the Eastern Interconnection markets",
        ],
        whoToCall:
          "Electrical contractors who took on industrial-scale work during the fab build-out and are now running project and service divisions on the same undersized back office.",
      },
      nova: {
        demandDrivers: [
          "Data center electrical work is the defining market — this is the largest concentration of data center capacity anywhere, and it is still growing",
          "Dominion Energy interconnection queue constraints mean power availability, not construction capacity, is often the schedule driver",
          "Federal facility work with clearance requirements commands premium rates",
        ],
        regulatory: [
          "Virginia USBC governs statewide; NEC adoption follows the state code cycle",
          "Utility interconnection process with Dominion is a significant, documented schedule risk on large loads",
        ],
        whoToCall:
          "Electrical contractors serving Data Center Alley — the coordination burden across utility, general contractor, and owner is heavy and frequently managed in spreadsheets.",
      },
      miami: {
        demandDrivers: [
          "Recertification requires electrical system evaluation on buildings at the 30- and 40-year marks, generating steady assessment work",
          "Hurricane hardening and generator/transfer switch installation across residential and commercial stock",
          "Hospitality renovation cycles",
        ],
        regulatory: [
          "Florida licenses electrical contractors at the state level through DBPR",
          "Miami-Dade product approval requirements affect equipment selection in ways that differ from the rest of the state",
        ],
        whoToCall:
          "Electrical contractors doing condo recertification evaluations — the reporting output is document-heavy and usually assembled by hand.",
      },
    },
  },
  {
    slug: "plumbing",
    name: "Plumbing",
    painPoints: [
      "Paper invoicing and hand-written service tickets, with revenue leaking between the truck and the office",
      "Drain camera and inspection footage stored on SD cards or a tech's phone with no link to the job record",
      "No per-property service history, so recurring problems get rediagnosed every visit",
      "Backflow test certifications tracked in a spreadsheet with manual renewal reminders",
      "Estimating done from memory rather than a maintained price book",
    ],
    recentDevelopments:
      "The UPC/IPC code split continues to create genuine compliance complexity for firms operating across state lines. Water reuse and greywater provisions are expanding in drought-affected jurisdictions. Premise plumbing water quality — including Legionella management in large buildings — has become a more prominent compliance topic for institutional facilities.",
    buyerProfile:
      "Owner or Service Manager at a 15-150 person plumbing contractor, especially commercial and multifamily service. Residential-heavy shops are more likely to buy off-the-shelf field service software; commercial shops with unusual workflows are the better custom-software fit.",
    marketSize:
      "Plumbing contracting is highly fragmented with a very large number of small firms; the addressable band for custom software is the commercial and multifamily service segment.",
    metros: {
      austin: {
        demandDrivers: [
          "Multifamily construction volume drives rough-in and fixture work",
          "Drought conditions periodically push water conservation and reuse requirements",
          "Rapid residential growth in surrounding counties sustains service demand",
        ],
        regulatory: [
          "Texas has historically followed a UPC-derived framework with state-level plumbing licensing through TSBPE",
          "Water conservation requirements tighten during drought cycles, which affects fixture and irrigation specification",
        ],
        whoToCall:
          "Commercial plumbing contractors serving multifamily portfolios where per-unit service history matters and is currently untracked.",
      },
      nova: {
        demandDrivers: [
          "Institutional and federal facility plumbing with documented maintenance requirements",
          "Data center support systems — makeup water, condensate, and increasingly water-cooled infrastructure",
          "Dense commercial retrofit market",
        ],
        regulatory: [
          "Virginia USBC incorporates IPC-based plumbing provisions statewide",
          "Backflow prevention testing and reporting requirements are enforced at the local water authority level",
        ],
        whoToCall:
          "Plumbing contractors holding backflow testing contracts across many properties — certification and retest scheduling is a natural first custom-software win.",
      },
      miami: {
        demandDrivers: [
          "Recertification drives plumbing riser and supply line evaluation across aging condo stock",
          "Saltwater intrusion and corrosion shorten system life",
          "High-rise hospitality service demand",
        ],
        regulatory: [
          "Florida Building Code Plumbing volume governs, with Miami-Dade amendments",
          "Florida licenses plumbing contractors at the state level through DBPR",
        ],
        whoToCall:
          "Plumbing contractors handling condo recertification plumbing assessments — high documentation volume, tight statutory deadlines.",
      },
    },
  },
  {
    slug: "hvac",
    name: "HVAC",
    painPoints: [
      "No fleet-level visibility into installed equipment — nobody can answer which sites have units approaching end of life",
      "Manual J/D/S load calculations skipped entirely or done once and never revisited",
      "Maintenance agreements sold but not systematically scheduled, so renewals lapse quietly",
      "Refrigerant tracking and EPA 608 recordkeeping kept on paper",
      "Technician diagnostic notes unstructured, so the same failure mode is never spotted across the fleet",
    ],
    recentDevelopments:
      "The refrigerant transition under the AIM Act is the defining operational change in this trade: the shift away from R-410A toward lower-GWP alternatives such as R-454B affects equipment availability, technician training, cylinder handling, and service inventory all at once. Contractors that cannot see their installed base by refrigerant type are managing this transition blind. Heat pump adoption incentives continue to shift the residential and light commercial mix.",
    buyerProfile:
      "Owner or Service Manager at a 20-200 person commercial HVAC contractor with a maintenance agreement book. The strongest signal is a firm whose recurring revenue depends on contracts it cannot report on accurately.",
    marketSize:
      "HVAC contracting is one of the largest and most PE-targeted segments in the trades, with active roll-up activity concentrating formerly independent shops into regional platforms.",
    metros: {
      austin: {
        demandDrivers: [
          "Extreme and lengthening cooling season drives both replacement volume and emergency service load",
          "Data center and fab cooling requirements at industrial scale",
          "Fast residential growth sustains new construction and early replacement demand",
        ],
        regulatory: [
          "Texas licenses HVAC contractors through TDLR",
          "Energy code compliance enforced locally; Austin has historically pursued more aggressive energy performance requirements than the state baseline",
        ],
        whoToCall:
          "Commercial HVAC contractors with large maintenance agreement books in Travis and Williamson counties who cannot currently segment their installed base by refrigerant type.",
      },
      nova: {
        demandDrivers: [
          "Data center cooling at unmatched density — including the shift toward liquid cooling for AI workloads",
          "Four-season climate means both heating and cooling system work, unlike the other two markets",
          "Federal and institutional facilities with documented maintenance obligations",
        ],
        regulatory: [
          "Virginia USBC governs mechanical provisions statewide",
          "Energy performance requirements on state and federal facilities exceed commercial baseline",
        ],
        whoToCall:
          "HVAC contractors holding data center service contracts — uptime obligations make equipment history and response tracking disproportionately valuable.",
      },
      miami: {
        demandDrivers: [
          "Year-round cooling load with effectively no heating season — equipment runs continuously and fails faster",
          "Salt-air corrosion is a first-order factor in coastal equipment life",
          "Condo recertification surfaces deferred mechanical replacement across large portfolios",
          "Humidity control is a distinct engineering problem here in a way it is not in Austin or NoVA",
        ],
        regulatory: [
          "Florida Building Code Mechanical volume with Miami-Dade amendments",
          "HVHZ requirements affect rooftop unit anchoring and wind-load rating",
          "Florida licenses HVAC contractors through DBPR",
        ],
        whoToCall:
          "HVAC contractors servicing coastal condo portfolios where corrosion-driven replacement cycles are predictable but not currently modeled.",
      },
    },
  },
  {
    slug: "architecture",
    name: "Architecture",
    painPoints: [
      "Drawing sets printed and marked up by hand, then re-entered into the model by someone else",
      "No cloud project management — file versions live on a local server with naming-convention discipline as the only safeguard",
      "Consultant coordination handled entirely over email with no issue tracking",
      "Time and phase budgeting tracked after the fact, so scope creep is discovered at invoicing",
      "Code review and zoning analysis redone manually per project instead of drawn from a jurisdiction library",
    ],
    recentDevelopments:
      "The gap between BIM-fluent practices and 2D holdouts continues to widen, and AI-assisted rendering and early-stage generative design tools are accelerating that divide. Firms that never made the Revit transition are increasingly locked out of larger institutional work where model deliverables are contractually required.",
    buyerProfile:
      "Principal or Director of Operations at a 10-120 person architecture firm. Best fit where the practice has outgrown informal coordination but is too small to justify a dedicated IT function or an enterprise PM platform.",
    marketSize:
      "Architecture practice is dominated by small firms; the majority of US firms have fewer than 20 employees, which puts most of the market squarely in the custom-tooling band rather than the enterprise band.",
    metros: {
      austin: {
        demandDrivers: [
          "Commercial, mixed-use, and multifamily volume from sustained in-migration",
          "Corporate campus and industrial work tied to the tech sector",
          "Adaptive reuse in central Austin",
        ],
        regulatory: [
          "City of Austin land development code and permitting timelines are a recurring practice constraint",
          "NCARB governs licensure; AIA Austin is the local chapter",
        ],
        whoToCall:
          "Mid-size firms doing multifamily and commercial work whose permitting-cycle tracking across jurisdictions is manual.",
      },
      nova: {
        demandDrivers: [
          "Data center architecture — a specialized and high-volume niche in this market",
          "Federal, GSA, and institutional work with heavy documentation requirements",
          "Dense mixed-use and transit-oriented development",
        ],
        regulatory: [
          "Virginia USBC statewide; county-level zoning in Fairfax, Loudoun, and Prince William",
          "Federal work carries security and documentation requirements that exceed private-sector norms",
        ],
        whoToCall:
          "Firms with federal or institutional practice areas where submittal and documentation tracking is contractually mandated and currently manual.",
      },
      miami: {
        demandDrivers: [
          "High-rise residential and hospitality design",
          "Recertification-driven assessment and remediation design work",
          "Resiliency and elevated-design requirements from flood mapping changes",
        ],
        regulatory: [
          "Florida Building Code with HVHZ provisions is among the most demanding wind-load environments in the country",
          "Miami-Dade product approval requirements constrain assembly and component specification",
          "FEMA flood map revisions affect siting and elevation requirements",
        ],
        whoToCall:
          "Firms doing condo recertification assessment work — the deliverable is documentation-heavy and statutory deadlines are firm.",
      },
    },
  },
  {
    slug: "environmental",
    name: "Environmental Engineering",
    painPoints: [
      "Field data captured on paper forms and re-keyed into reports days later, introducing transcription error",
      "No GIS integration — sample locations described in prose rather than mapped",
      "Phase I/II report assembly is largely manual document production per site",
      "Regulatory deadline tracking across multiple agencies handled in a shared calendar",
      "Historical site data siloed by project rather than by parcel, so prior work is hard to reuse",
    ],
    recentDevelopments:
      "PFAS regulation continues to expand and is reshaping site assessment scope and liability analysis. Stormwater permitting enforcement under MS4 programs remains an active compliance driver. Climate resilience and flood risk assessment are increasingly folded into due diligence work that historically only covered contamination.",
    buyerProfile:
      "Principal or Operations Director at a 10-100 person environmental consulting firm doing site assessment, compliance, and permitting support. The fit is strongest where field-to-report turnaround is the bottleneck.",
    marketSize:
      "Environmental consulting spans a small number of large national firms and a long tail of regional specialists; the regional band is where workflow tooling is weakest.",
    metros: {
      austin: {
        demandDrivers: [
          "Rapid greenfield development drives Phase I ESA volume",
          "Edwards Aquifer protection requirements create a genuinely distinctive local regulatory regime",
          "Industrial development brings air permitting and remediation work",
        ],
        regulatory: [
          "TCEQ is the state regulator for water, air, and waste programs",
          "Edwards Aquifer Recharge Zone rules impose site-specific requirements unusual outside central Texas",
        ],
        whoToCall:
          "Consultancies handling Edwards Aquifer protection plans — the review process is specialized and documentation-intensive.",
      },
      nova: {
        demandDrivers: [
          "Chesapeake Bay watershed nutrient and sediment requirements shape stormwater work throughout the region",
          "Data center siting drives wetlands delineation and environmental review",
          "Federal facility environmental compliance",
        ],
        regulatory: [
          "Virginia DEQ administers state programs; Chesapeake Bay Preservation Act adds requirements in designated areas",
          "MS4 stormwater permitting is enforced at the locality level",
        ],
        whoToCall:
          "Firms doing wetlands and stormwater work tied to data center siting — permitting timelines are on the project critical path.",
      },
      miami: {
        demandDrivers: [
          "Sea-level rise and saltwater intrusion assessment",
          "FEMA flood map revisions driving elevation and risk analysis",
          "Everglades-adjacent wetlands work and dense coastal redevelopment",
        ],
        regulatory: [
          "Florida DEP is the state regulator; South Florida Water Management District governs water resources regionally",
          "Miami-Dade has its own environmental resources management requirements layered on state rules",
        ],
        whoToCall:
          "Consultancies handling coastal resiliency and flood risk assessment where multi-agency deadline tracking is manual.",
      },
    },
  },
  {
    slug: "civil",
    name: "Civil Engineering",
    painPoints: [
      "No digital plan review integration with the local jurisdiction — submittals still cycle through PDF and email",
      "Paper redlines rather than drone or LiDAR survey data feeding the model",
      "Utility coordination tracked in spreadsheets across many agencies per project",
      "Quantity takeoffs and earthwork calculations rebuilt per project instead of templated",
      "Permitting status across multiple jurisdictions with no single view of what is blocking what",
    ],
    recentDevelopments:
      "Federal infrastructure funding continues to work through to project delivery, sustaining transportation and utility workloads. Drone and LiDAR survey adoption is now mainstream enough that firms without it are visibly slower. ASCE's periodic Infrastructure Report Card remains a useful state-by-state framing device for business development conversations.",
    buyerProfile:
      "Principal or Project Executive at a 15-150 person civil engineering firm doing land development, site civil, or transportation work. Strongest fit where the firm works across several jurisdictions with different submittal processes.",
    marketSize:
      "Civil engineering services is a large market with a wide size distribution; the regional land development and site civil segment is the most under-tooled.",
    metros: {
      austin: {
        demandDrivers: [
          "Land development volume from sustained regional growth",
          "Industrial site work for fab and data center campuses",
          "Regional transportation and mobility program work",
        ],
        regulatory: [
          "City of Austin land development code review timelines are a well-known project constraint",
          "Surrounding counties have distinct and less predictable review processes than the city",
        ],
        whoToCall:
          "Land development civil firms working across Travis, Williamson, and Hays counties — cross-jurisdiction permitting status is rarely consolidated anywhere.",
      },
      nova: {
        demandDrivers: [
          "Data center site development — grading, stormwater, utility, and access design at scale",
          "Transit-oriented development around Metro corridors",
          "Federal and institutional site work",
        ],
        regulatory: [
          "County-level site plan review in Fairfax, Loudoun, and Prince William, each with its own process",
          "Chesapeake Bay Preservation Act requirements in designated areas",
        ],
        whoToCall:
          "Civil firms with data center site work where utility and county coordination is the schedule driver and is tracked manually.",
      },
      miami: {
        demandDrivers: [
          "Structural assessment demand from the recertification program",
          "Stormwater and drainage design under sea-level rise pressure",
          "Dense urban redevelopment with constrained sites",
        ],
        regulatory: [
          "Florida Building Code with HVHZ structural provisions",
          "Miami-Dade and Broward each maintain distinct permitting processes",
          "Statutory recertification milestones create hard, non-negotiable deadlines",
        ],
        whoToCall:
          "Structural and civil firms absorbing recertification inspection volume — the reporting burden is statutory and the deadlines do not move.",
      },
    },
  },
];

async function main() {
  console.log(`Seeding research library (content as of ${AS_OF})…`);

  for (const trade of TRADE_RESEARCH) {
    const notes = [
      `Baseline research as of ${AS_OF}. Refreshed by the weekly scan — treat figures as starting points, not current truth.`,
      "",
      ...Object.entries(trade.metros).flatMap(([metroKey, intel]) => {
        const label =
          metroKey === "austin"
            ? "AUSTIN, TX"
            : metroKey === "nova"
              ? "NORTHERN VIRGINIA"
              : "MIAMI, FL";
        return [
          `## ${label}`,
          "",
          "Demand drivers:",
          ...intel.demandDrivers.map((d) => `  - ${d}`),
          "",
          "Regulatory context:",
          ...intel.regulatory.map((r) => `  - ${r}`),
          "",
          `Who to call: ${intel.whoToCall}`,
          "",
        ];
      }),
    ].join("\n");

    await prisma.verticalResearch.upsert({
      where: { slug: trade.slug },
      create: {
        verticalName: trade.name,
        slug: trade.slug,
        keyPainPoints: JSON.stringify(trade.painPoints),
        recentDevelopments: trade.recentDevelopments,
        targetBuyerProfile: trade.buyerProfile,
        marketSize: trade.marketSize,
        notes,
        lastUpdated: new Date(),
      },
      update: {
        verticalName: trade.name,
        keyPainPoints: JSON.stringify(trade.painPoints),
        recentDevelopments: trade.recentDevelopments,
        targetBuyerProfile: trade.buyerProfile,
        marketSize: trade.marketSize,
        notes,
        lastUpdated: new Date(),
      },
    });
    console.log(`  ✓ ${trade.name} (3 metro breakdowns)`);
  }

  const count = await prisma.verticalResearch.count();
  console.log(`Done. ${TRADE_RESEARCH.length} trades seeded, ${count} verticals total.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
