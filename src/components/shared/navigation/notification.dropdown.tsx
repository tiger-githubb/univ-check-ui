import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { useUnreadNotificationsQuery, useUpdateNotificationStatusMutation } from "@/hooks/queries/use-notification.query";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Bell, BellRing, Check } from "lucide-react";
import { useEffect, useState } from "react";

export function NotificationDropdown() {
  const { data: user } = useCurrentUser();
  const { data: notifications, isLoading, refetch } = useUnreadNotificationsQuery();
  const { mutate: updateStatus } = useUpdateNotificationStatusMutation();
  const [open, setOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  // Vérifier s'il y a de nouvelles notifications
  useEffect(() => {
    if (notifications?.length) {
      if (notifications.length > notificationsCount) {
        setHasNewNotifications(true);
        setTimeout(() => {
          setHasNewNotifications(false);
        }, 3000); // Désactiver l'animation après 3 secondes
      }
      setNotificationsCount(notifications.length);
    } else {
      setNotificationsCount(0);
    }
  }, [notifications?.length, notificationsCount]);

  // Rafraîchir les notifications périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Toutes les 30 secondes
    return () => clearInterval(interval);
  }, [refetch]);

  const handleMarkAsRead = (id: string) => {
    updateStatus(
      { id, status: "READ" },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  const handleMarkAllAsRead = () => {
    if (!notifications || notifications.length === 0) return;

    // Marquer chaque notification comme lue
    notifications.forEach((notification) => {
      updateStatus(
        { id: notification.id, status: "READ" },
        {
          onSuccess: () => {
            // Ne pas rafraîchir à chaque notification pour éviter trop d'appels
            // On rafraîchira une fois après toutes les mises à jour
          },
        }
      );
    });

    // Rafraîchir après un délai pour laisser le temps aux mutations de s'exécuter
    setTimeout(() => {
      refetch();
    }, 300);
  };

  // Ne pas afficher le composant si l'utilisateur n'est pas connecté
  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {notifications && notifications.length > 0 ? (
            <>
              <BellRing className={cn("h-5 w-5", hasNewNotifications && "text-primary animate-pulse")} />
              <Badge
                className={cn(
                  "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0",
                  hasNewNotifications && "animate-bounce bg-primary"
                )}
              >
                {notifications.length > 9 ? "9+" : notifications.length}
              </Badge>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex gap-2">
            {notifications && notifications.length > 0 && (
              <>
                <Badge variant="outline">
                  {notifications.length} non lue{notifications.length > 1 ? "s" : ""}
                </Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleMarkAllAsRead} title="Tout marquer comme lu">
                  <Check className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">Chargement...</div>
          ) : notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className="p-4 border-b last:border-0 flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm">{notification.message}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(notification.createdAt), "dd/MM HH:mm", { locale: fr })}
                    </span>
                    {notification.status === "SENT" && (
                      <Badge variant="secondary" className="text-xs">
                        Nouveau
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMarkAsRead(notification.id)}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">Aucune notification non lue</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
