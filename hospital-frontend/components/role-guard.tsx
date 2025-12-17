"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth, type Role } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/loading-screen"

export function RoleGuard({
  allowed,
  children,
}: {
  allowed: Role[]
  children: React.ReactNode
}) {
  const { user, isLoading, isAuthenticated, isAdmin, isPatient, isDoctor, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }

    if (isAdmin) {
      // Admin is not allowed in this app
      logout()
      return
    }

    const hasAllowedRole = allowed.some((r) => user?.roles.includes(r))
    if (!hasAllowedRole) {
      // Redirect mismatched roles
      if (isPatient) router.replace("/patient/dashboard")
      else if (isDoctor) router.replace("/doctor/dashboard")
      else router.replace("/login")
      return
    }

    // If patient and onboarding not done, redirect to onboarding (unless already there)
    if (isPatient && user?.patient && !user.patient.onboardingDone) {
      if (!pathname.startsWith("/onboarding")) {
        router.replace("/onboarding")
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, user, allowed, isPatient, isDoctor, logout, pathname, router])

  if (isLoading || !isAuthenticated) {
    return <LoadingSpinner text="Verifying access..." />
  }

  return <>{children}</>
}
