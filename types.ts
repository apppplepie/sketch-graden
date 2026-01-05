export interface Point {
  x: number;
  y: number;
}

export enum PlantType {
  VINE = 'VINE',
  PALM = 'PALM',
  GEOMETRIC = 'GEOMETRIC',
  UMBRELLA = 'UMBRELLA',
  BERRY = 'BERRY'
}

export interface PlantSettings {
  type: PlantType; // Type of generator
  
  // Stem
  stemColorStart: string;
  stemColorEnd: string;
  baseWidth: number;
  growthSpeed: number;
  maxLife: number;
  curlFactor: number; // How much noise affects direction
  straightness: number; // 0-1: Percentage of life spent growing straight up
  
  // Leaves
  leafColorStart: string;
  leafColorEnd: string;
  leafFrequency: number; // Chance per frame to spawn a leaf
  leafSize: number;

  // Flowers
  flowerColorStart: string;
  flowerColorEnd: string;
  flowerProbability: number; // Chance to spawn flower on death
  flowerSize: number;
  petalCount: number;
}

export interface Grower {
  id: string;
  x: number;
  y: number;
  angle: number; // in radians
  life: number;
  maxLife: number;
  width: number;
  speed: number;
  color: string; // Current cached color to avoid recalculating every frame if not needed, or just unused
  settings: PlantSettings;
  noiseOffset: number;
  generation: number; // 0 for main stem, 1 for branch
  ctx: CanvasRenderingContext2D; // Direct reference to the context to draw on
  hasAttemptedFlower?: boolean;
}

export interface GardenCanvasRef {
  spawn: (x: number, y: number, settings?: PlantSettings, isInsideBottle?: boolean) => void;
  undo: () => void;
  updateBottleRect: (rect: DOMRect) => void;
}