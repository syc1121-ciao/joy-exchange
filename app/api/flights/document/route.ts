import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET_NAME =
  "flight-documents";

const MAXIMUM_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

function sanitizeFileName(
  fileName: string,
) {
  const lastDotIndex =
    fileName.lastIndexOf(".");

  const extension =
    lastDotIndex >= 0
      ? fileName
          .slice(lastDotIndex + 1)
          .toLowerCase()
      : "file";

  const baseName =
    lastDotIndex >= 0
      ? fileName.slice(0, lastDotIndex)
      : fileName;

  const cleanBaseName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return `${
    cleanBaseName || "flight-document"
  }.${extension}`;
}

async function getAdminEmail() {
  const session = await requireAdmin();

  return (
    session?.user?.email
      ?.trim()
      .toLowerCase() ?? null
  );
}

export async function POST(
  request: Request,
) {
  let uploadedPath: string | null = null;

  try {
    const authorEmail =
      await getAdminEmail();

    if (!authorEmail) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const formData =
      await request.formData();

    const flightIdValue =
      formData.get("flightId");

    const fileValue =
      formData.get("file");

    const flightId =
      typeof flightIdValue === "string"
        ? flightIdValue.trim()
        : "";

    if (!flightId) {
      return NextResponse.json(
        {
          error:
            "Flight ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!(fileValue instanceof File)) {
      return NextResponse.json(
        {
          error:
            "Document file is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !ALLOWED_FILE_TYPES.includes(
        fileValue.type,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Only JPG, PNG, WebP and PDF files are supported.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      fileValue.size >
      MAXIMUM_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          error:
            "The file must be smaller than 10 MB.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: existingFlight,
      error: readError,
    } = await supabaseAdmin
      .from("flights")
      .select(`
        id,
        boarding_pass_path
      `)
      .eq("id", flightId)
      .eq(
        "author_email",
        authorEmail,
      )
      .maybeSingle();

    if (readError) {
      return NextResponse.json(
        {
          error: readError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (!existingFlight) {
      return NextResponse.json(
        {
          error: "Flight not found.",
        },
        {
          status: 404,
        },
      );
    }

    const safeFileName =
      sanitizeFileName(
        fileValue.name,
      );

    uploadedPath = `${authorEmail}/${flightId}/${crypto.randomUUID()}-${safeFileName}`;

    const fileBuffer =
      await fileValue.arrayBuffer();

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(
          uploadedPath,
          fileBuffer,
          {
            contentType:
              fileValue.type,
            cacheControl: "3600",
            upsert: false,
          },
        );

    if (uploadError) {
      return NextResponse.json(
        {
          error: uploadError.message,
        },
        {
          status: 500,
        },
      );
    }

    const { data: publicUrlData } =
      supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(uploadedPath);

    const { data, error } =
      await supabaseAdmin
        .from("flights")
        .update({
          boarding_pass_url:
            publicUrlData.publicUrl,

          boarding_pass_path:
            uploadedPath,

          boarding_pass_name:
            fileValue.name,

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", flightId)
        .eq(
          "author_email",
          authorEmail,
        )
        .select("*")
        .maybeSingle();

    if (error || !data) {
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([uploadedPath]);

      return NextResponse.json(
        {
          error:
            error?.message ??
            "Failed to update flight.",
        },
        {
          status: 500,
        },
      );
    }

    if (
      existingFlight.boarding_pass_path
    ) {
      const { error: removeError } =
        await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .remove([
            existingFlight
              .boarding_pass_path,
          ]);

      if (removeError) {
        console.error(
          "Old flight document delete warning:",
          removeError,
        );
      }
    }

    return NextResponse.json({
      message:
        "Flight document uploaded successfully.",
      flight: data,
    });
  } catch (error) {
    if (uploadedPath) {
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([uploadedPath]);
    }

    console.error(
      "POST flight document error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload document.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  request: Request,
) {
  try {
    const authorEmail =
      await getAdminEmail();

    if (!authorEmail) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const { searchParams } =
      new URL(request.url);

    const flightId =
      searchParams
        .get("flightId")
        ?.trim();

    if (!flightId) {
      return NextResponse.json(
        {
          error:
            "Flight ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: existingFlight,
      error: readError,
    } = await supabaseAdmin
      .from("flights")
      .select(`
        id,
        boarding_pass_path
      `)
      .eq("id", flightId)
      .eq(
        "author_email",
        authorEmail,
      )
      .maybeSingle();

    if (readError) {
      return NextResponse.json(
        {
          error: readError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (!existingFlight) {
      return NextResponse.json(
        {
          error: "Flight not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      existingFlight.boarding_pass_path
    ) {
      const { error: removeError } =
        await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .remove([
            existingFlight
              .boarding_pass_path,
          ]);

      if (removeError) {
        return NextResponse.json(
          {
            error: removeError.message,
          },
          {
            status: 500,
          },
        );
      }
    }

    const { data, error } =
      await supabaseAdmin
        .from("flights")
        .update({
          boarding_pass_url: null,
          boarding_pass_path: null,
          boarding_pass_name: null,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", flightId)
        .eq(
          "author_email",
          authorEmail,
        )
        .select("*")
        .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        {
          error:
            error?.message ??
            "Failed to remove document.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      flight: data,
    });
  } catch (error) {
    console.error(
      "DELETE flight document error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove document.",
      },
      {
        status: 500,
      },
    );
  }
}