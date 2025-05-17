import { NotificationService } from "@/server/services/notification.service";
import { Notification } from "@/types/notification.types";
import { useQuery } from "@tanstack/react-query";

export const notificationQueryKeys = {
  notifications: ["notifications"],
  notification: (id: string) => ["notification", id],
};

export function useNotificationsQuery() {
  return useQuery<Notification[]>({
    queryKey: notificationQueryKeys.notifications,
    queryFn: () => NotificationService.getNotifications(),
  });
}

export function useNotificationQuery(id: string) {
  return useQuery<Notification>({
    queryKey: notificationQueryKeys.notification(id),
    queryFn: () => NotificationService.getNotificationById(id),
    enabled: !!id,
  });
}
