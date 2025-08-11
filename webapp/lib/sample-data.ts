// Sample data tích hợp sẵn trong app
export const sampleProfile = {
  studentId: "SE203055",
  fullName: "Nguyễn Ngọc Phúc",
  email: "[email protected]",
  campus: "FPTU-Hồ Chí Minh",
  curriculumCode: "BIT_SE_20B",
  lastUpdated: "2025-01-04T08:00:00Z",
}

export const sampleSchedule = {
  lastUpdated: "2025-01-04T08:00:00Z",
  schedule: [
    {
      year: 2025,
      weekNumber: 2,
      weekLabel: "06/01 To 12/01",
      days: [
        {
          day: "Monday",
          date: "06/01",
          activities: [
            {
              slot: 1,
              time: "07:00-09:15",
              subjectCode: "PRF192",
              room: "BE-301",
              lecturer: "Nguyễn Văn A",
              attendanceStatus: "Not yet" as const,
              materialsUrl: "http://flm.fpt.edu.vn/materials/prf192",
            },
            {
              slot: 3,
              time: "10:30-12:00",
              subjectCode: "MAE101",
              room: "BE-205",
              lecturer: "Trần Thị B",
              attendanceStatus: "Not yet" as const,
              materialsUrl: "http://flm.fpt.edu.vn/materials/mae101",
            },
          ],
        },
        {
          day: "Tuesday",
          date: "07/01",
          activities: [
            {
              slot: 2,
              time: "09:30-11:45",
              subjectCode: "VOV134",
              room: "Sảnh lầu 5_1",
              lecturer: "Ms. Sarah",
              attendanceStatus: "Not yet" as const,
              materialsUrl: "http://flm.fpt.edu.vn/materials/vov134",
            },
          ],
        },
        {
          day: "Wednesday",
          date: "08/01",
          activities: [
            {
              slot: 2,
              time: "09:30-11:45",
              subjectCode: "CSI106",
              room: "BE-401",
              lecturer: "Lê Văn C",
              attendanceStatus: "Not yet" as const,
              materialsUrl: "http://flm.fpt.edu.vn/materials/csi106",
            },
            {
              slot: 4,
              time: "12:30-14:00",
              subjectCode: "SSL101c",
              room: "BE-102",
              lecturer: "Phạm Văn D",
              attendanceStatus: "Not yet" as const,
              materialsUrl: "http://flm.fpt.edu.vn/materials/ssl101c",
            },
          ],
        },
        {
          day: "Thursday",
          date: "09/01",
          activities: [
            {
              slot: 1,
              time: "07:00-09:15",
              subjectCode: "PRF192",
              room: "BE-301",
              lecturer: "Nguyễn Văn A",
              attendanceStatus: "Not yet" as const,
              materialsUrl: "http://flm.fpt.edu.vn/materials/prf192",
            },
          ],
        },
        {
          day: "Friday",
          date: "10/01",
          activities: [
            {
              slot: 3,
              time: "10:30-12:00",
              subjectCode: "MAE101",
              room: "BE-205",
              lecturer: "Trần Thị B",
              attendanceStatus: "Not yet" as const,
              materialsUrl: "http://flm.fpt.edu.vn/materials/mae101",
            },
            {
              slot: 5,
              time: "14:10-15:40",
              subjectCode: "VOV134",
              room: "Sảnh lầu 5_1",
              lecturer: "Ms. Sarah",
              attendanceStatus: "Not yet" as const,
              materialsUrl: "http://flm.fpt.edu.vn/materials/vov134",
            },
          ],
        },
        {
          day: "Saturday",
          date: "11/01",
          activities: [
            {
              slot: 1,
              time: "07:00-09:15",
              subjectCode: "CSI106",
              room: "BE-401",
              lecturer: "Lê Văn C",
              attendanceStatus: "Not yet" as const,
              materialsUrl: "http://flm.fpt.edu.vn/materials/csi106",
            },
          ],
        },
        {
          day: "Sunday",
          date: "12/01",
          activities: [],
        },
      ],
    },
  ],
}

export const sampleExamSchedule = {
  lastUpdated: "2025-01-04T08:00:00Z",
  exams: [
    {
      subjectCode: "PRF192",
      subjectName: "Programming Fundamentals",
      date: "15/01/2025",
      room: "126",
      time: "07h00-09h00",
      type: "PE" as const,
      format: "PRACTICAL_EXAM",
      publicationDate: "08/01/2025",
    },
    {
      subjectCode: "VOV134",
      subjectName: "Vovinam 1",
      date: "18/01/2025",
      room: "Gym Hall",
      time: "14h10-15h40",
      type: "PE" as const,
      format: "PRACTICAL_EXAM",
      publicationDate: "12/01/2025",
    },
    {
      subjectCode: "MAE101",
      subjectName: "Mathematics for Engineering",
      date: "20/01/2025",
      room: "137",
      time: "07h30-09h00",
      type: "FE" as const,
      format: "Multiple_choices",
      publicationDate: "10/01/2025",
    },
    {
      subjectCode: "CSI106",
      subjectName: "Introduction to Computer Science",
      date: "25/01/2025",
      room: "BE-401",
      time: "10h30-12h00",
      type: "FE" as const,
      format: "Written_exam",
      publicationDate: "15/01/2025",
    },
    {
      subjectCode: "SSL101c",
      subjectName: "Academic Skills for University Success",
      date: "05/02/2025",
      room: "BE-205",
      time: "09h30-11h00",
      type: "FE" as const,
      format: "Multiple_choices",
      publicationDate: "25/01/2025",
    },
  ],
}

