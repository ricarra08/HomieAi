import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: link, error } = await supabase
    .from("collaborator_links")
    .select("id, deal_id, recipient_role, requested_documents, expires_at, status, uploads_received")
    .eq("link_token", token)
    .single();

  if (error || !link) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }

  if (link.status === "revoked") {
    return NextResponse.json({ error: "This link has been revoked" }, { status: 410 });
  }

  if (new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: "This link has expired" }, { status: 410 });
  }

  const { data: transaction } = await supabase
    .from("transactions")
    .select("property_address")
    .eq("id", link.deal_id)
    .single();

  return NextResponse.json({
    valid: true,
    recipientRole: link.recipient_role,
    requestedDocuments: link.requested_documents,
    propertyAddress: transaction?.property_address ?? "Property",
    uploadsReceived: link.uploads_received,
  });
}
