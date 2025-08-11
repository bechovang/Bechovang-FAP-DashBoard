"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, BookOpen } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/lib/data-context"
import { useToast } from "@/hooks/use-toast"

const requiredFiles = [
  { key: "profile", name: "profile.json", description: "Thông tin cá nhân" },
  { key: "schedule", name: "schedule.json", description: "Lịch học" },
  { key: "examSchedule", name: "exam_schedule.json", description: "Lịch thi" },
  { key: "grades", name: "grades.json", description: "Điểm số" },
  { key: "attendance", name: "attendance.json", description: "Điểm danh" },
] as const
type RequiredKey = (typeof requiredFiles)[number]["key"]

// Optional dataset
const optionalFiles = [
  { key: "curriculum", name: "curriculum.json", description: "Chương trình học (tuỳ chọn)" },
] as const
type OptionalKey = (typeof optionalFiles)[number]["key"]

type AllKey = RequiredKey | OptionalKey

const keyMapByFilename: Record<string, AllKey | undefined> = {
  "profile.json": "profile",
  "schedule.json": "schedule",
  "exam_schedule.json": "examSchedule",
  "grades.json": "grades",
  "attendance.json": "attendance",
  "curriculum.json": "curriculum",
}

function guessKeyFromName(name: string): AllKey | undefined {
  const lower = name.toLowerCase()
  if (keyMapByFilename[lower as keyof typeof keyMapByFilename]) {
    return keyMapByFilename[lower as keyof typeof keyMapByFilename]
  }
  if (lower.includes("profile")) return "profile"
  if (lower.includes("schedule") && !lower.includes("exam")) return "schedule"
  if (lower.includes("exam")) return "examSchedule"
  if (lower.includes("grade")) return "grades"
  if (lower.includes("attend")) return "attendance"
  if (lower.includes("curriculum")) return "curriculum"
  return undefined
}

export function DataUploader() {
  const [uploadedFiles, setUploadedFiles] = useState<Partial<Record<AllKey, string>>>({})
  const [dragOver, setDragOver] = useState(false)
  const [autoLoading, setAutoLoading] = useState(false)
  const { loadData } = useData()
  const { toast } = useToast()
  const router = useRouter()

  const allFilesUploaded = useMemo(
    () => requiredFiles.every((file) => uploadedFiles[file.key]),
    [uploadedFiles],
  )

  const mergeFiles = (incoming: Partial<Record<AllKey, string>>) => {
    setUploadedFiles((prev) => ({ ...prev, ...incoming }))
  }

  const handleJsonFiles = async (files: FileList) => {
    const newFiles: Partial<Record<AllKey, string>> = {}
    for (const file of Array.from(files)) {
      if (!(file.type === "application/json" || file.name.toLowerCase().endsWith(".json"))) continue
      try {
        const content = await file.text()
        JSON.parse(content) // validate JSON
        const key = guessKeyFromName(file.name)
        if (key) {
          newFiles[key] = content
        }
      } catch {
        toast({
          title: "Lỗi file JSON",
          description: `File ${file.name} không hợp lệ`,
          variant: "destructive",
        })
      }
    }
    if (Object.keys(newFiles).length) {
      mergeFiles(newFiles)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    await handleJsonFiles(files)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    void handleFileUpload(e.dataTransfer.files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) void handleFileUpload(e.target.files)
  }

  // Auto-load immediately when all required files are present
  useEffect(() => {
    if (allFilesUploaded && !autoLoading) {
      setAutoLoading(true)
      try {
        loadData(uploadedFiles as Record<string, string>)
        toast({
          title: "Đã nạp dữ liệu",
          description: "Dẫn bạn đến Dashboard...",
        })
        setTimeout(() => router.push("/"), 150)
      } catch {
        setAutoLoading(false)
        toast({
          title: "Lỗi nạp dữ liệu",
          description: "Vui lòng kiểm tra lại cấu trúc file JSON của bạn.",
          variant: "destructive",
        })
      }
    }
  }, [allFilesUploaded, autoLoading, loadData, uploadedFiles, router, toast])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Tải dữ liệu học tập</h1>
        <p className="text-muted-foreground">
          Hỗ trợ: .json. Tải đủ 5 file bắt buộc sẽ tự động nạp và chuyển sang Dashboard.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tải lên dữ liệu</CardTitle>
          <CardDescription>Chấp nhận kéo/thả hoặc chọn file từ máy</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Kéo thả file JSON vào đây</p>
            <p className="text-muted-foreground mb-4">hoặc</p>
            <Button asChild>
              <label className="cursor-pointer">
                Chọn file (.json)
                <input type="file" multiple accept=".json,application/json" className="hidden" onChange={handleFileInput} />
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" /> Trạng thái file bắt buộc
        </h3>
        {requiredFiles.map((file) => (
          <Card key={file.key}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{file.description}</p>
                </div>
              </div>
              {uploadedFiles[file.key] ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
            </CardContent>
          </Card>
        ))}

        <h3 className="text-lg font-semibold mt-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" /> File tuỳ chọn
        </h3>
        {optionalFiles.map((file) => (
          <Card key={file.key}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{file.description}</p>
                </div>
              </div>
              {uploadedFiles[file.key] ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
            </CardContent>
          </Card>
        ))}

        {allFilesUploaded && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-green-600" />
              <span className="text-sm text-green-800">Đủ file rồi, đang nạp dữ liệu...</span>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
