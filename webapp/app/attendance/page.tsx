"use client"

import { useMemo, useState } from "react"
import {
  BookOpen,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData } from "@/lib/data-context"
import { SubjectBadge } from "@/components/subject-badge"
import { subjectAccentBorderLeft } from "@/lib/subject-colors"
import { DonutTriple } from "@/components/charts/donut-triple"

type StatusFilter = "all" | "Present" | "Absent" | "Future"
type SortOrder = "asc" | "desc"

export default function AttendancePage() {
  const { attendance } = useData()
  const [selectedSemester, setSelectedSemester] = useState<string>("")

  // Per-course UI settings (filter + sort)
  const [courseFilters, setCourseFilters] = useState<Record<string, { status: StatusFilter; sort: SortOrder }>>({})

  const currentSemester = selectedSemester || attendance?.semesters[attendance?.semesters.length - 1]?.term
  const semesterData = attendance?.semesters.find((s) => s.term === currentSemester)

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case "Present":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Absent":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getAttendanceColor = (percentage: number) => {
    if (percentage <= 10) return "text-green-600"
    if (percentage <= 20) return "text-yellow-600"
    return "text-red-600"
  }

  const getSettings = (key: string) => courseFilters[key] ?? { status: "all" as StatusFilter, sort: "asc" as SortOrder }
  const setSettings = (key: string, next: Partial<{ status: StatusFilter; sort: SortOrder }>) =>
    setCourseFilters((prev) => ({ ...prev, [key]: { ...getSettings(key), ...next } }))

  const courseCounts = useMemo(() => {
    return attendance?.semesters.reduce(
      (acc, semester) => {
        semester.courses.forEach((course) => {
          const courseKey = course.subjectCode || String(course)
          const present = course.attendanceDetails.filter((d) => d.status === "Present").length
          const absent = course.attendanceDetails.filter((d) => d.status === "Absent").length
          const future = course.attendanceDetails.filter((d) => d.status === "Future").length
          acc[courseKey] = { present, absent, future }
        })
        return acc
      },
      {} as Record<string, { present: number; absent: number; future: number }>,
    )
  }, [attendance])

  if (!attendance || !attendance.semesters.length) {
    return (
      <div className="flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">Điểm danh</h1>
        </header>
        <main className="flex-1 p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Không có dữ liệu điểm danh</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-lg font-semibold">Điểm danh</h1>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Semester Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Chọn học kỳ</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={currentSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Chọn học kỳ" />
              </SelectTrigger>
              <SelectContent>
                {attendance.semesters.map((semester) => (
                  <SelectItem key={semester.term} value={semester.term}>
                    {semester.term}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {semesterData && (
          <div className="grid gap-4">
            {semesterData.courses.map((course, index) => {
              const courseKey = course.subjectCode || String(index)
              const settings = getSettings(courseKey)
              const counts = courseCounts?.[courseKey]

              // Filter + sort sessions
              const filtered = course.attendanceDetails.filter((d) =>
                settings.status === "all" ? true : d.status === settings.status,
              )
              const sorted = [...filtered].sort((a, b) => {
                const cmp = a.date.localeCompare(b.date) || a.no - b.no
                return settings.sort === "asc" ? cmp : -cmp
              })

              const allowed = Math.floor(course.totalSlots * 0.2)
              const left = Math.max(0, allowed - course.absentSlots)
              const leftPct = allowed > 0 ? Math.min(100, (left / allowed) * 100) : 0

              return (
                <Card
                  key={courseKey}
                  className={
                    course.absentPercentage > 20
                      ? "border-red-200 bg-red-50"
                      : course.absentPercentage > 10
                        ? "border-yellow-200 bg-yellow-50"
                        : ""
                  }
                  style={subjectAccentBorderLeft(course.subjectCode, 5)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <SubjectBadge code={course.subjectCode} />
                          <CardTitle className="text-base truncate">{course.subjectName}</CardTitle>
                        </div>
                        <CardDescription className="mt-1 truncate">{course.groupName}</CardDescription>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-2xl font-bold ${getAttendanceColor(course.absentPercentage)}`}>
                          {course.absentPercentage}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Vắng {course.absentSlots}/{course.totalSlots}
                        </p>
                        {course.absentPercentage > 20 && (
                          <Badge variant="destructive" className="mt-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Nguy hiểm
                          </Badge>
                        )}
                        {course.absentPercentage > 10 && course.absentPercentage <= 20 && (
                          <Badge variant="secondary" className="mt-1 bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Cảnh báo
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Donut + Absence budget row */}
                    <div className="mt-4 grid gap-4 md:grid-cols-3 items-center">
                      <div className="flex justify-center md:justify-start">
                        {counts && (
                          <DonutTriple
                            present={counts.present}
                            absent={counts.absent}
                            future={counts.future}
                            size={120}
                          />
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Ngân sách vắng (tối đa 20%)</span>
                          <span className="tabular-nums">
                            Còn {left}/{allowed} buổi
                          </span>
                        </div>
                        {/* Thick black bar to mirror the screenshot */}
                        <div className="mt-2 h-2.5 w-full rounded-full bg-muted">
                          <div
                            className="h-2.5 rounded-full bg-foreground"
                            style={{ width: `${leftPct}%` }}
                            aria-label="Absence budget remaining"
                          />
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Present: {counts?.present} • Absent: {counts?.absent} • Future: {counts?.future}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2">
                    {/* Filters like the screenshot */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Filter className="h-4 w-4" />
                        <span>Lọc buổi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={settings.status}
                          onValueChange={(v: StatusFilter) => setSettings(courseKey, { status: v })}
                        >
                          <SelectTrigger className="h-9 w-[180px]">
                            <SelectValue placeholder="Tất cả" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="Present">Có mặt</SelectItem>
                            <SelectItem value="Absent">Vắng</SelectItem>
                            <SelectItem value="Future">Chưa học</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={settings.sort}
                          onValueChange={(v: SortOrder) => setSettings(courseKey, { sort: v })}
                        >
                          <SelectTrigger className="h-9 w-[200px]">
                            <SelectValue placeholder="Ngày tăng dần" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asc">
                              <div className="flex items-center gap-2">
                                <ArrowUpNarrowWide className="h-4 w-4" />
                                Ngày tăng dần
                              </div>
                            </SelectItem>
                            <SelectItem value="desc">
                              <div className="flex items-center gap-2">
                                <ArrowDownWideNarrow className="h-4 w-4" />
                                Ngày giảm dần
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Sessions grid */}
                    {sorted.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Không có buổi phù hợp bộ lọc.</p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {sorted.map((detail) => (
                          <div key={detail.no + detail.date} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getAttendanceIcon(detail.status)}
                                <p className="text-sm font-medium">Buổi {detail.no}</p>
                              </div>
                              <Badge
                                variant={detail.status === "Absent" ? "destructive" : "secondary"}
                                className={`h-6 ${detail.status === "Present" ? "bg-green-100 text-green-800" : ""}`}
                              >
                                {detail.status === "Present"
                                  ? "Có mặt"
                                  : detail.status === "Absent"
                                    ? "Vắng"
                                    : "Chưa học"}
                              </Badge>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
                              <p>
                                {detail.dayOfWeek} • {detail.date}
                              </p>
                              <p>
                                Tiết {detail.slot} ({detail.time})
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
