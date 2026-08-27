import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uniqueId, email, wantsMoreSessions, requestedTopics } = body || {};

    const cleanUid = (uniqueId || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanUid || !cleanEmail) {
      return NextResponse.json(
        { error: "Unique ID and email are required to submit feedback." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify participant exists
    const { data: participant, error: findError } = await supabase
      .from("participants")
      .select("id")
      .eq("unique_id", cleanUid)
      .filter("email", "ilike", cleanEmail)
      .maybeSingle();

    if (findError || !participant) {
      return NextResponse.json(
        { error: "Participant record not found." },
        { status: 404 }
      );
    }

    // Update participant feedback
    const { error: updateError } = await supabase
      .from("participants")
      .update({
        wants_more_sessions: Boolean(wantsMoreSessions),
        requested_topics: requestedTopics ? String(requestedTopics).trim() : null,
      })
      .eq("id", participant.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for your feedback!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to submit feedback." },
      { status: 500 }
    );
  }
}
