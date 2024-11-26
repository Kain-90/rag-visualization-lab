import { pipeline, PipelineType, Tensor } from "@huggingface/transformers";
import { EmbeddingModel } from "../types/embedding";
import { FeatureExtractionPipeline } from "@huggingface/transformers";
import {
  EmbeddingProgressMessage,
  LangchainProgress,
} from "../types/embedding";

// Use the Singleton pattern to enable lazy construction of the pipeline.
class PipelineSingleton {
  static task: PipelineType = "feature-extraction";
  static model: EmbeddingModel = "Snowflake/snowflake-arctic-embed-xs";
  static instance: FeatureExtractionPipeline | null = null;

  static async getInstance(
    progress_callback: (x: EmbeddingProgressMessage) => void
  ) {
    if (!this.instance) {
      let message: EmbeddingProgressMessage = {
        status: "loading",
        message: "Model loading started",
      };
      progress_callback(message);

      this.instance = (await pipeline(this.task, this.model, {
        progress_callback: (progress: LangchainProgress) => {
          message = {
            status: "loading",
            progress: progress,
            message: "Model loading in progress",
          };
          progress_callback(message);
        },
      })) as FeatureExtractionPipeline;

      message = { status: "ready", message: "Model ready" };
      progress_callback(message);
    }
    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener("message", async (event) => {
  // Retrieve the classification pipeline. When called for the first time,
  // this will load the pipeline and save it for future use.
  if (event.data.task === "feature-extraction") {
    const task = await PipelineSingleton.getInstance(
      (x: EmbeddingProgressMessage) => {
        // We also add a progress callback to the pipeline so that we can
        // track model loading.
        self.postMessage(x);
      }
    );

    // Actually perform the classification
    let output: Tensor | Tensor[];
    if (Array.isArray(event.data.text)) {
      // Process each element individually
      output = await Promise.all(
        event.data.text.map((text: string) =>
          task(text, { normalize: true, pooling: "cls" })
        )
      );
    } else {
      output = await task(event.data.text, {
        normalize: true,
        pooling: "cls",
      });
    }

    // Send the output back to the main thread
    const message: EmbeddingProgressMessage = {
      status: "complete",
      output: Array.isArray(output)
        ? output.map((o) => o.tolist())
        : [output.tolist()],
    };
    self.postMessage(message);
  } else {
    const message: EmbeddingProgressMessage = {
      status: "error",
      message: "Invalid task",
    };
    self.postMessage(message);
  }
});
