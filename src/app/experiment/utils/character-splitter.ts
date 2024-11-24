import { BaseTextSplitter, TextBlock } from "../types/text-splitting";

export class CharacterSplitter extends BaseTextSplitter {
  constructor(chunkSize: number = 1000, overlap: number = 200) {
    super(chunkSize, overlap);
  }

  async splitText(text: string): Promise<TextBlock[]> {
    const blocks: TextBlock[] = [];
    
    // 如果文本长度小于块大小，直接返回整个文本作为一个块
    if (text.length <= this.chunkSize) {
      blocks.push({
        text: text,
        start: 0,
        end: text.length,
        metadata: {}
      });
      return blocks;
    }

    let start = 0;
    while (start < text.length) {
      // 计算当前块的结束位置
      const end = Math.min(start + this.chunkSize, text.length);
      
      blocks.push({
        text: text.slice(start, end),
        start: start,
        end: end,
        metadata: {}
      });

      // 下一个块的起始位置需要考虑重叠部分
      start = end - this.overlap;
      
      // 如果剩余文本长度小于重叠部分，就结束循环
      if (text.length - start <= this.overlap) {
        break;
      }
    }

    return blocks;
  }
}