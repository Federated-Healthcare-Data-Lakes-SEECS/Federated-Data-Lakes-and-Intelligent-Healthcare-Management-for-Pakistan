import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DoctorDashboard() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Doctor Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Your patients, appointments, and tasks will appear here.</p>
        </CardContent>
      </Card>
    </section>
  )
}
