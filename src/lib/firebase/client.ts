// ════════════════════════════════════════════════
// lib/firebase/client.ts — Firebase Client SDK
// ════════════════════════════════════════════════
//
// Usado no browser (login do jurado, dashboard admin).
// NUNCA gravar dados via client SDK — sempre via /api/*.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// firebase/firestore expõe tipos via firebase/app; import dinâmico para evitar
// problema de declaração de tipos do subpath ESM
import { getFirestore as getClientFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const firebaseDb = getClientFirestore(app);
export default app;
