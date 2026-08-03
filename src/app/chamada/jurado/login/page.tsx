"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { Loader2, LogIn } from "lucide-react";

export default function JuradoLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/chamada/jurado/area";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [status, setStatus] = useState<"idle" | "entrando" | "erro">("idle");
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("entrando");
    setErro("");

    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, senha);
      const token = await cred.user.getIdToken();

      // O cookie __session é lido pelo middleware e pelos Route Handlers.
      // Em produção, o Firebase Admin SDK session cookie é o ideal;
      // aqui usamos o idToken como cookie de sessão (suficiente para Hobbyist).
      document.cookie = `__session=${token}; path=/; max-age=${60 * 60}; samesite=lax`;

      router.push(redirect);
    } catch (err: unknown) {
      setErro("Email ou senha inválidos.");
      setStatus("erro");
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl">Área do Jurado</h1>
      <p className="mt-2 text-muted-foreground">
        Use suas credenciais para acessar o painel de avaliação.
      </p>

      {erro && (
        <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-lg border bg-white p-6">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={status === "entrando"}
          className="btn-primary w-full disabled:opacity-50"
        >
          {status === "entrando" ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...</>
          ) : (
            <><LogIn className="mr-2 h-4 w-4" /> Entrar</>
          )}
        </button>
      </form>
    </div>
  );
}
