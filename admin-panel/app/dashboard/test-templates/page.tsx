"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, ToggleLeftIcon, ToggleRightIcon } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"

export default function LabTestTemplatesPage() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
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

  const handleEdit = (template: any) => {
    router.push(`/dashboard/test-templates/${template.id}/edit`)
  }

  const handleToggle = async (template: any) => {
    try {
      await api.patch(`/labtesttemplate/${template.id}/toggle`)
      toast.success("Template toggled successfully")
      loadTemplates()
    } catch (error) {
      toast.error("Failed to toggle template")
    }
  }

  const filteredTemplates = templates.filter(
    (t: any) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeTemplates = templates.filter((t: any) => t.isActive).length
  const inactiveTemplates = templates.filter((t: any) => !t.isActive).length
  const uniqueVersions = new Set(templates.map((t: any) => t.version)).size

  return (
    <div className="space-y-6">
      <Header title="Lab Test Templates" link="/dashboard/test-templates" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Test Templates</h1>
          <p className="text-muted-foreground">Manage lab test template profiles and structures</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">In system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTemplates}</div>
            <p className="text-xs text-muted-foreground">{inactiveTemplates} inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueVersions}</div>
            <p className="text-xs text-muted-foreground">Unique versions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Lab Test Template Inventory
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading templates...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template: any) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{template.name}</div>
                        <div className="text-sm text-muted-foreground" title={template.description}>
                          {template.description && template.description.length > 50 ? `${template.description.substring(0, 50)}...` : template.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{template.version}</TableCell>
                    <TableCell>{template.description}</TableCell>
                    <TableCell>
                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(template.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleToggle(template)}>
                          {template.isActive ? <ToggleRightIcon className="h-4 w-4" /> : <ToggleLeftIcon className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTemplates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No lab test templates found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
