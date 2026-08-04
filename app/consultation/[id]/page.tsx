import { notFound, redirect } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { SessionRecorder } from "@/components/consultation/SessionRecorder";
import { getConsultationSession } from "@/lib/actions/consultation";
import { getVertical } from "@/lib/actions/research";
import { slugify } from "@/lib/utils";

export default async function ConsultationSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getConsultationSession(id);
  if (!session) notFound();
  if (session.status === "COMPLETED") redirect(`/consultation/${id}/brief`);

  let companyContext = "";
  if (session.company) {
    const vertical = await getVertical(slugify(session.company.vertical));
    companyContext = [
      `Company: ${session.company.name}`,
      `Vertical: ${session.company.vertical}`,
      session.company.archaicSignalNotes
        ? `Signal: ${session.company.archaicSignalNotes}`
        : "",
      vertical?.keyPainPoints
        ? `Known vertical pain points: ${vertical.keyPainPoints}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return (
    <>
      <Topbar
        title={session.title}
        action={{ label: "All Sessions", href: "/consultation" }}
      />
      <div className="p-6 flex-1 flex flex-col">
        {session.clientName && (
          <p className="text-text-secondary text-sm mb-4">
            Client:{" "}
            <span className="text-text-primary font-medium">
              {session.clientName}
            </span>
            {session.company && (
              <span className="text-text-tertiary"> · {session.company.name}</span>
            )}
          </p>
        )}
        <SessionRecorder
          sessionId={id}
          initialTranscript={session.transcript ?? ""}
          initialInsights={session.insights ?? ""}
          initialPrototypeHtml={session.prototypeHtml ?? ""}
          companyContext={companyContext}
        />
      </div>
    </>
  );
}
