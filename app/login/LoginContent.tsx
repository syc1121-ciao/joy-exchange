"use client";

import {
  signIn,
} from "next-auth/react";

import {
  useSearchParams,
} from "next/navigation";

import {
  useState,
} from "react";

export default function LoginContent() {
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] =
    useState(false);

  const callbackUrl =
    searchParams.get("callbackUrl") ??
    "/dashboard";

  const error =
    searchParams.get("error");

  async function handleGoogleLogin() {
    try {
      setIsLoading(true);

      await signIn("google", {
        callbackUrl,
      });
    } catch (loginError) {
      console.error(
        "Google login failed:",
        loginError,
      );

      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4 py-16">
      <section className="w-full max-w-md rounded-[2rem] border border-black/5 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Private Dashboard
        </p>

        <h1 className="mt-4 font-serif text-4xl text-neutral-950">
          Welcome back
        </h1>

        <p className="mt-4 text-sm leading-7 text-neutral-500">
          登入後即可管理交換日誌、城市、相片與航班資料。
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            登入失敗，請確認 Google 帳號與登入設定後再試一次。
          </div>
        )}

        <button
          type="button"
          disabled={isLoading}
          onClick={handleGoogleLogin}
          className="mt-8 flex w-full items-center justify-center rounded-full bg-[#1E3A5F] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#16304D] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading
            ? "Signing in..."
            : "Continue with Google"}
        </button>

        <p className="mt-5 text-center text-xs leading-5 text-neutral-400">
          僅限已授權的管理員帳號登入。
        </p>
      </section>
    </main>
  );
}