import { Suspense } from "react";

import LoginContent from "./LoginContent";

function LoginFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-6">
      <div className="text-center">
        <p className="text-sm text-neutral-500">
          Loading login page...
        </p>
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