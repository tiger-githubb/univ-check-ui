"use client";

import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { RecentAttendances } from "./components/recent-attendances";
import { StatsGrid } from "./components/stats-grid";
import { useBreadcrumb } from "@/contexts/breadcrumb.context";
import { useEffect } from "react";
import { PiHouseDuotone } from "react-icons/pi";
import { PageHeader } from "@/components/shared/page-header";

export default function Page() {
  const { setPageTitle } = useBreadcrumb();
  // Get the current user data using the useCurrentUser hook
  const { data: user } = useCurrentUser();

  useEffect(() => {
    setPageTitle("Tableau de bord");
  }, [setPageTitle]);

  const connectedUserText = "Bonjour, " + user?.user?.name || "Utilisateur";
  const pageSubTitle = user?.user?.role === "ADMIN"
    ? "Voici un aperçu de la gestion des émargements universitaires."
    : "Voici un aperçu de vos cours et émargements. Suivez vos présences en temps réel !";

  return (
    <div>
      <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6">
        <PageHeader
          icon={<PiHouseDuotone className="text-primary" />}
          title={connectedUserText}
          subtitle={pageSubTitle}
        />
        {/* Numbers */}{" "}
        <StatsGrid
          stats={[
            {
              title: "Émargements",
              value: "1,256",
              change: {
                value: "+8%",
                trend: "up",
              },
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor">
                  <path d="M15 2H4.995C3.895 2 3 2.895 3 3.995V16.005C3 17.105 3.893 18 4.993 18H15c1.1 0 2-.895 2-1.995V3.995C17 2.895 16.105 2 15 2zm-3 10H8c-.552 0-1-.448-1-1s.448-1 1-1h4c.552 0 1 .448 1 1s-.448 1-1 1zm3-4H7c-.552 0-1-.448-1-1s.448-1 1-1h8c.552 0 1 .448 1 1s-.448 1-1 1z" />
                </svg>
              ),
            },
            {
              title: "Taux de Présence",
              value: "87%",
              change: {
                value: "+3%",
                trend: "up",
              },
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width={18} height={19} fill="currentColor">
                  <path d="M9 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm-2 8c0-1.1.9-2 2-2h6a2 2 0 0 1 2 2v1H4v-1z" />
                </svg>
              ),
            },
            {
              title: "Cours Programmés",
              value: "428",
              change: {
                value: "+12%",
                trend: "up",
              },
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor">
                  <path d="M7 2v2h6V2h2v2h1.5A1.5 1.5 0 0 1 18 5.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 16.5v-11A1.5 1.5 0 0 1 3.5 4H5V2h2zm9 6H4v8.5c0 .28.22.5.5.5h11a.5.5 0 0 0 .5-.5V8zM6 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                </svg>
              ),
            },
            {
              title: "Validation en Attente",
              value: "27",
              change: {
                value: "-15%",
                trend: "down",
              },
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width={21} height={21} fill="currentColor">
                  <path d="M13 2a2 2 0 0 0-1.88 1.32l-.014-.02A2 2 0 0 0 9.99 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1.01a2 2 0 0 0-1.98-3zm0 2a.5.5 0 0 1 0 1h-4a.5.5 0 0 1 0-1h4zm-1 6.672-3.636 3.636-1.414-1.414L8.364 14.3l1.414 1.415 2.222-2.222L13.414 15l-1.414 1.414L8.364 12.78 7.657 12l.707-.707 3.636-3.636L13.414 9l-2.414 2.415z" />
                </svg>
              ),
            },
          ]}
        />{" "}
        {/* Émargements récents et statistiques */}
        <div className="flex-1">
          <RecentAttendances />
        </div>
      </div>
    </div>
  );
}
