"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FlaskConical, FileText, CheckCircle, Building2, Power, Trash2 } from "lucide-react"
import { LabTestDialog } from "@/components/labtest/labtest-dialog"
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { StatCardSkeleton, TableSkeleton } from "@/components/shared/skeletons"
import type { LabTest } from "@/lib/types"
import { toast } from "sonner"
import api from "@/lib/api"

export default function LabTestsPage() {
  const [labTests, setLabTests] = useState<LabTest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [labTestToDelete, setLabTestToDelete] = useState<LabTest | null>(null)

  useEffect(() => {
    loadLabTests()
  }, [])

  const loadLabTests = async () => {
    try {
      setLoading(true)
      const response = await api.get('/labtests')
      setLabTests(response.data)
    } catch (error) {
      toast.error("Failed to load lab tests")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setDialogOpen(true)
  }

  const handleToggle = async (labTest: LabTest) => {
    try {
      const response = await api.patch(`/labtests/${labTest.id}/toggle`)
      setLabTests(labTests.map(t => t.id === labTest.id ? response.data : t))
      toast.success(`Lab test ${labTest.isActive ? "deactivated" : "activated"} successfully`)
    } catch (error) {
      toast.error("Failed to toggle lab test")
    }
  }

  const handleDelete = (labTest: LabTest) => {
    setLabTestToDelete(labTest)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!labTestToDelete) return

    try {
      await api.delete(`/labtests/${labTestToDelete.id}`)
      setLabTests(labTests.filter((t) => t.id !== labTestToDelete.id))
      toast.success("Lab test deleted successfully")
    } catch (error) {
      toast.error("Failed to delete lab test")
    } finally {
      setDeleteDialogOpen(false)
      setLabTestToDelete(null)
    }
  }

  const handleSave = async (labTest: LabTest) => {
    setLabTests([...labTests, labTest])
    setDialogOpen(false)
    toast.success("Lab test added successfully")
  }

  const handleError = (error: unknown) => {
    const axiosError = error as { response?: { data?: { message?: string } } }
    const message = axiosError?.response?.data?.message || "An error occurred"
    toast.error(message)
  }

  const filteredLabTests = labTests.filter(
    (labTest) =>
      labTest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      labTest.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (labTest.templateName || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeCount = labTests.filter(t => t.isActive).length
  const uniqueTemplates = new Set(labTests.map(t => t.templateName)).size
  const uniqueDepartments = new Set(labTests.map(t => t.departmentName)).size

  return (
    <PageWrapper title="Lab Tests" link="/dashboard/labtests">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Lab Tests
            </h1>
            <p className="text-muted-foreground mt-1">Manage lab test records and templates</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
            <Plus className="mr-2 h-4 w-4" />
            Add Lab Test
          </Button>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Lab Tests</CardTitle>
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <FlaskConical className="h-4 w-4 text-cyan-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{labTests.length}</div>
                <p className="text-xs text-muted-foreground mt-1">In system</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Tests</CardTitle>
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently available</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Templates Used</CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <FileText className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{uniqueTemplates}</div>
                <p className="text-xs text-muted-foreground mt-1">Unique templates</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Building2 className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{uniqueDepartments}</div>
                <p className="text-xs text-muted-foreground mt-1">Offering tests</p>
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
                Lab Test Directory
              </CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lab tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-slate-200/50 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : (
              <div className="rounded-lg border border-slate-200/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Department</TableHead>
                      <TableHead className="font-semibold">Template</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Updated</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLabTests.map((labTest) => (
                      <TableRow key={labTest.id} className="hover:bg-blue-50/30 transition-colors">
                        <TableCell className="font-semibold">{labTest.name}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-700 border-0">
                            {labTest.departmentName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white/50 border-slate-200">
                            {labTest.templateName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`border-0 ${
                              labTest.isActive 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {labTest.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(labTest.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleToggle(labTest)}
                              className={`h-8 w-8 p-0 ${
                                labTest.isActive 
                                  ? 'hover:bg-amber-100 hover:text-amber-600' 
                                  : 'hover:bg-emerald-100 hover:text-emerald-600'
                              }`}
                              title={labTest.isActive ? "Deactivate" : "Activate"}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(labTest)}
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredLabTests.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <FlaskConical className="h-8 w-8 text-muted-foreground/50" />
                            <span>No lab tests found</span>
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

        <LabTestDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
          onSave={handleSave} 
          onError={handleError}
        />

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Lab Test"
          description={`Are you sure you want to delete "${labTestToDelete?.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
        />
      </div>
    </PageWrapper>
  )
}
