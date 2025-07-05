import { Emargement } from "./attendance.types";
import { User } from "./user.types";

export type NotificationStatus = "SENT" | "CONFIRMED" | "RECEIVED" | "READ" | "DELETED";

export interface Notification {
  id: string;
  message: string;
  status: NotificationStatus;
  emargement?: Emargement;
  recipient: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationDto {
  message: string;
  status: NotificationStatus;
  emargementId: string;
  recipientId: string;
}

export interface UpdateNotificationDto {
  id: string;
  status?: NotificationStatus;
  message?: string;
}
