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

      // Normaliser différents formats de réponses potentiels
      let classSessions: ClassSession[] = [];
      if (Array.isArray(data)) {
        classSessions = data;
      } else if (data && Array.isArray(data.classSessions)) {
        classSessions = data.classSessions;
      } else if (data && Array.isArray(data.data)) {
        classSessions = data.data;
      } else {
        console.warn("Format inattendu pour /class-sessions:", data);
        classSessions = [];
      }

      return {
        classSessions,
        total: typeof (data?.total) === "number" ? data.total : classSessions.length,
        page: typeof (data?.page) === "number" ? data.page : 1,
        limit: typeof (data?.limit) === "number" ? data.limit : classSessions.length,
      };
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
   * Récupérer les sessions de cours pour un professeur spécifique
   * Utilise l'endpoint général /api/v1/class-sessions et filtre côté client
   */
  static async getProfessorClassSessions(professorId: string, startDate?: string, endDate?: string): Promise<ClassSession[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      console.log(`🔍 Récupération des sessions pour le professeur ${professorId} (${startDate} - ${endDate})`);

      // Récupérer toutes les sessions depuis l'endpoint général
      const { data } = await api.get(`/api/v1/class-sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📊 Données brutes de l'API:", data);

      // L'API peut retourner soit un array directement, soit un objet avec des métadonnées
      let allSessions: ClassSession[] = [];

      if (Array.isArray(data)) {
        allSessions = data;
      } else if (data && Array.isArray(data.classSessions)) {
        allSessions = data.classSessions;
      } else if (data && Array.isArray(data.data)) {
        allSessions = data.data;
      } else {
        console.warn("Format de données inattendu:", data);
        return [];
      }

      console.log(`📚 ${allSessions.length} sessions totales trouvées`);

      // Filtrer les sessions pour le professeur spécifique
      let professorSessions = allSessions.filter((session: ClassSession) => {
        const match = session.professor?.id === professorId;
        if (match) {
          console.log(`✅ Session trouvée pour le prof:`, {
            id: session.id,
            date: session.date,
            course: session.course?.title,
            professor: session.professor?.name,
          });
        }
        return match;
      });

      console.log(`👨‍🏫 ${professorSessions.length} sessions trouvées pour le professeur ${professorId}`);

      // Filtrer par dates si spécifiées
      if (startDate || endDate) {
        professorSessions = professorSessions.filter((session: ClassSession) => {
          const sessionDate = new Date(session.date);
          let includeSession = true;

          if (startDate && sessionDate < new Date(startDate)) {
            includeSession = false;
          }
          if (endDate && sessionDate > new Date(endDate)) {
            includeSession = false;
          }

          return includeSession;
        });

        console.log(`📅 ${professorSessions.length} sessions après filtrage par dates`);
      }

      return professorSessions;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des sessions de cours pour le professeur ${professorId}:`, error);
      throw error; // Relancer l'erreur pour que React Query puisse la gérer
    }
  }

  /**
   * Récupérer les cours du jour pour un professeur
   * Basé sur l'endpoint général /api/v1/class-sessions
   */
  static async getProfessorTodaysCourses(professorId: string): Promise<Course[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      console.log(`🔍 Récupération des cours du jour pour le professeur ${professorId}`);

      // Récupérer toutes les sessions
      const { data } = await api.get(`/api/v1/class-sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📊 Données brutes de l'API (cours du jour):", data);

      // L'API peut retourner soit un array directement, soit un objet avec des métadonnées
      let allSessions: ClassSession[] = [];

      if (Array.isArray(data)) {
        allSessions = data;
      } else if (data && Array.isArray(data.classSessions)) {
        allSessions = data.classSessions;
      } else if (data && Array.isArray(data.data)) {
        allSessions = data.data;
      } else {
        console.warn("Format de données inattendu pour les cours du jour:", data);
        return [];
      }

      // Filtrer pour le professeur et la date du jour
      const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
      console.log(`📅 Date du jour: ${today}`);

      const todaysSessions = allSessions.filter((session: ClassSession) => {
        const isToday = session.date === today;
        const isProfessor = session.professor?.id === professorId;
        const match = isToday && isProfessor;

        if (match) {
          console.log(`✅ Cours trouvé pour aujourd'hui:`, {
            id: session.id,
            course: session.course?.title,
            time: `${session.heureDebut} - ${session.heureFin}`,
            professor: session.professor?.name,
          });
        }

        return match;
      });

      console.log(`📚 ${todaysSessions.length} cours trouvés pour aujourd'hui`);

      // Transformer les données pour correspondre au type Course[]
      return todaysSessions.map((session: ClassSession) => ({
        id: session.id,
        title: session.course?.title || "Sans titre",
        startTime: session.heureDebut,
        endTime: session.heureFin,
        location: session.course?.location || "Non spécifié",
        hasAttendance: false, // À implémenter selon les émargements
      }));
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des cours du jour pour le professeur ${professorId}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer les cours de la semaine pour un professeur
   * Basé sur l'endpoint général /api/v1/class-sessions
   */
  static async getProfessorWeekCourses(professorId: string, startDate: string): Promise<Course[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      console.log(`🔍 Récupération des cours de la semaine pour le professeur ${professorId} (${startDate})`);

      // Récupérer toutes les sessions
      const { data } = await api.get(`/api/v1/class-sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📊 Données brutes de l'API (cours de la semaine):", data);

      // L'API peut retourner soit un array directement, soit un objet avec des métadonnées
      let allSessions: ClassSession[] = [];

      if (Array.isArray(data)) {
        allSessions = data;
      } else if (data && Array.isArray(data.classSessions)) {
        allSessions = data.classSessions;
      } else if (data && Array.isArray(data.data)) {
        allSessions = data.data;
      } else {
        console.warn("Format de données inattendu pour les cours de la semaine:", data);
        return [];
      }

      // Calculer la date de fin de semaine (6 jours après startDate)
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      const endDateStr = endDate.toISOString().split("T")[0];

      console.log(`📅 Période de la semaine: ${startDate} - ${endDateStr}`);

      // Filtrer pour le professeur et la semaine spécifiée
      const weekSessions = allSessions.filter((session: ClassSession) => {
        const inDateRange = session.date >= startDate && session.date <= endDateStr;
        const isProfessor = session.professor?.id === professorId;
        const match = inDateRange && isProfessor;

        if (match) {
          console.log(`✅ Cours trouvé pour la semaine:`, {
            id: session.id,
            date: session.date,
            course: session.course?.title,
            time: `${session.heureDebut} - ${session.heureFin}`,
            professor: session.professor?.name,
          });
        }

        return match;
      });

      console.log(`📚 ${weekSessions.length} cours trouvés pour la semaine`);

      // Transformer les données pour correspondre au type Course[]
      return weekSessions.map((session: ClassSession) => ({
        id: session.id,
        title: session.course?.title || "Sans titre",
        startTime: session.heureDebut,
        endTime: session.heureFin,
        location: session.course?.location || "Non spécifié",
        hasAttendance: false, // À implémenter selon les émargements
      }));
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des cours de la semaine pour le professeur ${professorId}:`, error);
      throw error;
    }
  }
}
