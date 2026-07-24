export interface NestingInputItem {
  id: string; // Instance ID
  designId: string;
  name: string;
  thumbnailUrl?: string;
  processedFileUrl?: string;
  widthCm: number;
  heightCm: number;
  aspectRatio: number;
  allowRotation?: boolean;
}

export interface NestingConfig {
  sheetWidthCm: number;
  sheetHeightCm: number;
  marginCm: number; // Outer sheet margin (cm)
  spacingCm: number; // Spacing between designs (cm)
  allowRotation: boolean;
}

export interface PlacedItem {
  id: string; // Instance ID
  designId: string;
  name: string;
  thumbnailUrl?: string;
  processedFileUrl?: string;
  xCm: number;
  yCm: number;
  widthCm: number;
  heightCm: number;
  rotation: 0 | 90 | 180 | 270;
  areaCm2: number;
}

export interface NestingResult {
  placedItems: PlacedItem[];
  unplacedItems: NestingInputItem[];
  utilizationPercentage: number;
  wastePercentage: number;
  usableSheetAreaCm2: number;
  totalUsedAreaCm2: number;
  executionTimeMs: number;
}
