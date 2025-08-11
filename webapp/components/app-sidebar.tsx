"use client"

import { BookOpen, Calendar, GraduationCap, Home, BarChart3, FileText, Settings, Upload, HelpCircle, Layers } from 'lucide-react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FeedbackDialog } from "@/components/feedback-dialog"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useData } from "@/lib/data-context"

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Lịch học", url: "/schedule", icon: Calendar },
  { title: "Lịch thi", url: "/exams", icon: FileText },
  { title: "Điểm số", url: "/grades", icon: GraduationCap },
  { title: "Điểm danh", url: "/attendance", icon: BookOpen },
  { title: "Thống kê", url: "/analytics", icon: BarChart3 },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { profile } = useData()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Student Hub</span>
            <span className="text-xs text-muted-foreground">Quản lý học tập</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Dữ liệu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/upload">
                    <Upload className="h-4 w-4" />
                    <span>Tải dữ liệu (.json)</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Cài đặt</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/guide">
                    <HelpCircle className="h-4 w-4" />
                    <span>Hướng dẫn</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/curriculum">
                    <Layers className="h-4 w-4" />
                    <span>Chương trình học</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <FeedbackDialog />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {profile && (
          <div className="px-2 py-2">
            <div className="text-xs text-muted-foreground">Tài khoản</div>
            <div className="text-sm font-medium">{profile.fullName}</div>
            <div className="text-xs text-muted-foreground">{profile.studentId}</div>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
