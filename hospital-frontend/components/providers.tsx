"use client"

import type React from "react"

import { SWRConfig } from "swr"
import { api } from "@/lib/api"
import { Toaster } from "./ui/sonner"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ fetcher: (url: string) => api.get(url).then((r) => r.data) }}>
      {children}
      <Toaster />
    </SWRConfig>
  )
}
