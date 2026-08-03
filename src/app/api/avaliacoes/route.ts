// ════════════════════════════════════════════════
// app/api/avaliacoes/route.ts — POST salva avaliação do jurado
// ════════════════════════════════════════════════
//
// ⚠️  Refatoração crítica: o jurado NÃO grava mais no Firestore client-side.
// Esta rota valida a sessão, extrai as notas do payload flat, calcula
// scoreBruto e scoreNormalizado server-side, e persiste.
//
// UPSERT: um jurado só pode ter UMA avaliação por inscrição. Se já avaliou,
// atualiza (não cria duplicata).
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

    // ── 7. UPSERT: buscar avaliação existente deste jurado para esta inscrição ──
    const db = getFirestore();
    const avaliacoesSnap = await db
      .collection("avaliacoes")
      .where("inscricaoId", "==", inscricaoId)
      .where("juradoId", "==", user.uid)
      .limit(1)
      .get();

    const now = new Date().toISOString();
    let avaliacaoRef;
    let acao: "criacao" | "correcao" = "criacao";
    let antes: { scoreBruto: number; scoreNormalizado: number; notas: Record<string, number> } | undefined;

    if (!avaliacoesSnap.empty) {
      // Atualiza a avaliação existente (não cria duplicata)
      acao = "correcao";
      const existente = avaliacoesSnap.docs[0].data() as Record<string, number> & {
        scoreBruto: number;
        scoreNormalizado: number;
      };
      antes = {
        scoreBruto: existente.scoreBruto,
        scoreNormalizado: existente.scoreNormalizado,
        notas: { ...notas }, // placeholder; preenche abaixo com valores reais
      };
      // captura notas reais do documento existente
      for (const c of CRITERIOS_AVALIACAO) {
        const key = `criterio${c.id}_${c.slug}`;
        antes.notas[key] = (existente[key] as number) ?? 0;
      }

      avaliacaoRef = avaliacoesSnap.docs[0].ref;
      await avaliacaoRef.update({
        ...notas,
        scoreBruto,
        scoreNormalizado,
        observacoes: body.observacoes ?? null,
        updatedAt: now,
      });
    } else {
      // Cria nova avaliação
      avaliacaoRef = await db.collection("avaliacoes").add({
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
    }

    // ── 7b. Gravar log de auditoria (rastreia qualidade dos julgamentos) ──
    const depois = { scoreBruto, scoreNormalizado, notas: { ...notas } };
    const diferencaScore = Math.abs(
      scoreBruto - (antes?.scoreBruto ?? 0),
    );
    await db.collection("avaliacoes_log").add({
      avaliacaoId: avaliacaoRef.id,
      inscricaoId,
      juradoId: user.uid,
      juradoNome,
      acao,
      antes,
      depois,
      diferencaScore,
      createdAt: now,
    });

    // ── 8. Vincular à inscrição e recalcular score médio ──
    await db.runTransaction(async (tx) => {
      const inscRef = db.collection("inscricoes").doc(inscricaoId);
      const inscSnap = await tx.get(inscRef);
      if (!inscSnap.exists) throw new Error("Inscrição não encontrada");

      const data = inscSnap.data()!;
      const avaliacoesIds: string[] = data.avaliacoesIds ?? [];
      if (!avaliacoesIds.includes(avaliacaoRef.id)) {
        avaliacoesIds.push(avaliacaoRef.id);
      }

      // Marca que este jurado já avaliou (para esconder da lista)
      const avaliadoPor: string[] = data.avaliadoPor ?? [];
      if (!avaliadoPor.includes(user.uid)) {
        avaliadoPor.push(user.uid);
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
      const mediaNormalizada = scores.length ? (mediaBruto / 39) * 10 : 0;

      // Status: se todos os jurados avaliaram, marca como concluída
      tx.update(inscRef, {
        avaliacoesIds,
        avaliadoPor,
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
        atualizado: !avaliacoesSnap.empty,
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    console.error("[avaliacoes] Erro:", err);
    const message =
      err instanceof Error ? err.message : "Erro interno ao salvar avaliação";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── GET: lista avaliações de uma inscrição (admin/dashboard/jurado) ──
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

  const avaliacoes = snap.docs.map((d: { id: string; data: () => Record<string, unknown> }) => ({
    id: d.id,
    ...d.data(),
  }));
  return NextResponse.json({ avaliacoes });
}
