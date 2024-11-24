import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function GenerationTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>上下文生成</CardTitle>
        <CardDescription>
          了解大语言模型如何利用检索到的内容生成回答
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[600px] rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
          上下文生成演示区域
        </div>
      </CardContent>
    </Card>
  )
} 