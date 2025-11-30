"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Pill, Package, Truck, Beaker, Power, Trash2 } from "lucide-react"
import { DrugDialog } from "@/components/drugs/drug-dialog"
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { StatCardSkeleton, TableSkeleton } from "@/components/shared/skeletons"
import type { Drug } from "@/lib/types"
import { toast } from "sonner"
import api from "@/lib/api"

export default function DrugsPage() {
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [drugToDelete, setDrugToDelete] = useState<Drug | null>(null)

  useEffect(() => {
    loadDrugs()
  }, [])

  const loadDrugs = async () => {
    try {
      setLoading(true)
      const data = await api.get("/drugs").then(res => res.data)
      setDrugs(data)
    } catch (error) {
      toast.error("Failed to load drugs")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setDialogOpen(true)
  }

  const handleToggleActive = async (drug: Drug) => {
    try {
      const response = await api.patch(`/drugs/${drug.id}/toggle`)
      setDrugs(drugs.map((d) => (d.id === drug.id ? response.data : d)))
      toast.success(`Drug ${drug.isActive ? "deactivated" : "activated"} successfully`)
    } catch (error) {
      toast.error(`Failed to ${drug.isActive ? "deactivate" : "activate"} drug`)
    }
  }

  const handleDelete = (drug: Drug) => {
    setDrugToDelete(drug)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!drugToDelete) return

    try {
      await api.delete(`/drugs/${drugToDelete.id}`)
      setDrugs(drugs.filter((d) => d.id !== drugToDelete.id))
      toast.success("Drug deleted successfully")
    } catch (error) {
      toast.error("Failed to delete drug")
    } finally {
      setDeleteDialogOpen(false)
      setDrugToDelete(null)
    }
  }

  const handleSave = async (drug: Drug) => {
    setDrugs([...drugs, drug])
    setDialogOpen(false)
    toast.success("Drug added successfully")
  }

  const handleError = (error: unknown) => {
    const axiosError = error as { response?: { data?: { message?: string } } }
    const message = axiosError?.response?.data?.message || "An error occurred"
    toast.error(message)
  }

  const filteredDrugs = drugs.filter(
    (drug) =>
      drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.formulaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.dosageForm.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeDrugs = drugs.filter((d) => d.isActive).length
  const uniqueSuppliers = new Set(drugs.map((d) => d.supplier)).size
  const uniqueDosageForms = new Set(drugs.map((d) => d.dosageForm)).size

  return (
    <PageWrapper title="Drugs" link="/dashboard/drugs">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Drugs
            </h1>
            <p className="text-muted-foreground mt-1">Manage pharmaceutical inventory and drug information</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
            <Plus className="mr-2 h-4 w-4" />
            Add Drug
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Drugs</CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Package className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{drugs.length}</div>
                <p className="text-xs text-muted-foreground mt-1">In inventory</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Drugs</CardTitle>
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Pill className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeDrugs}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently available</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Suppliers</CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Truck className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{uniqueSuppliers}</div>
                <p className="text-xs text-muted-foreground mt-1">Different suppliers</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Dosage Forms</CardTitle>
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Beaker className="h-4 w-4 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{uniqueDosageForms}</div>
                <p className="text-xs text-muted-foreground mt-1">Different forms</p>
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
                  <Pill className="h-4 w-4 text-primary" />
                </div>
                Drug Inventory
              </CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search drugs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-slate-200/50 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={5} columns={8} />
            ) : (
              <div className="rounded-lg border border-slate-200/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead className="font-semibold">Drug Name</TableHead>
                      <TableHead className="font-semibold">Formula</TableHead>
                      <TableHead className="font-semibold">Strength</TableHead>
                      <TableHead className="font-semibold">Dosage Form</TableHead>
                      <TableHead className="font-semibold">Supplier</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Updated</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrugs.map((drug) => (
                      <TableRow key={drug.id} className="hover:bg-blue-50/30 transition-colors">
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{drug.name}</div>
                            <div className="text-sm text-muted-foreground max-w-xs truncate" title={drug.description}>
                              {drug.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{drug.formulaName}</div>
                            <div className="text-sm text-muted-foreground font-mono">{drug.chemicalFormula}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white/50 border-slate-200">
                            {drug.strength}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-purple-100 text-purple-700 border-0">
                            {drug.dosageForm}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{drug.supplier}</TableCell>
                        <TableCell>
                          <Badge 
                            className={`border-0 ${
                              drug.isActive 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {drug.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(drug.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleToggleActive(drug)}
                              className={`h-8 w-8 p-0 ${drug.isActive 
                                ? "hover:bg-orange-100 hover:text-orange-600" 
                                : "hover:bg-emerald-100 hover:text-emerald-600"}`}
                              title={drug.isActive ? "Deactivate" : "Activate"}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(drug)}
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredDrugs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Pill className="h-8 w-8 text-muted-foreground/50" />
                            <span>No drugs found</span>
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

        <DrugDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
          onSave={handleSave} 
          onError={handleError}
        />

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Drug"
          description={`Are you sure you want to delete "${drugToDelete?.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
        />
      </div>
    </PageWrapper>
  )
}
