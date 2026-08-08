import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { getContacts } from "@/lib/actions/contacts";

export default async function ContactsPage() {
  const contacts = await getContacts();

  return (
    <>
      <Topbar title="Contacts" />
      <div className="p-10 max-w-6xl">
        <div className="bg-bg-secondary border border-c-border rounded-2xl overflow-hidden">
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
                        className="text-azure-bright hover:underline"
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
                          className="text-azure-bright text-xs hover:underline"
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
      </div>
    </>
  );
}
