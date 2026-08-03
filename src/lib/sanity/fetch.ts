// ════════════════════════════════════════════════
// lib/sanity/fetch.ts — Helpers de fetch (GROQ)
// ════════════════════════════════════════════════

import { sanityClient } from "./client";
import type { SanityPost, SanityPagina } from "@/types/index";

export async function getPagina(slug: string): Promise<SanityPagina | null> {
  return sanityClient.fetch(
    `*[_type == "pagina" && slug.current == $slug][0]{
      _id, _type, slug, titulo, conteudo, seo
    }`,
    { slug },
  );
}

export async function getPosts(limit = 10): Promise<SanityPost[]> {
  return sanityClient.fetch(
    `*[_type == "post"] | order(publishedAt desc) [0...$limit]{
      _id, _type, slug, titulo, excerpt, publishedAt, autor, capa
    }`,
    { limit },
  );
}

export async function getPost(slug: string): Promise<SanityPost | null> {
  return sanityClient.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
      _id, _type, slug, titulo, excerpt, body, publishedAt, autor, capa
    }`,
    { slug },
  );
}
