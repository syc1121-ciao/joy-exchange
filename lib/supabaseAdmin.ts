import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl) {
  throw new Error(
    "找不到 NEXT_PUBLIC_SUPABASE_URL",
  );
}

if (!serviceRoleKey) {
  throw new Error(
    "找不到 SUPABASE_SERVICE_ROLE_KEY",
  );
}

if (!supabaseUrl.startsWith("https://")) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL 必須是 https:// 開頭的 Supabase Project URL",
  );
}

if (!supabaseUrl.endsWith(".supabase.co")) {
  throw new Error(
    `NEXT_PUBLIC_SUPABASE_URL 格式不正確：${supabaseUrl}`,
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: fetch.bind(globalThis),
    },
  },
);