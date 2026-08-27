import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient, CERTIFICATES_BUCKET } from "@/lib/supabase/admin";

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  let { data, error } = await supabase
    .from("participants")
    .select("id, name, email, unique_id, status, upload_date, file_path, wants_more_sessions, requested_topics")
    .order("upload_date", { ascending: false });

  // If column error occurs (e.g. schema not yet altered in Supabase DB), fallback to base columns
  if (error) {
    const fallback = await supabase
      .from("participants")
      .select("id, name, email, unique_id, status, upload_date, file_path")
      .order("upload_date", { ascending: false });
    
    if (fallback.error) {
      return NextResponse.json({ error: fallback.error.message }, { status: 500 });
    }
    data = fallback.data;
  }

  return NextResponse.json({ participants: data });
}


export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const name = (formData.get("name") as string || "").trim();
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const uniqueId = (formData.get("uniqueId") as string || "").trim();
  const file = formData.get("file") as File | null;

  if (!name || !email || !uniqueId) {
    return NextResponse.json({ error: "Name, email, and Unique ID are required." }, { status: 400 });
  }
  if (file && file.type !== "application/pdf") {
    return NextResponse.json({ error: "Certificate file must be a PDF." }, { status: 400 });
  }

  const supabase = createAdminClient();
  let filePath: string | null = null;

  if (file) {
    const year = new Date().getFullYear();
    filePath = `${year}/${uniqueId}-${Date.now()}.pdf`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(CERTIFICATES_BUCKET)
      .upload(filePath, arrayBuffer, { contentType: "application/pdf", upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }
  }

  const { data, error } = await supabase
    .from("participants")
    .insert({ name, email, unique_id: uniqueId, file_path: filePath, status: "pending" })
    .select("id, name, email, unique_id, status, upload_date, file_path, wants_more_sessions, requested_topics")
    .single();


  if (error) {
    return NextResponse.json(
      { error: error.code === "23505" ? "That Unique ID is already in use." : error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ participant: data }, { status: 201 });
}
