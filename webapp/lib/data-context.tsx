"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

// ------------------------ Types ------------------------

interface StudentProfile {
  studentId: string
  fullName: string
  email: string
  campus: string
  curriculumCode?: string
  lastUpdated: string
}

interface ScheduleActivity {
  slot: number
  time: string
  subjectCode: string
  room: string
  lecturer?: string | null
  attendanceStatus: "Not yet" | "Attended" | "Absent"
  materialsUrl?: string
}

interface ScheduleDay {
  day: string
  date: string // dd/MM
  activities: ScheduleActivity[]
}

interface WeekSchedule {
  year: number
  weekNumber: number
  weekLabel: string
  days: ScheduleDay[]
}

interface Schedule {
  lastUpdated: string
  schedule: WeekSchedule[]
}

interface Exam {
  subjectCode: string
  subjectName: string
  date: string // dd/MM/yyyy
  room?: string | null
  time: string
  type: "PE" | "FE" | "2NDFE"
  format: string
  publicationDate?: string // dd/MM/yyyy
}

interface GradesCourseDetail {
  category: string
  item: string
  weight: number
  value: number | null
}

interface Course {
  subjectCode: string
  subjectName: string
  average: number | null
  status: "Passed" | "Failed" | "Not Started"
  gradeDetails: GradesCourseDetail[]
}

interface Semester {
  term: string
  courses: Course[]
}

interface Grades {
  lastUpdated: string
  semesters: Semester[]
}

interface AttendanceDetail {
  no: number
  date: string // ISO yyyy-MM-dd
  dayOfWeek: string
  slot: number
  time: string
  status: "Future" | "Present" | "Absent"
}

interface AttendanceCourse {
  subjectCode: string
  subjectName: string
  groupName: string
  absentSlots: number
  totalSlots: number
  absentPercentage: number
  attendanceDetails: AttendanceDetail[]
}

interface AttendanceSemester {
  term: string
  courses: AttendanceCourse[]
}

interface Attendance {
  lastUpdated: string
  semesters: AttendanceSemester[]
}

interface CurriculumSubject {
  termNo: number
  subjectCode: string
  subjectName: string
}
interface Curriculum {
  lastUpdated: string
  programCode: string
  subjects: CurriculumSubject[]
}

interface DataContextType {
  profile: StudentProfile | null
  schedule: Schedule | null
  examSchedule: { lastUpdated: string; exams: Exam[] } | null
  grades: Grades | null
  attendance: Attendance | null
  curriculum: Curriculum | null
  hasData: boolean
  loadData: (files: { [key: string]: string }) => void
  clearData: () => void
}

// ------------------------ Keys ------------------------

const LS_KEYS = {
  profile: "studentProfile",
  schedule: "studentSchedule",
  exam: "studentExamSchedule",
  grades: "studentGrades",
  attendance: "studentAttendance",
  curriculum: "studentCurriculum",
} as const

// ------------------------ Utils ------------------------

