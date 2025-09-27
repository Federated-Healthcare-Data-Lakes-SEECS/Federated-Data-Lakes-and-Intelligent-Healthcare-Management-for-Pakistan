"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { mutate } from "swr"

export function OnboardingForm() {
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setSubmitting(true)
    try {
      const payload: Record<string, any> = {
        dateOfBirth: formData.get("dateOfBirth")
          ? new Date(String(formData.get("dateOfBirth"))).toISOString()
          : undefined,
        bloodGroup: formData.get("bloodGroup") || undefined,
        medicalHistory: formData.get("medicalHistory") || undefined,
        familyHistory: formData.get("familyHistory") || undefined,
        allergies: formData.get("allergies") || undefined,
        address: formData.get("address") || undefined,
        phoneNumber: formData.get("phoneNumber") || undefined,
        emergencyContact: formData.get("emergencyContact") || undefined,
        // Note: backend may set onboardingDone=true when profile is completed
      }

      await api.put("/users/me/patient-profile", payload)

      // Refresh profile cache and route
      await mutate("/users/me")
      toast.success("Onboarding complete", { description: "Welcome to your patient dashboard." })
      router.replace("/patient/dashboard")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Something went wrong", {
        description: "Your profile was not updated. Please try again."
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="max-w-3xl w-full">
      <CardHeader>
        <CardTitle>Patient Onboarding</CardTitle>
        <CardDescription>Please provide your medical details to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input id="dateOfBirth" name="dateOfBirth" type="date" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bloodGroup">Blood group</Label>
            <Input id="bloodGroup" name="bloodGroup" placeholder="A+, O-, etc." />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="medicalHistory">Medical history</Label>
            <Textarea id="medicalHistory" name="medicalHistory" rows={3} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="familyHistory">Family history</Label>
            <Textarea id="familyHistory" name="familyHistory" rows={3} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea id="allergies" name="allergies" rows={2} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="Street, City" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phoneNumber">Phone number</Label>
            <Input id="phoneNumber" name="phoneNumber" placeholder="+1234567890" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="emergencyContact">Emergency contact</Label>
            <Input id="emergencyContact" name="emergencyContact" placeholder="+0987654321" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Saving..." : "Complete onboarding"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
