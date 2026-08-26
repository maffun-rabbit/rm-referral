import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://rm-referral.maffun.workers.dev",
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
});
