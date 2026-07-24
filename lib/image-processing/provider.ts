import { ImageAnalysis } from "./analyzer";
import { PreflightReport } from "./preflight";

export type AlphaProcessingMode = "conservative" | "balanced" | "aggressive";

export interface ProcessingConfig {
  processingVersion: string; // e.g. "1.0"
  targetWidthCm: number;
  targetDpi: number;
  alphaMode: AlphaProcessingMode;
  alphaThreshold: number; // 0 - 255
  cleanAlpha: boolean;
  removeBackground: boolean;
  backgroundColorKey?: string; // e.g. '#ffffff'
  backgroundRemovalMode?: "color-key"; // Explicitly color-key (chroma), NOT AI segmentation
}

export interface ProcessingResult {
  processedCanvas: HTMLCanvasElement;
  processedBlob: Blob;
  analysis: ImageAnalysis;
  preflight: PreflightReport;
  processingTimeMs: number;
  config: ProcessingConfig;
}

export interface ImageProcessingProvider {
  name: string;
  process(
    sourceImage: HTMLImageElement,
    config: ProcessingConfig,
    originalAnalysis: ImageAnalysis
  ): Promise<ProcessingResult>;
}
