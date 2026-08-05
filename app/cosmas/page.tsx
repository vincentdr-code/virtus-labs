import { Microscope } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { PageGrid } from "@/components/layout/PageGrid";
import { EmptyState } from "@/components/ui/empty-state";

export default function CosmasPage() {
  return (
    <>
      <Topbar title="COSMAS Pipeline" />
      <PageGrid>
        <EmptyState
          icon={Microscope}
          title="COSMAS pipeline coming online"
          description="Model performance (mAP50 trendlines across training runs) alongside business stages: Prospect Identified → Demo Scheduled → Pilot → Contract. Live inference feed lands here once the EC2 API is wired up."
        />
      </PageGrid>
    </>
  );
}
