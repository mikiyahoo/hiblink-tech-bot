import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { telegramId, name, sectors, techStack } = await request.json();

    if (!telegramId) {
      return NextResponse.json({ error: "Telegram ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("candidates")
      .upsert({
        telegram_id: telegramId,
        name: name,
        sectors: sectors,
        tech_stack: techStack,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "telegram_id",
      });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Submit failed" }, { status: 500 });
  }
}