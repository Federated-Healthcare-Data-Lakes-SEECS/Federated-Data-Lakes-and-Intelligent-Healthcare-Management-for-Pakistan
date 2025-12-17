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
import { Badge } from "@/components/ui/badge";

import { Loader2, UserPlus, CheckCircle2, User, Heart, Phone, Mail, ArrowRight, ArrowLeft, MapPin, Activity, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  registerPatient,
  formatCNIC,
  validateCNIC,
  type RegisterPatientRequest,
  type Patient,
} from "@/lib/api-receptionist";

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

export default function RegisterPatientPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
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
    } else if (name === "phoneNumber" || name === "emergencyContact") {
      setFormData((prev) => ({ ...prev, [name]: formatPhoneNumber(value) }));
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

  const validateStep1 = (): boolean => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (!/(?=.*[a-z])/.test(formData.password)) {
      setError("Password must contain at least one lowercase letter");
      return false;
    }
    if (!/(?=.*[A-Z])/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter");
      return false;
    }
    if (!/(?=.*\d)/.test(formData.password)) {
      setError("Password must contain at least one number");
      return false;
    }
    if (!/(?=.*[\W_])/.test(formData.password)) {
      setError("Password must contain at least one special character");
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = (): boolean => {
    if (formData.cnic && !validateCNIC(formData.cnic)) {
      setError("Invalid CNIC format. Use: 12345-1234567-1");
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep3 = (): boolean => {
    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      setError("Invalid phone number format. Use: 0300-1234567 or +923001234567");
      return false;
    }
    if (formData.emergencyContact && !validatePhoneNumber(formData.emergencyContact)) {
      setError("Invalid emergency contact format. Use: 0300-1234567 or +923001234567");
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Final validation
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
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
      setCurrentStep(1);
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
    setCurrentStep(1);
  };

  if (success && registeredPatient) {
    return (
      <div className="p-6 md:p-8 min-h-screen bg-slate-50/50">
        <Card className="max-w-3xl mx-auto border-2 border-green-200 shadow-lg bg-white">
          <CardHeader className="bg-linear-to-r from-green-50 to-emerald-50 border-b border-green-100 -mt-6 pt-8 rounded-t-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-green-700">Patient Registered Successfully!</CardTitle>
                <CardDescription className="text-base text-green-600 mt-1">
                  The patient can now book appointments with their credentials
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="p-5 bg-linear-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <h3 className="font-semibold text-slate-900 text-lg mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                Patient Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm">
                  <span className="text-sm text-green-600 block mb-1">First Name</span>
                  <span className="font-medium text-slate-900 text-base">
                    {registeredPatient.firstName}
                  </span>
                </div>
                <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm">
                  <span className="text-sm text-green-600 block mb-1">Last Name</span>
                  <span className="font-medium text-slate-900 text-base">
                    {registeredPatient.lastName}
                  </span>
                </div>
                <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm">
                  <span className="text-sm text-green-600 block mb-1">Email</span>
                  <span className="font-medium text-slate-900 text-base break-all">{registeredPatient.email}</span>
                </div>
                <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm">
                  <span className="text-sm text-green-600 block mb-1">Gender</span>
                  <span className="font-medium text-slate-900 text-base">{registeredPatient.gender}</span>
                </div>
              </div>
            </div>

            <Button onClick={handleRegisterAnother} className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg">
              <UserPlus className="h-5 w-5 mr-2" />
              Register Another Patient
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
          Register New Patient
        </h1>
        <p className="text-muted-foreground text-base mt-1">
          Register walk-in patients who don't have an account
        </p>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: "Basic Info", icon: User },
              { step: 2, label: "Medical Info", icon: Heart },
              { step: 3, label: "Contact Info", icon: Phone },
              { step: 4, label: "Additional", icon: Activity },
            ].map(({ step, label, icon: Icon }, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                      currentStep >= step
                        ? "bg-emerald-600 text-white shadow-lg"
                        : "bg-slate-200 text-slate-500"
                    )}
                  >
                    {currentStep > step ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm mt-2 font-medium",
                      currentStep >= step ? "text-emerald-600" : "text-slate-500"
                    )}
                  >
                    {label}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={cn(
                      "h-1 flex-1 mx-2 transition-all",
                      currentStep > step ? "bg-emerald-600" : "bg-slate-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="border shadow-lg bg-white">
          <CardHeader className="bg-linear-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 -mt-8 pt-8 rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              {currentStep === 1 && (
                <>
                  <User className="w-5 h-5 text-emerald-600" />
                  Basic Information
                </>
              )}
              {currentStep === 2 && (
                <>
                  <Heart className="w-5 h-5 text-emerald-600" />
                  Medical Information
                </>
              )}
              {currentStep === 3 && (
                <>
                  <Phone className="w-5 h-5 text-emerald-600" />
                  Contact Information
                </>
              )}
              {currentStep === 4 && (
                <>
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Additional Details
                </>
              )}
            </CardTitle>
            <CardDescription className="text-base">
              {currentStep === 1 && "Enter patient's basic details (all fields with * are required)"}
              {currentStep === 2 && "Add medical history and health information (optional)"}
              {currentStep === 3 && "Provide contact details (optional)"}
              {currentStep === 4 && "Add any additional medical information (optional)"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-base text-slate-700 flex items-center gap-1">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        className="border-slate-300 h-11 text-base"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-base text-slate-700 flex items-center gap-1">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        className="border-slate-300 h-11 text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base text-slate-700 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="patient@example.com"
                      className="border-slate-300 h-11 text-base"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-base text-slate-700 flex items-center gap-1">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Minimum 8 characters"
                          className="border-slate-300 h-11 text-base pr-10"
                          required
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
                      <p className="text-sm text-muted-foreground">
                        Must contain uppercase, lowercase, number and special character
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-base text-slate-700 flex items-center gap-1">
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.gender} onValueChange={handleGenderChange}>
                        <SelectTrigger className="border-slate-300 h-11 text-base w-full">
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
              )}

              {/* Step 2: Medical Information */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="cnic" className="text-base text-slate-700">
                        CNIC (Optional)
                      </Label>
                      <Input
                        id="cnic"
                        name="cnic"
                        value={formData.cnic}
                        onChange={handleInputChange}
                        placeholder="12345-1234567-1"
                        maxLength={15}
                        className="border-slate-300 h-11 text-base"
                      />
                      <p className="text-sm text-muted-foreground">Format: 12345-1234567-1</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-base text-slate-700">
                        Date of Birth (Optional)
                      </Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="border-slate-300 h-11 text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup" className="text-base text-slate-700">
                      Blood Group (Optional)
                    </Label>
                    <Select value={formData.bloodGroup} onValueChange={handleBloodGroupChange}>
                      <SelectTrigger className="border-slate-300 h-11 text-base w-full">
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

                  <div className="space-y-2">
                    <Label htmlFor="allergies" className="text-base text-slate-700">
                      Allergies (Optional)
                    </Label>
                    <Textarea
                      id="allergies"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      placeholder="Any known allergies (e.g., penicillin, peanuts)"
                      rows={3}
                      className="border-slate-300 text-base resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Contact Information */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-base text-slate-700 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Phone Number (Optional)
                      </Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="0300-1234567"
                        maxLength={12}
                        className="border-slate-300 h-11 text-base"
                      />
                      <p className="text-sm text-muted-foreground">Format: 0300-1234567</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact" className="text-base text-slate-700 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Emergency Contact (Optional)
                      </Label>
                      <Input
                        id="emergencyContact"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        placeholder="0300-7654321"
                        maxLength={12}
                        className="border-slate-300 h-11 text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-base text-slate-700 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Address (Optional)
                    </Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Full residential address"
                      rows={3}
                      className="border-slate-300 text-base resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Additional Details */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="medicalHistory" className="text-base text-slate-700">
                      Medical History (Optional)
                    </Label>
                    <Textarea
                      id="medicalHistory"
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={handleInputChange}
                      placeholder="Past medical conditions, surgeries, chronic illnesses, etc."
                      rows={4}
                      className="border-slate-300 text-base resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="familyHistory" className="text-base text-slate-700">
                      Family Medical History (Optional)
                    </Label>
                    <Textarea
                      id="familyHistory"
                      name="familyHistory"
                      value={formData.familyHistory}
                      onChange={handleInputChange}
                      placeholder="Family medical conditions (diabetes, heart disease, cancer, etc.)"
                      rows={4}
                      className="border-slate-300 text-base resize-none"
                    />
                  </div>

                  <div className="p-5 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      Ready to Register
                    </h4>
                    <p className="text-base text-slate-600">
                      Click "Register Patient" to complete the registration process.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-12 text-base"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                )}
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
                  >
                    Next
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Register Patient
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
