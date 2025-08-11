"use client"

import { useEffect, useMemo, useState } from "react"
import { MessageSquare, Mail, Copy } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  SidebarMenuButton,
} from "@/components/ui/sidebar"

type FeedbackType = "feedback" | "bug"

export function FeedbackDialog() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>("feedback")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [includeMeta, setIncludeMeta] = useState(true)
  const { toast } = useToast()

  const pageUrl = typeof window !== "undefined" ? window.location.href : ""
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : ""

  const computedSubject = useMemo(() => {
    const prefix = type === "bug" ? "[Student Hub] Báo lỗi" : "[Student Hub] Góp ý"
    const s = subject?.trim() ? `: ${subject.trim()}` : ""
    return `${prefix}${s}`
  }, [type, subject])

  const computedBody = useMemo(() => {
    const lines = [
      `Loại: ${type === "bug" ? "Báo lỗi" : "Góp ý"}`,
      "",
      "Nội dung:",
      message || "(chưa nhập nội dung)",
    ]
    if (includeMeta) {
      lines.push("", "— Thông tin bổ sung —")
      if (pageUrl) lines.push(`Trang: ${pageUrl}`)
      if (userAgent) lines.push(`Trình duyệt: ${userAgent}`)
    }
    return lines.join("\n")
  }, [type, message, includeMeta, pageUrl, userAgent])

  const handleSendEmail = () => {
    if (!message.trim()) {
      toast({
        title: "Vui lòng nhập nội dung",
        description: "Bạn cần điền nội dung trước khi gửi.",
        variant: "destructive",
      })
      return
    }
    const mailto = `mailto:phuchcm2006@gmail.com?subject=${encodeURIComponent(computedSubject)}&body=${encodeURIComponent(computedBody)}`
    // Open default mail client
    window.location.href = mailto
    toast({ title: "Mở ứng dụng email", description: "Nội dung đã được điền sẵn. Vui lòng bấm gửi trong ứng dụng email của bạn." })
    setOpen(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${computedSubject}\n\n${computedBody}`)
      toast({ title: "Đã sao chép", description: "Tiêu đề và nội dung đã được sao chép vào clipboard." })
    } catch {
      toast({ title: "Không thể sao chép", description: "Trình duyệt chặn clipboard. Vui lòng chọn thủ công.", variant: "destructive" })
    }
  }

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setType("feedback")
      setSubject("")
      setMessage("")
      setIncludeMeta(true)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton asChild>
          <button type="button">
            <MessageSquare className="h-4 w-4" />
            <span>Góp ý / Báo lỗi</span>
          </button>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Góp ý / Báo lỗi</DialogTitle>
          <DialogDescription>Gửi nhận xét hoặc báo lỗi để chúng tôi cải thiện trải nghiệm.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Loại</label>
            <Select value={type} onValueChange={(v: FeedbackType) => setType(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feedback">Góp ý</SelectItem>
                <SelectItem value="bug">Báo lỗi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="feedback-subject" className="text-sm font-medium">Tiêu đề (tuỳ chọn)</label>
            <Input
              id="feedback-subject"
              placeholder="Ví dụ: Cải thiện trang Điểm số"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="feedback-message" className="text-sm font-medium">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="feedback-message"
              placeholder="Mô tả chi tiết góp ý hoặc lỗi bạn gặp..."
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{message.length} ký tự</p>
          </div>

          <Card>
            <CardContent className="p-3">
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={includeMeta}
                  onChange={(e) => setIncludeMeta(e.target.checked)}
                />
                <span>Đính kèm thông tin trang hiện tại và trình duyệt để hỗ trợ xử lý nhanh hơn</span>
              </label>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="secondary" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Sao chép nội dung
          </Button>
          <Button type="button" onClick={handleSendEmail} disabled={!message.trim()}>
            <Mail className="h-4 w-4 mr-2" />
            Gửi bằng email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
