"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function GuidePage() {
  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">Hướng dẫn</h1>
          <p className="text-sm text-muted-foreground">Cách dùng và giải thích các phép tính trong ứng dụng</p>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bắt đầu nhanh</CardTitle>
            <CardDescription>Cách tải dữ liệu và bắt đầu sử dụng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ol className="list-decimal pl-5 space-y-2">
              <li>Vào mục “Tải dữ liệu (.json)” trong thanh bên.</li>
              <li>Tải đủ 5 file JSON: profile.json, schedule.json, exam_schedule.json, grades.json, attendance.json.</li>
              <li>Khi đủ 5 file, ứng dụng tự động nạp và chuyển sang Dashboard.</li>
            </ol>
            <div className="text-muted-foreground">
              Dữ liệu được lưu cục bộ trên trình duyệt (localStorage). Bạn có thể Xuất/Xóa dữ liệu trong trang Cài đặt.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Các phép tính trong ứng dụng</CardTitle>
            <CardDescription>Chi tiết cách ứng dụng tính toán và phân loại</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="grades">
                <AccordionTrigger className="text-left">Điểm số (Grades) và tính điểm cần đạt</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium">1) Điểm trung bình môn (trong mỗi học phần):</p>
                      <p>
                        Mỗi môn có nhiều thành phần điểm (Assignments, Progress Test, Final Exam...). Ứng dụng dùng
                        công thức trung bình có trọng số theo “weight” (%) của từng thành phần:
                      </p>
                      <pre className="bg-muted p-3 rounded-md whitespace-pre-wrap">
                        {`average = Σ(score_i × weight_i / 100), với các score_i đã có giá trị`}
                      </pre>
                      <p className="text-muted-foreground">
                        Lưu ý: Nếu “Final Exam” chưa có điểm, average hiển thị phản ánh phần điểm đã có.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">2) Trạng thái môn (Passed/Failed/Not Started):</p>
                      <p>
                        Trạng thái được lấy trực tiếp từ dữ liệu JSON. Ứng dụng không tự xác định đậu/rớt nếu JSON
                        không cung cấp. Kết quả “Passed/Failed/Not Started” hiển thị đúng như trong dữ liệu nguồn.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">3) Tính “điểm thi cuối kỳ cần đạt” theo mục tiêu:</p>
                      <p>
                        Khi bạn nhập “Điểm mục tiêu” cho một môn, ứng dụng ước tính số điểm cần đạt ở “Final Exam” để
                        đạt mục tiêu đó:
                      </p>
                      <pre className="bg-muted p-3 rounded-md whitespace-pre-wrap">
                        {`currentWeightedSum = Σ(score_i × weight_i / 100) với các thành phần KHÔNG phải Final Exam
finalWeight = weight của Final Exam (%)
requiredFinalScore = (target - currentWeightedSum) / (finalWeight / 100)
Giới hạn kết quả trong [0, 10]. Nếu > 10 nghĩa là không thể đạt mục tiêu.`}
                      </pre>
                    </div>
                    <div>
                      <p className="font-medium">4) GPA hiển thị:</p>
                      <ul className="list-disc pl-5">
                        <li>Trong Dashboard: “GPA hiện tại” của học kỳ đang xem được tính theo trung bình các môn có trạng thái Passed trong học kỳ đó.</li>
                        <li>Trong Thống kê: “GPA Tổng” là trung bình điểm của tất cả các môn Passed trên toàn bộ học kỳ.</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">5) Phân loại mức điểm hiển thị (màu sắc):</p>
                      <ul className="list-disc pl-5">
                        <li>≥ 8.5: xanh lá (Xuất sắc)</li>
                        <li>7.0 – 8.49: xanh dương (Giỏi)</li>
                        <li>5.5 – 6.99: vàng (Khá)</li>
                        <li>4.0 – 5.49: cam (Trung bình)</li>
                        <li>&lt; 4.0: đỏ (Yếu/Rớt)</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="attendance">
                <AccordionTrigger className="text-left">Điểm danh (Attendance) và cảnh báo</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p>
                      Mỗi môn có absentSlots, totalSlots và absentPercentage (% vắng) đi kèm danh sách buổi học. Ứng dụng
                      phân loại cảnh báo theo absentPercentage:
                    </p>
                    <ul className="list-disc pl-5">
                      <li>
                        ≤ 10%: <Badge>An toàn</Badge>
                      </li>
                      <li>
                        &gt; 10% và ≤ 20%: <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Cảnh báo</Badge>
                      </li>
                      <li>
                        &gt; 20%: <Badge variant="destructive">Nguy hiểm</Badge>
                      </li>
                    </ul>
                    <p className="text-muted-foreground">
                      Phần “Cảnh báo điểm danh” trên Dashboard liệt kê các môn có absentPercentage &gt; 10%.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="exams">
                <AccordionTrigger className="text-left">Lịch thi (Exams)</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p>
                      “Thi sắp tới” hiển thị các kỳ thi có ngày thi trong 7 ngày tới tính từ thời điểm hiện tại của
                      thiết bị. Phân loại loại thi:
                    </p>
                    <ul className="list-disc pl-5">
                      <li>PE: Thi thực hành</li>
                      <li>FE: Thi cuối kỳ</li>
                      <li>2NDFE: Thi lại</li>
                    </ul>
                    <p className="text-muted-foreground">
                      Dữ liệu hiển thị đúng theo JSON: ngày, giờ, phòng, hình thức thi (format).
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="schedule">
                <AccordionTrigger className="text-left">Lịch học (Schedule)</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p>
                      Lịch học hiển thị theo tuần. Phần “Lịch học hôm nay” trên Dashboard lấy các tiết có ngày khớp
                      với ngày hiện tại (định dạng dd/MM). Trạng thái điểm danh trên từng buổi: “Not yet”, “Attended”,
                      “Absent” được hiển thị bằng badge tương ứng.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="analytics">
                <AccordionTrigger className="text-left">Thống kê & Phân tích (Analytics)</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        GPA Tổng: trung bình điểm của tất cả môn có trạng thái Passed trên toàn bộ học kỳ.
                      </li>
                      <li>
                        Tỷ lệ đậu: số môn Passed / tổng số môn.
                      </li>
                      <li>
                        Điểm danh TB: 100 - trung bình {`absentPercentage`} của tất cả môn (đại diện tỷ lệ có mặt).
                      </li>
                      <li>
                        Phân bố điểm số: đếm số môn theo các mức [{`≥8.5`}, 7.0–8.49, 5.5–6.99, 4.0–5.49, &lt;4.0] dựa trên
                        average và trạng thái.
                      </li>
                      <li>
                        Tiến độ theo học kỳ: với mỗi học kỳ, hiển thị GPA (trung bình các môn Passed), số môn đậu/tổng môn.
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="dashboard">
                <AccordionTrigger className="text-left">Dashboard: các chỉ số chính</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <ul className="list-disc pl-5">
                      <li>GPA hiện tại: trung bình các môn Passed của học kỳ đang xem.</li>
                      <li>Lớp hôm nay: số tiết học có ngày bằng hôm nay.</li>
                      <li>Thi sắp tới: số kỳ thi trong 7 ngày tới.</li>
                      <li>Cảnh báo vắng: số môn có absentPercentage &gt; 10% trong học kỳ hiện tại.</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator />

            <div className="space-y-2 text-sm">
              <p className="font-medium">Ghi chú & giới hạn</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Thời gian hiện tại lấy theo đồng hồ thiết bị của bạn.</li>
                <li>Trạng thái Passed/Failed/Not Started lấy trực tiếp từ JSON; ứng dụng không tự suy luận nếu không có dữ liệu.</li>
                <li>Dữ liệu được lưu bằng localStorage. “Xuất dữ liệu” tạo file backup JSON; “Xóa dữ liệu” sẽ xóa toàn bộ lưu trữ cục bộ.</li>
                <li>Ngày tháng parse theo định dạng dd/MM/yyyy cho lịch thi; dd/MM cho lịch học.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
