// ════════════════════════════════════════════════
// types/index.ts — Definição canônica BraFip
// ════════════════════════════════════════════════

/**
 * 7 critérios de avaliação da Chamada de Ideias.
 * Cada critério tem peso e nota máxima própria.
 * ScoreBruto máximo = soma de todos os maxPoints = 39.
 *
 * O payload do POST /api/avaliacoes envia campos flat:
 * criterio1_inovacao, criterio2_consorcios, ... criterio7_X
 * cada um com valor 0..maxPoints.
 */
export interface CriterioAvaliacao {
  id: number;            // 1..7
  slug: string;          // ex: "inovacao" — usado no payload flat: criterio1_inovacao
  nome: string;          // label exibido no formulário do jurado
  descricao: string;     // instructivo para o jurado
  maxPoints: number;     // nota máxima deste critério
}

export const CRITERIOS_AVALIACAO: CriterioAvaliacao[] = [
  {
    id: 1,
    slug: "inovacao",
    nome: "Inovação",
    descricao: "Grau de originalidade da ideia em relação ao estado da arte da fiscalização preventiva.",
    maxPoints: 7,
  },
  {
    id: 2,
    slug: "consorcios",
    nome: "Consórcios e Parcerias",
    descricao: "Capacidade de articulação intermunicipal e/ou com órgãos de controle.",
    maxPoints: 5,
  },
  {
    id: 3,
    slug: "exequibilidade",
    nome: "Exequibilidade",
    descricao: "Viabilidade técnica, orçamentária e legal de implementação no município.",
    maxPoints: 6,
  },
  {
    id: 4,
    slug: "impacto",
    nome: "Impacto na Fiscalização",
    descricao: "Potencial de melhoria efetiva na arrecadação e no combate à sonegação.",
    maxPoints: 7,
  },
  {
    id: 5,
    slug: "tecnologia",
    nome: "Uso de Tecnologia",
    descricao: "Incorporação de ferramentas digitais, IA ou automação no processo fiscal.",
    maxPoints: 5,
  },
  {
    id: 6,
    slug: "transparencia",
    nome: "Transparência e Comunicação",
    descricao: "Clareza na prestação de contas ao cidadão e abertura de dados.",
    maxPoints: 5,
  },
  {
    id: 7,
    slug: "sustentabilidade",
    nome: "Sustentabilidade do Projeto",
    descricao: "Continuidade da proposta após o ciclo inicial (capacidade institucional).",
    maxPoints: 4,
  },
];

// Validação de runtime: soma dos maxPoints deve ser 39
export const SCORE_MAXIMO_BRUTO = CRITERIOS_AVALIACAO.reduce(
  (soma, c) => soma + c.maxPoints,
  0,
);

// ── Interfaces de domínio ────────────────────────

export interface Inscricao {
  id: string;                  // Firestore doc id
  protocolo: string;           // gerado: CHA-2027-{seq}
  createdAt: string;           // ISO
  status: "pendente" | "aprovada" | "reprovada" | "em_avaliacao";

  // Dados do proponente
  municipio: string;
  uf: string;
  nomeResponsavel: string;
  cargoResponsavel: string;
  emailResponsavel: string;
  telefoneResponsavel: string;

  // Dados do projeto
  tituloProjeto: string;
  categoria: string;            // ex: "Tecnologia", "Gestão", "Controle Social"
  resumo: string;               // abstract 500-1000 chars
  problema: string;
  solucao: string;
  resultadosEsperados: string;

  // Anexos (URLs)
  anexoDocumento?: string;      // URL pública do storage

  // Avaliações vinculadas
  avaliacoesIds?: string[];
  avaliadoPor?: string[];        // uids de jurados que já avaliaram
  scoreBruto?: number;
  scoreNormalizado?: number;    // 0..10
}

export interface Avaliacao {
  id: string;                   // Firestore doc id
  inscricaoId: string;
  juradoId: string;
  juradoNome: string;
  createdAt: string;
  updatedAt: string;

  // Notas por critério (flat, 0..maxPoints cada)
  criterio1_inovacao: number;
  criterio2_consorcios: number;
  criterio3_exequibilidade: number;
  criterio4_impacto: number;
  criterio5_tecnologia: number;
  criterio6_transparencia: number;
  criterio7_sustentabilidade: number;

  // Calculado server-side
  scoreBruto: number;           // 0..39
  scoreNormalizado: number;     // 0..10

  observacoes?: string;
}

export interface Jurado {
  id: string;                   // uid Firebase Auth
  nome: string;
  email: string;
  categoria: string;             // area de especialização
  ativo: boolean;
  createdAt: string;
}

export type PayloadAvaliacao = Omit<
  Avaliacao,
  "id" | "createdAt" | "updatedAt" | "scoreBruto" | "scoreNormalizado" | "juradoNome"
>;

// ── Log de auditoria de avaliações ──────────────
// Toda criação ou correção de avaliação gera um registro aqui,
// para rastrear a qualidade dos julgamentos (ex: quanto um jurado
// muda de nota ao corrigir).
export interface AvaliacaoLog {
  id?: string;                   // Firestore doc id (gerado)
  avaliacaoId: string;           // doc da avaliação afetada
  inscricaoId: string;
  juradoId: string;
  juradoNome: string;
  acao: "criacao" | "correcao";
  antes?: {
    scoreBruto: number;
    scoreNormalizado: number;
    notas: Record<string, number>;
  };
  depois: {
    scoreBruto: number;
    scoreNormalizado: number;
    notas: Record<string, number>;
  };
  diferencaScore: number;        // |depois.scoreBruto - (antes?.scoreBruto ?? 0)|
  createdAt: string;             // ISO
}

// ── Sanity ──────────────────────────────────────

export interface SanityPagina {
  _id: string;
  _type: "pagina";
  slug: { current: string };
  titulo: string;
  conteudo: unknown[];              // Portable Text
  seo?: { title: string; description: string; image?: string };
}

export interface SanityPost {
  _id: string;
  _type: "post";
  slug: { current: string };
  titulo: string;
  excerpt: string;
  body: unknown[];
  publishedAt: string;
  autor?: string;
  capa?: string;
}
