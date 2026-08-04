import { Topbar } from "@/components/layout/Topbar";
import { PipelineTable } from "@/components/pipeline/PipelineTable";
import { getCompanies } from "@/lib/actions/companies";

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <>
      <Topbar
        title="Companies"
        action={{ label: "+ Add Company", href: "/companies/new" }}
      />
      <div className="p-10">
        <div className="bg-bg-secondary/60 border border-c-border/60 rounded-2xl overflow-hidden">
          <PipelineTable companies={companies} />
        </div>
      </div>
    </>
  );
}
