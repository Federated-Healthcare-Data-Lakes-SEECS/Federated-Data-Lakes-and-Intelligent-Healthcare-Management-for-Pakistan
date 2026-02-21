"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Users, Microscope, Award, Power } from "lucide-react"
import { PathologistDialog } from "@/components/pathologists/pathologist-dialog"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { StatCardSkeleton, TableSkeleton } from "@/components/shared/skeletons"
import type { Pathologist } from "@/lib/types"
import { toast } from "sonner"
import api from "@/lib/api"

export default function PathologistsPage() {
  const [pathologists, setPathologists] = useState<Pathologist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPathologist, setSelectedPathologist] = useState<Pathologist | null>(null)

  useEffect(() => {
    loadPathologists()
  }, [])

  const loadPathologists = async () => {
    try {
      setLoading(true)
      const response = await api.get('/pathologists');
      setPathologists(response.data)
    } catch (error) {
      toast.error("Failed to load pathologists")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedPathologist(null)
    setDialogOpen(true)
  }

  const handleEdit = (pathologist: Pathologist) => {
    setSelectedPathologist(pathologist)
    setDialogOpen(true)
  }

  const handleToggleActive = async (pathologist: Pathologist) => {
    try {
      const endpoint = pathologist.isActive 
        ? `/pathologists/${pathologist.id}/deactivate` 
        : `/pathologists/${pathologist.id}/activate`
      const response = await api.patch(endpoint)
      setPathologists(pathologists.map((p) => (p.id === pathologist.id ? response.data : p)))
      toast.success(`Pathologist ${pathologist.isActive ? "deactivated" : "activated"} successfully`)
    } catch (error) {
      toast.error(`Failed to ${pathologist.isActive ? "deactivate" : "activate"} pathologist`)
    }
  }

  const handleError = (error: unknown) => {
    const axiosError = error as { response?: { data?: { message?: string } } }
    const message = axiosError?.response?.data?.message || "An error occurred"
    toast.error(message)
  }

  const handleSave = async (pathologist: Pathologist) => {
    if (selectedPathologist) {
      setPathologists(pathologists.map((p) => (p.id === pathologist.id ? pathologist : p)))
    } else {
      setPathologists([...pathologists, pathologist])
    }
    setDialogOpen(false)
    toast.success(`Pathologist ${selectedPathologist ? "updated" : "added"} successfully`)
  }

  const filteredPathologists = pathologists.filter(
    (p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <PageWrapper title="Pathologists" link="/dashboard/pathologists">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Pathologists
            </h1>
            <p className="text-muted-foreground mt-1">Manage pathology specialists and their credentials</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
            <Plus className="mr-2 h-4 w-4" />
            Add Pathologist
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Pathologists</CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pathologists.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Active pathology staff</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Specializations</CardTitle>
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Microscope className="h-4 w-4 text-indigo-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{new Set(pathologists.filter(p => p.specialization).map((p) => p.specialization)).size}</div>
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
                  {pathologists.length > 0 ? Math.round(pathologists.reduce((sum, p) => sum + p.experience, 0) / pathologists.length) : 0}
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
                  <Microscope className="h-4 w-4 text-primary" />
                </div>
                Pathologists Directory
              </CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pathologists..."
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
                    {filteredPathologists.map((p) => (
                      <TableRow key={p.id} className="hover:bg-purple-50/30 transition-colors">
                        <TableCell className="font-medium">
                          <div className="font-semibold">{`${p.firstName} ${p.lastName}`}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{p.email}</div>
                            <div className="text-muted-foreground">Exp: {p.experience} yrs</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white/50 border-slate-200 font-mono text-xs">
                            {p.cnic}
                          </Badge>
                        </TableCell>
                        <TableCell>{p.departmentName}</TableCell>
                        <TableCell>
                          <Badge className="bg-purple-100 text-purple-700 border-0 hover:bg-purple-200">
                            {p.specialization}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={p.isActive ? "default" : "secondary"}
                            className={p.isActive 
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                              : "bg-slate-100 text-slate-500"}
                          >
                            {p.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(p)}
                              className="h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-600"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleToggleActive(p)}
                              className={`h-8 w-8 p-0 ${p.isActive 
                                ? "hover:bg-orange-100 hover:text-orange-600" 
                                : "hover:bg-emerald-100 hover:text-emerald-600"}`}
                              title={p.isActive ? "Deactivate" : "Activate"}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredPathologists.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Microscope className="h-8 w-8 text-muted-foreground/50" />
                            <span>No pathologists found</span>
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

        <PathologistDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
          pathologist={selectedPathologist} 
          onSave={handleSave} 
          onError={handleError}
        />
      </div>
    </PageWrapper>
  )
}
