import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Heart, Calendar } from "lucide-react"

const stats = [
  {
    title: "Total Patients",
    value: "2,847",
    description: "+12% from last month",
    icon: Heart,
  },
  {
    title: "Active Doctors",
    value: "156",
    description: "+2 new this week",
    icon: Users,
  },
  {
    title: "Appointments Today",
    value: "89",
    description: "23 pending",
    icon: Calendar,
  },
  {
    title: "System Status",
    value: "Operational",
    description: "All systems running",
    icon: Activity,
  },
]

export function DashboardContent() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
