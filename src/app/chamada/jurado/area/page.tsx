"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import Link from "next/link";
import { Loader2, LogOut, ClipboardList, Pencil, CheckCircle2 } from "lucide-react";
import type { Inscricao } from "@/types/index";

export default function JuradoAreaPage() {
  const [loading, setLoading] = useState(true);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [meuUid, setMeuUid] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        window.location.href = "/chamada/jurado/login";
        return;
      }
      setMeuUid(user.uid);

      try {
        const token = await user.getIdToken();
        // Busca inscrições pendentes/em avaliação
        const res = await fetch("/api/inscricoes?status=pendente,em_avaliacao", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setInscricoes(data.inscricoes ?? []);
        }
      } catch {
        setErro("Não foi possível carregar as inscrições.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  async function handleLogout() {
    await signOut(getFirebaseAuth());
    document.cookie = "__session=; path=/; max-age=0";
    window.location.href = "/chamada/jurado/login";
  }

  // Separar por estado de avaliação deste jurado
  const pendentes = inscricoes.filter(
    (i) => !i.avaliadoPor || !i.avaliadoPor.includes(meuUid ?? ""),
  );
  const avaliadas = inscricoes.filter(
    (i) => i.avaliadoPor && i.avaliadoPor.includes(meuUid ?? ""),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Minhas Avaliações</h1>
          <p className="mt-2 text-muted-foreground">
            Separei em pendentes e já avaliadas. Você pode corrigir suas avaliações
            a qualquer momento — todo ajuste fica registrado para auditoria.
          </p>
        </div>
        <button onClick={handleLogout} className="btn-secondary">
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </button>
      </div>

      {erro && (
        <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {erro}
        </div>
      )}

      {/* Seção 1: Pendentes */}
      <Section
        titulo="Ideias Pendentes"
        icone={<ClipboardList className="mr-2 h-5 w-5" />}
        inscricoes={pendentes}
        vazio="Nenhuma ideia pendente no momento."
        corrigir={false}
      />

      {/* Seção 2: Avaliadas */}
      <div className="mt-12">
        <Section
          titulo="Ideias Avaliadas"
          icone={<CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />}
          inscricoes={avaliadas}
          vazio="Você ainda não avaliou nenhuma ideia."
          corrigir={true}
        />
      </div>
    </div>
  );
}

function Section({
  titulo,
  icone,
  inscricoes,
  vazio,
  corrigir,
}: {
  titulo: string;
  icone: React.ReactNode;
  inscricoes: Inscricao[];
  vazio: string;
  corrigir: boolean;
}) {
  return (
    <section>
      <h2 className="mb-4 flex items-center text-xl font-semibold">
        {icone}
        {titulo}
        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-sm text-muted-foreground">
          {inscricoes.length}
        </span>
      </h2>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Protocolo</th>
              <th className="px-4 py-3 text-left font-medium">Projeto</th>
              <th className="px-4 py-3 text-left font-medium">Município</th>
              <th className="px-4 py-3 text-left font-medium">Categoria</th>
              <th className="px-4 py-3 text-left font-medium">Score</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {inscricoes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  <ClipboardList className="mx-auto h-12 w-12 opacity-40" />
                  <p className="mt-4">{vazio}</p>
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
                    {insc.scoreNormalizado != null
                      ? `${insc.scoreNormalizado.toFixed(1)}/10`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/chamada/jurado/avaliacao/${insc.id}`}
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      {corrigir ? (
                        <><Pencil className="mr-1 h-3 w-3" /> Corrigir</>
                      ) : (
                        "Avaliar →"
                      )}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
