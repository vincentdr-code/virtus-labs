import { Topbar } from "@/components/layout/Topbar";
import { getProjects } from "@/lib/actions/projects";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  SCOPING: { label: "Scoping", color: "text-text-secondary" },
  ACTIVE: { label: "Active", color: "text-azure-bright" },
  PAUSED: { label: "Paused", color: "text-gold" },
  DELIVERED: { label: "Delivered", color: "text-text-secondary" },
  CANCELLED: { label: "Cancelled", color: "text-red-400" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  const active = projects.filter((p) => p.status === "ACTIVE");
  const totalActiveValue = active.reduce((s, p) => s + (p.value ?? 0), 0);

  return (
    <>
      <Topbar title="Client Projects" />
      <div className="p-10 max-w-6xl space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-bg-secondary border border-c-border rounded-lg p-4">
            <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-2">
              Active Projects
            </p>
            <p className="text-gold text-2xl font-bold tabular-nums leading-none">
              {active.length}
            </p>
          </div>
          <div className="bg-bg-secondary border border-c-border rounded-lg p-4">
            <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-2">
              Active Value
            </p>
            <p className="text-azure-bright text-2xl font-bold tabular-nums leading-none">
              {formatCurrency(totalActiveValue)}
            </p>
          </div>
          <div className="bg-bg-secondary border border-c-border rounded-lg p-4">
            <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-2">
              Total Projects
            </p>
            <p className="text-text-primary text-2xl font-bold tabular-nums leading-none">
              {projects.length}
            </p>
          </div>
        </div>

        <div className="bg-bg-secondary border border-c-border rounded-lg overflow-hidden">
          {projects.length === 0 ? (
            <p className="text-text-secondary text-sm p-6">
              No projects yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-c-border">
                  {[
                    "Project",
                    "Client",
                    "Status",
                    "Value",
                    "Tech Stack",
                    "Start",
                    "End",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-text-tertiary font-medium text-[11px] uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const config = STATUS_CONFIG[p.status] ?? {
                    label: p.status,
                    color: "text-text-secondary",
                  };
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-c-border last:border-b-0 hover:bg-bg-tertiary transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {p.name}
                        {p.description && (
                          <p className="text-text-tertiary text-xs font-normal">
                            {p.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {p.companyName}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium ${config.color}`}
                      >
                        {config.label}
                      </td>
                      <td className="px-4 py-3 text-gold tabular-nums">
                        {formatCurrency(p.value)}
                      </td>
                      <td className="px-4 py-3 text-text-tertiary text-xs">
                        {p.techStack ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-text-tertiary text-xs">
                        {formatDate(p.startDate)}
                      </td>
                      <td className="px-4 py-3 text-text-tertiary text-xs">
                        {formatDate(p.endDate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
