"use client";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createInteraction } from "@/lib/actions/interactions";
import type { Contact } from "@/types";
import type { InteractionType } from "@/lib/generated/prisma/enums";

const INTERACTION_TYPES: { value: InteractionType; label: string }[] = [
  { value: "RESEARCH", label: "Research" },
  { value: "CALL", label: "Call" },
  { value: "EMAIL", label: "Email" },
  { value: "MEETING", label: "Meeting" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "FOLLOW_UP", label: "Follow-up" },
];

export function InteractionForm({
  companyId,
  contacts,
}: {
  companyId: string;
  contacts: Contact[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      await createInteraction({
        companyId,
        contactId: (fd.get("contactId") as string) || undefined,
        type: fd.get("type") as InteractionType,
        date: new Date(fd.get("date") as string),
        notes: (fd.get("notes") as string) || undefined,
        insightDelivered:
          (fd.get("insightDelivered") as string) || undefined,
        outcome: (fd.get("outcome") as string) || undefined,
      });
      form.reset();
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm px-3 py-1.5 rounded-md border border-c-border text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
      >
        + Log Interaction
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-bg-tertiary border border-c-border rounded-lg p-4 space-y-3 w-full max-w-2xl"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-tertiary mb-1 block">Type *</label>
          <select
            name="type"
            required
            className="w-full bg-bg-secondary border border-c-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-gold"
          >
            {INTERACTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-text-tertiary mb-1 block">Date *</label>
          <Input
            type="date"
            name="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className="bg-bg-secondary border-c-border text-text-primary"
          />
        </div>
      </div>
      {contacts.length > 0 && (
        <div>
          <label className="text-xs text-text-tertiary mb-1 block">
            Contact (optional)
          </label>
          <select
            name="contactId"
            className="w-full bg-bg-secondary border border-c-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="">— none —</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.title ? ` · ${c.title}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="text-xs text-text-tertiary mb-1 block">Notes</label>
        <Textarea
          name="notes"
          rows={2}
          placeholder="What happened?"
          className="bg-bg-secondary border-c-border text-text-primary"
        />
      </div>
      <div>
        <label className="text-xs text-text-tertiary mb-1 block">
          Insight delivered
        </label>
        <Textarea
          name="insightDelivered"
          rows={2}
          placeholder="What did you teach them?"
          className="bg-bg-secondary border-c-border text-text-primary"
        />
      </div>
      <div>
        <label className="text-xs text-text-tertiary mb-1 block">Outcome</label>
        <Input
          name="outcome"
          placeholder="e.g. Requested follow-up"
          className="bg-bg-secondary border-c-border text-text-primary"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="bg-gold text-bg-primary hover:bg-gold-bright font-semibold text-sm px-4 py-2 rounded-md disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-text-secondary hover:text-text-primary text-sm px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
