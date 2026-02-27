"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  ArrowDown,
  ArrowUp,
  Info,
  Minus,
  UserCheck,
  StickyNote,
  Activity,
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

// ============================================================================
// Normal range evaluation helpers
// ============================================================================

type RangeStatus = "normal" | "low" | "high" | "unknown";

/**
 * Evaluate a numeric value against normalMin / normalMax bounds.
 * Either or both bounds may be null/undefined (open-ended ranges).
 */
function evaluateRange(
  value: string,
  normalMin?: number | null,
  normalMax?: number | null,
): { status: RangeStatus; message: string } {
  if (value === "" || (normalMin == null && normalMax == null))
    return { status: "unknown", message: "" };

  const numVal = parseFloat(value);
  if (isNaN(numVal)) return { status: "unknown", message: "" };

  const rangeLabel = formatRangeLabel(normalMin, normalMax);

  if (normalMin != null && normalMax != null) {
    if (numVal < normalMin) return { status: "low", message: `Below normal (${rangeLabel})` };
    if (numVal > normalMax) return { status: "high", message: `Above normal (${rangeLabel})` };
    return { status: "normal", message: "Within normal range" };
  }

  if (normalMax != null) {
    // Only upper bound (e.g. < 200)
    if (numVal > normalMax) return { status: "high", message: `Above normal (${rangeLabel})` };
    return { status: "normal", message: "Within normal range" };
  }

  if (normalMin != null) {
    // Only lower bound (e.g. > 40)
    if (numVal < normalMin) return { status: "low", message: `Below normal (${rangeLabel})` };
    return { status: "normal", message: "Within normal range" };
  }

  return { status: "unknown", message: "" };
}

/** Build a human-readable label from min/max values. */
function formatRangeLabel(normalMin?: number | null, normalMax?: number | null): string {
  if (normalMin != null && normalMax != null) return `${normalMin} – ${normalMax}`;
  if (normalMax != null) return `≤ ${normalMax}`;
  if (normalMin != null) return `≥ ${normalMin}`;
  return "";
}

