"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { mutate } from "swr"
import { User, Heart, Phone, FileText, CreditCard } from "lucide-react"

// CNIC validation
const validateCNIC = (cnic: string): boolean => {
  if (!cnic) return true; // Optional field
  const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]$/;
  return cnicRegex.test(cnic);
};

const formatCNIC = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 5) return cleaned;
  if (cleaned.length <= 12) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`;
};

// Phone number validation
const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^(\+92|0)?[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ''));
};

const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 4) return cleaned;
  if (cleaned.length <= 7) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 11)}`;
};

export function OnboardingForm() {
  const [formData, setFormData] = useState({
    cnic: "",
    dateOfBirth: "",
    bloodGroup: "",
    phoneNumber: "",
    emergencyContact: "",
    address: "",
    allergies: "",
    medicalHistory: "",
    familyHistory: "",
  });
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "cnic") {
      setFormData((prev) => ({ ...prev, [name]: formatCNIC(value) }));
    } else if (name === "phoneNumber" || name === "emergencyContact") {
      setFormData((prev) => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBloodGroupChange = (value: string) => {
    setFormData((prev) => ({ ...prev, bloodGroup: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Validation
    if (formData.cnic && !validateCNIC(formData.cnic)) {
      setError("Invalid CNIC format. Use: 12345-1234567-1");
      setSubmitting(false);
      return;
    }
    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      setError("Invalid phone number format. Use: 0300-1234567");
      setSubmitting(false);
      return;
    }
    if (formData.emergencyContact && !validatePhoneNumber(formData.emergencyContact)) {
      setError("Invalid emergency contact format. Use: 0300-1234567");
      setSubmitting(false);
      return;
    }

    try {
      const payload: Record<string, any> = {
        cnic: formData.cnic || undefined,
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString()
          : undefined,
        bloodGroup: formData.bloodGroup || undefined,
        medicalHistory: formData.medicalHistory || undefined,
        familyHistory: formData.familyHistory || undefined,
        allergies: formData.allergies || undefined,
        address: formData.address || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        emergencyContact: formData.emergencyContact || undefined,
      }

      await api.put("/users/me/patient-profile", payload)

      // Refresh profile cache and route
      await mutate("/users/me")
      toast.success("Onboarding complete", { description: "Welcome to your patient dashboard." })
      router.replace("/patient/dashboard")
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Something went wrong");
      toast.error(err?.response?.data?.message || err.message || "Something went wrong", {
        description: "Your profile was not updated. Please try again."
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="max-w-3xl w-full shadow-lg border-2">
      <CardHeader className="bg-linear-to-r from-blue-50 to-cyan-50 border-b">
        <CardTitle className="text-2xl flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Complete Your Profile
        </CardTitle>
        <CardDescription className="text-base">
          Please provide your information to complete the onboarding process
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Personal Information</h3>
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="cnic">CNIC (Optional)</Label>
                <Input 
                  id="cnic" 
                  name="cnic" 
                  value={formData.cnic}
                  onChange={handleInputChange}
                  placeholder="12345-1234567-1"
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground">13-digit National ID Card number</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input 
                  id="dateOfBirth" 
                  name="dateOfBirth" 
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Medical Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Heart className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Medical Information</h3>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select value={formData.bloodGroup} onValueChange={handleBloodGroupChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea 
                id="allergies" 
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                rows={3}
                placeholder="List any known allergies (e.g., penicillin, peanuts, etc.)"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="medicalHistory">Medical History</Label>
              <Textarea 
                id="medicalHistory" 
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleInputChange}
                rows={3}
                placeholder="Past medical conditions, surgeries, chronic illnesses, etc."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="familyHistory">Family Medical History</Label>
              <Textarea 
                id="familyHistory" 
                name="familyHistory"
                value={formData.familyHistory}
                onChange={handleInputChange}
                rows={3}
                placeholder="Family medical conditions (diabetes, heart disease, cancer, etc.)"
              />
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Phone className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Contact Information</h3>
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input 
                  id="phoneNumber" 
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="0300-1234567"
                  maxLength={12}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input 
                  id="emergencyContact" 
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="0300-7654321"
                  maxLength={12}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Full residential address"
                rows={2}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={submitting} className="w-full h-12 text-base">
              {submitting ? "Saving..." : "Complete Onboarding"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
