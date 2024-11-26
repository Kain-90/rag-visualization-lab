import { useState, useEffect, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  EMBEDDING_MODELS,
  EmbeddingModel,
  EmbeddingProgressMessage,
  EmbeddingTaskMessage,
  LangchainProgress,
} from "../types/embedding";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

type LoadingState = {
  status: "idle" | "loading-model" | "generating" | "error";
  progress?: LangchainProgress;
  error?: string;
};

type FileProgress = {
  filename: string;
  progress: number;
  status: 'initiate' | 'loading' | 'done';
};

export function EmbeddingTab() {
  const [model, setModel] = useState<EmbeddingModel>(
    "Snowflake/snowflake-arctic-embed-xs"
  );
  const [text, setText] = useState("这是一段示例文本，用于生成文本嵌入向量。");
  const [embedding, setEmbedding] = useState<number[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    status: "idle",
  });
  const [fileProgresses, setFileProgresses] = useState<Map<string, FileProgress>>(new Map());

  const calculateOverallProgress = () => {
    if (fileProgresses.size === 0) return 0;

    let total = 0;
    fileProgresses.forEach(file => {
      total += file.status === 'done' ? 100 : file.progress;
    });
    
    return Math.round(total / fileProgresses.size);
  };

  const loadingProgress = calculateOverallProgress();

  const workerRef = useRef<Worker | null>(null);

  const debouncedGetEmbedding = useDebouncedCallback(() => {
    if (!workerRef.current) {
      console.error("Worker not initialized");
      return;
    }

    try {
      setLoadingState({ status: "generating" });
      const message: EmbeddingTaskMessage = {
        task: "feature-extraction",
        model,
        text,
      };
      workerRef.current.postMessage(message);
    } catch (error) {
      console.error("Error sending message to worker:", error);
      setEmbedding([]);
      setLoadingState({
        status: "error",
        error: String(error),
      });
    }
  }, 500);

  useEffect(() => {
    if (text.trim()) {
      debouncedGetEmbedding();
    }
  }, [text, model, debouncedGetEmbedding]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (!workerRef.current) {
        workerRef.current = new Worker(
          new URL("../workers/embedding.ts", import.meta.url),
          { type: "module" }
        );

        workerRef.current.onmessage = (
          event: MessageEvent<EmbeddingProgressMessage>
        ) => {
          const { status, progress, message, output } = event.data;
          console.log("Worker message received:", {
            status,
            progress,
            message,
            output,
          });

          if (status === "loading" && progress?.file) {
            setLoadingState({
              status: "loading-model",
              progress,
            });

            const filename = progress.file;
            setFileProgresses(prev => {
              const newFileProgresses = new Map(prev);
              if (progress?.status === 'done') {
                newFileProgresses.set(filename, {
                  filename,
                  progress: 100,
                  status: 'done'
                });
              } else if (progress?.status === 'ready') {
              } else {
                console.log('last set file progress', filename, progress);
                newFileProgresses.set(filename, {
                  filename,
                  progress: progress?.progress || 0,
                  status: progress?.status || 'loading'
                });
              }
              return newFileProgresses;
            });
          } else if (status === "ready") {
            setLoadingState({ status: "idle" });
            if (text.trim()) {
              debouncedGetEmbedding();
            }
          } else if (status === "complete" && output) {
            setEmbedding(output);
            setLoadingState({ status: "idle" });
          } else if (status === "error") {
            console.error("Error generating embedding:", message);
            setEmbedding([]);
            setLoadingState({
              status: "error",
              error: message,
            });
          }
        };

        workerRef.current.onerror = (error) => {
          console.error("Worker error:", error);
          setLoadingState({
            status: "error",
            error: "Worker initialization failed",
          });
        };
      }
    } catch (error) {
      console.error("Error initializing worker:", error);
      setLoadingState({
        status: "error",
        error: "Failed to initialize worker",
      });
    }

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [text, debouncedGetEmbedding]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>向量嵌入</CardTitle>
        <CardDescription>
          观察文本是如何被转换为向量的
          <br />
          通过将文本转换为高维向量空间中的点，我们可以计算文本之间的语义相似度
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">嵌入模型:</span>
          <Select
            value={model}
            onValueChange={(value) => setModel(value as EmbeddingModel)}
          >
            <SelectTrigger className="w-[400px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMBEDDING_MODELS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {["loading-model", "generating", "idle"].includes(loadingState.status) && (
          <div className="flex flex-col space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-between text-sm">
              <span>
                {loadingState.progress?.status === "initiate"
                  ? "正在加载模型..."
                  : loadingState.progress?.status === "done"
                  ? "模型加载完成"
                  : "模型加载中..."}
              </span>
              <span className="font-medium">{loadingProgress}%</span>
            </div>
            <Progress value={loadingProgress} className="w-full" />

            {fileProgresses.size > 0 && (
              <div className="space-y-2 text-xs text-muted-foreground">
                {Array.from(fileProgresses.values()).map((file) => (
                  <div key={file.filename} className="flex justify-between">
                    <span>{file.filename}</span>
                    <div className="flex items-center gap-2">
                      {file.status === 'done' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <span>{`${file.progress}%`}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">输入文本:</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px]"
            placeholder="在此输入要生成嵌入的文本..."
          />
        </div>

        <div className="min-h-[400px] rounded-lg border-2 border-dashed border-muted-foreground/25 p-4">
          {loadingState.status === "generating" ? (
            <div className="flex items-center justify-center h-full">
              正在生成嵌入向量...
            </div>
          ) : embedding.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm font-medium">
                向量维度: {embedding.length}
              </div>
              <div className="grid grid-cols-8 gap-2">
                {embedding.slice(0, 32).map((value, index) => (
                  <div
                    key={index}
                    className="text-xs p-1 bg-muted rounded flex items-center justify-center"
                    title={`维度 ${index}: ${value}`}
                  >
                    {value}
                  </div>
                ))}
              </div>
              {embedding.length > 32 && (
                <div className="text-sm text-muted-foreground text-center">
                  显示前32个维度 (共 {embedding.length} 维)
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {loadingState.status === "error"
                ? `错误: ${loadingState.error}`
                : "请输入文本生成嵌入向量"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
