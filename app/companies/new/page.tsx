"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCompany } from "@/lib/actions/companies";
import type { CompanyStatus } from "@/lib/generated/prisma/enums";

const VERTICALS = [
  "Medical Device Manufacturing",
  "MEP / AEC",
  "Food & Beverage Manufacturing",
  "Industrial Manufacturing",
  "Healthcare",
  "Logistics & Supply Chain",
  "Professional Services",
  "Other",
];

const STATUSES: { value: CompanyStatus; label: string }[] = [
  { value: "RESEARCHING", label: "Researching" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "MEETING_SCHEDULED", label: "Meeting Scheduled" },
];

export default function NewCompanyPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const company = await createCompany({
        name: fd.get("name") as string,
        vertical: fd.get("vertical") as string,
        subVertical: (fd.get("subVertical") as string) || undefined,
        size: (fd.get("size") as string) || undefined,
        location: (fd.get("location") as string) || undefined,
        website: (fd.get("website") as string) || undefined,
        archaicSignalNotes:
          (fd.get("archaicSignalNotes") as string) || undefined,
        source: (fd.get("source") as string) || undefined,
        status: (fd.get("status") as CompanyStatus) || "RESEARCHING",
      });
      router.push(`/companies/${company.id}`);
    });
  }

  return (
    <>
      <Topbar title="Add Company" />
      <div className="p-6 max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="bg-bg-secondary border border-c-border rounded-lg p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-text-tertiary mb-1 block">
                Company Name *
              </label>
              <Input
                name="name"
                required
                placeholder="Acme Medical Devices"
                className="bg-bg-primary border-c-border text-text-primary"
              />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">
                Vertical *
              </label>
              <select
                name="vertical"
                required
                className="w-full bg-bg-primary border border-c-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {VERTICALS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">
                Sub-vertical
              </label>
              <Input
                name="subVertical"
                placeholder="e.g. SPD Reprocessing"
                className="bg-bg-primary border-c-border text-text-primary"
              />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">
                Location
              </label>
              <Input
                name="location"
                placeholder="City, ST"
                className="bg-bg-primary border-c-border text-text-primary"
              />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">
                Size
              </label>
              <Input
                name="size"
                placeholder="e.g. 50-200"
                className="bg-bg-primary border-c-border text-text-primary"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-text-tertiary mb-1 block">
                Website
              </label>
              <Input
                name="website"
                type="url"
                placeholder="https://"
                className="bg-bg-primary border-c-border text-text-primary"
              />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">
                Source
              </label>
              <Input
                name="source"
                placeholder="job posting, referral, cold research"
                className="bg-bg-primary border-c-border text-text-primary"
              />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">
                Initial Status
              </label>
              <select
                name="status"
                className="w-full bg-bg-primary border border-c-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-text-tertiary mb-1 block">
                Archaic Signal Notes
              </label>
              <Textarea
                name="archaicSignalNotes"
                rows={3}
                placeholder="What outdated pattern did you notice? Job posting for X, LinkedIn post showing Y..."
                className="bg-bg-primary border-c-border text-text-primary"
              />
            </div>
          </div>
          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="bg-gold text-bg-primary hover:bg-gold-bright font-semibold text-sm px-4 py-2 rounded-md disabled:opacity-60"
            >
              {pending ? "Adding..." : "Add Company"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-text-secondary hover:text-text-primary text-sm px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
