import { AcademicYear } from "./academic-year.types";
import { User } from "./user.types";

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


export interface ClassSession {
  id: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  course: Course;
  professor: User;
  classRepresentative: User;
  academicYear: AcademicYear;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSessionResponse {
  classSessions: ClassSession[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateClassSessionInput {
  date: string;
  heureDebut: string;
  heureFin: string;
  academicYearId: string;
  courseId: string;
  professorId: string;
  classRepresentativeId: string;
}

export interface UpdateClassSessionInput {
  id: string;
  date?: string;
  heureDebut?: string;
  heureFin?: string;
  academicYearId?: string;
  courseId?: string;
  professorId?: string;
  classRepresentativeId?: string;
}

export interface Emargement {
  id: string;
  status: "PENDING" | "PRESENT" | "ABSENT" | "SUPERVISOR_CONFIRMED" | "CLASS_HEADER_CONFIRMED";
  classSession: ClassSession;
  professor: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmargementInput {
  status: "PENDING" | "PRESENT" | "ABSENT" | "SUPERVISOR_CONFIRMED" | "CLASS_HEADER_CONFIRMED";
  classSessionId: string;
  professorId: string;
  comments?: string;
}

export interface UpdateEmargementInput {
  id: string;
  status?: "PENDING" | "PRESENT" | "ABSENT" | "SUPERVISOR_CONFIRMED" | "CLASS_HEADER_CONFIRMED";
}
 