import { BaseTextSplitter, TextBlock } from "../types/text-splitting";


export class RecursiveCharacterTextSplitter extends BaseTextSplitter {
  splitText(text: string): Promise<TextBlock[]> {
    return Promise.resolve([]);
  }
}