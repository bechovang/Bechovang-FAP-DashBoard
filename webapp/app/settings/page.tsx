"use client"

import { Trash2, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useData } from "@/lib/data-context"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
  const { profile, clearData } = useData()
  const { toast } = useToast()

  const handleClearData = () => {
    clearData()
    toast({
      title: "Dữ liệu đã được xóa",
      description: "Tất cả dữ liệu đã được xóa khỏi thiết bị",
    })
  }

  const handleExportData = () => {
    const data = {
      profile: localStorage.getItem("studentProfile"),
      schedule: localStorage.getItem("studentSchedule"),
      examSchedule: localStorage.getItem("studentExamSchedule"),
      grades: localStorage.getItem("studentGrades"),
      attendance: localStorage.getItem("studentAttendance"),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `student-data-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Xuất dữ liệu thành công",
      description: "File backup đã được tải xuống",
    })
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-lg font-semibold">Cài đặt</h1>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Profile Information */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Thông tin được tải từ dữ liệu JSON</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Họ và tên</p>
                  <p className="text-sm text-muted-foreground">{profile.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Mã sinh viên</p>
                  <p className="text-sm text-muted-foreground">{profile.studentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Campus</p>
                  <p className="text-sm text-muted-foreground">{profile.campus}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Quản lý dữ liệu</CardTitle>
            <CardDescription>Sao lưu, khôi phục hoặc xóa dữ liệu của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Xuất dữ liệu</h3>
                <p className="text-sm text-muted-foreground">Tải xuống bản sao lưu tất cả dữ liệu</p>
              </div>
              <Button onClick={handleExportData} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Xuất
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Cập nhật dữ liệu</h3>
                <p className="text-sm text-muted-foreground">Tải lên dữ liệu mới từ extension</p>
              </div>
              <Button asChild variant="outline">
                <a href="/upload">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Cập nhật
                </a>
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
              <div>
                <h3 className="font-medium text-red-800">Xóa tất cả dữ liệu</h3>
                <p className="text-sm text-red-600">Xóa vĩnh viễn tất cả dữ liệu khỏi thiết bị này</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị xóa vĩnh viễn khỏi thiết bị này.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData} className="bg-red-600 hover:bg-red-700">
                      Xóa dữ liệu
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin ứng dụng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Phiên bản</span>
              <span className="text-sm text-muted-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Cập nhật lần cuối</span>
              <span className="text-sm text-muted-foreground">
                {profile?.lastUpdated
                  ? new Date(profile.lastUpdated).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })
                  : "Chưa có"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Dấu thời gian (ISO)</span>
              <span className="text-xs font-mono text-muted-foreground">{profile?.lastUpdated ?? "N/A"}</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
