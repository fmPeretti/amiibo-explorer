import { NextResponse } from "next/server";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

export async function POST(req: Request) {
  if (!supabaseUrl || !supabaseSecretKey) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  try {
    const { action, metadata } = await req.json();
    const { visitor_id, ...rest } = metadata || {};

    await fetch(`${supabaseUrl}/rest/v1/analytics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseSecretKey,
        Authorization: `Bearer ${supabaseSecretKey}`,
      },
      body: JSON.stringify({
        action,
        visitor_id: visitor_id || null,
        metadata: rest,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
