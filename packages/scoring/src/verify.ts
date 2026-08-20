// Pure quote-verification helpers, dependency-free so browser bundles can import
// them (and the engine) without dragging in the Anthropic SDK from classify.ts.

// Whitespace-insensitive substring check: models legitimately collapse newlines
// when quoting, so both sides are normalized before matching.
export function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export function isVerbatimQuote(quote: string, contractText: string): boolean {
  return normalizeWhitespace(contractText).includes(normalizeWhitespace(quote));
}
