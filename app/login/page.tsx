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
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-gold font-bold text-2xl tracking-tight leading-none">
            CONVENIENTIA
          </p>
          <p className="text-text-tertiary text-[10px] mt-2 uppercase tracking-widest">
            Operations
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-bg-secondary border border-c-border rounded-lg p-6 space-y-4"
        >
          <div>
            <label className="text-xs text-text-tertiary mb-1 block uppercase tracking-wider">
              Username
            </label>
            <Input
              name="username"
              autoComplete="username"
              required
              autoFocus
              className="bg-bg-primary border-c-border text-text-primary"
            />
          </div>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block uppercase tracking-wider">
              Password
            </label>
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="bg-bg-primary border-c-border text-text-primary"
            />
          </div>
          {error && (
            <p className="text-red-400 text-xs bg-danger/10 border border-danger/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-gold text-bg-primary hover:bg-gold-bright font-semibold text-sm px-4 py-2.5 rounded-md disabled:opacity-60 transition-colors"
          >
            {pending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
