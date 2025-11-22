"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from 'lucide-react';

interface PatientsSummaryProps {
  patients: any[];
}

export default function PatientsSummary({ patients }: PatientsSummaryProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          Registered Patients
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {patients.map((patient) => (
            <div key={patient.id} className="p-3 border border-border rounded-lg">
              <p className="font-medium text-foreground text-sm">
                {patient.firstName} {patient.lastName}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Blood Group: <Badge variant="secondary" className="ml-1">{patient.bloodGroup}</Badge>
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
