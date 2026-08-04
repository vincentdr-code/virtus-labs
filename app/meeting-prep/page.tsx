import { Topbar } from "@/components/layout/Topbar";
import { PrepSheet } from "@/components/meeting-prep/PrepSheet";
import { getCompanies, getCompany } from "@/lib/actions/companies";
import { getVertical } from "@/lib/actions/research";
import { slugify } from "@/lib/utils";

export default async function MeetingPrepPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const { company: selectedId } = await searchParams;
  const companies = await getCompanies();

  const company = selectedId ? await getCompany(selectedId) : null;
  const research = company ? await getVertical(slugify(company.vertical)) : null;

  return (
    <>
      <Topbar title="Meeting Prep" />
      <div className="p-10 max-w-3xl space-y-8">
        <form method="GET">
          <label className="text-xs text-text-tertiary mb-2 block uppercase tracking-wider">
            Select a company to prep for
          </label>
          <div className="flex gap-2">
            <select
              name="company"
              defaultValue={selectedId ?? ""}
              className="flex-1 bg-bg-secondary border border-c-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-gold"
            >
              <option value="">— Choose a company —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.status.replace("_", " ")}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-gold text-bg-primary rounded-md text-sm font-semibold hover:bg-gold-bright transition-colors"
            >
              Load Prep
            </button>
          </div>
        </form>

        {company ? (
          <PrepSheet company={company} research={research} />
        ) : (
          <div className="bg-bg-secondary border border-c-border rounded-lg p-10 text-center">
            <p className="text-text-secondary text-sm">
              Select a company above to generate your meeting prep sheet.
            </p>
            <p className="text-text-tertiary text-xs mt-2 max-w-md mx-auto">
              Pulls together their archaic signal, vertical pain points,
              already-delivered insights, last interaction, open deal, and a
              suggested opening line.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
