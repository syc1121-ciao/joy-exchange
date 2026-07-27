import { Suspense } from "react";

import LoginContent from "./LoginContent";

function LoginFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-black/5 bg-white p-8 shadow-sm">
        <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />

        <div className="mt-5 h-10 w-3/4 animate-pulse rounded bg-neutral-200" />

        <div className="mt-4 h-5 w-full animate-pulse rounded bg-neutral-100" />

        <div className="mt-2 h-5 w-4/5 animate-pulse rounded bg-neutral-100" />

        <div className="mt-8 h-12 w-full animate-pulse rounded-full bg-neutral-200" />
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}