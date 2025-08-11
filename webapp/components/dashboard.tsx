"use client"

import { Calendar, Clock, GraduationCap, AlertTriangle, Upload } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useData } from "@/lib/data-context"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { format, parseISO, addDays } from "date-fns"
import { vi } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Dashboard() {
  const { profile, schedule, examSchedule, grades, attendance } = useData()
  const noData = !(profile && schedule && examSchedule && grades && attendance)

  const getTodaySchedule = () => {
    const weeks = schedule?.schedule
    if (!Array.isArray(weeks)) return []
    const todayStr = format(new Date(), "dd/MM")
    for (const week of weeks) {
      if (!Array.isArray(week?.days)) continue
      for (const day of week.days) {
        if (day?.date === todayStr && Array.isArray(day?.activities)) {
          return day.activities
        }
      }
    }
    return []
  }

  const getUpcomingExams = () => {
    const exams = Array.isArray(examSchedule?.exams) ? examSchedule!.exams : []
    const today = new Date()
    const nextWeek = addDays(today, 7)
    return exams
      .map((exam) => {
        // Expect dd/MM/yyyy; convert to yyyy-MM-dd for parseISO
        const parts = typeof exam.date === "string" ? exam.date.split("/") : []
        const iso = parts.length === 3 ? [parts[2], parts[1], parts[0]].join("-") : ""
        const dateObj = iso ? parseISO(iso) : null
        return { exam, dateObj }
      })
      .filter(
        (x) => x.dateObj instanceof Date && !isNaN(Number(x.dateObj)) && x.dateObj >= today && x.dateObj <= nextWeek,
      )
      .slice(0, 3)
      .map((x) => x.exam)
  }

  const getCurrentSemesterGPA = () => {
    const semesters = grades?.semesters
    if (!Array.isArray(semesters) || semesters.length === 0) return 0
    const currentSemester = semesters[semesters.length - 1]
    const courses = Array.isArray(currentSemester?.courses) ? currentSemester.courses : []
    const passedCourses = courses.filter((c) => c.status === "Passed")
    if (passedCourses.length === 0) return 0
    return passedCourses.reduce((s, c) => s + (typeof c.average === "number" ? c.average : 0), 0) / passedCourses.length
  }

  const getAttendanceWarnings = () => {
    const sems = attendance?.semesters
    if (!Array.isArray(sems) || sems.length === 0) return []
    const currentSemester = sems[sems.length - 1]
    const courses = Array.isArray(currentSemester?.courses) ? currentSemester.courses : []
    return courses.filter((c) => typeof c.absentPercentage === "number" && c.absentPercentage > 10)
  }

  const lastUpdatedText = profile?.lastUpdated
    ? format(new Date(profile.lastUpdated), "dd/MM/yyyy HH:mm", { locale: vi })
    : null

  if (noData) {
    return (
      <div className="flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Tải dữ liệu để bắt đầu</p>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Card className="border-dashed">
            <CardHeader className="text-center">
              <CardTitle>Chưa có dữ liệu</CardTitle>
              <CardDescription>
                Hãy tải lên các file JSON: profile.json, schedule.json, exam_schedule.json, grades.json, attendance.json
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="rounded-xl border p-6 bg-muted/30 flex items-center gap-3">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">Vào trang Tải dữ liệu để nhập đủ 5 file JSON.</div>
              </div>
              <Button asChild size="lg">
                <Link href="/upload">Tải dữ liệu ngay</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const todaySchedule = getTodaySchedule()
  const upcomingExams = getUpcomingExams()
  const currentGPA = getCurrentSemesterGPA()
  const attendanceWarnings = getAttendanceWarnings()

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Chào mừng trở lại, {profile?.fullName}
            {lastUpdatedText ? ` • Cập nhật: ${lastUpdatedText}` : ""}
          </p>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GPA Hiện tại</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentGPA.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Học kỳ hiện tại</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lớp hôm nay</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaySchedule.length}</div>
              <p className="text-xs text-muted-foreground">Tiết học</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thi sắp tới</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingExams.length}</div>
              <p className="text-xs text-muted-foreground">Trong 7 ngày tới</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cảnh báo vắng</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceWarnings.length}</div>
              <p className="text-xs text-muted-foreground">Môn học</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Lịch học hôm nay</CardTitle>
              <CardDescription>{format(new Date(), "EEEE, dd/MM/yyyy", { locale: vi })}</CardDescription>
            </CardHeader>
            <CardContent>
              {todaySchedule.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Không có lớp học nào hôm nay</p>
              ) : (
                <div className="space-y-3">
                  {todaySchedule.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{activity.subjectCode}</p>
                        <p className="text-sm text-muted-foreground">
                          Tiết {activity.slot} • {activity.time}
                        </p>
                        <p className="text-sm text-muted-foreground">Phòng: {activity.room}</p>
                      </div>
                      <Badge
                        variant={
                          activity.attendanceStatus === "Attended"
                            ? "default"
                            : activity.attendanceStatus === "Absent"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {activity.attendanceStatus === "Attended"
                          ? "Đã điểm danh"
                          : activity.attendanceStatus === "Absent"
                            ? "Vắng"
                            : "Chưa điểm danh"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lịch thi sắp tới</CardTitle>
              <CardDescription>Các kỳ thi trong 7 ngày tới</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingExams.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Không có kỳ thi nào sắp tới</p>
              ) : (
                <div className="space-y-3">
                  {upcomingExams.map((exam, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{exam.subjectCode}</p>
                        <p className="text-sm text-muted-foreground">{exam.subjectName}</p>
                        <p className="text-sm text-muted-foreground">
                          {exam.date} • {exam.time}
                        </p>
                      </div>
                      <Badge variant={exam.type === "FE" ? "default" : "secondary"}>{exam.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {attendanceWarnings.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Cảnh báo điểm danh</CardTitle>
                <CardDescription>Các môn học có tỷ lệ vắng cao</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendanceWarnings.map((course, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50"
                    >
                      <div>
                        <p className="font-medium">{course.subjectCode}</p>
                        <p className="text-sm text-muted-foreground">{course.subjectName}</p>
                        <p className="text-sm text-muted-foreground">
                          Vắng {course.absentSlots}/{course.totalSlots} buổi
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600">{course.absentPercentage}%</p>
                        <Progress value={course.absentPercentage} className="w-20 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
