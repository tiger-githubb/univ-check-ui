"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiBellLine, RiCheckboxCircleLine, RiInformationLine, RiTimeLine } from "@remixicon/react";
import { toast } from "sonner";

const notifications = [
  {
    id: 1,
    title: "Nouvel émargement",
    message: "Un nouvel émargement a été créé pour le cours de Mathématiques",
    date: "Il y a 5 minutes",
    read: false,
    type: "info",
  },
  {
    id: 2,
    title: "Émargement validé",
    message: "Votre émargement pour le cours d'Informatique a été validé",
    date: "Il y a 1 heure",
    read: false,
    type: "success",
  },
  {
    id: 3,
    title: "Rappel de cours",
    message: "Le cours d'Anglais commence dans 15 minutes",
    date: "Il y a 2 heures",
    read: true,
    type: "reminder",
  },
];

export default function NotificationsDropdown() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification: (typeof notifications)[0]) => {
    // Marquer comme lu ou effectuer une action en fonction du type de notification
    toast.success(`Notification "${notification.title}" ouverte`);
  };

  const handleMarkAllAsRead = () => {
    toast.success("Toutes les notifications ont été marquées comme lues");
  };

  // Fonction pour afficher une démonstration d'une notification
  const showDemoNotification = () => {
    toast.info("Ceci est une démonstration de notification", {
      description: "Vous pouvez personnaliser le contenu et le style des notifications",
      action: {
        label: "Voir",
        onClick: () => console.log("Action clicked"),
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <RiBellLine className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-auto text-xs px-2 py-0.5" onClick={handleMarkAllAsRead}>
                Tout marquer comme lu
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length > 0 ? (
              <>
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="cursor-pointer p-0 focus:bg-transparent">
                    <button
                      className="flex w-full gap-3 px-2 py-3 text-left hover:bg-accent rounded-sm"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        {notification.type === "info" && <RiInformationLine className="text-primary" size={16} />}
                        {notification.type === "success" && <RiCheckboxCircleLine className="text-emerald-500" size={16} />}
                        {notification.type === "reminder" && <RiTimeLine className="text-amber-500" size={16} />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium leading-none">{notification.title}</p>
                          {!notification.read && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground/70">{notification.date}</p>
                      </div>
                    </button>
                  </DropdownMenuItem>
                ))}
              </>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">Aucune notification</p>
              </div>
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer justify-center text-center" onClick={showDemoNotification}>
            <span className="text-xs font-medium">Afficher une notification démo</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
