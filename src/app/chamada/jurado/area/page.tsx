"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import Link from "next/link";
import { Loader2, LogOut, ClipboardList } from "lucide-react";
import type { Inscricao } from "@/types/index";

export default function JuradoAreaPage() {
  const [loading, setLoading] = useState(true);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        window.location.href = "/chamada/jurado/login";
        return;
      }

      try {
        const token = await user.getIdToken();
        // Busca inscrições pendentes/em avaliação para o jurado
        // (num cenário real, filtrar por categoria do jurado)
        const res = await fetch("/api/inscricoes?status=pendente,em_avaliacao", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setInscricoes(data.inscricoes ?? []);
        }
      } catch (err) {
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
          <h1 className="text-3xl">Inscrições para avaliar</h1>
          <p className="mt-2 text-muted-foreground">
            Selecione uma inscrição para iniciar a avaliação pelos 7 critérios.
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

      <div className="mt-8 overflow-hidden rounded-lg border bg-white">
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
                  <p className="mt-4">Nenhuma inscrição disponível para avaliação.</p>
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
                      className="text-primary hover:underline"
                    >
                      Avaliar →
                    </Link>
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
