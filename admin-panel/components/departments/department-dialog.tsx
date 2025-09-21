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
import type { Department, StandardDepartment, DepartmentFormData } from "@/lib/types"
import { toast } from "sonner"
import api from "@/lib/api"

interface DepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department: Department | null
  onSave: (department: Department) => void
}

export function DepartmentDialog({ open, onOpenChange, department, onSave }: DepartmentDialogProps) {
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: "",
    description: "",
    code: "",
  })
  const [standardDepartments, setStandardDepartments] = useState<StandardDepartment[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      loadStandardDepartments()
      if (department) {
        setFormData({
          name: department.name,
          description: department.description || "",
          code: department.code
        })
      } else {
        setFormData({
          name: "",
          description: "",
          code: ""
        })
      }
    }
  }, [open, department])

  const loadStandardDepartments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/departments/standard')
      setStandardDepartments(response.data)
    } catch (error) {
      toast.error("Failed to load standard departments")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Department name is required")
      return
    }

    if (!formData.code.trim()) {
      toast.error("Department code is required")
      return
    }

    try {
      setSaving(true)
      if (department) {
        // Update existing department
        const response = await api.put(`/departments/${department.id}`, formData)
        onSave(response.data)
      } else {
        // Create new department
        const response = await api.post('/departments/register', formData)
        onSave(response.data)
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(`Failed to ${department ? "update" : "create"} department`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{department ? "Edit Department" : "Add New Department"}</DialogTitle>
          <DialogDescription>
            {department ? "Update department information" : "Create a new department for the hospital"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Department Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter department name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="standardDepartment">Standard Department</Label>
              <Select
                value={formData.code}
                onValueChange={(value) => setFormData({ ...formData, code: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select standard department" />
                </SelectTrigger>
                <SelectContent>
                  {standardDepartments.map((stdDept) => (
                    <SelectItem key={stdDept.id} value={stdDept.code}>
                      {stdDept.name} ({stdDept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter department description"
                rows={3}
              />
            </div>
            {/* <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active Department</Label>
            </div> */}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : department ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
