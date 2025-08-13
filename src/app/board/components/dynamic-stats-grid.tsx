"use client";

import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import {
  useAdminStatisticsQuery,
  useBusinessStatisticsQuery,
  useProfessorStatisticsQuery,
} from "@/hooks/queries/use-statistics.query";
import { useMemo } from "react";

export function DynamicStatsGrid() {
  const { data: user } = useCurrentUser();
  const userRole = user?.user?.role;
  const userId = user?.user?.id;

  // Requêtes conditionnelles selon le rôle
  const { data: businessStats, isLoading: isBusinessLoading } = useBusinessStatisticsQuery(undefined, {
    enabled: userRole === "ADMIN" || userRole === "SUPERVISOR",
  });

  const { data: adminStats, isLoading: isAdminLoading } = useAdminStatisticsQuery(undefined, {
    enabled: userRole === "ADMIN",
  });

  const { data: professorStats, isLoading: isProfessorLoading } = useProfessorStatisticsQuery(userId || "", {
    enabled: userRole === "TEACHER" && !!userId,
  });

  // Transformer les données selon le rôle
  const stats = useMemo(() => {
    const isLoading = isBusinessLoading || isAdminLoading || isProfessorLoading;

    if (isLoading) {
      return [
        {
          title: "Chargement...",
          value: "...",
          change: { value: "...", trend: "up" as const },
          icon: <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />,
        },
      ];
    }

    if (userRole === "ADMIN" && adminStats && businessStats) {
      return [
        {
          title: "Émargements",
          value: businessStats.totalEmargements.toLocaleString(),
          change: {
            value: "+8%",
            trend: "up" as const,
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor">
              <path d="M15 2H4.995C3.895 2 3 2.895 3 3.995V16.005C3 17.105 3.893 18 4.993 18H15c1.1 0 2-.895 2-1.995V3.995C17 2.895 16.105 2 15 2zm-3 10H8c-.552 0-1-.448-1-1s.448-1 1-1h4c.552 0 1 .448 1 1s-.448 1-1 1zm3-4H7c-.552 0-1-.448-1-1s.448-1 1-1h8c.552 0 1 .448 1 1s-.448 1-1 1z" />
            </svg>
          ),
        },
        {
          title: "Taux de Présence",
          value: `${Math.round(businessStats.professeurPresenceRate)}%`,
          change: {
            value: "+3%",
            trend: "up" as const,
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={19} fill="currentColor">
              <path d="M9 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm-2 8c0-1.1.9-2 2-2h6a2 2 0 0 1 2 2v1H4v-1z" />
            </svg>
          ),
        },
        {
          title: "Cours Programmés",
          value: businessStats.totalCourses.toLocaleString(),
          change: {
            value: "+12%",
            trend: "up" as const,
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor">
              <path d="M7 2v2h6V2h2v2h1.5A1.5 1.5 0 0 1 18 5.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 16.5v-11A1.5 1.5 0 0 1 3.5 4H5V2h2zm9 6H4v8.5c0 .28.22.5.5.5h11a.5.5 0 0 0 .5-.5V8zM6 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </svg>
          ),
        },
        {
          title: "Validations en Attente",
          value: businessStats.pendingEmargementValidations.toLocaleString(),
          change: {
            value: "-15%",
            trend: "down" as const,
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={21} height={21} fill="currentColor">
              <path d="M13 2a2 2 0 0 0-1.88 1.32l-.014-.02A2 2 0 0 0 9.99 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1.01a2 2 0 0 0-1.98-3zm0 2a.5.5 0 0 1 0 1h-4a.5.5 0 0 1 0-1h4zm-1 6.672-3.636 3.636-1.414-1.414L8.364 14.3l1.414 1.415 2.222-2.222L13.414 15l-1.414 1.414L8.364 12.78 7.657 12l.707-.707 3.636-3.636L13.414 9l-2.414 2.415z" />
            </svg>
          ),
        },
        // Statistiques administratives supplémentaires
        {
          title: "Universités",
          value: adminStats.totalUniversities.toLocaleString(),
          change: {
            value: "+2%",
            trend: "up" as const,
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor">
              <path d="M12 4.5v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4L2.757 6.258a.5.5 0 0 0-.227.423V18.5a.5.5 0 0 0 .5.5h14a.5.5 0 0 0 .5-.5V6.681a.5.5 0 0 0-.227-.423L12 4.5zM9 1v3.5l-5.5 2.2V18h13V6.7L11 4.5V1H9z" />
            </svg>
          ),
        },
        {
          title: "Départements",
          value: adminStats.totalDepartements.toLocaleString(),
          change: {
            value: "+5%",
            trend: "up" as const,
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor">
              <path d="M3 3h14v2H3V3zm0 4h14v2H3V7zm0 4h14v2H3v-2zm0 4h14v2H3v-2z" />
            </svg>
          ),
        },
        {
          title: "Programmes",
          value: adminStats.totalProgrammes.toLocaleString(),
          change: {
            value: "+1%",
            trend: "up" as const,
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor">
              <path d="M3 3h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v10h12V5H4zm2 2h8v2H6V7zm0 3h6v2H6v-2z" />
            </svg>
          ),
        },
        {
          title: "Professeurs",
          value: adminStats.totalProfesseurs.toLocaleString(),
          change: {
            value: "+7%",
            trend: "up" as const,
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          ),
        },
      ];
    }

    if (userRole === "TEACHER" && professorStats) {
      return [
        {
          title: "Mes Émargements",
          value: professorStats.totalEmargements.toLocaleString(),
          change: {
            value: "+5%",
            trend: "up" as const,
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor">
              <path d="M15 2H4.995C3.895 2 3 2.895 3 3.995V16.005C3 17.105 3.893 18 4.993 18H15c1.1 0 2-.895 2-1.995V3.995C17 2.895 16.105 2 15 2zm-3 10H8c-.552 0-1-.448-1-1s.448-1 1-1h4c.552 0 1 .448 1 1s-.448 1-1 1zm3-4H7c-.552 0-1-.448-1-1s.448-1 1-1h8c.552 0 1 .448 1 1s-.448 1-1 1z" />
            </svg>
          ),
        },
        {
          title: "Mon Taux de Présence",
          value: `${Math.round(professorStats.professeurPresenceRate)}%`,
          change: {
            value: "+3%",
            trend: "up" as const,
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={19} fill="currentColor">
              <path d="M9 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm-2 8c0-1.1.9-2 2-2h6a2 2 0 0 1 2 2v1H4v-1z" />
            </svg>
          ),
        },
        {
          title: "Mes Cours",
          value: professorStats.totalCourses.toLocaleString(),
          change: {
            value: "+2%",
            trend: "up" as const,
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor">
              <path d="M7 2v2h6V2h2v2h1.5A1.5 1.5 0 0 1 18 5.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 16.5v-11A1.5 1.5 0 0 1 3.5 4H5V2h2zm9 6H4v8.5c0 .28.22.5.5.5h11a.5.5 0 0 0 .5-.5V8zM6 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </svg>
          ),
        },
        {
          title: "Validations en Attente",
          value: professorStats.pendingEmargementValidations.toLocaleString(),
          change: {
            value: "-10%",
            trend: "down" as const,
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={21} height={21} fill="currentColor">
              <path d="M13 2a2 2 0 0 0-1.88 1.32l-.014-.02A2 2 0 0 0 9.99 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1.01a2 2 0 0 0-1.98-3zm0 2a.5.5 0 0 1 0 1h-4a.5.5 0 0 1 0-1h4zm-1 6.672-3.636 3.636-1.414-1.414L8.364 14.3l1.414 1.415 2.222-2.222L13.414 15l-1.414 1.414L8.364 12.78 7.657 12l.707-.707 3.636-3.636L13.414 9l-2.414 2.415z" />
            </svg>
          ),
        },
      ];
    }

    if ((userRole === "SUPERVISOR" || userRole === "DELEGATE") && businessStats) {
      return [
        {
          title: "Émargements",
          value: businessStats.totalEmargements.toLocaleString(),
          change: {
            value: "+8%",
            trend: "up" as const,
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor">
              <path d="M15 2H4.995C3.895 2 3 2.895 3 3.995V16.005C3 17.105 3.893 18 4.993 18H15c1.1 0 2-.895 2-1.995V3.995C17 2.895 16.105 2 15 2zm-3 10H8c-.552 0-1-.448-1-1s.448-1 1-1h4c.552 0 1 .448 1 1s-.448 1-1 1zm3-4H7c-.552 0-1-.448-1-1s.448-1 1-1h8c.552 0 1 .448 1 1s-.448 1-1 1z" />
            </svg>
          ),
        },
        {
          title: "Taux de Présence",
          value: `${Math.round(businessStats.professeurPresenceRate)}%`,
          change: {
            value: "+3%",
            trend: "up" as const,
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={19} fill="currentColor">
              <path d="M9 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm-2 8c0-1.1.9-2 2-2h6a2 2 0 0 1 2 2v1H4v-1z" />
            </svg>
          ),
        },
        {
          title: "Cours Programmés",
          value: businessStats.totalCourses.toLocaleString(),
          change: {
            value: "+12%",
            trend: "up" as const,
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor">
              <path d="M7 2v2h6V2h2v2h1.5A1.5 1.5 0 0 1 18 5.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 16.5v-11A1.5 1.5 0 0 1 3.5 4H5V2h2zm9 6H4v8.5c0 .28.22.5.5.5h11a.5.5 0 0 0 .5-.5V8zM6 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </svg>
          ),
        },
        {
          title: "Validations en Attente",
          value: businessStats.pendingEmargementValidations.toLocaleString(),
          change: {
            value: "-15%",
            trend: "down" as const,
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={21} height={21} fill="currentColor">
              <path d="M13 2a2 2 0 0 0-1.88 1.32l-.014-.02A2 2 0 0 0 9.99 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1.01a2 2 0 0 0-1.98-3zm0 2a.5.5 0 0 1 0 1h-4a.5.5 0 0 1 0-1h4zm-1 6.672-3.636 3.636-1.414-1.414L8.364 14.3l1.414 1.415 2.222-2.222L13.414 15l-1.414 1.414L8.364 12.78 7.657 12l.707-.707 3.636-3.636L13.414 9l-2.414 2.415z" />
            </svg>
          ),
        },
      ];
    }

    // Données par défaut si aucun rôle ne correspond
    return [
      {
        title: "Aucune donnée",
        value: "0",
        change: {
          value: "0%",
          trend: "up" as const,
        },
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor">
            <path d="M10 2a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm0 14a6 6 0 1 1 6-6 6 6 0 0 1-6 6zm-1-9h2v6H9V7zm0-2h2v2H9V5z" />
          </svg>
        ),
      },
    ];
  }, [userRole, businessStats, adminStats, professorStats, isBusinessLoading, isAdminLoading, isProfessorLoading]);

  // Affichage en grille adaptée selon le nombre de stats
  const gridCols =
    userRole === "ADMIN" && stats.length > 4
      ? "grid-cols-2 min-[768px]:grid-cols-3 min-[1200px]:grid-cols-4"
      : "grid-cols-2 min-[1200px]:grid-cols-4";

  return (
    <div className={`grid ${gridCols} border border-border rounded-xl bg-gradient-to-br from-sidebar/60 to-sidebar`}>
      {stats.map((stat) => (
        <StatsCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}

function StatsCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string;
  change: { value: string; trend: "up" | "down" };
  icon: React.ReactNode;
}) {
  const isPositive = change.trend === "up";
  const trendColor = isPositive ? "text-emerald-500" : "text-red-500";

  return (
    <div className="relative p-4 lg:p-5 group before:absolute before:inset-y-8 before:right-0 before:w-px before:bg-gradient-to-b before:from-input/30 before:via-input before:to-input/30 last:before:hidden">
      <div className="relative flex items-center gap-4">
        {/* Icon */}
        <div className="max-[480px]:hidden size-10 shrink-0 rounded-full bg-emerald-600/25 border border-emerald-600/50 flex items-center justify-center text-emerald-500">
          {icon}
        </div>
        {/* Content */}
        <div>
          <div className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">{title}</div>
          <div className="text-2xl font-semibold mb-2">{value}</div>
          <div className="text-xs text-muted-foreground/60">
            <span className={`font-medium ${trendColor}`}>
              {isPositive ? "↗" : "↘"} {change.value}
            </span>{" "}
            vs semaine dernière
          </div>
        </div>
      </div>
    </div>
  );
}
