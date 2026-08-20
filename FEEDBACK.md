# DreamDEX SDK & Documentation Feedback Journal

Running log kept during development of LevelField. Each entry: **observed → expected → suggestion**.
Compiled into the final SDK feedback report before submission.

---

## 2026-08-19

### 1. Event-contract markets expose no description or resolution-rules text via the indexer

**Observed:** Queried the Shannon testnet indexer (`https://dev.smk.somnia.host/v1/graphql`), 200 most
recent BINARY markets on the DreamDEX venue. Every market has a one-line `question`
("BTC closes at or above its opening price", "BTC at or above 6341665 at expiry"); `context` is
`0x` (empty) on 200/200 rows and `oracleQuestion` text is null on 200/200. The `Market` schema
has the fields (`question`, `context`, `oracleQuestion`), but nothing populates them beyond the
one-liner.

**Expected:** A settlement-critical text surface — the full market description and resolution rules —
retrievable per market through the public API.

**Suggestion:** Populate `context` (or a dedicated field) with the market's full description and
resolution criteria. Any third-party analysis, risk, or compliance tool needs the settlement text
to say anything about a market; today that layer cannot be built on the API alone.

### 2. Testnet event contracts are a single template (BTC/ETH price binaries)

**Observed:** 200 recent binary markets collapse to 2 distinct question strings (BTC/ETH open-close),
plus strike-ladder variants. There are no non-price event contracts (news, sports, politics,
corporate) on the testnet venue.

**Expected:** A handful of diverse sample markets so integrators can exercise category-dependent logic.

**Suggestion:** Seed the testnet venue with a few non-price demonstration markets. Price binaries are
structurally uniform, so any tool whose behavior varies by event type (ours: risk scoring; others:
categorization, discovery, recommendation) cannot demonstrate its range against live data.

### 3. `@somnia-chain/markets-sdk` dist is not loadable under plain Node ESM

**Observed:** `node --input-type=module -e "import * as sdk from '@somnia-chain/markets-sdk'"` fails
with `ERR_MODULE_NOT_FOUND` for `dist/errors` — the compiled output uses extensionless relative
imports, which Node's ESM resolver rejects. Works under bundler-style resolvers (tsx, Vite, Next).
Version tested: 0.27.0.

**Expected:** `import` works in a vanilla Node script, since the README quick-starts run via tsx but
server-side consumers won't always use one.

**Suggestion:** Emit `.js` extensions in relative imports (or set `moduleResolution`-safe output) in
the dist build.

### 4. The indexer URL is undocumented and described as unstable

**Observed:** The GraphQL indexer endpoint appears nowhere in docs.dreamdex.io; we recovered it from
`dreamdex-bot-kit/packages/ec-core/src/config.ts`, which itself warns the URL "moves" and that venue
ids "moved three times in the first week of August".

**Expected:** The indexer endpoint (and its stability contract) documented alongside the REST/WS
endpoints on the developers page.

**Suggestion:** Publish the indexer URLs per network, or proxy them under the stable
`api.dreamdex.io` domain.

### 5. (positive) Read-only SDK clients need no private key

**Observed:** `SomniaMarkets` accepts an indexer-only configuration; chain/WebSocket are lazy and the
signer is optional. This is well-designed for analysis tools — worth stating explicitly in the docs,
which currently only show full trading configurations.
