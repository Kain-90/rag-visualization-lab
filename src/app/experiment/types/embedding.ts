export const EMBEDDING_MODELS = [
  "Snowflake/snowflake-arctic-embed-xs"
] as const;

export type EmbeddingModel = (typeof EMBEDDING_MODELS)[number];

export type LangchainProgress = {
  model?: string;
  file?: string;
  name: string;
  status: "initiate" | "loading" | "done" | "ready";
  loaded?: number;
  progress?: number;
  total?: number;
}

export type EmbeddingProgressMessage = {
  status: "loading" | "ready" | "error" | "complete";
  progress?: LangchainProgress;
  message?: string;
  output?: number[][][];
};

export type EmbeddingTaskMessage = {
  task: "feature-extraction";
  model: EmbeddingModel;
  text: string | string[];
};

export type UILoadingState = {
  status: "idle" | "loading-model" | "generating" | "error";
  progress?: LangchainProgress;
  error?: string;
};

export type UIFileProgress = {
  filename: string;
  progress: number;
  status: 'initiate' | 'loading' | 'done';
};