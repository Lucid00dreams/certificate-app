import { NextResponse } from "next/server";
import { createAdminClient, CERTIFICATES_BUCKET } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const uniqueId = (body?.uniqueId ?? "").trim();
  const email = (body?.email ?? "").trim().toLowerCase();

  if (!uniqueId || !email) {
    return NextResponse.json(
      { error: "Enter both your Unique ID and email." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: participant, error } = await supabase
    .from("participants")
    .select("id, name, email, unique_id, file_path, status, upload_date")
    .eq("unique_id", uniqueId)
    .ilike("email", email)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  if (!participant) {
    return NextResponse.json(
      { error: "We couldn't find a certificate matching those details." },
      { status: 404 }
    );
  }

  let previewUrl: string | null = null;
  if (participant.file_path) {
    const { data: signed } = await supabase.storage
      .from(CERTIFICATES_BUCKET)
      .createSignedUrl(participant.file_path, 300);
    previewUrl = signed?.signedUrl ?? null;
  }

  return NextResponse.json({
    participant: {
      name: participant.name,
      email: participant.email,
      uniqueId: participant.unique_id,
      status: participant.status,
      uploadDate: participant.upload_date,
      hasFile: Boolean(participant.file_path),
    },
    previewUrl,
  });
}
