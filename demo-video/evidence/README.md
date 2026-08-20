# Demo evidence pickups

- `agent-demo.txt` is a captured run of `npm run demo:agent`. It proves the
  MCP stdio connection and fixed PROCEED/DECLINE policy; it does not submit an
  order.
- `npm run validate` reproduces `n=16` and Spearman `ρ = 0.930` in
  `docs/validation.md`.
- `npx tsx scripts/agreement.ts` reproduces 16/16 reference-band agreement
  across three blind runs in `docs/agreement.md`.
- `npm test` and `cd contracts && forge test -vv` reproduce 69 software and
  eight smart-contract tests.
- `npm run sdk:crosscheck` independently compares read-only active-market
  discovery against the official DreamDEX SDK without a private key.

The checked-in score cache is a timestamped snapshot, not a live-market claim.
Refresh it and repeat the pickups against the final public commit before the
submission recording.
