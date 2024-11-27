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
  UILoadingState,
  UIFileProgress,
} from "../types/embedding";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";
import { useTextSplittingStore } from "@/app/stores/text-splitting-store";

export function EmbeddingTab() {
  const { blocks } = useTextSplittingStore();
  const [model, setModel] = useState<EmbeddingModel>(
    "Snowflake/snowflake-arctic-embed-xs"
  );
  const [question, setQuestion] = useState("What would you like to ask?");
  const [blocksEmbedding, setBlocksEmbedding] = useState<number[][][]>([]);
  const [questionEmbedding, setQuestionEmbedding] = useState<number[][]>([]);
  const [loadingState, setLoadingState] = useState<UILoadingState>({
    status: "idle",
  });
  const [fileProgresses, setFileProgresses] = useState<
    Map<string, UIFileProgress>
  >(new Map());
  const [embeddingProgress, setEmbeddingProgress] = useState<number>(0);

  const calculateOverallProgress = () => {
    if (fileProgresses.size === 0) return 0;

    let total = 0;
    fileProgresses.forEach((file) => {
      total += file.status === "done" ? 100 : file.progress;
    });

    return Math.round(total / fileProgresses.size);
  };

  const loadingProgress = calculateOverallProgress();

  const workerRef = useRef<Worker | null>(null);

  const debouncedGetEmbedding = useDebouncedCallback((question: string = "") => {
    if (!workerRef.current) {
      console.error("Worker not initialized");
      return;
    }

    try {
      setLoadingState({ status: "generating" });
      let textBlocks: string[] = [];
      if (question.length > 0) {
        textBlocks = [question]
      } else {
        textBlocks = blocks
          .map((block) => block.text)
          .filter((block) => block.length > 0);
      }

      const message: EmbeddingTaskMessage = {
        task: "feature-extraction",
        model,
        text: textBlocks,
        type: question.length > 0 ? "question" : "blocks",
      };
      workerRef.current.postMessage(message);
    } catch (error) {
      console.error("Error sending message to worker:", error);
      setBlocksEmbedding([]);
      setLoadingState({
        status: "error",
        error: String(error),
      });
    }
  }, 500);

  useEffect(() => {
    if (question.trim()) {
      debouncedGetEmbedding(question);
    }
  }, [question, model, debouncedGetEmbedding]);

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
          const { status, progress, message, output, type } = event.data;
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
            setFileProgresses((prev) => {
              const newFileProgresses = new Map(prev);
              if (progress?.status === "done") {
                newFileProgresses.set(filename, {
                  filename,
                  progress: 100,
                  status: "done",
                });
              } else if (progress?.status === "ready") {
              } else {
                newFileProgresses.set(filename, {
                  filename,
                  progress: progress?.progress || 0,
                  status: progress?.status || "loading",
                });
              }
              return newFileProgresses;
            });
          } else if (status === "embedding") {
            setLoadingState({ status: "embedding" });
            setEmbeddingProgress(progress?.progress || 0);
          } else if (status === "ready") {
            setLoadingState({ status: "idle" });
            debouncedGetEmbedding();
          } else if (status === "complete" && output) {
            if (type === "question") {
              setQuestionEmbedding(output[0]);
            } else {
              setBlocksEmbedding(output);
            }
            setLoadingState({ status: "idle" });
          } else if (status === "error") {
            console.error("Error generating embedding:", message);
            setBlocksEmbedding([]);
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
  }, [debouncedGetEmbedding]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vector Embedding & Similarity</CardTitle>
        <CardDescription>
          View text blocks and their vector embeddings side by side. Ask
          questions to find similar content through semantic search.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Embedding Model:</span>
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

        {["loading-model", "generating", "idle"].includes(
          loadingState.status
        ) && (
          <div className="flex flex-col space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-between text-sm">
              <span>
                {loadingState.progress?.status === "initiate"
                  ? "Loading model..."
                  : loadingState.progress?.status === "done"
                  ? "Model loaded"
                  : "Loading model..."}
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
                      {file.status === "done" ? (
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
          <label className="text-sm font-medium">
            Ask a question to find similar content:
          </label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[80px]"
            placeholder="Enter your question here..."
          />
          {questionEmbedding.length > 0 && (
            <div className="mt-4 p-3 rounded-md bg-muted/50">
              <div className="text-xs space-y-1">
                <p className="text-sm">
                  [{questionEmbedding[0]
                    .slice(0, 8)
                    .map((v) => v.toFixed(4))
                    .join(", ")}
                  ...]
                </p>
                <p className="text-xs text-muted-foreground">
                  Question embedding • {questionEmbedding[0].length} dimensions
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Text Blocks:</label>
            <div className="min-h-[400px] rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 space-y-4 overflow-y-auto">
              {blocks.map((block, index) => (
                <div
                  key={index}
                  className="p-3 rounded-md bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <p className="text-sm">{block.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Block {index + 1} • {block.text.length} characters
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Embedding Vectors:</label>
            <div className="min-h-[400px] rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 space-y-4 overflow-y-auto">
              {loadingState.status === "generating" ? (
                <div className="flex items-center justify-center h-full">
                  Generating embedding vectors...
                </div>
              ) : loadingState.status === "embedding" ? (
                <div className="flex items-center justify-center h-full">
                  Embedding... {embeddingProgress}%
                </div>
              ) : blocksEmbedding.length > 0 ? (
                <div className="space-y-4">
                  {blocksEmbedding.map((blockEmbedding, blockIndex) => (
                    <div
                      key={blockIndex}
                      className="p-3 rounded-md bg-muted/50 hover:bg-muted/80 transition-colors"
                    >
                      <div className="text-xs space-y-1">
                        <p className="text-sm">
                          [{blockEmbedding[0]
                            .slice(0, 8)
                            .map((v) => v.toFixed(4))
                            .join(", ")}
                          ...]
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Block {blockIndex + 1} • {blockEmbedding[0].length} dimensions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {loadingState.status === "error"
                    ? `Error: ${loadingState.error}`
                    : "Waiting for text blocks to generate embeddings"}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
