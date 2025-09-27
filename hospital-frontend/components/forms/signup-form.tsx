"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SignupForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "MALE" as "MALE" | "FEMALE" | "OTHER",
    cnic: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post("/auth/register", form)
      toast.success('Registration successful', {
        description: "Please log in to continue.",
      })
      router.replace("/login")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'There was an error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl w-full">
      <CardHeader>
        <CardTitle>Create patient account</CardTitle>
        <CardDescription>Only patients can sign up here. Doctors cannot sign up.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              required
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={(v: any) => update("gender", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="cnic">CNIC</Label>
            <Input
              id="cnic"
              required
              value={form.cnic}
              onChange={(e) => update("cnic", e.target.value)}
              placeholder="1234512345671"
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Creating account..." : "Create account"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
