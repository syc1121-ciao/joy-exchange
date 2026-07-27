import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(
  request: Request,
) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const body = await request.json();

  // 寫入 Supabase
}