"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { clearToken } from "@/lib/auth"

export function Header() {
  const { isAuthenticated, isPatient, isDoctor, user } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    clearToken()
    router.push("/")
  }

  const getDashboardLink = () => {
    if (isPatient) return "/patient/dashboard"
    if (isDoctor) return "/doctor/dashboard"
    if (user?.roles?.includes('RECEPTIONIST')) return "/receptionist/dashboard"
    return "/login"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-200/30 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105">
          <div className="bg-linear-to-br from-blue-600 to-blue-500 p-2 rounded-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="font-black text-xl gradient-text">MediCare</span>
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href={getDashboardLink()}>
                <Button variant="ghost" className="font-semibold hover:bg-blue-50 hover:text-blue-600 transition-all">
                  Dashboard
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="font-semibold border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="font-semibold hover:bg-blue-50 hover:text-blue-600 transition-all">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
