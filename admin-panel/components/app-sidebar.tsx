"use client"

import { Building2, Users, UserCheck, Heart, Pill, Calendar, FileText, Settings, Activity } from "lucide-react"
import { usePathname } from "next/navigation"

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
  },
  {
    title: "Departments",
    url: "/dashboard/departments",
    icon: Building2,
  },
  {
    title: "Doctors",
    url: "/dashboard/doctors",
    icon: Users,
  },
  {
    title: "Receptionists",
    url: "/dashboard/receptionists",
    icon: UserCheck,
  },
  {
    title: "Patients",
    url: "/dashboard/patients",
    icon: Heart,
  },
  {
    title: "Drugs",
    url: "/dashboard/drugs",
    icon: Pill,
  },
  {
    title: "Lab Tests",
    url: "/dashboard/labtests",
    icon: Calendar,
  },
  {
    title: "Test Templates",
    url: "/dashboard/test-templates",
    icon: FileText,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">HMS Admin</span>
            <span className="truncate text-xs text-muted-foreground">Hospital Management</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
