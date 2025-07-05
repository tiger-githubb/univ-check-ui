import { NotificationService } from "@/server/services/notification.service";
import { CreateNotificationDto, Notification } from "@/types/notification.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const notificationQueryKeys = {
  notifications: ["notifications"],
  notification: (id: string) => ["notification", id],
  unreadNotifications: ["notifications", "unread"],
};

export function useNotificationsQuery(page = 1, limit = 10) {
  return useQuery<{ notifications: Notification[]; total: number }>({
    queryKey: [...notificationQueryKeys.notifications, page, limit],
    queryFn: () => NotificationService.getNotifications(page, limit),
  });
}

export function useNotificationQuery(id: string) {
  return useQuery<Notification>({
    queryKey: notificationQueryKeys.notification(id),
    queryFn: () => NotificationService.getNotificationById(id),
    enabled: !!id,
  });
}

export function useUnreadNotificationsQuery() {
  return useQuery<Notification[]>({
    queryKey: notificationQueryKeys.unreadNotifications,
    queryFn: () => NotificationService.getUnreadNotifications(),
  });
}

export function useCreateNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateNotificationDto) => NotificationService.createNotification(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.notifications });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadNotifications });
    },
  });
}

export function useUpdateNotificationStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => NotificationService.updateNotificationStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.notification(variables.id) });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.notifications });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadNotifications });
    },
  });
}
