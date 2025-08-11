"use client"

import { useEffect, useMemo, useState } from "react"
import {
  GraduationCap,
  TrendingUp,
  Calculator,
  Target,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  SlidersHorizontal,
} from "lucide-react"
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

type CourseTreatment = "gpa" | "passfail" | "ignore"

const safeNumber = (v: unknown, fallback = 0) => {
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : fallback
}
const hasNumeric = (v: unknown) => typeof v === "number" && Number.isFinite(v as number)

const COURSE_TARGETS_KEY = "studentCourseTargets"
const COURSE_TREATMENT_KEY = "studentCourseTreatmentModes"

export default function GradesPage() {
  const { grades } = useData()
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [targetGrade, setTargetGrade] = useState<string>("8.0")
  const [courseTargets, setCourseTargets] = useState<Record<string, string>>({})
  const [treatmentModes, setTreatmentModes] = useState<Record<string, CourseTreatment>>({})

  // Load saved settings
  useEffect(() => {
    try {
      const savedTargets = localStorage.getItem(COURSE_TARGETS_KEY)
      if (savedTargets) {
        const parsed = JSON.parse(savedTargets)
        if (parsed && typeof parsed === "object") setCourseTargets(parsed)
      }
    } catch {}
    try {
      const savedModes = localStorage.getItem(COURSE_TREATMENT_KEY)
      if (savedModes) {
        const parsed = JSON.parse(savedModes)
        if (parsed && typeof parsed === "object") setTreatmentModes(parsed)
      }
    } catch {}
  }, [])

  // Persist helpers
  const saveCourseTargets = (next: Record<string, string>) => {
    setCourseTargets(next)
    try {
      localStorage.setItem(COURSE_TARGETS_KEY, JSON.stringify(next))
    } catch {}
  }
  const setCourseTarget = (code: string, val: string) => {
    const next = { ...courseTargets, [code]: val }
    saveCourseTargets(next)
  }
  const resetCourseTarget = (code: string) => {
    const next = { ...courseTargets }
    delete next[code]
    saveCourseTargets(next)
  }

  const saveTreatmentModes = (next: Record<string, CourseTreatment>) => {
    setTreatmentModes(next)
    try {
      localStorage.setItem(COURSE_TREATMENT_KEY, JSON.stringify(next))
    } catch {}
  }
  const setTreatmentMode = (code: string, mode: CourseTreatment) => {
    const next = { ...treatmentModes, [code]: mode }
    saveTreatmentModes(next)
  }
  const treatmentFor = (code: string): CourseTreatment => (treatmentModes[code] as CourseTreatment) || "gpa"

  const currentSemester = selectedSemester || grades?.semesters?.[grades.semesters.length - 1]?.term
  const semesterData = grades?.semesters?.find((s) => s.term === currentSemester)

  const getGradeColor = (grade: number) => {
    if (grade >= 8.5) return "text-green-600"
    if (grade >= 7.0) return "text-blue-600"
    if (grade >= 5.5) return "text-yellow-600"
    if (grade >= 4.0) return "text-orange-600"
    return "text-red-600"
  }

  // Generic resit handling (e.g., "Final Exam Resit", "TE Resit", "Thi lại")
  const isResit = (d: any) => {
    const a = `${d?.category ?? ""} ${d?.item ?? ""}`.toLowerCase()
    return a.includes("resit") || a.includes("thi lại")
  }
  const baseKey = (d: any) => {
    const src = (d?.category || d?.item || "").toString().toLowerCase()
    return src
      .replace(/resit/gi, "")
      .replace(/thi lại/gi, "")
      .replace(/\s+/g, " ")
      .trim()
  }
  const isBonus = (d: any) => {
    const a = `${d?.category ?? ""} ${d?.item ?? ""}`.toLowerCase()
    return a.includes("bonus")
  }

  // Build details for calculation: resit replaces base item, empty resit is ignored
  function getCalcDetails(course: any) {
    const details = Array.isArray(course?.gradeDetails) ? course.gradeDetails : []
    const resitMap = new Map<string, number>()
    for (const d of details) {
      if (isResit(d) && hasNumeric(d?.value)) {
        resitMap.set(baseKey(d), Number(d.value))
      }
    }
    const calc: any[] = []
    for (const d of details) {
      if (isResit(d)) continue // never count resit separately
      const k = baseKey(d)
      if (resitMap.has(k)) {
        // replace base item's value with resit value (keep the original weight)
        calc.push({ ...d, value: resitMap.get(k) })
      } else {
        calc.push(d)
      }
    }
    return calc
  }

  // For UI: hide resit rows unless they have numeric value
  function getVisibleDetails(course: any) {
    const details = Array.isArray(course?.gradeDetails) ? course.gradeDetails : []
    return details.filter((d: any) => !(isResit(d) && !hasNumeric(d?.value)))
  }

  // Compute overall with Bonus added directly (capped to 10)
  function computeCourseOverall(course: any) {
    const details = getCalcDetails(course)
    // Weighted sum (ignore bonus-like items if they have weird "%" weight)
    let weightedSum = 0
    for (const d of details) {
      const weight = typeof d?.weight === "number" ? d.weight : Number(d?.weight)
      const val = typeof d?.value === "number" ? d.value : Number(d?.value)
      if (!isBonus(d) && Number.isFinite(weight) && weight > 0 && Number.isFinite(val)) {
        weightedSum += (val * weight) / 100
      }
    }
    // Bonus is an additive score
    const original = Array.isArray(course?.gradeDetails) ? course.gradeDetails : []
    const bonusSum = original.reduce((sum: number, d: any) => {
      if (isBonus(d) && hasNumeric(d?.value)) return sum + Number(d.value)
      return sum
    }, 0)

    const overall = Math.min(10, Math.max(0, weightedSum + bonusSum))
    return { overall, weightedSum, bonusSum }
  }

  // Derived Pass/Fail: pass only when all positive-weight items have scores AND overall >= 5
  function derivedStatus(course: any): "Passed" | "Failed" {
    const details = getCalcDetails(course)
    const gradedItems = details.filter((d: any) => {
      const w = typeof d?.weight === "number" ? d.weight : Number(d?.weight)
      return !isBonus(d) && Number.isFinite(w) && w > 0
    })
    const allHaveValues = gradedItems.length > 0 && gradedItems.every((d: any) => hasNumeric(d?.value))
    const { overall } = computeCourseOverall(course)
    return allHaveValues && overall >= 5 ? "Passed" : "Failed"
  }

  // FE helper: use the final-like weight if present; include bonus in the current sum for requirement
  function getFinalInfo(course: any, targetScore: number) {
    const details = Array.isArray(course?.gradeDetails) ? course.gradeDetails : []
    const finalExam = details.find((g: any) => (g?.category || g?.item || "").toLowerCase().includes("final exam"))
    const resit = details.find((g: any) => isResit(g) && (g?.category || g?.item || "").toLowerCase().includes("final"))
    const feWeight = safeNumber(finalExam?.weight ?? resit?.weight, 0)
    const feScore = hasNumeric(resit?.value)
      ? (resit!.value as number)
      : hasNumeric(finalExam?.value)
        ? (finalExam!.value as number)
        : null

    // Current sum excludes FE but includes any bonus already earned
    const otherGrades = details.filter(
      (g: any) =>
        !(g?.category || "").toLowerCase().includes("final exam") && !isResit(g) && !isBonus(g) && g?.value !== null,
    )
    const currentWeightedSum = otherGrades.reduce((sum: number, grade: any) => {
      return sum + (safeNumber(grade.value) * safeNumber(grade.weight)) / 100
    }, 0)

    const bonusSum = details.reduce((sum: number, d: any) => {
      if (isBonus(d) && hasNumeric(d?.value)) return sum + Number(d.value)
      return sum
    }, 0)

    const currentTotalBeforeFE = currentWeightedSum + bonusSum
    const required = feWeight ? (targetScore - currentTotalBeforeFE) / (feWeight / 100) : Number.NaN
    const maxWith10 = currentTotalBeforeFE + 10 * (feWeight / 100)
    const isImpossible = Number.isFinite(required) && required > 10 + 1e-9

    return { feWeight, feScore, currentWeightedSum: currentTotalBeforeFE, required, maxWith10, isImpossible }
  }

  // Semester metrics respect treatment modes and use overall (with bonus)
  const semesterOverview = useMemo(() => {
    if (!semesterData) return { gpa: 0, passedCount: 0, totalGpaCourses: 0 }
    const gpaCourses = semesterData.courses.filter((c: any) => treatmentFor(c.subjectCode) === "gpa")
    const gpaSum = gpaCourses.reduce((sum, c) => sum + computeCourseOverall(c).overall, 0)
    const gpaDen = Math.max(1, gpaCourses.length)
    const gpaAvg = gpaSum / gpaDen

    const passed = semesterData.courses.filter(
      (c: any) => treatmentFor(c.subjectCode) !== "ignore" && derivedStatus(c) === "Passed",
    ).length
    return { gpa: gpaAvg, passedCount: passed, totalGpaCourses: gpaCourses.length }
  }, [semesterData, JSON.stringify(treatmentModes)])

  const getStatusBadge = (status: "Passed" | "Failed" | "Ignored", mode: CourseTreatment) => {
    if (mode === "ignore") {
      return <Badge variant="secondary">Bỏ khỏi tính</Badge>
    }
    if (status === "Passed") {
      return <Badge className="bg-green-100 text-green-800">Đậu</Badge>
    }
    return <Badge variant="destructive">Rớt</Badge>
  }

  if (!grades || !grades.semesters?.length) {
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

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-lg font-semibold">Điểm số</h1>
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
            {/* Semester Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tổng quan học kỳ {currentSemester}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Bạn có thể đặt "Cách tính" cho từng môn: Tính GPA, Chỉ đậu/rớt, hoặc Bỏ khỏi tính.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{semesterData.courses.length}</p>
                    <p className="text-sm text-muted-foreground">Tổng số môn</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{semesterOverview.passedCount}</p>
                    <p className="text-sm text-muted-foreground">Môn đậu (không tính môn bỏ)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{safeNumber(semesterOverview.gpa, 0).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      GPA trung bình (từ {semesterOverview.totalGpaCourses} môn)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grade Calculator (global default target) */}
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

            {/* Courses List */}
            <div className="grid gap-4">
              {semesterData.courses.map((course, index) => {
                const code: string = course.subjectCode
                const mode: CourseTreatment = treatmentFor(code)
                const { overall, bonusSum } = computeCourseOverall(course)
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
                const status = mode === "ignore" ? ("Ignored" as const) : (derivedStatus(course) as const)

                return (
                  <Card
                    key={index}
                    style={subjectAccentBorderLeft(course.subjectCode, 4)}
                    className={mode === "ignore" ? "opacity-80" : ""}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <SubjectBadge code={course.subjectCode} />
                            <CardTitle className="text-lg truncate">{course.subjectName}</CardTitle>
                            {bonusSum > 0 && (
                              <Badge className="bg-emerald-100 text-emerald-800" title="Đã cộng Bonus vào tổng">
                                +{bonusSum.toFixed(1)} Bonus
                              </Badge>
                            )}
                            {mode === "passfail" && (
                              <Badge
                                className="bg-amber-100 text-amber-800"
                                title="Môn này chỉ tính đậu/rớt, không cộng GPA"
                              >
                                Chỉ Đ/R
                              </Badge>
                            )}
                            {mode === "ignore" && (
                              <Badge variant="secondary" title="Môn này được bỏ khỏi mọi tính toán">
                                Bỏ khỏi tính
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="truncate">{course.subjectCode}</CardDescription>
                        </div>
                        <div className="text-right shrink-0">
                          <p
                            className={`text-2xl font-bold ${mode !== "ignore" ? getGradeColor(overall) : "text-muted-foreground"}`}
                          >
                            {mode === "ignore" ? "—" : overall.toFixed(1)}
                          </p>
                          {getStatusBadge(status as any, mode)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Treatment selector */}
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Cách tính:</span>
                          <Select value={mode} onValueChange={(val: CourseTreatment) => setTreatmentMode(code, val)}>
                            <SelectTrigger className="h-8 w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gpa">Tính GPA</SelectItem>
                              <SelectItem value="passfail">Chỉ đậu/rớt</SelectItem>
                              <SelectItem value="ignore">Bỏ khỏi tính</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Per-course target input (only meaningful for GPA mode) */}
                        {mode === "gpa" && (
                          <>
                            <div className="h-5 w-px bg-border" />
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
                          </>
                        )}
                      </div>

                      {/* Grade Breakdown (hide empty resit rows) */}
                      <div className="space-y-3 mb-4">
                        {visibleDetails.map((grade: any, gradeIndex: number) => (
                          <div key={gradeIndex} className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{grade.item}</p>
                              <p className="text-xs text-muted-foreground">
                                {grade.category} • {Number.isFinite(Number(grade.weight)) ? grade.weight : "%"}%
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

                      {/* Target helper - still relevant for GPA courses and when we detect a Final Exam weight */}
                      {mode === "gpa" && !!feWeight && (
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
                                    Không nhận diện được trọng số Final Exam cho môn này.
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
