"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { drugService } from "@/lib/data-service"
import type { Drug, DrugFormData } from "@/lib/types"
import { toast } from "sonner"
import api from "@/lib/api"

interface DrugDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  drug: Drug | null
  onSave: (drug: Drug) => void
}

const dosageForms = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Cream",
  "Ointment",
  "Drops",
  "Inhaler",
  "Patch",
  "Suppository",
  "Powder",
  "Solution",
]

export function DrugDialog({ open, onOpenChange, drug, onSave }: DrugDialogProps) {
  const [formData, setFormData] = useState<DrugFormData>({
    name: "",
    formulaName: "",
    chemicalFormula: "",
    strength: "",
    dosageForm: "",
    description: "",
    supplier: "",
    isActive: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (drug) {
        setFormData({
          name: drug.name,
          formulaName: drug.formulaName,
          chemicalFormula: drug.chemicalFormula,
          strength: drug.strength,
          dosageForm: drug.dosageForm,
          description: drug.description,
          supplier: drug.supplier,
          isActive: drug.isActive,
        })
      } else {
        setFormData({
          name: "",
          formulaName: "",
          chemicalFormula: "",
          strength: "",
          dosageForm: "",
          description: "",
          supplier: "",
          isActive: true,
        })
      }
    }
  }, [open, drug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      toast.error("Drug name is required")
      return
    }

    if (!formData.formulaName.trim()) {
      toast.error("Formula name is required")
      return
    }

    if (!formData.chemicalFormula.trim()) {
      toast.error("Chemical formula is required")
      return
    }

    if (!formData.strength.trim()) {
      toast.error("Strength is required")
      return
    }

    if (!formData.dosageForm.trim()) {
      toast.error("Please select a dosage form")
      return
    }

    if (!formData.supplier.trim()) {
      toast.error("Supplier is required")
      return
    }

    try {
      setSaving(true)

      if (drug) {
        const response = await api.patch(`/drugs/${drug.id}`, formData)
        onSave(response.data)
      } else {
        const response = await api.post("/drugs/register", formData)
        onSave(response.data)
      }

      onOpenChange(false)
    } catch (error) {
      toast.error(`Failed to ${drug ? "update" : "create"} drug`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{drug ? "Edit Drug" : "Add New Drug"}</DialogTitle>
          <DialogDescription>
            {drug ? "Update drug information and specifications" : "Add a new drug to the inventory"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Drug Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter drug name"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="formulaName">Formula Name</Label>
                <Input
                  id="formulaName"
                  value={formData.formulaName}
                  onChange={(e) => setFormData({ ...formData, formulaName: e.target.value })}
                  placeholder="e.g., Acetylsalicylic Acid"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="chemicalFormula">Chemical Formula</Label>
                <Input
                  id="chemicalFormula"
                  value={formData.chemicalFormula}
                  onChange={(e) => setFormData({ ...formData, chemicalFormula: e.target.value })}
                  placeholder="e.g., C9H8O4"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="strength">Strength</Label>
                <Input
                  id="strength"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  placeholder="e.g., 500mg, 10ml"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dosageForm">Dosage Form</Label>
                <Select
                  value={formData.dosageForm}
                  onValueChange={(value) => setFormData({ ...formData, dosageForm: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select dosage form" />
                  </SelectTrigger>
                  <SelectContent>
                    {dosageForms.map((form) => (
                      <SelectItem key={form} value={form}>
                        {form}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter drug description, usage, and indications"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Enter supplier name"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active Drug</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : drug ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
