import { ToolType } from "./types";

export const BRUSH_CONFIG = {
  [ToolType.FUTO_FUDE]: {
    minWidth: 8,
    maxWidth: 45,
    growthRate: 1.5, // How fast ink spreads when holding still
    velocityFactor: 0.15, // How much speed reduces width
    color: '#1a1a1a', // Sumi ink is rarely pure black
  },
  [ToolType.HOSO_FUDE]: {
    minWidth: 2,
    maxWidth: 12,
    growthRate: 0.5,
    velocityFactor: 0.08,
    color: '#1a1a1a',
  },
  [ToolType.STAMP]: {
    size: 60,
    color: '#bd2c2c', // Cinnabar red
    padding: 4,
  }
};

export const PAPER_SIZE = {
  width: 800,
  height: 1100, // Roughly Hanshi ratio
};