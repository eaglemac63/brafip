// ════════════════════════════════════════════════
// lib/score.ts — Cálculo de ScoreBraFip (Chamada de Ideias 2027)
// ════════════════════════════════════════════════
//
// ScoreBruto = soma das notas dos 7 critérios (máx 39).
// ScoreNormalizado = (scoreBruto / SCORE_MAXIMO_BRUTO) * 10  →  0..10
//
// NUNCA calcular no client — sempre no /api/avaliacoes (server-side).

import { CRITERIOS_AVALIACAO, SCORE_MAXIMO_BRUTO } from "@/types/index";

/**
 * Calcula o score bruto somando os 7 critérios do payload flat.
 * Valida que cada critério não excede maxPoints.
 * Lança erro se houver overflow (jurado adulterando client-side).
 */
export function calcularScoreBruto(notas: Record<string, number>): number {
  let bruto = 0;

  for (const criterio of CRITERIOS_AVALIACAO) {
    const key = `criterio${criterio.id}_${criterio.slug}`;
    const valor = notas[key];

    if (typeof valor !== "number" || Number.isNaN(valor)) {
      throw new Error(`Critério ausente ou inválido: ${key}`);
    }

    if (valor < 0 || valor > criterio.maxPoints) {
      throw new Error(
        `Critério ${key} excede o máximo permitido (${criterio.maxPoints}). Recebido: ${valor}`,
      );
    }

    bruto += valor;
  }

  return bruto;
}

/**
 * Normaliza o score bruto (0..39) para a base 0..10.
 * Arredonda para 2 casas decimais.
 */
export function normalizarScore(scoreBruto: number): number {
  if (scoreBruto < 0 || scoreBruto > SCORE_MAXIMO_BRUTO) {
    throw new Error(
      `Score bruto fora do intervalo: ${scoreBruto} (esperado 0..${SCORE_MAXIMO_BRUTO})`,
    );
  }

  const normalizado = (scoreBruto / SCORE_MAXIMO_BRUTO) * 10;
  return Math.round(normalizado * 100) / 100;
}

/**
 * Helper: extrai do payload apenas as chaves de critérios (criterioN_slug).
 * Descarta campos extras que não pertencem ao score.
 */
export function extrairNotasDoPayload(
  payload: Record<string, unknown>,
): Record<string, number> {
  const notas: Record<string, number> = {};

  for (const criterio of CRITERIOS_AVALIACAO) {
    const key = `criterio${criterio.id}_${criterio.slug}`;
    notas[key] = Number(payload[key]);
  }

  return notas;
}
