"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Receptionist, ReceptionistFormData } from "@/lib/types"
import { Gender } from "@/lib/types"
import { toast } from "sonner"
import api from "@/lib/api"

interface ReceptionistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receptionist: Receptionist | null
  onSave: (receptionist: Receptionist) => void
  onError?: (error: unknown) => void
}

export function ReceptionistDialog({ open, onOpenChange, receptionist, onSave, onError }: ReceptionistDialogProps) {
  const [formData, setFormData] = useState<ReceptionistFormData>({
    firstName: "",
    lastName: "",
    email: "",
    gender: Gender.FEMALE,
    cnic: "",
    phoneNumber: "",
  })
  const [saving, setSaving] = useState(false)
  const isEdit = receptionist !== null;

  useEffect(() => {
    if (open) {
      if (receptionist) {
        setFormData({
          firstName: receptionist.firstName,
          lastName: receptionist.lastName,
          email: receptionist.email,
          gender: receptionist.gender,
          cnic: receptionist.cnic,
          phoneNumber: receptionist.phoneNumber || "",
        })
      } else {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          gender: Gender.FEMALE,
          cnic: "",
          phoneNumber: "",
        })
      }
    }
  }, [open, receptionist])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("First name and last name are required")
      return
    }

    if (!formData.email.trim()) {
      toast.error("Email is required")
      return
    }

    if (!formData.cnic.trim()) {
      toast.error("CNIC is required")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    // CNIC validation (basic format check)
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/
    if (!cnicRegex.test(formData.cnic)) {
      toast.error("CNIC must be in format: 12345-6789012-3")
      return
    }

    try {
      setSaving(true)

      if (receptionist) {
        let response = await api.patch(`/receptionists/${receptionist.id}`, formData)
        onSave(response.data)
      } else {
        let response = await api.post('receptionists/register', formData)
        onSave(response.data)
      }
      onOpenChange(false)
    } catch (error) {
      if (onError) {
        onError(error)
      } else {
        toast.error(`Failed to ${receptionist ? "update" : "create"} receptionist`)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{receptionist ? "Edit Receptionist" : "Add New Receptionist"}</DialogTitle>
          <DialogDescription>
            {receptionist ? "Update receptionist information" : "Create a new receptionist account"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
            { !isEdit && <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                required
              />
            </div>}
            { isEdit && <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-slate-50 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Gender.MALE}>Male</SelectItem>
                    <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                    <SelectItem value={Gender.OTHER}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              { !isEdit && <div className="grid gap-2">
                <Label htmlFor="cnic">CNIC</Label>
                <Input
                  id="cnic"
                  value={formData.cnic}
                  onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  placeholder="12345-6789012-3"
                  required
                />
              </div>}
              { isEdit && <div className="grid gap-2">
                <Label htmlFor="cnic">CNIC</Label>
                <Input
                  id="cnic"
                  value={formData.cnic}
                  disabled
                  className="bg-slate-50 text-muted-foreground"
                />
              </div>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="0300-1234567"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : receptionist ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
