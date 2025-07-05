import { CreateEmargementInput, Emargement, UpdateEmargementInput } from "@/types/attendance.types";
import { CreateNotificationDto } from "@/types/notification.types";
import { getAuthToken } from "@/utils/auth-utils";
import api from "@/utils/axios";
import { NotificationService } from "./notification.service";

export class EmargementService {
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
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      // Préparer les paramètres de requête
      const params: Record<string, string | number> = {
        page,
        limit,
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
          params.dateFrom = typeof filters.dateFrom === "string" ? filters.dateFrom : filters.dateFrom.toISOString().split("T")[0];
        }
        if (filters.dateTo) {
          params.dateTo = typeof filters.dateTo === "string" ? filters.dateTo : filters.dateTo.toISOString().split("T")[0];
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

      // Après création réussie, on tente de récupérer les infos nécessaires pour la notification
      try {
        const emargementDetails = await EmargementService.getEmargementById(data.id);

        // Tenter de récupérer les administrateurs et le délégué pour les notifications
        // Ces appels devraient être implémentés dans un service utilisateur approprié
        const adminIds = await EmargementService.getAdminUserIds();
        const delegateId = emargementDetails.classSession?.classRepresentative?.id;

        // Envoi de notifications si on a récupéré les ID
        if (adminIds && adminIds.length > 0) {
          for (const adminId of adminIds) {
            await EmargementService.sendNotification({
              recipientId: adminId,
              emargementId: data.id,
              message: `Le professeur ${emargementDetails.professor?.name || "Inconnu"} a émargé pour le cours ${
                emargementDetails.classSession?.course?.title || "Sans titre"
              }`,
              status: "SENT",
            });
          }
        }

        // Notification au délégué si disponible
        if (delegateId) {
          await EmargementService.sendNotification({
            recipientId: delegateId,
            emargementId: data.id,
            message: `Le professeur ${emargementDetails.professor?.name || "Inconnu"} a émargé pour le cours ${
              emargementDetails.classSession?.course?.title || "Sans titre"
            }`,
            status: "SENT",
          });
        }
      } catch (notifError) {
        // On ne fait pas échouer l'émargement si les notifications échouent
        console.error("Erreur lors de l'envoi des notifications:", notifError);
      }

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

  /**
   * Envoie une notification liée à un émargement
   */
  static async sendNotification(notificationData: CreateNotificationDto): Promise<boolean> {
    try {
      return !!(await NotificationService.createNotification(notificationData));
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification:", error);
      return false;
    }
  }

  /**
   * Récupère les IDs de tous les utilisateurs avec rôle ADMIN
   */
  static async getAdminUserIds(): Promise<string[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { data } = await api.get(`/api/v1/users?role=ADMIN`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }); // Supposons que l'API retourne une liste d'utilisateurs
      // On extrait les IDs
      return (data.items || data).map((user: { id: string }) => user.id);
    } catch (error) {
      console.error("Erreur lors de la récupération des admins:", error);
      return [];
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
