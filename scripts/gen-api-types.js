/**
 * Generates services/api/generated.ts from the backend's OpenAPI spec.
 *
 * The backend Swagger definition is the single source of truth for the API
 * contract; run this whenever the backend openapi.json changes.
 *
 * The OpenAPI spec path comes from the required CALIMALI_OPENAPI env var.
 *
 * Usage: npm run gen:api
 */

const { execFileSync } = require("child_process");
const path = require("path");

// The OpenAPI spec path is configuration — it comes from the environment.
if (!process.env.CALIMALI_OPENAPI) {
  console.error("CALIMALI_OPENAPI is not set.");
  process.exit(1);
}

const SPEC = path.resolve(process.env.CALIMALI_OPENAPI);
const OUT = path.resolve(__dirname, "../services/api/generated.ts");

// Invoke the CLI's JS entry with the current Node binary so this works the same
// on Windows and CI (spawning the .cmd shim directly fails with EINVAL on Windows).
const cli = path.resolve(
  __dirname,
  "../node_modules/openapi-typescript/bin/cli.js",
);

execFileSync(process.execPath, [cli, SPEC, "-o", OUT], { stdio: "inherit" });
console.log(`Generated ${OUT}`);
