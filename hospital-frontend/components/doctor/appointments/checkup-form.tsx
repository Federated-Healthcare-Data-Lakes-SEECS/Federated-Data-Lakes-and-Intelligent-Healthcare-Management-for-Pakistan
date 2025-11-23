"use client";

import { useState, useMemo } from "react";
import { createCheckup } from "@/lib/api/doctor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, X, Activity, Stethoscope, Pill, FlaskConical, ClipboardList, Undo2 } from 'lucide-react';

import type { UpcomingAppointment, Drug, LabTest } from "@/lib/api/doctor";

interface CheckupFormProps {
  appointment: UpcomingAppointment;
  drugs: Drug[];
  labTests: LabTest[];
}

interface MedicationForm {
  drugId: number;
  name: string;
  strength?: string;
  dosageForm?: string;
  formulaName?: string;
  quantity: number;
  dosage: string;
  dailyFrequency: number;
  durationDays: number;
  guidelines: string;
}

interface TestForm {
  testId: number;
  name: string;
}

export default function CheckupForm({
  appointment,
  drugs,
  labTests,
}: CheckupFormProps) {
  const [formData, setFormData] = useState({
    bloodPressure: "",
    temperature: "",
    heartRate: "",
    bloodSugar: "",
    symptoms: "",
    diagnosis: "",
    notes: "",
    additionalMedications: "",
    additionalTests: "",
  });
  const [selectedDrugs, setSelectedDrugs] = useState<MedicationForm[]>([]);
  const [selectedLabTests, setSelectedLabTests] = useState<TestForm[]>([]);
  const [selectedDrug, setSelectedDrug] = useState("");
  const [selectedTest, setSelectedTest] = useState("");

  // UI state for collapsible sections
  const [showPrescription, setShowPrescription] = useState(true);
  const [showLabTests, setShowLabTests] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isFormValid = useMemo(() => formData.symptoms.trim() !== '' && formData.diagnosis.trim() !== '', [formData]);
  const isDirty = useMemo(() => {
    return Object.values(formData).some(v => v.trim() !== '') || selectedDrugs.length > 0 || selectedLabTests.length > 0;
  }, [formData, selectedDrugs, selectedLabTests]);

  const resetForm = () => {
    if (!confirm('Reset form? All unsaved changes will be lost.')) return;
    setFormData({
      bloodPressure: "",
      temperature: "",
      heartRate: "",
      bloodSugar: "",
      symptoms: "",
      diagnosis: "",
      notes: "",
      additionalMedications: "",
      additionalTests: "",
    });
    setSelectedDrugs([]);
    setSelectedLabTests([]);
  };

  const handleAddDrug = () => {
    if (selectedDrug) {
      const drug = drugs.find((d) => d.id === parseInt(selectedDrug));
      if (drug && !selectedDrugs.find((d) => d.drugId === drug.id)) {
        setSelectedDrugs([
          ...selectedDrugs,
          {
            drugId: drug.id,
            name: drug.name,
            strength: drug.strength,
            dosageForm: drug.dosageForm,
            formulaName: drug.formulaName,
            quantity: 0,
            dosage: "",
            dailyFrequency: 0,
            durationDays: 0,
            guidelines: "",
          },
        ]);
        setSelectedDrug("");
      }
    }
  };

  const handleRemoveDrug = (drugId: number) => {
    setSelectedDrugs(selectedDrugs.filter((d) => d.drugId !== drugId));
  };

  const handleUpdateDrug = (drugId: number, field: keyof MedicationForm, value: string | number) => {
    setSelectedDrugs(
      selectedDrugs.map((drug) =>
        drug.drugId === drugId ? { ...drug, [field]: value } : drug
      )
    );
  };

  const handleAddTest = () => {
    if (selectedTest) {
      const test = labTests.find((t) => t.id === parseInt(selectedTest));
      if (test && !selectedLabTests.find((t) => t.testId === test.id)) {
        setSelectedLabTests([...selectedLabTests, { testId: test.id, name: test.name }]);
        setSelectedTest("");
      }
    }
  };

  const handleRemoveTest = (testId: number) => {
    setSelectedLabTests(selectedLabTests.filter((t) => t.testId !== testId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setSubmitting(true);
    
    try {
      const checkupData = {
        appointmentId: appointment.id,
        bloodPressure: formData.bloodPressure || undefined,
        temperature: formData.temperature || undefined,
        heartRate: formData.heartRate || undefined,
        bloodSugar: formData.bloodSugar || undefined,
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        notes: formData.notes || undefined,
        additionalMedications: formData.additionalMedications || undefined,
        additionalTests: formData.additionalTests || undefined,
        medications: selectedDrugs.map(({ drugId, dosage, dailyFrequency, durationDays, guidelines }) => ({
          drugId,
          dosePerIntake: dosage,
          timesPerDay: dailyFrequency,
          totalDays: durationDays,
          instructions: guidelines || undefined,
        })),
        recommendedLabTestIds: selectedLabTests.map(({ testId }) => testId),
      };
      
      await createCheckup(checkupData);
      alert("Checkup saved successfully!");
      
      // Reset form after successful submission
      setTimeout(() => {
        resetForm();
      }, 300);
    } catch (error: any) {
      console.error("Error submitting checkup:", error);
      alert(error.response?.data?.message || "Failed to save checkup. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const ageYears = useMemo(() => {
    if (!appointment.patient.dateOfBirth) return "N/A";
    const dob = new Date(appointment.patient.dateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age;
  }, [appointment.patient.dateOfBirth]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Info Header */}
      <Card className="border shadow-sm bg-gradient-to-r from-secondary/40 via-secondary/20 to-secondary/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
              <InfoItem label="Patient" value={`${appointment.patient.firstName} ${appointment.patient.lastName}`} />
              <InfoItem label="Age" value={`${ageYears} yrs`} />
              <InfoItem label="Blood Group" value={appointment.patient.bloodGroup || "N/A"} />
              <InfoItem label="Appt Time" value={new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
            </div>
            <div className="text-xs md:text-sm text-muted-foreground md:w-48">
              <p className="line-clamp-3"><strong>History:</strong> {appointment.patient.medicalHistory || 'N/A'}</p>
              {appointment.patient.allergies && <p className="mt-1"><strong>Allergies:</strong> {appointment.patient.allergies}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs */}
      <SectionCard icon={<Activity className="w-4 h-4" />} title="Vital Signs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <VitalInput id="bp" label="Blood Pressure" placeholder="120/80" value={formData.bloodPressure} onChange={v => setFormData({ ...formData, bloodPressure: v })} />
          <VitalInput id="temp" label="Temperature" placeholder="98.6°F" value={formData.temperature} onChange={v => setFormData({ ...formData, temperature: v })} />
            <VitalInput id="hr" label="Heart Rate" placeholder="72 bpm" value={formData.heartRate} onChange={v => setFormData({ ...formData, heartRate: v })} />
            <VitalInput id="bs" label="Blood Sugar" placeholder="110 mg/dL" value={formData.bloodSugar} onChange={v => setFormData({ ...formData, bloodSugar: v })} />
        </div>
      </SectionCard>

      {/* Clinical Information */}
      <SectionCard icon={<Stethoscope className="w-4 h-4" />} title="Clinical Information">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symptoms" className="text-xs font-medium">Symptoms *</Label>
            <Textarea id="symptoms" rows={3} required value={formData.symptoms} onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })} placeholder="Describe presenting complaints, onset, duration..." className="resize-none" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="diagnosis" className="text-xs font-medium">Diagnosis *</Label>
            <Textarea id="diagnosis" rows={3} required value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} placeholder="Primary diagnosis, differentials..." className="resize-none" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs font-medium">Additional Notes</Label>
            <Textarea id="notes" rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Plan, follow-up, education, lifestyle advice..." className="resize-none" />
          </div>
        </div>
      </SectionCard>

      {/* Prescription */}
      <SectionCard icon={<Pill className="w-4 h-4" />} title="Prescription" collapsible isOpen={showPrescription} onToggle={() => setShowPrescription(v => !v)}>
        {showPrescription && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Select value={selectedDrug} onValueChange={setSelectedDrug}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select drug..." />
                </SelectTrigger>
                <SelectContent>
                  {drugs.map((drug) => (
                    <SelectItem key={drug.id} value={drug.id.toString()}>
                      {drug.name} • {drug.strength}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddDrug} size="sm" variant="secondary" disabled={!selectedDrug}>
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>

            <div className="space-y-3">
              {selectedDrugs.length === 0 && (
                <p className="text-xs text-muted-foreground">No medications added yet.</p>
              )}
              {selectedDrugs.map((drug) => (
                <div key={drug.drugId} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{drug.name}</p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveDrug(drug.drugId)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    <MiniInput label="Dosage" value={drug.dosage} onChange={v => handleUpdateDrug(drug.drugId, 'dosage', v)} placeholder="500mg" />
                    <MiniInput label="Freq / Day" type="number" value={drug.dailyFrequency || ''} onChange={v => handleUpdateDrug(drug.drugId, 'dailyFrequency', parseInt(v) || 0)} placeholder="2" />
                    <MiniInput label="Duration" type="number" value={drug.durationDays || ''} onChange={v => handleUpdateDrug(drug.drugId, 'durationDays', parseInt(v) || 0)} placeholder="5" suffix="days" />
                    <MiniInput label="Quantity" type="number" value={drug.quantity || ''} onChange={v => handleUpdateDrug(drug.drugId, 'quantity', parseInt(v) || 0)} placeholder="10" />
                    <MiniInput label="Guidelines" value={drug.guidelines} onChange={v => handleUpdateDrug(drug.drugId, 'guidelines', v)} placeholder="After meals" />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalMedications" className="text-xs">Additional Medications</Label>
              <Textarea id="additionalMedications" rows={2} value={formData.additionalMedications} onChange={(e) => setFormData({ ...formData, additionalMedications: e.target.value })} placeholder="Any additional medications not in the list..." className="resize-none" />
            </div>
          </div>
        )}
      </SectionCard>

      {/* Lab Tests */}
      <SectionCard icon={<FlaskConical className="w-4 h-4" />} title="Lab Test Recommendations" collapsible isOpen={showLabTests} onToggle={() => setShowLabTests(v => !v)}>
        {showLabTests && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Select value={selectedTest} onValueChange={setSelectedTest}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select lab test..." />
                </SelectTrigger>
                <SelectContent>
                  {labTests.map((test) => (
                    <SelectItem key={test.id} value={test.id.toString()}>
                      {test.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddTest} size="sm" variant="secondary" disabled={!selectedTest}>
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedLabTests.length === 0 && (
                <p className="text-xs text-muted-foreground">No tests added yet.</p>
              )}
              {selectedLabTests.map((test) => (
                <Badge key={test.testId} variant="secondary" className="gap-1 pr-1">
                  {test.name}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveTest(test.testId)} />
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalTests" className="text-xs">Additional Tests</Label>
              <Textarea id="additionalTests" rows={2} value={formData.additionalTests} onChange={(e) => setFormData({ ...formData, additionalTests: e.target.value })} placeholder="Any additional tests not in the list..." className="resize-none" />
            </div>
          </div>
        )}
      </SectionCard>

      {/* Sticky Action Bar */}
      <div className="h-12" />
      <div className="sticky bottom-4 left-0 right-0 z-10">
        <div className="flex flex-col sm:flex-row gap-2 justify-end bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 p-3 rounded-lg border shadow-sm">
          <div className="flex gap-2 flex-wrap">
            <Button type="button" variant="ghost" size="sm" onClick={resetForm} disabled={!isDirty || submitting}>
              <Undo2 className="w-4 h-4" /> Reset
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={!isDirty || submitting}>
              <ClipboardList className="w-4 h-4" /> Save Draft
            </Button>
            <Button type="submit" size="sm" disabled={!isFormValid || submitting} className="gap-2">
              {submitting ? 'Saving...' : 'Submit Checkup'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

// Reusable section wrapper
function SectionCard({ icon, title, children, collapsible = false, isOpen = true, onToggle }: { icon: React.ReactNode; title: string; children: React.ReactNode; collapsible?: boolean; isOpen?: boolean; onToggle?: () => void }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
            <CardTitle className="text-sm font-semibold tracking-wide">{title}</CardTitle>
          </div>
          {collapsible && (
            <Button type="button" variant="ghost" size="sm" onClick={onToggle} className="text-xs">
              {isOpen ? 'Hide' : 'Show'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-1 space-y-4">{children}</CardContent>
    </Card>
  );
}

function VitalInput({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-9" />
    </div>
  );
}

function MiniInput({ label, value, onChange, placeholder, type = 'text', suffix }: { label: string; value: any; onChange: (v: string) => void; placeholder?: string; type?: string; suffix?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase tracking-wide font-medium">{label}</Label>
      <div className="flex items-center gap-1">
        <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-8 text-xs" />
        {suffix && <span className="text-[10px] text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
      <p className="text-sm font-semibold text-foreground truncate" title={value}>{value}</p>
    </div>
  );
}
