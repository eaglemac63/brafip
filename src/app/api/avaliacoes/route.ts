// ════════════════════════════════════════════════
// app/api/avaliacoes/route.ts — POST salva avaliação do jurado
// ════════════════════════════════════════════════
//
// ⚠️  Refatoração crítica: o jurado NÃO grava mais no Firestore client-side.
// Esta rota valida a sessão, extrai as notas do payload flat, calcula
// scoreBruto e scoreNormalizado server-side, e persiste.
//
// Payload esperado:
//   { inscricaoId, criterio1_inovacao, criterio2_consorcios, ...,
//     criterio7_sustentabilidade, observacoes? }

import { NextRequest, NextResponse } from "next/server";
import { getFirestore, getAuth } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth";
import {
  calcularScoreBruto,
  normalizarScore,
  extrairNotasDoPayload,
} from "@/lib/score";
import { CRITERIOS_AVALIACAO } from "@/types/index";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // ── 1. Autenticação ──
  const user = await verifySession(request.cookies);
  if (!user || user.role !== "jurado") {
    return NextResponse.json(
      { error: "Não autorizado — sessão de jurado inválida" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    // ── 2. Validar inscricaoId ──
    const inscricaoId: string | undefined = body.inscricaoId;
    if (!inscricaoId) {
      return NextResponse.json(
        { error: "inscricaoId é obrigatório" },
        { status: 400 },
      );
    }

    // ── 3. Extrair notas do payload (só os critérios canônicos) ──
    const notas = extrairNotasDoPayload(body);

    // ── 4. Validar que TODOS os 7 critérios chegaram ──
    for (const criterio of CRITERIOS_AVALIACAO) {
      const key = `criterio${criterio.id}_${criterio.slug}`;
      if (!(key in notas) || Number.isNaN(notas[key])) {
        return NextResponse.json(
          { error: `Critério ausente: ${key}` },
          { status: 400 },
        );
      }
    }

    // ── 5. Calcular scores server-side (NUNCA confiar no client) ──
    const scoreBruto = calcularScoreBruto(notas);
    const scoreNormalizado = normalizarScore(scoreBruto);

    // ── 6. Buscar nome do jurado ──
    const auth = getAuth();
    const juradoRecord = await auth.getUser(user.uid);
    const juradoNome = juradoRecord.displayName || juradoRecord.email || "Jurado";

    // ── 7. Persistir avaliação ──
    const db = getFirestore();
    const now = new Date().toISOString();

    const avaliacaoRef = await db.collection("avaliacoes").add({
      inscricaoId,
      juradoId: user.uid,
      juradoNome,
      createdAt: now,
      updatedAt: now,
      ...notas,
      scoreBruto,
      scoreNormalizado,
      observacoes: body.observacoes ?? null,
    });

    // ── 8. Vincular avaliação à inscrição e atualizar score médio ──
    await db.runTransaction(async (tx) => {
      const inscRef = db.collection("inscricoes").doc(inscricaoId);
      const inscSnap = await tx.get(inscRef);
      if (!inscSnap.exists) throw new Error("Inscrição não encontrada");

      const data = inscSnap.data()!;
      const avaliacoesIds: string[] = data.avaliacoesIds ?? [];
      if (!avaliacoesIds.includes(avaliacaoRef.id)) {
        avaliacoesIds.push(avaliacaoRef.id);
      }

      // Recalcular score médio da inscrição
      const allAvals = await Promise.all(
        avaliacoesIds.map((id) => tx.get(db.collection("avaliacoes").doc(id))),
      );
      const scores = allAvals
        .filter((s) => s.exists)
        .map((s) => s.data()!.scoreBruto as number);
      const mediaBruto = scores.length
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;
      const mediaNormalizada = scores.length
        ? (mediaBruto / 39) * 10
        : 0;

      tx.update(inscRef, {
        avaliacoesIds,
        status: "em_avaliacao",
        scoreBruto: Math.round(mediaBruto * 100) / 100,
        scoreNormalizado: Math.round(mediaNormalizada * 100) / 100,
      });
    });

    return NextResponse.json(
      {
        id: avaliacaoRef.id,
        inscricaoId,
        scoreBruto,
        scoreNormalizado,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("[avaliacoes] Erro:", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro interno ao salvar avaliação" },
      { status: 500 },
    );
  }
}

// ── GET: lista avaliações de uma inscrição (admin/dashboard) ──
export async function GET(request: NextRequest) {
  const user = await verifySession(request.cookies);
  if (!user || (user.role !== "jurado" && user.role !== "admin")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const inscricaoId = request.nextUrl.searchParams.get("inscricaoId");
  if (!inscricaoId) {
    return NextResponse.json(
      { error: "inscricaoId é obrigatório" },
      { status: 400 },
    );
  }

  const db = getFirestore();
  const snap = await db
    .collection("avaliacoes")
    .where("inscricaoId", "==", inscricaoId)
    .get();

  const avaliacoes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ avaliacoes });
}
