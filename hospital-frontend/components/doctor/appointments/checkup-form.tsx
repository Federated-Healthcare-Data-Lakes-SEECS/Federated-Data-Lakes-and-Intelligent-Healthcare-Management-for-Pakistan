"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { submitCheckup, saveDraft, getCheckupByAppointmentId } from "@/lib/api/doctor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Plus, 
  X, 
  Activity, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  ClipboardList, 
  Undo2, 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  Square,
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { 
  useAudioRecording, 
  formatDuration, 
  getAudioRecordingPreference, 
  setAudioRecordingPreference 
} from "@/hooks/use-audio-recording";
import type { UpcomingAppointment, Drug, LabTest, CheckupData } from "@/lib/api/doctor";

interface CheckupFormProps {
  appointment: UpcomingAppointment;
  drugs: Drug[];
  labTests: LabTest[];
  onCheckupComplete?: () => void;
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
  onCheckupComplete,
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

  // UI state
  const [showPrescription, setShowPrescription] = useState(true);
  const [showLabTests, setShowLabTests] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  // Existing checkup state
  const [existingCheckup, setExistingCheckup] = useState<CheckupData | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Audio recording
  const [audioEnabled, setAudioEnabled] = useState(() => getAudioRecordingPreference());
  const audioRecording = useAudioRecording();

  // Load existing checkup data on mount
  useEffect(() => {
    async function loadExistingCheckup() {
      try {
        setLoadingExisting(true);
        const checkup = await getCheckupByAppointmentId(appointment.id);
        if (checkup) {
          setExistingCheckup(checkup);
          setIsCompleted(!checkup.isDraft);
          
          // Pre-fill form with existing data
          setFormData({
            bloodPressure: checkup.bloodPressure || "",
            temperature: checkup.temperature || "",
            heartRate: checkup.heartRate || "",
            bloodSugar: checkup.bloodSugar || "",
            symptoms: checkup.symptoms || "",
            diagnosis: checkup.diagnosis || "",
            notes: checkup.notes || "",
            additionalMedications: checkup.prescription?.additionalMedications || "",
            additionalTests: checkup.checkupTestRecommendation?.additionalTests || "",
          });
          
          // Pre-fill medications
          if (checkup.prescription?.medications) {
            setSelectedDrugs(checkup.prescription.medications.map(med => ({
              drugId: med.drug.id,
              name: med.drug.name,
              strength: med.drug.strength,
              dosageForm: med.drug.dosageForm,
              formulaName: med.drug.formulaName,
              quantity: 0,
              dosage: med.dosePerIntake,
              dailyFrequency: med.timesPerDay,
              durationDays: med.totalDays,
              guidelines: med.instructions || "",
            })));
          }
          
          // Pre-fill lab tests
          if (checkup.checkupTestRecommendation?.recommendedLabTests) {
            setSelectedLabTests(checkup.checkupTestRecommendation.recommendedLabTests.map(test => ({
              testId: test.labTest.id,
              name: test.labTest.name,
            })));
          }
        }
      } catch (error) {
        console.error("Error loading existing checkup:", error);
      } finally {
        setLoadingExisting(false);
      }
    }
    
    loadExistingCheckup();
  }, [appointment.id]);

  // Start recording when form loads and audio is enabled
  useEffect(() => {
    if (!loadingExisting && audioEnabled && !isCompleted && audioRecording.isSupported && !audioRecording.isRecording) {
      audioRecording.startRecording();
    }
    
    return () => {
      // Stop recording when component unmounts
      if (audioRecording.isRecording) {
        audioRecording.resetRecording();
      }
    };
  }, [loadingExisting, audioEnabled, isCompleted]);

  // Handle audio preference toggle
  const handleAudioToggle = useCallback((enabled: boolean) => {
    setAudioEnabled(enabled);
    setAudioRecordingPreference(enabled);
    
    if (enabled && !audioRecording.isRecording && audioRecording.isSupported) {
      audioRecording.startRecording();
    } else if (!enabled && audioRecording.isRecording) {
      audioRecording.resetRecording();
    }
  }, [audioRecording]);

