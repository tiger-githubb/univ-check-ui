"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Emargement } from "@/types/attendance.types";
import { RiLineChartLine } from "@remixicon/react";
import { eachDayOfInterval, endOfMonth, format, isSameDay, parseISO, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo, useState } from "react";

// Import the chart component
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface AttendanceAnalyticsProps {
  emargements: Emargement[];
  isLoading: boolean;
}

export function AttendanceAnalytics({ emargements, isLoading }: AttendanceAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  // Calculer les données pour le graphique de tendance
  const chartData = useMemo(() => {
    if (emargements.length === 0) return [];

    // Utiliser la date actuelle pour l'analyse
    const currentDate = new Date();
    let startDate, endDate;

    // Définir la plage de dates en fonction de l'option sélectionnée
    if (timeRange === "week") {
      // Pour la dernière semaine (7 jours)
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 6);
      endDate = currentDate;
    } else if (timeRange === "month") {
      // Pour le mois en cours
      startDate = startOfMonth(currentDate);
      endDate = endOfMonth(currentDate);
    } else {
      // Pour l'année (12 derniers mois)
      startDate = new Date(currentDate);
      startDate.setMonth(currentDate.getMonth() - 11);
      startDate.setDate(1);
      endDate = endOfMonth(currentDate);
    }

    // Créer un tableau avec toutes les dates de l'intervalle
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    // Format d'affichage de la date (différent selon la plage de temps)
    const dateFormat = timeRange === "year" ? "MMM yyyy" : "dd MMM";

    // Initialiser les données pour chaque jour
    return dateRange.map((date) => {
      // Filtrer les émargements pour cette date
      const dayEmargements = emargements.filter((e) => {
        if (!e.classSession?.date) return false;
        const emargementDate = parseISO(e.classSession.date);

        // Pour l'option "year", regrouper par mois
        if (timeRange === "year") {
          return emargementDate.getMonth() === date.getMonth() && emargementDate.getFullYear() === date.getFullYear();
        }

        // Autrement, comparer exactement les jours
        return isSameDay(emargementDate, date);
      });

      // Calculer les statistiques pour ce jour
      const totalEmargements = dayEmargements.length;
      const presentCount = dayEmargements.filter(
        (e) => e.status === "PRESENT" || e.status === "SUPERVISOR_CONFIRMED" || e.status === "CLASS_HEADER_CONFIRMED"
      ).length;
      const absentCount = dayEmargements.filter((e) => e.status === "ABSENT").length;
      const pendingCount = dayEmargements.filter((e) => e.status === "PENDING").length;

      return {
        date: format(date, dateFormat, { locale: fr }),
        total: totalEmargements,
        présences: presentCount,
        absences: absentCount,
        enAttente: pendingCount,
        tauxPrésence: totalEmargements > 0 ? Math.round((presentCount / totalEmargements) * 100) : 0,
      };
    });
  }, [emargements, timeRange]);

  // Si en cours de chargement, afficher un état de chargement
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="h-6 bg-muted rounded-md w-3/4"></CardTitle>
          <CardDescription className="h-4 bg-muted rounded-md w-1/4 mt-2"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-md w-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <RiLineChartLine className="text-primary" />
            Tendances de présence
          </CardTitle>
          <CardDescription>Évolution du taux de présence sur la période</CardDescription>
        </div>
        <div className="flex items-center gap-2 bg-muted/40 rounded-md p-1">
          <button
            className={`px-3 py-1 rounded-md text-xs ${timeRange === "week" ? "bg-primary text-white" : ""}`}
            onClick={() => setTimeRange("week")}
          >
            Semaine
          </button>
          <button
            className={`px-3 py-1 rounded-md text-xs ${timeRange === "month" ? "bg-primary text-white" : ""}`}
            onClick={() => setTimeRange("month")}
          >
            Mois
          </button>
          <button
            className={`px-3 py-1 rounded-md text-xs ${timeRange === "year" ? "bg-primary text-white" : ""}`}
            onClick={() => setTimeRange("year")}
          >
            Année
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">Aucune donnée disponible pour générer un graphique.</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="présences" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
              <Line yAxisId="left" type="monotone" dataKey="absences" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
              <Line yAxisId="left" type="monotone" dataKey="enAttente" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
              <Line yAxisId="right" type="monotone" dataKey="tauxPrésence" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
