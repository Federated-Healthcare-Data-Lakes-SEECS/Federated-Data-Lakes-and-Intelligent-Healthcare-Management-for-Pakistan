"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import api from "@/lib/api"
import { Header } from "@/components/header"

export default function EditLabTestTemplatePage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [version, setVersion] = useState("")
  const [profiles, setProfiles] = useState<any[]>([])

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
        let parsedProfiles = []
        try {
          const parsed = JSON.parse(data.formStructure)
          parsedProfiles = parsed.profiles || []
        } catch (e) {
          setError("Template JSON structure is invalid. Cannot render form.")
        }
        setProfiles(parsedProfiles.length ? parsedProfiles : [
          {
            name: "",
            sections: [
              {
                name: "",
                fields: [
                  { label: "", type: "text", unit: "", referenceRange: "" },
                ],
                notes: "",
              },
            ],
          },
        ])
      } catch (err: any) {
        setError(err?.response?.data?.message || "Template not found or server error.")
      } finally {
        setLoading(false)
      }
    }
    fetchTemplate()
  }, [id])

  // Profile handlers
  const addProfile = () => {
    setProfiles([
      ...profiles,
      {
        name: "",
        sections: [
          {
            name: "",
            fields: [
              { label: "", type: "text", unit: "", referenceRange: "" },
            ],
            notes: "",
          },
        ],
      },
    ])
  }
  const removeProfile = (idx: number) => {
    setProfiles(profiles.filter((_, i) => i !== idx))
  }
  const updateProfile = (idx: number, data: any) => {
    setProfiles(profiles.map((p, i) => (i === idx ? data : p)))
  }

  // Section handlers
  const addSection = (pIdx: number) => {
    const newProfiles = [...profiles]
    newProfiles[pIdx].sections.push({
      name: "",
      fields: [{ label: "", type: "text", unit: "", referenceRange: "" }],
      notes: "",
    })
    setProfiles(newProfiles)
  }
  const removeSection = (pIdx: number, sIdx: number) => {
    const newProfiles = [...profiles]
    newProfiles[pIdx].sections = newProfiles[pIdx].sections.filter((_, i) => i !== sIdx)
    setProfiles(newProfiles)
  }
  const updateSection = (pIdx: number, sIdx: number, data: any) => {
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
  const updateField = (pIdx: number, sIdx: number, fIdx: number, data: any) => {
    const newProfiles = [...profiles]
    newProfiles[pIdx].sections[sIdx].fields[fIdx] = data
    setProfiles(newProfiles)
  }

  const handleSubmit = async (e: any) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">Loading template...</div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-destructive mb-4">{error}</div>
            <Button variant="outline" onClick={() => router.push("/dashboard/test-templates")}>Back to Templates</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
    <Header title="Edit Lab Test Template" link={`/dashboard/test-templates/${id}/edit`} />
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Lab Test Template</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Template Name" value={name} onChange={e => setName(e.target.value)} required />
              <Input placeholder="Version" value={version} onChange={e => setVersion(e.target.value)} required />
              <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="space-y-6">
              {profiles.map((profile, pIdx) => (
                <Card key={pIdx} className="bg-muted/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <Input
                      placeholder="Profile Name"
                      value={profile.name}
                      onChange={e => updateProfile(pIdx, { ...profile, name: e.target.value })}
                      className="w-1/2"
                      required
                    />
                    <Button type="button" variant="destructive" onClick={() => removeProfile(pIdx)} disabled={profiles.length === 1}>
                      Remove Profile
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.sections.map((section, sIdx) => (
                      <Card key={sIdx} className="bg-muted/30">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <Input
                            placeholder="Section Name"
                            value={section.name}
                            onChange={e => updateSection(pIdx, sIdx, { ...section, name: e.target.value })}
                            className="w-1/2"
                            required
                          />
                          <Button type="button" variant="destructive" onClick={() => removeSection(pIdx, sIdx)} disabled={profile.sections.length === 1}>
                            Remove Section
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {section.fields.map((field, fIdx) => (
                            <div key={fIdx} className="grid grid-cols-5 gap-2 items-center">
                              <Input
                                placeholder="Field Label"
                                value={field.label}
                                onChange={e => updateField(pIdx, sIdx, fIdx, { ...field, label: e.target.value })}
                                required
                              />
                              <select
                                className="border rounded px-2 py-1"
                                value={field.type}
                                onChange={e => updateField(pIdx, sIdx, fIdx, { ...field, type: e.target.value })}
                              >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="select">Select</option>
                                <option value="date">Date</option>
                                <option value="boolean">Boolean</option>
                              </select>
                              <Input
                                placeholder="Unit (optional)"
                                value={field.unit}
                                onChange={e => updateField(pIdx, sIdx, fIdx, { ...field, unit: e.target.value })}
                              />
                              <Input
                                placeholder="Reference Range (optional)"
                                value={field.referenceRange}
                                onChange={e => updateField(pIdx, sIdx, fIdx, { ...field, referenceRange: e.target.value })}
                              />
                              <Button type="button" variant="destructive" onClick={() => removeField(pIdx, sIdx, fIdx)} disabled={section.fields.length === 1}>
                                Remove Field
                              </Button>
                            </div>
                          ))}
                          <Button type="button" variant="outline" onClick={() => addField(pIdx, sIdx)}>
                            Add Field
                          </Button>
                          <Textarea
                            placeholder="Section Notes (optional)"
                            value={section.notes}
                            onChange={e => updateSection(pIdx, sIdx, { ...section, notes: e.target.value, fields: section.fields, name: section.name })}
                          />
                        </CardContent>
                      </Card>
                    ))}
                    <Button type="button" variant="outline" onClick={() => addSection(pIdx)}>
                      Add Section
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <Button type="button" variant="outline" onClick={addProfile}>
                Add Profile
              </Button>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/test-templates")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </>
  )
}
