# BraFip — Monorepo

Site institucional BraFip + Plataforma Chamada de Ideias 2027, unificados sob `brafip.org.br`.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| CMS | Sanity v3 |
| Banco de dados | Firebase Firestore (client + Admin SDK) |
| Email | Resend |
| Planilhas | Google Sheets API (opcional) |
| Estilo | Tailwind CSS + shadcn/ui |
| Fontes | EB Garamond (serif) + Inter (sans) |
| Deploy | Vercel Hobbyist |

## Estrutura

```
src/
├── app/
│   ├── (site)/            # Site institucional — /, /blog, /portfolio
│   ├── chamada/           # Plataforma Chamada de Ideias 2027
│   │   ├── inscricao/     # Formulário público
│   │   ├── admin/         # Dashboard admin (protegido)
│   │   └── jurado/        # Login + avaliação (protegido)
│   └── api/               # Route Handlers (serverless)
│       ├── inscricao/     # POST inscrição
│       └── avaliacoes/   # POST avaliação do jurado
├── components/            # UI compartilhada (shadcn/ui)
├── lib/
│   ├── firebase/          # admin.ts (singleton) + client.ts
│   ├── sanity/            # client + fetch helpers
│   └── score.ts           # Cálculo ScoreBruto / ScoreNormalizado
├── sanity/               # Studio (schemas, plugins, config)
├── types/index.ts         # CRITERIOS_AVALIACAO + interfaces canônicas
└── middleware.ts          # Protege /chamada/admin e /chamada/jurado
```

## Rotas

| URL | Descrição | Proteção |
|---|---|---|
| `/` | Landing page institucional | Pública |
| `/blog`, `/portfolio` | CMS Sanity | Pública |
| `/chamada/inscricao` | Formulário de inscrição | Pública |
| `/chamada/jurado/login` | Login do jurado | Pública |
| `/chamada/jurado/area` | Área do jurado | **Middleware** |
| `/chamada/jurado/avaliacao/[id]` | Avaliação de inscrição | **Middleware** |
| `/chamada/admin/dashboard` | Dashboard admin | **Middleware** |
| `/api/inscricao` | Cria inscrição + email | Pública |
| `/api/avaliacoes` | Salva avaliação + score | Auth verificada |

## Setup local

```bash
npm install
cp .env.local.example .env.local   # preencher as chaves
npm run dev                         # http://localhost:3000
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (testa dependências circulares) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run sanity:dev` | Sanity Studio local |
| `npm run sanity:deploy` | Deploy do Sanity Studio |

## Avaliação — Critérios

7 critérios canônicos definidos em `src/types/index.ts` (`CRITERIOS_AVALIACAO`).
Score bruto máximo: **39 pontos**. Normalização para base 10 em `src/lib/score.ts`.
