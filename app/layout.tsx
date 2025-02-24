import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "./providers"
import { Sidebar } from "@/components/ui/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mercurios.ai Dashboard",
  description: "Advanced analytics dashboard with real-time data and ML predictions",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex h-screen">
            <Sidebar>
              <div className="mb-4">
                <img
                  src="/mercurios-logo.png"
                  alt="Mercurios.ai"
                  className="h-8 w-auto"
                />
              </div>
            </Sidebar>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}