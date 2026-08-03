// ════════════════════════════════════════════════
// lib/firebase/admin.ts — Firebase Admin SDK (singleton)
// ════════════════════════════════════════════════
//
// Usado APENAS em Route Handlers (server-side).
// Inicializa uma única vez — reutiliza em cold starts.
// A service account vem inteira num único env var (JSON serializado).

import admin, { ServiceAccount } from "firebase-admin";

let app: admin.app.App | null = null;

function getServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON não definido. " +
        "Configure no .env.local (ou no Vercel) o JSON da service account.",
    );
  }
  try {
    return JSON.parse(raw) as ServiceAccount;
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON inválido — esperado JSON válido.",
    );
  }
}

export function getFirebaseAdmin(): admin.app.App {
  if (app) return app;

  const serviceAccount = getServiceAccount();

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return app;
}

// Acessores convenientes (lazy)
export function getFirestore() {
  return getFirebaseAdmin().firestore();
}

export function getAuth() {
  return getFirebaseAdmin().auth();
}
