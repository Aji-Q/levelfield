# LevelField demo narration · v2

Source of truth: `film/src/script-v2.json` (the film builds beats, captions,
and the sidecar SRT from that file — edit it there, not here).

Design intent vs v1: same 21-beat structure and verified facts, rewritten for
delivery — a belief-vs-knowledge hook, a single-variable experiment frame
("change nothing but the event"), tighter cadence, and a closing callback to
the tagline. All truth gates hold: DreamDEX examples are a timestamped
snapshot; 3 and 95 come from separate sources; the MCP demo submits no order;
provenance completion stays future-tense; ρ=0.930, 69+8 tests, 16 contracts,
11 SDK findings are the audited numbers.

Voice (final pass): ElevenLabs **Brian** (`nPczCjzI2devNBz1zQrb`),
`eleven_multilingual_v2`, stability 0.45 / similarity 0.75 / style 0.25,
generated once per beat via the with-timestamps endpoint (char alignment
drives frame-accurate captions). Interim renders use macOS `say` Daniel for
timing only.

| # | Beat | Line |
|---|------|------|
| 0 | cold open | A price tells you what the crowd believes. It doesn't tell you who could already know. |
| 1 | logo | LevelField is a pre-trade risk layer for DreamDEX event contracts. Before a trader or an agent takes a side, it measures the field itself: structural information asymmetry. |
| 2 | 0→3 | Start with a real DreamDEX price binary, captured on Somnia Shannon. LevelField scores it three out of one hundred. Low risk. |
| 3 | evidence | Bitcoin's closing price answers to no one. The outcome is public, global, and disclosed to everyone at almost the same instant. |
| 4 | match cut | Now change nothing but the event. This curated reference contract settles on one person's private decision. |
| 5 | 3→95 | Same engine, same rules. Ninety-five out of one hundred. High risk. |
| 6 | breaker | One person controls the outcome, and no clear rule stops an early knower from trading on it. A circuit breaker floors this score at high risk. |
| 7 | split | That gap, three to ninety-five, is the product. LevelField explains who can know first — never which side will win. |
| 8 | scope | No accusations. No live surveillance. Just structure, read honestly. |
| 9 | anchors | Underneath sits a public anchor library: five dimensions, from outcome control to outcome manufacturability. A model classifies each one against those anchors. |
| 10 | rejection | Every evidence quote must match the contract word for word. Text that tries to talk to the assessor is caught by code and disqualified. |
| 11 | default | And when information is missing, the engine refuses to guess low. Unknown defaults to level four. |
| 12 | engine | Then deterministic code takes over — fixed weights, cross-dimension rules, circuit breakers. The model never writes the number. Code does. |
| 13 | MCP | Here, an agent calls the real LevelField MCP server over standard input and output, before it acts. |
| 14 | policy | The policy fits in one line: low and moderate proceed. Elevated and high decline. |
| 15 | verdicts | The DreamDEX binary returns PROCEED at three. The individual-decision case returns DECLINE at ninety-five, with the reason attached. |
| 16 | chain | After a provenance-complete republish, every current score will live on Somnia Shannon — its band, five dimension levels, method hash, timestamp, and an immutable source record. |
| 17 | readback | A verifier reads every field back, and fails closed on anything missing or changed. |
| 18 | validation | Across sixteen curated contracts, scores span three to ninety-five, and category risk rises in exactly the expected order — a Spearman rho of point nine three. |
| 19 | tests | Sixty-nine software tests and eight smart-contract tests pass. The official DreamDEX SDK independently cross-checks active-market discovery — read-only, no private key required. |
| 20 | close | Building this surfaced eleven evidence-backed SDK and documentation findings. As event contracts grow beyond price, one question decides who keeps their edge. Know who can know — before you do. |

v1 remains in `script.md` for the archived composed master.
