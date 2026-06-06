import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenant_id");
  const status = searchParams.get("status");
  const severity = searchParams.get("severity");

  let query = supabase.from("patches").select("*").order("created_at", { ascending: false });
  if (tenantId) query = query.eq("tenant_id", tenantId);
  if (status) query = query.eq("status", status);
  if (severity) query = query.eq("severity", severity);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();
  const { data, error } = await supabase.from("patches").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