export const sampleGrades = {
  lastUpdated: "2025-01-04T08:00:00Z",
  semesters: [
    {
      term: "Fall2024",
      courses: [
        {
          subjectCode: "CSI104",
          subjectName: "Introduction to Programming",
          average: 8.2,
          status: "Passed" as const,
          gradeDetails: [
            {
              category: "Assignments/Exercises",
              item: "Assignment 1",
              weight: 10.0,
              value: 9.0,
            },
            {
              category: "Assignments/Exercises",
              item: "Assignment 2",
              weight: 10.0,
              value: 8.5,
            },
            {
              category: "Progress Test",
              item: "Progress Test 1",
              weight: 15.0,
              value: 7.8,
            },
            {
              category: "Progress Test",
              item: "Progress Test 2",
              weight: 15.0,
              value: 8.0,
            },
            {
              category: "Final Exam",
              item: "Final Exam",
              weight: 50.0,
              value: 8.4,
            },
          ],
        },
        {
          subjectCode: "MAD101",
          subjectName: "Discrete Mathematics",
          average: 7.6,
          status: "Passed" as const,
          gradeDetails: [
            {
              category: "Assignments/Exercises",
              item: "Assignment 1",
              weight: 10.0,
              value: 8.0,
            },
            {
              category: "Assignments/Exercises",
              item: "Assignment 2",
              weight: 10.0,
              value: 7.5,
            },
            {
              category: "Progress Test",
              item: "Progress Test 1",
              weight: 15.0,
              value: 7.0,
            },
            {
              category: "Progress Test",
              item: "Progress Test 2",
              weight: 15.0,
              value: 8.2,
            },
            {
              category: "Final Exam",
              item: "Final Exam",
              weight: 50.0,
              value: 7.8,
            },
          ],
        },
        {
          subjectCode: "ENW492c",
          subjectName: "English 4",
          average: 4.2,
          status: "Failed" as const,
          gradeDetails: [
            {
              category: "Assignments/Exercises",
              item: "Assignment 1",
              weight: 10.0,
              value: 5.0,
            },
            {
              category: "Assignments/Exercises",
              item: "Assignment 2",
              weight: 10.0,
              value: 4.5,
            },
            {
              category: "Progress Test",
              item: "Progress Test 1",
              weight: 15.0,
              value: 3.8,
            },
            {
              category: "Progress Test",
              item: "Progress Test 2",
              weight: 15.0,
              value: 4.0,
            },
            {
              category: "Final Exam",
              item: "Final Exam",
              weight: 50.0,
              value: 4.2,
            },
          ],
        },
      ],
    },
    {
      term: "Spring2025",
      courses: [
        {
          subjectCode: "PRF192",
          subjectName: "Programming Fundamentals",
          average: 7.8,
          status: "Not Started" as const,
          gradeDetails: [
            {
              category: "Assignments/Exercises",
              item: "Assignment 1",
              weight: 10.0,
              value: 8.5,
            },
            {
              category: "Assignments/Exercises",
              item: "Assignment 2",
              weight: 10.0,
              value: 7.0,
            },
            {
              category: "Progress Test",
              item: "Progress Test 1",
              weight: 15.0,
              value: 8.0,
            },
            {
              category: "Progress Test",
              item: "Progress Test 2",
              weight: 15.0,
              value: 7.5,
            },
            {
              category: "Final Exam",
              item: "Final Exam",
              weight: 40.0,
              value: null,
            },
          ],
        },
        {
          subjectCode: "MAE101",
          subjectName: "Mathematics for Engineering",
          average: 6.4,
          status: "Not Started" as const,
          gradeDetails: [
            {
              category: "Assignments/Exercises",
              item: "Assignment 1",
              weight: 10.0,
              value: 7.0,
            },
            {
              category: "Assignments/Exercises",
              item: "Assignment 2",
              weight: 10.0,
              value: 6.5,
            },
            {
              category: "Assignments/Exercises",
              item: "Assignment 3",
              weight: 10.0,
              value: 6.0,
            },
            {
              category: "Progress Test",
              item: "Progress Test 1",
              weight: 10.0,
              value: 5.8,
            },
            {
              category: "Progress Test",
              item: "Progress Test 2",
              weight: 10.0,
              value: 6.2,
            },
            {
              category: "Progress Test",
              item: "Progress Test 3",
              weight: 10.0,
              value: 7.0,
            },
            {
              category: "Final Exam",
              item: "Final Exam",
              weight: 40.0,
              value: null,
            },
          ],
        },
        {
          subjectCode: "CSI106",
          subjectName: "Introduction to Computer Science",
          average: 8.5,
          status: "Not Started" as const,
          gradeDetails: [
            {
              category: "Assignments/Exercises",
              item: "Assignment 1",
              weight: 15.0,
              value: 9.0,
            },
            {
              category: "Assignments/Exercises",
              item: "Assignment 2",
              weight: 15.0,
              value: 8.5,
            },
            {
              category: "Progress Test",
              item: "Progress Test 1",
              weight: 20.0,
              value: 8.0,
            },
            {
              category: "Progress Test",
              item: "Progress Test 2",
              weight: 20.0,
              value: 8.8,
            },
            {
              category: "Final Exam",
              item: "Final Exam",
              weight: 30.0,
              value: null,
            },
          ],
        },
        {
          subjectCode: "VOV134",
          subjectName: "Vovinam 1",
          average: 9.2,
          status: "Not Started" as const,
          gradeDetails: [
            {
              category: "Practical",
              item: "Practical 1",
              weight: 30.0,
              value: 9.0,
            },
            {
              category: "Practical",
              item: "Practical 2",
              weight: 30.0,
              value: 9.5,
            },
            {
              category: "Final Exam",
              item: "Final Practical Exam",
              weight: 40.0,
              value: null,
            },
          ],
        },
        {
          subjectCode: "SSL101c",
          subjectName: "Academic Skills for University Success",
          average: 7.2,
          status: "Not Started" as const,
          gradeDetails: [
            {
              category: "Assignments/Exercises",
              item: "Assignment 1",
              weight: 20.0,
              value: 7.5,
            },
            {
              category: "Assignments/Exercises",
              item: "Assignment 2",
              weight: 20.0,
              value: 7.0,
            },
            {
              category: "Progress Test",
              item: "Progress Test",
              weight: 20.0,
              value: 6.8,
            },
            {
              category: "Final Exam",
              item: "Final Exam",
              weight: 40.0,
              value: null,
            },
          ],
        },
      ],
    },
  ],
}

