"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FileText, CheckCircle, Layers, Power, Trash2, Eye } from "lucide-react"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog"
import { StatCardSkeleton, TableSkeleton } from "@/components/shared/skeletons"
import { toast } from "sonner"
import api from "@/lib/api"
import type { LabTestTemplate } from "@/lib/types"
import { useRouter } from "next/navigation"

export default function LabTestTemplatesPage() {
  const [templates, setTemplates] = useState<LabTestTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<LabTestTemplate | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await api.get("/labtesttemplate").then(res => res.data)
      setTemplates(data)
    } catch (error) {
      toast.error("Failed to load lab test templates")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    router.push("/dashboard/test-templates/create")
  }

  const handlePreview = (template: LabTestTemplate) => {
    router.push(`/dashboard/test-templates/${template.id}/preview`)
  }

  const handleToggle = async (template: LabTestTemplate) => {
    try {
      const response = await api.patch(`/labtesttemplate/${template.id}/toggle`)
      // Update state locally without refetching
      setTemplates(templates.map((t) => 
        t.id === template.id ? response.data : t
      ))
      toast.success(`Template ${template.isActive ? "deactivated" : "activated"} successfully`)
    } catch (error) {
      toast.error("Failed to toggle template")
    }
  }

  const handleDelete = (template: LabTestTemplate) => {
    setTemplateToDelete(template)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!templateToDelete) return

    try {
      await api.delete(`/labtesttemplate/${templateToDelete.id}`)
      setTemplates(templates.filter((t) => t.id !== templateToDelete.id))
      toast.success("Template deleted successfully")
    } catch (error) {
      toast.error("Failed to delete template")
    } finally {
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
    }
  }

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeTemplates = templates.filter((t) => t.isActive).length
  const uniqueVersions = new Set(templates.map((t) => t.version)).size

  return (
    <PageWrapper title="Lab Test Templates" link="/dashboard/test-templates">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Lab Test Templates
            </h1>
            <p className="text-muted-foreground mt-1">Manage lab test template profiles and structures</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
            <Plus className="mr-2 h-4 w-4" />
            Add Template
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Templates</CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <FileText className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{templates.length}</div>
                <p className="text-xs text-muted-foreground mt-1">In system</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Templates</CardTitle>
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeTemplates}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently in use</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Versions</CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Layers className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{uniqueVersions}</div>
                <p className="text-xs text-muted-foreground mt-1">Unique versions</p>
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
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                Template Directory
              </CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-slate-200/50 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={5} columns={5} />
            ) : (
              <div className="rounded-lg border border-slate-200/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Version</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Updated</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTemplates.map((template) => (
                      <TableRow key={template.id} className="hover:bg-blue-50/30 transition-colors">
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{template.name}</div>
                            <div className="text-sm text-muted-foreground max-w-xs truncate" title={template.description}>
                              {template.description || "No description"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white/50 border-slate-200 font-mono">
                            v{template.version}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`border-0 ${
                              template.isActive 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {template.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(template.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handlePreview(template)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleToggle(template)}
                              className={`h-8 w-8 p-0 ${
                                template.isActive 
                                  ? 'hover:bg-amber-100 hover:text-amber-600' 
                                  : 'hover:bg-emerald-100 hover:text-emerald-600'
                              }`}
                              title={template.isActive ? "Deactivate" : "Activate"}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(template)}
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredTemplates.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-8 w-8 text-muted-foreground/50" />
                            <span>No lab test templates found</span>
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

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Lab Test Template"
          description={`Are you sure you want to delete "${templateToDelete?.name}"? This will also delete all associated lab tests.`}
          onConfirm={confirmDelete}
        />
      </div>
    </PageWrapper>
  )
}
