import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const telegramId = formData.get("telegramId") as string;
    const name = formData.get("name") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "CV received, will be processed by HR",
      fileName: file.name,
      telegramId,
      name
    });
  } catch (error) {
    console.error("CV upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}