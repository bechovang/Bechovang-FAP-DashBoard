"use client"
import { cn } from "@/lib/utils"
import { getSubjectColors } from "@/lib/subject-colors"

type SubjectBadgeProps = {
  code?: string
  className?: string
  withDot?: boolean
  size?: "sm" | "md"
}

export function SubjectBadge({ code = "", className, withDot = true, size = "sm" }: SubjectBadgeProps) {
  const { badgeBg, badgeFg, border } = getSubjectColors(code)
  const sizes = size === "sm" ? "h-6 text-xs px-2" : "h-7 text-sm px-2.5"
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-md font-medium select-none", sizes, className)}
      style={{ backgroundColor: badgeBg, color: badgeFg, boxShadow: `inset 0 0 0 1px ${border}20` }}
      title={code}
    >
      {withDot && (
        <span
          aria-hidden="true"
          className="inline-block rounded-full"
          style={{ width: 8, height: 8, backgroundColor: border }}
        />
      )}
      <span className="tabular-nums">{code || "—"}</span>
    </span>
  )
}
