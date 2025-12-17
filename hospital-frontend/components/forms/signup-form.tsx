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
import { Eye, EyeOff } from "lucide-react"

export function SignupForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "MALE" as "MALE" | "FEMALE" | "OTHER",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/(?=.*[\W_])/.test(password)) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate password
    const passwordError = validatePassword(form.password);
    if (passwordError) {
      toast.error("Invalid Password", { description: passwordError });
      return;
    }
    
    setSubmitting(true);
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
        <CardDescription>Sign up to book appointments and manage your health records</CardDescription>
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
              placeholder="John"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input 
              id="lastName" 
              required 
              value={form.lastName} 
              onChange={(e) => update("lastName", e.target.value)}
              placeholder="Doe"
            />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="john.doe@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Minimum 8 characters"
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
            <p className="text-xs text-muted-foreground">
              Must contain uppercase, lowercase, number and special character
            </p>
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
