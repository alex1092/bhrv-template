import * as React from "react"
import { Header } from "./Header"

interface LayoutProps {
  children: React.ReactNode
  showHeader?: boolean
}

function Layout({ children, showHeader = true }: LayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {showHeader && <Header />}
      <main className="flex-1">
        <div className="container relative py-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export { Layout }