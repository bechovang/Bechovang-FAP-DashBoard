"use client"

type DonutTripleProps = {
  present: number
  absent: number
  future: number
  size?: number
  stroke?: number
  className?: string
}

export function DonutTriple({ present, absent, future, size = 128, stroke = 14, className }: DonutTripleProps) {
  const total = Math.max(0, present) + Math.max(0, absent) + Math.max(0, future)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  // Avoid division by zero
  const p = total > 0 ? present / total : 0
  const a = total > 0 ? absent / total : 0
  const f = total > 0 ? future / total : 0

  // Stroke lengths for each segment
  const segPresent = circumference * p
  const segAbsent = circumference * a
  const segFuture = circumference * f

  // Offsets: SVG starts at 3 o'clock, so rotate -90deg to start at 12 o'clock
  const offsetPresent = 0
  const offsetAbsent = segPresent
  const offsetFuture = segPresent + segAbsent

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label="Attendance donut chart"
      role="img"
    >
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(0 0% 92%)" strokeWidth={stroke} />
        {/* Present (green) */}
        {segPresent > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#16a34a"
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={`${segPresent} ${circumference - segPresent}`}
            strokeDashoffset={-offsetPresent}
          />
        )}
        {/* Absent (red) */}
        {segAbsent > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#dc2626"
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={`${segAbsent} ${circumference - segAbsent}`}
            strokeDashoffset={-offsetAbsent}
          />
        )}
        {/* Future (gray) */}
        {segFuture > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#9ca3af"
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={`${segFuture} ${circumference - segFuture}`}
            strokeDashoffset={-offsetFuture}
          />
        )}
      </g>
    </svg>
  )
}
