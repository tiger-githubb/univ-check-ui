"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Emargement } from "@/types/attendance.types";
import { RiFileChartLine, RiFileDownloadLine } from "@remixicon/react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { ExportToPdfButton } from "./export-to-pdf-button";

interface ProfessorReportProps {
  emargements: Emargement[];
  isLoading: boolean;
}

interface ProfessorStats {
  id: string;
  name: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  pendingCount: number;
  presenceRate: number;
}

export function ProfessorAttendanceReport({ emargements, isLoading }: ProfessorReportProps) {
  const [reportDate] = useState<Date>(new Date());

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

  // Fonction pour calculer les statistiques par professeur
  const calculateProfessorStats = (): ProfessorStats[] => {
    const professorMap = new Map<string, ProfessorStats>();

    // Parcourir tous les émargements
    emargements.forEach((emargement) => {
      const profId = emargement.professor?.id;
      const profName = emargement.professor?.name || "Professeur inconnu";

      if (!profId) return;

      // Soit récupérer les stats existantes, soit créer un nouvel objet
      const existingStats = professorMap.get(profId) || {
        id: profId,
        name: profName,
        totalSessions: 0,
        presentCount: 0,
        absentCount: 0,
        pendingCount: 0,
        presenceRate: 0,
      };

      // Incrémenter les compteurs
      existingStats.totalSessions++;

      if (
        emargement.status === "PRESENT" ||
        emargement.status === "SUPERVISOR_CONFIRMED" ||
        emargement.status === "CLASS_HEADER_CONFIRMED"
      ) {
        existingStats.presentCount++;
      } else if (emargement.status === "ABSENT") {
        existingStats.absentCount++;
      } else {
        existingStats.pendingCount++;
      }

      // Recalculer le taux de présence
      existingStats.presenceRate = Math.round((existingStats.presentCount / existingStats.totalSessions) * 100);

      // Mettre à jour la map
      professorMap.set(profId, existingStats);
    });

    // Convertir la map en tableau et trier par taux de présence décroissant
    return Array.from(professorMap.values()).sort((a, b) => b.presenceRate - a.presenceRate);
  };

  const professorStats = calculateProfessorStats();

  // Fonction pour exporter les données en CSV
  const exportToCSV = () => {
    // En-têtes CSV
    const headers = ["Nom du professeur", "Total sessions", "Présences", "Absences", "En attente", "Taux de présence (%)"];

    // Préparer les données
    const rows = professorStats.map((prof) => [
      prof.name,
      prof.totalSessions.toString(),
      prof.presentCount.toString(),
      prof.absentCount.toString(),
      prof.pendingCount.toString(),
      `${prof.presenceRate}%`,
    ]);

    // Construire le contenu CSV
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

    // Créer un blob et un lien de téléchargement
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rapport-presences-professeurs-${format(reportDate, "yyyy-MM-dd")}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      {" "}
      <CardHeader className="flex-row justify-between items-center">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <RiFileChartLine className="text-primary" />
            Rapport de présence par professeur
          </CardTitle>
          <CardDescription>Généré le {format(reportDate, "d MMMM yyyy", { locale: fr })}</CardDescription>
        </div>
        <div className="flex gap-2">
          <ExportToPdfButton emargements={emargements} fileName="rapport-professeurs" title="Rapport de présence par professeur" />
          <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
            <RiFileDownloadLine size={16} />
            Exporter CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {professorStats.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">Aucune donnée disponible pour générer un rapport.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Professeur</TableHead>
                <TableHead className="text-center">Sessions totales</TableHead>
                <TableHead className="text-center">Présences</TableHead>
                <TableHead className="text-center">Absences</TableHead>
                <TableHead className="text-center">En attente</TableHead>
                <TableHead className="text-right">Taux de présence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professorStats.map((prof) => (
                <TableRow key={prof.id}>
                  <TableCell className="font-medium">{prof.name}</TableCell>
                  <TableCell className="text-center">{prof.totalSessions}</TableCell>
                  <TableCell className="text-center text-green-600">{prof.presentCount}</TableCell>
                  <TableCell className="text-center text-red-600">{prof.absentCount}</TableCell>
                  <TableCell className="text-center text-amber-600">{prof.pendingCount}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        prof.presenceRate >= 90
                          ? "bg-green-100 text-green-800"
                          : prof.presenceRate >= 75
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {prof.presenceRate}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
