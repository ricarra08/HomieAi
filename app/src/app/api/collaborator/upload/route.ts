import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const ALLOWED_EXTENSIONS = new Set([".pdf", ".jpg", ".jpeg", ".png", ".webp"]);

// Simple in-memory rate limiter per token (resets on server restart)
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 10; // max uploads per window per token
const uploadAttempts = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(token: string): boolean {
  const now = Date.now();
  const entry = uploadAttempts.get(token);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    uploadAttempts.set(token, { count: 1, windowStart: now });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

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

  // Rate limit per token
  if (isRateLimited(token)) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      { status: 429 }
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
      { status: 413 }
    );
  }

  // Validate file type by MIME type and extension
  const ext = ("." + (file.name.split(".").pop() ?? "")).toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(file.type) || !ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: PDF, JPEG, PNG, WebP" },
      { status: 415 }
    );
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
  }).then(async (res) => {
    if (!res.ok) {
      console.error(`[collaborator-upload] Document processing failed for ${doc.id}: ${res.status}`);
      // Mark document as failed so the UI reflects the error
      await supabase
        .from("documents")
        .update({ status: "failed" })
        .eq("id", doc.id);
    }
  }).catch(async (err) => {
    console.error(`[collaborator-upload] Document processing request failed for ${doc.id}:`, err);
    await supabase
      .from("documents")
      .update({ status: "failed" })
      .eq("id", doc.id);
  });

  return NextResponse.json({ success: true, documentId: doc.id, fileName: file.name });
}
