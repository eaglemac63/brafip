// ════════════════════════════════════════════════
// middleware.ts — Proteção de rotas /chamada/admin e /chamada/jurado
// ════════════════════════════════════════════════
//
// Roda na Edge (grátis no Hobbyist).
// Verifica o cookie __session Firebase e redireciona para login se ausente.
// Validar o token completo no middleware seria caro (precisa Admin SDK),
// então aqui só checamos presença — validação real acontece nos
// Route Handlers (/api/avaliacoes) e nos Server Components.

import { NextResponse, type NextRequest } from "next/server";

const ROTAS_PROTEGIDAS = [
  "/chamada/admin",
  "/chamada/jurado/area",
  "/chamada/jurado/avaliacao",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtegida = ROTAS_PROTEGIDAS.some((rota) =>
    pathname.startsWith(rota),
  );

  if (!isProtegida) return NextResponse.next();

  const session = request.cookies.get("__session")?.value;

  if (!session) {
    const isJurado = pathname.startsWith("/chamada/jurado");
    const loginUrl = new URL(
      isJurado ? "/chamada/jurado/login" : "/chamada/admin/login",
      request.url,
    );
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/chamada/admin/:path*",
    "/chamada/jurado/area/:path*",
    "/chamada/jurado/avaliacao/:path*",
  ],
};
