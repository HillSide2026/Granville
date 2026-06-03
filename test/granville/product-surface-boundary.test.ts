import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = process.cwd();
const portalSrc = path.join(repoRoot, "apps/portal/src");

function sourceFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) return sourceFiles(full);
    if (!/\.(ts|tsx)$/.test(entry)) return [];
    if (entry === "routeTree.gen.ts") return [];
    return [full];
  });
}

test("product surface boundary: customer portal does not depend on admin APIs", () => {
  const offenders = sourceFiles(portalSrc).flatMap((file) => {
    const text = readFileSync(file, "utf8");
    const relative = path.relative(repoRoot, file);
    if (relative === "apps/portal/src/lib/api.ts") return [];
    return text.includes("/admin") ? [relative] : [];
  });

  assert.deepEqual(offenders, []);
});

test("product surface boundary: customer portal does not import ops-ui or admin API clients", () => {
  const forbiddenPatterns = [
    /from\s+['"][^'"]*apps\/ops-ui/,
    /from\s+['"][^'"]*admin-api/,
    /import\s+['"][^'"]*apps\/ops-ui/,
    /import\s+['"][^'"]*admin-api/,
  ];

  const offenders = sourceFiles(portalSrc).flatMap((file) => {
    const text = readFileSync(file, "utf8");
    return forbiddenPatterns.some((pattern) => pattern.test(text))
      ? [path.relative(repoRoot, file)]
      : [];
  });

  assert.deepEqual(offenders, []);
});

test("product surface boundary: internal approval and compliance implementations live outside portal", () => {
  assert.equal(
    existsSync(path.join(portalSrc, "features/approvals/index.tsx")),
    false,
    "operator approval implementation must not live in apps/portal",
  );
  assert.equal(
    existsSync(path.join(portalSrc, "features/compliance/index.tsx")),
    false,
    "compliance/audit implementation must not live in apps/portal",
  );
});
