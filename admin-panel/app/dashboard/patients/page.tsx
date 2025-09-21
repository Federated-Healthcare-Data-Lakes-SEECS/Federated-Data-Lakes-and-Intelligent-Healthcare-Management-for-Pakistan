"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Heart, Users, Calendar, AlertTriangle } from "lucide-react"
import { PatientDialog } from "@/components/patients/patient-dialog"
// import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog"
import { patientService } from "@/lib/data-service"
import type { Patient } from "@/lib/types"
import { toast } from "sonner"
import api from "@/lib/api"
import { Header } from "@/components/header"

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)

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

  const handleCreate = () => {
    setSelectedPatient(null)
    setDialogOpen(true)
  }

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient)
    setDialogOpen(true)
  }

  // const handleDelete = (patient: Patient) => {
  //   setPatientToDelete(patient)
  //   setDeleteDialogOpen(true)
  // }

  // const confirmDelete = async () => {
  //   if (!patientToDelete) return

  //   try {
  //     await patientService.delete(patientToDelete.id)
  //     setPatients(patients.filter((p) => p.id !== patientToDelete.id))
  //     toast.success("Patient deleted successfully")
  //   } catch (error) {
  //     toast.error("Failed to delete patient")
  //   } finally {
  //     setDeleteDialogOpen(false)
  //     setPatientToDelete(null)
  //   }
  // }

  const handleSave = async (patient: Patient) => {
    if (selectedPatient) {
      // Update existing
      setPatients(patients.map((p) => (p.id === patient.id ? patient : p)))
    } else {
      // Add new
      setPatients([...patients, patient])
    }
    setDialogOpen(false)
    toast.success(`Patient ${selectedPatient ? "updated" : "added"} successfully`)
  }

  // const calculateAge = (dateOfBirth: Date | undefined): number => {
  //   if (!dateOfBirth) return 0
  //   const today = new Date()
  //   const birthDate = new Date(dateOfBirth)
  //   let age = today.getFullYear() - birthDate.getFullYear()
  //   const monthDiff = today.getMonth() - birthDate.getMonth()
  //   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
  //     age--
  //   }
  //   return age
  // }

  const filteredPatients = patients.filter(
    (patient) =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) 
      // ||
      // patient.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // patient.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // const patientsWithAllergies = patients.filter((p) => p.allergies && p.allergies.trim()).length
  // const averageAge =
  //   patients.length > 0
  //     ? Math.round(patients.reduce((sum, p) => sum + calculateAge(p.dateOfBirth), 0) / patients.length)
  //     : 0

  return (
    <div className="space-y-6">
      <Header title="Patients" link="/dashboard/patients" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Manage patient records and medical information</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">Registered patients</p>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAge}</div>
            <p className="text-xs text-muted-foreground">Years old</p>
          </CardContent>
        </Card> */}
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Allergies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientsWithAllergies}</div>
            <p className="text-xs text-muted-foreground">Have known allergies</p>
          </CardContent>
        </Card> */}
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Groups</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(patients.map((p) => p.bloodGroup).filter(Boolean)).size}</div>
            <p className="text-xs text-muted-foreground">Different blood types</p>
          </CardContent>
        </Card> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Patient Records
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
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
              <div className="text-muted-foreground">Loading patients...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  {/* <TableHead>Age</TableHead> */}
                  {/* <TableHead>Blood Group</TableHead> */}
                  {/* <TableHead>Phone</TableHead> */}
                  {/* <TableHead>Medical History</TableHead> */}
                  {/* <TableHead>Allergies</TableHead> */}
                  <TableHead>Gender</TableHead>
                  <TableHead>CNIC</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{`${patient.firstName} ${patient.lastName}`}</div>
                        <div className="text-sm text-muted-foreground">{patient.email}</div>
                      </div>
                    </TableCell>
                    {/* <TableCell>
                      {patient.dateOfBirth ? (
                        <div>
                          <div>{calculateAge(patient.dateOfBirth)} years</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(patient.dateOfBirth).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {patient.bloodGroup ? (
                        <Badge variant="outline">{patient.bloodGroup}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {patient.phoneNumber ? (
                        patient.phoneNumber
                      ) : (
                        <span className="text-muted-foreground">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {patient.medicalHistory ? (
                        <div className="truncate" title={patient.medicalHistory}>
                          {patient.medicalHistory}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No history</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {patient.allergies ? (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                          <div className="truncate" title={patient.allergies}>
                            {patient.allergies}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">None known</span>
                      )}
                    </TableCell> */}
                    <TableCell>
                      <Badge variant="outline">{patient.gender}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{patient.cnic}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* <Button variant="ghost" size="sm" onClick={() => handleEdit(patient)}>
                          <Edit className="h-4 w-4" />
                        </Button> */}
                        {/* <Button variant="ghost" size="sm" onClick={() => handleDelete(patient)}>
                          <Trash2 className="h-4 w-4" />
                        </Button> */}
                        <div className="text-muted-foreground italic text-sm">
                          No actions
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPatients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No patients found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PatientDialog open={dialogOpen} onOpenChange={setDialogOpen} patient={selectedPatient} onSave={handleSave} />

      {/* <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Patient"
        description={`Are you sure you want to delete ${patientToDelete?.firstName} ${patientToDelete?.lastName}? This will permanently remove all patient records and cannot be undone.`}
        onConfirm={confirmDelete}
      /> */}
    </div>
  )
}
