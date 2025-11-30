"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, Users, Heart, Building2, Pill, FlaskConical, UserCheck, TrendingUp } from "lucide-react"
import api from "@/lib/api"

interface DashboardStats {
  doctors: number
  patients: number
  departments: number
  drugs: number
  labTests: number
  receptionists: number
}

const statConfigs = [
  {
    key: "patients",
    title: "Total Patients",
    icon: Heart,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    description: "Registered patients"
  },
  {
    key: "doctors",
    title: "Active Doctors",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Medical staff"
  },
  {
    key: "departments",
    title: "Departments",
    icon: Building2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Hospital units"
  },
  {
    key: "receptionists",
    title: "Receptionists",
    icon: UserCheck,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    description: "Front desk staff"
  },
  {
    key: "drugs",
    title: "Drug Registry",
    icon: Pill,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    description: "Medications listed"
  },
  {
    key: "labTests",
    title: "Lab Tests",
    icon: FlaskConical,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    description: "Available tests"
  },
]

function StatCardSkeleton() {
  return (
    <Card className="glass-card border-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24 skeleton-shimmer" />
        <Skeleton className="h-8 w-8 rounded-lg skeleton-shimmer" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1 skeleton-shimmer" />
        <Skeleton className="h-3 w-20 skeleton-shimmer" />
      </CardContent>
    </Card>
  )
}

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [doctors, patients, departments, drugs, labTests, receptionists] = await Promise.all([
          api.get("/doctors").then(res => res.data.length).catch(() => 0),
          api.get("/patients").then(res => res.data.length).catch(() => 0),
          api.get("/departments").then(res => res.data.length).catch(() => 0),
          api.get("/drugs").then(res => res.data.length).catch(() => 0),
          api.get("/labtests").then(res => res.data.length).catch(() => 0),
          api.get("/receptionists").then(res => res.data.length).catch(() => 0),
        ])
        setStats({ doctors, patients, departments, drugs, labTests, receptionists })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="glass-card rounded-2xl p-6 border-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Welcome to HMS Admin</h2>
            <p className="text-muted-foreground">Here's an overview of your hospital management system</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span>System Operational</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statConfigs.map((config) => {
          const value = stats?.[config.key as keyof DashboardStats] ?? 0
          return (
            <Card key={config.key} className="glass-card border-0 card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {config.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                  <config.icon className={`h-4 w-4 ${config.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <span className="text-sm font-medium text-emerald-500 flex items-center gap-1">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Services</span>
              <span className="text-sm font-medium text-emerald-500 flex items-center gap-1">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                Running
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="text-sm font-medium text-muted-foreground">Just now</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/dashboard/doctors" className="block p-3 rounded-lg hover:bg-primary/5 transition-colors">
              <span className="text-sm font-medium">Add New Doctor →</span>
            </a>
            <a href="/dashboard/patients" className="block p-3 rounded-lg hover:bg-primary/5 transition-colors">
              <span className="text-sm font-medium">View Patients →</span>
            </a>
            <a href="/dashboard/test-templates" className="block p-3 rounded-lg hover:bg-primary/5 transition-colors">
              <span className="text-sm font-medium">Manage Lab Templates →</span>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
