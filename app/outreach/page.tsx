import { Send } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { PageGrid } from "@/components/layout/PageGrid";
import { EmptyState } from "@/components/ui/empty-state";

export default function OutreachPage() {
  return (
    <>
      <Topbar title="Outreach" />
      <PageGrid>
        <EmptyState
          icon={Send}
          title="No outreach threads yet"
          description="Prospecting workspace: contacts by vertical with role, last touch date, and next action. Start by logging a contact — outreach threads will build from there."
          action={{ label: "Go to Contacts", href: "/contacts" }}
        />
      </PageGrid>
    </>
  );
}
