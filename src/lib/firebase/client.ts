// ════════════════════════════════════════════════
// lib/firebase/client.ts — Firebase Client SDK
// ════════════════════════════════════════════════
//
// Usado no browser (login do jurado, dashboard admin).
// NUNCA gravar dados via client SDK — sempre via /api/*.
//
// IMPORTANTE: o init é DEFERIDO para o browser (não module-scope).
// No build/SSR o Next prerenderiza as páginas client — se inicializássemos
// aqui, o Firebase tentaria ler NEXT_PUBLIC_FIREBASE_API_KEY vazio e quebraria
// o build com "auth/invalid-api-key". Por isso usamos getFirebaseAuth() após mount.

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore as getClientFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

/**
 * Retorna a instância do Auth. SÓ deve ser chamado no browser (após mount).
 * Inicializa o app na primeira chamada.
 */
export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseAuth() só pode ser chamado no browser");
  }
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  if (!auth) {
    auth = getAuth(app);
  }
  return auth;
}

/**
 * Retorna a instância do Firestore client. SÓ no browser.
 */
export function getFirebaseDb(): Firestore {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseDb() só pode ser chamado no browser");
  }
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  if (!db) {
    db = getClientFirestore(app);
  }
  return db;
}
