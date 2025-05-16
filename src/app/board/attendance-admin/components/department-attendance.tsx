"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Emargement } from "@/types/attendance.types";
import { RiBarChartGroupedLine } from "@remixicon/react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DepartmentAttendanceProps {
  emargements: Emargement[];
  isLoading: boolean;
}

interface DepartmentStat {
  name: string;
  total: number;
  presents: number;
  absents: number;
  pending: number;
  presenceRate?: number;
}

export function DepartmentAttendance({ emargements, isLoading }: DepartmentAttendanceProps) {
  // Si en cours de chargement, afficher un état de chargement
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="h-6 bg-muted rounded-md w-3/4"></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-md w-full"></div>
        </CardContent>
      </Card>
    );
  } // Grouper les émargements par départements
  const departmentStats = emargements.reduce((acc: Record<string, DepartmentStat>, emargement: Emargement) => {
    // Récupérer le département (on suppose qu'il est disponible via la structure du cours)
    const departmentName = "Non catégorisé";

    // Initialiser si le département n'existe pas encore
    if (!acc[departmentName]) {
      acc[departmentName] = {
        name: departmentName,
        total: 0,
        presents: 0,
        absents: 0,
        pending: 0,
      };
    }

    // Incrémenter les compteurs
    acc[departmentName].total += 1;

    if (
      emargement.status === "PRESENT" ||
      emargement.status === "SUPERVISOR_CONFIRMED" ||
      emargement.status === "CLASS_HEADER_CONFIRMED"
    ) {
      acc[departmentName].presents += 1;
    } else if (emargement.status === "ABSENT") {
      acc[departmentName].absents += 1;
    } else {
      acc[departmentName].pending += 1;
    }

    // Calculer le taux de présence
    acc[departmentName].presenceRate = Math.round((acc[departmentName].presents / acc[departmentName].total) * 100);

    return acc;
  }, {});

  // Convertir l'objet en tableau pour le graphique
  const chartData = Object.values(departmentStats);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <RiBarChartGroupedLine className="text-primary" />
          Présence par département
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">Aucune donnée disponible pour générer un graphique.</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="presents" name="Présences" fill="#10b981" />
              <Bar yAxisId="left" dataKey="absents" name="Absences" fill="#ef4444" />
              <Bar yAxisId="left" dataKey="pending" name="En attente" fill="#f59e0b" />
              <Bar yAxisId="right" dataKey="presenceRate" name="Taux (%)" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
