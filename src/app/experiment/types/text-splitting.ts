export type SplitStrategy = 'recursive-character' | 'character'

export const SplitStrategyList = [
  {'character': '字符分块'},
  {'recursive-character': '递归字符分块 (常见)'},
]

export interface TextBlock {
  text: string;
  start: number;
  end: number;
  metadata?: Record<string, any>;
} 

export abstract class BaseTextSplitter {
  protected chunkSize: number;
  protected overlap: number;

  constructor(chunkSize: number = 1000, overlap: number = 200) {
    this.chunkSize = chunkSize;
    this.overlap = overlap;
  }

  abstract splitText(text: string): Promise<TextBlock[]>;
}