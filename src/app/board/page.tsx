"use client";

import { PageHeader } from "@/components/shared/page-header";
import { useBreadcrumb } from "@/contexts/breadcrumb.context";
import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { useEffect } from "react";
import { PiHouseDuotone } from "react-icons/pi";
import { DynamicStatsGrid } from "./components/dynamic-stats-grid";
import { RecentAttendances } from "./components/recent-attendances";

export default function Page() {
  const { setPageTitle } = useBreadcrumb();
  // Get the current user data using the useCurrentUser hook
  const { data: user } = useCurrentUser();

  useEffect(() => {
    setPageTitle("Tableau de bord");
  }, [setPageTitle]);

  const connectedUserText = "Bonjour, " + user?.user?.name || "Utilisateur";
  const pageSubTitle =
    user?.user?.role === "ADMIN"
      ? "Voici un aperçu de la gestion des émargements universitaires."
      : "Voici un aperçu de vos cours et émargements. Suivez vos présences en temps réel !";

  return (
    <div>
      <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6">
        <PageHeader icon={<PiHouseDuotone className="text-primary" />} title={connectedUserText} subtitle={pageSubTitle} />
        {/* Statistiques dynamiques */}
        <DynamicStatsGrid />
        {/* Émargements récents et statistiques */}
        <div className="flex-1">
          <RecentAttendances />
        </div>
      </div>
    </div>
  );
}
