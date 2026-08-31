# ScoreRegistry

An on-chain registry of LevelField risk attestations, deployed to **Somnia Shannon testnet**
(chain id `50312`, RPC `https://dream-rpc.somnia.network`, explorer
`https://shannon-explorer.somnia.network`).

## Why this exists

LevelField's score cache (`data/scores/`) already answers "how structurally risky is this
market" from contract text alone, with no trading data and no LLM API dependency (see
[docs/design/no-api.md](../docs/design/no-api.md)). That cache lives in a git repo — useful for
a demo, but invisible to anything that isn't LevelField's own web app.

`ScoreRegistry` publishes the same scores as an **on-chain public good**: any other contract,
any autonomous trading agent, any wallet — can read a market's risk attestation directly from
chain state with a single `eth_call`, no API key, no trusting `levelfield`'s uptime. This is the
natural home for a score that's supposed to warn people *before* they bet: it has to be at least
as available as the market it's warning them about.

Every attestation carries a `methodHash = sha256(anchorLibraryVersion + "|" + promptVersion)`.
The anchor library (`data/anchors/anchors.yaml`) and classification prompt will change over
time as the methodology improves; `methodHash` pins each published score to the exact version
that produced it, so a later revision can never be silently read back onto an old attestation —
a consumer can always tell "this score was computed under anchors v1.0.0" from the hash alone.

## Contract

[`src/ScoreRegistry.sol`](src/ScoreRegistry.sol) — ~85 lines, no OpenZeppelin dependency (a
hand-rolled two-step owner pattern instead, see the contract's own NatSpec for why). One owner,
one mapping, `publish` / `publishBatch` / `get`. No upgradability, no governance, no token.

## Local setup

```bash
cd contracts
forge build     # compiles src/, writes contracts/out/ (gitignored — required by the two scripts below)
forge test      # 8 tests: publish/get, batch, onlyOwner revert, overwrite, two-step ownership transfer
```

## Deploying and publishing for real

Both scripts default to a **dry run** — they print exactly what they would do and touch no
chain state. Nothing below sends a transaction until you pass `--send`.

1. **Get a throwaway key and fund it.** Generate a fresh private key (never reuse a key that
   holds real funds), then fund it from the Somnia testnet faucet:
   <https://testnet.somnia.network>

2. **Export it** (do not commit this anywhere):
   ```bash
   export PRIVATE_KEY=0x...
   ```

3. **Deploy the registry:**
   ```bash
   npm run registry:deploy                # dry run: bytecode size + a live gas/cost estimate
   npm run registry:deploy -- --send      # deploys for real, prints the address + explorer link
   ```

4. **Publish the score cache:**
   ```bash
   export REGISTRY_ADDRESS=0x...          # from step 3
   export GITHUB_REPO=your-org/your-repo
   export GITHUB_REF="$(git rev-parse HEAD)" # recommended: immutable provenance commit
   npm run registry:publish               # dry run: prints every key/methodHash/tx it would send
   npm run registry:publish -- --send     # sends publishBatch in chunks of 5
   ```

5. **Verify on the explorer.** Open
   `https://shannon-explorer.somnia.network/address/<REGISTRY_ADDRESS>`, confirm the deployment
   and publish transactions, and spot-check a `ScorePublished` event's `key` against
   `cast keccak "<marketId>"` for one of the markets in `data/scores/`.

`RPC_URL` defaults to `https://dream-rpc.somnia.network` for both scripts and can be overridden
via env if that endpoint moves.

`GITHUB_REPO=owner/repo` is required for both publishing and `npm run verify:onchain`.
`GITHUB_REF` defaults to `main`, but release attestations should set it to the full immutable
commit SHA shown above. Both scripts use the same checked, URL-safe ref when constructing and
verifying every URI, and fail closed on placeholder or unsafe provenance values.

## Reading an attestation

```solidity
ScoreRegistry.Attestation memory a = registry.get(keccak256(bytes("curated-btc-120k")));
// a.score = 3, a.band = 0 (low), a.dims = [1,1,1,1,2]
```

## Live deployment (Somnia Shannon, chain 50312)

- ScoreRegistry: [`0xb8e11dea346f2c961880879606a269db3165bbc7`](https://shannon-explorer.somnia.network/address/0xb8e11dea346f2c961880879606a269db3165bbc7) (deploy tx `0xa6947b332d8b4476e96f1997cc3545611ee7c7a810c2bbe466b5a9cdcb1a5574`)
- 26 current attestations, published in 6 `publishBatch` transactions with source URIs
  pinned to an immutable commit of this repository. To republish after rescoring, set
  `GITHUB_REPO` and `GITHUB_REF` (a commit SHA) and run `npm run registry:publish -- --send`,
  then `npm run verify:onchain` for a complete field-by-field read-back check.
