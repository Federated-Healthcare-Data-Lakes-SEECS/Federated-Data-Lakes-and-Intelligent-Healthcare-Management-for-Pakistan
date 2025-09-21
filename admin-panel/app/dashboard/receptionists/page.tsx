"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, UserCheck, Phone, Mail } from "lucide-react"
import { ReceptionistDialog } from "@/components/receptionists/receptionist-dialog"
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog"
import type { Receptionist } from "@/lib/types"
import { toast }  from "sonner"
import api from "@/lib/api"
import { Header } from "@/components/header"

export default function ReceptionistsPage() {
  const [receptionists, setReceptionists] = useState<Receptionist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedReceptionist, setSelectedReceptionist] = useState<Receptionist | null>(null)
  const [receptionistToDelete, setReceptionistToDelete] = useState<Receptionist | null>(null)

  useEffect(() => {
    loadReceptionists()
  }, [])

  const loadReceptionists = async () => {
    try {
      setLoading(true)
      const response = await api.get('/receptionists')
      setReceptionists(response.data)
    } catch (error) {
      toast.error("Failed to load receptionists")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedReceptionist(null)
    setDialogOpen(true)
  }

  const handleEdit = (receptionist: Receptionist) => {
    setSelectedReceptionist(receptionist)
    setDialogOpen(true)
  }

  const handleDelete = (receptionist: Receptionist) => {
    setReceptionistToDelete(receptionist)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!receptionistToDelete) return

    try {
      await api.delete(`/receptionists/${receptionistToDelete.id}`)
      toast.success("Receptionist deleted successfully")
    } catch (error) {
      toast.error("Failed to delete receptionist")
    } finally {
      setDeleteDialogOpen(false)
      setReceptionistToDelete(null)
      loadReceptionists()
    }
  }

  const handleSave = async (receptionist: Receptionist) => {
    if (selectedReceptionist) {
      // Update existing
      setReceptionists(receptionists.map((r) => (r.id === receptionist.id ? receptionist : r)))
    } else {
      // Add new
      setReceptionists([...receptionists, receptionist])
    }
    setDialogOpen(false)
    toast.success(`Receptionist ${selectedReceptionist ? "updated" : "added"} successfully`)
  }

  const filteredReceptionists = receptionists.filter(
    (receptionist) =>
      `${receptionist.firstName} ${receptionist.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receptionist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (receptionist.phoneNumber && receptionist.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <Header title="Receptionists" link="/dashboard/receptionists" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receptionists</h1>
          <p className="text-muted-foreground">Manage reception staff and their contact information</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Receptionist
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{receptionists.length}</div>
            <p className="text-xs text-muted-foreground">Reception staff members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Phone</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {receptionists.filter((r) => r.phoneNumber && r.phoneNumber.trim()).length}
            </div>
            <p className="text-xs text-muted-foreground">Have phone numbers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Reception Staff
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search receptionists..."
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
              <div className="text-muted-foreground">Loading receptionists...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceptionists.map((receptionist) => (
                  <TableRow key={receptionist.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{`${receptionist.firstName} ${receptionist.lastName}`}</div>
                        <div className="text-sm text-muted-foreground">ID: {receptionist.cnic}</div>
                      </div>
                    </TableCell>
                    <TableCell>{receptionist.email}</TableCell>
                    <TableCell>
                      {receptionist.phoneNumber ? (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {receptionist.phoneNumber}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{receptionist.gender}</Badge>
                    </TableCell>
                    <TableCell>{new Date(receptionist.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(receptionist)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(receptionist)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredReceptionists.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No receptionists found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ReceptionistDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        receptionist={selectedReceptionist}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Receptionist"
        description={`Are you sure you want to delete ${receptionistToDelete?.firstName} ${receptionistToDelete?.lastName}? This action cannot be undone.`}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
