"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Users, Stethoscope, Award, Power } from "lucide-react"
import { DoctorDialog } from "@/components/doctors/doctor-dialog"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { StatCardSkeleton, TableSkeleton } from "@/components/shared/skeletons"
import type { Doctor } from "@/lib/types"
import { toast } from "sonner"
import api from "@/lib/api"

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      const response = await api.get('/doctors');
      console.log(response.data)
      setDoctors(response.data)
    } catch (error) {
      toast.error("Failed to load doctors")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedDoctor(null)
    setDialogOpen(true)
  }

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setDialogOpen(true)
  }

  const handleToggleActive = async (doctor: Doctor) => {
    try {
      const endpoint = doctor.isActive 
        ? `/doctors/${doctor.id}/deactivate` 
        : `/doctors/${doctor.id}/activate`
      const response = await api.patch(endpoint)
      setDoctors(doctors.map((d) => (d.id === doctor.id ? response.data : d)))
      toast.success(`Doctor ${doctor.isActive ? "deactivated" : "activated"} successfully`)
    } catch (error) {
      toast.error(`Failed to ${doctor.isActive ? "deactivate" : "activate"} doctor`)
    }
  }

  const handleError = (error: unknown) => {
    const axiosError = error as { response?: { data?: { message?: string } } }
    const message = axiosError?.response?.data?.message || "An error occurred"
    toast.error(message)
  }

  const handleSave = async (doctor: Doctor) => {
    console.log("Selected Doctor:", selectedDoctor);
    console.log('Saved Doctor:', doctor);
    if (selectedDoctor) {
      setDoctors(doctors.map((d) => (d.id === doctor.id ? doctor : d)))
    } else {
      setDoctors([...doctors, doctor])
    }
    setDialogOpen(false)
    toast.success(`Doctor ${selectedDoctor ? "updated" : "added"} successfully`)
  }

  const filteredDoctors = doctors.filter(
    (doctor) =>
      `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.departmentName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <PageWrapper title="Doctors" link="/dashboard/doctors">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Doctors
            </h1>
            <p className="text-muted-foreground mt-1">Manage medical staff and their credentials</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
            <Plus className="mr-2 h-4 w-4" />
            Add Doctor
          </Button>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Doctors</CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{doctors.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Active medical staff</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Specializations</CardTitle>
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Stethoscope className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{new Set(doctors.map((d) => d.specialization)).size}</div>
                <p className="text-xs text-muted-foreground mt-1">Different specialties</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Experience</CardTitle>
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Award className="h-4 w-4 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {doctors.length > 0 ? Math.round(doctors.reduce((sum, d) => sum + d.experience, 0) / doctors.length) : 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Years of experience</p>
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
                  <Users className="h-4 w-4 text-primary" />
                </div>
                Medical Staff Directory
              </CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-slate-200/50 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={5} columns={7} />
            ) : (
              <div className="rounded-lg border border-slate-200/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Contact</TableHead>
                      <TableHead className="font-semibold">CNIC</TableHead>
                      <TableHead className="font-semibold">Department</TableHead>
                      <TableHead className="font-semibold">Specialization</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDoctors.map((doctor) => (
                      <TableRow key={doctor.id} className="hover:bg-blue-50/30 transition-colors">
                        <TableCell className="font-medium">
                          <div className="font-semibold">{`${doctor.firstName} ${doctor.lastName}`}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{doctor.email}</div>
                            <div className="text-muted-foreground">License: {doctor.licenseNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white/50 border-slate-200 font-mono text-xs">
                            {doctor.cnic}
                          </Badge>
                        </TableCell>
                        <TableCell>{doctor.departmentName}</TableCell>
                        <TableCell>
                          <Badge className="bg-primary/10 text-primary border-0 hover:bg-primary/20">
                            {doctor.specialization}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={doctor.isActive ? "default" : "secondary"}
                            className={doctor.isActive 
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                              : "bg-slate-100 text-slate-500"}
                          >
                            {doctor.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(doctor)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleToggleActive(doctor)}
                              className={`h-8 w-8 p-0 ${doctor.isActive 
                                ? "hover:bg-orange-100 hover:text-orange-600" 
                                : "hover:bg-emerald-100 hover:text-emerald-600"}`}
                              title={doctor.isActive ? "Deactivate" : "Activate"}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredDoctors.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="h-8 w-8 text-muted-foreground/50" />
                            <span>No doctors found</span>
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

        <DoctorDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
          doctor={selectedDoctor} 
          onSave={handleSave} 
          onError={handleError}
        />
      </div>
    </PageWrapper>
  )
}
