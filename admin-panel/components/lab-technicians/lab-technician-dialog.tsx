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
import type { LabTechnician, Department, LabTechnicianFormData } from "@/lib/types"
import { Gender } from "@/lib/types"
import { toast } from "sonner"
import api from "@/lib/api"

interface LabTechnicianDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  labTechnician: LabTechnician | null
  onSave: (labTechnician: LabTechnician) => void
  onError?: (error: unknown) => void
}

export function LabTechnicianDialog({ open, onOpenChange, labTechnician, onSave, onError }: LabTechnicianDialogProps) {
  const [formData, setFormData] = useState<LabTechnicianFormData>({
    firstName: "",
    lastName: "",
    email: "",
    gender: Gender.MALE,
    cnic: "",
    departmentName: "",
    specialization: "",
    experience: 0,
    qualification: "",
  })
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const isEdit = labTechnician !== null;

  useEffect(() => {
    if (open) {
      loadDepartments()
      if (labTechnician) {
        setFormData({
          firstName: labTechnician.firstName,
          lastName: labTechnician.lastName,
          email: labTechnician.email,
          gender: labTechnician.gender as Gender,
          cnic: labTechnician.cnic,
          departmentName: labTechnician.departmentName,
          specialization: labTechnician.specialization,
          experience: labTechnician.experience,
          qualification: labTechnician.qualification,
        })
      } else {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          gender: Gender.MALE,
          cnic: "",
          departmentName: "",
          specialization: "",
          experience: 0,
          qualification: "",
        })
      }
    }
  }, [open, labTechnician])

  const loadDepartments = async () => {
    try {
      setLoading(true)
      const response = await api.get("/departments")
      setDepartments(response.data)
    } catch (error) {
      toast.error("Failed to load departments")
    } finally {
      setLoading(false)
    }
  }

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

    if (!formData.departmentName) {
      toast.error("Please select a department")
      return
    }

    try {
      setSaving(true)
      if(labTechnician) {
        let response = await api.patch(`/lab-technicians/${labTechnician.id}`, formData)
        onSave(response.data)
      } else {
        let response = await api.post('/lab-technicians/register', formData)
        onSave(response.data)
      }

      onOpenChange(false)
    } catch (error) {
      if (onError) {
        onError(error)
      } else {
        toast.error(`Failed to ${labTechnician ? "update" : "create"} lab technician`)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{labTechnician ? "Edit Lab Technician" : "Add New Lab Technician"}</DialogTitle>
          <DialogDescription>
            {labTechnician ? "Update lab technician information" : "Create a new lab technician profile"}
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
            {!isEdit && <div className="grid gap-2">
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
            {isEdit && <div className="grid gap-2">
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
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.departmentName}
                onValueChange={(value) => setFormData({ ...formData, departmentName: value })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g., Hematology, Microbiology"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="experience">Experience (Years)</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: Number.parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g., MLT, DMLT, B.Sc MLT"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : labTechnician ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
