// ════════════════════════════════════════════════
// app/api/inscricao/route.ts — POST cria inscrição
// ════════════════════════════════════════════════
//
// Fluxo: valida payload → grava Firestore → envia email Resend →
//        (opcional) append Google Sheets → retorna protocolo.
// maxDuration 60s para tolerar Resend + Sheets no Hobbyist.

import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebase/admin";
import { Resend } from "resend";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface InscricaoPayload {
  municipio: string;
  uf: string;
  nomeResponsavel: string;
  cargoResponsavel: string;
  emailResponsavel: string;
  telefoneResponsavel: string;
  tituloProjeto: string;
  categoria: string;
  resumo: string;
  problema: string;
  solucao: string;
  resultadosEsperados: string;
  anexoDocumento?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InscricaoPayload;

    // ── Validação mínima ──
    const camposObrigatorios: (keyof InscricaoPayload)[] = [
      "municipio", "uf", "nomeResponsavel", "emailResponsavel",
      "tituloProjeto", "categoria", "resumo", "problema", "solucao",
      "resultadosEsperados",
    ];
    for (const campo of camposObrigatorios) {
      if (!body[campo] || String(body[campo]).trim().length === 0) {
        return NextResponse.json(
          { error: `Campo obrigatório ausente: ${campo}` },
          { status: 400 },
        );
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.emailResponsavel)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 },
      );
    }

    // ── Gera protocolo sequencial ──
    const db = getFirestore();
    const counterRef = db.collection("_counters").doc("inscricoes");
    const protocoloDoc = await db.runTransaction(async (tx) => {
      const snap = await tx.get(counterRef);
      const seq = (snap.exists ? snap.data()?.seq ?? 0 : 0) + 1;
      tx.set(counterRef, { seq }, { merge: true });
      return seq;
    });
    const protocolo = `CHA-2027-${String(protocoloDoc).padStart(4, "0")}`;

    // ── Grava Firestore ──
    const now = new Date().toISOString();
    const inscricaoRef = await db.collection("inscricoes").add({
      protocolo,
      createdAt: now,
      status: "pendente",
      ...body,
      avaliacoesIds: [],
    });

    // ── Email de confirmação (best-effort, não bloqueia) ──
    try {
      const resend = new Resend(process.env.RESEND_API_KEY!);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: body.emailResponsavel,
        reply_to: process.env.RESEND_REPLY_TO,
        subject: `Inscrição recebida — Chamada de Ideias BraFip 2027 — ${protocolo}`,
        html: `
          <h2>Inscrição confirmada</h2>
          <p>Protocolo: <strong>${protocolo}</strong></p>
          <p>Município: ${body.municipio}/${body.uf}</p>
          <p>Projeto: ${body.tituloProjeto}</p>
          <p>Responsável: ${body.nomeResponsavel}</p>
          <hr>
          <p>Sua inscrição foi recebida e será avaliada pela banca de jurados.</p>
          <p>Você receberá o resultado por email.</p>
        `,
      });
    } catch (emailErr) {
      console.error("[inscricao] Falha Resend (não bloqueante):", emailErr);
    }

    return NextResponse.json(
      { protocolo, id: inscricaoRef.id, status: "pendente" },
      { status: 201 },
    );
  } catch (err) {
    console.error("[inscricao] Erro:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar inscrição" },
      { status: 500 },
    );
  }
}
