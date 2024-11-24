import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RetrievalTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>语义检索</CardTitle>
        <CardDescription>
          探索如何找到与问题最相关的文本片段
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[600px] rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
          语义检索演示区域
        </div>
      </CardContent>
    </Card>
  )
} 