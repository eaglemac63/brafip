// ════════════════════════════════════════════════
// lib/sanity/client.ts — Sanity client (read-only, server-side)
// ════════════════════════════════════════════════

import { createClient } from "next-sanity";

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01",
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: true,   // CDN para conteúdo published
  perspective: "published",
});
