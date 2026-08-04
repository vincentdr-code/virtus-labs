import { Topbar } from "@/components/layout/Topbar";
import { PipelineTable } from "@/components/pipeline/PipelineTable";
import { getCompanies } from "@/lib/actions/companies";

export default async function PipelinePage() {
  const companies = await getCompanies();

  return (
    <>
      <Topbar
        title="Pipeline"
        action={{ label: "+ Add Company", href: "/companies/new" }}
      />
      <div className="p-6">
        <div className="bg-bg-secondary border border-c-border rounded-lg overflow-hidden">
          <PipelineTable companies={companies} />
        </div>
      </div>
    </>
  );
}
