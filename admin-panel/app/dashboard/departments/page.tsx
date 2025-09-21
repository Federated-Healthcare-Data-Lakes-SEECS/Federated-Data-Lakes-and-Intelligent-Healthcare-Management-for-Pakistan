"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Building2 } from "lucide-react"
import { DepartmentDialog } from "@/components/departments/department-dialog"
// import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog"
import { departmentService } from "@/lib/data-service"
import type { Department } from "@/lib/types"
import { toast } from "sonner"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import api from "@/lib/api"
import { Header } from "@/components/header"

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  // const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null)

  useEffect(() => {
    loadDepartments()
  }, [])

  const loadDepartments = async () => {
    try {
      setLoading(true)
      const response = await api.get("/departments")
      setDepartments(response.data)
    } catch (error) {
      toast.error("Failed to load departments")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedDepartment(null)
    setDialogOpen(true)
  }

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department)
    setDialogOpen(true)
  }

  // const handleDelete = (department: Department) => {
  //   setDepartmentToDelete(department)
  //   setDeleteDialogOpen(true)
  // }

  // const confirmDelete = async () => {
  //   if (!departmentToDelete) return

  //   try {
  //     await departmentService.delete(departmentToDelete.id)
  //     setDepartments(departments.filter((d) => d.id !== departmentToDelete.id))
  //     toast.success("Department deleted successfully")
  //   } catch (error) {
  //     toast.error("Failed to delete department")
  //   } finally {
  //     setDeleteDialogOpen(false)
  //     setDepartmentToDelete(null)
  //   }
  // }

  const handleSave = async (department: Department) => {
    if (selectedDepartment) {
      // Update existing
      setDepartments(departments.map((d) => (d.id === department.id ? department : d)))
    } else {
      // Add new
      setDepartments([...departments, department])
    }
    setDialogOpen(false)
    toast.success(`Department ${selectedDepartment ? "updated" : "created"} successfully`)
  }

  const filteredDepartments = departments.filter(
    (department) =>
      department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Header title="Departments" link="/dashboard/departments" />
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Manage hospital departments and their configurations</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Department List
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
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
              <div className="text-muted-foreground">Loading departments...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>{department.code}</TableCell>
                    <TableCell className="max-w-xs truncate">{department.description || "No description"}</TableCell>
                    <TableCell>
                      <Badge variant={department.isActive ? "default" : "secondary"}>
                        {department.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(department.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(department)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* <Button variant="ghost" size="sm" onClick={() => handleDelete(department)}>
                          <Trash2 className="h-4 w-4" />
                        </Button> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDepartments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No departments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DepartmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        department={selectedDepartment}
        onSave={handleSave}
      />

      {/* <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Department"
        description={`Are you sure you want to delete "${departmentToDelete?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
      /> */}
    </div>
  )
}
