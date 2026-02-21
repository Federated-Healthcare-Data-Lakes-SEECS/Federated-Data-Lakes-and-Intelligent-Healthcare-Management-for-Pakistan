"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Loader2,
  User,
  Calendar,
  Building2,
  Eye,
  FileText,
  TestTube,
  AlertCircle,
} from "lucide-react";
import {
  lookupLabTestsByPatient,
  lookupLabTestById,
  type PatientLabTest,
  getStatusColor,
  getStatusDisplayText,
  formatLabTestDate,
} from "@/lib/api-labtest";
import { toast } from "sonner";

export default function LabTestLookupPage() {
  const [patientId, setPatientId] = useState("");
  const [labTestId, setLabTestId] = useState("");
  const [labTests, setLabTests] = useState<PatientLabTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState<PatientLabTest | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch() {
    if (!patientId && !labTestId) {
      toast.error("Please enter a Patient ID or Lab Test ID");
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      
      let results: PatientLabTest[] = [];
      
      if (labTestId) {
        // Search by lab test ID
        const test = await lookupLabTestById(parseInt(labTestId));
        results = [test];
      } else if (patientId) {
        // Search by patient ID
        results = await lookupLabTestsByPatient(parseInt(patientId));
      }
      
      setLabTests(results);
      if (results.length === 0) {
        toast.info("No lab tests found");
      }
    } catch (err: any) {
      console.error("Failed to lookup lab tests:", err);
      toast.error("Failed to lookup lab tests");
      setLabTests([]);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setPatientId("");
    setLabTestId("");
    setLabTests([]);
    setHasSearched(false);
  }

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Lab Test Lookup
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mt-1">
            Search for patient lab tests by ID
          </p>
        </div>
      </header>

      {/* Search Card */}
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold tracking-wide flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-600" />
            Search Lab Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                type="number"
                placeholder="Enter patient ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labTestId">Lab Test ID</Label>
              <Input
                id="labTestId"
                type="number"
                placeholder="Enter lab test ID"
                value={labTestId}
                onChange={(e) => setLabTestId(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold tracking-wide flex items-center gap-2">
              <TestTube className="w-5 h-5 text-emerald-600" />
              Search Results
            </CardTitle>
            {hasSearched && (
              <Badge
                variant="secondary"
                className="text-sm bg-slate-100 text-slate-700 border border-slate-200"
              >
                {labTests.length} Found
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!hasSearched ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">
                Enter a Patient ID or Lab Test ID to search
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : labTests.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No lab tests found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-450px)] overflow-y-auto">
              {labTests.map((test) => (
                <div
                  key={test.id}
                  className="border rounded-lg bg-slate-50 hover:bg-emerald-50/30 transition-all p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                        <TestTube className="w-5 h-5 text-emerald-600" />
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
                          <Badge variant="outline" className="text-xs">
                            ID: {test.id}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <p className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            Patient: {test.patient.firstName} {test.patient.lastName}{" "}
                            (ID: {test.patient.id})
                          </p>
                          <p className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {test.labTest.departmentName}
                          </p>
                          <p className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Ordered: {formatLabTestDate(test.orderedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTest(test);
                          setDetailsDialogOpen(true);
                        }}
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
              <FileText className="h-5 w-5 text-emerald-600" />
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
                    <p className="text-sm text-muted-foreground">Patient ID</p>
                    <p className="font-medium">{selectedTest.patient.id}</p>
                  </div>
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

              {/* Test Info */}
              <div className="space-y-2">
                <h4 className="font-semibold">Test Information</h4>
                <div className="bg-slate-50 p-4 rounded-lg border space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Test Name</span>
                    <span className="font-medium">{selectedTest.labTest.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Department</span>
                    <span className="font-medium">{selectedTest.labTest.departmentName}</span>
                  </div>
                  {selectedTest.labTest.description && (
                    <div>
                      <span className="text-sm text-muted-foreground">Description</span>
                      <p className="text-sm mt-1">{selectedTest.labTest.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignment Info */}
              {selectedTest.labTechnician && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Assigned Lab Technician</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <p className="font-medium">
                      {selectedTest.labTechnician.firstName} {selectedTest.labTechnician.lastName}
                    </p>
                  </div>
                </div>
              )}

              {selectedTest.pathologist && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Assigned Pathologist</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <p className="font-medium">
                      {selectedTest.pathologist.firstName} {selectedTest.pathologist.lastName}
                    </p>
                  </div>
                </div>
              )}

              {/* Results (if approved) */}
              {selectedTest.status === "APPROVED" && selectedTest.result && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Test Results</h4>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    {selectedTest.labTest.formStructure?.sections ? (
                      selectedTest.labTest.formStructure.sections.map(
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
