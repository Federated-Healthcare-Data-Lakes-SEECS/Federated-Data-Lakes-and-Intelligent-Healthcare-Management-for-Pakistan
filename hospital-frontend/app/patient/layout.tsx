import type React from "react"
import { RoleGuard } from "@/components/role-guard"
import { Header } from "@/components/header"

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Header />
      <RoleGuard allowed={["PATIENT"]}>{children}</RoleGuard>
    </main>
  )
}
