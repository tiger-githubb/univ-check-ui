"use client";

import { FilterValues } from "@/app/board/attendance-admin/components/advanced-filter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Emargement } from "@/types/attendance.types";
import { RiBellLine } from "@remixicon/react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface NotificationSystemProps {
  emargements: Emargement[];
  onRefresh: () => void;
  refreshInterval?: number; // en millisecondes
  filters?: FilterValues;
}

export function NotificationSystem({ emargements, onRefresh, refreshInterval = 60000 }: NotificationSystemProps) {
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [newEmargements, setNewEmargements] = useState<number>(0);
  const [hasNotifications, setHasNotifications] = useState<boolean>(false);

  // Fonction pour gérer le rafraîchissement automatique des données
  useEffect(() => {
    // À l'initialisation, on enregistre le nombre actuel d'émargements
    let initialCount = emargements.length;

    // Timer de rafraîchissement automatique
    const timer = setInterval(() => {
      onRefresh();
      // Après chaque rafraîchissement, on vérifie s'il y a de nouveaux émargements
      if (emargements.length > initialCount) {
        const newCount = emargements.length - initialCount;
        setNewEmargements(newCount);
        setHasNotifications(true);

        // Notification visuelle
        toast.info(`${newCount} ${newCount > 1 ? "nouveaux émargements" : "nouvel émargement"} reçu${newCount > 1 ? "s" : ""}`);
      }

      initialCount = emargements.length;
      setLastChecked(new Date());
    }, refreshInterval);

    return () => clearInterval(timer);
  }, [refreshInterval, onRefresh, emargements.length]);

  // Fonction pour marquer les notifications comme lues
  const handleClearNotifications = () => {
    setHasNotifications(false);
    setNewEmargements(0);
  };

  // Fonction pour rafraîchir manuellement
  const handleManualRefresh = () => {
    onRefresh();
    setLastChecked(new Date());
    toast.success("Données rafraîchies avec succès");
  };

  return (
    <Card className={`p-4 mb-4 border ${hasNotifications ? "border-primary" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RiBellLine className={`${hasNotifications ? "text-primary animate-pulse" : "text-muted-foreground"}`} size={20} />
          <div>
            <h3 className="text-sm font-medium">Système de notifications</h3>
            <p className="text-xs text-muted-foreground">Dernière mise à jour: {format(lastChecked, "HH:mm:ss", { locale: fr })}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasNotifications && (
            <Button variant="outline" size="sm" onClick={handleClearNotifications}>
              Marquer comme lu ({newEmargements})
            </Button>
          )}
          <Button variant="default" size="sm" onClick={handleManualRefresh}>
            Actualiser maintenant
          </Button>
        </div>
      </div>

      <div className="mt-2 text-sm">
        <p>
          {emargements.length > 0
            ? `${emargements.length} émargement${emargements.length > 1 ? "s" : ""} disponible${emargements.length > 1 ? "s" : ""}`
            : "Aucun émargement disponible actuellement"}
        </p>
      </div>
    </Card>
  );
}
