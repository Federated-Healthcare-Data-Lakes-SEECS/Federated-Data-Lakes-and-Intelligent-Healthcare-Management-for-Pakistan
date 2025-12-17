import type React from "react"
import { RoleGuard } from "@/components/role-guard"

export default function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-background">
      <RoleGuard allowed={["RECEPTIONIST"]}>{children}</RoleGuard>
    </main>
  )
}