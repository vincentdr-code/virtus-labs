import { Topbar } from "@/components/layout/Topbar";

export default function CompaniesPage() {
  return (
    <>
      <Topbar
        title="Companies"
        action={{ label: "+ Add Company", href: "/companies/new" }}
      />
      <div className="p-6 text-text-secondary">Companies list — coming in Task 8</div>
    </>
  );
}
