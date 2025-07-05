/**
 * Utilitaire pour tester le système de notifications
 * Ce fichier peut être utilisé pendant les tests pour générer des notifications test
 */

import { NotificationService } from "@/server/services/notification.service";
import { CreateNotificationDto } from "@/types/notification.types";

/**
 * Crée une notification de test
 * @param recipientId - ID du destinataire
 * @param message - Message de la notification
 * @returns Promise avec le résultat de la création
 */
export async function createTestNotification(
  recipientId: string,
  message: string = "Notification de test",
  emargementId?: string
): Promise<boolean> {
  try {
    const notificationData: CreateNotificationDto = {
      recipientId,
      message,
      status: "SENT",
      emargementId: emargementId || "test-emargement-id", // ID factice par défaut
    };

    await NotificationService.createNotification(notificationData);
    return true;
  } catch (error) {
    console.error("Erreur lors de la création de la notification de test:", error);
    return false;
  }
}

/**
 * Génère plusieurs notifications de test
 * @param recipientId - ID du destinataire
 * @param count - Nombre de notifications à créer
 * @returns Promise avec un booléen indiquant le résultat
 */
export async function generateTestNotifications(recipientId: string, count: number = 5): Promise<boolean> {
  try {
    const promises = [];

    for (let i = 0; i < count; i++) {
      const promise = createTestNotification(recipientId, `Notification de test #${i + 1}`, `test-emargement-${i + 1}`);
      promises.push(promise);
    }

    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Erreur lors de la génération des notifications de test:", error);
    return false;
  }
}
