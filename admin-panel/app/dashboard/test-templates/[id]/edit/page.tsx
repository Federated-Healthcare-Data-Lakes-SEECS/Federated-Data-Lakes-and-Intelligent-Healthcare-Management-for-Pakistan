"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import api from "@/lib/api"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { 
  Plus, 
  Trash2, 
  FileText, 
  Layers, 
  Settings, 
  ChevronDown, 
  ChevronUp,
  GripVertical,
  AlertCircle,
  ArrowLeft,
  Save,
  AlertTriangle
} from "lucide-react"

type Field = {
  label: string
  type: string
  unit: string
  referenceRange: string
}

type Section = {
  name: string
  fields: Field[]
  notes: string
}

type Profile = {
  name: string
  sections: Section[]
}

function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}

export default function EditLabTestTemplatePage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [version, setVersion] = useState("")
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [expandedProfiles, setExpandedProfiles] = useState<number[]>([])
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  useEffect(() => {
    async function fetchTemplate() {
      setLoading(true)
      setError("")
      try {
        const res = await api.get(`/labtesttemplate/${id}`)
        const data = res.data
        setName(data.name || "")
        setDescription(data.description || "")
        setVersion(data.version || "")
        let parsedProfiles: Profile[] = []
        try {
          const parsed = JSON.parse(data.formStructure)
          parsedProfiles = parsed.profiles || []
        } catch (e) {
          setError("Template JSON structure is invalid. Cannot render form.")
        }
        const finalProfiles = parsedProfiles.length ? parsedProfiles : [
          {
            name: "",
            sections: [
              {
                name: "",
                fields: [{ label: "", type: "text", unit: "", referenceRange: "" }],
                notes: "",
              },
            ],
          },
        ]
        setProfiles(finalProfiles)
        // Expand all profiles and sections by default
        setExpandedProfiles(finalProfiles.map((_, i) => i))
        setExpandedSections(
          finalProfiles.flatMap((p, pIdx) => p.sections.map((_, sIdx) => `${pIdx}-${sIdx}`))
        )
      } catch (err: any) {
        setError(err?.response?.data?.message || "Template not found or server error.")
      } finally {
        setLoading(false)
      }
    }
    fetchTemplate()
  }, [id])

  const toggleProfile = (idx: number) => {
    setExpandedProfiles(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  const toggleSection = (pIdx: number, sIdx: number) => {
    const key = `${pIdx}-${sIdx}`
    setExpandedSections(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  // Profile handlers
  const addProfile = () => {
    const newIdx = profiles.length
    setProfiles([
      ...profiles,
      {
        name: "",
        sections: [
          {
            name: "",
            fields: [{ label: "", type: "text", unit: "", referenceRange: "" }],
            notes: "",
          },
        ],
      },
    ])
    setExpandedProfiles([...expandedProfiles, newIdx])
    setExpandedSections([...expandedSections, `${newIdx}-0`])
  }

  const removeProfile = (idx: number) => {
    setProfiles(profiles.filter((_, i) => i !== idx))
    setExpandedProfiles(expandedProfiles.filter(i => i !== idx).map(i => i > idx ? i - 1 : i))
  }

  const updateProfile = (idx: number, data: Profile) => {
    setProfiles(profiles.map((p, i) => (i === idx ? data : p)))
  }

  // Section handlers
  const addSection = (pIdx: number) => {
    const newProfiles = [...profiles]
    const newSIdx = newProfiles[pIdx].sections.length
    newProfiles[pIdx].sections.push({
      name: "",
      fields: [{ label: "", type: "text", unit: "", referenceRange: "" }],
      notes: "",
    })
    setProfiles(newProfiles)
    setExpandedSections([...expandedSections, `${pIdx}-${newSIdx}`])
  }

  const removeSection = (pIdx: number, sIdx: number) => {
    const newProfiles = [...profiles]
    newProfiles[pIdx].sections = newProfiles[pIdx].sections.filter((_, i) => i !== sIdx)
    setProfiles(newProfiles)
  }

  const updateSection = (pIdx: number, sIdx: number, data: Section) => {
    const newProfiles = [...profiles]
    newProfiles[pIdx].sections[sIdx] = data
    setProfiles(newProfiles)
  }

  // Field handlers
  const addField = (pIdx: number, sIdx: number) => {
    const newProfiles = [...profiles]
    newProfiles[pIdx].sections[sIdx].fields.push({ label: "", type: "text", unit: "", referenceRange: "" })
    setProfiles(newProfiles)
  }

  const removeField = (pIdx: number, sIdx: number, fIdx: number) => {
    const newProfiles = [...profiles]
    newProfiles[pIdx].sections[sIdx].fields = newProfiles[pIdx].sections[sIdx].fields.filter((_, i) => i !== fIdx)
    setProfiles(newProfiles)
  }

  const updateField = (pIdx: number, sIdx: number, fIdx: number, data: Field) => {
    const newProfiles = [...profiles]
    newProfiles[pIdx].sections[sIdx].fields[fIdx] = data
    setProfiles(newProfiles)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      await api.put(`/labtesttemplate/${id}`, {
        name,
        description,
        version,
        formStructure: JSON.stringify({ profiles }),
        isActive: true,
      })
      toast.success("Lab Test Template updated successfully!")
      router.push("/dashboard/test-templates")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update template.")
      toast.error("Failed to update template")
    } finally {
      setSaving(false)
    }
  }

  const totalFields = profiles.reduce((acc, p) => 
    acc + p.sections.reduce((sAcc, s) => sAcc + s.fields.length, 0), 0
  )

  if (loading) {
    return (
      <PageWrapper title="Edit Lab Test Template" link={`/dashboard/test-templates/${id}/edit`}>
        <LoadingSkeleton />
      </PageWrapper>
    )
  }

  if (error && !profiles.length) {
    return (
      <PageWrapper title="Edit Lab Test Template" link={`/dashboard/test-templates/${id}/edit`}>
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <CardTitle className="text-red-600">Error Loading Template</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{error}</p>
              <Button variant="outline" onClick={() => router.push("/dashboard/test-templates")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Templates
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="Edit Lab Test Template" link={`/dashboard/test-templates/${id}/edit`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push("/dashboard/test-templates")}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Edit Lab Test Template
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Modify template profiles, sections, and fields
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Info Card */}
          <Card className="glass-card border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Template Information</CardTitle>
                  <CardDescription>Basic details about your template</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input 
                    id="name"
                    placeholder="e.g., Complete Blood Count" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    className="bg-white/50 border-slate-200/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Version *</Label>
                  <Input 
                    id="version"
                    placeholder="e.g., 1.0" 
                    value={version} 
                    onChange={e => setVersion(e.target.value)} 
                    required
                    className="bg-white/50 border-slate-200/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    placeholder="Brief description of this template..." 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    className="bg-white/50 border-slate-200/50 focus:bg-white min-h-[42px] resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-4 border-0 text-center">
              <div className="text-2xl font-bold text-primary">{profiles.length}</div>
              <div className="text-sm text-muted-foreground">Profiles</div>
            </div>
            <div className="glass-card rounded-xl p-4 border-0 text-center">
              <div className="text-2xl font-bold text-primary">
                {profiles.reduce((acc, p) => acc + p.sections.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Sections</div>
            </div>
            <div className="glass-card rounded-xl p-4 border-0 text-center">
              <div className="text-2xl font-bold text-primary">{totalFields}</div>
              <div className="text-sm text-muted-foreground">Fields</div>
            </div>
          </div>

          {/* Profiles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Layers className="h-4 w-4 text-purple-500" />
                </div>
                <h2 className="text-lg font-semibold">Profiles</h2>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={addProfile}
                className="bg-white/50 hover:bg-white border-slate-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Profile
              </Button>
            </div>

            {profiles.map((profile, pIdx) => (
              <Card key={pIdx} className="glass-card border-0 overflow-hidden">
                {/* Profile Header */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => toggleProfile(pIdx)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <GripVertical className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Profile Name *"
                        value={profile.name}
                        onChange={e => {
                          e.stopPropagation()
                          updateProfile(pIdx, { ...profile, name: e.target.value })
                        }}
                        onClick={e => e.stopPropagation()}
                        className="font-medium border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {profile.sections.length} section{profile.sections.length !== 1 ? 's' : ''} • {profile.sections.reduce((acc, s) => acc + s.fields.length, 0)} fields
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeProfile(pIdx)
                      }}
                      disabled={profiles.length === 1}
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {expandedProfiles.includes(pIdx) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Profile Content */}
                {expandedProfiles.includes(pIdx) && (
                  <CardContent className="pt-0 pb-4 space-y-4">
                    {/* Sections */}
                    {profile.sections.map((section, sIdx) => (
                      <Card key={sIdx} className="border border-slate-200/50 bg-white/30">
                        {/* Section Header */}
                        <div 
                          className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50/30 transition-colors"
                          onClick={() => toggleSection(pIdx, sIdx)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1 bg-blue-100 rounded">
                              <Settings className="h-3 w-3 text-blue-600" />
                            </div>
                            <Input
                              placeholder="Section Name *"
                              value={section.name}
                              onChange={e => {
                                e.stopPropagation()
                                updateSection(pIdx, sIdx, { ...section, name: e.target.value })
                              }}
                              onClick={e => e.stopPropagation()}
                              className="font-medium border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                              required
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {section.fields.length} field{section.fields.length !== 1 ? 's' : ''}
                            </span>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeSection(pIdx, sIdx)
                              }}
                              disabled={profile.sections.length === 1}
                              className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                            {expandedSections.includes(`${pIdx}-${sIdx}`) ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {/* Section Content */}
                        {expandedSections.includes(`${pIdx}-${sIdx}`) && (
                          <CardContent className="pt-0 pb-3 space-y-3">
                            {/* Field Labels */}
                            <div className="grid grid-cols-12 gap-2 px-1 text-xs font-medium text-muted-foreground">
                              <div className="col-span-3">Field Label</div>
                              <div className="col-span-2">Type</div>
                              <div className="col-span-2">Unit</div>
                              <div className="col-span-4">Reference Range</div>
                              <div className="col-span-1"></div>
                            </div>

                            {/* Fields */}
                            {section.fields.map((field, fIdx) => (
                              <div key={fIdx} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-3">
                                  <Input
                                    placeholder="e.g., Hemoglobin"
                                    value={field.label}
                                    onChange={e => updateField(pIdx, sIdx, fIdx, { ...field, label: e.target.value })}
                                    required
                                    className="text-sm bg-white/50 border-slate-200/50"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Select
                                    value={field.type}
                                    onValueChange={value => updateField(pIdx, sIdx, fIdx, { ...field, type: value })}
                                  >
                                    <SelectTrigger className="text-sm bg-white/50 border-slate-200/50">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">Text</SelectItem>
                                      <SelectItem value="number">Number</SelectItem>
                                      <SelectItem value="select">Select</SelectItem>
                                      <SelectItem value="date">Date</SelectItem>
                                      <SelectItem value="boolean">Boolean</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-2">
                                  <Input
                                    placeholder="e.g., g/dL"
                                    value={field.unit}
                                    onChange={e => updateField(pIdx, sIdx, fIdx, { ...field, unit: e.target.value })}
                                    className="text-sm bg-white/50 border-slate-200/50"
                                  />
                                </div>
                                <div className="col-span-4">
                                  <Input
                                    placeholder="e.g., 12.0 - 16.0"
                                    value={field.referenceRange}
                                    onChange={e => updateField(pIdx, sIdx, fIdx, { ...field, referenceRange: e.target.value })}
                                    className="text-sm bg-white/50 border-slate-200/50"
                                  />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeField(pIdx, sIdx, fIdx)}
                                    disabled={section.fields.length === 1}
                                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}

                            {/* Add Field Button */}
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => addField(pIdx, sIdx)}
                              className="w-full border border-dashed border-slate-300 hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Field
                            </Button>

                            {/* Section Notes */}
                            <div className="pt-2">
                              <Label className="text-xs text-muted-foreground">Section Notes (optional)</Label>
                              <Textarea
                                placeholder="Add any notes for this section..."
                                value={section.notes}
                                onChange={e => updateSection(pIdx, sIdx, { ...section, notes: e.target.value })}
                                className="mt-1 text-sm bg-white/50 border-slate-200/50 min-h-[60px]"
                              />
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}

                    {/* Add Section Button */}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => addSection(pIdx)}
                      className="w-full border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-muted-foreground hover:text-blue-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Section to {profile.name || 'Profile'}
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Form Actions */}
          <Card className="glass-card border-0 sticky bottom-4">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>All fields marked with * are required</span>
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push("/dashboard/test-templates")}
                    className="bg-white/50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 min-w-[140px]"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </PageWrapper>
  )
}
