import { useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
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
} from "../types/text-splitting";
import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
} from "@langchain/textsplitters";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTextSplittingStore } from "@/app/stores/text-splitting-store";

async function splitText(
  text: string,
  strategy: SplitStrategy,
  options: { chunkSize: number; overlap: number }
): Promise<TextBlock[]> {
  try {
    let splitter;
    switch (strategy) {
      case "character":
        splitter = new CharacterTextSplitter({
          separator: "\n\n",
          chunkSize: options.chunkSize,
          chunkOverlap: options.overlap,
        });
        break;
      case "recursive-character":
        splitter = new RecursiveCharacterTextSplitter({
          chunkSize: options.chunkSize,
          chunkOverlap: options.overlap,
          separators: ["\n\n"],
        });
        break;
      default:
        throw new Error("Invalid split strategy");
    }

    const documents = await splitter.splitText(text);
    return documents.map((doc) => ({ text: doc }));
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
  const {
    text,
    blocks,
    strategy,
    chunkSize,
    overlap,
    setText,
    setBlocks,
    setStrategy,
    setChunkSize,
    setOverlap
  } = useTextSplittingStore()

  const debouncedSplitText = useDebouncedCallback(async () => {
    try {
      const newBlocks = await splitText(text, strategy, { chunkSize, overlap });
      setBlocks(newBlocks);
    } catch (error) {
      console.error("Error splitting text:", error);
      setBlocks([]);
    }
  }, 500);

  useEffect(() => {
    debouncedSplitText();
  }, [text, strategy, chunkSize, overlap, debouncedSplitText]);

  const handleChunkSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setChunkSize(value);
  };

  const handleOverlapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setOverlap(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>文本分块</CardTitle>
        <CardDescription>
          了解如何将长文本切分成语义连贯的小块
          <br />
          - character 策略: 统一切分大小，轻松适应任何模型。（适用于简单场景）
          <br />- recursive-character 策略:
          递归切分，能够保持自然语言的连贯性，并适应不同级别的文本粒度。（适用于实际应用场景）
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">分块策略:</span>
          <Select
            value={strategy}
            onValueChange={(value) => setStrategy(value as SplitStrategy)}
          >
            <SelectTrigger className="w-[254px]">
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
          <div className="flex items-center">
            <label className="text-sm font-medium">块大小:</label>
            <Input
              type="number"
              value={chunkSize}
              onChange={handleChunkSizeChange}
              min="1"
              max={10000}
              className="w-24 ml-2"
            />
          </div>
          <div className="flex items-center">
            <label className="text-sm font-medium">重叠大小:</label>
            <Input
              type="number"
              value={overlap}
              onChange={handleOverlapChange}
              min="0"
              max={chunkSize - 1}
              className="w-24 ml-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">输入文本:</label>
          <div className="text-xs text-muted-foreground mb-2">
            示例文本来源于 AWS 文档，修改了部分格式
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px]"
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
