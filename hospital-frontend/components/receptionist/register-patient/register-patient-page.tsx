"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loader2, UserPlus, CheckCircle2 } from "lucide-react";
import {
  registerPatient,
  formatCNIC,
  validateCNIC,
  type RegisterPatientRequest,
  type Patient,
} from "@/lib/api-receptionist";

export default function RegisterPatientPage() {
  const [formData, setFormData] = useState<RegisterPatientRequest>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "MALE",
    cnic: "",
    dateOfBirth: "",
    bloodGroup: "",
    phoneNumber: "",
    address: "",
    emergencyContact: "",
    allergies: "",
    medicalHistory: "",
    familyHistory: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Special handling for CNIC formatting
    if (name === "cnic") {
      setFormData((prev) => ({ ...prev, [name]: formatCNIC(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleGenderChange = (value: "MALE" | "FEMALE" | "OTHER") => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const handleBloodGroupChange = (value: string) => {
    setFormData((prev) => ({ ...prev, bloodGroup: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!formData.cnic.trim()) {
      setError("CNIC is required");
      return;
    }
    if (!validateCNIC(formData.cnic)) {
      setError("Invalid CNIC format. Use: 12345-1234567-1");
      return;
    }

    try {
      setLoading(true);
      const response = await registerPatient(formData);
      setRegisteredPatient(response.patient);
      setSuccess(true);
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        gender: "MALE",
        cnic: "",
        dateOfBirth: "",
        bloodGroup: "",
        phoneNumber: "",
        address: "",
        emergencyContact: "",
        allergies: "",
        medicalHistory: "",
        familyHistory: "",
      });
    } catch (err: any) {
      console.error("Failed to register patient:", err);
      setError(err.response?.data?.message || "Failed to register patient");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAnother = () => {
    setSuccess(false);
    setRegisteredPatient(null);
    setError(null);
  };

  if (success && registeredPatient) {
    return (
      <div className="p-8">
        <Card className="max-w-2xl mx-auto border-green-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <CardTitle className="text-green-700">Patient Registered Successfully!</CardTitle>
                <CardDescription>
                  The patient can now book appointments with their credentials
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-green-50 rounded-lg space-y-2">
              <h3 className="font-medium">Patient Details:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  <span className="font-medium">
                    {registeredPatient.firstName} {registeredPatient.lastName}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span className="font-medium">{registeredPatient.email}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">CNIC:</span>{" "}
                  <span className="font-medium">{registeredPatient.cnic}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Patient ID:</span>{" "}
                  <span className="font-medium">#{registeredPatient.id}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleRegisterAnother} className="flex-1">
                <UserPlus className="h-4 w-4 mr-2" />
                Register Another Patient
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Register New Patient
          </CardTitle>
          <CardDescription>
            Register walk-in patients who don't have an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="patient@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnic">
                    CNIC <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cnic"
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleInputChange}
                    placeholder="12345-1234567-1"
                    maxLength={15}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.gender} onValueChange={handleGenderChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Medical Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select value={formData.bloodGroup} onValueChange={handleBloodGroupChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  placeholder="Any known allergies (e.g., penicillin, peanuts)"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleInputChange}
                  placeholder="Past medical conditions, surgeries, etc."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="familyHistory">Family History</Label>
                <Textarea
                  id="familyHistory"
                  name="familyHistory"
                  value={formData.familyHistory}
                  onChange={handleInputChange}
                  placeholder="Family medical conditions (diabetes, heart disease, etc.)"
                  rows={2}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+92-300-1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="+92-300-7654321"
                  />
                </div>
              </div>
              <div className="space-y-2">
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

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register Patient
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
