# LevelField hackathon demo — source brief

## Audience and format

This is a 2–3 minute English submission video for judges of the Somnia × DreamDEX Event
Contracts Hackathon. It must communicate the problem, the product, a working demonstration,
the technical trust model, DreamDEX/Somnia integration, and the future vision. Every product
number and state must trace to real LevelField UI, terminal output, DreamDEX data, Somnia data, or
a repository artifact. Designed scenes may explain those facts; AI imagery must not fabricate
product UI, market data, test output, or on-chain evidence.

## Product thesis

Prediction markets show a price, but price does not reveal who may know an outcome early. Two
otherwise comparable contracts can have radically different information structures. A
crypto opening-price binary is produced by a global market and disclosed continuously. A contract
about one person's private decision may be controlled by the same person who can trade before any
public announcement.

LevelField is a pre-trade structural information-asymmetry assessment layer. It asks: who produces
the outcome, how many people know early, whether they can trade, how disclosure happens, and
whether anyone can manufacture the outcome. It does not predict outcomes, allege wrongdoing, or
detect live insider activity.

## Demonstration path

The current preview uses the timestamped DreamDEX Shannon score snapshot generated at
2026-08-20 02:25:38 UTC and compares a price binary at 3/100 with a curated individual-decision
contract at 95/100. The price binary is low risk because no participant controls
the global reference price and disclosure is effectively simultaneous. The individual-decision case
trips circuit breaker CB-1 because one person controls the outcome and has no clear trading
restriction.

The market detail page exposes the five dimension levels, the exact evidence quotes, reasoning,
caveats, typed DreamDEX market metadata, and chain provenance. The assessment workspace also lets
someone bring any contract, classify it with a model they already use, and return the JSON to a
local verifier.

## Trust model and technical proof

Stage A maps contract terms or typed market fields to a public five-dimension anchor library. Every
non-null evidence quote must be a verbatim substring. A code scanner independently rejects
instruction-like text addressed to automated assessors. Missing information never guesses low; it
defaults conservatively to level four.

Stage B is deterministic code. It applies fixed weights, cross-dimension rules, and circuit breakers.
No model generates the numeric score. The MCP demo connects to the real LevelField server over
stdio, retrieves two markets, and applies one visible policy: proceed on low or moderate risk;
decline on elevated or high risk.

The release target republishes each current score to ScoreRegistry on Somnia Shannon with score,
band, five dimension levels, method hash, timestamp, and an immutable source URI. The verifier
reads every field back and fails closed on missing or mismatched provenance.

## Evidence and ecosystem value

The repository has 69 passing unit and integration tests plus eight passing Forge tests. Sixteen
curated contracts span a 3-to-95 risk spectrum with category medians in the expected order and a
Spearman rho of 0.93. The official DreamDEX SDK is exercised as an independent discovery
cross-check, and the required feedback deliverable contains eleven evidence-backed SDK and
documentation findings.

LevelField's opportunity is not to replace DreamDEX. It is to become the explainable pre-trade risk
layer that agents, venues, and traders can call as DreamDEX expands beyond today's price binaries.
