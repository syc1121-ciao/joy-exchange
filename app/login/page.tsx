"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const searchParams = useSearchParams();

  const callbackUrl =
    searchParams.get("callbackUrl") ?? "/dashboard";

  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true);

    try {
      await signIn("google", {
        callbackUrl,
      });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-6">
      <section className="w-full max-w-md rounded-[32px] border border-neutral-200 bg-white p-10 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Private Studio
        </p>

        <h1 className="mt-3 font-serif text-4xl">
          Joy's Dashboard
        </h1>

        <p className="mt-5 text-sm leading-7 text-neutral-500">
          只有網站管理者可以登入。
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-10 flex w-full items-center justify-center rounded-full bg-neutral-900 px-6 py-4 text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {loading
            ? "Redirecting..."
            : "Continue with Google"}
        </button>
      </section>
    </main>
  );
}