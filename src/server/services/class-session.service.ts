import {
  ClassSession,
  ClassSessionResponse,
  Course,
  CreateClassSessionInput,
  UpdateClassSessionInput,
} from "@/types/attendance.types";
import { getAuthToken } from "@/utils/auth-utils";
import api from "@/utils/axios";

export class ClassSessionService {
  /**
   * Récupérer toutes les sessions de cours avec pagination
   */
  static async getClassSessions(): Promise<ClassSessionResponse> {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Vous devez être connecté pour accéder à cette ressource");
    }

    try {
      const { data } = await api.get(`/api/v1/class-sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des sessions de cours:", error);
      throw new Error("Impossible de récupérer les sessions de cours");
    }
  }

  /**
   * Récupérer une session de cours spécifique par son ID
   */
  static async getClassSessionById(id: string): Promise<ClassSession> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { data } = await api.get(`/api/v1/class-sessions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la session de cours ${id}:`, error);
      throw new Error("Impossible de récupérer les détails de la session de cours");
    }
  }

  /**
   * Créer une nouvelle session de cours
   */
  static async createClassSession(input: CreateClassSessionInput): Promise<ClassSession> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { data } = await api.post(`/api/v1/class-sessions`, input, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      console.error("Erreur lors de la création de la session de cours:", error);
      throw new Error("Impossible de créer la session de cours");
    }
  }

  /**
   * Mettre à jour une session de cours existante
   */
  static async updateClassSession(input: UpdateClassSessionInput): Promise<ClassSession> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { id, ...updateData } = input;
      const { data } = await api.put(`/api/v1/class-sessions/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la session de cours ${input.id}:`, error);
      throw new Error("Impossible de mettre à jour la session de cours");
    }
  }

  /**
   * Supprimer une session de cours
   */
  static async deleteClassSession(id: string): Promise<boolean> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      await api.delete(`/api/v1/class-sessions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la session de cours ${id}:`, error);
      throw new Error("Impossible de supprimer la session de cours");
    }
  }

  /**
   * Récupérer les sessions de cours d'un professeur
   */
  static async getProfessorClassSessions(professorId: string, startDate?: string, endDate?: string): Promise<ClassSession[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const params: Record<string, string> = { professorId };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await api.get(`/api/v1/class-sessions/professor/${professorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des sessions de cours pour le professeur ${professorId}:`, error);
      throw new Error("Impossible de récupérer les sessions de cours du professeur");
    }
  }

  /**
   * Récupérer les cours du jour pour un professeur
   */
  static async getProfessorTodaysCourses(professorId: string): Promise<Course[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { data } = await api.get(`/api/v1/class-sessions/professor/${professorId}/today`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transformer les données pour correspondre au type Course[]
      return data.map(
        (session: {
          id: string;
          course?: { title: string };
          heureDebut: string;
          heureFin: string;
          location?: string;
          emargement?: unknown;
        }) => ({
          id: session.id,
          title: session.course?.title || "Sans titre",
          startTime: session.heureDebut,
          endTime: session.heureFin,
          location: session.location || "Non spécifié",
          hasAttendance: !!session.emargement,
        })
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération des cours du jour pour le professeur ${professorId}:`, error);
      throw new Error("Impossible de récupérer les cours du jour");
    }
  }

  /**
   * Récupérer les cours de la semaine pour un professeur
   */
  static async getProfessorWeekCourses(professorId: string, startDate: string): Promise<Course[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { data } = await api.get(`/api/v1/class-sessions/professor/${professorId}/week`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { startDate },
      });

      // Transformer les données pour correspondre au type Course[]
      return data.map(
        (session: {
          id: string;
          course?: { title: string };
          heureDebut: string;
          heureFin: string;
          location?: string;
          emargement?: unknown;
        }) => ({
          id: session.id,
          title: session.course?.title || "Sans titre",
          startTime: session.heureDebut,
          endTime: session.heureFin,
          location: session.location || "Non spécifié",
          hasAttendance: !!session.emargement,
        })
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération des cours de la semaine pour le professeur ${professorId}:`, error);
      throw new Error("Impossible de récupérer les cours de la semaine");
    }
  }
}
