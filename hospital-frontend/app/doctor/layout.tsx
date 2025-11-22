import type React from "react"
import { RoleGuard } from "@/components/role-guard"
import { Header } from "@/components/header"

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-background">
      <RoleGuard allowed={["DOCTOR"]}>{children}</RoleGuard>
    </main>
  )
}
