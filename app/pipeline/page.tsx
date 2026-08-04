import { Topbar } from "@/components/layout/Topbar";

export default function PipelinePage() {
  return (
    <>
      <Topbar
        title="Pipeline"
        action={{ label: "+ Add Company", href: "/companies/new" }}
      />
      <div className="p-6 text-text-secondary">Pipeline — coming in Task 8</div>
    </>
  );
}