function getRangeStatusStyles(status: RangeStatus) {
  switch (status) {
    case "normal":
      return {
        border: "border-emerald-300 focus-within:border-emerald-500 focus-within:ring-emerald-200",
        bg: "bg-emerald-50/60",
        text: "text-emerald-700",
        icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />,
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
        badgeLabel: "Normal",
      };
    case "low":
      return {
        border: "border-amber-300 focus-within:border-amber-500 focus-within:ring-amber-200",
        bg: "bg-amber-50/60",
        text: "text-amber-700",
        icon: <ArrowDown className="h-3.5 w-3.5 text-amber-600" />,
        badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
        badgeLabel: "Low",
      };
    case "high":
      return {
        border: "border-rose-300 focus-within:border-rose-500 focus-within:ring-rose-200",
        bg: "bg-rose-50/60",
        text: "text-rose-700",
        icon: <ArrowUp className="h-3.5 w-3.5 text-rose-600" />,
        badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
        badgeLabel: "High",
      };
    default:
      return {
        border: "",
        bg: "",
        text: "text-muted-foreground",
        icon: null,
        badgeClass: "",
        badgeLabel: "",
      };
  }
}

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
        <DialogContent className="sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          {/* Fixed Header */}
          <div className="px-6 pt-6 pb-4 border-b bg-linear-to-r from-emerald-50 to-cyan-50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2.5 text-lg">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Send className="h-4.5 w-4.5 text-white" />
                </div>
                Submit Test Results
              </DialogTitle>
              <DialogDescription className="mt-1.5">
                <span className="font-medium text-foreground">{selectedTest?.labTest.name}</span>
                {" "}&mdash;{" "}
                {selectedTest?.patient.firstName} {selectedTest?.patient.lastName}
                <span className="mx-1.5">·</span>
                <span className="text-xs">{selectedTest?.labTest.departmentName}</span>
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          {selectedTest && (
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Dynamic Form based on template */}
              {selectedTest.labTest.formStructure?.sections ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-cyan-600" />
                    <h4 className="font-semibold text-base">Test Results</h4>
                  </div>

                  {selectedTest.labTest.formStructure.sections.map(
                    (section: any, sIdx: number) => (
                      <div
                        key={sIdx}
                        className="rounded-xl border bg-white shadow-sm overflow-hidden"
                      >
                        {/* Section Header */}
                        <div className="px-4 py-3 bg-slate-50 border-b">
                          <h5 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                            {section.title}
                          </h5>
                        </div>

                        {/* Section Fields */}
                        <div className="p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                            {section.fields?.map((field: any, fIdx: number) => {
                              const currentValue = results[field.name] || "";
                              const rangeEval = evaluateRange(currentValue, field.normalMin, field.normalMax);
                              const rangeLabel = formatRangeLabel(field.normalMin, field.normalMax);
                              const styles = getRangeStatusStyles(rangeEval.status);
                              const showIndicator = rangeEval.status !== "unknown" && currentValue !== "";

                              return (
                                <div key={fIdx} className="space-y-1.5">
                                  {/* Label Row */}
                                  <div className="flex items-center justify-between">
                                    <Label
                                      htmlFor={field.name}
                                      className="text-sm font-medium text-slate-700"
                                    >
                                      {field.label}
                                      {field.required && (
                                        <span className="text-red-500 ml-0.5">*</span>
                                      )}
                                    </Label>
                                    {showIndicator && (
                                      <TooltipProvider delayDuration={200}>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Badge
                                              variant="outline"
                                              className={`text-[10px] px-1.5 py-0 h-5 font-medium gap-1 ${styles.badgeClass}`}
                                            >
                                              {styles.icon}
                                              {styles.badgeLabel}
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent side="top" className="text-xs">
                                            {rangeEval.message}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>

                                  {/* Input Field */}
                                  {field.type === "select" ? (
                                    <Select
                                      value={currentValue}
                                      onValueChange={(value) =>
                                        setResults({ ...results, [field.name]: value })
                                      }
                                    >
                                      <SelectTrigger
                                        className={`w-full ${showIndicator ? styles.border + " " + styles.bg : ""}`}
                                      >
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
                                      value={currentValue}
                                      onChange={(e) =>
                                        setResults({
                                          ...results,
                                          [field.name]: e.target.value,
                                        })
                                      }
                                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                      className={`resize-none ${showIndicator ? styles.border + " " + styles.bg : ""}`}
                                      rows={2}
                                    />
                                  ) : (
                                    <div className="relative">
                                      <Input
                                        id={field.name}
                                        type={field.type === "number" ? "number" : "text"}
                                        value={currentValue}
                                        onChange={(e) =>
                                          setResults({
                                            ...results,
                                            [field.name]: e.target.value,
                                          })
                                        }
                                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                        min={field.min}
                                        max={field.max}
                                        step="any"
                                        className={`${field.unit ? "pr-16" : ""} ${showIndicator ? styles.border + " " + styles.bg : ""}`}
                                      />
                                      {field.unit && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                                          {field.unit}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Normal Range hint */}
                                  {rangeLabel && (
                                    <div className="flex items-center gap-1">
                                      <Info className="h-3 w-3 text-slate-400 shrink-0" />
                                      <p className={`text-xs ${showIndicator ? styles.text : "text-muted-foreground"}`}>
                                        Normal: {rangeLabel}
                                        {field.unit && ` ${field.unit}`}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-cyan-600" />
                    <h4 className="font-semibold text-base">Test Results</h4>
                  </div>
                  <Textarea
                    placeholder="Enter test results..."
                    value={results.rawResults || ""}
                    onChange={(e) =>
                      setResults({ ...results, rawResults: e.target.value })
                    }
                    rows={6}
                    className="resize-none"
                  />
                </div>
              )}

              <Separator />

              {/* Lab Technician Notes */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-slate-500" />
                  <Label htmlFor="technicianNotes" className="text-sm font-semibold text-slate-700">
                    Lab Technician Notes
                  </Label>
                  <span className="text-xs text-muted-foreground">(Optional)</span>
                </div>
                <Textarea
                  id="technicianNotes"
                  value={labTechnicianNotes}
                  onChange={(e) => setLabTechnicianNotes(e.target.value)}
                  placeholder="Any additional observations, notes, or sample conditions..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <Separator />

              {/* Pathologist Selection */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-indigo-500" />
                  <Label htmlFor="pathologist" className="text-sm font-semibold text-slate-700">
                    Assign Pathologist for Review
                  </Label>
                  <span className="text-red-500 text-xs">*</span>
                </div>
                <Select
                  value={selectedPathologist}
                  onValueChange={setSelectedPathologist}
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Select a pathologist for review" />
                  </SelectTrigger>
                  <SelectContent>
                    {pathologists.map((pathologist) => (
                      <SelectItem
                        key={pathologist.id}
                        value={pathologist.id.toString()}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                            <User className="h-3 w-3 text-indigo-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {pathologist.firstName} {pathologist.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {pathologist.specialization}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Fixed Footer */}
          <div className="px-6 py-4 border-t bg-slate-50/80 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setResultsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResults}
              disabled={submitting || !selectedPathologist}
              className="bg-emerald-600 hover:bg-emerald-700 min-w-40"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Review
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
