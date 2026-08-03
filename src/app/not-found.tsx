export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-serif">404</h1>
        <p className="mt-4 text-muted-foreground">Página não encontrada</p>
        <a href="/" className="btn-primary mt-8">Voltar ao início</a>
      </div>
    </main>
  );
}
