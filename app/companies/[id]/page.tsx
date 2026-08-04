import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { StatusBadge } from "@/components/pipeline/StatusBadge";
import { InteractionForm } from "@/components/company/InteractionForm";
import { InteractionList } from "@/components/company/InteractionList";
import { getCompany } from "@/lib/actions/companies";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  const totalDealValue = company.deals.reduce(
    (s, d) => s + (d.valueEstimate ?? 0),
    0,
  );

  return (
    <>
      <Topbar title={company.name} />
      <div className="p-10 max-w-4xl space-y-10">
        <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{company.name}</h2>
              <p className="text-text-secondary text-sm mt-0.5">
                {company.vertical}
                {company.subVertical && ` · ${company.subVertical}`}
                {company.location && ` · ${company.location}`}
                {company.size && ` · ${company.size} employees`}
              </p>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-bright text-xs hover:underline mt-1 inline-block"
                >
                  {company.website}
                </a>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={company.status} />
              {totalDealValue > 0 && (
                <span className="text-gold font-bold text-lg tabular-nums">
                  {formatCurrency(totalDealValue)}
                </span>
              )}
            </div>
          </div>
          {company.archaicSignalNotes && (
            <div className="mt-4 p-3 bg-bg-tertiary rounded border-l-2 border-gold">
              <p className="text-[10px] text-gold font-medium mb-1 uppercase tracking-wider">
                Archaic Signal
              </p>
              <p className="text-text-secondary text-sm">
                {company.archaicSignalNotes}
              </p>
            </div>
          )}
          <div className="flex gap-4 mt-4 text-xs text-text-tertiary">
            <span>Source: {company.source ?? "—"}</span>
            <span>Added: {formatDate(company.createdAt)}</span>
            <span>Updated: {formatDate(company.updatedAt)}</span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Contacts
          </h3>
          {company.contacts.length === 0 ? (
            <p className="text-text-tertiary text-sm">No contacts yet.</p>
          ) : (
            <div className="grid gap-3">
              {company.contacts.map((c) => (
                <div
                  key={c.id}
                  className="bg-bg-secondary border border-c-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm text-text-primary">
                        {c.name}
                        {c.isDecisionMaker && (
                          <span className="ml-2 text-[10px] text-gold uppercase tracking-wider">
                            Decision Maker
                          </span>
                        )}
                      </p>
                      <p className="text-text-secondary text-xs">{c.title}</p>
                      {c.email && (
                        <p className="text-emerald-bright text-xs mt-1">
                          {c.email}
                        </p>
                      )}
                      {c.linkedinUrl && (
                        <a
                          href={c.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-tertiary text-xs hover:underline"
                        >
                          LinkedIn ↗
                        </a>
                      )}
                    </div>
                  </div>
                  {c.notes && (
                    <p className="text-text-tertiary text-xs mt-2 italic">
                      {c.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {company.deals.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Deals
            </h3>
            <div className="space-y-2">
              {company.deals.map((d) => (
                <div
                  key={d.id}
                  className="bg-bg-secondary border border-c-border rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-text-primary text-sm font-medium">
                      {d.serviceType}
                    </p>
                    <p className="text-text-tertiary text-xs">
                      {d.stage.replace("_", " ")}
                      {d.expectedCloseDate &&
                        ` · Expected close ${formatDate(d.expectedCloseDate)}`}
                    </p>
                  </div>
                  <p className="text-gold font-bold text-lg tabular-nums">
                    {formatCurrency(d.valueEstimate)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Interaction History
            </h3>
            <InteractionForm
              companyId={company.id}
              contacts={company.contacts}
            />
          </div>
          <InteractionList interactions={company.interactions} />
        </div>
      </div>
    </>
  );
}
