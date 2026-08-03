"use client";

// ════════════════════════════════════════════════
// app/chamada/jurado/avaliacao/[id]/page.tsx
// ════════════════════════════════════════════════
//
// ⚠️ REFATORAÇÃO CRÍTICA — conforme plano:
//   • NÃO grava mais no Firestore via client SDK
//   • Renderiza os 7 critérios dinamicamente a partir de CRITERIOS_AVALIACAO
//   • handleSave faz POST /api/avaliacoes com payload flat
//   • Score calculado server-side (39 pts bruto → 10 normalizado)
//
// Payload enviado:
//   { inscricaoId, criterio1_inovacao, criterio2_consorcios,
//     criterio3_exequibilidade, criterio4_impacto,
//     criterio5_tecnologia, criterio6_transparencia,
//     criterio7_sustentabilidade, observacoes }

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { CRITERIOS_AVALIACAO } from "@/types/index";
import type { Inscricao } from "@/types/index";
import { CheckCircle, Loader2, Save, AlertCircle } from "lucide-react";

export default function AvaliacaoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const inscricaoId = params.id;

  const [inscricao, setInscricao] = useState<Inscricao | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  // Notas locais: { criterioN_slug: number }
  const [notas, setNotas] = useState<Record<string, number>>({});
  const [observacoes, setObservacoes] = useState("");

  // ── Carregar inscrição ──
  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        router.push("/chamada/jurado/login?redirect=/chamada/jurado/avaliacao/" + inscricaoId);
        return;
      }

      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/inscricoes/${inscricaoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setInscricao(data.inscricao);
        } else {
          setErro("Inscrição não encontrada.");
        }
      } catch {
        setErro("Erro ao carregar inscrição.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [inscricaoId, router]);

  // ── Inicializar notas com 0 ──
  useEffect(() => {
    const iniciais: Record<string, number> = {};
    for (const c of CRITERIOS_AVALIACAO) {
      iniciais[`criterio${c.id}_${c.slug}`] = 0;
    }
    setNotas(iniciais);
  }, []);

  // ── handleSave: POST /api/avaliacoes ──
  async function handleSave() {
    setSalvando(true);
    setErro("");

    try {
      const user = firebaseAuth.currentUser;
      if (!user) throw new Error("Sessão expirada");

      const token = await user.getIdToken();

      const payload = {
        inscricaoId,
        ...notas,
        observacoes: observacoes || undefined,
      };

      const res = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar avaliação");
      }

      const data = await res.json();
      setSucesso(true);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border bg-white p-8 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
        <h1 className="mt-6 text-2xl">Avaliação salva!</h1>
        <p className="mt-4 text-muted-foreground">
          Sua avaliação foi registrada e o score foi calculado.
        </p>
        <button onClick={() => router.push("/chamada/jurado/area")} className="btn-primary mt-8">
          Voltar à lista
        </button>
      </div>
    );
  }

  if (!inscricao) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border bg-white p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <p className="mt-4 text-muted-foreground">{erro || "Inscrição não encontrada."}</p>
      </div>
    );
  }

  // Soma bruta para preview (NÃO é o score oficial — o server recalcula)
  const brutoPreview = Object.values(notas).reduce((s, v) => s + (Number(v) || 0), 0);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl">Avaliação</h1>

      {/* Dados da inscrição */}
      <div className="mt-6 rounded-lg border bg-white p-6">
        <p className="font-mono text-sm text-muted-foreground">{inscricao.protocolo}</p>
        <h2 className="mt-2 text-xl">{inscricao.tituloProjeto}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {inscricao.municipio}/{inscricao.uf} · {inscricao.categoria}
        </p>
        <div className="mt-4 space-y-2 text-sm">
          <p><strong>Resumo:</strong> {inscricao.resumo}</p>
          <p><strong>Problema:</strong> {inscricao.problema}</p>
          <p><strong>Solução:</strong> {inscricao.solucao}</p>
          <p><strong>Resultados esperados:</strong> {inscricao.resultadosEsperados}</p>
        </div>
      </div>

      {/* Critérios dinâmicos */}
      <div className="mt-8 rounded-lg border bg-white p-6">
        <h2 className="text-xl">Critérios de Avaliação</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Atribua uma nota de 0 ao máximo de cada critério. Score total máximo: 39.
        </p>

        <div className="mt-6 space-y-8">
          {CRITERIOS_AVALIACAO.map((criterio) => {
            const key = `criterio${criterio.id}_${criterio.slug}`;
            const valor = notas[key] ?? 0;

            return (
              <div key={criterio.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg">
                    {criterio.id}. {criterio.nome}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    Máx: {criterio.maxPoints} pts
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{criterio.descricao}</p>
                <div className="mt-3 flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={criterio.maxPoints}
                    step={0.5}
                    value={valor}
                    onChange={(e) =>
                      setNotas((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                    }
                    className="flex-1 accent-primary"
                  />
                  <span className="w-12 text-right text-lg font-semibold">
                    {valor.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Observações */}
        <div className="mt-8">
          <label className="block text-sm font-medium">Observações (opcional)</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Preview do score */}
        <div className="mt-6 flex items-center justify-between rounded-md bg-muted/50 p-4">
          <span className="text-sm text-muted-foreground">Score bruto (preview):</span>
          <span className="text-2xl font-bold">{brutoPreview.toFixed(1)} / 39</span>
        </div>
      </div>

      {erro && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {erro}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={salvando}
        className="btn-primary mt-6 w-full disabled:opacity-50"
      >
        {salvando ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
        ) : (
          <><Save className="mr-2 h-4 w-4" /> Salvar avaliação</>
        )}
      </button>
    </div>
  );
}
