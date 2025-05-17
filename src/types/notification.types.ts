import { Attendance } from './attendance.types';
import { User } from './user.types';

export type NotificationStatus = 'SENT' | 'READ' | 'DELETED';

export interface Notification {
  id: string;
  message: string;
  status: NotificationStatus;
  emargement: Attendance;
  recipient: User;
  createdAt: string;
  updatedAt: string;
}

export type NotificationResponse = Notification[];
