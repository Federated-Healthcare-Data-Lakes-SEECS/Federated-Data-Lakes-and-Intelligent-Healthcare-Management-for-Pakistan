"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Heart, Users, Eye, Power } from "lucide-react"
import { PatientDetailDialog } from "@/components/patients/patient-detail-dialog"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { StatCardSkeleton, TableSkeleton } from "@/components/shared/skeletons"
import type { Patient } from "@/lib/types"
import { toast } from "sonner"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const response = await api.get('/patients')
      setPatients(response.data)
    } catch (error) {
      toast.error("Failed to load patients")
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient)
    setDetailDialogOpen(true)
  }

  const handleToggleActive = async (patient: Patient) => {
    try {
      const endpoint = patient.isActive 
        ? `/patients/${patient.id}/deactivate` 
        : `/patients/${patient.id}/activate`
      const response = await api.patch(endpoint)
      setPatients(patients.map((p) => (p.id === patient.id ? response.data : p)))
      toast.success(`Patient ${patient.isActive ? "deactivated" : "activated"} successfully`)
    } catch (error) {
      toast.error(`Failed to ${patient.isActive ? "deactivate" : "activate"} patient`)
    }
  }

  const filteredPatients = patients.filter(
    (patient) =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const maleCount = patients.filter(p => p.gender?.toLowerCase() === 'male').length
  const femaleCount = patients.filter(p => p.gender?.toLowerCase() === 'female').length

  return (
    <PageWrapper title="Patients" link="/dashboard/patients">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Patients
            </h1>
            <p className="text-muted-foreground mt-1">View patient records and medical information</p>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
                <div className="p-2 bg-rose-500/10 rounded-lg">
                  <Heart className="h-4 w-4 text-rose-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{patients.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Registered patients</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Male Patients</CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{maleCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Male registrations</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Female Patients</CardTitle>
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <Users className="h-4 w-4 text-pink-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{femaleCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Female registrations</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Table Card */}
        <Card className="glass-card border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Heart className="h-4 w-4 text-primary" />
                </div>
                Patient Records
              </CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-slate-200/50 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={5} columns={4} />
            ) : (
              <div className="rounded-lg border border-slate-200/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Contact</TableHead>
                      <TableHead className="font-semibold">CNIC</TableHead>
                      <TableHead className="font-semibold">Gender</TableHead>
                      <TableHead className="font-semibold">Blood Group</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id} className="hover:bg-blue-50/30 transition-colors">
                        <TableCell className="font-medium">
                          <div className="font-semibold">{`${patient.firstName} ${patient.lastName}`}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{patient.email}</div>
                            <div className="text-muted-foreground">{patient.phoneNumber || 'No phone'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white/50 border-slate-200 font-mono text-xs">
                            {patient.cnic}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`border-0 ${
                              patient.gender?.toLowerCase() === 'male' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-pink-100 text-pink-700'
                            }`}
                          >
                            {patient.gender}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-red-50 text-red-700 border-0">
                            {patient.bloodGroup || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={patient.isActive ? "default" : "secondary"}
                            className={patient.isActive 
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                              : "bg-slate-100 text-slate-500"}
                          >
                            {patient.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewDetails(patient)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleToggleActive(patient)}
                              className={`h-8 w-8 p-0 ${patient.isActive 
                                ? "hover:bg-orange-100 hover:text-orange-600" 
                                : "hover:bg-emerald-100 hover:text-emerald-600"}`}
                              title={patient.isActive ? "Deactivate" : "Activate"}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredPatients.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Heart className="h-8 w-8 text-muted-foreground/50" />
                            <span>No patients found</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <PatientDetailDialog 
          open={detailDialogOpen} 
          onOpenChange={setDetailDialogOpen} 
          patient={selectedPatient} 
        />
      </div>
    </PageWrapper>
  )
}
