"use client"

import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useData } from "@/lib/data-context"
import { SubjectBadge } from "@/components/subject-badge"
import { subjectAccentBorderLeft } from "@/lib/subject-colors"

// Helper to map statuses to label and styles
const getSessionStatus = (status?: string) => {
  const normalized = (status || "").toLowerCase()
  // Treat these as "đã học" / present
  const isPresent =
    normalized === "attended" ||
    normalized === "present" ||
    normalized === "completed" ||
    normalized === "learned" ||
    normalized === "đã học" ||
    normalized === "co mat" // safety for unaccented

  if (isPresent) {
    return {
      label: "Có mặt",
      variant: "outline" as const,
      className:
        "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
    }
  }

  if (normalized === "absent" || normalized === "vắng" || normalized === "vang") {
    return {
      label: "Vắng",
      variant: "destructive" as const,
      className: "",
    }
  }

  return {
    label: "Chưa học",
    variant: "secondary" as const,
    className: "",
  }
}

export default function SchedulePage() {
  const { schedule } = useData()
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)

  if (!schedule || !schedule.schedule.length) {
    return (
      <div className="flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">Lịch học</h1>
        </header>
        <main className="flex-1 p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Không có dữ liệu lịch học</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const currentWeek = schedule.schedule[currentWeekIndex]

  const nextWeek = () => {
    if (currentWeekIndex < schedule.schedule.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1)
    }
  }

  const prevWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1)
    }
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-lg font-semibold">Lịch học</h1>
      </header>

      <main className="flex-1 p-6">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Tuần {currentWeek.weekNumber}</h2>
            <p className="text-muted-foreground">{currentWeek.weekLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevWeek} disabled={currentWeekIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
              Tuần trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextWeek}
              disabled={currentWeekIndex === schedule.schedule.length - 1}
            >
              Tuần sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {currentWeek.days.map((day, dayIndex) => (
            <Card key={dayIndex} className={day.activities.length === 0 ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{day.day}</CardTitle>
                <CardDescription>{day.date}</CardDescription>
              </CardHeader>
              <CardContent>
                {day.activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Không có lớp học</p>
                ) : (
                  <div className="space-y-3">
                    {day.activities.map((activity, activityIndex) => (
                      <div
                        key={activityIndex}
                        className="p-3 rounded-lg border bg-card"
                        style={subjectAccentBorderLeft(activity.subjectCode, 4)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <SubjectBadge code={activity.subjectCode} size="sm" />
                          </div>
                          {(() => {
                            const ap = getSessionStatus(activity.attendanceStatus)
                            return (
                              <Badge variant={ap.variant} className={`text-xs ${ap.className}`}>
                                {ap.label}
                              </Badge>
                            )
                          })()}
                        </div>

                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Tiết {activity.slot} • {activity.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{activity.room}</span>
                          </div>
                          {activity.lecturer && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{activity.lecturer}</span>
                            </div>
                          )}
                        </div>

                        {activity.materialsUrl && (
                          <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-xs">
                            Xem tài liệu
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
