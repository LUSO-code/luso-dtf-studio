import { NestingConfig, NestingInputItem, NestingResult } from "./types";

export interface NestingEngine {
  name: string;
  nest(items: NestingInputItem[], config: NestingConfig): NestingResult;
}
