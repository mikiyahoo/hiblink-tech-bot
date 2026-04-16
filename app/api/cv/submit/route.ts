import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { telegramId, name, sectors, techStack } = await request.json();

    if (!telegramId) {
      return NextResponse.json({ error: "Telegram ID required" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Submit failed" }, { status: 500 });
  }
}