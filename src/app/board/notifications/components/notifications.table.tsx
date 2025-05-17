"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Notification } from "@/types/notification.types";
import { formatDate } from "@/lib/utils";

interface NotificationsTableProps {
  notifications: Notification[];
  isLoading: boolean;
}

export function NotificationsTable({ notifications, isLoading }: NotificationsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement ...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">Aucune notification trouvée.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Message</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cours</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Destinataire</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications.map((notification) => (
            <TableRow key={notification.id}>
              <TableCell className="font-medium">{notification.message}</TableCell>
              <TableCell>
                <StatusBadge status={notification.status} />
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="text-left">
                      {notification.emargement.classSession.course.name}
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs space-y-1">
                        <p>Date: {formatDate(notification.emargement.classSession.date)}</p>
                        <p>Début: {notification.emargement.classSession.heureDebut}</p>
                        <p>Fin: {notification.emargement.classSession.heureFin}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>{formatDate(notification.createdAt)}</TableCell>
              <TableCell>{notification.recipient.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: Notification["status"] }) {
  const variant = {
    SENT: "default",
    READ: "success",
    DELETED: "destructive",
  }[status];

  const label = {
    SENT: "Envoyé",
    READ: "Lu",
    DELETED: "Supprimé",
  }[status];

  return <Badge variant={variant as any}>{label}</Badge>;
}
