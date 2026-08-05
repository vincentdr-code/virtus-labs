import { Topbar } from "@/components/layout/Topbar";
import { PageGrid } from "@/components/layout/PageGrid";
import { PipelineTable } from "@/components/pipeline/PipelineTable";
import { getCompanies } from "@/lib/actions/companies";

// Render on demand so the dashboard always shows live data,
// not values frozen at build time.
export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const companies = await getCompanies();

  return (
    <>
      <Topbar
        title="Pipeline"
        action={{ label: "+ Add Company", href: "/companies/new" }}
      />
      <PageGrid>
        <div className="col-span-12 bg-bg-secondary/60 border border-c-border/60 rounded-2xl overflow-x-auto">
          <PipelineTable companies={companies} />
        </div>
      </PageGrid>
    </>
  );
}
