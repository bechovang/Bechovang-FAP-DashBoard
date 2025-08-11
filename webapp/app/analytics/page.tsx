"use client"

import { BarChart3, TrendingUp, Target, Award, Calendar, BookOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useData } from "@/lib/data-context"
import { evaluateCourse, getCourseMode, type CourseCalcMode } from "@/lib/grade-utils"

export default function AnalyticsPage() {
  const { grades, attendance } = useData()

  if (!grades || !attendance) {
    return (
      <div className="flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">Thống kê</h1>
        </header>
        <main className="flex-1 p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Không có dữ liệu để thống kê</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // Build derived course evaluations once
  const derivedAll = grades.semesters.flatMap((s) =>
    (s.courses ?? []).map((c) => {
      const evalc = evaluateCourse({
        subjectCode: c.subjectCode,
        subjectName: c.subjectName,
        gradeDetails: c.gradeDetails ?? [],
        average: c.average ?? null,
      })
      const mode = getCourseMode(c.subjectCode) as CourseCalcMode
      return { term: s.term, course: c, evalc, mode }
    }),
  )

  // Overall stats
  const considered = derivedAll.filter((x) => x.mode !== "ignore" && x.evalc.complete)
  const passedCourses = considered.filter((x) => x.evalc.passed)
  const failedCourses = considered.filter((x) => !x.evalc.passed)

  // GPA overall: only GPA-mode courses that are complete and passed
  const gpaConsider = derivedAll.filter((x) => x.mode === "gpa" && x.evalc.complete && x.evalc.passed)
  const overallGPA =
    gpaConsider.length > 0 ? gpaConsider.reduce((s, x) => s + x.evalc.overall, 0) / gpaConsider.length : 0

  // Semester GPAs and pass counts
  const terms = Array.from(new Set(derivedAll.map((x) => x.term)))
  const semesterGPAs = terms.map((term) => {
    const inTerm = derivedAll.filter((x) => x.term === term)
    const inTermConsidered = inTerm.filter((x) => x.mode !== "ignore" && x.evalc.complete)
    const inTermPassed = inTermConsidered.filter((x) => x.evalc.passed)
    const inTermGPA = inTerm
      .filter((x) => x.mode === "gpa" && x.evalc.complete && x.evalc.passed)
      .map((x) => x.evalc.overall)
    const gpa = inTermGPA.length ? inTermGPA.reduce((a, b) => a + b, 0) / inTermGPA.length : 0
    return {
      term,
      gpa,
      courses: inTermConsidered.length,
      passed: inTermPassed.length,
    }
  })

  // Attendance stats
  const allAttendanceCourses = attendance.semesters.flatMap((s) => s.courses)
  const averageAttendance =
    allAttendanceCourses.length > 0
      ? 100 - allAttendanceCourses.reduce((sum, c) => sum + c.absentPercentage, 0) / allAttendanceCourses.length
      : 0

  // Grade distribution over GPA courses only
  const gpaComplete = derivedAll.filter((x) => x.mode === "gpa" && x.evalc.complete)
  const excellent = gpaComplete.filter((x) => x.evalc.overall >= 8.5).length
  const good = gpaComplete.filter((x) => x.evalc.overall >= 7.0 && x.evalc.overall < 8.5).length
  const fair = gpaComplete.filter((x) => x.evalc.overall >= 5.5 && x.evalc.overall < 7.0).length
  const pass = gpaComplete.filter((x) => x.evalc.overall >= 4.0 && x.evalc.overall < 5.5).length
  const fail = gpaComplete.filter((x) => x.evalc.overall < 4.0).length
  const allCoursesCount = gpaComplete.length

  const getGPAColor = (gpa: number) => {
    if (gpa >= 8.5) return "text-green-600"
    if (gpa >= 7.0) return "text-blue-600"
    if (gpa >= 5.5) return "text-yellow-600"
    if (gpa >= 4.0) return "text-orange-600"
    return "text-red-600"
  }

  const getGPALevel = (gpa: number) => {
    if (gpa >= 8.5) return "Xuất sắc"
    if (gpa >= 7.0) return "Giỏi"
    if (gpa >= 5.5) return "Khá"
    if (gpa >= 4.0) return "Trung bình"
    return "Yếu"
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-lg font-semibold">Thống kê & Phân tích</h1>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Overall Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GPA Tổng</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getGPAColor(overallGPA)}`}>{overallGPA.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{getGPALevel(overallGPA)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tỷ lệ đậu</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {considered.length > 0 ? ((passedCourses.length / considered.length) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {passedCourses.length}/{considered.length} môn
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Điểm danh TB</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageAttendance.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Tỷ lệ có mặt</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng môn học (GPA)</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allCoursesCount}</div>
              <p className="text-xs text-muted-foreground">Đã có điểm đầy đủ</p>
            </CardContent>
          </Card>
        </div>

        {/* Semester Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tiến độ theo học kỳ
            </CardTitle>
            <CardDescription>GPA (chỉ môn Tính GPA) và số môn đậu (bỏ môn Bỏ khỏi tính)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {semesterGPAs.map((semester, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h3 className="font-medium">{semester.term}</h3>
                    <p className="text-sm text-muted-foreground">
                      {semester.passed}/{semester.courses} môn đậu
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${getGPAColor(semester.gpa)}`}>{semester.gpa.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{getGPALevel(semester.gpa)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Phân bố điểm số (môn Tính GPA)
            </CardTitle>
            <CardDescription>Số lượng môn theo từng mức điểm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm">Xuất sắc (8.5-10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{excellent}</span>
                  <Progress value={allCoursesCount ? (excellent / allCoursesCount) * 100 : 0} className="w-20" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-sm">Giỏi (7.0-8.4)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{good}</span>
                  <Progress value={allCoursesCount ? (good / allCoursesCount) * 100 : 0} className="w-20" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Khá (5.5-6.9)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{fair}</span>
                  <Progress value={allCoursesCount ? (fair / allCoursesCount) * 100 : 0} className="w-20" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-sm">Trung bình (4.0-5.4)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{pass}</span>
                  <Progress value={allCoursesCount ? (pass / allCoursesCount) * 100 : 0} className="w-20" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-sm">Rớt (&lt;4.0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{fail}</span>
                  <Progress value={allCoursesCount ? (fail / allCoursesCount) * 100 : 0} className="w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Gợi ý cải thiện</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {overallGPA < 6.5 && (
                <p className="text-blue-700">
                  • GPA hiện tại thấp, hãy tập trung vào việc cải thiện điểm số các môn sắp tới
                </p>
              )}
              {averageAttendance < 90 && (
                <p className="text-blue-700">
                  • Tỷ lệ điểm danh cần cải thiện, hãy cố gắng tham gia đầy đủ các buổi học
                </p>
              )}
              {failedCourses.length > 0 && (
                <p className="text-blue-700">
                  • Có {failedCourses.length} môn chưa đậu, cần lên kế hoạch học lại hoặc cải thiện
                </p>
              )}
              {overallGPA >= 8.0 && (
                <p className="text-blue-700">• Kết quả học tập rất tốt! Hãy duy trì phong độ này</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
