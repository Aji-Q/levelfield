import assert from "node:assert/strict";
import test from "node:test";

import {
  REQUIRED_FLOW_IDS,
  buildBrowserFlows,
  collectActionKinds,
  validateBrowserFlows,
} from "../scripts/browser-flows.mjs";

test("declares the required capture chapters in the recorded order", () => {
  const flows = buildBrowserFlows("http://127.0.0.1:3000");

  assert.deepEqual(
    flows.map((flow) => flow.id),
    REQUIRED_FLOW_IDS,
  );
  assert.doesNotThrow(() => validateBrowserFlows(flows));
});

test("covers real browser actions and assertions for every required outcome", () => {
  const flows = buildBrowserFlows("http://127.0.0.1:3000");
  const kinds = collectActionKinds(flows);

  for (const kind of ["goto", "click", "scroll", "fill", "hover", "assert"]) {
    assert.ok(kinds.has(kind), `missing required action kind: ${kind}`);
  }

  const requiredOutcomes = [
    "Market snapshot",
    "3/100",
    "95/100",
    "Circuit breaker",
    "Assessment result",
    "Evidence quote overlaps instruction-like content",
    "Know who can know before you do.",
  ];
  const assertedTexts = flows.flatMap((flow) =>
    flow.actions
      .filter((action) => action.kind === "assert")
      .map((action) => action.locator.name),
  );

  for (const text of requiredOutcomes) {
    assert.ok(assertedTexts.includes(text), `missing outcome assertion: ${text}`);
  }

  const rejection = flows.find((flow) => flow.id === "instruction-like-rejection");
  assert.equal(rejection.actions.at(-1).kind, "assert");
  assert.equal(rejection.actions.at(-1).locator.name, "Evidence quote overlaps instruction-like content");

  const closing = flows.find((flow) => flow.id === "closing-product");
  assert.ok(closing.minimumSourceDurationMs >= 13_000, "closing source must cover the 12.6s final use");
  assert.ok(closing.actions.some((action) => action.kind === "hover"), "closing must visibly hover the product promise");
  assert.equal(closing.actions.at(-1).locator.name, "Know who can know before you do.");
});

test("uses scoped card selectors when a market appears in both comparison and list sections", () => {
  const flows = buildBrowserFlows("http://127.0.0.1:3000");
  const marketThree = flows.find((flow) => flow.id === "market-three");
  const curated = flows.find((flow) => flow.id === "curated-cb1");

  const threeCard = marketThree.actions.find((action) => action.description === "Open the BTC snapshot market");
  const curatedCard = curated.actions.find((action) => action.description === "Open the curated individual-decision reference");

  assert.match(threeCard.locator.selector, /^#dreamdex-snapshot\s+a\[/);
  assert.match(curatedCard.locator.selector, /^\.comparison-row\s+a\[/);
});

test("scopes opened-dimension evidence assertions instead of matching repeated metadata labels", () => {
  const flows = buildBrowserFlows("http://127.0.0.1:3000");
  for (const flowId of ["market-three", "curated-cb1"]) {
    const flow = flows.find((entry) => entry.id === flowId);
    const evidenceAssertion = flow.actions.find((action) => action.description.endsWith("evidence body is rendered"));
    assert.equal(evidenceAssertion.locator.type, "dimensionBody");
    assert.equal(evidenceAssertion.locator.contains, "D1Outcome Control");
  }
});
