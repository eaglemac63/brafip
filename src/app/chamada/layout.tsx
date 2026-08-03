// Layout compartilhado da plataforma /chamada
// Navegação simplificada para focar no fluxo de inscrição/avaliação.

import Link from "next/link";

export default function ChamadaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-white">
        <div className="container-brafip flex h-16 items-center justify-between">
          <Link href="/" className="font-serif text-lg font-semibold">
            BraFip · Chamada 2027
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/chamada" className="text-muted-foreground hover:text-foreground">
              Sobre
            </Link>
            <Link href="/chamada/inscricao" className="text-muted-foreground hover:text-foreground">
              Inscrição
            </Link>
            <Link href="/chamada/jurado/login" className="text-muted-foreground hover:text-foreground">
              Área do Jurado
            </Link>
          </nav>
        </div>
      </header>
      <div className="container-brafip py-12">{children}</div>
    </div>
  );
}
