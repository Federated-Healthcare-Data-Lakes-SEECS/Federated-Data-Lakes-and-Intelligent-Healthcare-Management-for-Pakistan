'use client'

import { Header } from "@/components/header"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"

function HeroCTAs() {
  "use client"
  const { isAuthenticated, isPatient, isDoctor } = useAuth()
  const dashboardHref = isPatient ? "/patient/dashboard" : isDoctor ? "/doctor/dashboard" : "/login"

  return (
    <div className="flex gap-3">
      {!isAuthenticated ? (
        <>
          <Link href="/login">
            <Button size="lg">Login</Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="secondary">
              Signup
            </Button>
          </Link>
        </>
      ) : (
        <Link href={dashboardHref}>
          <Button size="lg">Go to Dashboard</Button>
        </Link>
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <main>
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-semibold text-balance">Modern Hospital Management, Simplified</h1>
            <p className="text-muted-foreground text-pretty">
              Patients, doctors, and staff collaborate securely. Fast onboarding, role-based dashboards, and a clean
              interface.
            </p>
            <HeroCTAs />
          </div>
          <Card className="md:ml-auto">
            <CardContent className="p-6">
              <img src="/hospital-dashboard-illustration.jpg" alt="Hospital dashboard preview" className="rounded-md border" />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
