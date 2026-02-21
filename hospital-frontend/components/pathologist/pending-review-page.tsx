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
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ClipboardCheck,
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
  getLabTestsForReview,
  getLabTestDetailsForPathologist,
  reviewLabTest,
  type PatientLabTest,
  getStatusColor,
  getStatusDisplayText,
  formatLabTestDate,
} from "@/lib/api-labtest";
import { toast } from "sonner";

export default function PendingReviewPage() {
  const [labTests, setLabTests] = useState<PatientLabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<PatientLabTest | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [pathologistNotes, setPathologistNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    try {
      setLoading(true);
      const tests = await getLabTestsForReview();
      setLabTests(tests);
    } catch (err: any) {
      console.error("Failed to load lab tests:", err);
      toast.error("Failed to load lab tests");
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

  function handleOpenReviewDialog(test: PatientLabTest, action: "APPROVED" | "REJECTED") {
    setSelectedTest(test);
    setReviewAction(action);
    setPathologistNotes("");
    setReviewDialogOpen(true);
  }

  async function handleSubmitReview() {
    if (!selectedTest || !reviewAction) return;

    if (reviewAction === "REJECTED" && !pathologistNotes.trim()) {
      toast.error("Please provide feedback for rejection");
      return;
    }

    try {
      setSubmitting(true);
      await reviewLabTest(selectedTest.id, {
        status: reviewAction,
        pathologistNotes: pathologistNotes.trim() || undefined,
      });
      toast.success(
        reviewAction === "APPROVED"
          ? "Lab test approved successfully"
          : "Lab test rejected with feedback"
      );
      setReviewDialogOpen(false);
      setDetailsDialogOpen(false);
      loadTests();
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Pending Review
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mt-1">
            Review and approve lab test results
          </p>
        </div>
      </header>

      {/* Lab Tests List */}
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold tracking-wide flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-purple-600" />
              Tests Awaiting Review
            </CardTitle>
            <Badge
              variant="secondary"
              className="text-sm bg-purple-50 text-purple-700 border border-purple-200"
            >
              {labTests.length} Pending
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
              <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No tests pending review</p>
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
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                        <TestTube className="w-5 h-5 text-white" />
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
                            <User className="h-3.5 w-3.5" />
                            Tech: {test.labTechnician?.firstName} {test.labTechnician?.lastName}
                          </p>
                          <p className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Submitted: {formatLabTestDate(test.resultsAddedAt)}
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
                        Review
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
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Review Lab Test Results
            </DialogTitle>
            <DialogDescription>
              {selectedTest?.labTest.name} - {selectedTest?.labTest.departmentName}
            </DialogDescription>
          </DialogHeader>
          {selectedTest && (
            <div className="space-y-4 py-4">
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

              {/* Lab Technician Info */}
              <div className="space-y-2">
                <h4 className="font-semibold">Lab Technician</h4>
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <p className="font-medium">
                    {selectedTest.labTechnician?.firstName} {selectedTest.labTechnician?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTest.labTechnician?.specialization}
                  </p>
                </div>
              </div>

              {/* Test Results */}
              <div className="space-y-2">
                <h4 className="font-semibold">Test Results</h4>
                <div className="bg-slate-50 p-4 rounded-lg border">
                  {selectedTest.labTest.formStructure?.sections ? (
                    selectedTest.labTest.formStructure.sections.map(
                      (section: any, sIdx: number) => (
                        <div key={sIdx} className="mb-4 last:mb-0">
                          <h5 className="font-medium text-sm text-purple-700 mb-2 border-b pb-1">
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

              {/* Lab Technician Notes */}
              {selectedTest.labTechnicianNotes && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Lab Technician Notes</h4>
                  <p className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-lg border">
                    {selectedTest.labTechnicianNotes}
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
                  {selectedTest.resultsAddedAt && (
                    <p>
                      <span className="text-muted-foreground">Results Submitted:</span>{" "}
                      {formatLabTestDate(selectedTest.resultsAddedAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleOpenReviewDialog(selectedTest, "REJECTED")}
                  className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleOpenReviewDialog(selectedTest, "APPROVED")}
                  className="gap-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Confirmation Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewAction === "APPROVED" ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Approve Lab Test
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Reject Lab Test
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "APPROVED"
                ? "The results will be visible to the patient after approval."
                : "The lab technician will be notified to revise the results."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pathologistNotes">
                {reviewAction === "APPROVED" ? "Notes (Optional)" : "Feedback (Required)"}
              </Label>
              <Textarea
                id="pathologistNotes"
                value={pathologistNotes}
                onChange={(e) => setPathologistNotes(e.target.value)}
                placeholder={
                  reviewAction === "APPROVED"
                    ? "Any comments or observations..."
                    : "Please explain what needs to be corrected..."
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submitting || (reviewAction === "REJECTED" && !pathologistNotes.trim())}
              className={
                reviewAction === "APPROVED"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {reviewAction === "APPROVED" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
