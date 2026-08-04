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
        <div className="text-center mb-12">
          <p className="text-gold font-light text-3xl tracking-[0.3em] leading-none">
            CONVENIENTIA
          </p>
          <p className="text-text-tertiary text-[10px] mt-4 uppercase tracking-[0.45em] font-light">
            Operations
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[11px] text-text-tertiary mb-2.5 block uppercase tracking-[0.2em] font-light">
              Username
            </label>
            <Input
              name="username"
              autoComplete="username"
              required
              autoFocus
              className="bg-bg-secondary/60 border-c-border/60 text-text-primary h-12 rounded-xl px-4 focus-visible:border-gold/50"
            />
          </div>
          <div>
            <label className="text-[11px] text-text-tertiary mb-2.5 block uppercase tracking-[0.2em] font-light">
              Password
            </label>
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="bg-bg-secondary/60 border-c-border/60 text-text-primary h-12 rounded-xl px-4 focus-visible:border-gold/50"
            />
          </div>
          {error && (
            <p className="text-red-400 text-xs bg-danger/10 border border-danger/30 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full h-12 border border-gold/50 text-gold hover:bg-gold hover:text-bg-primary font-medium text-sm tracking-[0.15em] uppercase rounded-full disabled:opacity-60 transition-all duration-300 mt-2"
          >
            {pending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