  const isFormValid = useMemo(() => 
    formData.symptoms.trim() !== '' && formData.diagnosis.trim() !== '', 
    [formData]
  );
  
  const isDirty = useMemo(() => {
    return Object.values(formData).some(v => v.trim() !== '') || 
           selectedDrugs.length > 0 || 
           selectedLabTests.length > 0;
  }, [formData, selectedDrugs, selectedLabTests]);

  const resetForm = () => {
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
    setShowResetDialog(false);
    audioRecording.resetRecording();
    if (audioEnabled && audioRecording.isSupported) {
      audioRecording.startRecording();
    }
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

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    
    try {
      const draftData = {
        appointmentId: appointment.id,
        bloodPressure: formData.bloodPressure || undefined,
        temperature: formData.temperature || undefined,
        heartRate: formData.heartRate || undefined,
        bloodSugar: formData.bloodSugar || undefined,
        symptoms: formData.symptoms || undefined,
        diagnosis: formData.diagnosis || undefined,
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
      
      await saveDraft(draftData);
      toast.success("Draft saved successfully!");
      onCheckupComplete?.();
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast.error(error.response?.data?.message || "Failed to save draft. Please try again.");
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();
    if (!isFormValid) return;
    
    // Stop recording if active and get the blob directly
    let audioBlob: Blob | null = null;
    if (audioEnabled && audioRecording.isRecording) {
      audioBlob = await audioRecording.stopRecording();
    } else if (audioEnabled && audioRecording.audioBlob) {
      // Use existing blob if recording was already stopped
      audioBlob = audioRecording.audioBlob;
    }
    
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
      
      await submitCheckup(checkupData, audioBlob);
      
      toast.success("Checkup submitted successfully!");
      setIsCompleted(true);
      onCheckupComplete?.();
    } catch (error: any) {
      console.error("Error submitting checkup:", error);
      toast.error(error.response?.data?.message || "Failed to submit checkup. Please try again.");
      // Restart recording if it was active
      if (audioEnabled && audioRecording.isSupported) {
        audioRecording.startRecording();
      }
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

  if (loadingExisting) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isCompleted) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Checkup Completed</h3>
            <p className="text-muted-foreground">
              This checkup has been submitted and the appointment is marked as completed.
            </p>
            {existingCheckup?.insights && (
              <Card className="bg-purple-50/50 border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{existingCheckup.insights}</p>
                </CardContent>
              </Card>
            )}
            {existingCheckup?.hasAudio && !existingCheckup?.insights && (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Audio is being processed for insights...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* Audio Recording Status Bar */}
      {/* <Card className={`border shadow-sm ${audioRecording.isRecording ? 'border-red-300 bg-red-50/50' : ''}`}>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="audio-recording"
                  checked={audioEnabled}
                  onCheckedChange={handleAudioToggle}
                  disabled={isCompleted}
                />
                <Label htmlFor="audio-recording" className="text-base font-medium cursor-pointer">
                  Record Audio for AI Analysis
                </Label>
              </div>
              
              {audioEnabled && !audioRecording.isSupported && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Not Supported
                </Badge>
              )}
              
              {audioEnabled && audioRecording.error && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {audioRecording.error}
                </Badge>
              )}
            </div>
            
            {audioEnabled && audioRecording.isSupported && (
              <div className="flex items-center gap-3">
                {audioRecording.isRecording && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${audioRecording.isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                      <span className="text-base font-mono">{formatDuration(audioRecording.duration)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {audioRecording.isPaused ? (
                        <Button type="button" size="sm" variant="ghost" onClick={audioRecording.resumeRecording}>
                          <Play className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button type="button" size="sm" variant="ghost" onClick={audioRecording.pauseRecording}>
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                      <Button type="button" size="sm" variant="ghost" onClick={audioRecording.stopRecording}>
                        <Square className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
                
                {!audioRecording.isRecording && audioRecording.audioBlob && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Mic className="w-3 h-3" />
                      Recording saved ({formatDuration(audioRecording.duration)})
                    </Badge>
                    <Button type="button" size="sm" variant="ghost" onClick={audioRecording.resetRecording}>
                      <X className="w-4 h-4" />
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={audioRecording.startRecording}>
                      Re-record
                    </Button>
                  </div>
                )}
                
                {!audioRecording.isRecording && !audioRecording.audioBlob && (
                  <Button type="button" size="sm" variant="outline" onClick={audioRecording.startRecording} className="gap-2">
                    <Mic className="w-4 h-4" />
                    Start Recording
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card> */}

      
      {/* Patient Info Header */}
      <Card className="border shadow-sm bg-linear-to-br from-blue-50/50 to-slate-50/50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InfoItem label="Patient" value={`${appointment.patient.firstName} ${appointment.patient.lastName}`} />
              <InfoItem label="Age" value={`${ageYears} yrs`} />
              <InfoItem label="Blood Group" value={appointment.patient.bloodGroup || "N/A"} />
              <InfoItem label="Appt Time" value={new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
            </div>
            <div className="pt-3 border-t border-blue-100 space-y-2">
              <div className="p-3 rounded-lg bg-white/60 border border-slate-200">
                <p className="text-sm font-medium text-slate-700 mb-1">Medical History</p>
                <p className="text-base text-slate-900 leading-relaxed">{appointment.patient.medicalHistory ? appointment.patient.medicalHistory.slice(0, 600) : 'No medical history recorded'}</p>
              </div>
              {appointment.patient.allergies && appointment.patient.allergies.trim() && appointment.patient.allergies !== 'None' && (
                <div className="p-3 rounded-lg bg-orange-50/80 border border-orange-200">
                  <p className="text-sm font-medium text-orange-800 mb-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Allergies (Important!)
                  </p>
                  <p className="text-base text-orange-900 leading-relaxed font-medium">{appointment.patient.allergies}</p>
                </div>
              )}
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
            <Label htmlFor="symptoms" className="text-sm font-medium">Symptoms *</Label>
            <Textarea id="symptoms" rows={3} required value={formData.symptoms} onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })} placeholder="Describe presenting complaints, onset, duration..." className="resize-none text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="diagnosis" className="text-sm font-medium">Diagnosis *</Label>
            <Textarea id="diagnosis" rows={3} required value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} placeholder="Primary diagnosis, differentials..." className="resize-none text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
            <Textarea id="notes" rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Plan, follow-up, education, lifestyle advice..." className="resize-none text-base" />
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
                <p className="text-sm text-muted-foreground">No medications added yet.</p>
              )}
              {selectedDrugs.map((drug) => (
                <div key={drug.drugId} className="p-4 border rounded-lg space-y-3 bg-green-50/30 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-base">{drug.name}</p>
                      {(drug.strength || drug.dosageForm) && (
                        <p className="text-sm text-muted-foreground">
                          {drug.strength && `${drug.strength}`}{drug.strength && drug.dosageForm && ' • '}{drug.dosageForm}
                        </p>
                      )}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveDrug(drug.drugId)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
              <Label htmlFor="additionalMedications" className="text-sm font-medium">Additional Medications</Label>
              <Textarea id="additionalMedications" rows={2} value={formData.additionalMedications} onChange={(e) => setFormData({ ...formData, additionalMedications: e.target.value })} placeholder="Any additional medications not in the list..." className="resize-none text-base" />
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
                <p className="text-sm text-muted-foreground">No tests added yet.</p>
              )}
              {selectedLabTests.map((test) => (
                <Badge key={test.testId} variant="secondary" className="gap-1 pr-1 text-sm py-1.5 px-3">
                  {test.name}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveTest(test.testId)} />
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalTests" className="text-sm font-medium">Additional Tests</Label>
              <Textarea id="additionalTests" rows={2} value={formData.additionalTests} onChange={(e) => setFormData({ ...formData, additionalTests: e.target.value })} placeholder="Any additional tests not in the list..." className="resize-none text-base" />
            </div>
          </div>
        )}
      </SectionCard>

      {/* Sticky Action Bar */}
      <div className="sticky bottom-2 left-0 right-0 z-10 mt-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-white/95 backdrop-blur-sm border border-slate-200 p-4 rounded-xl shadow-lg">
          {/* Audio Recording Controls - Left Side */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Switch
                id="audio-recording"
                checked={audioEnabled}
                onCheckedChange={handleAudioToggle}
                disabled={isCompleted}
              />
              <Label htmlFor="audio-recording" className="text-sm font-medium cursor-pointer">
                AI Audio
              </Label>
            </div>
            
            {audioEnabled && !audioRecording.isSupported && (
              <Badge variant="destructive" className="gap-1 text-xs">
                <AlertCircle className="w-3 h-3" />
                Not Supported
              </Badge>
            )}
            
            {audioEnabled && audioRecording.error && (
              <Badge variant="destructive" className="gap-1 text-xs">
                <AlertCircle className="w-3 h-3" />
                Error
              </Badge>
            )}
            
            {audioEnabled && audioRecording.isSupported && (
              <>
                {audioRecording.isRecording && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${audioRecording.isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                      <span className="text-sm font-mono">{formatDuration(audioRecording.duration)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {audioRecording.isPaused ? (
                        <Button type="button" size="sm" variant="ghost" onClick={audioRecording.resumeRecording} className="h-8 w-8 p-0">
                          <Play className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <Button type="button" size="sm" variant="ghost" onClick={audioRecording.pauseRecording} className="h-8 w-8 p-0">
                          <Pause className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button type="button" size="sm" variant="ghost" onClick={audioRecording.stopRecording} className="h-8 w-8 p-0">
                        <Square className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </>
                )}
                
                {!audioRecording.isRecording && audioRecording.audioBlob && (
                  <>
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Mic className="w-3 h-3" />
                      Saved ({formatDuration(audioRecording.duration)})
                    </Badge>
                    <Button type="button" size="sm" variant="ghost" onClick={audioRecording.resetRecording} className="h-8 px-2">
                      <X className="w-3.5 h-3.5" />
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={audioRecording.startRecording} className="h-8 text-xs">
                      Re-record
                    </Button>
                  </>
                )}
                
                {!audioRecording.isRecording && !audioRecording.audioBlob && (
                  <Button type="button" size="sm" variant="outline" onClick={audioRecording.startRecording} className="gap-1.5 h-8 text-xs">
                    <Mic className="w-3.5 h-3.5" />
                    Start
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Action Buttons - Right Side */}
          <div className="flex gap-2 flex-wrap justify-end w-full lg:w-auto">
            <Button type="button" variant="ghost" onClick={() => setShowResetDialog(true)} disabled={!isDirty || submitting || savingDraft}>
              <Undo2 className="w-4 h-4 mr-2" /> Reset
            </Button>
            <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={!isDirty || submitting || savingDraft}>
              {savingDraft ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ClipboardList className="w-4 h-4 mr-2" />} 
              {savingDraft ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button type="button" onClick={() => handleSubmit({} as React.FormEvent)} disabled={!isFormValid || submitting || savingDraft} className="gap-2 bg-blue-600 hover:bg-blue-700">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitting ? 'Submitting...' : 'Submit Checkup'}
            </Button>
          </div>
        </div>
      </div>
      
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset the form? All unsaved changes will be lost and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetForm} className="bg-red-600 hover:bg-red-700">
              Reset Form
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Reusable section wrapper
function SectionCard({ icon, title, children, collapsible = false, isOpen = true, onToggle }: { icon: React.ReactNode; title: string; children: React.ReactNode; collapsible?: boolean; isOpen?: boolean; onToggle?: () => void }) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
            <CardTitle className="text-base font-semibold tracking-wide">{title}</CardTitle>
          </div>
          {collapsible && (
            <Button type="button" variant="ghost" size="sm" onClick={onToggle} className="text-sm">
              {isOpen ? 'Hide' : 'Show'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function VitalInput({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-10 text-base" />
    </div>
  );
}

function MiniInput({ label, value, onChange, placeholder, type = 'text', suffix }: { label: string; value: any; onChange: (v: string) => void; placeholder?: string; type?: string; suffix?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide font-medium">{label}</Label>
      <div className="flex items-center gap-1">
        <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-9 text-sm" />
        {suffix && <span className="text-xs text-muted-foreground whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
      <p className="text-base font-semibold text-foreground truncate" title={value}>{value}</p>
    </div>
  );
}
