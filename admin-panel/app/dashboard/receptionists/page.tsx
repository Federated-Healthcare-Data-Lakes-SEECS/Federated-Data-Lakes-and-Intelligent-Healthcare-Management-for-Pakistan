"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, UserCheck, Phone, Mail, Power } from "lucide-react"
import { ReceptionistDialog } from "@/components/receptionists/receptionist-dialog"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { StatCardSkeleton, TableSkeleton } from "@/components/shared/skeletons"
import type { Receptionist } from "@/lib/types"
import { toast } from "sonner"
import api from "@/lib/api"

export default function ReceptionistsPage() {
  const [receptionists, setReceptionists] = useState<Receptionist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedReceptionist, setSelectedReceptionist] = useState<Receptionist | null>(null)

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

  const handleToggleActive = async (receptionist: Receptionist) => {
    try {
      const endpoint = receptionist.isActive 
        ? `/receptionists/${receptionist.id}/deactivate` 
        : `/receptionists/${receptionist.id}/activate`
      const response = await api.patch(endpoint)
      setReceptionists(receptionists.map((r) => (r.id === receptionist.id ? response.data : r)))
      toast.success(`Receptionist ${receptionist.isActive ? "deactivated" : "activated"} successfully`)
    } catch (error) {
      toast.error(`Failed to ${receptionist.isActive ? "deactivate" : "activate"} receptionist`)
    }
  }

  const handleError = (error: unknown) => {
    const axiosError = error as { response?: { data?: { message?: string } } }
    const message = axiosError?.response?.data?.message || "An error occurred"
    toast.error(message)
  }

  const handleSave = async (receptionist: Receptionist) => {
    if (selectedReceptionist) {
      setReceptionists(receptionists.map((r) => (r.id === receptionist.id ? receptionist : r)))
    } else {
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

  const withPhoneCount = receptionists.filter((r) => r.phoneNumber && r.phoneNumber.trim()).length

  return (
    <PageWrapper title="Receptionists" link="/dashboard/receptionists">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Receptionists
            </h1>
            <p className="text-muted-foreground mt-1">Manage reception staff and their contact information</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
            <Plus className="mr-2 h-4 w-4" />
            Add Receptionist
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <UserCheck className="h-4 w-4 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{receptionists.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Reception staff members</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">With Phone</CardTitle>
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Phone className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{withPhoneCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Have phone numbers</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Contact Rate</CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {receptionists.length > 0 ? Math.round((withPhoneCount / receptionists.length) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">With contact info</p>
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
                  <UserCheck className="h-4 w-4 text-primary" />
                </div>
                Reception Staff Directory
              </CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search receptionists..."
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
                      <TableHead className="font-semibold">Contact</TableHead>
                      <TableHead className="font-semibold">CNIC</TableHead>
                      <TableHead className="font-semibold">Gender</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReceptionists.map((receptionist) => (
                      <TableRow key={receptionist.id} className="hover:bg-blue-50/30 transition-colors">
                        <TableCell className="font-medium">
                          <div className="font-semibold">{`${receptionist.firstName} ${receptionist.lastName}`}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{receptionist.email}</div>
                            <div className="text-muted-foreground">
                              {receptionist.phoneNumber || 'No phone'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white/50 border-slate-200 font-mono text-xs">
                            {receptionist.cnic}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`border-0 ${
                              receptionist.gender?.toLowerCase() === 'male' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-pink-100 text-pink-700'
                            }`}
                          >
                            {receptionist.gender}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={receptionist.isActive ? "default" : "secondary"}
                            className={receptionist.isActive 
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                              : "bg-slate-100 text-slate-500"}
                          >
                            {receptionist.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(receptionist)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleToggleActive(receptionist)}
                              className={`h-8 w-8 p-0 ${receptionist.isActive 
                                ? "hover:bg-orange-100 hover:text-orange-600" 
                                : "hover:bg-emerald-100 hover:text-emerald-600"}`}
                              title={receptionist.isActive ? "Deactivate" : "Activate"}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredReceptionists.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <UserCheck className="h-8 w-8 text-muted-foreground/50" />
                            <span>No receptionists found</span>
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

        <ReceptionistDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          receptionist={selectedReceptionist}
          onSave={handleSave}
          onError={handleError}
        />
      </div>
    </PageWrapper>
  )
}
