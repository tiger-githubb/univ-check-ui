"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpcomingCoursesQuery } from "@/hooks/queries/use-attendance.query";
import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { useDepartmentsWithStatsQuery, useRecentEmargementsQuery, type RecentEmargement } from "@/hooks/queries/use-statistics.query";
import {
  RiArrowRightLine,
  RiCalendarLine,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiFileChartLine,
  RiInformationLine,
  RiTimeLine,
  RiTimerLine,
} from "@remixicon/react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { PiSpinnerGap } from "react-icons/pi";

// Type pour les données d'émargement transformées
interface AttendanceData {
  id: string;
  professor: {
    name: string;
    avatar?: string;
    initials: string;
  };
  courseTitle: string;
  status: "PRESENT" | "ABSENT" | "PENDING";
  date: string;
  time: string;
  department: string;
}

// Transformer les données d'émargement pour l'affichage
function transformEmargementData(emargement: RecentEmargement): AttendanceData {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, "d MMMM yyyy", { locale: fr });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (debut?: string, fin?: string) => {
    if (!debut || !fin) {
      return "Horaire non défini";
    }
    try {
      const debutTime = new Date(`2000-01-01T${debut}`);
      const finTime = new Date(`2000-01-01T${fin}`);
      const debutFormatted = format(debutTime, "HH:mm");
      const finFormatted = format(finTime, "HH:mm");
      return `${debutFormatted} - ${finFormatted}`;
    } catch {
      return `${debut} - ${fin}`;
    }
  };

  // Mapper les statuts API vers les statuts d'affichage
  const mapStatus = (status: string): "PRESENT" | "ABSENT" | "PENDING" => {
    if (status === "PRESENT") return "PRESENT";
    if (status === "ABSENT") return "ABSENT";
    return "PENDING";
  };

  return {
    id: emargement.id,
    professor: {
      name: emargement.professor?.name || "Professeur non défini",
      initials: getInitials(emargement.professor?.name || "ND"),
    },
    courseTitle: emargement.classSession?.course?.title || "Cours non défini",
    status: mapStatus(emargement.status),
    date: formatDate(emargement.classSession?.date || new Date().toISOString()),
    time: formatTime(emargement.classSession?.heureDebut, emargement.classSession?.heureFin),
    department: "Non spécifié", // Simplifié car programme n'existe pas sur Course
  };
}

// Composant pour afficher le badge de statut
function StatusBadge({ status }: { status: AttendanceData["status"] }) {
  if (status === "PRESENT") {
    return (
      <Badge className="bg-emerald-500 text-white flex items-center gap-1">
        <RiCheckboxCircleFill size={14} />
        Présent
      </Badge>
    );
  } else if (status === "ABSENT") {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <RiCloseCircleFill size={14} />
        Absent
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-700 flex items-center gap-1 border-amber-200">
        <RiTimeLine size={14} />
        En attente
      </Badge>
    );
  }
}

export function RecentAttendances() {
  const { data: user } = useCurrentUser();
  const { data: recentEmargements, isLoading: isEmargementsLoading } = useRecentEmargementsQuery(5);
  const { data: departments, isLoading: isDepartmentsLoading } = useDepartmentsWithStatsQuery();
  const { data: upcomingCourses, isLoading: isCoursesLoading } = useUpcomingCoursesQuery(
    user?.user?.id || "",
    user?.user?.role || "",
    3
  );

  // Transformer les émargements pour l'affichage
  const displayEmargements = recentEmargements?.map(transformEmargementData) || [];

  // Préparer les cours à venir avec le nouveau hook
  const upcomingCoursesDisplay =
    upcomingCourses?.map((course) => ({
      id: course.id,
      title: course.title,
      professor: course.professor,
      time: `Aujourd'hui, ${course.startTime} - ${course.endTime}`,
      room: course.location || "Salle TBD",
    })) || [];

  // Statistiques des départements
  const departmentStats =
    departments?.map((dept) => ({
      name: dept.name,
      attendanceRate: Math.floor(Math.random() * 20) + 80, // 80-100% - données de démo
      coursesCount: Math.floor(Math.random() * 30) + 10, // 10-40 cours - données de démo
    })) || [];

  return (
    <Tabs defaultValue="recent" className="w-full">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="recent" className="flex items-center gap-1">
            <RiTimerLine size={16} />
            Émargements récents
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-1">
            <RiFileChartLine size={16} />
            Départements
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-1">
            <RiCalendarLine size={16} />
            Prochains cours
          </TabsTrigger>
        </TabsList>
        <Link href="/board/attendance-admin">
          <Button variant="ghost" size="sm" className="gap-1">
            Voir tout <RiArrowRightLine size={16} />
          </Button>
        </Link>
      </div>

      <TabsContent value="recent" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiTimerLine className="text-primary" />
              Émargements récents
            </CardTitle>
            <CardDescription>Derniers émargements enregistrés dans le système</CardDescription>
          </CardHeader>
          <CardContent>
            {isEmargementsLoading ? (
              <div className="flex items-center justify-center h-32">
                <PiSpinnerGap className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : displayEmargements.length > 0 ? (
              <div className="space-y-4">
                {displayEmargements.map((attendance) => (
                  <div key={attendance.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={attendance.professor.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {attendance.professor.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{attendance.professor.name}</p>
                        <p className="text-sm text-muted-foreground">{attendance.department}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{attendance.courseTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {attendance.date} • {attendance.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={attendance.status} />
                      <Link href={`/board/attendance-admin/${attendance.id}`}>
                        <Button variant="outline" size="sm">
                          Détails
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <RiInformationLine className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-muted-foreground">Aucun émargement récent</h3>
                <p className="mt-1 text-sm text-muted-foreground">Les émargements récents apparaîtront ici.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="departments" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiFileChartLine className="text-primary" />
              Statistiques par département
            </CardTitle>
            <CardDescription>Aperçu des taux de présence par département</CardDescription>
          </CardHeader>
          <CardContent>
            {isDepartmentsLoading ? (
              <div className="flex items-center justify-center h-32">
                <PiSpinnerGap className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : departmentStats.length > 0 ? (
              <div className="space-y-4">
                {departmentStats.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{dept.name}</h4>
                      <p className="text-sm text-muted-foreground">{dept.coursesCount} cours</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">{dept.attendanceRate}%</p>
                      <p className="text-sm text-muted-foreground">Taux de présence</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <RiInformationLine className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-muted-foreground">Aucune statistique disponible</h3>
                <p className="mt-1 text-sm text-muted-foreground">Les statistiques par département apparaîtront ici.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="upcoming" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiCalendarLine className="text-primary" />
              Prochains cours
            </CardTitle>
            <CardDescription>Cours programmés pour aujourd&apos;hui</CardDescription>
          </CardHeader>
          <CardContent>
            {isCoursesLoading ? (
              <div className="flex items-center justify-center h-32">
                <PiSpinnerGap className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : upcomingCoursesDisplay.length > 0 ? (
              <div className="space-y-4">
                {upcomingCoursesDisplay.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-sm text-muted-foreground">{course.professor}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{course.time}</p>
                      <p className="text-sm text-muted-foreground">{course.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <RiInformationLine className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-muted-foreground">Aucun cours aujourd&apos;hui</h3>
                <p className="mt-1 text-sm text-muted-foreground">Les cours d&apos;aujourd&apos;hui apparaîtront ici.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
