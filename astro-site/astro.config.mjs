import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://mnp-navi.jp",
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
});
