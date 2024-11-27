"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SplitSquareHorizontal, Boxes, MessageSquare } from "lucide-react"
import { TextSplittingTab } from "./text-splitting-tab"
import { EmbeddingTab } from "./embedding-tab"
import { GenerationTab } from "./generation-tab"

export function ExperimentContent() {
  return (
    <Tabs defaultValue="text-splitting" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="text-splitting" className="space-x-2">
          <SplitSquareHorizontal className="h-4 w-4" />
          <span>文本分块</span>
        </TabsTrigger>
        <TabsTrigger value="embedding" className="space-x-2">
          <Boxes className="h-4 w-4" />
          <span>向量嵌入</span>
        </TabsTrigger>
        <TabsTrigger value="generation" className="space-x-2">
          <MessageSquare className="h-4 w-4" />
          <span>上下文生成</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="text-splitting">
        <TextSplittingTab />
      </TabsContent>

      <TabsContent value="embedding">
        <EmbeddingTab />
      </TabsContent>

      <TabsContent value="generation">
        <GenerationTab />
      </TabsContent>
    </Tabs>
  )
} 