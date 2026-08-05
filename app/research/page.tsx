import { Topbar } from "@/components/layout/Topbar";
import { PageGrid } from "@/components/layout/PageGrid";
import { VerticalCard } from "@/components/research/VerticalCard";
import { getVerticals } from "@/lib/actions/research";

export default async function ResearchPage() {
  const verticals = await getVerticals();

  return (
    <>
      <Topbar title="Vertical Research" />
      <PageGrid>
        <p className="col-span-12 text-text-secondary text-sm max-w-2xl">
          Your market intelligence library. One page per vertical — pain
          points, regulatory shifts, buyer profiles. Prep here before every
          outreach batch.
        </p>
        {verticals.map((v) => (
          <div key={v.id} className="col-span-12 md:col-span-6 xl:col-span-4">
            <VerticalCard vertical={v} />
          </div>
        ))}
        {verticals.length === 0 && (
          <p className="col-span-12 text-text-tertiary text-sm">
            No verticals yet.
          </p>
        )}
      </PageGrid>
    </>
  );
}
