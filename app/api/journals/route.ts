import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/requireAdmin";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const supabaseAdmin = getSupabaseAdmin();

type JournalStatus = "draft" | "published";

type CreateJournalBody = {
  placeId?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  journalDate?: string;
  status?: JournalStatus;
};

type UpdateJournalBody = {
  id?: string;
  placeId?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  journalDate?: string | null;
  status?: JournalStatus;
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValidStatus(
  status: string,
): status is JournalStatus {
  return status === "draft" || status === "published";
}

// 公開讀取已發布的 Journal
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("journals")
      .select(`
        id,
        title,
        slug,
        excerpt,
        content,
        journal_date,
        status,
        created_at,
        place:places (
          id,
          city,
          country,
          slug
        )
      `)
      .eq("status", "published")
      .order("journal_date", {
        ascending: false,
        nullsFirst: false,
      });

    if (error) {
      console.error(
        "GET /api/journals error:",
        error,
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      journals: data ?? [],
    });
  } catch (error) {
    console.error(
      "GET /api/journals unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load journals.",
      },
      {
        status: 500,
      },
    );
  }
}

// 新增 Journal
export async function POST(request: Request) {
  try {
    const session = await requireAdmin();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      (await request.json()) as CreateJournalBody;

    const placeId = body.placeId?.trim();
    const title = body.title?.trim();
    const slug = normalizeSlug(body.slug ?? "");
    const excerpt = body.excerpt?.trim() || null;
    const content = body.content?.trim() || null;
    const journalDate =
      body.journalDate?.trim() || null;
    const status = body.status ?? "draft";

    if (!placeId) {
      return NextResponse.json(
        {
          error: "Place is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          error: "Title is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          error: "Slug is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!isValidStatus(status)) {
      return NextResponse.json(
        {
          error: "Invalid status.",
        },
        {
          status: 400,
        },
      );
    }

    const authorEmail = session.user.email
      .trim()
      .toLowerCase();

    const {
      data: existingJournal,
      error: existingJournalError,
    } = await supabaseAdmin
      .from("journals")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingJournalError) {
      return NextResponse.json(
        {
          error: existingJournalError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (existingJournal) {
      return NextResponse.json(
        {
          error: "This slug already exists.",
        },
        {
          status: 409,
        },
      );
    }

    const {
      data: selectedPlace,
      error: selectedPlaceError,
    } = await supabaseAdmin
      .from("places")
      .select("id")
      .eq("id", placeId)
      .eq("author_email", authorEmail)
      .maybeSingle();

    if (selectedPlaceError) {
      return NextResponse.json(
        {
          error: selectedPlaceError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (!selectedPlace) {
      return NextResponse.json(
        {
          error:
            "Selected place does not exist or is not yours.",
        },
        {
          status: 404,
        },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("journals")
      .insert({
        place_id: placeId,
        title,
        slug,
        excerpt,
        content,
        journal_date: journalDate,
        status,
        author_email: authorEmail,
      })
      .select("*")
      .single();

    if (error) {
      console.error(
        "POST /api/journals error:",
        error,
      );

      if (error.code === "23505") {
        return NextResponse.json(
          {
            error:
              "This slug is already used by another journal.",
          },
          {
            status: 409,
          },
        );
      }

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Journal created successfully.",
        journal: data,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/journals unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create journal.",
      },
      {
        status: 500,
      },
    );
  }
}

// 更新 Journal
export async function PATCH(request: Request) {
  try {
    const session = await requireAdmin();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      (await request.json()) as UpdateJournalBody;

    const id = body.id?.trim();
    const placeId = body.placeId?.trim();
    const title = body.title?.trim();
    const slug = normalizeSlug(body.slug ?? "");
    const excerpt = body.excerpt?.trim() || null;
    const content = body.content?.trim() || null;
    const journalDate =
      body.journalDate?.trim() || null;
    const status = body.status ?? "draft";

    if (!id) {
      return NextResponse.json(
        {
          error: "Journal ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!placeId) {
      return NextResponse.json(
        {
          error: "Place is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          error: "Title is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          error: "Slug is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!isValidStatus(status)) {
      return NextResponse.json(
        {
          error: "Invalid status.",
        },
        {
          status: 400,
        },
      );
    }

    const authorEmail = session.user.email
      .trim()
      .toLowerCase();

    const {
      data: selectedPlace,
      error: selectedPlaceError,
    } = await supabaseAdmin
      .from("places")
      .select("id")
      .eq("id", placeId)
      .eq("author_email", authorEmail)
      .maybeSingle();

    if (selectedPlaceError) {
      return NextResponse.json(
        {
          error: selectedPlaceError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (!selectedPlace) {
      return NextResponse.json(
        {
          error:
            "Selected place does not exist or is not yours.",
        },
        {
          status: 404,
        },
      );
    }

    const {
      data: duplicateJournal,
      error: duplicateError,
    } = await supabaseAdmin
      .from("journals")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (duplicateError) {
      return NextResponse.json(
        {
          error: duplicateError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (duplicateJournal) {
      return NextResponse.json(
        {
          error:
            "This slug is already used by another journal.",
        },
        {
          status: 409,
        },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("journals")
      .update({
        place_id: placeId,
        title,
        slug,
        excerpt,
        content,
        journal_date: journalDate,
        status,
      })
      .eq("id", id)
      .eq("author_email", authorEmail)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error(
        "PATCH /api/journals error:",
        error,
      );

      if (error.code === "23505") {
        return NextResponse.json(
          {
            error:
              "This slug is already used by another journal.",
          },
          {
            status: 409,
          },
        );
      }

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        },
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "Journal not found or you do not have permission to edit it.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      message: "Journal updated successfully.",
      journal: data,
    });
  } catch (error) {
    console.error(
      "PATCH /api/journals unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update journal.",
      },
      {
        status: 500,
      },
    );
  }
}

// 刪除 Journal
export async function DELETE(request: Request) {
  try {
    const session = await requireAdmin();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json(
        {
          error: "Journal ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const authorEmail = session.user.email
      .trim()
      .toLowerCase();

    const { data, error } = await supabaseAdmin
      .from("journals")
      .delete()
      .eq("id", id)
      .eq("author_email", authorEmail)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error(
        "DELETE /api/journals error:",
        error,
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        },
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "Journal not found or you do not have permission to delete it.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: data.id,
    });
  } catch (error) {
    console.error(
      "DELETE /api/journals unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete journal.",
      },
      {
        status: 500,
      },
    );
  }
}