"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Users, Stethoscope } from "lucide-react"
import { DoctorDialog } from "@/components/doctors/doctor-dialog"
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog"
import type { Doctor } from "@/lib/types"
import { toast } from "sonner"
import api from "@/lib/api"
import { Header } from "@/components/header"

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null)

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

  const handleDelete = (doctor: Doctor) => {
    setDoctorToDelete(doctor)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!doctorToDelete) return

    try {
      await api.delete(`/doctors/${doctorToDelete.id}`)
      toast.success("Doctor deleted successfully")
    } catch (error) {
      toast.error("Failed to delete doctor")
    } finally {
      setDeleteDialogOpen(false)
      setDoctorToDelete(null)
    }
  }

  const handleSave = async (doctor: Doctor) => {
    console.log("Selected Doctor:", selectedDoctor);
    console.log('Saved Doctor:', doctor);
    if (selectedDoctor) {
      // Update existing
      setDoctors(doctors.map((d) => (d.id === doctor.id ? doctor : d)))
    } else {
      // Add new
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
    <div className="space-y-6">
      <Header title="Doctors" link="/dashboard/doctors" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
          <p className="text-muted-foreground">Manage medical staff and their credentials</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctors.length}</div>
            <p className="text-xs text-muted-foreground">Active medical staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Specializations</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(doctors.map((d) => d.specialization)).size}</div>
            <p className="text-xs text-muted-foreground">Different specialties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Experience</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {doctors.length > 0 ? Math.round(doctors.reduce((sum, d) => sum + d.experience, 0) / doctors.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Years of experience</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Medical Staff
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading doctors...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>License Number</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{`${doctor.firstName} ${doctor.lastName}`}</div>
                        <div className="text-sm text-muted-foreground">{doctor.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doctor.licenseNumber}</Badge>
                    </TableCell>
                    <TableCell>{doctor.departmentName}</TableCell>
                    <TableCell>{doctor.specialization}</TableCell>
                    <TableCell>{doctor.experience} years</TableCell>
                    <TableCell className="max-w-xs truncate">{doctor.qualification}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(doctor)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(doctor)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDoctors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No doctors found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DoctorDialog open={dialogOpen} onOpenChange={setDialogOpen} doctor={selectedDoctor} onSave={handleSave} />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Doctor"
        description={`Are you sure you want to delete Dr. ${doctorToDelete?.firstName} ${doctorToDelete?.lastName}? This action cannot be undone.`}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
