import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function EmbeddingTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>向量嵌入</CardTitle>
        <CardDescription>
          观察文本是如何被转换为向量的
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[600px] rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
          向量嵌入演示区域
        </div>
      </CardContent>
    </Card>
  )
} 