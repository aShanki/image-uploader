import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/navbar"
import { Toaster } from "@/components/ui/toaster"
import { NextAuthProvider } from "@/components/providers/next-auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ImageUploader",
  description: "A private, self-hosted image upload service",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthProvider>
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container py-6">
              {children}
            </main>
            <footer className="border-t py-6 md:py-0">
              <div className="container flex flex-col gap-4 md:h-14 items-center justify-between md:flex-row">
                <p className="text-center text-sm leading-loose md:text-left">
                  Built with Next.js and shadcn/ui
                </p>
              </div>
            </footer>
          </div>
          <Toaster />
        </NextAuthProvider>
      </body>
    </html>
  )
}
