import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const GALLERY_BUCKET = "gallery";

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const maximumFileSize = 10 * 1024 * 1024;

function cleanText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function parseBoolean(
  value: FormDataEntryValue | null,
) {
  return value === "true";
}

function parseSortOrder(
  value: FormDataEntryValue | null,
) {
  if (typeof value !== "string") {
    return 0;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isNaN(parsedValue)
    ? 0
    : parsedValue;
}

function sanitizeFileName(fileName: string) {
  const extension =
    fileName.split(".").pop()?.toLowerCase() ||
    "jpg";

  const nameWithoutExtension = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return `${
    nameWithoutExtension || "gallery-image"
  }.${extension}`;
}

async function getAdminEmail() {
  const session = await requireAdmin();

  const email = session?.user?.email
    ?.trim()
    .toLowerCase();

  return email || null;
}

async function validateRelations({
  placeId,
  journalId,
  authorEmail,
}: {
  placeId: string | null;
  journalId: string | null;
  authorEmail: string;
}) {
  if (placeId) {
    const { data, error } = await supabaseAdmin
      .from("places")
      .select("id")
      .eq("id", placeId)
      .eq("author_email", authorEmail)
      .maybeSingle();

    if (error) {
      return {
        error: error.message,
        status: 500,
      };
    }

    if (!data) {
      return {
        error: "Selected place does not exist.",
        status: 404,
      };
    }
  }

  if (journalId) {
    const { data, error } = await supabaseAdmin
      .from("journals")
      .select("id")
      .eq("id", journalId)
      .eq("author_email", authorEmail)
      .maybeSingle();

    if (error) {
      return {
        error: error.message,
        status: 500,
      };
    }

    if (!data) {
      return {
        error: "Selected journal does not exist.",
        status: 404,
      };
    }
  }

  return null;
}

// 公開讀取 Gallery
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("gallery_images")
      .select(`
        id,
        title,
        caption,
        image_url,
        storage_path,
        taken_at,
        sort_order,
        is_featured,
        created_at,
        place:places (
          id,
          city,
          country,
          slug
        ),
        journal:journals (
          id,
          title,
          slug
        )
      `)
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: false,
      });

    if (error) {
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
      images: data ?? [],
    });
  } catch (error) {
    console.error(
      "GET /api/gallery error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load gallery.",
      },
      {
        status: 500,
      },
    );
  }
}

