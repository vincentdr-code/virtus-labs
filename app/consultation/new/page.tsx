"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createConsultationSession } from "@/lib/actions/consultation";

export default function NewConsultationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const session = await createConsultationSession({
      title: fd.get("title") as string,
      clientName: (fd.get("clientName") as string) || undefined,
    });
    router.push(`/consultation/${session.id}`);
  }

  return (
    <>
      <Topbar title="New Consultation Session" />
      <div className="p-10 max-w-lg">
        <form
          onSubmit={handleSubmit}
          className="bg-bg-secondary border border-c-border rounded-lg p-6 space-y-4"
        >
          <p className="text-text-secondary text-sm">
            Start this before the call. Once inside, activate the mic and let
            the client speak — the system filters out small talk and builds a
            working prototype from their business talk in real time.
          </p>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">
              Session Title *
            </label>
            <Input
              name="title"
              required
              placeholder="Discovery call — Acme Medical"
              className="bg-bg-primary border-c-border text-text-primary"
            />
          </div>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">
              Client Name
            </label>
            <Input
              name="clientName"
              placeholder="Sarah Chen"
              className="bg-bg-primary border-c-border text-text-primary"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-gold text-bg-primary hover:bg-gold-bright font-semibold"
            >
              {loading ? "Starting..." : "Start Session"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
