import { NextResponse } from "next/server";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

export async function POST(req: Request) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  try {
    const { action, metadata } = await req.json();

    await fetch(`${supabaseUrl}/rest/v1/analytics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ action, metadata: metadata || {} }),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
