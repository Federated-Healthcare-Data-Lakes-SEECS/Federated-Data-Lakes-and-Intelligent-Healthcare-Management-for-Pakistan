"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Pill, Package, AlertCircle, CheckCircle } from "lucide-react"
import { DrugDialog } from "@/components/drugs/drug-dialog"
// import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog"
import type { Drug } from "@/lib/types"
import { toast } from "sonner"
import api from "@/lib/api"
import { Header } from "@/components/header"

export default function DrugsPage() {
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  // const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null)
  // const [drugToDelete, setDrugToDelete] = useState<Drug | null>(null)

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
    setSelectedDrug(null)
    setDialogOpen(true)
  }

  const handleEdit = (drug: Drug) => {
    setSelectedDrug(drug)
    setDialogOpen(true)
  }

  // const handleDelete = (drug: Drug) => {
  //   setDrugToDelete(drug)
  //   setDeleteDialogOpen(true)
  // }

  // const confirmDelete = async () => {
  //   if (!drugToDelete) return

  //   try {
  //     await drugService.delete(drugToDelete.id)
  //     setDrugs(drugs.filter((d) => d.id !== drugToDelete.id))
  //     toast.success("Drug deleted successfully")
  //   } catch (error) {
  //     toast.error("Failed to delete drug")
  //   } finally {
  //     setDeleteDialogOpen(false)
  //     setDrugToDelete(null)
  //   }
  // }

  const handleSave = async (drug: Drug) => {
    if (selectedDrug) {
      // Update existing
      setDrugs(drugs.map((d) => (d.id === drug.id ? drug : d)))
    } else {
      // Add new
      setDrugs([...drugs, drug])
    }
    setDialogOpen(false)
    toast.success(`Drug ${selectedDrug ? "updated" : "added"} successfully`)
  }

  const filteredDrugs = drugs.filter(
    (drug) =>
      drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.formulaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.dosageForm.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeDrugs = drugs.filter((d) => d.isActive).length
  const inactiveDrugs = drugs.filter((d) => !d.isActive).length
  const uniqueSuppliers = new Set(drugs.map((d) => d.supplier)).size
  const uniqueDosageForms = new Set(drugs.map((d) => d.dosageForm)).size

  return (
    <div className="space-y-6">
      <Header title="Drugs" link="/dashboard/drugs" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drugs</h1>
          <p className="text-muted-foreground">Manage pharmaceutical inventory and drug information</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Drug
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drugs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drugs.length}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drugs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDrugs}</div>
            <p className="text-xs text-muted-foreground">{inactiveDrugs} inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueSuppliers}</div>
            <p className="text-xs text-muted-foreground">Different suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dosage Forms</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueDosageForms}</div>
            <p className="text-xs text-muted-foreground">Different forms</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Drug Inventory
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drugs..."
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
              <div className="text-muted-foreground">Loading drugs...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drug Name</TableHead>
                  <TableHead>Formula</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Dosage Form</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrugs.map((drug) => (
                  <TableRow key={drug.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{drug.name}</div>
                        <div className="text-sm text-muted-foreground" title={drug.description}>
                          {drug.description.length > 50 ? `${drug.description.substring(0, 50)}...` : drug.description}
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
                      <Badge variant="outline">{drug.strength}</Badge>
                    </TableCell>
                    <TableCell>{drug.dosageForm}</TableCell>
                    <TableCell>{drug.supplier}</TableCell>
                    <TableCell>
                      <Badge variant={drug.isActive ? "default" : "secondary"}>
                        {drug.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(drug.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(drug)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* <Button variant="ghost" size="sm" onClick={() => handleDelete(drug)}>
                          <Trash2 className="h-4 w-4" />
                        </Button> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDrugs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No drugs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DrugDialog open={dialogOpen} onOpenChange={setDialogOpen} drug={selectedDrug} onSave={handleSave} />

      {/* <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Drug"
        description={`Are you sure you want to delete "${drugToDelete?.name}"? This action cannot be undone and may affect prescriptions and medical records.`}
        onConfirm={confirmDelete}
      /> */}
    </div>
  )
}
