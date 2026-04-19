import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import VaultOverlay from "@/components/VaultOverlay"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "NoteTaker App",
  description: "A simple note-taking application",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <VaultOverlay>
            {children}
            <Toaster />
          </VaultOverlay>
        </ThemeProvider>
      </body>
    </html>
  )
}
