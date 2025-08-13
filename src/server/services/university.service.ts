import { CreateUniversityInput, University, UpdateUniversityInput } from "@/types/university.types";
import { getAuthToken } from "@/utils/auth-utils";
import api from "@/utils/axios";

export class UniversityService {
  static async getUniversities(): Promise<University[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { data } = await api.get(`/api/v1/universities`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des universités:", error);
      throw new Error("Impossible de récupérer les universités");
    }
  }

  static async getUniversityById(id: string): Promise<University> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { data } = await api.get(`/api/v1/universities/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'université ${id}:`, error);
      throw new Error("Impossible de récupérer l'université");
    }
  }

  static async createUniversity(input: CreateUniversityInput): Promise<University> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { organisation, responsable, ...rest } = input;
      const result = { ...rest, organisationId: organisation, responsableId: responsable };

      const { data } = await api.post("/api/v1/universities", result, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      console.error("Erreur lors de la création de l'université:", error);
      throw new Error("Impossible de créer l'université");
    }
  }

  static async updateUniversity(input: UpdateUniversityInput): Promise<University> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { id, organisation, responsable, ...rest } = input;
      const result = { ...rest, organisationId: organisation, responsableId: responsable };

      const { data } = await api.put(`/api/v1/universities/${id}`, result, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'université ${input.id}:`, error);
      throw new Error("Impossible de mettre à jour l'université");
    }
  }

  static async deleteUniversity(id: string): Promise<void> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      await api.delete(`/api/v1/universities/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'université ${id}:`, error);
      throw new Error("Impossible de supprimer l'université");
    }
  }
}
