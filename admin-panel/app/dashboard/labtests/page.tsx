"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Ban, ToggleLeftIcon, ToggleRightIcon } from "lucide-react"
import { LabTestDialog } from "@/components/labtest/labtest-dialog"
import type { LabTest } from "@/lib/types"
import { toast } from "sonner"
import api from "@/lib/api"
import { Header } from "@/components/header"

export default function LabTestsPage() {
  const [labTests, setLabTests] = useState<LabTest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedLabTest, setSelectedLabTest] = useState<LabTest | null>(null)

  useEffect(() => {
    loadLabTests()
  }, [])

  const loadLabTests = async () => {
    try {
      setLoading(true)
      const response = await api.get('/lab-tests')
      setLabTests(response.data)
    } catch (error) {
      toast.error("Failed to load lab tests")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedLabTest(null)
    setDialogOpen(true)
  }

  const handleEdit = (labTest: LabTest) => {
    setSelectedLabTest(labTest)
    setDialogOpen(true)
  }

  const handleToggle = async (labTest: LabTest) => {
    try {
      await api.patch(`/lab-tests/${labTest.id}/toggle`)
      toast.success(`Lab test ${labTest.isActive ? "deactivated" : "activated"} successfully`)
      setLabTests(labTests.map(t => t.id === labTest.id ? { ...t, isActive: !t.isActive } : t))
    } catch (error) {
      toast.error("Failed to toggle lab test")
    }
  }

  const handleSave = async (labTest: LabTest) => {
    if (selectedLabTest) {
      // Update existing
      setLabTests(labTests.map((t) => (t.id === labTest.id ? labTest : t)))
    } else {
      // Add new
      setLabTests([...labTests, labTest])
    }
    setDialogOpen(false)
    toast.success(`Lab test ${selectedLabTest ? "updated" : "added"} successfully`)
  }

  const filteredLabTests = labTests.filter(
    (labTest) =>
      labTest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      labTest.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (labTest.templateName || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Header title="Lab Tests" link="/dashboard/labtests" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Tests</h1>
          <p className="text-muted-foreground">Manage lab test records and templates</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lab Test
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lab Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labTests.length}</div>
            <p className="text-xs text-muted-foreground">In system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lab Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labTests.filter(t => t.isActive).length}</div>
            <p className="text-xs text-muted-foreground">{labTests.filter(t => !t.isActive).length} inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(labTests.map(t => t.templateName)).size}</div>
            <p className="text-xs text-muted-foreground">Unique templates</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Lab Test Inventory
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lab tests..."
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
              <div className="text-muted-foreground">Loading lab tests...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLabTests.map((labTest) => (
                  <TableRow key={labTest.id}>
                    <TableCell className="font-medium">{labTest.name}</TableCell>
                    <TableCell>{labTest.departmentName}</TableCell>
                    <TableCell>{labTest.templateName}</TableCell>
                    <TableCell>
                      <Badge variant={labTest.isActive ? "default" : "secondary"}>
                        {labTest.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(labTest.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(labTest)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleToggle(labTest)}>
                          {labTest.isActive ? <ToggleRightIcon className="h-4 w-4" /> : <ToggleLeftIcon className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLabTests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No lab tests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <LabTestDialog open={dialogOpen} onOpenChange={setDialogOpen} labTest={selectedLabTest} onSave={handleSave} />
    </div>
  )
}
