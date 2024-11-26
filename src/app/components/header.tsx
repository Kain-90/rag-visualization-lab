import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import Logo from '@/components/logo.svg'
import Image from "next/image"

export function Header() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
        <div className="mr-4 flex">
          <a className="mr-6 flex items-center space-x-3" href="/">
            <div className="h-8 w-8">
              <Image src={Logo} alt="Logo" className="h-full w-full" />
            </div>
            <span className="font-semibold">RAG Learning Lab</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <a href="https://github.com/Kain-90/rag-visualization-lab" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon">
              <Github className="h-10 w-10" />
            </Button>
          </a>
          {/* <Button size="lg" className="h-12 px-8 group" asChild>
            <Link href="/experiment">
              开始实验
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button> */}
        </div>
      </div>
    </nav>
  )
} 