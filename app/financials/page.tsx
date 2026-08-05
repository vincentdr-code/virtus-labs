import { Wallet } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { PageGrid } from "@/components/layout/PageGrid";
import { EmptyState } from "@/components/ui/empty-state";

export default function FinancialsPage() {
  return (
    <>
      <Topbar title="Financials" />
      <PageGrid>
        <EmptyState
          icon={Wallet}
          title="No financials tracked yet"
          description="Burn rate, runway, consulting revenue booked, and COSMAS infrastructure costs (AWS, API usage) will surface here — the financial pulse of the operation."
        />
      </PageGrid>
    </>
  );
}
