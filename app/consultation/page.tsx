import { Topbar } from "@/components/layout/Topbar";
import { getConsultationSessions } from "@/lib/actions/consultation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function ConsultationPage() {
  const sessions = await getConsultationSessions();

  return (
    <>
      <Topbar
        title="Consultation Sessions"
        action={{ label: "+ New Session", href: "/consultation/new" }}
      />
      <div className="p-10 max-w-5xl space-y-5">
        <p className="text-text-secondary text-sm">
          Start a session before a discovery call. The mic listens to the
          client, filters out small talk, and builds a working software
          prototype from their exact words — ready to show when the meeting
          ends.
        </p>
        <div className="bg-bg-secondary border border-c-border rounded-lg overflow-hidden">
          {sessions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-text-secondary text-sm">
                No sessions yet. Start one before your next call.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-c-border">
                  {["Session", "Client", "Company", "Status", "Date", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-text-tertiary font-medium text-xs uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-c-border hover:bg-bg-tertiary transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {s.title}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {s.clientName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {s.company?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium ${
                          s.status === "COMPLETED"
                            ? "text-emerald-bright"
                            : "text-gold"
                        }`}
                      >
                        {s.status === "COMPLETED" ? "Completed" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-tertiary text-xs">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={
                          s.status === "COMPLETED"
                            ? `/consultation/${s.id}/brief`
                            : `/consultation/${s.id}`
                        }
                        className="text-emerald-bright text-xs hover:underline"
                      >
                        {s.status === "COMPLETED" ? "View Prototype" : "Continue"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
