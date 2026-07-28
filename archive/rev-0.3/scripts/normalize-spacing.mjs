import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const targets = ["styles.css", "design-system/reference.css"];

const scale = [
  [1, "--semantic-space-optical-1"],
  [2, "--semantic-space-optical-2"],
  [3, "--semantic-space-optical-3"],
  [4, "--semantic-space-1"],
  [8, "--semantic-space-2"],
  [12, "--semantic-space-3"],
  [16, "--semantic-space-4"],
  [24, "--semantic-space-6"],
  [32, "--semantic-space-8"],
  [48, "--semantic-space-12"],
  [64, "--semantic-space-16"],
  [80, "--semantic-space-20"],
  [96, "--semantic-space-24"],
];

function nearestSpace(value) {
  return scale.reduce((best, current) =>
    Math.abs(current[0] - value) < Math.abs(best[0] - value) ? current : best,
  );
}

for (const target of targets) {
  const path = resolve(projectRoot, target);
  const source = await readFile(path, "utf8");
  let replacements = 0;
  const normalized = source.replace(
    /((?:gap|padding(?:-[a-z]+)?|margin(?:-[a-z]+)?)\s*:\s*)([^;{}]+)/gi,
    (declaration, prefix, value) => {
      const nextValue = value.replace(/(?<![-\w])(\d+)px\b/g, (size, rawNumber) => {
        const number = Number.parseInt(rawNumber, 10);
        replacements += 1;
        return `var(${nearestSpace(number)[1]})`;
      });
      return `${prefix}${nextValue}`;
    },
  );
  await writeFile(path, normalized, "utf8");
  console.log(`${target}: normalized ${replacements} spacing values`);
}
