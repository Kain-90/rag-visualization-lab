export type SplitStrategy = 'recursive-character' | 'character'

export const SplitStrategyList = [
  {'character': '固定字符(character)'},
  {'recursive-character': '递归字符(recursive-character)'},
]

export interface TextBlock {
  text: string;
} 

export abstract class BaseTextSplitter {
  chunkSize: number;
  overlap: number;
  separator: string;

  constructor(chunkSize: number = 1000, overlap: number = 200, separator: string = '') {
    this.chunkSize = chunkSize;
    this.overlap = overlap;
    this.separator = separator;
  }

  abstract splitText(text: string): Promise<TextBlock[]>;
}