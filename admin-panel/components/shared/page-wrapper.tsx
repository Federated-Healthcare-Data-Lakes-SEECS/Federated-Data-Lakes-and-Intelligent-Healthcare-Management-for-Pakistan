"use client"

import { Header } from "@/components/header"

interface PageWrapperProps {
  title: string
  link: string
  children: React.ReactNode
}

export function PageWrapper({ title, link, children }: PageWrapperProps) {
  return (
    <>
      <Header title={title} link={link} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {children}
      </div>
    </>
  )
}
