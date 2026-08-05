import { Settings } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { PageGrid } from "@/components/layout/PageGrid";
import { EmptyState } from "@/components/ui/empty-state";

export default function SettingsPage() {
  return (
    <>
      <Topbar title="Settings" />
      <PageGrid>
        <EmptyState
          icon={Settings}
          title="Settings"
          description="Workspace configuration — user access scoping, integrations, and preferences will live here."
        />
      </PageGrid>
    </>
  );
}
