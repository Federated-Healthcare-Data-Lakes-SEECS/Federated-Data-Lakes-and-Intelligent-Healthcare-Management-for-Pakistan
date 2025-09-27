import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PatientDashboard() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Patient Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Your appointments, prescriptions, and records will appear here.</p>
        </CardContent>
      </Card>
    </section>
  )
}
