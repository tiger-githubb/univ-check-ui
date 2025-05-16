"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Emargement } from "@/types/attendance.types";
import { RiCheckLine, RiCloseLine, RiTimeLine } from "@remixicon/react";

interface AttendanceStatsProps {
  emargements: Emargement[];
  isLoading: boolean;
}

export function AttendanceStats({ emargements, isLoading }: AttendanceStatsProps) {
  // Si en cours de chargement, afficher un état de chargement
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="h-6 bg-muted rounded-md w-3/4"></CardTitle>
              <CardDescription className="h-4 bg-muted rounded-md w-1/4 mt-2"></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded-md w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calcul des statistiques
  const totalEmargements = emargements.length;
  const presentCount = emargements.filter(
    (e) => e.status === "PRESENT" || e.status === "SUPERVISOR_CONFIRMED" || e.status === "CLASS_HEADER_CONFIRMED"
  ).length;
  const absentCount = emargements.filter((e) => e.status === "ABSENT").length;
  const pendingCount = emargements.filter((e) => e.status === "PENDING").length;

  // Calcul des pourcentages
  const presentPercentage = totalEmargements > 0 ? Math.round((presentCount / totalEmargements) * 100) : 0;
  const absentPercentage = totalEmargements > 0 ? Math.round((absentCount / totalEmargements) * 100) : 0;
  const pendingPercentage = totalEmargements > 0 ? Math.round((pendingCount / totalEmargements) * 100) : 0;

  // Récupérer les professeurs uniques
  const uniqueProfessors = new Set(emargements.map((e) => e.professor?.id)).size;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <RiCheckLine className="text-primary" />
            Professeurs
          </CardTitle>
          <CardDescription>Total des professeurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueProfessors}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <RiCheckLine className="text-green-500" />
            Présents
          </CardTitle>
          <CardDescription>Taux de présence</CardDescription>
        </CardHeader>
        <CardContent>
          {" "}
          <div className="text-2xl font-bold">
            {presentCount} <span className="text-sm text-muted-foreground">/ {totalEmargements}</span>
          </div>
          <Progress className="mt-2 [&>div]:bg-green-500" value={presentPercentage} />
          <div className="text-xs text-muted-foreground mt-1">{presentPercentage}% des cours</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <RiCloseLine className="text-red-500" />
            Absents
          </CardTitle>
          <CardDescription>Taux d&apos;absence</CardDescription>
        </CardHeader>
        <CardContent>
          {" "}
          <div className="text-2xl font-bold">
            {absentCount} <span className="text-sm text-muted-foreground">/ {totalEmargements}</span>
          </div>
          <Progress className="mt-2 [&>div]:bg-red-500" value={absentPercentage} />
          <div className="text-xs text-muted-foreground mt-1">{absentPercentage}% des cours</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <RiTimeLine className="text-amber-500" />
            En attente
          </CardTitle>
          <CardDescription>Non confirmés</CardDescription>
        </CardHeader>
        <CardContent>
          {" "}
          <div className="text-2xl font-bold">
            {pendingCount} <span className="text-sm text-muted-foreground">/ {totalEmargements}</span>
          </div>
          <Progress className="mt-2 [&>div]:bg-amber-500" value={pendingPercentage} />
          <div className="text-xs text-muted-foreground mt-1">{pendingPercentage}% des cours</div>
        </CardContent>
      </Card>
    </div>
  );
}
