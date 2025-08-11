"use client"

import { useMemo, useState } from "react"
import { Layers, GraduationCap, Search, DownloadCloud } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useData } from "@/lib/data-context"
import { useToast } from "@/hooks/use-toast"
import { SubjectBadge } from "@/components/subject-badge"
import { subjectAccentBorderLeft } from "@/lib/subject-colors"

type Subject = {
  subjectCode: string
  subjectName: string
  termNo: number
}

function termLabel(termNo: number) {
  if (termNo === -1) return "Dự bị"
  if (termNo === 0) return "Nền tảng / Hoạt động chung"
  if (termNo > 0) return `Kỳ ${termNo}`
  return `Kỳ ${termNo}`
}

export default function CurriculumPage() {
  const { curriculum, grades, loadData } = useData()
  const { toast } = useToast()
  const [query, setQuery] = useState("")
  const [activeTerm, setActiveTerm] = useState<number | "all">("all")

  // Build quick lookup of study status from grades
  const statusMap = useMemo(() => {
    const map = new Map<string, "passed" | "failed" | "in-progress">()
    if (!grades) return map

    for (const sem of grades.semesters) {
      for (const c of sem.courses) {
        const code = c.subjectCode
        if (c.status === "Passed") {
          map.set(code, "passed")
        } else if (c.status === "Failed") {
          // only set failed if not already passed
          if (map.get(code) !== "passed") map.set(code, "failed")
        } else {
          // Not Started means still ongoing / upcoming in our context
          if (!map.has(code)) map.set(code, "in-progress")
        }
      }
    }
    return map
  }, [grades])

  const grouped = useMemo(() => {
    const subjects: Subject[] = Array.isArray(curriculum?.subjects) ? curriculum!.subjects : []
    const filtered = subjects.filter((s) => {
      const matchQuery =
        !query ||
        s.subjectCode.toLowerCase().includes(query.toLowerCase()) ||
        s.subjectName.toLowerCase().includes(query.toLowerCase())
      const matchTerm = activeTerm === "all" ? true : s.termNo === activeTerm
      return matchQuery && matchTerm
    })

    const byTerm = new Map<number, Subject[]>()
    for (const s of filtered) {
      if (!byTerm.has(s.termNo)) byTerm.set(s.termNo, [])
      byTerm.get(s.termNo)!.push(s)
    }
    // sort groups by termNo
    return Array.from(byTerm.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([term, list]) => [term, list.sort((x, y) => x.subjectCode.localeCompare(y.subjectCode))] as const)
  }, [curriculum, query, activeTerm])

  const termOptions = useMemo(() => {
    const set = new Set<number>()
    if (Array.isArray(curriculum?.subjects)) {
      for (const s of curriculum!.subjects) set.add(s.termNo)
    }
    return Array.from(set).sort((a, b) => a - b)
  }, [curriculum])

  const totalSubjects = curriculum?.subjects?.length ?? 0
  const totalTerms = termOptions.filter((t) => t > 0).length

  const handleLoadSample = async () => {
    try {
      const res = await fetch("/data/fap_curriculum.json")
      if (!res.ok) throw new Error("Không thể tải tệp mẫu")
      const jsonText = await res.text() // keep raw text for DataContext.loadData
      loadData({ curriculum: jsonText })
      toast({
        title: "Đã nạp chương trình học",
        description: "Dẫn bạn đến trang Chương trình học...",
      })
    } catch (e) {
      toast({
        title: "Không thể nạp dữ liệu mẫu",
        description: "Vui lòng thử lại sau.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-muted-foreground" />
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">Chương trình học</h1>
            <p className="text-sm text-muted-foreground">Lộ trình môn học theo học kỳ</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {!curriculum || !Array.isArray(curriculum.subjects) || curriculum.subjects.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Chưa có dữ liệu chương trình học</CardTitle>
              <CardDescription>
                Tải thêm curriculum.json trong trang “Tải dữ liệu (.json)” hoặc nạp dataset mẫu bên dưới.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Dữ liệu chương trình học là tuỳ chọn, nhưng giúp bạn xem toàn bộ lộ trình theo kỳ.
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <a href="/upload">Tải dữ liệu (.json)</a>
                </Button>
                <Button onClick={handleLoadSample}>
                  <DownloadCloud className="h-4 w-4 mr-2" />
                  Nạp dataset mẫu
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  {curriculum.programCode || "Chương trình"}
                </CardTitle>
                <CardDescription>
                  Cập nhật:{" "}
                  {curriculum.lastUpdated ? new Date(curriculum.lastUpdated).toLocaleString("vi-VN") : "Không rõ"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{totalSubjects}</p>
                    <p className="text-sm text-muted-foreground">Tổng số môn</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{totalTerms}</p>
                    <p className="text-sm text-muted-foreground">Số học kỳ (chính)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{termOptions.includes(0) ? "Có" : "Không"}</p>
                    <p className="text-sm text-muted-foreground">Môn nền tảng/hoạt động</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tools */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm theo mã hoặc tên môn..."
                  className="pl-8"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  role="button"
                  tabIndex={0}
                  className={`cursor-pointer ${
                    activeTerm === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                  onClick={() => setActiveTerm("all")}
                >
                  Tất cả
                </Badge>
                {termOptions.map((t) => (
                  <Badge
                    key={t}
                    role="button"
                    tabIndex={0}
                    className={`cursor-pointer ${
                      activeTerm === t ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                    onClick={() => setActiveTerm(t)}
                  >
                    {termLabel(t)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Grid by term */}
            {grouped.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Không tìm thấy môn nào khớp với bộ lọc.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {grouped.map(([term, list]) => (
                  <Card key={term}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{termLabel(term)}</CardTitle>
                      <CardDescription>{list.length} môn</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {list.map((s) => {
                        const st = statusMap.get(s.subjectCode)
                        return (
                          <div
                            key={s.subjectCode}
                            className="flex items-start justify-between rounded-md border p-3"
                            style={subjectAccentBorderLeft(s.subjectCode, 4)}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <SubjectBadge code={s.subjectCode} />
                                <p className="font-medium">{s.subjectName}</p>
                              </div>
                            </div>
                            {(st === "passed" || st === "failed" || st === "in-progress") && (
                              <div className="ml-3">
                                {st === "passed" && (
                                  <Badge className="bg-green-100 text-green-800">Đã hoàn thành</Badge>
                                )}
                                {st === "failed" && <Badge variant="destructive">Chưa đạt</Badge>}
                                {st === "in-progress" && (
                                  <Badge className="bg-yellow-100 text-yellow-800">Đang học</Badge>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
