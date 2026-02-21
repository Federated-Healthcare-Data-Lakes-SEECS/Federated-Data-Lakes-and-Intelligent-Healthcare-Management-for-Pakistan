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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TestTube,
  Loader2,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Building2,
  User,
  Calendar,
  Eye,
} from "lucide-react";
import {
  getMyLabTests,
  getAvailableLabTests,
  orderLabTest,
  getMyLabTestDetails,
  type PatientLabTestSummary,
  type AvailableLabTest,
  type PatientLabTest,
  getStatusColor,
  getStatusDisplayText,
  formatLabTestDate,
} from "@/lib/api-labtest";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function PatientLabTestsPage() {
  const [labTests, setLabTests] = useState<PatientLabTestSummary[]>([]);
  const [availableTests, setAvailableTests] = useState<AvailableLabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string>("");
  const [ordering, setOrdering] = useState(false);
  const [expandedTest, setExpandedTest] = useState<number | null>(null);
  const [testDetails, setTestDetails] = useState<PatientLabTest | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [testsData, availableData] = await Promise.all([
        getMyLabTests(),
        getAvailableLabTests(),
      ]);
      setLabTests(testsData);
      setAvailableTests(availableData);
      console.log("Available Tests:", availableData);
    } catch (err: any) {
      console.error("Failed to load lab tests:", err);
      toast.error("Failed to load lab tests");
    } finally {
      setLoading(false);
    }
  }

  async function handleOrderTest() {
    if (!selectedTest) {
      toast.error("Please select a lab test");
      return;
    }

    try {
      setOrdering(true);
      const result = await orderLabTest(parseInt(selectedTest));
      toast.success(result.message);
      setOrderDialogOpen(false);
      setSelectedTest("");
      loadData();
    } catch (err: any) {
      console.error("Failed to order lab test:", err);
      toast.error(err.response?.data?.message || "Failed to order lab test");
    } finally {
      setOrdering(false);
    }
  }

  async function handleViewDetails(id: number) {
    try {
      setLoadingDetails(true);
      const details = await getMyLabTestDetails(id);
      setTestDetails(details);
      setDetailsDialogOpen(true);
    } catch (err: any) {
      console.error("Failed to load test details:", err);
      toast.error("Failed to load test details");
    } finally {
      setLoadingDetails(false);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ORDERED":
        return <Clock className="h-4 w-4" />;
      case "SAMPLE_COLLECTED":
      case "PERFORMED":
      case "RESULTS_ADDED":
      case "UNDER_REVIEW":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "APPROVED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "REJECTED":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Lab Tests
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mt-1">
            Order and track your lab tests
          </p>
        </div>
        <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <Plus className="h-4 w-4" />
              Order Lab Test
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Order a New Lab Test</DialogTitle>
              <DialogDescription>
                Select a lab test to order. You will be assigned a lab technician
                automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select value={selectedTest} onValueChange={setSelectedTest}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a lab test" />
                </SelectTrigger>
                <SelectContent>
                  {availableTests.map((test) => (
                    <SelectItem key={test.id} value={test.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{test.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {test.departmentName}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTest && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> After ordering, please visit the hospital
                    within the next 2 working days for sample collection.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOrderDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleOrderTest}
                disabled={ordering || !selectedTest}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {ordering && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Order Test
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* Lab Tests List */}
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold tracking-wide flex items-center gap-2">
              <TestTube className="w-5 h-5 text-emerald-600" />
              My Lab Tests
            </CardTitle>
            <Badge
              variant="secondary"
              className="text-sm bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              {labTests.length} Tests
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : labTests.length === 0 ? (
            <div className="text-center py-12">
              <TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No lab tests ordered yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Order Lab Test" to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
              {labTests.map((test) => (
                <div
                  key={test.id}
                  className="border rounded-lg bg-slate-50 hover:bg-emerald-50/30 transition-all"
                >
                  <div className="px-4 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                          <TestTube className="w-5 h-5 text-white" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-base">
                              {test.labTestName}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getStatusColor(test.status)}`}
                            >
                              {getStatusIcon(test.status)}
                              <span className="ml-1">
                                {getStatusDisplayText(test.status)}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {test.departmentName}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Ordered: {formatLabTestDate(test.orderedAt)}
                          </p>
                          {test.labTechnicianName && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              Lab Technician: {test.labTechnicianName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          ID: {test.id}
                        </Badge>
                        {test.status === "APPROVED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(test.id)}
                            disabled={loadingDetails}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View Results
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mt-4 ml-13 pl-3 border-l-2 border-slate-200">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              test.orderedAt ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          />
                          <span className="text-muted-foreground">Ordered</span>
                          {test.orderedAt && (
                            <span className="text-xs text-slate-500">
                              {formatLabTestDate(test.orderedAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              test.sampleCollectedAt
                                ? "bg-emerald-500"
                                : "bg-slate-300"
                            }`}
                          />
                          <span className="text-muted-foreground">
                            Sample Collected
                          </span>
                          {test.sampleCollectedAt && (
                            <span className="text-xs text-slate-500">
                              {formatLabTestDate(test.sampleCollectedAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              test.performedAt ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          />
                          <span className="text-muted-foreground">
                            Test Performed
                          </span>
                          {test.performedAt && (
                            <span className="text-xs text-slate-500">
                              {formatLabTestDate(test.performedAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              test.reviewedAt ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          />
                          <span className="text-muted-foreground">
                            Results Available
                          </span>
                          {test.reviewedAt && (
                            <span className="text-xs text-slate-500">
                              {formatLabTestDate(test.reviewedAt)}
                            </span>
                          )}
                        </div>
                      </div>
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
              <FileText className="h-5 w-5 text-emerald-600" />
              Lab Test Results
            </DialogTitle>
            <DialogDescription>
              {testDetails?.labTest.name} - {testDetails?.labTest.departmentName}
            </DialogDescription>
          </DialogHeader>
          {testDetails && (
            <div className="space-y-4 py-4">
              {/* Status Badge */}
              <div className="flex justify-between items-center">
                <Badge
                  variant="outline"
                  className={`${getStatusColor(testDetails.status)}`}
                >
                  {getStatusDisplayText(testDetails.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ID: {testDetails.id}
                </span>
              </div>

              {/* Results */}
              {testDetails.result && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Test Results</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border">
                    {testDetails.labTest.formStructure?.sections?.map(
                      (section: any, sIdx: number) => (
                        <div key={sIdx} className="mb-4 last:mb-0">
                          <h5 className="font-medium text-sm text-emerald-700 mb-2">
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
                                  {testDetails.result?.[field.name] || "—"}
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
                    )}
                    {!testDetails.labTest.formStructure && (
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(testDetails.result, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {testDetails.labTechnicianNotes && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Lab Technician Notes</h4>
                  <p className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-lg border">
                    {testDetails.labTechnicianNotes}
                  </p>
                </div>
              )}

              {testDetails.pathologistNotes && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Pathologist Notes</h4>
                  <p className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-lg border">
                    {testDetails.pathologistNotes}
                  </p>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-2">
                <h4 className="font-semibold">Timeline</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Ordered:</span>{" "}
                    {formatLabTestDate(testDetails.orderedAt)}
                  </p>
                  {testDetails.sampleCollectedAt && (
                    <p>
                      <span className="text-muted-foreground">
                        Sample Collected:
                      </span>{" "}
                      {formatLabTestDate(testDetails.sampleCollectedAt)}
                    </p>
                  )}
                  {testDetails.performedAt && (
                    <p>
                      <span className="text-muted-foreground">Performed:</span>{" "}
                      {formatLabTestDate(testDetails.performedAt)}
                    </p>
                  )}
                  {testDetails.reviewedAt && (
                    <p>
                      <span className="text-muted-foreground">Reviewed:</span>{" "}
                      {formatLabTestDate(testDetails.reviewedAt)}
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
