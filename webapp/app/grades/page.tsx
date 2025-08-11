"use client"

import { useEffect, useState } from "react"
import { GraduationCap, TrendingUp, Calculator, Target, CheckCircle2, AlertTriangle, Info, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useData } from "@/lib/data-context"
import { SubjectBadge } from "@/components/subject-badge"
import { subjectAccentBorderLeft } from "@/lib/subject-colors"

const safeNumber = (v: unknown, fallback = 0) => {
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : fallback
}
const hasNumeric = (v: unknown) => typeof v === "number" && Number.isFinite(v as number)

const COURSE_TARGETS_KEY = "studentCourseTargets"

export default function GradesPage() {
  const { grades } = useData()
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [targetGrade, setTargetGrade] = useState<string>("8.0")
  const [courseTargets, setCourseTargets] = useState<Record<string, string>>({})

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COURSE_TARGETS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === "object") setCourseTargets(parsed)
      }
    } catch {}
  }, [])

  const saveCourseTargets = (next: Record<string, string>) => {
    setCourseTargets(next)
    try {
      localStorage.setItem(COURSE_TARGETS_KEY, JSON.stringify(next))
    } catch {}
  }
  const setCourseTarget = (code: string, val: string) => saveCourseTargets({ ...courseTargets, [code]: val })
  const resetCourseTarget = (code: string) => {
    const next = { ...courseTargets }
    delete next[code]
    saveCourseTargets(next)
  }

  if (!grades || !grades.semesters.length) {
    return (
      <div className="flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">Điểm số</h1>
        </header>
        <main className="flex-1 p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Không có dữ liệu điểm số</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const currentSemester = selectedSemester || grades.semesters[grades.semesters.length - 1]?.term
  const semesterData = grades.semesters.find((s) => s.term === currentSemester)

  const getGradeColor = (grade: number) => {
    if (grade >= 8.5) return "text-green-600"
    if (grade >= 7.0) return "text-blue-600"
    if (grade >= 5.5) return "text-yellow-600"
    if (grade >= 4.0) return "text-orange-600"
    return "text-red-600"
  }

  const getStatusBadge = (status: "Passed" | "Failed" | string) => {
    if (status === "Passed") return <Badge className="bg-green-100 text-green-800">Đậu</Badge>
    return <Badge variant="destructive">Rớt</Badge>
  }

  // Build calculation details where a resit replaces the Final Exam and is not double-counted
  function getCalcDetails(course: any) {
    const details = Array.isArray(course?.gradeDetails) ? course.gradeDetails : []
    const resit = details.find((d: any) => d?.category === "Final Exam Resit" && hasNumeric(d?.value))
    const calc: any[] = []
    for (const d of details) {
      if (d?.category === "Final Exam Resit") {
        // never count separately in calculation
        continue
      }
      if (d?.category === "Final Exam" && resit) {
        // replace FE value with resit value, keep FE weight
        calc.push({ ...d, value: resit.value })
      } else {
        calc.push(d)
      }
    }
    return calc
  }

  // Visible details for UI: hide resit unless it has a numeric value
  function getVisibleDetails(course: any) {
    const details = Array.isArray(course?.gradeDetails) ? course.gradeDetails : []
    return details.filter((d: any) => !(d?.category === "Final Exam Resit" && !hasNumeric(d?.value)))
  }

  const computeCourseAverage = (course: any) => {
    const details = getCalcDetails(course)
    let sum = 0
    for (const d of details) {
      const val = typeof d?.value === "number" ? d.value : Number(d?.value)
      const weight = typeof d?.weight === "number" ? d.weight : Number(d?.weight)
      if (Number.isFinite(val) && Number.isFinite(weight) && weight > 0) {
        sum += (val * weight) / 100
      }
    }
    return safeNumber(sum, 0)
  }

  function derivedStatus(course: any): "Passed" | "Failed" {
    const details = getCalcDetails(course)
    const gradedItems = details.filter((d: any) => safeNumber(d?.weight, 0) > 0)
    const allHaveValues = gradedItems.length > 0 && gradedItems.every((d: any) => hasNumeric(d?.value))
    const avg = safeNumber(computeCourseAverage(course), 0)
    return allHaveValues && avg >= 5 ? "Passed" : "Failed"
  }

  // FE helper: use resit value if present
  function getFinalInfo(course: any, targetScore: number) {
    const details = Array.isArray(course?.gradeDetails) ? course.gradeDetails : []
    const finalExam = details.find((g: any) => g?.category === "Final Exam")
    const resit = details.find((g: any) => g?.category === "Final Exam Resit")
    const feWeight = safeNumber(finalExam?.weight ?? resit?.weight, 0)
    const feScore = hasNumeric(resit?.value)
      ? (resit!.value as number)
      : hasNumeric(finalExam?.value)
        ? (finalExam!.value as number)
        : null

    const otherGrades = details.filter(
      (g: any) => g?.category !== "Final Exam" && g?.category !== "Final Exam Resit" && g?.value !== null,
    )

    const currentWeightedSum = otherGrades.reduce((sum: number, grade: any) => {
      return sum + (safeNumber(grade.value) * safeNumber(grade.weight)) / 100
    }, 0)

    const required = feWeight ? (targetScore - currentWeightedSum) / (feWeight / 100) : Number.NaN
    const maxWith10 = currentWeightedSum + 10 * (feWeight / 100)
    const isImpossible = Number.isFinite(required) && required > 10 + 1e-9

    return { feWeight, feScore, currentWeightedSum, required, maxWith10, isImpossible }
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-lg font-semibold">Điểm số</h1>
      </header>

      <main className="flex-1 p-6 space-y-6">
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
                {grades.semesters.map((semester) => (
                  <SelectItem key={semester.term} value={semester.term}>
                    {semester.term}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {semesterData && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tổng quan học kỳ {currentSemester}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{semesterData.courses.length}</p>
                    <p className="text-sm text-muted-foreground">Tổng số môn</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {semesterData.courses.filter((c: any) => derivedStatus(c) === "Passed").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Môn đậu</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {(() => {
                        const total = semesterData.courses.reduce(
                          (sum, c) => sum + safeNumber(computeCourseAverage(c), 0),
                          0,
                        )
                        const gpa = total / Math.max(1, semesterData.courses.length)
                        return safeNumber(gpa, 0).toFixed(2)
                      })()}
                    </p>
                    <p className="text-sm text-muted-foreground">GPA trung bình</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Tính điểm cần thiết (mặc định)
                </CardTitle>
                <CardDescription>
                  Mục tiêu mặc định áp dụng cho tất cả môn nếu bạn không đặt mục tiêu riêng.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-1">
                  <label className="text-sm font-medium">Điểm mục tiêu mặc định:</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className="w-24"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {semesterData.courses.map((course, index) => {
                const courseAvg = safeNumber(computeCourseAverage(course), 0)
                const code: string = course.subjectCode
                const inputVal = courseTargets[code]
                const fallbackTarget = Number.parseFloat(targetGrade)
                const targetForCourseNum = Number.parseFloat(inputVal ?? targetGrade)
                const targetForCourse = Number.isFinite(targetForCourseNum)
                  ? targetForCourseNum
                  : Number.isFinite(fallbackTarget)
                    ? fallbackTarget
                    : 0

                const { feWeight, feScore, required, isImpossible, maxWith10 } = getFinalInfo(course, targetForCourse)

                const visibleDetails = getVisibleDetails(course)

                return (
                  <Card key={index} style={subjectAccentBorderLeft(course.subjectCode, 4)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <SubjectBadge code={course.subjectCode} />
                            <CardTitle className="text-lg">{course.subjectName}</CardTitle>
                          </div>
                          <CardDescription className="truncate">{course.subjectCode}</CardDescription>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getGradeColor(courseAvg)}`}>{courseAvg.toFixed(1)}</p>
                          {getStatusBadge(derivedStatus(course))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-3">
                        <label className="text-xs font-medium text-muted-foreground">Mục tiêu môn:</label>
                        <Input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          max="10"
                          step="0.1"
                          value={inputVal ?? ""}
                          placeholder={Number.isFinite(targetForCourse) ? targetForCourse.toFixed(1) : "8.0"}
                          onChange={(e) => setCourseTarget(code, e.target.value)}
                          className="h-8 w-24"
                        />
                        {inputVal !== undefined && inputVal !== "" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-muted-foreground"
                            onClick={() => resetCourseTarget(code)}
                            title="Bỏ đặt mục tiêu riêng"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Bỏ đặt mục tiêu</span>
                          </Button>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {inputVal ? "(đang dùng mục tiêu riêng)" : "(dùng mục tiêu mặc định)"}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        {visibleDetails.map((grade: any, gradeIndex: number) => (
                          <div key={gradeIndex} className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{grade.item}</p>
                              <p className="text-xs text-muted-foreground">
                                {grade.category} • {grade.weight}%
                              </p>
                            </div>
                            <div className="text-right">
                              {hasNumeric(grade.value) ? (
                                <p className={`font-medium ${getGradeColor(Number(grade.value))}`}>{grade.value}</p>
                              ) : (
                                <p className="text-muted-foreground">Chưa có</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {!!feWeight && (
                        <Card
                          className={
                            feScore === null
                              ? isImpossible
                                ? "bg-red-50 border-red-200"
                                : "bg-blue-50 border-blue-200"
                              : "bg-muted/30"
                          }
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Target
                                className={`h-4 w-4 ${
                                  feScore === null
                                    ? isImpossible
                                      ? "text-red-600"
                                      : "text-blue-600"
                                    : "text-muted-foreground"
                                }`}
                              />
                              <p
                                className={`text-sm font-medium ${
                                  feScore === null ? (isImpossible ? "text-red-800" : "text-blue-800") : ""
                                }`}
                              >
                                Mục tiêu: {Number.isFinite(targetForCourse) ? targetForCourse.toFixed(1) : "—"}
                              </p>
                            </div>

                            {feScore === null ? (
                              <>
                                {Number.isFinite(required) && required <= 0 && (
                                  <p className="text-sm text-green-700 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    Đã đủ mục tiêu với điểm hiện tại; FE bất kỳ cũng đạt.
                                  </p>
                                )}

                                {Number.isFinite(required) && required > 0 && required <= 10 && (
                                  <>
                                    <p className="text-lg font-bold text-blue-600">
                                      Cần {required.toFixed(1)} điểm thi cuối kỳ
                                    </p>
                                    <Progress value={Math.min(100, (required / 10) * 100)} className="mt-2" />
                                  </>
                                )}

                                {Number.isFinite(required) && required > 10 && (
                                  <>
                                    <p className="text-lg font-bold text-red-600">
                                      Không thể đạt mục tiêu với điểm hiện tại (kể cả FE = 10.0)
                                    </p>
                                    <p className="text-xs text-red-700 mt-1 flex items-center gap-1">
                                      <AlertTriangle className="h-4 w-4" />
                                      Tối đa có thể đạt: {maxWith10.toFixed(1)} điểm
                                    </p>
                                  </>
                                )}

                                {!Number.isFinite(required) && (
                                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Môn này không có trọng số Final Exam hoặc dữ liệu chưa đầy đủ.
                                  </p>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-muted-foreground">Final Exam ({feWeight}%)</p>
                                  <Badge className="bg-blue-100 text-blue-800">FE hiện tại: {feScore.toFixed(1)}</Badge>
                                </div>

                                <div className="mt-2 text-sm">
                                  <p>
                                    Để đạt {Number.isFinite(targetForCourse) ? targetForCourse.toFixed(1) : "—"} điểm,
                                    FE cần:{" "}
                                    <span className="font-medium">
                                      {Number.isFinite(required) ? required.toFixed(1) : "—"}
                                    </span>
                                  </p>
                                  {Number.isFinite(required) && (
                                    <p className="mt-1 flex items-center gap-1">
                                      {feScore >= required ? (
                                        <>
                                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                                          <span className="text-green-700">Đã đủ mục tiêu với FE hiện tại</span>
                                        </>
                                      ) : (
                                        <>
                                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                                          <span className="text-orange-700">
                                            Còn thiếu {(required - feScore).toFixed(1)} điểm FE so với mục tiêu
                                          </span>
                                        </>
                                      )}
                                    </p>
                                  )}
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
