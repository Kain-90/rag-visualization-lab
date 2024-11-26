import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  SplitSquareHorizontal,
  Boxes,
  Search,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/app/components/header";

// 添加箭头组件
const Arrow = () => (
  <div className="hidden lg:flex items-center justify-center">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="text-primary/30"
    >
      <path
        d="M0 12H22.5M22.5 12L16.5 6M22.5 12L16.5 18"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  </div>
);

// 抽取特性卡片为独立组件
const FeatureCard = ({ feature }: { feature: (typeof features)[0] }) => (
  <div className="group relative overflow-hidden rounded-2xl border bg-background h-[200px] p-6 transition-all hover:shadow-lg">
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
    <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
      {feature.icon}
    </div>
    <h3 className="mb-3 text-lg font-bold">{feature.title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
      {feature.description}
    </p>
  </div>
);

const features = [
  {
    title: "文本分块",
    description:
      "通过可视化方式展示文档切分过程，帮助理解如何创建语义连贯的文本块",
    icon: <SplitSquareHorizontal className="h-6 w-6 text-primary" />,
  },
  {
    title: "向量嵌入",
    description: "直观展示文本如何被转换为高维向量空间中的数值表示",
    icon: <Boxes className="h-6 w-6 text-primary" />,
  },
  {
    title: "语义检索",
    description: "实时展示问题与知识库的匹配过程，理解相似度计算原理",
    icon: <Search className="h-6 w-6 text-primary" />,
  },
  {
    title: "上下文生成",
    description: "观察模型如何利用检索到的相关内容生成准确的回答",
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-20">
        {/* Hero 区域 */}
        <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-32 pb-20">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50 dark:from-blue-950/30 dark:to-indigo-950/30" />
            <div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          </div>
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                RAG 交互式学习平台
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                通过实时可视化和交互式演示，深入理解 RAG (检索增强生成)
                的核心工作原理
              </p>
            </div>
            <div className="flex space-x-4">
              <Button size="lg" className="h-12 px-8 group" asChild>
                <Link href="/experiment">
                  开始实验
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 功能特性区域 */}
        <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
            <div className="w-[280px] shrink-0">
              <FeatureCard feature={features[0]} />
            </div>
            <Arrow />
            <div className="w-[280px] shrink-0">
              <FeatureCard feature={features[1]} />
            </div>
            <Arrow />
            <div className="w-[280px] shrink-0">
              <FeatureCard feature={features[2]} />
            </div>
            <Arrow />
            <div className="w-[280px] shrink-0">
              <FeatureCard feature={features[3]} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
