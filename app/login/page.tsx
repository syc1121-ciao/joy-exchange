"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();

  const callbackUrl =
    searchParams.get("callbackUrl") ??
    "/dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-5">
      <section className="w-full max-w-md rounded-[2rem] border border-black/5 bg-white p-8 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
          Private Studio
        </p>

        <h1 className="mt-4 font-serif text-4xl text-slate-950">
          Joy’s Dashboard
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-500">
          這個頁面只提供網站管理者使用。
        </p>

        <button
          type="button"
          className="mt-8 w-full rounded-full bg-slate-950 px-6 py-4 text-sm text-white"
          onClick={() => {
            void signIn("google", {
              callbackUrl,
            });
          }}
        >
          Sign in with Google
        </button>
      </section>
    </main>
  );
}