function parseJSON<T>(text: string | null): T | null {
  if (!text) return null
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

function isoMax(a?: string, b?: string): string {
  const ta = a ? Date.parse(a) : Number.NaN
  const tb = b ? Date.parse(b) : Number.NaN
  if (Number.isNaN(ta) && Number.isNaN(tb)) return new Date().toISOString()
  if (Number.isNaN(ta)) return b!
  if (Number.isNaN(tb)) return a!
  return ta >= tb ? a! : b!
}

function mergeUniqueBy<T>(
  base: T[],
  incoming: T[],
  keyFn: (x: T) => string,
  // how to merge a duplicate entry from base and incoming
  mergeFn?: (oldItem: T, newItem: T) => T,
): T[] {
  const map = new Map<string, T>()
  for (const item of base) map.set(keyFn(item), item)
  for (const item of incoming) {
    const k = keyFn(item)
    if (map.has(k) && mergeFn) {
      map.set(k, mergeFn(map.get(k) as T, item))
    } else {
      map.set(k, item)
    }
  }
  return Array.from(map.values())
}

// ------------------------ Normalizers ------------------------

function normalizeProfile(input: any): StudentProfile {
  const p = input?.profile ?? input
  return {
    studentId: p?.studentId ?? "",
    fullName: p?.fullName ?? "",
    email: p?.email ?? "",
    campus: p?.campus ?? "",
    curriculumCode: p?.curriculumCode,
    lastUpdated: p?.lastUpdated ?? new Date().toISOString(),
  }
}

function normalizeSchedule(input: any): Schedule {
  if (input?.schedule && Array.isArray(input.schedule)) {
    return {
      lastUpdated: input?.lastUpdated ?? new Date().toISOString(),
      schedule: input.schedule,
    }
  }
  return {
    lastUpdated: new Date().toISOString(),
    schedule: [],
  }
}

function normalizeExamSchedule(input: any): { lastUpdated: string; exams: Exam[] } {
  let arr: any[] = []
  if (Array.isArray(input)) {
    arr = input
  } else if (Array.isArray(input?.exams)) {
    arr = input.exams
  } else if (Array.isArray(input?.examSchedule)) {
    arr = input.examSchedule
  } else {
    arr = []
  }

  const exams: Exam[] = arr.map((e) => {
    const type = (e?.type ?? e?.examType) as Exam["type"]
    const format = (e?.format ?? e?.examForm) as string
    const room = e?.room === "" ? null : e?.room
    return {
      subjectCode: e?.subjectCode ?? "",
      subjectName: e?.subjectName ?? "",
      date: e?.date ?? "",
      time: e?.time ?? "",
      type: type === "PE" || type === "FE" || type === "2NDFE" ? type : "FE",
      format: format ?? "",
      room,
      publicationDate: e?.publicationDate,
    }
  })

  return {
    lastUpdated: input?.lastUpdated ?? new Date().toISOString(),
    exams,
  }
}

function computeAverageFromDetails(details: GradesCourseDetail[]): number {
  if (!Array.isArray(details) || details.length === 0) return 0
  let sum = 0
  for (const d of details) {
    if (typeof d?.value === "number") {
      sum += d.value * (d.weight / 100)
    }
  }
  return Math.max(0, Math.min(10, Number.isFinite(sum) ? sum : 0))
}

function normalizeGrades(input: any): Grades {
  const semesters: Semester[] = Array.isArray(input?.semesters) ? input.semesters : []
  const normalizedSemesters = semesters.map((s) => {
    const courses: Course[] = Array.isArray(s?.courses) ? s.courses : []
    const normCourses = courses.map((c) => {
      const avg = typeof c?.average === "number" ? c.average : computeAverageFromDetails(c?.gradeDetails ?? [])
      return {
        subjectCode: c?.subjectCode ?? "",
        subjectName: c?.subjectName ?? "",
        average: avg,
        status: (c?.status ?? "Not Started") as Course["status"],
        gradeDetails: Array.isArray(c?.gradeDetails) ? c.gradeDetails : [],
      }
    })
    return { term: s?.term ?? "", courses: normCourses }
  })
  return {
    lastUpdated: input?.lastUpdated ?? new Date().toISOString(),
    semesters: normalizedSemesters,
  }
}

function normalizeAttendance(input: any): Attendance {
  if (Array.isArray(input?.semesters)) {
    // ensure numbers are consistent
    const semesters = (input.semesters as AttendanceSemester[]).map((sem) => ({
      ...sem,
      courses: (sem.courses ?? []).map((c) => ({
        ...c,
        absentSlots: Number(c.absentSlots ?? 0),
        totalSlots: Number(c.totalSlots ?? c.attendanceDetails?.length ?? 0),
        absentPercentage:
          typeof c.absentPercentage === "number"
            ? c.absentPercentage
            : Math.round(
                ((c.attendanceDetails?.filter((d) => d.status === "Absent").length ?? 0) /
                  Math.max(1, c.attendanceDetails?.length ?? 1)) *
                  100,
              ),
        attendanceDetails: (c.attendanceDetails ?? []).map((d) => ({
          ...d,
          no: Number(d.no ?? 0),
        })),
      })),
    }))
    return {
      lastUpdated: input?.lastUpdated ?? new Date().toISOString(),
      semesters,
    }
  }
  return { lastUpdated: new Date().toISOString(), semesters: [] }
}

function normalizeCurriculum(input: any): Curriculum {
  const c = input?.curriculum ?? input
  return {
    lastUpdated: c?.lastUpdated ?? new Date().toISOString(),
    programCode: c?.programCode ?? "",
    subjects: Array.isArray(c?.subjects) ? c.subjects : [],
  }
}

// ------------------------ Mergers ------------------------

function mergeProfile(oldP: StudentProfile | null, incoming: StudentProfile): StudentProfile {
  if (!oldP) return incoming
  // prefer incoming fields if provided; keep others from old
  return {
    studentId: incoming.studentId || oldP.studentId,
    fullName: incoming.fullName || oldP.fullName,
    email: incoming.email || oldP.email,
    campus: incoming.campus || oldP.campus,
    curriculumCode: incoming.curriculumCode ?? oldP.curriculumCode,
    lastUpdated: isoMax(oldP.lastUpdated, incoming.lastUpdated),
  }
}

function weekKey(w: WeekSchedule) {
  // prefer a stable key across datasets
  return `${w.year}-${w.weekNumber}-${w.weekLabel}`
}
function mergeSchedule(oldS: Schedule | null, incoming: Schedule): Schedule {
  if (!oldS) return incoming
  const mergedWeeks = mergeUniqueBy(
    oldS.schedule,
    incoming.schedule,
    weekKey,
    // replace entire week when new one comes in
    (_old, nu) => nu,
  )
  return {
    lastUpdated: isoMax(oldS.lastUpdated, incoming.lastUpdated),
    schedule: mergedWeeks,
  }
}

function examKey(e: Exam) {
  return `${e.subjectCode}|${e.date}|${e.time}|${e.type}`
}
function mergeExamSchedule(
  oldE: { lastUpdated: string; exams: Exam[] } | null,
  incoming: { lastUpdated: string; exams: Exam[] },
): { lastUpdated: string; exams: Exam[] } {
  if (!oldE) return incoming
  const merged = mergeUniqueBy(oldE.exams, incoming.exams, examKey, (a, b) => ({
    ...a,
    ...b,
    // keep non-empty values
    room: b.room ?? a.room,
    publicationDate: b.publicationDate ?? a.publicationDate,
    format: b.format || a.format,
  }))
  return { lastUpdated: isoMax(oldE.lastUpdated, incoming.lastUpdated), exams: merged }
}

function gradesTermKey(s: Semester) {
  return s.term
}
function courseKey(c: Course) {
  return c.subjectCode
}
function detailKey(d: GradesCourseDetail) {
  return `${d.category}|${d.item}`
}
function mergeGrades(oldG: Grades | null, incoming: Grades): Grades {
  if (!oldG) return incoming
  const mergedSemesters = mergeUniqueBy(oldG.semesters, incoming.semesters, gradesTermKey, (oldSem, newSem) => {
    const mergedCourses = mergeUniqueBy(oldSem.courses, newSem.courses, courseKey, (oldCourse, newCourse) => {
      const mergedDetails = mergeUniqueBy(
        oldCourse.gradeDetails ?? [],
        newCourse.gradeDetails ?? [],
        detailKey,
        (od, nd) => ({
          category: nd.category || od.category,
          item: nd.item || od.item,
          weight: typeof nd.weight === "number" ? nd.weight : od.weight,
          value: typeof nd.value === "number" ? nd.value : (od.value ?? null),
        }),
      )
      const average =
        typeof newCourse.average === "number" ? newCourse.average : computeAverageFromDetails(mergedDetails)
      return {
        subjectCode: newCourse.subjectCode || oldCourse.subjectCode,
        subjectName: newCourse.subjectName || oldCourse.subjectName,
        average,
        status: (newCourse.status || oldCourse.status) as Course["status"],
        gradeDetails: mergedDetails,
      }
    })
    return { term: newSem.term || oldSem.term, courses: mergedCourses }
  })
  return { lastUpdated: isoMax(oldG.lastUpdated, incoming.lastUpdated), semesters: mergedSemesters }
}

function attendanceTermKey(s: AttendanceSemester) {
  return s.term
}
function attendanceCourseKey(c: AttendanceCourse) {
  // include groupName if present to avoid mixing different groups for the same subject
  return `${c.subjectCode}|${c.groupName ?? ""}`
}
function attendanceDetailKey(d: AttendanceDetail) {
  // prefer "no" if stable, else fallback to date-slot
  return `${d.no}|${d.date}|${d.slot}`
}
function recomputeAttendanceCourse(c: AttendanceCourse): AttendanceCourse {
  const total = c.attendanceDetails?.length ?? 0
  const absent = c.attendanceDetails?.filter((d) => d.status === "Absent").length ?? 0
  return {
    ...c,
    totalSlots: total,
    absentSlots: absent,
    absentPercentage: total > 0 ? Math.round((absent / total) * 100) : 0,
  }
}
function mergeAttendance(oldA: Attendance | null, incoming: Attendance): Attendance {
  if (!oldA) return incoming
  const mergedSemesters = mergeUniqueBy(oldA.semesters, incoming.semesters, attendanceTermKey, (os, ns) => {
    const mergedCourses = mergeUniqueBy(os.courses, ns.courses, attendanceCourseKey, (oc, nc) => {
      const details = mergeUniqueBy(
        oc.attendanceDetails ?? [],
        nc.attendanceDetails ?? [],
        attendanceDetailKey,
        (od, nd) => ({ ...od, ...nd }), // new info overwrites
      ).sort((a, b) => a.no - b.no)
      return recomputeAttendanceCourse({
        subjectCode: nc.subjectCode || oc.subjectCode,
        subjectName: nc.subjectName || oc.subjectName,
        groupName: nc.groupName || oc.groupName,
        absentSlots: 0,
        totalSlots: 0,
        absentPercentage: 0,
        attendanceDetails: details,
      })
    })
    return { term: ns.term || os.term, courses: mergedCourses }
  })
  return { lastUpdated: isoMax(oldA.lastUpdated, incoming.lastUpdated), semesters: mergedSemesters }
}

function curriculumSubjectKey(s: CurriculumSubject) {
  return s.subjectCode
}
function mergeCurriculum(oldC: Curriculum | null, incoming: Curriculum): Curriculum {
  if (!oldC) return incoming
  const mergedSubjects = mergeUniqueBy(oldC.subjects ?? [], incoming.subjects ?? [], curriculumSubjectKey, (a, b) => ({
    termNo: typeof b.termNo === "number" ? b.termNo : a.termNo,
    subjectCode: b.subjectCode || a.subjectCode,
    subjectName: b.subjectName || a.subjectName,
  })).sort((a, b) => a.termNo - b.termNo || a.subjectCode.localeCompare(b.subjectCode))
  return {
    lastUpdated: isoMax(oldC.lastUpdated, incoming.lastUpdated),
    programCode: incoming.programCode || oldC.programCode,
    subjects: mergedSubjects,
  }
}

// ------------------------ Context ------------------------

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [examSchedule, setExamSchedule] = useState<{ lastUpdated: string; exams: Exam[] } | null>(null)
  const [grades, setGrades] = useState<Grades | null>(null)
  const [attendance, setAttendance] = useState<Attendance | null>(null)
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null)

  // Initial load from localStorage (already normalized & merged)
  useEffect(() => {
    try {
      const p = parseJSON<StudentProfile>(localStorage.getItem(LS_KEYS.profile))
      const s = parseJSON<Schedule>(localStorage.getItem(LS_KEYS.schedule))
      const e = parseJSON<{ lastUpdated: string; exams: Exam[] }>(localStorage.getItem(LS_KEYS.exam))
      const g = parseJSON<Grades>(localStorage.getItem(LS_KEYS.grades))
      const a = parseJSON<Attendance>(localStorage.getItem(LS_KEYS.attendance))
      const c = parseJSON<Curriculum>(localStorage.getItem(LS_KEYS.curriculum))
      if (p) setProfile(p)
      if (s) setSchedule(s)
      if (e) setExamSchedule(e)
      if (g) setGrades(g)
      if (a) setAttendance(a)
      if (c) setCurriculum(c)
    } catch (err) {
      console.error("Failed to read localStorage datasets", err)
    }
  }, [])

  const hasData = useMemo(
    () => !!(profile && schedule && examSchedule && grades && attendance),
    [profile, schedule, examSchedule, grades, attendance],
  )

  // Merge-upload entry point
  const loadData = (files: { [key: string]: string }) => {
    try {
      // PROFILE
      if (files.profile) {
        const normNew = normalizeProfile(JSON.parse(files.profile))
        const existing = parseJSON<StudentProfile>(localStorage.getItem(LS_KEYS.profile))
        const merged = mergeProfile(existing, normNew)
        setProfile(merged)
        localStorage.setItem(LS_KEYS.profile, JSON.stringify(merged))
      }

      // SCHEDULE
      if (files.schedule) {
        const normNew = normalizeSchedule(JSON.parse(files.schedule))
        const existing = parseJSON<Schedule>(localStorage.getItem(LS_KEYS.schedule))
        const merged = mergeSchedule(existing, normNew)
        setSchedule(merged)
        localStorage.setItem(LS_KEYS.schedule, JSON.stringify(merged))
      }

      // EXAMS
      if (files.examSchedule) {
        const normNew = normalizeExamSchedule(JSON.parse(files.examSchedule))
        const existing = parseJSON<{ lastUpdated: string; exams: Exam[] }>(localStorage.getItem(LS_KEYS.exam))
        const merged = mergeExamSchedule(existing, normNew)
        setExamSchedule(merged)
        localStorage.setItem(LS_KEYS.exam, JSON.stringify(merged))
      }

      // GRADES
      if (files.grades) {
        const normNew = normalizeGrades(JSON.parse(files.grades))
        const existing = parseJSON<Grades>(localStorage.getItem(LS_KEYS.grades))
        const merged = mergeGrades(existing, normNew)
        setGrades(merged)
        localStorage.setItem(LS_KEYS.grades, JSON.stringify(merged))
      }

      // ATTENDANCE
      if (files.attendance) {
        const normNew = normalizeAttendance(JSON.parse(files.attendance))
        const existing = parseJSON<Attendance>(localStorage.getItem(LS_KEYS.attendance))
        const merged = mergeAttendance(existing, normNew)
        setAttendance(merged)
        localStorage.setItem(LS_KEYS.attendance, JSON.stringify(merged))
      }

      // CURRICULUM (optional)
      if (files.curriculum) {
        const normNew = normalizeCurriculum(JSON.parse(files.curriculum))
        const existing = parseJSON<Curriculum>(localStorage.getItem(LS_KEYS.curriculum))
        const merged = mergeCurriculum(existing, normNew)
        setCurriculum(merged)
        localStorage.setItem(LS_KEYS.curriculum, JSON.stringify(merged))
      }
    } catch (e) {
      console.error("Error parsing/merging uploaded JSONs", e)
      throw e
    }
  }

  const clearData = () => {
    setProfile(null)
    setSchedule(null)
    setExamSchedule(null)
    setGrades(null)
    setAttendance(null)
    setCurriculum(null)
    localStorage.removeItem(LS_KEYS.profile)
    localStorage.removeItem(LS_KEYS.schedule)
    localStorage.removeItem(LS_KEYS.exam)
    localStorage.removeItem(LS_KEYS.grades)
    localStorage.removeItem(LS_KEYS.attendance)
    localStorage.removeItem(LS_KEYS.curriculum)
  }

  return (
    <DataContext.Provider
      value={{
        profile,
        schedule,
        examSchedule,
        grades,
        attendance,
        curriculum,
        hasData,
        loadData,
        clearData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData must be used within DataProvider")
  return ctx
}
