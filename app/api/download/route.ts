import { NextResponse } from "next/server";
import { createAdminClient, CERTIFICATES_BUCKET } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";


export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const uniqueId = (body?.uniqueId ?? "").trim();
  const email = (body?.email ?? "").trim().toLowerCase();

  if (!uniqueId || !email) {
    return NextResponse.json({ error: "Missing verification details." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Re-verify server-side rather than trusting whatever the client cached
  // from /api/verify — this is the only path that can produce a download.
  const { data: participant, error } = await supabase
    .from("participants")
    .select("id, name, unique_id, file_path")
    .eq("unique_id", uniqueId)
    .ilike("email", email)
    .maybeSingle();

  if (error || !participant) {
    return NextResponse.json({ error: "Verification failed." }, { status: 404 });
  }

  if (!participant.file_path) {
    return NextResponse.json(
      { error: "Your certificate hasn't been uploaded yet." },
      { status: 409 }
    );
  }

  const filename = `${participant.name.replace(/\s+/g, "_")}_Certificate.pdf`;

  const { data: signed, error: signError } = await supabase.storage
    .from(CERTIFICATES_BUCKET)
    .createSignedUrl(participant.file_path, 60, { download: filename });

  if (signError || !signed) {
    return NextResponse.json({ error: "Couldn't prepare the file. Try again." }, { status: 500 });
  }

  await supabase
    .from("participants")
    .update({ status: "downloaded", downloaded_at: new Date().toISOString() })
    .eq("id", participant.id);

  return NextResponse.json({ url: signed.signedUrl, filename });
}
