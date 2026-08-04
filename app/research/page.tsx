import { Topbar } from "@/components/layout/Topbar";
import { VerticalCard } from "@/components/research/VerticalCard";
import { getVerticals } from "@/lib/actions/research";

export default async function ResearchPage() {
  const verticals = await getVerticals();

  return (
    <>
      <Topbar title="Vertical Research" />
      <div className="p-6 max-w-4xl">
        <p className="text-text-secondary text-sm mb-6 max-w-2xl">
          Your market intelligence library. One page per vertical — pain
          points, regulatory shifts, buyer profiles. Prep here before every
          outreach batch.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {verticals.map((v) => (
            <VerticalCard key={v.id} vertical={v} />
          ))}
          {verticals.length === 0 && (
            <p className="text-text-tertiary text-sm col-span-2">
              No verticals yet.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
