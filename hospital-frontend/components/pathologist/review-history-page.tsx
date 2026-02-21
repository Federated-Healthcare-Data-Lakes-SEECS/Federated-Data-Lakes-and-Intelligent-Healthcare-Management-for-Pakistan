"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  History,
  Loader2,
  User,
  Calendar,
  Building2,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  TestTube,
} from "lucide-react";
import {
  getReviewedLabTests,
  getLabTestDetailsForPathologist,
  type PatientLabTest,
  getStatusColor,
  getStatusDisplayText,
  formatLabTestDate,
} from "@/lib/api-labtest";
import { toast } from "sonner";

export default function ReviewHistoryPage() {
  const [labTests, setLabTests] = useState<PatientLabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<PatientLabTest | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    try {
      setLoading(true);
      const tests = await getReviewedLabTests();
      setLabTests(tests);
    } catch (err: any) {
      console.error("Failed to load review history:", err);
      toast.error("Failed to load review history");
    } finally {
      setLoading(false);
    }
  }

  async function handleViewDetails(test: PatientLabTest) {
    try {
      const details = await getLabTestDetailsForPathologist(test.id);
      setSelectedTest(details);
      setDetailsDialogOpen(true);
    } catch (err: any) {
      console.error("Failed to load test details:", err);
      toast.error("Failed to load test details");
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Review History
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mt-1">
            View your past lab test reviews
          </p>
        </div>
      </header>

      {/* Lab Tests List */}
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold tracking-wide flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600" />
              Reviewed Tests
            </CardTitle>
            <Badge
              variant="secondary"
              className="text-sm bg-slate-100 text-slate-700 border border-slate-200"
            >
              {labTests.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : labTests.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No review history yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {labTests.map((test) => (
                <div
                  key={test.id}
                  className="border rounded-lg bg-slate-50 hover:bg-purple-50/30 transition-all p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          test.status === "APPROVED"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {test.status === "APPROVED" ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-base">
                            {test.labTest.name}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStatusColor(test.status)}`}
                          >
                            {getStatusDisplayText(test.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <p className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            Patient: {test.patient.firstName} {test.patient.lastName}
                          </p>
                          <p className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {test.labTest.departmentName}
                          </p>
                          <p className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Reviewed: {formatLabTestDate(test.reviewedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(test)}
                        className="gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Lab Test Details
            </DialogTitle>
            <DialogDescription>
              {selectedTest?.labTest.name} - {selectedTest?.labTest.departmentName}
            </DialogDescription>
          </DialogHeader>
          {selectedTest && (
            <div className="space-y-4 py-4">
              {/* Status */}
              <div className="flex justify-between items-center">
                <Badge
                  variant="outline"
                  className={`${getStatusColor(selectedTest.status)}`}
                >
                  {getStatusDisplayText(selectedTest.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ID: {selectedTest.id}
                </span>
              </div>

              {/* Patient Info */}
              <div className="space-y-2">
                <h4 className="font-semibold">Patient Information</h4>
                <div className="bg-slate-50 p-4 rounded-lg border grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {selectedTest.patient.firstName} {selectedTest.patient.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{selectedTest.patient.gender}</p>
                  </div>
                </div>
              </div>

              {/* Test Results */}
              {selectedTest.result && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Test Results</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border">
                    {selectedTest.labTest.formStructure?.sections ? (
                      selectedTest.labTest.formStructure.sections.map(
                        (section: any, sIdx: number) => (
                          <div key={sIdx} className="mb-4 last:mb-0">
                            <h5 className="font-medium text-sm text-purple-700 mb-2">
                              {section.title}
                            </h5>
                            <div className="grid grid-cols-2 gap-2">
                              {section.fields?.map((field: any, fIdx: number) => (
                                <div
                                  key={fIdx}
                                  className="flex justify-between p-2 bg-white rounded border"
                                >
                                  <span className="text-sm text-muted-foreground">
                                    {field.label}
                                  </span>
                                  <span className="font-medium text-sm">
                                    {selectedTest.result?.[field.name] || "—"}
                                    {field.unit && (
                                      <span className="text-muted-foreground ml-1">
                                        {field.unit}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(selectedTest.result, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTest.labTechnicianNotes && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Lab Technician Notes</h4>
                  <p className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-lg border">
                    {selectedTest.labTechnicianNotes}
                  </p>
                </div>
              )}

              {selectedTest.pathologistNotes && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Your Review Notes</h4>
                  <p className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-lg border">
                    {selectedTest.pathologistNotes}
                  </p>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-2">
                <h4 className="font-semibold">Timeline</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Ordered:</span>{" "}
                    {formatLabTestDate(selectedTest.orderedAt)}
                  </p>
                  {selectedTest.sampleCollectedAt && (
                    <p>
                      <span className="text-muted-foreground">Sample Collected:</span>{" "}
                      {formatLabTestDate(selectedTest.sampleCollectedAt)}
                    </p>
                  )}
                  {selectedTest.performedAt && (
                    <p>
                      <span className="text-muted-foreground">Performed:</span>{" "}
                      {formatLabTestDate(selectedTest.performedAt)}
                    </p>
                  )}
                  {selectedTest.reviewedAt && (
                    <p>
                      <span className="text-muted-foreground">Reviewed:</span>{" "}
                      {formatLabTestDate(selectedTest.reviewedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
