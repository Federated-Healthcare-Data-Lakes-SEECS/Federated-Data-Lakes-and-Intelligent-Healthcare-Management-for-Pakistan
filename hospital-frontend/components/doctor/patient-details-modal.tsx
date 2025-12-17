"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPatientDetails, type PatientDetails } from "@/lib/api/doctor";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Droplet, AlertTriangle, Phone, MapPin, User, FileText, Pill, FlaskConical, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasActualAllergies, hasActualMedicalHistory } from "@/lib/utils";

interface PatientDetailsModalProps {
  patientId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PatientDetailsModal({ patientId, isOpen, onClose }: PatientDetailsModalProps) {
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatientDetails() {
      if (!patientId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getPatientDetails(patientId);
        setPatient(data);
      } catch (err: any) {
        console.error("Error fetching patient details:", err);
        setError(err.response?.data?.message || "Failed to load patient details");
      } finally {
        setLoading(false);
      }
    }

    if (isOpen && patientId) {
      fetchPatientDetails();
    }
  }, [patientId, isOpen]);

  const calculateAge = (dob?: string) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const ageDiff = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Patient Details
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading patient details...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && patient && (
          <div className="space-y-6">
            {/* Patient Info */}
            <Card className="border shadow-sm bg-blue-50/30">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Full Name</p>
                        <p className="font-semibold">{patient.firstName} {patient.lastName}</p>
                      </div>
                    </div>

                    {patient.dateOfBirth && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Age / DOB</p>
                          <p className="font-semibold">
                            {calculateAge(patient.dateOfBirth)} years • {new Date(patient.dateOfBirth).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {patient.bloodGroup && (
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-red-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Blood Group</p>
                          <p className="font-semibold">{patient.bloodGroup}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Gender</p>
                        <p className="font-semibold capitalize">{patient.gender.toLowerCase()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {patient.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="font-semibold">{patient.phoneNumber}</p>
                        </div>
                      </div>
                    )}

                    {patient.emergencyContact && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-orange-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Emergency Contact</p>
                          <p className="font-semibold">{patient.emergencyContact}</p>
                        </div>
                      </div>
                    )}

                    {patient.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Address</p>
                          <p className="font-semibold text-sm">{patient.address}</p>
                        </div>
                      </div>
                    )}

                    {patient.cnic && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">CNIC</p>
                          <p className="font-semibold">{patient.cnic}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card className="border shadow-sm bg-orange-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hasActualAllergies(patient.allergies) && (
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Allergies</p>
                    <p className="text-sm mt-1 p-2 bg-orange-50 border border-orange-200 rounded">{patient.allergies}</p>
                  </div>
                )}

                {hasActualMedicalHistory(patient.medicalHistory) && (
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Medical History</p>
                    <p className="text-sm mt-1 p-2 bg-blue-50 border border-blue-200 rounded">{patient.medicalHistory}</p>
                  </div>
                )}

                {hasActualMedicalHistory(patient.familyHistory) && (
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Family History</p>
                    <p className="text-sm mt-1 p-2 bg-purple-50 border border-purple-200 rounded">{patient.familyHistory}</p>
                  </div>
                )}

                {!hasActualAllergies(patient.allergies) && !hasActualMedicalHistory(patient.medicalHistory) && !hasActualMedicalHistory(patient.familyHistory) && (
                  <p className="text-sm text-muted-foreground italic">No medical history recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Appointment History */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Appointment History ({patient.appointments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.appointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No appointments yet</p>
                ) : (
                  <div className="space-y-4">
                    {patient.appointments.map((apt) => (
                      <div key={apt.id} className="p-4 border rounded-lg bg-muted/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-sm">
                              {new Date(apt.date).toLocaleDateString('en-PK', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {apt.status.toLowerCase()}
                          </Badge>
                        </div>

                        {apt.reason && (
                          <p className="text-sm"><span className="font-medium">Reason:</span> {apt.reason}</p>
                        )}

                        {apt.checkup && (
                          <div className="space-y-2 bg-white/50 p-3 rounded border">
                            <p className="text-xs font-semibold text-blue-600">Checkup Details</p>
                            
                            {/* Vitals */}
                            <div className="flex flex-wrap gap-2">
                              {apt.checkup.bloodPressure && (
                                <Badge variant="secondary" className="text-xs">
                                  <Activity className="w-3 h-3 mr-1" />
                                  BP: {apt.checkup.bloodPressure}
                                </Badge>
                              )}
                              {apt.checkup.temperature && (
                                <Badge variant="secondary" className="text-xs">
                                  Temp: {apt.checkup.temperature}°F
                                </Badge>
                              )}
                              {apt.checkup.heartRate && (
                                <Badge variant="secondary" className="text-xs">
                                  HR: {apt.checkup.heartRate} bpm
                                </Badge>
                              )}
                              {apt.checkup.bloodSugar && (
                                <Badge variant="secondary" className="text-xs">
                                  BS: {apt.checkup.bloodSugar} mg/dL
                                </Badge>
                              )}
                            </div>

                            {apt.checkup.symptoms && (
                              <p className="text-xs"><span className="font-medium">Symptoms:</span> {apt.checkup.symptoms}</p>
                            )}

                            <p className="text-xs"><span className="font-medium">Diagnosis:</span> {apt.checkup.diagnosis}</p>

                            {apt.checkup.notes && (
                              <p className="text-xs"><span className="font-medium">Notes:</span> {apt.checkup.notes}</p>
                            )}

                            {/* Medications */}
                            {apt.checkup.medications.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs font-medium flex items-center gap-1">
                                  <Pill className="w-3 h-3" />
                                  Medications ({apt.checkup.medications.length})
                                </p>
                                <div className="space-y-1">
                                  {apt.checkup.medications.map((med, idx) => (
                                    <p key={idx} className="text-xs pl-4">
                                      • {med.drugName} - {med.dosePerIntake}, {med.timesPerDay}x daily for {med.totalDays} days
                                      {med.instructions && <span className="italic text-muted-foreground"> ({med.instructions})</span>}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Lab Tests */}
                            {apt.checkup.labTests.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs font-medium flex items-center gap-1">
                                  <FlaskConical className="w-3 h-3" />
                                  Recommended Lab Tests ({apt.checkup.labTests.length})
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {apt.checkup.labTests.map((test, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {test}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
