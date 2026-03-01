"use client"

import { Building2, Users, UserCheck, Heart, Pill, FlaskConical, FileText, Activity, LogOut, TestTube, Microscope } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { branding } from "@/lib/branding"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Activity,
    description: "Overview & Stats"
  },
  {
    title: "Departments",
    url: "/dashboard/departments",
    icon: Building2,
    description: "Hospital Departments"
  },
  {
    title: "Doctors",
    url: "/dashboard/doctors",
    icon: Users,
    description: "Medical Staff"
  },
  {
    title: "Receptionists",
    url: "/dashboard/receptionists",
    icon: UserCheck,
    description: "Front Desk Staff"
  },
  {
    title: "Lab Technicians",
    url: "/dashboard/lab-technicians",
    icon: TestTube,
    description: "Lab Staff"
  },
  {
    title: "Pathologists",
    url: "/dashboard/pathologists",
    icon: Microscope,
    description: "Pathology Specialists"
  },
  {
    title: "Patients",
    url: "/dashboard/patients",
    icon: Heart,
    description: "Patient Records"
  },
  {
    title: "Drugs",
    url: "/dashboard/drugs",
    icon: Pill,
    description: "Pharmaceutical Database"
  },
  {
    title: "Lab Tests",
    url: "/dashboard/labtests",
    icon: FlaskConical,
    description: "Test Catalog"
  },
  {
    title: "Test Templates",
    url: "/dashboard/test-templates",
    icon: FileText,
    description: "Form Builder"
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border/50">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg blue-glow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-bold text-base">{branding.hospitalName}</span>
            <span className="truncate text-xs text-muted-foreground">{branding.tagline}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider px-3 mb-2">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item.url || 
                  (item.url !== "/dashboard" && pathname.startsWith(item.url))
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        rounded-xl h-11 transition-all duration-200
                        ${isActive 
                          ? 'bg-primary text-primary-foreground shadow-md blue-glow-sm' 
                          : 'hover:bg-accent/80'
                        }
                      `}
                    >
                      <a href={item.url} className="flex items-center gap-3">
                        <item.icon className={`h-4 w-4 ${isActive ? '' : 'text-muted-foreground'}`} />
                        <span className="font-medium">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/50 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="rounded-xl h-11 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
