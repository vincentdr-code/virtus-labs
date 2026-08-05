"use client";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await signIn("credentials", {
        username: fd.get("username") as string,
        password: fd.get("password") as string,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid username or password.");
      } else {
        router.push("/");
        router.refresh();
      }
    });
  }

  return (
    <div className="min-h-screen w-full bg-bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-gold font-bold text-3xl tracking-[0.15em] leading-none">
            VIRTUS LABS
          </p>
          <p className="text-emerald-bright text-xs mt-3 uppercase tracking-[0.35em] font-semibold">
            Operations
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-bg-secondary border border-c-border rounded-2xl p-8 space-y-5"
        >
          <div>
            <label className="text-xs text-text-secondary mb-2 block uppercase tracking-[0.15em] font-semibold">
              Username
            </label>
            <Input
              name="username"
              autoComplete="username"
              required
              autoFocus
              className="bg-bg-primary border-c-border text-text-primary h-12 rounded-xl px-4 text-base focus-visible:border-emerald"
            />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-2 block uppercase tracking-[0.15em] font-semibold">
              Password
            </label>
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="bg-bg-primary border-c-border text-text-primary h-12 rounded-xl px-4 text-base focus-visible:border-emerald"
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm bg-danger/10 border border-danger/30 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full h-12 bg-gold text-bg-primary hover:bg-gold-bright font-bold text-sm tracking-[0.12em] uppercase rounded-full disabled:opacity-60 transition-colors shadow-lg shadow-gold/20 mt-1"
          >
            {pending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
