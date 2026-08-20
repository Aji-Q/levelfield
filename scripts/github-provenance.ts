/**
 * Shared construction and validation for the GitHub blob URI committed to every
 * ScoreRegistry attestation. Publishing and verification must use this same
 * implementation: otherwise a passing read-back could validate a different
 * provenance location from the one a publisher wrote.
 */

export const DEFAULT_GITHUB_REF = "main";

const SAFE_GITHUB_REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
// Permit normal branch/tag paths and commit SHAs, but only URL-path-safe segments.
// In particular, reject empty, dot-prefixed, and traversal-like segments.
const SAFE_GITHUB_REF = /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?(?:\/[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?)*$/;
const SAFE_MARKET_ID = /^[A-Za-z0-9_-]+$/;

export interface GitHubProvenance {
  repo: string;
  ref: string;
}

export function resolveGitHubProvenance(
  env: Record<string, string | undefined> = process.env,
): GitHubProvenance {
  const repo = env.GITHUB_REPO?.trim();
  if (!repo || !SAFE_GITHUB_REPO.test(repo) || /placeholder/i.test(repo)) {
    throw new Error(
      "GITHUB_REPO=owner/repo is required to build attestation provenance URIs. " +
        "Refusing to write or verify LEVELFIELD_REPO_PLACEHOLDER URLs.",
    );
  }

  const ref = env.GITHUB_REF?.trim() || DEFAULT_GITHUB_REF;
  const hasUnsafeSegment = ref.split("/").some((segment) => segment.endsWith(".lock"));
  if (ref.length > 255 || ref.includes("..") || hasUnsafeSegment || !SAFE_GITHUB_REF.test(ref)) {
    throw new Error(
      "GITHUB_REF must be a safe branch, tag, or commit SHA (URL-path-safe slash-separated segments; no '..' or '.lock'); " +
        `received ${JSON.stringify(ref)}. For release attestations, use an immutable commit SHA.`,
    );
  }

  return { repo, ref };
}

export function githubScoreUri(provenance: GitHubProvenance, marketId: string): string {
  if (!SAFE_MARKET_ID.test(marketId)) {
    throw new Error(`Cannot create an attestation URI for unsafe marketId ${JSON.stringify(marketId)}.`);
  }
  return `https://github.com/${provenance.repo}/blob/${provenance.ref}/data/scores/${marketId}.json`;
}
