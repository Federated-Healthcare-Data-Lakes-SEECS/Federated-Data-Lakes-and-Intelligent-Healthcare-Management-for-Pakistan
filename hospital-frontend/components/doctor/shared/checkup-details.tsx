"use client";

import { useState } from "react";
import type { CheckupData, RecentCheckup } from "@/lib/api/doctor";
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
  ArrowLeft,
  FileText,
  Lightbulb,
  Mic,
  MicOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Brain,
  FileSearch,
  Heart,
  Thermometer,
  Droplet,
  Clock,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { hasActualAllergies } from "@/lib/utils";

// Type that works with both CheckupData and RecentCheckup
interface CheckupDetailsProps {
  checkup: CheckupData | RecentCheckup;
  patientInfo?: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string | null;
    gender?: string | null;
    bloodGroup?: string | null;
    allergies?: string | null;
    medicalHistory?: string | null;
    familyHistory?: string | null;
  };
  onBack: () => void;
  showGlassmorphic?: boolean;
}

export function CheckupDetailsView({
  checkup,
  patientInfo,
  onBack,
  showGlassmorphic = false,
}: CheckupDetailsProps) {
  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Extract patient info from different checkup types
  const getPatientFromCheckup = () => {
    if ("appointment" in checkup && checkup.appointment?.patient) {
      const apt = checkup.appointment as any;
      return {
        firstName: apt.patient.firstName,
        lastName: apt.patient.lastName,
        dateOfBirth: apt.patient.dateOfBirth,
        gender: apt.patient.gender,
        bloodGroup: apt.patient.bloodGroup,
        allergies: apt.patient.allergies,
      };
    }
    return null;
  };

  const patient = patientInfo || getPatientFromCheckup();

  // Get appointment slot time
  const slotTime =
    "appointment" in checkup && checkup.appointment?.slot?.startTime
      ? checkup.appointment.slot.startTime
      : checkup.createdAt;

  // Get medications from different formats
  const medications =
    "medications" in checkup
      ? checkup.medications
      : "prescription" in checkup && checkup.prescription?.medications
      ? checkup.prescription.medications.map((m: any) => ({
          drugId: m.drug?.id,
          drug: m.drug,
          dosePerIntake: m.dosePerIntake,
          timesPerDay: m.timesPerDay,
          totalDays: m.totalDays,
          instructions: m.instructions,
        }))
      : [];

  // Get additional medications
  const additionalMedications =
    "additionalMedications" in checkup
      ? checkup.additionalMedications
      : "prescription" in checkup
      ? checkup.prescription?.additionalMedications
      : null;

  // Get lab tests from different formats
  const labTests =
    "recommendedLabTests" in checkup
      ? checkup.recommendedLabTests
      : "checkupTestRecommendation" in checkup &&
        checkup.checkupTestRecommendation?.recommendedLabTests
      ? checkup.checkupTestRecommendation.recommendedLabTests.map(
          (t: any) => t.labTest
        )
      : [];

  // Get additional tests
  const additionalTests =
    "additionalTests" in checkup
      ? checkup.additionalTests
      : "checkupTestRecommendation" in checkup
      ? checkup.checkupTestRecommendation?.additionalTests
      : null;

  // Get audio info
  const hasAudio = "hasAudio" in checkup ? checkup.hasAudio : false;
  const audioInfo = "audioInfo" in checkup ? checkup.audioInfo : null;

  // Get gap analysis
  const gapAnalysis =
    "gapAnalysis" in checkup
      ? checkup.gapAnalysis
      : "insights" in checkup
      ? checkup.insights
      : null;

  const cardClass = showGlassmorphic
    ? "border shadow-sm bg-white"
    : "border shadow-sm";

  const patientAge = patient?.dateOfBirth
    ? calculateAge(patient.dateOfBirth)
    : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      <div className="space-y-6">
        {/* Patient Header */}
        {patient && (
          <Card
            className={`${cardClass} bg-blue-50/30`}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border-2 border-blue-200">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <InfoItem
                    label="Patient"
                    value={`${patient.firstName} ${patient.lastName}`}
                  />
                  {patientAge && (
                    <InfoItem label="Age" value={`${patientAge} years`} />
                  )}
                  {patient.gender && (
                    <InfoItem
                      label="Gender"
                      value={patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                    />
                  )}
                  <InfoItem
                    label="Date"
                    value={formatDate(slotTime)}
                  />
                </div>
              </div>
              {(patient.bloodGroup || hasActualAllergies(patient.allergies)) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                  {patient.bloodGroup && (
                    <Badge variant="outline" className="gap-1">
                      <Droplet className="w-3 h-3" /> {patient.bloodGroup}
                    </Badge>
                  )}
                  {hasActualAllergies(patient.allergies) && (
                    <Badge
                      variant="outline"
                      className="gap-1 text-orange-700 border-orange-300 bg-orange-50 dark:bg-orange-950/30"
                    >
                      <AlertCircle className="w-3 h-3" /> Allergies:{" "}
                      {patient.allergies}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Vitals */}
        <SectionCard
          icon={<Activity className="w-4 h-4" />}
          title="Vital Signs"
          className={cardClass}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <VitalCard
              icon={<Heart className="w-4 h-4 text-red-500" />}
              label="Blood Pressure"
              value={checkup.bloodPressure || "N/A"}
              unit="mmHg"
              color="red"
            />
            <VitalCard
              icon={<Thermometer className="w-4 h-4 text-orange-500" />}
              label="Temperature"
              value={checkup.temperature || "N/A"}
              unit="°F"
              color="orange"
            />
            <VitalCard
              icon={<Activity className="w-4 h-4 text-pink-500" />}
              label="Heart Rate"
              value={checkup.heartRate || "N/A"}
              unit="bpm"
              color="pink"
            />
            <VitalCard
              icon={<Droplet className="w-4 h-4 text-blue-500" />}
              label="Blood Sugar"
              value={checkup.bloodSugar || "N/A"}
              unit="mg/dL"
              color="blue"
            />
          </div>
        </SectionCard>

        {/* Clinical Info */}
        <SectionCard
          icon={<Stethoscope className="w-4 h-4" />}
          title="Clinical Information"
          className={cardClass}
        >
          <div className="space-y-4">
            <InfoBlock
              label="Symptoms"
              content={checkup.symptoms || "No symptoms recorded"}
            />
            <InfoBlock label="Diagnosis" content={checkup.diagnosis} highlight />
            {checkup.notes && <InfoBlock label="Notes" content={checkup.notes} />}
          </div>
        </SectionCard>

        {/* Prescription */}
        <SectionCard
          icon={<Pill className="w-4 h-4" />}
          title="Prescription"
          className={cardClass}
        >
          <div className="space-y-3">
            {!medications || medications.length === 0 ? (
              <div className="p-4 rounded-lg border bg-muted/30 text-center">
                <Pill className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-base text-muted-foreground">
                  No medications prescribed from inventorys
                </p>
              </div>
            ) : (
              medications.map((med: any, idx: number) => (
                <div
                  key={med.drugId || idx}
                  className="p-4 border rounded-lg bg-green-50/50 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground text-base">
                        {med.drug?.name || "Unknown Drug"}
                      </p>
                      {med.drug && (
                        <p className="text-sm text-muted-foreground">
                          {med.drug.formulaName && `${med.drug.formulaName} • `}
                          {med.drug.strength && `${med.drug.strength} • `}
                          {med.drug.dosageForm}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="p-2 rounded bg-white/50 dark:bg-slate-800/50">
                      <span className="text-muted-foreground">Dosage</span>
                      <p className="font-medium">{med.dosePerIntake}</p>
                    </div>
                    <div className="p-2 rounded bg-white/50 dark:bg-slate-800/50">
                      <span className="text-muted-foreground">Frequency</span>
                      <p className="font-medium">{med.timesPerDay}x daily</p>
                    </div>
                    <div className="p-2 rounded bg-white/50 dark:bg-slate-800/50">
                      <span className="text-muted-foreground">Duration</span>
                      <p className="font-medium">{med.totalDays} days</p>
                    </div>
                  </div>
                  {med.instructions && (
                    <p className="text-sm text-muted-foreground italic flex items-center gap-1 pt-1">
                      <Lightbulb className="w-3 h-3" /> {med.instructions}
                    </p>
                  )}
                </div>
              ))
            )}
            {/* Additional Medications */}
            <div className="p-3 rounded-lg border bg-muted/30">
              <p className="text-sm font-medium text-foreground mb-1">
                Additional Medications
              </p>
              <p className="text-sm text-muted-foreground">
                {additionalMedications?.trim()
                  ? additionalMedications
                  : "No additional medications provided"}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Lab Tests */}
        <SectionCard
          icon={<FlaskConical className="w-4 h-4" />}
          title="Lab Test Recommendations"
          className={cardClass}
        >
          <div className="space-y-3">
            {!labTests || labTests.length === 0 ? (
              <div className="p-4 rounded-lg border bg-muted/30 text-center">
                <FlaskConical className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-base text-muted-foreground">
                  No lab tests recommended from templates
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {labTests.map((test: any) => (
                  <Badge
                    key={test.id}
                    variant="outline"
                    className="py-1.5 px-3 bg-purple-50 border-purple-200 text-sm"
                  >
                    <FlaskConical className="w-3 h-3 mr-1" />
                    {test.name}
                  </Badge>
                ))}
              </div>
            )}
            {/* Additional Tests */}
            <div className="p-3 rounded-lg border bg-muted/30">
              <p className="text-sm font-medium text-foreground mb-1">
                Additional Tests
              </p>
              <p className="text-sm text-muted-foreground">
                {additionalTests?.trim()
                  ? additionalTests
                  : "No additional tests noted"}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Audio Analysis Section */}
        <AudioAnalysisSection
          hasAudio={hasAudio}
          audioInfo={audioInfo}
          cardClass={cardClass}
        />

        {/* Gap Analysis Section */}
        {gapAnalysis && (
          <SectionCard
            icon={<FileSearch className="w-4 h-4" />}
            title="Gap Analysis"
            className={cardClass}
          >
            <div className="p-4 rounded-lg border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {gapAnalysis}
              </p>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <CardTitle className="text-base font-semibold tracking-wide">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function VitalCard({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    red: "bg-red-50 border-red-200",
    orange: "bg-orange-50 border-orange-200",
    pink: "bg-pink-50 border-pink-200",
    blue: "bg-blue-50 border-blue-200",
  };

  return (
    <div
      className={`p-4 ${colorClasses[color]} rounded-lg border`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-sm text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold text-foreground">
        {value}
        <span className="text-base font-normal text-muted-foreground ml-1">
          {unit}
        </span>
      </p>
    </div>
  );
}

function InfoBlock({
  label,
  content,
  highlight = false,
}: {
  label: string;
  content: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        highlight ? "bg-primary/5 border-primary/20" : "bg-muted/20"
      }`}
    >
      <p className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-base text-foreground leading-relaxed">{content}</p>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
        {label}
      </p>
      <p className="text-base font-semibold text-foreground truncate" title={value}>
        {value}
      </p>
    </div>
  );
}

// Audio Analysis Section Component
function AudioAnalysisSection({
  hasAudio,
  audioInfo,
  cardClass,
}: {
  hasAudio?: boolean;
  audioInfo?: any;
  cardClass: string;
}) {
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [isExtractedInfoOpen, setIsExtractedInfoOpen] = useState(true);

  // No audio recorded
  if (!hasAudio) {
    return (
      <SectionCard
        icon={<MicOff className="w-4 h-4" />}
        title="Audio Analysis"
        className={cardClass}
      >
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
          <MicOff className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-base font-medium text-foreground">
              No Audio Recording
            </p>
            <p className="text-sm text-muted-foreground">
              This checkup was completed without audio recording
            </p>
          </div>
        </div>
      </SectionCard>
    );
  }

  // Audio is still processing
  if (
    !audioInfo ||
    audioInfo.status === "PENDING" ||
    audioInfo.status === "PROCESSING"
  ) {
    return (
      <SectionCard
        icon={<Mic className="w-4 h-4" />}
        title="Audio Analysis"
        className={cardClass}
      >
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
          <div>
            <p className="text-base font-medium text-foreground">
              {audioInfo?.status === "PROCESSING"
                ? "Processing Audio..."
                : "Waiting to Process"}
            </p>
            <p className="text-sm text-muted-foreground">
              AI analysis is in progress. This may take a few moments.
            </p>
          </div>
        </div>
      </SectionCard>
    );
  }

  // Audio processing failed
  if (audioInfo.status === "FAILED") {
    return (
      <SectionCard
        icon={<AlertCircle className="w-4 h-4" />}
        title="Audio Analysis"
        className={cardClass}
      >
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Processing Failed
            </p>
            <p className="text-xs text-muted-foreground">
              {audioInfo.errorMessage ||
                "An error occurred while processing the audio recording"}
            </p>
          </div>
        </div>
      </SectionCard>
    );
  }

  // Audio processing completed
  return (
    <SectionCard
      icon={<Brain className="w-4 h-4" />}
      title="AI Audio Analysis"
      className={cardClass}
    >
      <div className="space-y-4">
        {/* Processing Status */}
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-muted-foreground">
            Processed{" "}
            {audioInfo.processedAt
              ? new Date(audioInfo.processedAt).toLocaleString()
              : "successfully"}
          </span>
        </div>

        {/* Transcription - Collapsible */}
        {audioInfo.transcription && (
          <Collapsible open={isTranscriptOpen} onOpenChange={setIsTranscriptOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-3 h-auto border rounded-lg bg-muted/30 hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Transcription</span>
                </div>
                {isTranscriptOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="p-4 rounded-lg border bg-muted/20">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {audioInfo.transcription}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Extracted Clinical Information */}
        {audioInfo.extractedInfo &&
          Object.keys(audioInfo.extractedInfo).length > 0 && (
            <Collapsible
              open={isExtractedInfoOpen}
              onOpenChange={setIsExtractedInfoOpen}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto border rounded-lg bg-primary/5 hover:bg-primary/10 border-primary/20"
                >
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="font-medium">
                      Extracted Clinical Information
                    </span>
                  </div>
                  {isExtractedInfoOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <ExtractedInfoDisplay data={audioInfo.extractedInfo} />
              </CollapsibleContent>
            </Collapsible>
          )}
      </div>
    </SectionCard>
  );
}

// Component to render extracted info in a clean, structured format
function ExtractedInfoDisplay({ data }: { data: Record<string, any> }) {
  const renderValue = (value: any, depth: number = 0): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">Not specified</span>;
    }

    if (typeof value === "boolean") {
      return (
        <Badge variant={value ? "default" : "secondary"} className="text-xs">
          {value ? "Yes" : "No"}
        </Badge>
      );
    }

    if (typeof value === "string" || typeof value === "number") {
      return <span className="text-foreground">{String(value)}</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground italic">None</span>;
      }

      // Check if it's an array of simple values
      if (
        value.every(
          (item) => typeof item === "string" || typeof item === "number"
        )
      ) {
        return (
          <div className="flex flex-wrap gap-1.5">
            {value.map((item, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {String(item)}
              </Badge>
            ))}
          </div>
        );
      }

      // Array of objects
      return (
        <div className="space-y-2 mt-1">
          {value.map((item, idx) => (
            <div key={idx} className="p-2 rounded border bg-muted/20 text-sm">
              {typeof item === "object" ? (
                <ExtractedInfoDisplay data={item} />
              ) : (
                String(item)
              )}
            </div>
          ))}
        </div>
      );
    }

    // Object
    if (typeof value === "object") {
      return (
        <div className={`${depth > 0 ? "pl-3 border-l-2 border-muted" : ""}`}>
          <ExtractedInfoDisplay data={value} />
        </div>
      );
    }

    return String(value);
  };

  const formatKey = (key: string): string => {
    // Convert camelCase or snake_case to Title Case with spaces
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="divide-y">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="p-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {formatKey(key)}
              </span>
              <div className="text-sm">{renderValue(value, 0)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
