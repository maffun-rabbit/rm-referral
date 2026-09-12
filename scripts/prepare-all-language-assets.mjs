import { spawnSync } from "node:child_process";

for (const locale of ["vi", "en", "zh", "ko", "pt"]) {
  const result = spawnSync(process.execPath, ["scripts/prepare-language-assets.mjs", locale], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
