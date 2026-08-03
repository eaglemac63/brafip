import { defineType, defineField } from "sanity";

export const post = defineType({
  name: "post",
  title: "Post do Blog",
  type: "document",
  fields: [
    defineField({
      name: "titulo",
      title: "Título",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "titulo" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Resumo",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "body",
      title: "Conteúdo",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "autor",
      title: "Autor",
      type: "string",
    }),
    defineField({
      name: "capa",
      title: "Capa (URL)",
      type: "url",
    }),
    defineField({
      name: "publishedAt",
      title: "Data de Publicação",
      type: "datetime",
      validation: (r) => r.required(),
    }),
  ],
});
