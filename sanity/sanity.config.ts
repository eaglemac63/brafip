// ════════════════════════════════════════════════
// sanity/sanity.config.ts — Sanity Studio config
// ════════════════════════════════════════════════
//
// Roda local: npm run sanity:dev
// Deploy:      npm run sanity:deploy

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "brafip-studio",
  title: "BraFip CMS",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
