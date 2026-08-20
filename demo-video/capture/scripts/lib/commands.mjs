/**
 * Fixed, non-interactive capture configuration.
 *
 * These helpers deliberately expose no generic command runner. The terminal
 * recorder can only invoke the checked-in `npm run demo:agent` demo command.
 */

export const TERMINAL_DEMO_COMMAND = Object.freeze({
  executable: "npm",
  args: Object.freeze(["run", "demo:agent"]),
  display: "npm run demo:agent",
  shell: false,
});

const fixedCommand = (id, executable, args, cwd, display) => Object.freeze({
  id,
  executable,
  args: Object.freeze(args),
  cwd,
  display,
  shell: false,
});

/**
 * The capture UI exposes aliases, never a command field. Each alias expands to
 * a finite argv-only sequence that the stage executes with `shell: false`.
 */
export const CAPTURE_ALIASES = Object.freeze({
  "mcp-policy": Object.freeze({
    id: "mcp-policy",
    minimumDurationSeconds: 25,
    outputFile: "mcp-policy.webm",
    commands: Object.freeze([
      fixedCommand("agent-demo", "npm", ["run", "demo:agent"], "repo", "npm run demo:agent"),
    ]),
  }),
  evidence: Object.freeze({
    id: "evidence",
    minimumDurationSeconds: 25,
    outputFile: "evidence-cli.webm",
    commands: Object.freeze([
      fixedCommand("validate", "npm", ["run", "validate"], "repo", "npm run validate"),
      fixedCommand("agreement", "npx", ["tsx", "scripts/agreement.ts"], "repo", "npx tsx scripts/agreement.ts"),
      fixedCommand("npm-test", "npm", ["test"], "repo", "npm test"),
      fixedCommand("forge-test", "forge", ["test", "-vv"], "contracts", "cd contracts && forge test -vv"),
      fixedCommand("sdk-crosscheck", "npm", ["run", "sdk:crosscheck"], "repo", "npm run sdk:crosscheck"),
    ]),
  }),
});

export function getCaptureAlias(alias) {
  return typeof alias === "string" ? CAPTURE_ALIASES[alias] ?? null : null;
}

export const CAPTURE_COPY = Object.freeze({
  noOrderSubmitted: "No order submitted — assessment only.",
  sourceVerified: "Source verified.",
});

export const EXPLORER_EXPECTATIONS = Object.freeze({
  verifiedExactText: "Contract source code verified (exact match)",
  requiredText: Object.freeze([
    "ScoreRegistry",
    "0xb8e11dea346F2c961880879606A269db3165BBc7",
    "Contract source code verified (exact match)",
  ]),
});

const REQUIRED_DEMO_EVIDENCE = Object.freeze({
  stdio: /Connected to the LevelField MCP server over stdio/,
  snapshot: /DreamDEX score snapshot/,
  score3: /score:\s+3\/100 \(low\)/,
  score95: /score:\s+95\/100 \(high\)/,
  proceed: /decision:\s+PROCEED \(3\/100 low\)/,
  decline: /decision:\s+DECLINE \(95\/100 high,/,
  cb1: /CB-1:/,
});

/**
 * Fail closed when a real demo run does not contain every promised visible
 * behaviour. Returned flags are persisted with the capture metadata.
 */
export function assertDemoTranscript(transcript) {
  const text = String(transcript);
  const result = Object.fromEntries(
    Object.entries(REQUIRED_DEMO_EVIDENCE).map(([name, pattern]) => [name, pattern.test(text)]),
  );
  const missing = Object.entries(result)
    .filter(([, present]) => !present)
    .map(([name]) => name);
  if (missing.length > 0) {
    throw new Error(`Missing required demo evidence: ${missing.join(", ")}`);
  }
  return result;
}

/**
 * The child receives only execution essentials, never the desktop process's
 * credentials, tokens, API keys, or shell customisation.
 */
export function buildSafeStageEnvironment(source = process.env) {
  return {
    PATH: source.PATH ?? "",
    CI: "1",
    FORCE_COLOR: "0",
    NO_COLOR: "1",
    npm_config_update_notifier: "false",
  };
}

/**
 * Artifacts are shareable evidence, so paths and known secret values never
 * appear in transcript/log files even if a dependency unexpectedly emits them.
 */
export function sanitizeArtifactText(value, secretValues = []) {
  let text = String(value)
    // A filesystem path starts at whitespace/punctuation; URL slashes do not.
    // Keep external URLs readable while preventing a stage workspace or desktop
    // path from leaking into a shareable terminal transcript.
    .replace(/(?:file:\/\/)?(?:(?<=^)|(?<=[\s=(\[\{"']))\/(?!\/)[^\s\]})"']+/gm, "[redacted-path]")
    .replace(/(?:[A-Za-z]:)?\\(?:[^\\\s]+\\)+[^\\\s]*/g, "[redacted-path]");
  for (const secret of secretValues) {
    if (typeof secret === "string" && secret.length > 0) {
      text = text.split(secret).join("[redacted]");
    }
  }
  return text;
}
