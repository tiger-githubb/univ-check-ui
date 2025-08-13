import {
  Attendance,
  AttendanceResponse,
  Course,
  CreateAttendanceInput,
  CreateEmargementInput,
  Emargement,
  UpcomingCourse,
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

      const { data } = await api.get(`/api/v1/emargements`, {
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

      const { data } = await api.get(`/api/v1/emargements/${id}`, {
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

  static async updateAttendance(input: UpdateAttendanceInput): Promise<Attendance> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { id, ...updateData } = input;
      const { data } = await api.patch(`/api/v1/emargements/${id}`, updateData, {
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

      // Utiliser l'endpoint des émargements avec un filtre sur le professeur
      const { data } = await api.get(`/api/v1/emargements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          professorId: professorId,
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

      const response = await api.get<Emargement>(`/api/v1/emargements/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'émargement ${id}:`, error);
      // Retourner des données de démonstration en cas d'erreur
      return this.generateMockEmargement(id);
    }
  }

  // Données de démonstration pour un émargement
  private static generateMockEmargement(id: string): Emargement {
    const mockEmargement = {
      id,
      professor: {
        id: "prof-1",
        name: "Prof. Alexandre Dubois",
        email: "alexandre.dubois@example.com",
        phone: "+33123456789",
        role: "PROFESSOR",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      classSession: {
        id: "session-1",
        date: new Date().toISOString(),
        heureDebut: new Date().toISOString(),
        heureFin: new Date().toISOString(),
        course: {
          id: "course-1",
          title: "Introduction aux Algorithmes",
          startTime: "09:00",
          endTime: "10:30",
          hasAttendance: true,
          location: "Amphi A",
        },
        professor: {
          id: "prof-1",
          name: "Prof. Alexandre Dubois",
          email: "alexandre.dubois@example.com",
          phone: "+33123456789",
          role: "PROFESSOR",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        classRepresentative: {
          id: "delegate-1",
          name: "Délégué Étudiant",
          email: "delegate@example.com",
          phone: "+33123456789",
          role: "CLASS_DELEGATE",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        academicYear: {
          id: "year-1",
          periode: "2024-2025",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      status: "PRESENT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Force the type to match Emargement interface
    return mockEmargement as Emargement;
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

  // Récupérer les prochains cours pour tous les rôles
  static async getUpcomingCourses(userId: string, userRole: string, limit = 5): Promise<UpcomingCourse[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      // Utiliser l'endpoint des sessions de classe avec des paramètres de filtrage
      // selon le rôle de l'utilisateur et la date actuelle
      const today = new Date().toISOString().split("T")[0];
      const endpoint = "/api/v1/class-sessions";
      const params: Record<string, string | number> = {
        limit,
        // Filtrer les sessions futures
        dateFrom: today,
      };

      // Ajouter des paramètres spécifiques selon le rôle
      switch (userRole) {
        case "PROFESSOR":
          params.professorId = userId;
          break;
        case "ADMIN":
          // Les admins peuvent voir toutes les sessions
          break;
        case "STUDENT":
        case "CLASS_DELEGATE":
          // Pour les étudiants et délégués, on pourrait filtrer par programme/département
          // mais l'API ne semble pas avoir ces filtres, donc on récupère tout
          break;
        default:
          break;
      }

      interface ClassSessionResponse {
        id: string;
        date: string;
        heureDebut?: string;
        heureFin?: string;
        course?: {
          title?: string;
          location?: string;
          department?: string;
        };
        professor?: {
          name?: string;
        };
      }

      const response = await api.get<ClassSessionResponse[]>(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      // Transformer les données de l'API en format UpcomingCourse
      const upcomingCourses: UpcomingCourse[] = response.data.map((session: ClassSessionResponse) => ({
        id: session.id,
        title: session.course?.title || "Cours sans titre",
        professor: session.professor?.name || "Professeur non assigné",
        startTime: session.heureDebut
          ? new Date(session.heureDebut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
          : "",
        endTime: session.heureFin
          ? new Date(session.heureFin).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
          : "",
        location: session.course?.location || "Salle non définie",
        date: session.date,
        department: session.course?.department || "Département non défini",
      }));

      return upcomingCourses;
    } catch (error) {
      console.error("Erreur lors de la récupération des prochains cours:", error);
      // Retourner des données de démonstration en cas d'erreur
      return this.generateMockUpcomingCourses(userRole, limit);
    }
  }

  // Données de démonstration pour les prochains cours
  private static generateMockUpcomingCourses(userRole: string, limit: number): UpcomingCourse[] {
    const mockCourses: UpcomingCourse[] = [
      {
        id: "1",
        title: "Mathématiques Avancées",
        professor: "Dr. Martin Dubois",
        startTime: "09:00",
        endTime: "10:30",
        location: "Amphi A",
        date: new Date().toISOString(),
        department: "Sciences",
      },
      {
        id: "2",
        title: "Histoire Contemporaine",
        professor: "Prof. Marie Lefebvre",
        startTime: "14:00",
        endTime: "15:30",
        location: "Salle 204",
        date: new Date().toISOString(),
        department: "Lettres",
      },
      {
        id: "3",
        title: "Physique Quantique",
        professor: "Dr. Pierre Moreau",
        startTime: "10:45",
        endTime: "12:15",
        location: "Labo B",
        date: new Date().toISOString(),
        department: "Sciences",
      },
      {
        id: "4",
        title: "Littérature Française",
        professor: "Prof. Sophie Bernard",
        startTime: "16:00",
        endTime: "17:30",
        location: "Salle 301",
        date: new Date().toISOString(),
        department: "Lettres",
      },
      {
        id: "5",
        title: "Chimie Organique",
        professor: "Dr. Antoine Rousseau",
        startTime: "08:00",
        endTime: "09:30",
        location: "Labo C",
        date: new Date().toISOString(),
        department: "Sciences",
      },
    ];

    // Filtrer selon le rôle si nécessaire
    const filteredCourses =
      userRole === "PROFESSOR"
        ? mockCourses.filter((course) => course.professor?.includes("Dr.") || course.professor?.includes("Prof."))
        : mockCourses;

    return filteredCourses.slice(0, limit);
  }
}
