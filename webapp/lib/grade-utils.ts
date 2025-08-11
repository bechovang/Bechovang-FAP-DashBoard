"use client"

// Lightweight types to avoid importing from data-context at runtime.
export type CourseCalcMode = "gpa" | "passfail" | "ignore"

export type GradeDetail = {
  category: string
  item: string
  weight: number
  value: number | null
}

export type CourseInput = {
  subjectCode: string
  subjectName?: string
  gradeDetails: GradeDetail[]
  average?: number | null
}

export type CourseEval = {
  overall: number
  complete: boolean
  passed: boolean
  usedResitKeys: string[]
  bonus: number
}

const MODES_KEY = "studentCourseTreatmentModes" // mapping: { [subjectCode]: "gpa" | "passfail" | "ignore" }

// Utils
const clamp01 = (x: number, min = 0, max = 10) => Math.max(min, Math.min(max, x))
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v)

/**
 * Normalize a detail key so that "Final Exam", "FE", "TE" variants match with their resit names.
 * Strips spaces, punctuation, parentheses and common resit words.
 */
function normKey(s: string) {
  return (s || "").toLowerCase().replace(/[()\-_.]/g, "")
  // do not strip 'resit' here; we need to differentiate then derive a base key without resit
}

function isResitName(s: string) {
  const t = (s || "").toLowerCase()
  return t.includes("resit") || t.includes("thi lại") || t.includes("thi lai")
}

function isBonusName(s: string) {
  return (s || "").toLowerCase().includes("bonus")
}

function baseKeyFromResit(name: string) {
  return name
    .toLowerCase()
    .replace(/resit|thi lại|thi lai/gi, "")
    .replace(/[()\-_.]/g, "")
    .trim()
}

/**
 * Build effective details:
 * - Bonus lines are not part of weighted sum, they are added separately.
 * - Resit with a score replaces the base item value.
 * - Completeness requires all non-bonus weighted items to have a numeric value after applying resit.
 */
export function buildEffectiveDetails(details: GradeDetail[]) {
  const baseMap = new Map<string, GradeDetail>() // key -> detail
  const resitMap = new Map<string, GradeDetail>() // baseKey -> resit detail
  let bonus = 0

  for (const d of details ?? []) {
    const label = `${d?.category ?? ""} ${d?.item ?? ""}`.trim()
    if (isBonusName(label)) {
      if (isNum(d?.value)) bonus += d.value
      continue
    }

    if (isResitName(label)) {
      // Only store resit if it has a value; otherwise ignore
      if (isNum(d?.value)) {
        const baseKey = baseKeyFromResit(label)
        if (baseKey) resitMap.set(baseKey, d)
      }
      continue
    }

    // Regular detail becomes a base detail
    const k = normKey(label)
    if (!baseMap.has(k)) baseMap.set(k, d)
    else {
      // If duplicate keys appear, prefer the one that has a numeric value or larger weight.
      const cur = baseMap.get(k)!
      const next = isNum(d?.value) && !isNum(cur?.value) ? d : d.weight > cur.weight ? d : cur
      baseMap.set(k, next)
    }
  }

  // Apply resits: override base value if we have a resit for its baseKey
  const usedResitKeys: string[] = []
  for (const [k, base] of baseMap) {
    const resit = resitMap.get(k) ?? resitMap.get(baseKeyFromResit(k))
    if (resit && isNum(resit.value)) {
      baseMap.set(k, { ...base, value: resit.value })
      usedResitKeys.push(k)
    }
  }

  const effective = Array.from(baseMap.values())
  const complete = effective.filter((d) => (d?.weight ?? 0) > 0).every((d) => isNum(d?.value))
  const weighted = effective.reduce((sum, d) => {
    if (!isNum(d?.value)) return sum
    const w = typeof d?.weight === "number" ? d.weight : 0
    return sum + d.value * (w / 100)
  }, 0)
  const overall = clamp01(weighted + bonus, 0, 10)

  return { effective, bonus, complete, usedResitKeys, overall }
}

/**
 * Pass rule:
 * - All weighted components present (complete) AND overall >= 5.0
 */
export function isPassed(complete: boolean, overall: number) {
  return complete && overall >= 5
}

export function evaluateCourse(course: CourseInput): CourseEval {
  const { effective, bonus, complete, usedResitKeys, overall } = buildEffectiveDetails(course?.gradeDetails ?? [])
  return {
    overall,
    complete,
    passed: isPassed(complete, overall),
    usedResitKeys,
    bonus,
  }
}

export function getCourseMode(subjectCode: string): CourseCalcMode {
  try {
    if (typeof window === "undefined") return "gpa"
    const raw = localStorage.getItem(MODES_KEY)
    const map = raw ? (JSON.parse(raw) as Record<string, CourseCalcMode | string>) : {}
    const m = map?.[subjectCode]
    if (m === "gpa" || m === "passfail" || m === "ignore") return m
    return "gpa"
  } catch {
    return "gpa"
  }
}
