"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Activity, Pill, TestTube, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { getRecentCheckups, type Checkup } from "@/lib/api-patient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Medical History</h1>
        <p className="text-muted-foreground mt-2">
          View your complete medical records and checkup history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Checkup Records ({checkups.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : checkups.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No medical history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {checkups.map((checkup) => {
                const isExpanded = expandedCheckup === checkup.id;
                return (
                  <div key={checkup.id} className="border rounded-lg">
                    <button
                      onClick={() => toggleCheckup(checkup.id)}
                      className="w-full px-4 py-4 hover:bg-accent/50 rounded-lg transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 text-left flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-semibold">
                              Dr. {checkup.doctor.firstName} {checkup.doctor.lastName}
                            </p>
                            <Badge variant="outline">{checkup.doctor.specialization}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(checkup.createdAt).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-6 border-t">
                    {/* Diagnosis */}
                    {checkup.diagnosis && (
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Diagnosis
                        </h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                          {checkup.diagnosis}
                        </p>
                      </div>
                    )}

                    {/* Symptoms */}
                    {checkup.symptoms && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Symptoms</h4>
                        <p className="text-sm text-muted-foreground">{checkup.symptoms}</p>
                      </div>
                    )}

                    {/* Vital Signs */}
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Vital Signs
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {checkup.bloodPressure && (
                          <div className="p-3 border rounded">
                            <p className="text-xs text-muted-foreground">Blood Pressure</p>
                            <p className="font-medium">{checkup.bloodPressure} mmHg</p>
                          </div>
                        )}
                        {checkup.temperature && (
                          <div className="p-3 border rounded">
                            <p className="text-xs text-muted-foreground">Temperature</p>
                            <p className="font-medium">{checkup.temperature}°F</p>
                          </div>
                        )}
                        {checkup.heartRate && (
                          <div className="p-3 border rounded">
                            <p className="text-xs text-muted-foreground">Heart Rate</p>
                            <p className="font-medium">{checkup.heartRate} bpm</p>
                          </div>
                        )}
                        {checkup.bloodSugar && (
                          <div className="p-3 border rounded">
                            <p className="text-xs text-muted-foreground">Blood Sugar</p>
                            <p className="font-medium">{checkup.bloodSugar} mg/dL</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Medications */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Prescribed Medications
                        {checkup.medications && checkup.medications.length > 0 && (
                          <span className="text-muted-foreground">({checkup.medications.length})</span>
                        )}
                      </h4>
                      {checkup.medications && checkup.medications.length > 0 ? (
                        <div className="space-y-2">
                          {checkup.medications.map((med, idx) => (
                            <div key={idx} className="p-3 border rounded bg-blue-50 dark:bg-blue-950/20">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium">{med.drug.name}</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {med.dosePerIntake} - {med.timesPerDay} time(s) per day
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Duration: {med.totalDays} days
                                  </p>
                                  {med.instructions && (
                                    <p className="text-sm mt-2 italic">{med.instructions}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground p-3 bg-muted rounded">
                          No medications prescribed from inventory
                        </p>
                      )}
                      {checkup.additionalMedications && (
                        <div className="p-3 border rounded bg-amber-50 dark:bg-amber-950/20">
                          <p className="text-sm font-medium mb-1">Additional Medications:</p>
                          <p className="text-sm text-muted-foreground">{checkup.additionalMedications}</p>
                        </div>
                      )}
                    </div>

                    {/* Lab Tests */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <TestTube className="h-4 w-4" />
                        Recommended Lab Tests
                        {checkup.recommendedLabTests && checkup.recommendedLabTests.length > 0 && (
                          <span className="text-muted-foreground">({checkup.recommendedLabTests.length})</span>
                        )}
                      </h4>
                      {checkup.recommendedLabTests && checkup.recommendedLabTests.length > 0 ? (
                        <div className="space-y-2">
                          {checkup.recommendedLabTests.map((test, idx) => (
                            <div key={idx} className="p-3 border rounded bg-green-50 dark:bg-green-950/20">
                              <p className="font-medium">{test.name}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {test.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground p-3 bg-muted rounded">
                          No lab tests recommended from templates
                        </p>
                      )}
                      {checkup.additionalTests && (
                        <div className="p-3 border rounded bg-purple-50 dark:bg-purple-950/20">
                          <p className="text-sm font-medium mb-1">Additional Tests Required:</p>
                          <p className="text-sm text-muted-foreground">{checkup.additionalTests}</p>
                        </div>
                      )}
                    </div>

                    {/* Additional Notes */}
                    {checkup.notes && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Doctor's Notes</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                          {checkup.notes}
                        </p>
                      </div>
                    )}

                    {/* Appointment Details */}
                    {checkup.appointmentId && (
                      <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
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
