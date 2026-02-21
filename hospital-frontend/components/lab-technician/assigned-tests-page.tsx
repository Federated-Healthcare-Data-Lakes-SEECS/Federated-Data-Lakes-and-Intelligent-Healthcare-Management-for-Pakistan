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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TestTube,
  Loader2,
  User,
  Calendar,
  Building2,
  Eye,
  Beaker,
  Send,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  getAssignedLabTests,
  getLabTestDetailsForTechnician,
  getAvailablePathologists,
  collectSample,
  markTestPerformed,
  submitLabTestResults,
  type PatientLabTest,
  type PathologistInfo,
  getStatusColor,
  getStatusDisplayText,
  formatLabTestDate,
} from "@/lib/api-labtest";
import { toast } from "sonner";

export default function AssignedTestsPage() {
  const [labTests, setLabTests] = useState<PatientLabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<PatientLabTest | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [pathologists, setPathologists] = useState<PathologistInfo[]>([]);
  const [selectedPathologist, setSelectedPathologist] = useState<string>("");
  const [labTechnicianNotes, setLabTechnicianNotes] = useState<string>("");
  const [results, setResults] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    try {
      setLoading(true);
      const tests = await getAssignedLabTests();
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
      const details = await getLabTestDetailsForTechnician(test.id);
      setSelectedTest(details);
      setDetailsDialogOpen(true);
    } catch (err: any) {
      console.error("Failed to load test details:", err);
      toast.error("Failed to load test details");
    }
  }

  async function handleCollectSample(testId: number) {
    try {
      await collectSample(testId);
      toast.success("Sample collected successfully");
      loadTests();
      setDetailsDialogOpen(false);
    } catch (err: any) {
      console.error("Failed to collect sample:", err);
      toast.error(err.response?.data?.message || "Failed to collect sample");
    }
  }

  async function handleMarkPerformed(testId: number) {
    try {
      await markTestPerformed(testId);
      toast.success("Test marked as performed");
      loadTests();
      setDetailsDialogOpen(false);
    } catch (err: any) {
      console.error("Failed to mark test as performed:", err);
      toast.error(err.response?.data?.message || "Failed to mark test as performed");
    }
  }

  async function handleOpenResultsDialog(test: PatientLabTest) {
    try {
      const pathologistsList = await getAvailablePathologists(test.id);
      setPathologists(pathologistsList);
      setSelectedTest(test);
      setResults(test.result || {});
      setLabTechnicianNotes(test.labTechnicianNotes || "");
      setSelectedPathologist("");
      setResultsDialogOpen(true);
    } catch (err: any) {
      console.error("Failed to load pathologists:", err);
      toast.error("Failed to load pathologists");
    }
  }

  async function handleSubmitResults() {
    if (!selectedTest) return;

    if (!selectedPathologist) {
      toast.error("Please select a pathologist");
      return;
    }

    // Validate at least some results are filled
    if (Object.keys(results).length === 0) {
      toast.error("Please fill in the test results");
      return;
    }

    try {
      setSubmitting(true);
      await submitLabTestResults(selectedTest.id, {
        result: results,
        labTechnicianNotes,
        pathologistId: parseInt(selectedPathologist),
      });
      toast.success("Results submitted for review");
      setResultsDialogOpen(false);
      loadTests();
    } catch (err: any) {
      console.error("Failed to submit results:", err);
      toast.error(err.response?.data?.message || "Failed to submit results");
    } finally {
      setSubmitting(false);
    }
  }

  const getActionButton = (test: PatientLabTest) => {
    switch (test.status) {
      case "ORDERED":
        return (
          <Button
            size="sm"
            onClick={() => handleCollectSample(test.id)}
            className="gap-1 bg-blue-600 hover:bg-blue-700"
          >
            <Beaker className="h-4 w-4" />
            Collect Sample
          </Button>
        );
      case "SAMPLE_COLLECTED":
        return (
          <Button
            size="sm"
            onClick={() => handleMarkPerformed(test.id)}
            className="gap-1 bg-purple-600 hover:bg-purple-700"
          >
            <CheckCircle className="h-4 w-4" />
            Mark Performed
          </Button>
        );
      case "PERFORMED":
      case "REJECTED":
        return (
          <Button
            size="sm"
            onClick={() => handleOpenResultsDialog(test)}
            className="gap-1 bg-emerald-600 hover:bg-emerald-700"
          >
            <Send className="h-4 w-4" />
            {test.status === "REJECTED" ? "Re-submit Results" : "Submit Results"}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Assigned Lab Tests
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mt-1">
            Manage and process your assigned lab tests
          </p>
        </div>
      </header>

      {/* Lab Tests List */}
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold tracking-wide flex items-center gap-2">
              <TestTube className="w-5 h-5 text-cyan-600" />
              All Assigned Tests
            </CardTitle>
            <Badge
              variant="secondary"
              className="text-sm bg-cyan-50 text-cyan-700 border border-cyan-200"
            >
              {labTests.length} Tests
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
            </div>
          ) : labTests.length === 0 ? (
            <div className="text-center py-12">
              <TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No lab tests assigned</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {labTests.map((test) => (
                <div
                  key={test.id}
                  className="border rounded-lg bg-slate-50 hover:bg-cyan-50/30 transition-all p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center shrink-0">
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
                          {test.status === "REJECTED" && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-red-50 text-red-700 border-red-200"
                            >
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Needs Revision
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <p className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {test.patient.firstName} {test.patient.lastName}
                          </p>
                          <p className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {test.labTest.departmentName}
                          </p>
                          <p className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Ordered: {formatLabTestDate(test.orderedAt)}
                          </p>
                          <p className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            ID: {test.id}
                          </p>
                        </div>
                        {test.pathologistNotes && test.status === "REJECTED" && (
                          <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                            <p className="text-sm text-red-700">
                              <strong>Feedback:</strong> {test.pathologistNotes}
                            </p>
                          </div>
                        )}
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
                      {getActionButton(test)}
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
              <FileText className="h-5 w-5 text-cyan-600" />
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
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedTest.patient.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{selectedTest.patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedTest.patient.phoneNumber || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Test Info */}
              <div className="space-y-2">
                <h4 className="font-semibold">Test Information</h4>
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{selectedTest.labTest.description || "No description"}</p>
                </div>
              </div>

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
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                {getActionButton(selectedTest)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Results Submission Dialog */}
      <Dialog open={resultsDialogOpen} onOpenChange={setResultsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-emerald-600" />
              Submit Test Results
            </DialogTitle>
            <DialogDescription>
              {selectedTest?.labTest.name} for {selectedTest?.patient.firstName}{" "}
              {selectedTest?.patient.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedTest && (
            <div className="space-y-4 py-4">
              {/* Dynamic Form based on template */}
              <div className="space-y-4">
                <h4 className="font-semibold">Test Results</h4>
                {selectedTest.labTest.formStructure?.sections ? (
                  selectedTest.labTest.formStructure.sections.map(
                    (section: any, sIdx: number) => (
                      <div key={sIdx} className="space-y-3">
                        <h5 className="font-medium text-sm text-cyan-700 border-b pb-1">
                          {section.title}
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {section.fields?.map((field: any, fIdx: number) => (
                            <div key={fIdx} className="space-y-1">
                              <Label htmlFor={field.name}>
                                {field.label}
                                {field.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                                {field.unit && (
                                  <span className="text-muted-foreground ml-1">
                                    ({field.unit})
                                  </span>
                                )}
                              </Label>
                              {field.type === "select" ? (
                                <Select
                                  value={results[field.name] || ""}
                                  onValueChange={(value) =>
                                    setResults({ ...results, [field.name]: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={`Select ${field.label}`} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options?.map((option: string) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : field.type === "textarea" ? (
                                <Textarea
                                  id={field.name}
                                  value={results[field.name] || ""}
                                  onChange={(e) =>
                                    setResults({
                                      ...results,
                                      [field.name]: e.target.value,
                                    })
                                  }
                                  placeholder={field.placeholder || ""}
                                />
                              ) : (
                                <Input
                                  id={field.name}
                                  type={field.type === "number" ? "number" : "text"}
                                  value={results[field.name] || ""}
                                  onChange={(e) =>
                                    setResults({
                                      ...results,
                                      [field.name]: e.target.value,
                                    })
                                  }
                                  placeholder={field.placeholder || ""}
                                  min={field.min}
                                  max={field.max}
                                />
                              )}
                              {field.normalRange && (
                                <p className="text-xs text-muted-foreground">
                                  Normal: {field.normalRange}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <Textarea
                    placeholder="Enter test results..."
                    value={results.rawResults || ""}
                    onChange={(e) =>
                      setResults({ ...results, rawResults: e.target.value })
                    }
                    rows={6}
                  />
                )}
              </div>

              {/* Lab Technician Notes */}
              <div className="space-y-2">
                <Label htmlFor="technicianNotes">Lab Technician Notes (Optional)</Label>
                <Textarea
                  id="technicianNotes"
                  value={labTechnicianNotes}
                  onChange={(e) => setLabTechnicianNotes(e.target.value)}
                  placeholder="Any additional observations or notes..."
                  rows={3}
                />
              </div>

              {/* Pathologist Selection */}
              <div className="space-y-2">
                <Label htmlFor="pathologist">
                  Assign Pathologist <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedPathologist}
                  onValueChange={setSelectedPathologist}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a pathologist for review" />
                  </SelectTrigger>
                  <SelectContent>
                    {pathologists.map((pathologist) => (
                      <SelectItem
                        key={pathologist.id}
                        value={pathologist.id.toString()}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {pathologist.firstName} {pathologist.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {pathologist.specialization}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResultsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResults}
              disabled={submitting || !selectedPathologist}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
