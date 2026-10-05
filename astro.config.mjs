import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

function stripHtmlComments() {
  return (tree) => {
    const strip = (node) => {
      if (!node.children) return;
      node.children = node.children.filter(
        (child) => !(child.type === "html" && /^<!--[\s\S]*-->$/.test(child.value.trim())),
      );
      node.children.forEach(strip);
    };
    strip(tree);
  };
}

export default defineConfig({
  site: "https://dramaid.app",
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "id",
        locales: { id: "id-ID", en: "en-US" },
      },
    }),
  ],
  i18n: {
    defaultLocale: "id",
    locales: ["id", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    remarkPlugins: [stripHtmlComments],
  },
});
