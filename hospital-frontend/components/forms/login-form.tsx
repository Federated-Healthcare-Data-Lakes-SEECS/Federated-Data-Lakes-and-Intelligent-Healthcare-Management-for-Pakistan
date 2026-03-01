"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { setToken, clearToken } from "@/lib/auth"
import { toast } from "sonner"
import { mutate } from "swr"
import { Eye, EyeOff } from "lucide-react"
import { branding } from "@/lib/branding"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.post<{ access_token: string }>("/auth/login", {
        email,
        password,
      })

      setToken(data.access_token)

      // Immediately fetch profile to decide where to go
      const me = await api.get("/users/me").then((r) => r.data)

      console.log("User roles:", me.roles)

      if (me.roles?.includes("ADMIN")) {
        clearToken()
        toast.error("Invalid credentials", {
          description: "Admins cannot log in from here.",
        })
        router.replace("/login")
        return
      }

      // Warm SWR cache
      await mutate("/users/me", me, { revalidate: false })

      if (me.roles?.includes("DOCTOR")) {
        router.replace("/doctor/dashboard")
        return
      }

      if (me.roles?.includes("RECEPTIONIST")) {
        router.replace("/receptionist/dashboard")
        return
      }

      if(me.roles?.includes("LAB_TECHNICIAN")) {
        router.replace("/lab-technician/dashboard")
        return
      }

      if(me.roles?.includes("PATHOLOGIST")) {
        router.replace("/pathologist/dashboard")
        return
      }

      if (me.roles?.includes("PATIENT")) {
        if (me.patient && !me.patient.onboardingDone) {
          router.replace("/onboarding")
        } else {
          router.replace("/patient/dashboard")
        }
        return
      }

      // Fallback
      router.replace("/login")
    } catch (err: any) {
      toast.error('Login failed', {
        description: err?.response?.data?.message || "Please check your credentials and try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to manage your {branding.hospitalName} account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
          
          {/* Quick Login Buttons */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or quick login as
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {branding.quickLogin.map((entry) => (
              <Button
                key={entry.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail(entry.email)
                  setPassword(entry.password)
                }}
                disabled={submitting}
                className="text-xs"
              >
                {entry.label}
              </Button>
            ))}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
