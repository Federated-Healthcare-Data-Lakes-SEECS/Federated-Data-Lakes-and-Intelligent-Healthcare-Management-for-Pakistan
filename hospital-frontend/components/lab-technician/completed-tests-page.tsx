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
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Loader2,
  User,
  Calendar,
  Building2,
  Eye,
  Clock,
  FileText,
  TestTube,
  Activity,
  StickyNote,
  Search,
  ClipboardCheck,
  ShieldCheck,
  Timer,
} from "lucide-react";
import {
  getCompletedLabTests,
  getLabTestDetailsForTechnician,
  type PatientLabTest,
  getStatusColor,
  getStatusDisplayText,
  formatLabTestDate,
} from "@/lib/api-labtest";
import { toast } from "sonner";

export default function CompletedTestsPage() {
  const [labTests, setLabTests] = useState<PatientLabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<PatientLabTest | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    try {
      setLoading(true);
      const tests = await getCompletedLabTests();
      setLabTests(tests);
    } catch (err: any) {
      console.error("Failed to load completed lab tests:", err);
      toast.error("Failed to load completed lab tests");
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

  // Filter tests based on search query and status filter
  const filteredTests = labTests.filter((test) => {
    const matchesSearch =
      searchQuery === "" ||
      test.labTest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${test.patient.firstName} ${test.patient.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      test.labTest.departmentName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      test.id.toString().includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" || test.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const approvedCount = labTests.filter((t) => t.status === "APPROVED").length;
  const underReviewCount = labTests.filter(
    (t) => t.status === "UNDER_REVIEW"
  ).length;

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Completed Lab Tests
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mt-1">
            Review your previously submitted lab tests
          </p>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-sm bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-5 h-5 text-cyan-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Completed</p>
              <p className="text-2xl font-bold text-slate-900">
                {labTests.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5 text-yellow-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Under Review</p>
              <p className="text-2xl font-bold text-slate-900">
                {underReviewCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-slate-900">
                {approvedCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by test name, patient, department, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lab Tests List */}
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold tracking-wide flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-cyan-600" />
              Completed Tests
            </CardTitle>
            <Badge
              variant="secondary"
              className="text-sm bg-cyan-50 text-cyan-700 border border-cyan-200"
            >
              {filteredTests.length} Tests
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {labTests.length === 0
                  ? "No completed lab tests yet"
                  : "No tests match your search criteria"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-480px)] overflow-y-auto">
              {filteredTests.map((test) => (
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
                            Submitted: {formatLabTestDate(test.resultsAddedAt)}
                          </p>
                          <p className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            ID: {test.id}
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
              <FileText className="h-5 w-5 text-cyan-600" />
              Completed Test Details
            </DialogTitle>
            <DialogDescription>
              {selectedTest?.labTest.name} —{" "}
              {selectedTest?.labTest.departmentName}
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
                      {selectedTest.patient.firstName}{" "}
                      {selectedTest.patient.lastName}
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
                    <p className="font-medium">
                      {selectedTest.patient.phoneNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Test Info */}
              <div className="space-y-2">
                <h4 className="font-semibold">Test Information</h4>
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">
                    {selectedTest.labTest.description || "No description"}
                  </p>
                </div>
              </div>

              {/* Submitted Results */}
              {selectedTest.result && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-600" />
                    Submitted Results
                  </h4>
                  {selectedTest.labTest.formStructure?.sections ? (
                    <div className="space-y-3">
                      {selectedTest.labTest.formStructure.sections.map(
                        (section: any, sIdx: number) => (
                          <div
                            key={sIdx}
                            className="rounded-lg border bg-white overflow-hidden"
                          >
                            <div className="px-4 py-2.5 bg-slate-50 border-b">
                              <h5 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                {section.title}
                              </h5>
                            </div>
                            <div className="p-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {section.fields?.map(
                                  (field: any, fIdx: number) => (
                                    <div
                                      key={fIdx}
                                      className="flex justify-between items-baseline gap-2 py-1.5 px-3 bg-slate-50 rounded-md"
                                    >
                                      <span className="text-sm text-muted-foreground">
                                        {field.label}
                                      </span>
                                      <span className="text-sm font-medium text-slate-900">
                                        {selectedTest.result?.[field.name] ||
                                          "—"}
                                        {field.unit &&
                                          selectedTest.result?.[field.name] &&
                                          ` ${field.unit}`}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4 rounded-lg border">
                      <p className="text-sm font-medium whitespace-pre-wrap">
                        {typeof selectedTest.result === "object"
                          ? selectedTest.result.rawResults ||
                            JSON.stringify(selectedTest.result, null, 2)
                          : String(selectedTest.result)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Lab Technician Notes */}
              {selectedTest.labTechnicianNotes && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <StickyNote className="h-4 w-4 text-slate-500" />
                    Your Notes
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <p className="text-sm">{selectedTest.labTechnicianNotes}</p>
                  </div>
                </div>
              )}

              {/* Pathologist Notes (if approved/reviewed) */}
              {selectedTest.pathologistNotes && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Pathologist Notes
                  </h4>
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-800">
                      {selectedTest.pathologistNotes}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

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
                      <span className="text-muted-foreground">
                        Sample Collected:
                      </span>{" "}
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
                      <span className="text-muted-foreground">
                        Results Submitted:
                      </span>{" "}
                      {formatLabTestDate(selectedTest.resultsAddedAt)}
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
