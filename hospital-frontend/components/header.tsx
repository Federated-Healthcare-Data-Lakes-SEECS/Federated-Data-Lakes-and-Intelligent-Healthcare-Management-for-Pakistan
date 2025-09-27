"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

export function Header({ className }: { className?: string }) {
  const { isAuthenticated, isPatient, isDoctor, logout } = useAuth()

  const dashboardHref = isPatient ? "/patient/dashboard" : isDoctor ? "/doctor/dashboard" : "/login"

  return (
    <header className={cn("w-full sticky top-0 z-30 border-b bg-background/70 backdrop-blur", className)}>
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-xl">
          HospitalX
        </Link>
        <nav className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Signup</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href={dashboardHref}>
                <Button variant="secondary">Dashboard</Button>
              </Link>
              <Button variant="destructive" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
