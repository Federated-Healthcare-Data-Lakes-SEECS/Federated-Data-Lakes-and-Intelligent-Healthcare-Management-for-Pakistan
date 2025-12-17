"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Activity, 
  Pill, 
  TestTube, 
  ChevronDown, 
  ChevronUp, 
  Loader2,
  Mic,
  MicOff,
  AlertCircle,
  CheckCircle2,
  Clock,
  Brain,
  FileSearch,
  Heart
} from "lucide-react";
import { getRecentCheckups, type Checkup } from "@/lib/api-patient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function PatientHistoryPage() {
  const [checkups, setCheckups] = useState<Checkup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCheckup, setExpandedCheckup] = useState<number | null>(null);

  useEffect(() => {
    async function loadCheckups() {
      try {
        setLoading(true);
        // Load a larger number for history (e.g., 50 checkups)
        const data = await getRecentCheckups(50);
        setCheckups(data);
      } catch (err: any) {
        console.error("Failed to load checkups:", err);
        toast.error("Failed to load medical history");
      } finally {
        setLoading(false);
      }
    }

    loadCheckups();
  }, []);

  const toggleCheckup = (id: number) => {
    setExpandedCheckup(expandedCheckup === id ? null : id);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Medical History</h1>
          <p className="text-muted-foreground text-base md:text-lg mt-1">View your complete medical records and checkup history</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Records</p>
          <p className="text-lg font-semibold">{checkups.length}</p>
        </div>
      </header>

      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold tracking-wide flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Checkup Records
            </CardTitle>
            <Badge variant="secondary" className="text-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
              {checkups.length} Records
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : checkups.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No medical history available</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {checkups.map((checkup) => {
                const isExpanded = expandedCheckup === checkup.id;
                return (
                  <div key={checkup.id} className="border rounded-lg bg-slate-50 hover:bg-emerald-50/30 transition-all">
                    <button
                      onClick={() => toggleCheckup(checkup.id)}
                      className="w-full px-4 py-4 rounded-lg transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 text-left flex-1">
                          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                            <Heart className="w-5 h-5 text-white" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <p className="font-semibold text-base">
                                Dr. {checkup.doctor.firstName} {checkup.doctor.lastName}
                              </p>
                              <Badge variant="outline" className="text-sm">{checkup.doctor.specialization}</Badge>
                              {/* Audio Status Badge */}
                              {checkup.hasAudio && checkup.audioInfo && (
                                <Badge 
                                  variant={
                                    checkup.audioInfo.status === 'COMPLETED' ? 'default' :
                                    checkup.audioInfo.status === 'FAILED' ? 'destructive' :
                                    'secondary'
                                  } 
                                  className="text-sm gap-1"
                                >
                                  {checkup.audioInfo.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                  {checkup.audioInfo.status === 'PROCESSING' && <Loader2 className="w-3 h-3 animate-spin" />}
                                  {checkup.audioInfo.status === 'COMPLETED' && <Mic className="w-3 h-3" />}
                                  {checkup.audioInfo.status === 'FAILED' && <AlertCircle className="w-3 h-3" />}
                                  {checkup.audioInfo.status === 'COMPLETED' ? 'AI Analyzed' : `Audio ${checkup.audioInfo.status.toLowerCase()}`}
                                </Badge>
                              )}
                            </div>
                            <p className="text-base text-muted-foreground">
                              {new Date(checkup.createdAt).toLocaleDateString("en-PK", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {checkup.diagnosis && (
                            <Badge variant="outline" className="text-sm bg-white">Has Diagnosis</Badge>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-6 border-t mt-2">
                    {/* Diagnosis */}
                    {checkup.diagnosis && (
                      <div className="space-y-2 pt-4">
                        <h4 className="font-semibold flex items-center gap-2 text-base">
                          <FileText className="h-4 w-4 text-emerald-600" />
                          Diagnosis
                        </h4>
                        <p className="text-base text-muted-foreground bg-white p-3 rounded border">
                          {checkup.diagnosis}
                        </p>
                      </div>
                    )}

                    {/* Symptoms */}
                    {checkup.symptoms && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-base">Symptoms</h4>
                        <p className="text-base text-muted-foreground">{checkup.symptoms}</p>
                      </div>
                    )}

                    {/* Vital Signs */}
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2 text-base">
                        <Activity className="h-4 w-4 text-emerald-600" />
                        Vital Signs
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {checkup.bloodPressure && (
                          <div className="p-3 border rounded-lg bg-white">
                            <p className="text-sm text-muted-foreground">Blood Pressure</p>
                            <p className="font-medium text-base">{checkup.bloodPressure} mmHg</p>
                          </div>
                        )}
                        {checkup.temperature && (
                          <div className="p-3 border rounded-lg bg-white">
                            <p className="text-sm text-muted-foreground">Temperature</p>
                            <p className="font-medium text-base">{checkup.temperature}°F</p>
                          </div>
                        )}
                        {checkup.heartRate && (
                          <div className="p-3 border rounded-lg bg-white">
                            <p className="text-sm text-muted-foreground">Heart Rate</p>
                            <p className="font-medium text-base">{checkup.heartRate} bpm</p>
                          </div>
                        )}
                        {checkup.bloodSugar && (
                          <div className="p-3 border rounded-lg bg-white">
                            <p className="text-sm text-muted-foreground">Blood Sugar</p>
                            <p className="font-medium text-base">{checkup.bloodSugar} mg/dL</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Medications */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2 text-base">
                        <Pill className="h-4 w-4 text-blue-600" />
                        Prescribed Medications
                        {checkup.medications && checkup.medications.length > 0 && (
                          <span className="text-muted-foreground">({checkup.medications.length})</span>
                        )}
                      </h4>
                      {checkup.medications && checkup.medications.length > 0 ? (
                        <div className="space-y-2">
                          {checkup.medications.map((med, idx) => (
                            <div key={idx} className="p-3 border rounded-lg bg-blue-50/50">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-base">{med.drug.name}</p>
                                  <p className="text-base text-muted-foreground mt-1">
                                    {med.dosePerIntake} - {med.timesPerDay} time(s) per day
                                  </p>
                                  <p className="text-base text-muted-foreground">
                                    Duration: {med.totalDays} days
                                  </p>
                                  {med.instructions && (
                                    <p className="text-base mt-2 italic">{med.instructions}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-base text-muted-foreground p-3 bg-white rounded-lg border">
                          No medications prescribed from inventory
                        </p>
                      )}
                      {checkup.additionalMedications && (
                        <div className="p-3 border rounded-lg bg-amber-50/50">
                          <p className="text-base font-medium mb-1">Additional Medications:</p>
                          <p className="text-base text-muted-foreground">{checkup.additionalMedications}</p>
                        </div>
                      )}
                    </div>

                    {/* Lab Tests */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2 text-base">
                        <TestTube className="h-4 w-4 text-purple-600" />
                        Recommended Lab Tests
                        {checkup.recommendedLabTests && checkup.recommendedLabTests.length > 0 && (
                          <span className="text-muted-foreground">({checkup.recommendedLabTests.length})</span>
                        )}
                      </h4>
                      {checkup.recommendedLabTests && checkup.recommendedLabTests.length > 0 ? (
                        <div className="space-y-2">
                          {checkup.recommendedLabTests.map((test, idx) => (
                            <div key={idx} className="p-3 border rounded-lg bg-green-50/50">
                              <p className="font-medium text-base">{test.name}</p>
                              <p className="text-base text-muted-foreground mt-1">
                                {test.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-base text-muted-foreground p-3 bg-white rounded-lg border">
                          No lab tests recommended from templates
                        </p>
                      )}
                      {checkup.additionalTests && (
                        <div className="p-3 border rounded-lg bg-purple-50/50">
                          <p className="text-base font-medium mb-1">Additional Tests Required:</p>
                          <p className="text-base text-muted-foreground">{checkup.additionalTests}</p>
                        </div>
                      )}
                    </div>

                    {/* Additional Notes */}
                    {checkup.notes && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-base">Doctor's Notes</h4>
                        <p className="text-base text-muted-foreground bg-white p-3 rounded-lg border">
                          {checkup.notes}
                        </p>
                      </div>
                    )}

                    {/* Audio Analysis Status & Gap Analysis Section */}
                    <AudioInsightsSection checkup={checkup} />

                    {/* Appointment Details */}
                    {checkup.appointmentId && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Appointment ID: #{checkup.appointmentId} | Date:{" "}
                          {new Date(checkup.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Audio Insights Section for Patient View
function AudioInsightsSection({ checkup }: { checkup: Checkup }) {
  const [isGapOpen, setIsGapOpen] = useState(true);

  // No audio and no gap analysis - nothing to show
  if (!checkup.hasAudio && !checkup.gapAnalysis) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Audio Analysis Status */}
      {checkup.hasAudio && (
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2 text-base">
            <Brain className="h-4 w-4" />
            AI Analysis
          </h4>
          
          {/* Processing states */}
          {checkup.audioInfo?.status === 'PENDING' || checkup.audioInfo?.status === 'PROCESSING' ? (
            <div className="flex items-center gap-3 p-3 border rounded bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
              <div>
                <p className="text-base font-medium">
                  {checkup.audioInfo?.status === 'PROCESSING' ? 'Analyzing consultation...' : 'Waiting for analysis'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Your consultation recording is being analyzed by AI
                </p>
              </div>
            </div>
          ) : checkup.audioInfo?.status === 'FAILED' ? (
            <div className="flex items-center gap-3 p-3 border rounded bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-base font-medium">Analysis Unavailable</p>
                <p className="text-sm text-muted-foreground">
                  The AI analysis could not be completed for this consultation
                </p>
              </div>
            </div>
          ) : checkup.audioInfo?.status === 'COMPLETED' ? (
            <div className="flex items-center gap-3 p-3 border rounded bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-base font-medium">AI Analysis Complete</p>
                <p className="text-sm text-muted-foreground">
                  Your consultation was analyzed to extract key health insights
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Gap Analysis - Important health information detected */}
      {checkup.gapAnalysis && (
        <Collapsible open={isGapOpen} onOpenChange={setIsGapOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between p-3 h-auto border rounded-lg bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/30"
            >
              <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-amber-800 dark:text-amber-300 text-base">Additional Health Insights</span>
              </div>
              {isGapOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="p-4 rounded-lg border bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800">
              <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
                {checkup.gapAnalysis}
              </p>
              <p className="text-sm text-muted-foreground mt-3 italic">
                These insights were identified from your consultation recording and may provide additional context about your health.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
