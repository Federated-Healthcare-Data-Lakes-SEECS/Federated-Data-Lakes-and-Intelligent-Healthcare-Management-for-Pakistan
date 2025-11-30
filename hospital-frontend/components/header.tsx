"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Activity } from "lucide-react"

export function Header({ className }: { className?: string }) {
  const { isAuthenticated, isPatient, isDoctor, logout } = useAuth()

  const dashboardHref = isPatient ? "/patient/dashboard" : isDoctor ? "/doctor/dashboard" : "/login"

  return (
    <header className={cn("w-full sticky top-0 z-50 glass-card border-b border-blue-200/50 gradient-shadow", className)}>
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-bold text-2xl group">
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-3 rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-blue-500/30 animate-pulse-soft">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <span className="gradient-text text-3xl font-black tracking-tight">MediCare</span>
        </Link>
        <nav className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-blue-50 font-semibold text-base hover:scale-105 transition-all">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all text-white font-semibold px-6 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105">
                  Get Started
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href={dashboardHref}>
                <Button variant="secondary" className="font-semibold hover:scale-105 transition-all">Dashboard</Button>
              </Link>
              <Button variant="destructive" onClick={logout} className="font-semibold hover:scale-105 transition-all">
                Logout
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
