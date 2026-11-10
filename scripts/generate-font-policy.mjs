import { writeFile } from "node:fs/promises";
await writeFile(new URL("../design-system/fonts.generated.css", import.meta.url), "/** Public typography uses installed system fonts and explicit CJK fallbacks.\n * Regenerate with node scripts/generate-font-policy.mjs. No font binaries are distributed.\n */\n");
console.log("Generated public system-font policy");
