"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Users, FlaskConical, Award, Power } from "lucide-react"
import { LabTechnicianDialog } from "@/components/lab-technicians/lab-technician-dialog"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { StatCardSkeleton, TableSkeleton } from "@/components/shared/skeletons"
import type { LabTechnician } from "@/lib/types"
import { toast } from "sonner"
import api from "@/lib/api"

export default function LabTechniciansPage() {
  const [labTechnicians, setLabTechnicians] = useState<LabTechnician[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedLabTechnician, setSelectedLabTechnician] = useState<LabTechnician | null>(null)

  useEffect(() => {
    loadLabTechnicians()
  }, [])

  const loadLabTechnicians = async () => {
    try {
      setLoading(true)
      const response = await api.get('/lab-technicians');
      setLabTechnicians(response.data)
    } catch (error) {
      toast.error("Failed to load lab technicians")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedLabTechnician(null)
    setDialogOpen(true)
  }

  const handleEdit = (labTechnician: LabTechnician) => {
    setSelectedLabTechnician(labTechnician)
    setDialogOpen(true)
  }

  const handleToggleActive = async (labTechnician: LabTechnician) => {
    try {
      const endpoint = labTechnician.isActive 
        ? `/lab-technicians/${labTechnician.id}/deactivate` 
        : `/lab-technicians/${labTechnician.id}/activate`
      const response = await api.patch(endpoint)
      setLabTechnicians(labTechnicians.map((lt) => (lt.id === labTechnician.id ? response.data : lt)))
      toast.success(`Lab technician ${labTechnician.isActive ? "deactivated" : "activated"} successfully`)
    } catch (error) {
      toast.error(`Failed to ${labTechnician.isActive ? "deactivate" : "activate"} lab technician`)
    }
  }

  const handleError = (error: unknown) => {
    const axiosError = error as { response?: { data?: { message?: string } } }
    const message = axiosError?.response?.data?.message || "An error occurred"
    toast.error(message)
  }

  const handleSave = async (labTechnician: LabTechnician) => {
    if (selectedLabTechnician) {
      setLabTechnicians(labTechnicians.map((lt) => (lt.id === labTechnician.id ? labTechnician : lt)))
    } else {
      setLabTechnicians([...labTechnicians, labTechnician])
    }
    setDialogOpen(false)
    toast.success(`Lab technician ${selectedLabTechnician ? "updated" : "added"} successfully`)
  }

  const filteredLabTechnicians = labTechnicians.filter(
    (lt) =>
      `${lt.firstName} ${lt.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lt.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lt.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lt.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <PageWrapper title="Lab Technicians" link="/dashboard/lab-technicians">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-cyan-600 to-cyan-800 bg-clip-text text-transparent">
              Lab Technicians
            </h1>
            <p className="text-muted-foreground mt-1">Manage laboratory staff and their credentials</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
            <Plus className="mr-2 h-4 w-4" />
            Add Lab Technician
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Lab Technicians</CardTitle>
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Users className="h-4 w-4 text-cyan-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{labTechnicians.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Active lab staff</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Specializations</CardTitle>
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <FlaskConical className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{new Set(labTechnicians.filter(lt => lt.specialization).map((lt) => lt.specialization)).size}</div>
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
                  {labTechnicians.length > 0 ? Math.round(labTechnicians.reduce((sum, lt) => sum + lt.experience, 0) / labTechnicians.length) : 0}
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
                  <FlaskConical className="h-4 w-4 text-primary" />
                </div>
                Lab Technicians Directory
              </CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lab technicians..."
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
                    {filteredLabTechnicians.map((lt) => (
                      <TableRow key={lt.id} className="hover:bg-cyan-50/30 transition-colors">
                        <TableCell className="font-medium">
                          <div className="font-semibold">{`${lt.firstName} ${lt.lastName}`}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{lt.email}</div>
                            <div className="text-muted-foreground">Exp: {lt.experience} yrs</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white/50 border-slate-200 font-mono text-xs">
                            {lt.cnic}
                          </Badge>
                        </TableCell>
                        <TableCell>{lt.departmentName}</TableCell>
                        <TableCell>
                          {lt.specialization ? (
                            <Badge className="bg-cyan-100 text-cyan-700 border-0 hover:bg-cyan-200">
                              {lt.specialization}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={lt.isActive ? "default" : "secondary"}
                            className={lt.isActive 
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                              : "bg-slate-100 text-slate-500"}
                          >
                            {lt.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(lt)}
                              className="h-8 w-8 p-0 hover:bg-cyan-100 hover:text-cyan-600"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleToggleActive(lt)}
                              className={`h-8 w-8 p-0 ${lt.isActive 
                                ? "hover:bg-orange-100 hover:text-orange-600" 
                                : "hover:bg-emerald-100 hover:text-emerald-600"}`}
                              title={lt.isActive ? "Deactivate" : "Activate"}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredLabTechnicians.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <FlaskConical className="h-8 w-8 text-muted-foreground/50" />
                            <span>No lab technicians found</span>
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

        <LabTechnicianDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
          labTechnician={selectedLabTechnician} 
          onSave={handleSave} 
          onError={handleError}
        />
      </div>
    </PageWrapper>
  )
}