// 新增圖片
export async function POST(request: Request) {
  let uploadedStoragePath: string | null =
    null;

  try {
    const authorEmail = await getAdminEmail();

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

    const formData = await request.formData();

    const albumTitle = cleanText(
      formData.get("albumTitle"),
    );
    const albumCaption =
      cleanText(formData.get("albumCaption")) || null;
    const placeId =
      cleanText(formData.get("placeId")) ||
      null;
    const journalId =
      cleanText(formData.get("journalId")) ||
      null;
    const takenAt =
      cleanText(formData.get("takenAt")) ||
      null;
    const sortOrder = parseSortOrder(
      formData.get("sortOrder"),
    );
    const isFeatured = parseBoolean(
      formData.get("isFeatured"),
    );
    const uploadedImages = formData.getAll("images");
    const uploadedFiles = uploadedImages.filter(
      (item): item is File => item instanceof File,
    );

    if (!albumTitle) {
      return NextResponse.json(
        {
          error: "Album title is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        {
          error: "At least one image is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (uploadedFiles.length !== uploadedImages.length) {
      return NextResponse.json(
        {
          error: "Image is required.",
        },
        {
          status: 400,
        },
      );
    }

    const invalidImageType = uploadedFiles.find(
      (item) => !allowedImageTypes.includes(item.type),
    );

    if (invalidImageType) {
      return NextResponse.json(
        {
          error:
            "Only JPG, PNG, WebP and GIF images are supported.",
        },
        {
          status: 400,
        },
      );
    }

    const oversizedImage = uploadedFiles.find(
      (item) => item.size > maximumFileSize,
    );

    if (oversizedImage) {
      return NextResponse.json(
        {
          error:
            "Image must be smaller than 10 MB.",
        },
        {
          status: 400,
        },
      );
    }

    const relationError =
      await validateRelations({
        placeId,
        journalId,
        authorEmail,
      });

    if (relationError) {
      return NextResponse.json(
        {
          error: relationError.error,
        },
        {
          status: relationError.status,
        },
      );
    }

    const uploadedRecords = [] as Array<{
      title: string;
      caption: string | null;
      image_url: string;
      storage_path: string;
      place_id: string | null;
      journal_id: string | null;
      taken_at: string | null;
      sort_order: number;
      is_featured: boolean;
      author_email: string;
    }>;

    const storagePathsToCleanup: string[] = [];

    for (const file of uploadedImages as File[]) {
      const safeFileName = sanitizeFileName(file.name);
      const storagePath = `${authorEmail}/${crypto.randomUUID()}-${safeFileName}`;
      const imageBuffer = await file.arrayBuffer();

      const { error: uploadError } = await supabaseAdmin.storage
        .from(GALLERY_BUCKET)
        .upload(storagePath, imageBuffer, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        for (const cleanupPath of storagePathsToCleanup) {
          await supabaseAdmin.storage
            .from(GALLERY_BUCKET)
            .remove([cleanupPath]);
        }

        return NextResponse.json(
          {
            error: uploadError.message,
          },
          {
            status: 500,
          },
        );
      }

      const {
        data: publicUrlData,
      } = supabaseAdmin.storage
        .from(GALLERY_BUCKET)
        .getPublicUrl(storagePath);

      uploadedStoragePath = storagePath;
      storagePathsToCleanup.push(storagePath);

      uploadedRecords.push({
        title: albumTitle,
        caption: albumCaption,
        image_url: publicUrlData.publicUrl,
        storage_path: storagePath,
        place_id: placeId,
        journal_id: journalId,
        taken_at: takenAt,
        sort_order: sortOrder + uploadedRecords.length,
        is_featured: isFeatured,
        author_email: authorEmail,
      });
    }

    const { data, error } = await supabaseAdmin
      .from("gallery_images")
      .insert(uploadedRecords)
      .select("*");

    if (error) {
      for (const cleanupPath of storagePathsToCleanup) {
        await supabaseAdmin.storage
          .from(GALLERY_BUCKET)
          .remove([cleanupPath]);
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
        message:
          "Gallery album created successfully.",
        images: data,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (uploadedStoragePath) {
      await supabaseAdmin.storage
        .from(GALLERY_BUCKET)
        .remove([uploadedStoragePath]);
    }

    console.error(
      "POST /api/gallery error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create gallery image.",
      },
      {
        status: 500,
      },
    );
  }
}

// 修改圖片資料，也可以更換圖片
export async function PATCH(request: Request) {
  let newStoragePath: string | null = null;

  try {
    const authorEmail = await getAdminEmail();

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

    const formData = await request.formData();

    const id = cleanText(formData.get("id"));
    const title = cleanText(
      formData.get("title"),
    );
    const caption =
      cleanText(formData.get("caption")) || null;
    const placeId =
      cleanText(formData.get("placeId")) ||
      null;
    const journalId =
      cleanText(formData.get("journalId")) ||
      null;
    const takenAt =
      cleanText(formData.get("takenAt")) ||
      null;
    const sortOrder = parseSortOrder(
      formData.get("sortOrder"),
    );
    const isFeatured = parseBoolean(
      formData.get("isFeatured"),
    );
    const newImage = formData.get("image");

    if (!id) {
      return NextResponse.json(
        {
          error: "Gallery image ID is required.",
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

    const {
      data: existingImage,
      error: existingImageError,
    } = await supabaseAdmin
      .from("gallery_images")
      .select(`
        id,
        storage_path,
        image_url
      `)
      .eq("id", id)
      .eq("author_email", authorEmail)
      .maybeSingle();

    if (existingImageError) {
      return NextResponse.json(
        {
          error: existingImageError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (!existingImage) {
      return NextResponse.json(
        {
          error: "Gallery image not found.",
        },
        {
          status: 404,
        },
      );
    }

    const relationError =
      await validateRelations({
        placeId,
        journalId,
        authorEmail,
      });

    if (relationError) {
      return NextResponse.json(
        {
          error: relationError.error,
        },
        {
          status: relationError.status,
        },
      );
    }

    let imageUrl = existingImage.image_url;
    let storagePath =
      existingImage.storage_path;

    if (
      newImage instanceof File &&
      newImage.size > 0
    ) {
      if (
        !allowedImageTypes.includes(
          newImage.type,
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Only JPG, PNG, WebP and GIF images are supported.",
          },
          {
            status: 400,
          },
        );
      }

      if (newImage.size > maximumFileSize) {
        return NextResponse.json(
          {
            error:
              "Image must be smaller than 10 MB.",
          },
          {
            status: 400,
          },
        );
      }

      const safeFileName =
        sanitizeFileName(newImage.name);

      newStoragePath = `${authorEmail}/${crypto.randomUUID()}-${safeFileName}`;

      const imageBuffer =
        await newImage.arrayBuffer();

      const { error: uploadError } =
        await supabaseAdmin.storage
          .from(GALLERY_BUCKET)
          .upload(
            newStoragePath,
            imageBuffer,
            {
              contentType: newImage.type,
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

      const {
        data: publicUrlData,
      } = supabaseAdmin.storage
        .from(GALLERY_BUCKET)
        .getPublicUrl(newStoragePath);

      imageUrl = publicUrlData.publicUrl;
      storagePath = newStoragePath;
    }

    const { data, error } = await supabaseAdmin
      .from("gallery_images")
      .update({
        title,
        caption,
        image_url: imageUrl,
        storage_path: storagePath,
        place_id: placeId,
        journal_id: journalId,
        taken_at: takenAt,
        sort_order: sortOrder,
        is_featured: isFeatured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("author_email", authorEmail)
      .select("*")
      .maybeSingle();

    if (error) {
      if (newStoragePath) {
        await supabaseAdmin.storage
          .from(GALLERY_BUCKET)
          .remove([newStoragePath]);
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
      if (newStoragePath) {
        await supabaseAdmin.storage
          .from(GALLERY_BUCKET)
          .remove([newStoragePath]);
      }

      return NextResponse.json(
        {
          error: "Gallery image not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      newStoragePath &&
      existingImage.storage_path
    ) {
      await supabaseAdmin.storage
        .from(GALLERY_BUCKET)
        .remove([
          existingImage.storage_path,
        ]);
    }

    return NextResponse.json({
      message:
        "Gallery image updated successfully.",
      image: data,
    });
  } catch (error) {
    if (newStoragePath) {
      await supabaseAdmin.storage
        .from(GALLERY_BUCKET)
        .remove([newStoragePath]);
    }

    console.error(
      "PATCH /api/gallery error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update gallery image.",
      },
      {
        status: 500,
      },
    );
  }
}

// 刪除圖片與 Storage 檔案
export async function DELETE(request: Request) {
  try {
    const authorEmail = await getAdminEmail();

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

    const { searchParams } = new URL(
      request.url,
    );

    const id = searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json(
        {
          error: "Gallery image ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: existingImage,
      error: existingImageError,
    } = await supabaseAdmin
      .from("gallery_images")
      .select("id, storage_path")
      .eq("id", id)
      .eq("author_email", authorEmail)
      .maybeSingle();

    if (existingImageError) {
      return NextResponse.json(
        {
          error: existingImageError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (!existingImage) {
      return NextResponse.json(
        {
          error: "Gallery image not found.",
        },
        {
          status: 404,
        },
      );
    }

    const { error: deleteDatabaseError } =
      await supabaseAdmin
        .from("gallery_images")
        .delete()
        .eq("id", id)
        .eq("author_email", authorEmail);

    if (deleteDatabaseError) {
      return NextResponse.json(
        {
          error: deleteDatabaseError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (existingImage.storage_path) {
      const { error: storageError } =
        await supabaseAdmin.storage
          .from(GALLERY_BUCKET)
          .remove([
            existingImage.storage_path,
          ]);

      if (storageError) {
        console.error(
          "Storage delete warning:",
          storageError,
        );
      }
    }

    return NextResponse.json({
      success: true,
      deletedId: existingImage.id,
    });
  } catch (error) {
    console.error(
      "DELETE /api/gallery error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete gallery image.",
      },
      {
        status: 500,
      },
    );
  }
}