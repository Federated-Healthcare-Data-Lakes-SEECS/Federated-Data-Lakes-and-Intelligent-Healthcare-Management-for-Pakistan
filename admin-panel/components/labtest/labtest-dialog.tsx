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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { LabTest, Department, LabTestFormData, LabTestTemplate } from "@/lib/types"
import { toast } from "sonner"
import api from "@/lib/api"

interface LabTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (labTest: LabTest) => void
  onError?: (error: unknown) => void
}

export function LabTestDialog({ open, onOpenChange, onSave, onError }: LabTestDialogProps) {
  const [formData, setFormData] = useState<LabTestFormData>({
    name: "",
    description: "",
    departmentName: "",
    templateId: 0,
  })
  const [departments, setDepartments] = useState<Department[]>([])
  const [templates, setTemplates] = useState<LabTestTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      loadDepartments()
      loadTemplates()
      setFormData({
        name: "",
        description: "",
        departmentName: "",
        templateId: 0,
      })
    }
  }, [open])

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

  const loadTemplates = async () => {
    try {
      setLoading(true)
      // Only fetch active templates for the dropdown
      const response = await api.get("/labtests/templates/active")
      setTemplates(response.data)
    } catch (error) {
      toast.error("Failed to load templates")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validation
    if (!formData.name.trim()) {
      toast.error("Name is required")
      return
    }
    if (!formData.departmentName) {
      toast.error("Please select a department")
      return
    }
    if (!formData.templateId || formData.templateId === 0) {
      toast.error("Please select a template")
      return
    }
    try {
      setSaving(true)
      let response = await api.post('/labtests/register', formData)
      onSave(response.data)
      onOpenChange(false)
    } catch (error) {
      if (onError) {
        onError(error)
      } else {
        toast.error("Failed to create lab test")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lab Test</DialogTitle>
          <DialogDescription>
            Create a new lab test
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Lab Test Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter lab test name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.departmentName}
                onValueChange={(value) => setFormData({ ...formData, departmentName: value })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template">Template</Label>
              <Select
                value={formData.templateId ? String(formData.templateId) : ""}
                onValueChange={(value) => setFormData({ ...formData, templateId: Number(value) })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((tpl) => (
                    <SelectItem key={tpl.id} value={String(tpl.id)}>
                      {tpl.name} ({tpl.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
