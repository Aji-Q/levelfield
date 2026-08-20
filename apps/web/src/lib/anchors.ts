// Server-side parse of data/anchors/anchors.yaml for the /methodology page.
// This is the single source of truth for the framework; we render it directly
// rather than hand-copying it into the app.

import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { findRepoRoot } from "./repo-root";

export interface AnchorLevel {
  level: number;
  label: string;
  definition: string;
  references: string[];
}

export interface AnchorDimension {
  id: string;
  name: string;
  weight: number;
  question: string;
  guidance: string;
  levels: AnchorLevel[];
}

export interface AnchorBand {
  name: string;
  min: number;
  max: number;
}

export interface AnchorCircuitBreaker {
  id: string;
  condition: string;
  floor: number;
  rationale: string;
}

export interface AnchorLibrary {
  version: string;
  framework: string;
  dimensions: AnchorDimension[];
  scoring: {
    bands: AnchorBand[];
    circuit_breakers: AnchorCircuitBreaker[];
    conservative_default: { level: number; rationale: string };
  };
}

export function readAnchorLibrary(): AnchorLibrary {
  const file = path.join(findRepoRoot(), "data", "anchors", "anchors.yaml");
  return parse(readFileSync(file, "utf8")) as AnchorLibrary;
}
