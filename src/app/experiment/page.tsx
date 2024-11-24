"use client"

import { Header } from "@/app/components/header"
import { ExperimentContent } from "./components/experiment-content"

export default function ExperimentPage() {
  return (
    <>
      <Header />
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-20">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">RAG 实验室</h1>
            <p className="text-muted-foreground">
              通过四个步骤，深入了解 RAG 的工作原理
            </p>
          </div>
          <ExperimentContent />
        </div>
      </main>
    </>
  )
} 