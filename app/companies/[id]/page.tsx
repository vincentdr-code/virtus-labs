import { Topbar } from "@/components/layout/Topbar";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <Topbar title="Company Detail" />
      <div className="p-6 text-text-secondary">
        Detail for {id} — coming in Task 9
      </div>
    </>
  );
}
