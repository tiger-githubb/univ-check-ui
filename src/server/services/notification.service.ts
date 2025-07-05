import { CreateNotificationDto, Notification } from "@/types/notification.types";
import { getAuthToken } from "@/utils/auth-utils";
import api from "@/utils/axios";

export class NotificationService {
  /**
   * Récupérer toutes les notifications avec pagination
   */
  static async getNotifications(page = 1, limit = 10): Promise<{ notifications: Notification[]; total: number }> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { data } = await api.get(`/api/v1/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { page, limit },
      });

      return {
        notifications: data.items || data,
        total: data.total || (data.items ? data.items.length : data.length),
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      throw new Error("Impossible de récupérer les notifications");
    }
  }

  /**
   * Récupérer une notification spécifique par son ID
   */
  static async getNotificationById(id: string): Promise<Notification> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }

      const { data } = await api.get(`/api/v1/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la notification ${id}:`, error);
      throw new Error("Impossible de récupérer les détails d
