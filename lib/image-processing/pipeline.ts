import { ImageAnalysis, analyzeImage } from "./analyzer";
import { runDtfPreflight } from "./preflight";
import { ImageProcessingProvider, ProcessingConfig, ProcessingResult } from "./provider";
import { LocalCanvasProvider } from "./providers/local-provider";

export class ImagePipeline {
  private provider: ImageProcessingProvider;

  constructor(provider?: ImageProcessingProvider) {
    this.provider = provider || new LocalCanvasProvider();
  }

  async run(
    sourceImage: HTMLImageElement,
    fileSize: number,
    fileFormat: string,
    config: ProcessingConfig
  ): Promise<ProcessingResult> {
    // Stage 1: Analyze Original Image
    const initialAnalysis = await analyzeImage(sourceImage, fileSize, fileFormat);

    // Stage 2: Execute Processing Provider (Canvas Transformations & Alpha Cleanup)
    const result = await this.provider.process(sourceImage, config, initialAnalysis);

    return result;
  }
}
