"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import type { Patient } from "@/lib/types"
import { User, Mail, Phone, CreditCard, Heart, Calendar, MapPin, Users } from "lucide-react"

interface PatientDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient | null
}

export function PatientDetailDialog({ open, onOpenChange, patient }: PatientDetailDialogProps) {
  if (!patient) return null

  const formatDate = (date?: Date | string | null) => {
    if (!date) return "Not provided"
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            Patient Details
          </DialogTitle>
          <DialogDescription>
            Complete information for {patient.firstName} {patient.lastName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Full Name
                </Label>
                <p className="font-medium">{patient.firstName} {patient.lastName}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" /> Gender
                </Label>
                <Badge 
                  className={`border-0 ${
                    patient.gender?.toLowerCase() === 'male' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-pink-100 text-pink-700'
                  }`}
                >
                  {patient.gender}
                </Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date of Birth
                </Label>
                <p className="font-medium">{formatDate(patient.dateOfBirth)}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> CNIC
                </Label>
                <Badge variant="outline" className="font-mono">
                  {patient.cnic}
                </Badge>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email
                </Label>
                <p className="font-medium">{patient.email}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Phone Number
                </Label>
                <p className="font-medium">{patient.phoneNumber || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Address
                </Label>
                <p className="font-medium">{patient.address || "Not provided"}</p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Medical Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Heart className="h-3 w-3" /> Blood Group
                </Label>
                <Badge className="bg-red-50 text-red-700 border-0">
                  {patient.bloodGroup || "Unknown"}
                </Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Allergies</Label>
                <p className="font-medium">{patient.allergies || "None recorded"}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs text-muted-foreground">Medical History</Label>
                <p className="font-medium text-sm">{patient.medicalHistory || "No records"}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs text-muted-foreground">Family History</Label>
                <p className="font-medium text-sm">{patient.familyHistory || "No records"}</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Emergency Contact
            </h3>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Emergency Contact</Label>
              <p className="font-medium">{patient.emergencyContact || "Not provided"}</p>
            </div>
          </div>

          {/* System Information */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              System Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Registered On</Label>
                <p className="text-muted-foreground">{formatDate(patient.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Account Status</Label>
                <Badge 
                  variant={patient.isActive ? "default" : "secondary"}
                  className={patient.isActive 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-slate-100 text-slate-500"}
                >
                  {patient.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
