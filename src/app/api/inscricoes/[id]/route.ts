// ════════════════════════════════════════════════
// app/api/inscricoes/[id]/route.ts — GET inscrição por id (jurado)
// ════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await verifySession(request.cookies);
  if (!user || (user.role !== "jurado" && user.role !== "admin")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const db = getFirestore();
  const snap = await db.collection("inscricoes").doc(id).get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Inscrição não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ inscricao: { id: snap.id, ...snap.data() } });
}
