import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient, CERTIFICATES_BUCKET } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const patch: Record<string, unknown> = {};
  if (body?.status && ["pending", "downloaded"].includes(body.status)) {
    patch.status = body.status;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("participants")
    .update(patch)
    .eq("id", params.id)
    .select("id, name, email, unique_id, status, upload_date, file_path")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ participant: data });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("participants")
    .select("file_path")
    .eq("id", params.id)
    .maybeSingle();

  if (existing?.file_path) {
    await supabase.storage.from(CERTIFICATES_BUCKET).remove([existing.file_path]);
  }

  const { error } = await supabase.from("participants").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
