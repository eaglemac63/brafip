import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-brand to-primary py-24 text-white">
        <div className="container-brafip">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-brand-accent/20 px-4 py-1 text-sm font-medium text-brand-accent ring-1 ring-brand-accent/30">
              Chamada de Ideias 2027 · Inscrições abertas
            </span>
            <h1 className="mt-6 text-5xl leading-tight md:text-6xl">
              Fiscalização preventiva que transforma municípios
            </h1>
            <p className="mt-6 text-lg text-white/80">
              A BraFip reúne municípios, órgãos de controle e cidadãos em torno
              de soluções inovadoras para a fiscalização tributária municipal.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/chamada/inscricao" className="btn-primary bg-brand-accent text-primary hover:bg-brand-accent/90">
                Inscrever projeto
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/chamada" className="btn-secondary bg-white/10 text-white hover:bg-white/20">
                Conhecer a Chamada 2027
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20">
        <div className="container-brafip">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <h2 className="text-2xl">Quem somos</h2>
              <p className="mt-4 text-muted-foreground">
                A BraFip é a referência nacional em fiscalização preventiva
                municipal, articulando câmaras municipais, tribunais de contas
                e sociedade civil.
              </p>
            </div>
            <div>
              <h2 className="text-2xl">O que fazemos</h2>
              <p className="mt-4 text-muted-foreground">
                Capacitamos fiscais municipais, promovemos a troca de
                experiências entre cidades e incentivamos projetos inovadores
                por meio da Chamada de Ideias.
              </p>
            </div>
            <div>
              <h2 className="text-2xl">Chamada 2027</h2>
              <p className="mt-4 text-muted-foreground">
                A 4ª edição da Chamada de Ideias premia projetos inovadores de
                fiscalização preventiva. Inscrições abertas para municípios e
                consórcios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container-brafip flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>BraFip — Associação Brasileira de Fiscalização Preventiva</p>
          <div className="flex gap-6">
            <Link href="/blog">Blog</Link>
            <Link href="/portfolio">Portfólio</Link>
            <Link href="/chamada">Chamada de Ideias</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
