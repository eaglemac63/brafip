// ════════════════════════════════════════════════
// app/api/inscricoes/route.ts — GET lista inscrições (jurado/admin)
// ════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await verifySession(request.cookies);
  if (!user || (user.role !== "jurado" && user.role !== "admin")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status");
  const db = getFirestore();

  let query = db.collection("inscricoes").orderBy("createdAt", "desc");
  if (status) {
    const statuses = status.split(",");
    query = query.where("status", "in", statuses) as any;
  }

  const snap = await query.limit(100).get();
  const inscricoes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json({ inscricoes });
}
