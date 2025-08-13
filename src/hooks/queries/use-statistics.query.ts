import { Department } from "@/types/departments.types";
import { getAuthToken } from "@/utils/auth-utils";
import api from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";

// Types basés sur le Swagger
export interface BusinessStatistics {
  totalEmargements: number;
  professeurPresenceRate: number;
  totalCourses: number;
  pendingEmargementValidations: number;
}

export interface AdminStatistics {
  totalProgrammes: number;
  totalDepartements: number;
  totalCourses: number;
  totalUniversities: number;
  totalProfesseurs: number;
  totalEmargements: number;
}

export interface StatisticsFilters {
  universityId?: string;
  departmentId?: string;
  professorId?: string;
  status?: "PENDING" | "PRESENT" | "ABSENT" | "SUPERVISOR_CONFIRMED" | "CLASS_HEADER_CONFIRMED";
  courseId?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

// Type pour les émargements récents
export interface RecentEmargement {
  id: string;
  professor?: {
    id: string;
    name: string;
    avatar?: string;
  };
  classSession?: {
    id: string;
    date: string;
    heureDebut?: string;
    heureFin?: string;
    courseId?: string; // Ajout du courseId qui peut venir de l'API
    course?: {
      id: string;
      title?: string;
    };
  };
  status: "PRESENT" | "ABSENT" | "PENDING" | "SUPERVISOR_CONFIRMED" | "CLASS_HEADER_CONFIRMED";
  updatedAt: string;
  createdAt: string;
}

// Service pour les statistiques
export class StatisticsService {
  /**
   * Récupérer les statistiques générales (business)
   */
  static async getBusinessStatistics(filters?: StatisticsFilters): Promise<BusinessStatistics> {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Vous devez être connecté pour accéder à cette ressource");
    }

    try {
      const params = new URLSearchParams();

      if (filters?.universityId) params.append("universityId", filters.universityId);
      if (filters?.departmentId) params.append("departmentId", filters.departmentId);
      if (filters?.professorId) params.append("professorId", filters.professorId);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.courseId) params.append("courseId", filters.courseId);
      if (filters?.dateRange?.start) params.append("dateRange[start]", filters.dateRange.start);
      if (filters?.dateRange?.end) params.append("dateRange[end]", filters.dateRange.end);

      const { data } = await api.get(`/api/v1/statistics/business?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques générales:", error);
      throw new Error("Impossible de récupérer les statistiques générales");
    }
  }

  /**
   * Récupérer les statistiques administrateur
   */
  static async getAdminStatistics(filters?: Omit<StatisticsFilters, "professorId" | "status" | "courseId">): Promise<AdminStatistics> {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Vous devez être connecté pour accéder à cette ressource");
    }

    try {
      const params = new URLSearchParams();

      if (filters?.universityId) params.append("universityId", filters.universityId);
      if (filters?.departmentId) params.append("departmentId", filters.departmentId);
      if (filters?.dateRange?.start) params.append("dateRange[start]", filters.dateRange.start);
      if (filters?.dateRange?.end) params.append("dateRange[end]", filters.dateRange.end);

      const { data } = await api.get(`/api/v1/statistics/admin?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques administrateur:", error);
      throw new Error("Impossible de récupérer les statistiques administrateur");
    }
  }

  /**
   * Récupérer les statistiques d'un professeur spécifique
   */
  static async getProfessorStatistics(professorId: string): Promise<BusinessStatistics> {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Vous devez être connecté pour accéder à cette ressource");
    }

    try {
      const { data } = await api.get(`/api/v1/statistics/prof/${professorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des statistiques du professeur ${professorId}:`, error);
      throw new Error("Impossible de récupérer les statistiques du professeur");
    }
  }

  // Service pour récupérer les émargements récents
  static async getRecentEmargements(limit = 10): Promise<RecentEmargement[]> {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Vous devez être connecté pour accéder à cette ressource");
    }

    try {
      // Utiliser l'endpoint avec des paramètres pour inclure les relations
      const { data } = await api.get(`/api/v1/emargements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit,
          // Ajouter des paramètres pour inclure les relations si supporté par l'API
          include: "classSession,professor,classSession.course",
          populate: "classSession.course,professor",
        },
      });

      const emargements = Array.isArray(data) ? data : data.emargements || [];

      // Log pour debug - à supprimer en production
      console.log("Émargements reçus:", JSON.stringify(emargements[0], null, 2));

      // Enrichir les données si les informations de cours sont manquantes
      const enrichedEmargements = await Promise.all(
        emargements.map(async (emargement: RecentEmargement) => {
          // Si le cours n'a pas de title et qu'on a un courseId
          if (emargement.classSession?.courseId && !emargement.classSession?.course?.title) {
            try {
              const courseResponse = await api.get(`/api/v1/courses/${emargement.classSession.courseId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (courseResponse.data && emargement.classSession) {
                emargement.classSession.course = {
                  id: courseResponse.data.id,
                  title: courseResponse.data.title || courseResponse.data.name,
                };
              }
            } catch (courseError) {
              console.warn(`Impossible de récupérer le cours ${emargement.classSession.courseId}:`, courseError);
            }
          }

          return emargement;
        })
      );

      return enrichedEmargements;
    } catch (error) {
      console.error("Erreur lors de la récupération des émargements récents:", error);
      throw new Error("Impossible de récupérer les émargements récents");
    }
  }

  /**
   * Récupérer les départements avec statistiques
   */
  static async getDepartmentsWithStats(): Promise<Department[]> {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Vous devez être connecté pour accéder à cette ressource");
    }

    try {
      const { data } = await api.get("/api/v1/departments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return Array.isArray(data) ? data : data.departments || [];
    } catch (error) {
      console.error("Erreur lors de la récupération des départements:", error);
      throw new Error("Impossible de récupérer les départements");
    }
  }
}

// Query keys étendues
export const statisticsQueryKeys = {
  business: (filters?: StatisticsFilters) => ["statistics", "business", filters],
  admin: (filters?: Omit<StatisticsFilters, "professorId" | "status" | "courseId">) => ["statistics", "admin", filters],
  professor: (professorId: string) => ["statistics", "professor", professorId],
  recentEmargements: (limit?: number) => ["statistics", "recent-emargements", limit],
  departments: () => ["statistics", "departments"],
};

// Hooks React Query
export function useBusinessStatisticsQuery(filters?: StatisticsFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: statisticsQueryKeys.business(filters),
    queryFn: () => StatisticsService.getBusinessStatistics(filters),
    enabled: options?.enabled,
  });
}

export function useAdminStatisticsQuery(
  filters?: Omit<StatisticsFilters, "professorId" | "status" | "courseId">,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: statisticsQueryKeys.admin(filters),
    queryFn: () => StatisticsService.getAdminStatistics(filters),
    enabled: options?.enabled,
  });
}

export function useProfessorStatisticsQuery(professorId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: statisticsQueryKeys.professor(professorId),
    queryFn: () => StatisticsService.getProfessorStatistics(professorId),
    enabled: options?.enabled !== false && !!professorId,
  });
}

export function useRecentEmargementsQuery(limit = 10) {
  return useQuery({
    queryKey: statisticsQueryKeys.recentEmargements(limit),
    queryFn: () => StatisticsService.getRecentEmargements(limit),
  });
}

export function useDepartmentsWithStatsQuery() {
  return useQuery({
    queryKey: statisticsQueryKeys.departments(),
    queryFn: () => StatisticsService.getDepartmentsWithStats(),
  });
}
