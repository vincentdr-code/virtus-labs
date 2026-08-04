import { Topbar } from "@/components/layout/Topbar";

export default async function VerticalPage({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  return (
    <>
      <Topbar title={decodeURIComponent(vertical)} />
      <div className="p-6 text-text-secondary">
        Vertical deep-dive — coming in Task 11
      </div>
    </>
  );
}
