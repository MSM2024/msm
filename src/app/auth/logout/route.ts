import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

async function handle(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  await supabase.auth.signOut();

  if (user?.id) {
    await writeAuditLog({
      actorId: user.id,
      action: "user.logout",
      entity: "profile",
      entityId: user.id
    });
  }

  return NextResponse.redirect(new URL("/auth/login", request.url));
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
