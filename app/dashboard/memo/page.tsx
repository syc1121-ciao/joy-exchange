"use client";

import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Memo = {
  id: string;
  user_id: string;
  content: string;
  completed: boolean;
  created_at: string;
};

export default function MemoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [password, setPassword] = useState("");
  const [newMemo, setNewMemo] = useState("");
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function initialize() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        await loadMemos();
      }

      setLoading(false);
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadMemos() {
    const { data, error } = await supabase
      .from("memos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`讀取失敗：${error.message}`);
      return;
    }

    setMemos(data ?? []);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = process.env.NEXT_PUBLIC_MEMO_EMAIL;

    if (!email) {
      setMessage("尚未設定 NEXT_PUBLIC_MEMO_EMAIL");
      return;
    }

    if (!password.trim()) {
      setMessage("請輸入密碼");
      return;
    }

    setLoginLoading(true);
    setMessage("");

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setMessage("密碼錯誤，請重新輸入");
      setLoginLoading(false);
      return;
    }

    setUser(data.user);
    setPassword("");
    await loadMemos();
    setLoginLoading(false);
  }

  async function addMemo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = newMemo.trim();

    if (!content || !user) {
      return;
    }

    setMessage("");

    const { data, error } = await supabase
      .from("memos")
      .insert({
        content,
        completed: false,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      setMessage(`新增失敗：${error.message}`);
      return;
    }

    setMemos((currentMemos) => [
      data as Memo,
      ...currentMemos,
    ]);

    setNewMemo("");
  }

  async function toggleMemo(memo: Memo) {
    const nextCompleted = !memo.completed;

    const { error } = await supabase
      .from("memos")
      .update({
        completed: nextCompleted,
      })
      .eq("id", memo.id);

    if (error) {
      setMessage(`更新失敗：${error.message}`);
      return;
    }

    setMemos((currentMemos) =>
      currentMemos.map((item) =>
        item.id === memo.id
          ? { ...item, completed: nextCompleted }
          : item
      )
    );
  }

  async function deleteMemo(id: string) {
    const confirmed = window.confirm("確定要刪除這項備忘錄嗎？");

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("memos")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(`刪除失敗：${error.message}`);
      return;
    }

    setMemos((currentMemos) =>
      currentMemos.filter((memo) => memo.id !== id)
    );
  }

  async function logout() {
    await supabase.auth.signOut();

    setUser(null);
    setMemos([]);
    setMessage("");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <p className="text-neutral-500">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-6">
        <section className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-xl">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-neutral-400">
            Private Space
          </p>

          <h1 className="font-serif text-4xl">
            My Memo
          </h1>

          <p className="mt-3 text-neutral-500">
            輸入密碼後查看和編輯你的備忘錄。
          </p>

          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-4"
          >
            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="輸入密碼"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 outline-none transition focus:border-neutral-500"
            />

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-full bg-black px-6 py-4 text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loginLoading ? "登入中..." : "進入備忘錄"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-red-500">
              {message}
            </p>
          )}
        </section>
      </main>
    );
  }

  const unfinishedCount = memos.filter(
    (memo) => !memo.completed
  ).length;

  return (
    <main className="min-h-screen bg-[#faf8f5] px-5 py-12 sm:px-8">
      <section className="mx-auto max-w-3xl">
        <header className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-neutral-400">
              Private Dashboard
            </p>

            <h1 className="font-serif text-5xl">
              My Memo
            </h1>

            <p className="mt-3 text-neutral-500">
              還有 {unfinishedCount} 件事情等待完成
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-full border border-neutral-300 px-5 py-2 text-sm transition hover:bg-white"
          >
            登出
          </button>
        </header>

        <form
          onSubmit={addMemo}
          className="mb-8 flex flex-col gap-3 rounded-[28px] bg-white p-4 shadow-sm sm:flex-row"
        >
          <input
            type="text"
            value={newMemo}
            onChange={(event) =>
              setNewMemo(event.target.value)
            }
            placeholder="新增一件要完成的事情..."
            className="min-w-0 flex-1 rounded-2xl bg-neutral-50 px-5 py-4 outline-none"
          />

          <button
            type="submit"
            className="rounded-full bg-black px-7 py-4 text-white transition hover:bg-neutral-700"
          >
            新增
          </button>
        </form>

        {message && (
          <p className="mb-5 text-sm text-red-500">
            {message}
          </p>
        )}

        <div className="space-y-3">
          {memos.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-neutral-300 px-6 py-16 text-center">
              <p className="text-lg">目前沒有備忘錄</p>

              <p className="mt-2 text-sm text-neutral-400">
                在上方新增你的第一件任務吧。
              </p>
            </div>
          ) : (
            memos.map((memo) => (
              <article
                key={memo.id}
                className="flex items-center gap-4 rounded-[24px] bg-white px-5 py-4 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleMemo(memo)}
                  aria-label={
                    memo.completed
                      ? "標記為未完成"
                      : "標記為完成"
                  }
                  className={`
                    flex h-7 w-7 shrink-0 items-center justify-center
                    rounded-full border transition
                    ${
                      memo.completed
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 hover:border-black"
                    }
                  `}
                >
                  {memo.completed ? "✓" : ""}
                </button>

                <button
                  type="button"
                  onClick={() => toggleMemo(memo)}
                  className={`
                    min-w-0 flex-1 text-left
                    ${
                      memo.completed
                        ? "text-neutral-400 line-through"
                        : "text-neutral-800"
                    }
                  `}
                >
                  {memo.content}
                </button>

                <button
                  type="button"
                  onClick={() => deleteMemo(memo.id)}
                  className="shrink-0 rounded-full px-3 py-2 text-sm text-neutral-400 transition hover:bg-red-50 hover:text-red-500"
                >
                  刪除
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}