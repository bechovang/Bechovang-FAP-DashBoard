"use client"

import type React from "react"

type SubjectColors = {
  badgeBg: string
  badgeFg: string
  border: string
  softBg: string
}

/**
 * Extracts the prefix letters from the subject code (e.g., "JPD" from "JPD113").
 */
function getPrefixLetters(code: string) {
  const m = /^[A-Za-z]+/.exec(code?.trim() ?? "")
  return (m?.[0] ?? "MISC").toUpperCase()
}

/**
 * Whether the code ends with 'c' (e.g., "SSL101c").
 */
function endsWithC(code: string) {
  return /c$/i.test(code?.trim() ?? "")
}

/**
 * Stable string hash (djb2).
 */
function hashString(str: string) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i)
  }
  return h >>> 0
}

/**
 * Distinct base hues for groups (avoiding blue/indigo for clarity).
 * Hues chosen across red/orange/amber/green/teal/turquoise/purple/rose/pink ranges.
 */
const BASE_HUES = [
  10, // orange
  22, // amber
  35, // warm
  140, // green
  155, // emerald
  165, // teal
  175, // aqua (still not blue)
  285, // purple
  300, // magenta
  340, // rose
  355, // red
  320, // pink
  260, // violet (not indigo)
]

/**
 * Returns a stable base hue for a group key.
 */
function getHueForGroup(groupKey: string) {
  const idx = hashString(groupKey) % BASE_HUES.length
  return BASE_HUES[idx]
}

/**
 * Compute colors for a subject code:
 * - Same group/prefix -> same hue
 * - Each subject -> different tone variants (saturation/lightness)
 * - Codes ending with 'c' get a slightly softer tone
 */
export function getSubjectColors(code: string): SubjectColors {
  const prefix = getPrefixLetters(code)
  const groupKey = prefix // grouping by prefix
  const hue = getHueForGroup(groupKey)

  const h = hashString(code)
  const variant = h % 5 // 5 tone variants within a group

  // Base saturation/lightness
  let sat = 62
  let light = 88

  // Adjust by variant for distinct per-subject tones (same hue)
  switch (variant) {
    case 0:
      sat += 0
      light += 0
      break
    case 1:
      sat += 6
      light -= 4
      break
    case 2:
      sat -= 6
      light += 4
      break
    case 3:
      sat += 10
      light -= 7
      break
    case 4:
      sat -= 10
      light += 6
      break
  }

  // Soften if ends with 'c' (common/general) while keeping the same hue/prefix
  if (endsWithC(code)) {
    sat = Math.max(35, sat - 8)
    light = Math.min(96, light + 4)
  }

  const badgeBg = `hsl(${hue} ${Math.max(30, Math.min(80, sat))}% ${Math.max(60, Math.min(94, light))}%)`
  const badgeFg = getReadableTextColorFromHsl(badgeBg)

  // Deeper, more saturated border tone of the same hue.
  const border = `hsl(${hue} ${Math.min(90, sat + 18)}% ${Math.max(36, light - 38)}%)`
  // Very soft background for subtle highlighting if needed
  const softBg = `hsl(${hue} ${Math.max(25, sat - 20)}% ${Math.min(97, light + 6)}%)`

  return { badgeBg, badgeFg, border, softBg }
}

/**
 * Given an HSL string "hsl(H S% L%)", picks white/near-black for contrast.
 */
function getReadableTextColorFromHsl(hsl: string) {
  // Extract approximate lightness
  const m = /hsl$$\s*\d+[\s,]+(\d+)%[\s,]+(\d+)%\s*$$/i.exec(hsl.replaceAll(",", " "))
  const lightness = m ? Number.parseInt(m[2], 10) : 80
  // If very light, use dark text; otherwise use white.
  return lightness >= 72 ? "#0f172a" : "#ffffff"
}

/**
 * Convenience helpers for inline styles.
 */
export function subjectAccentBorderLeft(code: string, widthPx = 4): React.CSSProperties {
  const { border } = getSubjectColors(code)
  return { borderLeft: `${widthPx}px solid ${border}` }
}

export function subjectDotStyle(code: string, sizePx = 10): React.CSSProperties {
  const { border } = getSubjectColors(code)
  return {
    width: sizePx,
    height: sizePx,
    borderRadius: sizePx / 2,
    backgroundColor: border,
  }
}
