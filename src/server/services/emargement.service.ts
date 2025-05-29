import { getAuthToken } from "@/utils/auth-utils";
import api from "@/utils/axios";
import { CreateEmargementInput, Emargement, UpdateEmargementInput } from "@/types/attendance.types";

export class EmargementService {  static async getEmargements(
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
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      // Préparer les paramètres de requête
      const params: Record<string, string | number> = { 
        page, 
        limit 
      };

      // Ajouter les filtres s'ils sont présents
      if (filters) {
        if (filters.professorName) {
          params.professorName = filters.professorName;
        }
        if (filters.courseTitle) {
          params.courseTitle = filters.courseTitle;
        }
        if (filters.dateFrom) {
          params.dateFrom = typeof filters.dateFrom === 'string' 
            ? filters.dateFrom 
            : filters.dateFrom.toISOString().split('T')[0];
        }
        if (filters.dateTo) {
          params.dateTo = typeof filters.dateTo === 'string' 
            ? filters.dateTo 
            : filters.dateTo.toISOString().split('T')[0];
        }
        if (filters.status) {
          params.status = filters.status;
        }
      }

      const { data } = await api.get(`/api/v1/emargements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      return {
        emargements: data.items || data,
        total: data.total || (data.items ? data.items.length : data.length),
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des émargements:", error);
      throw new Error("Impossible de récupérer les émargements");
    }
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

  static async deleteEmargement(id: string): Promise<boolean> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      await api.delete(`/api/v1/emargements/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'émargement ${id}:`, error);
      throw new Error("Impossible de supprimer l'émargement");
    }
  }
  
  static async getEmargementsByClassSession(classSessionId: string): Promise<Emargement[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { data } = await api.get(`/api/v1/emargements/session/${classSessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des émargements pour la session ${classSessionId}:`, error);
      throw new Error("Impossible de récupérer les émargements pour cette session");
    }
  }
  
  static async getEmargementsByProfessor(professorId: string): Promise<Emargement[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { data } = await api.get(`/api/v1/emargements/professor/${professorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des émargements pour le professeur ${professorId}:`, error);
      throw new Error("Impossible de récupérer les émargements pour ce professeur");
    }
  }
}
