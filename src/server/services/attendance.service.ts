import {
  Attendance,
  AttendanceResponse,
  Course,
  CreateAttendanceInput,
  CreateEmargementInput,
  Emargement,
  UpdateAttendanceInput,
  UpdateEmargementInput,
} from "@/types/attendance.types";
import { getAuthToken } from "@/utils/auth-utils";
import api from "@/utils/axios";
import { ClassSessionService } from "./class-session.service";
import { EmargementService } from "./emargement.service";

export class AttendanceService {
  static async getAttendances(page = 1, limit = 10): Promise<AttendanceResponse> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { data } = await api.get(`/api/v1/attendances`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { page, limit },
      });

      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des émargements:", error);
      throw new Error("Impossible de récupérer les émargements");
    }
  }

  static async getAttendanceById(id: string): Promise<Attendance> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { data } = await api.get(`/api/v1/attendances/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'émargement ${id}:`, error);
      throw new Error("Impossible de récupérer l'émargement");
    }
  }

  static async createAttendance(input: CreateAttendanceInput): Promise<Attendance> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { data } = await api.post(`/api/v1/attendances`, input, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      console.error("Erreur lors de la création de l'émargement:", error);
      throw new Error("Impossible de créer l'émargement");
    }
  }

  static async updateAttendance(input: UpdateAttendanceInput): Promise<Attendance> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { id, ...updateData } = input;
      const { data } = await api.patch(`/api/v1/attendances/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'émargement:`, error);
      throw new Error("Impossible de mettre à jour l'émargement");
    }
  }

  static async getProfessorAttendances(professorId: string): Promise<Attendance[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { data } = await api.get(`/api/v1/attendances/professor/${professorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des émargements du professeur:`, error);
      throw new Error("Impossible de récupérer les émargements du professeur");
    }
  }

  static async getProfessorTodaysCourses(professorId: string): Promise<Course[]> {
    // Utiliser le service dédié aux sessions de classe
    return ClassSessionService.getProfessorTodaysCourses(professorId);
  }

  static async getEmargements(
    page = 1,
    limit = 10,
    filters?: {
      professorName?: string;
      courseTitle?: string;
      dateFrom?: Date | string;
      dateTo?: Date | string;
      status?: string;
    }
  ): Promise<{ emargements: Emargement[]; total: number }> {
    return EmargementService.getEmargements(page, limit, filters);
  }

  static async getEmargementById(id: string): Promise<Emargement> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { data } = await api.get(`/api/v1/emargements/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'émargement ${id}:`, error);
      throw new Error("Impossible de récupérer les détails de l'émargement");
    }
  }

  static async createEmargement(input: CreateEmargementInput): Promise<Emargement> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { data } = await api.post(`/api/v1/emargements`, input, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      console.error("Erreur lors de la création de l'émargement:", error);
      throw new Error("Impossible de créer l'émargement");
    }
  }

  static async updateEmargement(input: UpdateEmargementInput): Promise<Emargement> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { id, ...updateData } = input;
      const { data } = await api.put(`/api/v1/emargements/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'émargement ${input.id}:`, error);
      throw new Error("Impossible de mettre à jour l'émargement");
    }
  }

  static async updateEmargementStatus(id: string, status: string): Promise<boolean> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      await api.patch(`/api/v1/emargements/status/${id}/${status}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return true;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut de l'émargement ${id}:`, error);
      throw new Error("Impossible de mettre à jour le statut de l'émargement");
    }
  }

  // Méthode pour récupérer les cours du professeur pour une semaine donnée
  static async getProfessorWeekCourses(professorId: string, startDate: string): Promise<Course[]> {
    // Utiliser le service dédié aux sessions de classe
    return ClassSessionService.getProfessorWeekCourses(professorId, startDate);
  }
}
