import type { ChapterDef } from "./types";
import PriceDoesNotTell from "../chapters/01-price-does-not-tell/PriceDoesNotTell";
import { narrations as priceDoesNotTellNarrations } from "../chapters/01-price-does-not-tell/narrations";
import ThreeVsNinetyFive from "../chapters/02-three-vs-ninety-five/ThreeVsNinetyFive";
import { narrations as threeVsNinetyFiveNarrations } from "../chapters/02-three-vs-ninety-five/narrations";
import ModelClassifiesCodeDecides from "../chapters/03-model-classifies-code-decides/ModelClassifiesCodeDecides";
import { narrations as modelClassifiesCodeDecidesNarrations } from "../chapters/03-model-classifies-code-decides/narrations";
import AgentToChain from "../chapters/04-agent-to-chain/AgentToChain";
import { narrations as agentToChainNarrations } from "../chapters/04-agent-to-chain/narrations";
import ProofAndGrowth from "../chapters/05-proof-and-growth/ProofAndGrowth";
import { narrations as proofAndGrowthNarrations } from "../chapters/05-proof-and-growth/narrations";

/**
 * Order = order of presentation.
 *
 * Each chapter MUST provide a `narrations: Narration[]` array. Its length
 * is the chapter's step count — there is no `totalSteps` to maintain
 * separately. This guarantees the audio synthesis pipeline, the runtime
 * stepper, and the chapter `.tsx` switch on `step` cannot drift apart.
 *
 * Visual styling (color, fonts) comes entirely from the active theme —
 * chapters never hard-code palette / font names. See THEMES.md.
 */
export const CHAPTERS: ChapterDef[] = [
  {
    id: "price-does-not-tell",
    title: "Price does not tell",
    narrations: priceDoesNotTellNarrations,
    Component: PriceDoesNotTell,
  },
  {
    id: "three-vs-ninety-five",
    title: "Three vs ninety-five",
    narrations: threeVsNinetyFiveNarrations,
    Component: ThreeVsNinetyFive,
  },
  {
    id: "model-classifies-code-decides",
    title: "Model classifies, code decides",
    narrations: modelClassifiesCodeDecidesNarrations,
    Component: ModelClassifiesCodeDecides,
  },
  {
    id: "agent-to-chain",
    title: "Agent to chain",
    narrations: agentToChainNarrations,
    Component: AgentToChain,
  },
  {
    id: "proof-and-growth",
    title: "Proof and growth",
    narrations: proofAndGrowthNarrations,
    Component: ProofAndGrowth,
  },
];
