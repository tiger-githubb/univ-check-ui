import { Notification } from "@/types/notification.types";
import { getAuthToken } from "@/utils/auth-utils";
import api from "@/utils/axios";

export class NotificationService {
  static async getNotifications(): Promise<Notification[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette ressource");
      }
      const { data } = await api.get(`/api/v1/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      throw error;
    }
  }

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
      throw error;
    }
  }
}
