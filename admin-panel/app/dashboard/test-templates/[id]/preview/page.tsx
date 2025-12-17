"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { ArrowLeft, FileText, Calendar, Layers, ChevronDown, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import type { LabTestTemplate } from "@/lib/types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Field structure for the new format
interface TemplateField {
  label: string
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'textarea'
  unit?: string
  referenceRange?: string
  options?: string[]
  required?: boolean
}

// Section structure for the new format
interface TemplateSection {
  name: string
  fields: TemplateField[]
  notes?: string
}

// Profile structure for the new format
interface TemplateProfile {
  name: string
  sections: TemplateSection[]
}

// New format structure
interface NewFormStructure {
  profiles: TemplateProfile[]
}

// Old format structures (for backward compatibility)
interface OldFormField {
  id?: string
  name?: string
  label: string
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'textarea'
  unit?: string
  normalRange?: string
  referenceRange?: string
  placeholder?: string
  required?: boolean
  options?: string[]
}

interface OldSection {
  title?: string
  name?: string
  fields: OldFormField[]
  notes?: string
}

interface OldFormStructure {
  title?: string
  description?: string
  sections?: OldSection[]
  fields?: OldFormField[]
}

export default function TemplatePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<LabTestTemplate | null>(null)
  const [formStructure, setFormStructure] = useState<NewFormStructure | OldFormStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [openProfiles, setOpenProfiles] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadTemplate()
  }, [params.id])

  const loadTemplate = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/labtesttemplate/${params.id}`)
      setTemplate(response.data)
      
      if (response.data.formStructure) {
        try {
          const parsed = typeof response.data.formStructure === 'string' 
            ? JSON.parse(response.data.formStructure)
            : response.data.formStructure
          setFormStructure(parsed)
          
          if (parsed.profiles) {
            const openState: Record<string, boolean> = {}
            parsed.profiles.forEach((profile: TemplateProfile, index: number) => {
              openState[`profile-${index}`] = true
            })
            setOpenProfiles(openState)
          }
        } catch (e) {
          console.error("Failed to parse form structure:", e)
        }
      }
    } catch (error) {
      toast.error("Failed to load template")
      router.push("/dashboard/test-templates")
    } finally {
      setLoading(false)
    }
  }

  const toggleProfile = (key: string) => {
    setOpenProfiles(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const renderField = (field: TemplateField | OldFormField, index: number) => {
    const fieldKey = `field-${index}-${'label' in field ? field.label : ''}`
    const label = field.label
    const unit = field.unit
    const referenceRange = 'referenceRange' in field ? field.referenceRange : ('normalRange' in field ? field.normalRange : undefined)

    switch (field.type) {
      case 'text':
        return (
          <div key={fieldKey} className="space-y-2">
            <Label className="flex items-center gap-2">
              {label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input placeholder={`Enter ${label.toLowerCase()}`} disabled className="bg-white/50" />
            {(unit || referenceRange) && (
              <div className="flex gap-4 text-xs text-muted-foreground">
                {unit && <span>Unit: {unit}</span>}
                {referenceRange && <span>Reference: {referenceRange}</span>}
              </div>
            )}
          </div>
        )
      case 'number':
        return (
          <div key={fieldKey} className="space-y-2">
            <Label className="flex items-center gap-2">
              {label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="flex items-center gap-2">
              <Input type="number" placeholder="0" disabled className="bg-white/50" />
              {unit && <span className="text-sm text-muted-foreground whitespace-nowrap min-w-[60px]">{unit}</span>}
            </div>
            {referenceRange && <p className="text-xs text-muted-foreground">Reference: {referenceRange}</p>}
          </div>
        )
      case 'select':
        return (
          <div key={fieldKey} className="space-y-2">
            <Label className="flex items-center gap-2">
              {label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select disabled>
              <SelectTrigger className="bg-white/50">
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, i) => (
                  <SelectItem key={i} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      case 'checkbox':
        return (
          <div key={fieldKey} className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" disabled className="h-4 w-4 rounded border-gray-300" />
              <Label>{label}</Label>
            </div>
          </div>
        )
      case 'date':
        return (
          <div key={fieldKey} className="space-y-2">
            <Label className="flex items-center gap-2">
              {label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input type="date" disabled className="bg-white/50" />
          </div>
        )
      case 'textarea':
        return (
          <div key={fieldKey} className="space-y-2 col-span-2">
            <Label className="flex items-center gap-2">
              {label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea placeholder={`Enter ${label.toLowerCase()}`} disabled className="bg-white/50 min-h-[80px]" />
          </div>
        )
      default:
        return (
          <div key={fieldKey} className="space-y-2">
            <Label className="flex items-center gap-2">
              {label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input placeholder={`Enter ${label.toLowerCase()}`} disabled className="bg-white/50" />
            {(unit || referenceRange) && (
              <div className="flex gap-4 text-xs text-muted-foreground">
                {unit && <span>Unit: {unit}</span>}
                {referenceRange && <span>Reference: {referenceRange}</span>}
              </div>
            )}
          </div>
        )
    }
  }

  const renderSection = (section: TemplateSection | OldSection, sectionIndex: number) => {
    const sectionName = 'name' in section ? section.name : ('title' in section ? section.title : `Section ${sectionIndex + 1}`)
    
    return (
      <div key={`section-${sectionIndex}`} className="space-y-4 p-4 border rounded-lg bg-slate-50/50">
        <h4 className="font-semibold text-md border-b pb-2 text-slate-700">{sectionName}</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {section.fields.map((field, fieldIndex) => renderField(field, fieldIndex))}
        </div>
        {section.notes && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800"><strong>Notes:</strong> {section.notes}</p>
          </div>
        )}
      </div>
    )
  }

  const renderProfile = (profile: TemplateProfile, profileIndex: number) => {
    const key = `profile-${profileIndex}`
    const isOpen = openProfiles[key] ?? true

    return (
      <Collapsible key={key} open={isOpen} onOpenChange={() => toggleProfile(key)} className="border rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 bg-linear-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors">
            <h3 className="font-semibold text-lg text-blue-800">{profile.name}</h3>
            {isOpen ? <ChevronDown className="h-5 w-5 text-blue-600" /> : <ChevronRight className="h-5 w-5 text-blue-600" />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 space-y-4 bg-white">
            {profile.sections.map((section, sectionIndex) => renderSection(section, sectionIndex))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  const isNewFormat = (structure: NewFormStructure | OldFormStructure | null): structure is NewFormStructure => {
    return structure !== null && 'profiles' in structure && Array.isArray(structure.profiles)
  }

  const renderFormContent = () => {
    if (!formStructure) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p>No form structure defined for this template</p>
          <p className="text-sm mt-2">The formStructure field is empty or invalid</p>
        </div>
      )
    }

    if (isNewFormat(formStructure)) {
      return (
        <div className="space-y-4">
          {formStructure.profiles.map((profile, index) => renderProfile(profile, index))}
        </div>
      )
    }

    const oldStructure = formStructure as OldFormStructure
    if (oldStructure.sections && oldStructure.sections.length > 0) {
      return (
        <div className="space-y-6">
          {oldStructure.title && <h2 className="text-xl font-semibold">{oldStructure.title}</h2>}
          {oldStructure.description && <p className="text-muted-foreground">{oldStructure.description}</p>}
          {oldStructure.sections.map((section, index) => renderSection(section, index))}
        </div>
      )
    }

    if (oldStructure.fields && oldStructure.fields.length > 0) {
      return (
        <div className="space-y-6">
          {oldStructure.title && <h2 className="text-xl font-semibold">{oldStructure.title}</h2>}
          {oldStructure.description && <p className="text-muted-foreground">{oldStructure.description}</p>}
          <div className="grid gap-4 md:grid-cols-2">
            {oldStructure.fields.map((field, index) => renderField(field, index))}
          </div>
        </div>
      )
    }

    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p>No fields defined in this template</p>
      </div>
    )
  }

  if (loading) {
    return (
      <PageWrapper title="Template Preview" link="/dashboard/test-templates">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    )
  }

  if (!template) {
    return (
      <PageWrapper title="Template Preview" link="/dashboard/test-templates">
        <div className="text-center py-12 text-muted-foreground">Template not found</div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="Template Preview" link="/dashboard/test-templates">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {template.name}
              </h1>
              <p className="text-muted-foreground mt-1">{template.description || "No description provided"}</p>
            </div>
          </div>
          <Badge className={`border-0 ${template.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            {template.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Version</CardTitle>
              <Layers className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">v{template.version}</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
              <Calendar className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{new Date(template.createdAt).toLocaleDateString()}</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
              <Calendar className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{new Date(template.updatedAt).toLocaleDateString()}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Form Preview
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              This is a preview of how the lab test form will appear. All fields are disabled.
            </p>
          </CardHeader>
          <CardContent>{renderFormContent()}</CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Raw Form Structure (JSON)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs max-h-64 overflow-y-auto">
              {formStructure ? JSON.stringify(formStructure, null, 2) : 'null'}
            </pre>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}
