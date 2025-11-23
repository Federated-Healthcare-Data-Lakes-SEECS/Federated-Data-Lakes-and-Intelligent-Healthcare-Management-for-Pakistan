import type React from "react"
import { RoleGuard } from "@/components/role-guard"

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <RoleGuard allowed={["PATIENT"]}>{children}</RoleGuard>
    </main>
  )
}
