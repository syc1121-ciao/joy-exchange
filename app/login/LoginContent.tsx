"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginContent() {
  const searchParams = useSearchParams();

  const [isSigningIn, setIsSigningIn] =
    useState(false);

  const callbackUrl =
    searchParams.get("callbackUrl") ||
    "/dashboard";

  const loginError =
    searchParams.get("error");

  async function handleGoogleSignIn() {
    try {
      setIsSigningIn(true);

      await signIn("google", {
        callbackUrl,
      });
    } catch (error) {
      console.error(
        "Google sign-in error:",
        error,
      );

      setIsSigningIn(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#faf8f5] px-5 py-16">
      <section className="w-full max-w-md rounded-[2rem] border border-[#e8e2da] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Private dashboard
        </p>

        <h1 className="mt-4 font-serif text-4xl text-[#14213d]">
          Welcome back
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-500">
          登入後即可管理交換網站的城市、日記、照片與航班。
        </p>

        {loginError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            登入失敗，請重新嘗試。
            <br />
            錯誤代碼：{loginError}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          className="mt-8 flex w-full items-center justify-center rounded-full bg-[#14213d] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSigningIn
            ? "Signing in..."
            : "Continue with Google"}
        </button>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          僅限已授權的管理員 Google 帳號登入。
        </p>
      </section>
    </main>
  );
}