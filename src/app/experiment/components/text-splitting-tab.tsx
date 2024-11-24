import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SplitStrategy,
  TextBlock,
  SplitStrategyList,
  BaseTextSplitter,
} from "../types/text-splitting";
import { RecursiveCharacterTextSplitter } from "../utils/recursive-character-text-splitter";
import { CharacterSplitter } from "../utils/character-splitter";


const SAMPLE_TEXT = `人工智能（Artificial Intelligence，简称AI）是计算机科学的一个分支，它企图了解智能的实质，并生产出一种新的能以人类智能相似的方式做出反应的智能机器。

人工智能的定义可以分为两个部分：人工和智能。人工：指由人制造的，区别于自然生成的。智能：指机器具有感知、思考、学习、推理和解决问题的能力。

人工智能技术包括机器学习、深度学习、自然语言处理、计算机视觉等多个领域。这些技术已经在我们的日常生活中得到广泛应用，如语音助手、人脸识别、自动驾驶等。`;

async function splitText(
  text: string,
  strategy: SplitStrategy,
  options: { chunkSize: number; overlap: number }
): Promise<TextBlock[]> {
  try {
    if (options.chunkSize <= 0) {
      console.warn("Invalid chunk size, using default value of 1000");
      options.chunkSize = 1000;
    }
    if (options.overlap < 0 || options.overlap >= options.chunkSize) {
      console.warn("Invalid overlap size, using default value of 200");
      options.overlap = Math.min(200, options.chunkSize / 2);
    }

    let splitter: BaseTextSplitter;
    switch (strategy) {
      case "recursive-character":
        splitter = new RecursiveCharacterTextSplitter();
        break;
      case "character":
        splitter = new CharacterSplitter(options.chunkSize, options.overlap);
        break;
      default:
        throw new Error("Invalid split strategy");
    }

    return await splitter.splitText(text);
  } catch (error) {
    console.error("Error splitting text:", error);
    return [];
  }
}

const COLORS = [
  "bg-red-100",
  "bg-blue-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-purple-100",
  "bg-pink-100",
];

export function TextSplittingTab() {
  const [strategy, setStrategy] = useState<SplitStrategy>("character");
  const [text, setText] = useState(SAMPLE_TEXT);
  const [blocks, setBlocks] = useState<TextBlock[]>([]);
  const [chunkSize, setChunkSize] = useState(1000);
  const [overlap, setOverlap] = useState(200);

  useEffect(() => {
    const updateBlocks = async () => {
      const newBlocks = await splitText(text, strategy, { chunkSize, overlap });
      setBlocks(newBlocks);
    };
    updateBlocks();
  }, [text, strategy, chunkSize, overlap]);

  const handleChunkSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setChunkSize(Math.max(1, value));
  };

  const handleOverlapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setOverlap(Math.min(Math.max(0, value), chunkSize - 1));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>文本分块</CardTitle>
        <CardDescription>了解如何将长文本切分成语义连贯的小块</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">分块策略:</span>
          <Select
            value={strategy}
            onValueChange={(value) => setStrategy(value as SplitStrategy)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SplitStrategyList.map((item) => {
                const [key, value] = Object.entries(item)[0];
                return (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-4 mt-4">
          <div>
            <label className="text-sm font-medium">块大小:</label>
            <input
              type="number"
              value={chunkSize}
              onChange={handleChunkSizeChange}
              min="1"
              className="w-24 ml-2 p-1 rounded-md border border-input bg-background"
            />
          </div>
          <div>
            <label className="text-sm font-medium">重叠大小:</label>
            <input
              type="number"
              value={overlap}
              onChange={handleOverlapChange}
              min="0"
              max={chunkSize - 1}
              className="w-24 ml-2 p-1 rounded-md border border-input bg-background"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">输入文本:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[200px] p-2 rounded-md border border-input bg-background"
            placeholder="在此输入要分块的文本..."
          />
        </div>

        <div className="min-h-[400px] rounded-lg border-2 border-dashed border-muted-foreground/25 p-4">
          <div className="text-lg leading-relaxed">
            {blocks.map((block, index) => (
              <span
                key={index}
                className={`${
                  COLORS[index % COLORS.length]
                } px-1 rounded mx-0.5`}
              >
                {block.text}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
