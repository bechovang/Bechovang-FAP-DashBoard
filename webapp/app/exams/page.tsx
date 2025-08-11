"use client"

import { Calendar, Clock, MapPin, FileText, AlertCircle, Timer } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useData } from "@/lib/data-context"
import { parseISO, isAfter, isBefore, addDays } from "date-fns"
import { SubjectBadge } from "@/components/subject-badge"
import { subjectAccentBorderLeft } from "@/lib/subject-colors"

// Normalize various subject code formats into a consistent code for coloring
function canonicalizeSubjectCode(input?: string) {
  if (!input) return ""
  // Prefer code inside parentheses if present, else use the raw string
  const m = /$$([A-Za-z0-9]+)$$/.exec(input)
  const raw = (m?.[1] ?? input).trim()
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
}

export default function ExamsPage() {
  const { examSchedule } = useData()
  const exams = Array.isArray(examSchedule?.exams) ? examSchedule.exams : []

  if (exams.length === 0) {
    return (
      <div className="flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">Lịch thi</h1>
        </header>
        <main className="flex-1 p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Không có dữ liệu lịch thi</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const today = new Date()
  const nextWeek = addDays(today, 7)

  // Categorize exams
  const upcomingExams = exams.filter((exam) => {
    const examDate = parseISO(exam.date.split("/").reverse().join("-"))
    return isAfter(examDate, today) && isBefore(examDate, nextWeek)
  })

  const futureExams = exams.filter((exam) => {
    const examDate = parseISO(exam.date.split("/").reverse().join("-"))
    return isAfter(examDate, nextWeek)
  })

  const pastExams = exams.filter((exam) => {
    const examDate = parseISO(exam.date.split("/").reverse().join("-"))
    return isBefore(examDate, today)
  })

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case "PE":
        return "bg-blue-100 text-blue-800"
      case "FE":
        return "bg-red-100 text-red-800"
      case "2NDFE":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getExamTypeName = (type: string) => {
    switch (type) {
      case "PE":
        return "Thi thực hành"
      case "FE":
        return "Thi cuối kỳ"
      case "2NDFE":
        return "Thi lại"
      default:
        return type
    }
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-lg font-semibold">Lịch thi</h1>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Upcoming Exams */}
        {upcomingExams.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Thi sắp tới (7 ngày tới)
              </CardTitle>
              <CardDescription>Các kỳ thi cần chuẩn bị</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingExams.map((exam: any, index: number) => {
                  const code = canonicalizeSubjectCode(exam.subjectCode)
                  return (
                    <Card key={index} className="bg-white" style={subjectAccentBorderLeft(code, 4)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <SubjectBadge code={code} />
                            <div>
                              <h3 className="font-semibold">{exam.subjectName}</h3>
                              <p className="text-xs text-muted-foreground">{code}</p>
                            </div>
                          </div>
                          <Badge className={getExamTypeColor(exam.type)}>{getExamTypeName(exam.type)}</Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.time}</span>
                          </div>
                          {exam.room && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>Phòng {exam.room}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.format}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Future Exams */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Lịch thi trong tương lai
            </CardTitle>
            <CardDescription>Tất cả các kỳ thi đã được lên lịch</CardDescription>
          </CardHeader>
          <CardContent>
            {futureExams.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Không có kỳ thi nào được lên lịch</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {futureExams.map((exam: any, index: number) => {
                  const code = canonicalizeSubjectCode(exam.subjectCode)
                  return (
                    <Card key={index} style={subjectAccentBorderLeft(code, 4)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <SubjectBadge code={code} />
                            <div>
                              <h3 className="font-semibold">{exam.subjectName}</h3>
                              <p className="text-xs text-muted-foreground">{code}</p>
                            </div>
                          </div>
                          <Badge className={getExamTypeColor(exam.type)}>{getExamTypeName(exam.type)}</Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.time}</span>
                          </div>
                          {exam.room && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>Phòng {exam.room}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.format}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Exams */}
        {pastExams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử thi</CardTitle>
              <CardDescription>Các kỳ thi đã hoàn thành</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastExams.slice(0, 6).map((exam: any, index: number) => {
                  const code = canonicalizeSubjectCode(exam.subjectCode)
                  return (
                    <Card key={index} className="opacity-75" style={subjectAccentBorderLeft(code, 4)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <SubjectBadge code={code} />
                            <div>
                              <h3 className="font-semibold">{exam.subjectName}</h3>
                              <p className="text-xs text-muted-foreground">{code}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{getExamTypeName(exam.type)}</Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.time}</span>
                          </div>
                          {exam.room && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>Phòng {exam.room}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
