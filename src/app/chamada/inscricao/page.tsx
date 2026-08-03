"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, Send } from "lucide-react";

const CATEGORIAS = ["Tecnologia", "Gestão", "Controle Social"];
const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function InscricaoPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "enviando" | "ok" | "erro">("idle");
  const [protocolo, setProtocolo] = useState<string>("");
  const [erro, setErro] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("enviando");
    setErro("");

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries()) as Record<string, string>;

    try {
      const res = await fetch("/api/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao enviar inscrição");
      }

      const data = await res.json();
      setProtocolo(data.protocolo);
      setStatus("ok");
    } catch (err: any) {
      setErro(err.message);
      setStatus("erro");
    }
  }

  if (status === "ok") {
    return (
      <div className="mx-auto max-w-xl rounded-lg border bg-white p-8 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
        <h1 className="mt-6 text-2xl">Inscrição confirmada!</h1>
        <p className="mt-4 text-muted-foreground">
          Seu protocolo é:
        </p>
        <p className="text-2xl font-mono font-bold text-primary">{protocolo}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          Guarde este número. Você receberá um email de confirmação e será
          notificado do resultado pela banca de jurados.
        </p>
        <button onClick={() => router.push("/chamada")} className="btn-primary mt-8">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl">Formulário de Inscrição</h1>
      <p className="mt-2 text-muted-foreground">
        Preencha todos os campos. Campos com * são obrigatórios.
      </p>

      {erro && (
        <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Responsável */}
        <fieldset className="space-y-4 rounded-lg border bg-white p-6">
          <legend className="px-2 text-sm font-medium text-muted-foreground">Responsável</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo *" name="nomeResponsavel" required />
            <Field label="Cargo" name="cargoResponsavel" />
            <Field label="Email *" name="emailResponsavel" type="email" required />
            <Field label="Telefone" name="telefoneResponsavel" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Município *" name="municipio" required />
            <div>
              <label className="block text-sm font-medium">UF *</label>
              <select name="uf" required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Projeto */}
        <fieldset className="space-y-4 rounded-lg border bg-white p-6">
          <legend className="px-2 text-sm font-medium text-muted-foreground">Projeto</legend>
          <Field label="Título do projeto *" name="tituloProjeto" required />
          <div>
            <label className="block text-sm font-medium">Categoria *</label>
            <select name="categoria" required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <TextArea label="Resumo (500-1000 caracteres) *" name="resumo" required maxLength={1000} />
          <TextArea label="Problema que aborda *" name="problema" required />
          <TextArea label="Solução proposta *" name="solucao" required />
          <TextArea label="Resultados esperados *" name="resultadosEsperados" required />
        </fieldset>

        <button
          type="submit"
          disabled={status === "enviando"}
          className="btn-primary w-full disabled:opacity-50"
        >
          {status === "enviando" ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
          ) : (
            <><Send className="mr-2 h-4 w-4" /> Enviar inscrição</>
          )}
        </button>
      </form>
    </div>
  );
}

function Field({ label, name, type = "text", required }: {
  label: string; name: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}

function TextArea({ label, name, required, maxLength }: {
  label: string; name: string; required?: boolean; maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <textarea
        name={name}
        required={required}
        maxLength={maxLength}
        rows={4}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}
