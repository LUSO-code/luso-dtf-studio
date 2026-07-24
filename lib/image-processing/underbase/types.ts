export type UnderbaseMode = "conservador" | "balanceado" | "agresivo";
export type UnderbaseProcessingType = "binary" | "density";

export interface UnderbaseConfig {
  underbaseVersion: string; // e.g. "1.0"
  mode: UnderbaseMode;
  processingType: UnderbaseProcessingType;
  chokeMm: number; // e.g. 0.3 mm
  chokePixels: number; // calculated at targetDpi
  alphaThreshold: number; // 0 - 255 (default ~ 30)
  targetDpi: number; // default 300
  garmentColorSim: string; // e.g. "#000000"
  updatedAt?: string;
}

export interface UnderbaseResult {
  underbaseCanvas: HTMLCanvasElement;
  underbaseBlob: Blob;
  chokePixels: number;
  config: UnderbaseConfig;
  processingTimeMs: number;
}
