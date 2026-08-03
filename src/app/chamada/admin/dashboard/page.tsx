import Link from "next/link";
import { Trophy, FileText, BarChart3 } from "lucide-react";
import { getFirestore } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Inscricao } from "@/types/index";

export const dynamic = "force-dynamic";

async function getInscricoes() {
  const db = getFirestore();
  const snap = await db
    .collection("inscricoes")
    .orderBy("scoreBruto", "desc")
    .limit(100)
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Inscricao);
}

export default async function AdminDashboardPage() {
  // Em produção, validar role === "admin" aqui
  // Por ora apenas verifica que está autenticado
  const inscricoes = await getInscricoes();
  const total = inscricoes.length;
  const avaliadas = inscricoes.filter((i) => i.scoreBruto != null).length;
  const pendentes = total - avaliadas;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl">Dashboard Admin</h1>
      <p className="mt-2 text-muted-foreground">
        Visão geral da Chamada de Ideias 2027.
      </p>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <FileText className="h-6 w-6 text-brand-accent" />
          <p className="mt-3 text-3xl font-bold">{total}</p>
          <p className="text-sm text-muted-foreground">Total de inscrições</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <BarChart3 className="h-6 w-6 text-brand-accent" />
          <p className="mt-3 text-3xl font-bold">{avaliadas}</p>
          <p className="text-sm text-muted-foreground">Avaliadas</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <Trophy className="h-6 w-6 text-brand-accent" />
          <p className="mt-3 text-3xl font-bold">{pendentes}</p>
          <p className="text-sm text-muted-foreground">Pendentes</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="mt-10 overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Protocolo</th>
              <th className="px-4 py-3 text-left font-medium">Projeto</th>
              <th className="px-4 py-3 text-left font-medium">Município</th>
              <th className="px-4 py-3 text-left font-medium">Categoria</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {inscricoes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  Nenhuma inscrição ainda.
                </td>
              </tr>
            ) : (
              inscricoes.map((insc) => (
                <tr key={insc.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono">{insc.protocolo}</td>
                  <td className="px-4 py-3">{insc.tituloProjeto}</td>
                  <td className="px-4 py-3">{insc.municipio}/{insc.uf}</td>
                  <td className="px-4 py-3">{insc.categoria}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={insc.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {insc.scoreNormalizado != null ? (
                      <span className="font-semibold">
                        {insc.scoreNormalizado.toFixed(1)}/10
                      </span>
                    ) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pendente: "bg-yellow-100 text-yellow-800",
    em_avaliacao: "bg-blue-100 text-blue-800",
    aprovada: "bg-green-100 text-green-800",
    reprovada: "bg-red-100 text-red-800",
  };
  return (
    <span className={`rounded-full px-2 py-1 text-xs ${colors[status] ?? ""}`}>
      {status.replace("_", " ")}
    </span>
  );
}
