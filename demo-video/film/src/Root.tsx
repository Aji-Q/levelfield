import React from "react";
import { Composition } from "remotion";
import { Film } from "./Film";
import { FPS, TOTAL_FRAMES } from "./beats";

export const RemotionRoot: React.FC = () => (
  <Composition id="Film" component={Film} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
);
