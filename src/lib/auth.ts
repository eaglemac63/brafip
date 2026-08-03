// ════════════════════════════════════════════════
// lib/auth.ts — Verificação de sessão (server-side)
// ════════════════════════════════════════════════
//
// Usado em Route Handlers e middleware para validar o cookie de sessão
// Firebase do jurado/admin. Retorna { uid, email } ou null.

import { getAuth } from "@/lib/firebase/admin";
import type { NextRequest } from "next/server";

export interface SessionUser {
  uid: string;
  email: string | null;
  role: "jurado" | "admin" | null;
}

/**
 * Verifica o cookie `__session` (idToken Firebase) num Route Handler.
 */
export async function verifySession(
  cookies: NextRequest["cookies"] | Record<string, string>,
): Promise<SessionUser | null> {
  const token =
    typeof (cookies as any).get === "function"
      ? (cookies as any).get("__session")?.value
      : (cookies as Record<string, string>)["__session"];

  if (!token) return null;

  try {
    const decoded = await getAuth().verifyIdToken(token);

    // Claims custom: role definida via setCustomUserClaims no admin
    const role = (decoded.role as SessionUser["role"]) ?? null;

    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      role,
    };
  } catch {
    return null;
  }
}
