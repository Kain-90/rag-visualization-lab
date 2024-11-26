import { useState, useEffect, useRef } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
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

export function EmbeddingTab() {
  const [model, setModel] = useState<EmbeddingModel>(
    "Snowflake/snowflake-arctic-embed-xs"
  );
  const [text, setText] = useState("This is a sample text for generating text embedding vectors.");
  const [embedding, setEmbedding] = useState<number[][][]>([]);
  const [loadingState, setLoadingState] = useState<UILoadingState>({
    status: "idle",
  });
  const [fileProgresses, setFileProgresses] = useState<
    Map<string, UIFileProgress>
  >(new Map());

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

  const debouncedGetEmbedding = useDebouncedCallback(() => {
    if (!workerRef.current) {
      console.error("Worker not initialized");
      return;
    }

    try {
      setLoadingState({ status: "generating" });
      const textBlocks = text
        .split("\n")
        .map((block) => block.trim())
        .filter((block) => block.length > 0);

      const message: EmbeddingTaskMessage = {
        task: "feature-extraction",
        model,
        text: textBlocks,
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
          } else if (status === "ready") {
            setLoadingState({ status: "idle" });
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
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vector Embedding</CardTitle>
        <CardDescription>
          Observe how text is converted into vectors
          <br />
          By converting text into points in high-dimensional vector space, we can calculate semantic similarity between texts
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
            Input Text (each line will generate an independent embedding vector):
          </label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px]"
            placeholder="Enter text here to generate embeddings, each line will generate an independent embedding vector..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Embedding Vectors:</label>
          <div className="min-h-[400px] rounded-lg border-2 border-dashed border-muted-foreground/25 p-4">
            {loadingState.status === "generating" ? (
              <div className="flex items-center justify-center h-full">
                Generating embedding vectors...
              </div>
            ) : embedding.length > 0 ? (
              <div className="space-y-8 flex flex-col items-center">
                {embedding.map((blockEmbedding, blockIndex) => (
                  <div key={blockIndex}>
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger>
                          <div className="relative p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors group">
                            <div className="text-xs text-center space-y-1">
                              <div className="font-mono">
                                <p>[{blockEmbedding[0][0].toFixed(4)}...,</p>
                                <p>
                                  <span className="text-muted-foreground/60">
                                    ...
                                  </span>
                                </p>
                                <p>
                                  {blockEmbedding[0][
                                    blockEmbedding[0].length - 1
                                  ].toFixed(4)}
                                  ...]
                                </p>
                              </div>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            [
                            {blockEmbedding
                              .slice(0, 32)
                              .map((v) => v[0].toFixed(4))
                              .join(", ")}
                            ...]
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {loadingState.status === "error"
                  ? `Error: ${loadingState.error}`
                  : "Please enter text to generate embedding vectors"}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
