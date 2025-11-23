"use client";

import { useState, useEffect } from "react";
import { getCheckupHistory } from "@/lib/api/doctor";
import type { RecentCheckup } from "@/lib/api/doctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Calendar, 
  Activity, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  ChevronRight,
  ArrowLeft,
  FileText
} from 'lucide-react';

export default function HistoryPage() {
  const [checkups, setCheckups] = useState<RecentCheckup[]>([]);
  const [selectedCheckup, setSelectedCheckup] = useState<RecentCheckup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCheckups() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCheckupHistory();
        setCheckups(data);
      } catch (err: any) {
        console.error("Error fetching checkup history:", err);
        setError(err.response?.data?.message || "Failed to load checkup history");
      } finally {
        setLoading(false);
      }
    }

    fetchCheckups();
  }, []);

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading checkup history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (selectedCheckup) {
    return <CheckupDetails checkup={selectedCheckup} onBack={() => setSelectedCheckup(null)} />;
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Medical History
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          View past checkups and patient records
        </p>
      </div>

      <div className="grid gap-4">
        {checkups.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No checkup history available</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          checkups.map((checkup) => (
            <Card
              key={checkup.id}
              className="border shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedCheckup(checkup)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">
                          {checkup.appointment.patient.firstName}{" "}
                          {checkup.appointment.patient.lastName}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(checkup.appointment.slot.startTime)}
                          </span>
                          <span>•</span>
                          <span>{formatTime(checkup.appointment.slot.startTime)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {checkup.diagnosis.split(".")[0].substring(0, 50)}
                          {checkup.diagnosis.length > 50 ? "..." : ""}
                        </Badge>
                        {checkup.medications && checkup.medications.length > 0 && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Pill className="w-3 h-3" />
                            {checkup.medications.length} Medication
                            {checkup.medications.length > 1 ? "s" : ""}
                          </Badge>
                        )}
                        {checkup.recommendedLabTests && checkup.recommendedLabTests.length > 0 && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <FlaskConical className="w-3 h-3" />
                            {checkup.recommendedLabTests.length} Test
                            {checkup.recommendedLabTests.length > 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function CheckupDetails({ checkup, onBack }: { checkup: RecentCheckup; onBack: () => void }) {
  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const patient = checkup.appointment.patient;
  const ageYears = "N/A"; // Patient DOB not included in API response

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-right-2">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      <div className="space-y-6">
        {/* Patient Header */}
        <Card className="border shadow-sm bg-gradient-to-r from-secondary/40 via-secondary/20 to-secondary/10">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1">
                <InfoItem
                  label="Patient"
                  value={`${patient.firstName} ${patient.lastName}`}
                />
                <InfoItem label="Age" value={`${ageYears} yrs`} />
                <InfoItem
                  label="Date"
                  value={formatDate(checkup.appointment.slot.startTime)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vitals */}
        <SectionCard icon={<Activity className="w-4 h-4" />} title="Vital Signs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <VitalCard label="Blood Pressure" value={checkup.bloodPressure || "N/A"} unit="mmHg" />
            <VitalCard label="Temperature" value={checkup.temperature || "N/A"} unit="°F" />
            <VitalCard label="Heart Rate" value={checkup.heartRate || "N/A"} unit="bpm" />
            <VitalCard label="Blood Sugar" value={checkup.bloodSugar || "N/A"} unit="mg/dL" />
          </div>
        </SectionCard>

        {/* Clinical Info */}
        <SectionCard icon={<Stethoscope className="w-4 h-4" />} title="Clinical Information">
          <div className="space-y-4">
            <InfoBlock label="Symptoms" content={checkup.symptoms || "No symptoms recorded"} />
            <InfoBlock label="Diagnosis" content={checkup.diagnosis} highlight />
            {checkup.notes && <InfoBlock label="Notes" content={checkup.notes} />}
          </div>
        </SectionCard>

        {/* Prescription */}
        <SectionCard icon={<Pill className="w-4 h-4" />} title="Prescription">
          <div className="space-y-3">
            {!checkup.medications || checkup.medications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No medications prescribed</p>
            ) : (
              checkup.medications.map((med) => (
                <div
                  key={med.drugId}
                  className="p-4 border rounded-lg bg-muted/30 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{med.drug?.name || "Unknown Drug"}</p>
                      {med.drug && (
                        <p className="text-xs text-muted-foreground">
                          {med.drug.formulaName && `${med.drug.formulaName} • `}
                          {med.drug.strength && `${med.drug.strength} • `}
                          {med.drug.dosageForm}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Dosage:</span>
                      <span className="ml-1 font-medium">{med.dosePerIntake}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequency:</span>
                      <span className="ml-1 font-medium">{med.timesPerDay}x daily</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="ml-1 font-medium">{med.totalDays} days</span>
                    </div>
                  </div>
                  {med.instructions && (
                    <p className="text-xs text-muted-foreground italic">
                      💡 {med.instructions}
                    </p>
                  )}
                </div>
              ))
            )}
            {checkup.additionalMedications && (
              <div className="p-3 bg-secondary/20 rounded-lg border border-dashed">
                <p className="text-xs font-medium text-foreground mb-1">
                  Additional Medications
                </p>
                <p className="text-xs text-muted-foreground">
                  {checkup.additionalMedications}
                </p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Lab Tests */}
        <SectionCard icon={<FlaskConical className="w-4 h-4" />} title="Lab Test Recommendations">
          <div className="space-y-3">
            {!checkup.recommendedLabTests || checkup.recommendedLabTests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lab tests recommended</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {checkup.recommendedLabTests.map((test) => (
                  <Badge key={test.id} variant="outline" className="py-1.5 px-3">
                    {test.name}
                  </Badge>
                ))}
              </div>
            )}
            {checkup.additionalTests && (
              <div className="p-3 bg-secondary/20 rounded-lg border border-dashed">
                <p className="text-xs font-medium text-foreground mb-1">
                  Additional Tests
                </p>
                <p className="text-xs text-muted-foreground">
                  {checkup.additionalTests}
                </p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <CardTitle className="text-sm font-semibold tracking-wide">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function VitalCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="p-4 bg-secondary/20 rounded-lg border">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-1">
        {value}
        <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
      </p>
    </div>
  );
}

function InfoBlock({ label, content, highlight = false }: { label: string; content: string; highlight?: boolean }) {
  return (
    <div className={`p-4 rounded-lg border ${highlight ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'}`}>
      <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-sm text-foreground leading-relaxed">{content}</p>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
        {label}
      </p>
      <p className="text-sm font-semibold text-foreground truncate" title={value}>
        {value}
      </p>
    </div>
  );
}
