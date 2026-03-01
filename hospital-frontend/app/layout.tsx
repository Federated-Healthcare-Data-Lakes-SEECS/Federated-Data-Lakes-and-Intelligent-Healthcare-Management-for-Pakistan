import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Providers from "@/components/providers"
import { Suspense } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { branding } from "@/lib/branding"

export const metadata: Metadata = {
  title: branding.hospitalName,
  description: branding.description,
  generator: branding.hospitalName,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<LoadingScreen />}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  )
}
