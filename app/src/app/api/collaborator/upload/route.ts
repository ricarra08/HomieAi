import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();

  const formData = await request.formData();
  const token = formData.get("token") as string | null;
  const file = formData.get("file") as File | null;

  if (!token || !file) {
    return NextResponse.json({ error: "Token and file are required" }, { status: 400 });
  }

  const { data: link, error: linkError } = await supabase
    .from("collaborator_links")
    .select("*")
    .eq("link_token", token)
    .single();

  if (linkError || !link) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }

  if (link.status === "revoked") {
    return NextResponse.json({ error: "This link has been revoked" }, { status: 410 });
  }

  if (new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: "This link has expired" }, { status: 410 });
  }

  const dealId = link.deal_id;
  const filePath = `${dealId}/${crypto.randomUUID()}/${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("deal-documents")
    .upload(filePath, buffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }

  const { data: doc, error: insertError } = await supabase
    .from("documents")
    .insert({
      deal_id: dealId,
      name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      status: "uploaded",
      source_type: "collaborator-upload",
    })
    .select()
    .single();

  if (insertError || !doc) {
    return NextResponse.json({ error: "Failed to create document record" }, { status: 500 });
  }

  await supabase
    .from("collaborator_links")
    .update({ uploads_received: (link.uploads_received ?? 0) + 1 })
    .eq("id", link.id);

  const origin = request.headers.get("origin") ?? request.nextUrl.origin;
  fetch(`${origin}/api/documents/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentId: doc.id }),
  }).catch(() => {});

  return NextResponse.json({ success: true, documentId: doc.id, fileName: file.name });
}
