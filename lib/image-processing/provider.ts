import { ImageAnalysis } from "./analyzer";
import { PreflightReport } from "./preflight";

export interface ProcessingConfig {
  targetWidthCm: number;
  targetDpi: number;
  cleanAlpha: boolean;
  alphaThreshold: number; // 0 - 255 (default 30)
  removeSemiTransparency: boolean;
  removeBackground: boolean;
  backgroundColorKey?: string; // e.g. '#ffffff'
}

export interface ProcessingResult {
  processedCanvas: HTMLCanvasElement;
  processedBlob: Blob;
  analysis: ImageAnalysis;
  preflight: PreflightReport;
  processingTimeMs: number;
}

export interface ImageProcessingProvider {
  name: string;
  process(
    sourceImage: HTMLImageElement,
    config: ProcessingConfig,
    originalAnalysis: ImageAnalysis
  ): Promise<ProcessingResult>;
}
