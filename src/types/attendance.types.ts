import { Course } from "./course.types"
import { AcademicYear } from "./academic-year.types"
import { User } from "./user.types"

export interface ClassSession {
  id: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  academicYear: AcademicYear;
  course: Course;
  professor: User;
  classRepresentative: User;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  professorId: string;
  courseId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  classSession: ClassSession;
  professor: User;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceResponse {
  attendances: Attendance[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateAttendanceInput {
  courseId: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  comments?: string;
}

export interface UpdateAttendanceInput {
  id: string;
  status?: "PRESENT" | "ABSENT" | "LATE";
  comments?: string;
}

 