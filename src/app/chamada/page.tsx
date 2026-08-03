import Link from "next/link";
import { ArrowRight, FileText, Scale, Trophy } from "lucide-react";

export default function ChamadaPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-4xl">Chamada de Ideias 2027</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        A 4ª edição da Chamada de Ideias BraFip selecionia projetos inovadores
        em fiscalização preventiva municipal. Municípios e consórcios podem
        inscrever propostas em três categorias.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <FileText className="h-8 w-8 text-brand-accent" />
          <h3 className="mt-4 text-lg">Tecnologia</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Projetos de automação, IA e dados aplicados à fiscalização.
          </p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <Scale className="h-8 w-8 text-brand-accent" />
          <h3 className="mt-4 text-lg">Gestão</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Modelos de gestão, capacitação e articulação intermunicipal.
          </p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <Trophy className="h-8 w-8 text-brand-accent" />
          <h3 className="mt-4 text-lg">Controle Social</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Transparência, participação cidadã e prestação de contas.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-lg bg-primary p-8 text-white">
        <h2 className="text-2xl">Pronto para inscrever?</h2>
        <p className="mt-2 text-white/80">
          O formulário leva aproximadamente 15 minutos. Tenha em mãos os dados
          do responsável e do projeto.
        </p>
        <Link href="/chamada/inscricao" className="btn-primary mt-6 bg-brand-accent text-primary">
          Iniciar inscrição
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
