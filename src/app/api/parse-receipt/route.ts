import { NextRequest, NextResponse } from "next/server";
import { getActiveSession } from "@/lib/auth";
import { parseDocument } from "@/lib/parseflow";

export async function POST(request: NextRequest) {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PDF, JPEG, PNG, or WEBP." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const result = await parseDocument(file);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse receipt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
