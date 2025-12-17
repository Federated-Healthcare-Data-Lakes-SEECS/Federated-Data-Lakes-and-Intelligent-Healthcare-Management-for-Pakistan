import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Providers from "@/components/providers"
import { Suspense } from "react"
import { LoadingScreen } from "@/components/loading-screen"

export const metadata: Metadata = {
  title: "HealthCare Hospital",
  description: "Created with HealthCare Hospital",
  generator: "HealthCare Hospital",
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
