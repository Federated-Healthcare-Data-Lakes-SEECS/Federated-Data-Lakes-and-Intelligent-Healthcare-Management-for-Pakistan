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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { patientService } from "@/lib/data-service"
import type { Patient, PatientFormData } from "@/lib/types"
import { Gender } from "@/lib/types"
import { toast } from "sonner"
import api from "@/lib/api"

interface PatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient | null
  onSave: (patient: Patient) => void
}

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export function PatientDialog({ open, onOpenChange, patient, onSave }: PatientDialogProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: "",
    lastName: "",
    email: "",
    gender: Gender.MALE,
    cnic: "",
    // dateOfBirth: undefined,
    // bloodGroup: "",
    // address: "",
    // phoneNumber: "",
    // emergencyContact: "",
    // medicalHistory: "",
    // familyHistory: "",
    // allergies: "",
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (patient) {
        setFormData({
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          gender: patient.gender,
          cnic: patient.cnic,
          // dateOfBirth: patient.dateOfBirth,
          // bloodGroup: patient.bloodGroup,
          // address: patient.address,
          // phoneNumber: patient.phoneNumber,
          // emergencyContact: patient.emergencyContact,
          // medicalHistory: patient.medicalHistory,
          // familyHistory: patient.familyHistory,
          // allergies: patient.allergies,
        })
      } else {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          gender: Gender.MALE,
          cnic: "",
          // dateOfBirth: undefined,
          // bloodGroup: "",
          // address: "",
          // phoneNumber: "",
          // emergencyContact: "",
          // medicalHistory: "",
          // familyHistory: "",
          // allergies: "",
        })
      }
    }
  }, [open, patient])

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

    // CNIC validation
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/
    if (!cnicRegex.test(formData.cnic)) {
      toast.error("CNIC must be in format: 12345-6789012-3")
      return
    }

    try {
      setSaving(true)
      if (patient) {
        console.log("This is not implemented in backend yet")
      } else {
        const response = await api.post('/patients/register', formData)
        onSave(response.data)
      }

      onOpenChange(false)
    } catch (error) {
      toast.error(`Failed to ${patient ? "update" : "create"} patient`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{patient ? "Edit Patient" : "Add New Patient"}</DialogTitle>
          <DialogDescription>
            {patient ? "Update patient information and medical records" : "Create a new patient record"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              {/* <TabsTrigger value="contact">Contact & Emergency</TabsTrigger> */}
              {/* <TabsTrigger value="medical">Medical History</TabsTrigger> */}
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
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
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Gender.MALE}>Male</SelectItem>
                      <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                      <SelectItem value={Gender.OTHER}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cnic">CNIC</Label>
                  <Input
                    id="cnic"
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    placeholder="12345-6789012-3"
                    required
                  />
                </div>
              </div>
              {/* <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth ? formData.dateOfBirth.toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value ? new Date(e.target.value) : undefined })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select
                    value={formData.bloodGroup}
                    onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div> */}
            </TabsContent>

            {/* <TabsContent value="contact" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="0300-1234567"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="0300-7654321"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  placeholder="Enter patient's medical history, current conditions, medications..."
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="familyHistory">Family History</Label>
                <Textarea
                  id="familyHistory"
                  value={formData.familyHistory}
                  onChange={(e) => setFormData({ ...formData, familyHistory: e.target.value })}
                  placeholder="Enter family medical history, genetic conditions..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="Enter known allergies, drug reactions..."
                  rows={3}
                />
              </div>
            </TabsContent> */}
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : patient ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
