import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { PageGrid } from "@/components/layout/PageGrid";
import { getContacts } from "@/lib/actions/contacts";

export default async function ContactsPage() {
  const contacts = await getContacts();

  return (
    <>
      <Topbar title="Contacts" />
      <PageGrid>
        <div className="col-span-12 bg-bg-secondary/60 border border-c-border/60 rounded-2xl overflow-x-auto">
          {contacts.length === 0 ? (
            <p className="text-text-secondary text-sm p-6">
              No contacts yet. Add them from a company&apos;s detail page.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-c-border">
                  {[
                    "Name",
                    "Title",
                    "Company",
                    "Email",
                    "Decision Maker",
                    "LinkedIn",
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
                {contacts.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-c-border last:border-b-0 hover:bg-bg-tertiary transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {c.title ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/companies/${c.companyId}`}
                        className="text-emerald-bright hover:underline"
                      >
                        {c.company.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {c.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {c.isDecisionMaker ? (
                        <span className="text-gold text-xs font-medium">
                          Yes
                        </span>
                      ) : (
                        <span className="text-text-tertiary text-xs">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.linkedinUrl ? (
                        <a
                          href={c.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-bright text-xs hover:underline"
                        >
                          View ↗
                        </a>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </PageGrid>
    </>
  );
}