export const sampleAttendance = {
  lastUpdated: "2025-01-04T08:00:00Z",
  semesters: [
    {
      term: "Fall2024",
      courses: [
        {
          subjectCode: "CSI104",
          subjectName: "Introduction to Programming",
          groupName: "SE2001",
          absentSlots: 2,
          totalSlots: 30,
          absentPercentage: 6.7,
          attendanceDetails: [
            {
              no: 1,
              date: "2024-09-02",
              dayOfWeek: "Monday",
              slot: 1,
              time: "7:00-9:15",
              status: "Present" as const,
            },
            {
              no: 2,
              date: "2024-09-04",
              dayOfWeek: "Wednesday",
              slot: 3,
              time: "10:30-12:00",
              status: "Present" as const,
            },
            {
              no: 3,
              date: "2024-09-09",
              dayOfWeek: "Monday",
              slot: 1,
              time: "7:00-9:15",
              status: "Absent" as const,
            },
          ],
        },
        {
          subjectCode: "ENW492c",
          subjectName: "English 4",
          groupName: "SE2004",
          absentSlots: 5,
          totalSlots: 20,
          absentPercentage: 25.0,
          attendanceDetails: [
            {
              no: 1,
              date: "2024-09-07",
              dayOfWeek: "Saturday",
              slot: 2,
              time: "9:30-11:45",
              status: "Present" as const,
            },
            {
              no: 2,
              date: "2024-09-14",
              dayOfWeek: "Saturday",
              slot: 2,
              time: "9:30-11:45",
              status: "Absent" as const,
            },
          ],
        },
      ],
    },
    {
      term: "Spring2025",
      courses: [
        {
          subjectCode: "PRF192",
          subjectName: "Programming Fundamentals",
          groupName: "SE2005",
          absentSlots: 3,
          totalSlots: 20,
          absentPercentage: 15.0,
          attendanceDetails: [
            {
              no: 1,
              date: "2024-12-30",
              dayOfWeek: "Monday",
              slot: 1,
              time: "7:00-9:15",
              status: "Present" as const,
            },
            {
              no: 2,
              date: "2025-01-02",
              dayOfWeek: "Thursday",
              slot: 1,
              time: "7:00-9:15",
              status: "Absent" as const,
            },
          ],
        },
        {
          subjectCode: "MAE101",
          subjectName: "Mathematics for Engineering",
          groupName: "SE2006",
          absentSlots: 1,
          totalSlots: 18,
          absentPercentage: 5.6,
          attendanceDetails: [
            {
              no: 1,
              date: "2024-12-30",
              dayOfWeek: "Monday",
              slot: 3,
              time: "10:30-12:00",
              status: "Present" as const,
            },
          ],
        },
      ],
    },
  ],
}
