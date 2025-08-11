"use client"

import { Calendar, GraduationCap, AlertTriangle, Upload } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useData } from "@/lib/data-context"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { format, parseISO, addDays } from "date-fns"
import { vi } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { evaluateCourse, getCourseMode, type CourseCalcMode } from "@/lib/grade-utils"

function seasonOrder(seasonRaw: string) {
  const s = (seasonRaw || "").toLowerCase()
  if (s.startsWith("spring")) return 1
  if (s.startsWith("summer")) return 2
  if (s.startsWith("fall") || s.startsWith("autumn")) return 3
  // fallback: không nhận diện -> nhỏ nhất
  return 0
}

function parseTerm(term: string) {
  // Hỗ trợ "Fall2024" hoặc "Fall 2024"
  const season = (term.match(/[A-Za-z]+/)?.[0] ?? "").trim()
  const year = Number.parseInt(term.match(/\d{4}/)?.[0] ?? "0", 10)
  return { year, seasonIdx: seasonOrder(season) }
}

function isTermAGreater(a: string, b: string) {
  const pa = parseTerm(a)
  const pb = parseTerm(b)
  if (pa.year !== pb.year) return pa.year > pb.year
  return pa.seasonIdx > pb.seasonIdx
}

function latestSemesterByTerm<T extends { term: string }>(items: T[] | undefined | null): T | null {
  const arr = Array.isArray(items) ? items : []
  if (arr.length === 0) return null
  return arr.reduce((best, cur) => (isTermAGreater(cur.term, best.term) ? cur : best), arr[0]!)
}

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

  // New derived metrics that follow the Grades logic (resit, bonus, course modes)
  const deriveAllCourses = () => {
    const semesters = grades?.semesters ?? []
    return semesters.flatMap((s) =>
      (s.courses ?? []).map((c) => {
        const evalc = evaluateCourse({
          subjectCode: c.subjectCode,
          subjectName: c.subjectName,
          gradeDetails: c.gradeDetails ?? [],
          average: c.average ?? null,
        })
        const mode = getCourseMode(c.subjectCode) as CourseCalcMode
        return { course: c, evalc, mode }
      }),
    )
  }

  const getCurrentSemesterGPA = () => {
    const semesters = grades?.semesters
    if (!Array.isArray(semesters) || semesters.length === 0) return 0
    const current = latestSemesterByTerm(semesters)
    if (!current) return 0
    const derived = (current.courses ?? []).map((c) => ({
      course: c,
      evalc: evaluateCourse({
        subjectCode: c.subjectCode,
        subjectName: c.subjectName,
        gradeDetails: c.gradeDetails ?? [],
        average: c.average ?? null,
      }),
      mode: getCourseMode(c.subjectCode) as CourseCalcMode,
    }))
    const gpaPassed = derived.filter((x) => x.mode === "gpa" && x.evalc.complete && x.evalc.passed)
    if (gpaPassed.length === 0) return 0
    const sum = gpaPassed.reduce((s, x) => s + x.evalc.overall, 0)
    return sum / gpaPassed.length
  }

  const getPassWarningsCount = () => {
    const derived = deriveAllCourses()
    const considered = derived.filter((x) => x.mode !== "ignore" && x.evalc.complete)
    const failed = considered.filter((x) => !x.evalc.passed)
    return {
      consideredCount: considered.length,
      failedCount: failed.length,
      passedCount: considered.length - failed.length,
    }
  }

  const getAttendanceWarnings = () => {
    const sems = attendance?.semesters
    if (!Array.isArray(sems) || sems.length === 0) return []
    const currentSemester = latestSemesterByTerm(sems)
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
  const passStats = getPassWarningsCount()

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
              <CardTitle className="text-sm font-medium">Tỷ lệ đậu</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {passStats.consideredCount > 0
                  ? ((passStats.passedCount / passStats.consideredCount) * 100).toFixed(1)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                {passStats.passedCount}/{passStats.consideredCount} môn
              </p>
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
              <CardTitle className="text-sm font-medium">Cảnh báo vắng</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceWarnings.length}</div>
              <p className="text-xs text-muted-foreground">Môn học</p>
            </CardContent>
          </Card>
        </div>

        {/* rest of dashboard unchanged */}
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
